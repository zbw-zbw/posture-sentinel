"use client";

/* ── Small skeleton SVG used in Feature 1 preview ── */
function SmallSkeletonSVG() {
  return (
    <svg
      viewBox="0 0 200 280"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="#10b981" strokeWidth="1.8" fill="none">
        <line x1="100" y1="14" x2="78" y2="32" />
        <line x1="100" y1="14" x2="122" y2="32" />
        <line x1="78" y1="32" x2="68" y2="65" />
        <line x1="122" y1="32" x2="132" y2="65" />
        <line x1="68" y1="65" x2="132" y2="65" />
        <line x1="68" y1="65" x2="100" y2="125" />
        <line x1="132" y1="65" x2="100" y2="125" />
        <line x1="100" y1="125" x2="100" y2="200" />
      </g>
      <line
        x1="100"
        y1="65"
        x2="100"
        y2="200"
        stroke="#10b981"
        strokeWidth="1.2"
        strokeDasharray="4 3"
        opacity="0.5"
      />
      {[
        [100, 14],
        [78, 32],
        [122, 32],
        [68, 65],
        [132, 65],
        [100, 125],
        [100, 200],
      ].map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r="4.5"
          fill="#10b981"
          stroke="#fff"
          strokeWidth="1.5"
        />
      ))}
      <circle
        cx="100"
        cy="22"
        r="14"
        fill="none"
        stroke="#10b981"
        strokeWidth="1.5"
        opacity="0.4"
      />
    </svg>
  );
}

/* ── Mini line chart SVG used in Feature 3 ── */
function MiniLineChart() {
  // 5 points computed from values 72,68,75,80,87
  // mapped to viewBox 0 0 200 65, y inverted: y = 60 - ((v-68)/19 * 50)
  const points = "0,49.5 50,60 100,41.6 150,28.4 200,10";
  return (
    <svg
      viewBox="0 0 200 65"
      className="w-full h-16"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Grid lines */}
      <line x1="0" y1="10" x2="200" y2="10" stroke="#e2e8f0" strokeWidth="0.5" />
      <line x1="0" y1="30" x2="200" y2="30" stroke="#e2e8f0" strokeWidth="0.5" />
      <line x1="0" y1="50" x2="200" y2="50" stroke="#e2e8f0" strokeWidth="0.5" />

      {/* Area fill */}
      <polyline
        points={`0,65 ${points} 200,65`}
        fill="url(#areaGrad)"
        opacity="0.15"
      />

      {/* Trend line */}
      <polyline
        points={points}
        fill="none"
        stroke="#10b981"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dots */}
      {[
        [0, 49.5],
        [50, 60],
        [100, 41.6],
        [150, 28.4],
        [200, 10],
      ].map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r="3"
          fill="#10b981"
          stroke="#fff"
          strokeWidth="1.5"
        />
      ))}

      {/* Value labels */}
      {[
        [0, 58, "72"],
        [50, 69, "68"],
        [100, 50, "75"],
        [150, 37, "80"],
        [200, 19, "87"],
      ].map(([x, y, label], i) => (
        <text
          key={i}
          x={x}
          y={y}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="8"
        >
          {label}
        </text>
      ))}

      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ── Main Component ── */
