import { useId } from 'react';

// Home のヒーローの下端に置く、にぎやかな街並みの SVG
// 奥: ビルと紺のタワー / 中: 赤い鉄塔・観覧車・メリーゴーランド・五重塔 / 手前: 将棋の駒・ロケット・風船などのおもちゃのオブジェ
// 奥のビル [x, 幅, 高さ]
const BUILDINGS: [number, number, number][] = [
  [0, 60, 140], [55, 42, 185], [92, 70, 120], [158, 50, 210], [204, 80, 150],
  [280, 46, 192], [322, 90, 132], [405, 30, 105], [575, 40, 170],
  [728, 52, 140], [776, 56, 196], [828, 70, 126], [894, 46, 182], [936, 64, 148],
];

const GROUND = 240;
const GONDOLA_COLORS = ['var(--pink)', 'var(--gold)', 'var(--cyan)', 'var(--green)'];
const OUTLINE = 'var(--tower-dark)';

export default function Skyline({ className = '' }: { className?: string }) {
  // 同じページに複数置いても pattern の id がぶつからないようにする
  const id = useId();
  const windows = `windows-${id}`;
  const towerWindows = `tower-windows-${id}`;

  return (
    <svg className={className} viewBox="0 0 1000 240" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <pattern id={windows} width="14" height="16" patternUnits="userSpaceOnUse">
          <rect x="4" y="4" width="5" height="7" fill="#ffe27a" />
        </pattern>
        <pattern id={towerWindows} width="10" height="12" patternUnits="userSpaceOnUse">
          <rect x="2" y="3" width="6" height="6" fill="var(--cyan)" />
        </pattern>
      </defs>

      {/* 奥のビル */}
      {BUILDINGS.map(([x, w, h]) => (
        <g key={x}>
          <rect x={x} y={GROUND - h} width={w} height={h} fill="#5a6cbc" stroke="#2b3570" strokeWidth="2" />
          <rect x={x + 4} y={GROUND + 10 - h} width={w - 8} height={h - 22} fill={`url(#${windows})`} />
        </g>
      ))}

      <Tower windowsId={towerWindows} />

      <LatticeTower x={310} />
      <FerrisWheel cx={495} cy={105} r={60} />
      <Carousel cx={150} />
      <Pagoda cx={830} />

      {/* 手前のおもちゃのオブジェ */}
      <Tree x={268} />
      <Tree x={748} />
      <Balloons x={232} />
      <GiftBox x={232} y={210} size={30} color="var(--pink)" ribbon="var(--gold)" />
      <GiftBox x={545} y={216} size={24} color="var(--cyan)" ribbon="var(--pink)" />
      <SignBoard x={348} text="SATO" />
      <Marquee x={588} text="CINEMA" />
      <Rocket x={900} />
      <ShogiPiece x={28} y={172} width={46} label="王" rotate={-8} />
      <ShogiPiece x={414} y={196} width={34} label="歩" rotate={10} />
      <ShogiPiece x={952} y={190} width={38} label="金" rotate={-6} />
    </svg>
  );
}

/** 紺のタワー（水色の窓と金のトゲ、点滅するアンテナ） */
function Tower({ windowsId }: { windowsId: string }) {
  return (
    <g>
      {[60, 100].map((y) => (
        <g key={y}>
          <polygon points={`640,${y} 624,${y - 10} 640,${y + 12}`} fill="var(--gold)" />
          <polygon points={`712,${y} 728,${y - 10} 712,${y + 12}`} fill="var(--gold)" />
        </g>
      ))}
      <rect x="652" y="20" width="48" height="30" fill="var(--tower)" stroke={OUTLINE} strokeWidth="2" />
      <rect x="640" y="48" width="72" height="192" fill="var(--tower)" stroke={OUTLINE} strokeWidth="2" />
      <rect x="648" y="56" width="56" height="176" fill={`url(#${windowsId})`} />
      <rect x="660" y="26" width="32" height="18" fill={`url(#${windowsId})`} />
      <line x1="676" y1="20" x2="676" y2="0" stroke={OUTLINE} strokeWidth="3" />
      <circle className="antenna-light" cx="676" cy="2" r="4" fill="var(--pink)" />
    </g>
  );
}

