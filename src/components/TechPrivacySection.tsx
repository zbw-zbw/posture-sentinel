export default function TechPrivacySection() {
  const metrics = [
    { value: "0元", label: "完全免费" },
    { value: "100%", label: "本地处理" },
    { value: "∞", label: "随时可用" },
    { value: "0", label: "服务器上传" },
  ];

  return (
    <section
      id="about"
      className="mx-auto max-w-[1100px] px-4 md:px-6 py-24 fade-in"
    >
      {/* Data Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {metrics.map((metric) => (
          <div key={metric.label} className="text-center">
            <p className="text-2xl font-bold text-primary-text">{metric.value}</p>
            <p className="text-xs text-text-muted mt-1">{metric.label}</p>
          </div>
        ))}
      </div>

      {/* Title */}
      <h2 className="text-center text-3xl font-bold text-text-primary md:text-4xl">
        你的隐私，我们放在第一位
      </h2>
      <p className="mx-auto mt-3 text-center text-text-secondary max-w-xl">
        体态哨兵不需要注册账号，也不会把你的画面发到任何地方
      </p>

      {/* Privacy Promise Card */}
      <div className="mt-12 max-w-2xl mx-auto rounded-2xl border-l-4 border-primary bg-surface p-8 card-hover">
        <h3 className="mb-6 text-xl font-semibold flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          隐私安全承诺
        </h3>
        <ul className="flex flex-col gap-1">
          <li className="py-2 text-sm flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            摄像头画面只在你的设备上分析，不会上传
          </li>
          <li className="py-2 text-sm flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            不录制视频，不截图，不留存任何画面
          </li>
          <li className="py-2 text-sm flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            坐姿数据仅保存在你的浏览器本地存储中
          </li>
          <li className="py-2 text-sm flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            无需注册账号，打开网页即可使用
          </li>
        </ul>
        <div className="mt-6 pt-4 text-xs text-text-muted">
          体态哨兵不会将你的摄像头画面发送到任何服务器，所有分析都在你的电脑上完成。
        </div>
      </div>
    </section>
  );
}
