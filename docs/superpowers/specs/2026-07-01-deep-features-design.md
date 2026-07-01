# 2026-07-01 — 深度功能扩展设计

## 目标

在已有「体态哨兵」基础上，把产品从"会响的不良姿态检测器"升级为"个人坐姿与久坐健康守护系统"。本轮聚焦 3 个新能力：

1. 定时休息提醒（番茄钟）+ 拉伸引导
2. 真校准（个人姿态基线采样）
3. 数据导入/导出 + 成就徽章

设计原则：所有功能保持纯本地、零后端、零账号；所有改动保持现有视觉与交互语言（绿色主色 / 圆角 / 柔阴影）；新增设置项必须可在设置页一键关闭以保持可选性。

---

## 1. 定时休息提醒 + 拉伸引导

### 触发逻辑

- 新增设置：`休息提醒间隔`（默认 30 分钟，可关闭 / 15 / 30 / 45 / 60 分钟）、`休息时长`（默认 2 分钟可调 1-5 分钟）
- 计时起点：检测开始时。期间如果用户暂停检测，计时器也暂停；继续时累计。
- 触发时：先弹一条温和的非阻断通知（顶部 toast + 声音，如果开了声音），让用户知道休息时间到了；用户可点"立即开始" / "延后 5 分钟" / "忽略本次"。
- 休息倒计时期间：检测页右上角显示一个"休息中"圆形倒计时环，进度可视化。
- 倒计时归零：自动结束休息并恢复检测。

### 拉伸引导

- 休息开始时同时展示拉伸引导面板（可关闭），内容：
  - 4 个推荐拉伸动作（颈部侧拉伸 / 肩部环绕 / 坐姿前屈 / 站立体侧屈），每个含 SVG 动画 + 步骤说明 + 推荐时长（30 秒/个）
  - 用户可勾选"我做了"，勾选进入下一个动作；不勾选也不影响倒计时
  - "跳过" 按钮可关闭引导只留倒计时
- 拉伸引导是 React 组件，纯 SVG 动画（CSS transform / keyframe），不依赖外部资源。

### 范围控制

- 设置页新增"休息提醒"卡片：开关、间隔滑块、休息时长滑块、引导内容开关
- 仅在检测进行中才计时；未开始检测不计时
- 暂停检测时暂停休息倒计时

---

## 2. 真校准（基线采样）

### 现状

- 现有 `CalibrationWizard` 是纯图文引导，没有真实采样
- 阈值使用 `useSettings` 里的固定值，不区分个人体型

### 设计

- `CalibrationWizard` 改造为 3 步：第 1 步"调摄像头"（同现状）→ 第 2 步"采集基线"（新增）→ 第 3 步"完成"
- 第 2 步流程：
  1. 启动摄像头
  2. 用 MediaPipe 实时检测关键点
  3. UI 引导用户坐直保持 4 秒
  4. 倒计时进度环 + 实时姿态质量反馈（"坐直" / "请再直一点" / "头部偏左"）
  5. 4 秒后采样成功，记录 4 个关键点角度：头倾、肩倾、颈前伸、脊倾
  6. 失败（4 秒内未通过质量检查）→ 提示"再来一次"，重试最多 3 次
- 采样结果存到 `localStorage` 的新 key `posture-sentinel:baseline`：`{ headTilt, shoulderTilt, neckForward, spineTilt, capturedAt, samples }`
- 启用基线后，`usePostureMetrics` / `usePostureAnalyzer` 的阈值改为"个人基线 + 容差"：
  - 容差设定：warning = 基线 + 中等偏移；bad = 基线 + 大偏移
  - 容差值在设置页"高级设置"暴露（默认 headTilt ±10°/±20°；shoulder ±8°/±15°；spine ±6°/±12°；neckForward ±5/±10 cm）
- 设置页新增"基线管理"：显示当前基线时间、"重新校准"按钮、"清除基线恢复默认值"按钮
- 未采集基线时：行为完全等同现状（用默认阈值），保持向后兼容

### 范围控制

- 校准只在检测页启动前的引导弹窗中出现（首次）
- 用户可从设置页随时重新校准或清除基线
- 基线数据全部本地保存

---

## 3. 数据导入/导出 + 成就徽章

### 3.1 数据导入/导出

- 设置页"数据管理"卡片新增三个按钮：
  - **导出数据**：把所有 session + settings + baseline 序列化为 JSON，触发浏览器下载 `posture-sentinel-backup-YYYY-MM-DD.json`
  - **导入数据**：选择本地 JSON 文件，校验格式后覆盖当前数据；导入前显示"将覆盖现有数据"确认弹窗
  - **导入合并（可选）**：导入对话框提供"覆盖"和"合并去重（按 session.id）"两选项
- 导入完成显示 toast："已导入 N 条记录"

### 3.2 成就徽章

- 新增 `src/lib/achievements.ts`，定义成就定义列表：

| ID | 名称 | 解锁条件 | 图标 |
| --- | --- | --- | --- |
| first_session | 初次启程 | 完成 1 次检测 | 🚀 |
| streak_3 | 三日连击 | 连续 3 天达标 | 🔥 |
| streak_7 | 周而复始 | 连续 7 天达标 | ⭐ |
| streak_30 | 月度冠军 | 连续 30 天达标 | 🏆 |
| total_hours_10 | 累计 10 小时 | 累计检测 10 小时 | ⏱️ |
| total_hours_50 | 资深守护 | 累计检测 50 小时 | 🛡️ |
| perfect_day | 完美一天 | 某天评分 ≥ 90 | ✨ |
| early_bird | 早起的鸟儿 | 早于 9 点开始检测 | 🌅 |