/** 赤い鉄塔 */
function LatticeTower({ x }: { x: number }) {
  const top = 70;
  const half = (y: number) => 6 + (22 * (y - top)) / (GROUND - top); // 高さ y での脚の開き
  return (
    <g stroke="#e0484e" strokeWidth="4" fill="none">
      <polyline points={`${x - 28},${GROUND} ${x - 6},${top} ${x + 6},${top} ${x + 28},${GROUND}`} />
      {[205, 170, 135, 100].map((y, i) => (
        <line key={y} x1={x - half(y)} y1={y} x2={x + half(y)} y2={y} stroke={i % 2 ? '#fff' : '#e0484e'} />
      ))}
      <line x1={x - half(205)} y1={205} x2={x + half(170)} y2={170} strokeWidth="2" />
      <line x1={x + half(205)} y1={205} x2={x - half(170)} y2={170} strokeWidth="2" />
      <rect x={x - 16} y={118} width={32} height={12} fill="#e0484e" stroke={OUTLINE} strokeWidth="2" />
      <rect x={x - 9} y={86} width={18} height={8} fill="#fff" stroke={OUTLINE} strokeWidth="2" />
      <line x1={x} y1={top} x2={x} y2={30} strokeWidth="3" />
    </g>
  );
}

/** 観覧車（ゆっくり回る） */
function FerrisWheel({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const gondolas = Array.from({ length: 10 }, (_, i) => (i * Math.PI * 2) / 10);
  return (
    <g>
      <line x1={cx} y1={cy} x2={cx - 42} y2={GROUND} stroke="#f4f6ff" strokeWidth="5" />
      <line x1={cx} y1={cy} x2={cx + 42} y2={GROUND} stroke="#f4f6ff" strokeWidth="5" />
      <g className="ferris-wheel" style={{ transformOrigin: `${cx}px ${cy}px` }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f4f6ff" strokeWidth="4" />
        <circle cx={cx} cy={cy} r={r * 0.6} fill="none" stroke="#f4f6ff" strokeWidth="2" opacity="0.7" />
        {gondolas.map((angle, i) => {
          const gx = cx + r * Math.cos(angle);
          const gy = cy + r * Math.sin(angle);
          return (
            <g key={i}>
              <line x1={cx} y1={cy} x2={gx} y2={gy} stroke="#f4f6ff" strokeWidth="2" />
              <rect x={gx - 6} y={gy - 6} width="12" height="12" fill={GONDOLA_COLORS[i % 4]} stroke={OUTLINE} strokeWidth="1.5" />
            </g>
          );
        })}
        <rect x={cx - 6} y={cy - 6} width="12" height="12" fill="#fff" stroke={OUTLINE} strokeWidth="1.5" />
      </g>
    </g>
  );
}

/** メリーゴーランド（ピンクと白のしま模様の屋根） */
function Carousel({ cx }: { cx: number }) {
  const left = cx - 46;
  const step = 92 / 6;
  return (
    <g stroke={OUTLINE} strokeWidth="1.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1={left + 8 + i * 19} y1={182} x2={left + 8 + i * 19} y2={214} stroke="var(--gold)" strokeWidth="3" />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={left + 12 + i * 19} y={194 + (i % 2) * 8} width="11" height="7" fill="#fff" />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <polygon
          key={i}
          points={`${cx},150 ${left + i * step},182 ${left + (i + 1) * step},182`}
          fill={i % 2 ? '#fff' : 'var(--pink)'}
        />
      ))}
      <rect x={left} y={214} width="92" height="10" fill="var(--pink)" />
      <line x1={cx} y1={150} x2={cx} y2={132} />
      <polygon points={`${cx},132 ${cx + 14},137 ${cx},142`} fill="var(--gold)" />
    </g>
  );
}

/** 五重塔 */
function Pagoda({ cx }: { cx: number }) {
  return (
    <g stroke={OUTLINE} strokeWidth="1.5">
      <line x1={cx} y1={110} x2={cx} y2={78} stroke="var(--gold)" strokeWidth="3" />
      {[210, 180, 150, 120].map((y, i) => {
        const w = 40 - i * 6;
        return (
          <g key={y}>
            <rect x={cx - w / 2} y={y} width={w} height={30} fill="#f3e7c6" />
            <polygon points={`${cx - w / 2 - 12},${y} ${cx + w / 2 + 12},${y} ${cx + w / 2},${y - 10} ${cx - w / 2},${y - 10}`} fill="var(--teal-deep)" />
          </g>
        );
      })}
    </g>
  );
}

function Tree({ x }: { x: number }) {
  return (
    <g stroke={OUTLINE} strokeWidth="1.5">
      <rect x={x - 3} y={212} width="6" height="28" fill="var(--earth)" />
      <circle cx={x} cy={204} r="16" fill="#4fb06a" />
    </g>
  );
}

