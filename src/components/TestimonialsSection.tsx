"use client";

export default function TestimonialsSection() {
  return (
    <section className="mx-auto max-w-[1100px] px-4 md:px-6 py-24 fade-in">
      {/* Title */}
      <h2 className="text-center text-3xl font-bold text-text-primary md:text-4xl">
        来自真实用户的体验
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-text-secondary">
        看看大家如何通过体态哨兵改善坐姿习惯
      </p>

      {/* Cards Grid */}
      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Card 1: 程序员小周 */}
        <div className="card-hover relative flex flex-col rounded-2xl bg-surface p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-info to-info-light">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-text-primary">程序员小周</div>
              <div className="text-sm text-text-muted">28岁</div>
            </div>
          </div>
          <p className="mt-4 text-base italic leading-relaxed text-text-secondary">
            &ldquo;开着体态哨兵写了一天代码，它提醒了我 8 次驼背。最长一次是开会时不自觉前倾了
            15 分钟。看完日报才知道自己有 40% 的时间在驼背。&rdquo;
          </p>
          <div className="mt-auto pt-4">
            <span className="inline-block rounded-full bg-info-light px-3 py-1 text-xs text-info">
              日常办公
            </span>
          </div>
        </div>

        {/* Card 2: 初中生小雨 */}
        <div className="card-hover relative flex flex-col rounded-2xl bg-surface p-6">
          <div className="absolute right-3 top-3 rounded-full bg-primary-light px-2 py-1 text-xs text-primary">
            公益
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-light">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-text-primary">初中生小雨</div>
              <div className="text-sm text-text-muted">14岁</div>
            </div>
          </div>
          <p className="mt-4 text-base italic leading-relaxed text-text-secondary">
            &ldquo;妈妈让我写作业时打开它。第一天被提醒了 20 多次，一周后降到 5
            次以内。现在不开它也能保持坐直了！&rdquo;
          </p>
          <div className="mt-auto pt-4">
            <span className="inline-block rounded-full bg-primary-light px-3 py-1 text-xs text-primary">
              青少年健康
            </span>
          </div>
        </div>

        {/* Card 3: 远程工作者阿琳 */}
        <div className="card-hover relative flex flex-col rounded-2xl bg-surface p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-warning to-warning-light">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-text-primary">远程工作者阿琳</div>
              <div className="text-sm text-text-muted">32岁</div>
            </div>
          </div>
          <p className="mt-4 text-base italic leading-relaxed text-text-secondary">
            &ldquo;在家办公坐沙发上写方案，体态哨兵直接亮红灯——前倾角度
            35&deg;。吓得我赶紧搬到书桌前。&rdquo;
          </p>
          <div className="mt-auto pt-4">
            <span className="inline-block rounded-full bg-warning-light px-3 py-1 text-xs text-warning">
              远程办公
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}