export default function FeaturesSection() {
  return (
    <div className="max-w-[1100px] mx-auto px-6 py-24 fade-in">
      {/* Section Title */}
      <h2 className="text-3xl md:text-4xl font-bold text-center text-text-primary">
        三重守护，让坐姿不再失控
      </h2>
      <p className="text-text-secondary text-center mt-3">
        从实时检测到温和提醒，再到每日报告，全方位守护你的脊椎健康
      </p>

      <div className="flex flex-col gap-10 mt-16">
        {/* ================================================================ */}
        {/* Feature 1: 实时 AI 检测 (standard layout)                       */}
        {/* ================================================================ */}
        <div className="bg-surface rounded-2xl border border-border card-hover overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left: Text */}
            <div className="p-8 md:p-12">
              <span className="inline-block bg-primary-light text-primary-dark text-xs font-medium px-3 py-1 rounded-full">
                核心功能
              </span>
              <h3 className="text-2xl font-bold mt-4 text-text-primary">
                打开摄像头，3秒识别不良坐姿
              </h3>
              <p className="text-text-secondary mt-4 text-sm leading-relaxed">
                基于先进的姿态估计算法，实时追踪你的头部角度、肩膀对称性、前倾距离和脊椎弧度。无需穿戴任何设备，只需打开摄像头，AI
                就能精准捕捉你的身体姿态数据，并在第一时间给出反馈。
              </p>
              <div className="flex gap-2 mt-6 flex-wrap">
                {["头部角度", "肩膀对称", "前倾距离", "脊椎弧度"].map(
                  (label) => (
                    <span
                      key={label}
                      className="rounded-full border border-primary/20 text-primary text-xs px-3 py-1"
                    >
                      {label}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Right: Mini skeleton mockup */}
            <div className="h-full flex items-center justify-center bg-dark rounded-2xl p-6 m-4">
              <div className="w-full max-w-[240px]">
                <SmallSkeletonSVG />
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* Feature 2: 智能温和提醒 (reverse layout)                        */}
        {/* ================================================================ */}
        <div className="bg-surface rounded-2xl border border-border card-hover overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left: Notification mockup */}
            <div className="h-full flex items-end p-4">
              <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-6 w-full text-white relative animate-bounce-down">
                {/* Close button */}
                <button className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
                {/* Body */}
                <p className="text-base pr-4">
                  你已经驼背 2 分钟了，试试挺直腰背深呼吸？
                </p>
                <div className="text-xs opacity-70 mt-4">
                  持续不良坐姿 2分12秒 | 今日第4次提醒
                </div>
              </div>
            </div>

            {/* Right: Text */}
            <div className="p-8 md:p-12">
              <span className="inline-block bg-warning-light text-warning text-xs font-medium px-3 py-1 rounded-full">
                贴心提醒
              </span>
              <h3 className="text-2xl font-bold mt-4 text-text-primary">
                不是粗暴弹窗，而是温和的守护
              </h3>
              <p className="text-text-secondary mt-4 text-sm leading-relaxed">
                当你开始驼背时，体态哨兵不会粗暴地打断你的工作。它通过系统通知栏温和提醒，并附带呼吸引导建议。你还可以自定义提醒频率和方式，让守护既有温度又不打扰。
              </p>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* Feature 3: 脊椎健康日报 (standard layout)                       */}
        {/* ================================================================ */}
        <div className="bg-surface rounded-2xl border border-border card-hover overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left: Text */}
            <div className="p-8 md:p-12">
              <span className="inline-block bg-info-light text-info text-xs font-medium px-3 py-1 rounded-full">
                数据洞察
              </span>
              <h3 className="text-2xl font-bold mt-4 text-text-primary">
                每天一份健康报告，看见改变的轨迹
              </h3>
              <p className="text-text-secondary mt-4 text-sm leading-relaxed">
                每晚会自动生成一份详细的脊椎健康日报，包含坐姿评分、驼背时长统计、提醒次数分析等核心指标。配合趋势图表，让你清晰看见每天的进步与变化。
              </p>
            </div>

            {/* Right: Daily report card */}
            <div className="h-full flex items-center p-4">
              <div className="bg-surface rounded-2xl border border-border p-6 w-full">
                {/* Report title */}
                <p className="font-semibold text-base text-text-primary">
                  今日脊椎健康报告 &middot; 6月25日
                </p>

                {/* Score circle */}
                <div className="flex justify-center mt-5">
                  <div className="w-24 h-24 rounded-full border-4 border-primary flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary">87</span>
                  </div>
                </div>

                {/* Data rows */}
                <div className="mt-5 space-y-4">
                  {/* Good posture */}
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-text-secondary">
                        良好坐姿占比：72%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-primary-light overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: "72%" }}
                      />
                    </div>
                  </div>

                  {/* Hunched time */}
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-text-secondary">
                        驼背时长：1.2小时
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-warning-light overflow-hidden">
                      <div
                        className="h-full rounded-full bg-warning"
                        style={{ width: "40%" }}
                      />
                    </div>
                  </div>

                  {/* Reminder count */}
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-text-secondary">
                        提醒次数：8次
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-alt overflow-hidden">
                      <div
                        className="h-full rounded-full bg-text-muted"
                        style={{ width: "30%" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Mini line chart */}
                <div className="mt-5">
                  <MiniLineChart />
                </div>

                {/* AI Suggestion */}
                <div className="bg-surface-alt rounded-xl p-3 mt-4 text-xs text-text-secondary">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 inline-block mr-1 -mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  你的左肩比右肩高
                  2cm，建议每小时做一次肩部放松操
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}