/** 風船（ふわふわ揺れる） */
function Balloons({ x }: { x: number }) {
  const balloons: [number, number, string][] = [
    [-17, 150, 'var(--pink)'],
    [0, 138, 'var(--gold)'],
    [14, 154, 'var(--cyan)'],
  ];
  return (
    <g className="balloons">
      {balloons.map(([dx, cy, color]) => (
        <g key={dx}>
          <line x1={x + dx} y1={cy + 11} x2={x} y2={208} stroke={OUTLINE} strokeWidth="1" />
          <ellipse cx={x + dx} cy={cy} rx="10" ry="12" fill={color} stroke={OUTLINE} strokeWidth="1.5" />
        </g>
      ))}
    </g>
  );
}

function GiftBox({ x, y, size, color, ribbon }: { x: number; y: number; size: number; color: string; ribbon: string }) {
  return (
    <g stroke={OUTLINE} strokeWidth="1.5">
      <rect x={x - size / 2} y={y} width={size} height={size} fill={color} />
      <rect x={x - 3} y={y} width="6" height={size} fill={ribbon} />
      <ellipse cx={x - 6} cy={y - 4} rx="6" ry="4" fill={ribbon} />
      <ellipse cx={x + 6} cy={y - 4} rx="6" ry="4" fill={ribbon} />
    </g>
  );
}

/** 2 本の柱に乗った看板 */
function SignBoard({ x, text }: { x: number; text: string }) {
  return (
    <g>
      <line x1={x + 12} y1={GROUND} x2={x + 12} y2={200} stroke={OUTLINE} strokeWidth="3" />
      <line x1={x + 52} y1={GROUND} x2={x + 52} y2={200} stroke={OUTLINE} strokeWidth="3" />
      <rect x={x} y={178} width="64" height="24" fill="var(--tower)" stroke="var(--gold)" strokeWidth="2" />
      <text x={x + 32} y={196} textAnchor="middle" fill="var(--gold)" fontSize="15" style={{ fontFamily: 'var(--font-sign)' }}>
        {text}
      </text>
    </g>
  );
}

/** 映画館の電光看板 */
function Marquee({ x, text }: { x: number; text: string }) {
  return (
    <g>
      <rect x={x} y={200} width="62" height="40" fill="#f3e7c6" stroke={OUTLINE} strokeWidth="1.5" />
      <rect x={x - 4} y={188} width="70" height="18" fill="var(--pink)" stroke={OUTLINE} strokeWidth="1.5" />
      <text x={x + 31} y={201} textAnchor="middle" fill="#fff" fontSize="11" style={{ fontFamily: 'var(--font-sign)' }}>
        {text}
      </text>
      <rect x={x + 20} y={214} width="22" height="26" fill="var(--tower)" />
    </g>
  );
}

/** ロケット */
function Rocket({ x }: { x: number }) {
  return (
    <g stroke={OUTLINE} strokeWidth="1.5">
      <rect x={x - 18} y={228} width="58" height="12" fill="var(--tower)" />
      <polygon points={`${x},200 ${x - 12},228 ${x},228`} fill="#e0484e" />
      <polygon points={`${x + 22},200 ${x + 34},228 ${x + 22},228`} fill="#e0484e" />
      <rect x={x} y={146} width="22" height="82" rx="8" fill="#f4f6ff" />
      <polygon points={`${x},152 ${x + 22},152 ${x + 11},118`} fill="#e0484e" />
      <circle cx={x + 11} cy={172} r="6" fill="var(--cyan)" />
      <rect x={x} y={196} width="22" height="5" fill="#e0484e" />
    </g>
  );
}

/** 将棋の駒 */
function ShogiPiece({ x, y, width, label, rotate }: { x: number; y: number; width: number; label: string; rotate: number }) {
  const h = width * 1.3;
  const cx = x + width / 2;
  return (
    <g transform={`rotate(${rotate} ${cx} ${y + h})`}>
      <polygon
        points={`${cx},${y} ${x + width * 0.86},${y + h * 0.2} ${x + width},${y + h} ${x},${y + h} ${x + width * 0.14},${y + h * 0.2}`}
        fill="#f0c374"
        stroke="#8a5a24"
        strokeWidth="2"
      />
      <text
        x={cx}
        y={y + h * 0.72}
        textAnchor="middle"
        fill="#3a2410"
        fontSize={width * 0.46}
        style={{ fontFamily: 'var(--font-heavy)' }}
      >
        {label}
      </text>
    </g>
  );
}