- 成就解锁逻辑在 `useEffect` 中跑（每次 sessions / baseline 变化时），满足条件调用 `unlockAchievement(id)` 写 localStorage
- 成就解锁时弹一条全屏居中 toast（"🎉 解锁成就：三日连击"）3 秒后自动消失
- 设置页新增"成就"卡片：网格展示已解锁和未解锁（灰度 + 锁图标），点击已解锁显示解锁时间
- 首页 `HeroSection` 进度条旁边可加一个"X / N 成就"小标签

### 范围控制

- 成就定义列表硬编码，扩展容易
- 所有成就都是"已达成即永久解锁"，无回退
- 解锁 toast 不打断当前检测/操作

---

## 数据模型

### 新增 localStorage keys

- `posture-sentinel:baseline` — 个人基线采样
- `posture-sentinel:rest-settings` — 休息提醒配置
- `posture-sentinel:achievements` — 已解锁成就 ID 列表 + 时间戳

### 不破坏现有数据

- 所有新增 key 都有默认值，缺失时回退到默认行为
- 旧版用户升级后无需任何操作，所有功能"opt-in"

---

## UI / 视觉一致性

- 所有新增 toast / 弹窗 / 卡片复用现有 `bg-surface` / `card-hover` / `bg-primary-light` 风格
- 拉伸动画用现有 `@keyframes` 增加一组 `stretch-xxx` 关键帧
- 成就徽章网格使用与 `MonthlyHeatmap` 类似的 7 列响应式布局
- 颜色语义保持：success → primary, warn → warning, danger → danger

---

## 文件变更概览

### 新建文件
- `src/hooks/useRestReminder.ts` — 休息提醒逻辑
- `src/hooks/useBaseline.ts` — 基线管理
- `src/hooks/useAchievements.ts` — 成就解锁 + 列表
- `src/lib/achievements.ts` — 成就定义
- `src/components/detect/RestReminderBanner.tsx` — 休息倒计时 + 拉伸引导面板
- `src/components/detect/StretchGuide.tsx` — 4 个拉伸动作的 SVG 动画
- `src/components/detect/AchievementToast.tsx` — 解锁 toast
- `src/components/settings/AchievementsCard.tsx` — 成就网格
- `src/components/settings/BaselineCard.tsx` — 基线管理
- `src/components/settings/DataManagementCard.tsx` — 导入/导出
- `src/components/settings/RestSettingsCard.tsx` — 休息设置
- `src/app/api/export/route.ts` — 不需要，纯客户端导出

### 修改文件
- `src/lib/storage.ts` — 增 baseline / achievements / rest-settings CRUD
- `src/hooks/useSettings.ts` — 增 baseline / restSettings 字段
- `src/hooks/usePostureMetrics.ts` — 支持基线 + 容差阈值
- `src/hooks/usePostureAnalyzer.ts` — badPosture 判定结合基线
- `src/components/detect/CalibrationWizard.tsx` — 增加基线采样步骤
- `src/components/detect/DetectControls.tsx` — 休息倒计时显示入口
- `src/app/detect/page.tsx` — 整合 useRestReminder / useBaseline / useAchievements
- `src/app/settings/page.tsx` — 新增各卡片
- `src/components/HeroSection.tsx` — 显示 "X / N 成就" 标签
- `src/app/globals.css` — 新增 stretch 关键帧

### 不变更
- 首页、报告页主体布局
- 模型加载 / MediaPipe 流程
- 路由结构

---

## 验收标准

### 1. 休息提醒
- [ ] 设置页有"休息提醒"卡片，可开关
- [ ] 默认 30 分钟间隔，可调 15/30/45/60
- [ ] 触发时显示 toast + 倒计时
- [ ] 倒计时期间检测照常进行
- [ ] 拉伸引导面板可关闭

### 2. 真校准
- [ ] CalibrationWizard 第二步能实时显示姿态质量
- [ ] 4 秒采样成功，localStorage 写入 baseline
- [ ] 启用基线后阈值基于基线 + 容差
- [ ] 设置页有"重新校准" / "清除基线"按钮
- [ ] 未校准时行为等同现状

### 3. 数据导入/导出 + 成就
- [ ] 设置页有"数据管理"卡片，3 个按钮
- [ ] 导出 JSON 文件可下载，文件名带日期
- [ ] 导入 JSON 校验后覆盖或合并
- [ ] 成就定义列表显示在设置页
- [ ] 首次满足条件解锁时弹 toast
- [ ] HeroSection 显示"X / N 成就"标签

### 4. 通用
- [ ] `npm run build` 通过
- [ ] 所有现有功能无 regression
- [ ] localStorage 缺失时使用默认值
- [ ] prefers-reduced-motion 兼容（拉伸动画放慢或停）

---

## 风险与权衡

- **基线采样准确性**：依赖用户坐直程度。提供质量提示 + 重试机制。
- **休息提醒 + 检测同时进行**：倒计时期间检测正常运行（不是暂停检测），避免用户误解"暂停"行为。
- **导入数据格式变化**：导出/导入用版本号字段，导入时校验版本号，旧版本兼容或提示。
- **成就解锁时机**：在检测结束 / 切换页面时批量计算，避免每帧重算。

---

## 不在本轮范围

- 跨设备同步（需要后端）
- 多用户 profile
- 深色模式
- 国际化 i18n
- 番茄钟自定义任务名
