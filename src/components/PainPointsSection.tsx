"use client";

export default function PainPointsSection() {
  const cards = [
    {
      icon: (
        <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v18" />
          <path d="M8 7c0-2.2 1.8-4 4-4s4 1.8 4 4" />
          <path d="M9 21c0-2 1.3-3 3-3s3 1 3 3" />
        </svg>
      ),
      title: "无意识驼背",
      description:
        "大部分人根本意识不到自己坐歪了。等你发现脖子酸、肩膀疼的时候，已经保持错误姿势数小时。驼背不是故意的，而是不知不觉的。",
      barColor: "bg-danger",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v8" />
          <path d="M9 11h4a2 2 0 0 1 0 4h-4" />
        </svg>
      ),
      title: "解决方案太贵",
      description:
        "人体工学椅动辄几千，矫正器穿着难受坚持不了3天，可穿戴设备还得额外花钱买。",
      barColor: "bg-warning",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <polyline points="12 7 12 12 15 15" />
        </svg>
      ),
      title: "定时提醒没用",
      description:
        "手机App只能每30分钟弹通知，但你可能5分钟内就从坐直滑到驼背。没有任何检测能力。",
      barColor: "bg-info",
    },
  ];

  return (
    <section className="max-w-[1100px] mx-auto px-4 md:px-6 py-24">
      <div className="fade-in">
        {/* Section Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-center text-text-primary">
          你的脊椎，正在无声求救
        </h2>
        <p className="text-text-secondary text-center mt-3 max-w-2xl mx-auto">
          坐姿问题是慢性伤害，等到痛的时候已经晚了
        </p>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {cards.map((card, index) => (
            <div
              key={index}
              className="bg-surface rounded-2xl card-hover overflow-hidden flex flex-col"
            >
              {/* Card Content */}
              <div className="px-6 py-8 flex-1">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                  index === 0 ? "bg-danger-light" : index === 1 ? "bg-warning-light" : "bg-info-light"
                }`}>
                  <span className={`text-2xl ${
                    index === 0 ? "text-danger" : index === 1 ? "text-warning" : "text-info"
                  }`}>
                    {card.icon}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mt-4 text-text-primary">
                  {card.title}
                </h3>
                <p className="text-text-secondary mt-3 leading-relaxed text-sm">
                  {card.description}
                </p>
              </div>

              {/* Bottom Color Bar */}
              <div className={`h-1.5 w-full ${card.barColor}`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}