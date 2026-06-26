"use client"

/**
 * شعار تحكم متحرك — النقاط المترابطة تنبض والخط الواصل يُرسم،
 * مع نص "تحكم / TAHAKOM" بألوان الهوية (عنابي + تركوازي).
 */
export function TahakomLogo({ size = 180, showText = true }: { size?: number; showText?: boolean }) {
  const plum = "var(--color-brand-plum)"
  const teal = "var(--color-brand-teal)"

  // مربعات متناثرة (تتلاشى وتظهر)
  const squares = [
    { x: 70, y: 6, s: 11, c: plum, d: "0s" },
    { x: 92, y: 20, s: 9, c: plum, d: "0.4s" },
    { x: 50, y: 24, s: 9, c: plum, d: "0.8s" },
    { x: 104, y: 40, s: 7, c: teal, d: "1.1s" },
    { x: 96, y: 60, s: 6, c: plum, d: "1.4s" },
    { x: 84, y: 78, s: 5, c: teal, d: "1.7s" },
    { x: 74, y: 92, s: 4, c: plum, d: "2s" },
  ]

  // عقد الشبكة (تنبض)
  const nodes = [
    { x: 40, y: 52, r: 8, c: teal, d: "0s" },
    { x: 60, y: 44, r: 7, c: teal, d: "0.3s" },
    { x: 74, y: 52, r: 7, c: teal, d: "0.6s" },
    { x: 64, y: 66, r: 6, c: plum, d: "0.9s" },
    { x: 50, y: 74, r: 6, c: plum, d: "1.2s" },
    { x: 70, y: 82, r: 5, c: plum, d: "1.5s" },
  ]

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox="0 0 150 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="شعار تحكم"
        className="animate-float"
      >
        {/* خطوط واصلة بين العقد */}
        <g stroke={teal} strokeWidth="3" strokeLinecap="round" opacity="0.55">
          <line x1="40" y1="52" x2="60" y2="44">
            <animate attributeName="opacity" values="0.2;0.8;0.2" dur="2.4s" repeatCount="indefinite" />
          </line>
          <line x1="60" y1="44" x2="74" y2="52">
            <animate attributeName="opacity" values="0.2;0.8;0.2" dur="2.4s" begin="0.3s" repeatCount="indefinite" />
          </line>
          <line x1="60" y1="44" x2="64" y2="66">
            <animate attributeName="opacity" values="0.2;0.8;0.2" dur="2.4s" begin="0.6s" repeatCount="indefinite" />
          </line>
          <line x1="64" y1="66" x2="50" y2="74">
            <animate attributeName="opacity" values="0.2;0.8;0.2" dur="2.4s" begin="0.9s" repeatCount="indefinite" />
          </line>
          <line x1="64" y1="66" x2="70" y2="82">
            <animate attributeName="opacity" values="0.2;0.8;0.2" dur="2.4s" begin="1.2s" repeatCount="indefinite" />
          </line>
        </g>

        {/* مربعات متناثرة */}
        {squares.map((sq, i) => (
          <rect key={i} x={sq.x} y={sq.y} width={sq.s} height={sq.s} rx="1.5" fill={sq.c}>
            <animate attributeName="opacity" values="0.25;1;0.25" dur="3s" begin={sq.d} repeatCount="indefinite" />
          </rect>
        ))}

        {/* عقد نابضة */}
        {nodes.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={n.r} fill={n.c}>
            <animate attributeName="r" values={`${n.r * 0.8};${n.r * 1.15};${n.r * 0.8}`} dur="2.2s" begin={n.d} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;1;0.7" dur="2.2s" begin={n.d} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>

      {showText && (
        <div className="mt-1 flex flex-col items-center leading-none">
          <span className="text-4xl font-extrabold tahakom-shimmer sm:text-5xl">تحكم</span>
          <span
            className="mt-1 text-xs font-bold tracking-[0.5em] sm:text-sm"
            style={{ color: teal }}
          >
            TAHAKOM
          </span>
        </div>
      )}
    </div>
  )
}
