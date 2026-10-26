import { useId } from 'react';
import styles from './Splash.module.css';

// 右から左へ走るリムジン（SVG）。前（ボンネット）が左側
// 運転席（いちばん前の窓）から顔を出す（顔は public/driver-face.png）
// 動き（走る・タイヤが回る・顔を出す）はすべて Splash.module.css のアニメーションで付ける

// 窓の位置（左から 5 枚）。顔はいちばん前 = 運転席の窓（index 0）から出す
const WINDOWS = [0, 1, 2, 3, 4].map((i) => 156 + i * 60);
const FACE_WINDOW_X = WINDOWS[0];
const WINDOW_TOP = 56;
const WINDOW_BOTTOM = 84;
const FACE_SIZE = 88;

export default function Limo({ className = '' }: { className?: string }) {
  const id = useId();
  const windowClip = `window-clip-${id}`;
  const headClip = `head-clip-${id}`;

  return (
    <svg className={className} viewBox="0 0 560 170" aria-hidden="true">
      <defs>
        {/* 顔は窓の下端より上だけ見せる（車体の中に隠れている状態から出てくる） */}
        <clipPath id={windowClip}>
          <rect x="0" y="-120" width="560" height={120 + WINDOW_BOTTOM} />
        </clipPath>
        {/* 顔の画像の白い四隅を落として、丸く切り抜く（画像の大きさを 1 とした座標で指定） */}
        <clipPath id={headClip} clipPathUnits="objectBoundingBox">
          <circle cx="0.5" cy="0.5" r="0.49" />
        </clipPath>
      </defs>

      {/* マフラーの煙（後ろ = 右側） */}
      <g className={styles.puffs}>
        <circle cx="548" cy="122" r="6" />
        <circle cx="558" cy="114" r="4" />
      </g>

      {/* 車体（上下に小さく揺れる） */}
      <g className={styles.body}>
        {/* 客室（屋根と窓） */}
        <polygon points="114,90 144,46 456,46 478,90" fill="var(--tower)" stroke="var(--tower-dark)" strokeWidth="3" strokeLinejoin="round" />
        <polygon points="124,86 148,56 150,86" fill="#9fd8ff" stroke="var(--tower-dark)" strokeWidth="2" />
        {WINDOWS.map((x) => (
          <rect key={x} x={x} y={WINDOW_TOP} width="50" height={WINDOW_BOTTOM - WINDOW_TOP} fill="#9fd8ff" stroke="var(--tower-dark)" strokeWidth="2" />
        ))}
        {/* 窓の光の反射 */}
        {WINDOWS.map((x) => (
          <line key={x} x1={x + 8} y1={WINDOW_BOTTOM - 6} x2={x + 20} y2={WINDOW_TOP + 6} stroke="#fff" strokeWidth="3" opacity="0.6" />
        ))}

        {/* 運転席の窓から顔を出す人 */}
        <g clipPath={`url(#${windowClip})`}>
          <g className={styles.face}>
            {/* 窓の中央に合わせ、頭が屋根より上に出る位置に置く */}
            <image
              href={`${import.meta.env.BASE_URL}driver-face.png`}
              x={FACE_WINDOW_X + 25 - FACE_SIZE / 2}
              y={WINDOW_BOTTOM - 6 - FACE_SIZE}
              width={FACE_SIZE}
              height={FACE_SIZE}
              clipPath={`url(#${headClip})`}
            />
            {/* 顔のまわりの丸いフチ（ファビコンのカエルと同じ緑） */}
            <circle
              cx={FACE_WINDOW_X + 25}
              cy={WINDOW_BOTTOM - 6 - FACE_SIZE / 2}
              r={FACE_SIZE * 0.49 - 1.5}
              fill="none"
              stroke="var(--frog)"
              strokeWidth="3"
            />
          </g>
        </g>

        {/* 下の車体 */}
        <rect x="24" y="86" width="512" height="44" rx="10" fill="var(--tower)" stroke="var(--tower-dark)" strokeWidth="3" />
        <rect x="24" y="100" width="512" height="5" fill="var(--gold)" />
        {/* ドアの継ぎ目 */}
        {[210, 270, 330, 390].map((x) => (
          <line key={x} x1={x} y1="88" x2={x} y2="126" stroke="var(--tower-dark)" strokeWidth="2" />
        ))}
        {/* ヘッドライト・テールランプ・バンパー */}
        <rect x="26" y="90" width="14" height="8" fill="#fff6b0" stroke="var(--tower-dark)" strokeWidth="1.5" />
        <rect x="520" y="90" width="14" height="8" fill="#ff4d6d" stroke="var(--tower-dark)" strokeWidth="1.5" />
        <rect x="14" y="112" width="22" height="14" rx="3" fill="#d9dcea" stroke="var(--tower-dark)" strokeWidth="1.5" />
        <rect x="524" y="112" width="22" height="14" rx="3" fill="#d9dcea" stroke="var(--tower-dark)" strokeWidth="1.5" />
        {/* フロントの小旗 */}
        <line x1="70" y1="86" x2="70" y2="62" stroke="var(--tower-dark)" strokeWidth="2" />
        <polygon points="70,62 88,67 70,72" fill="var(--pink)" stroke="var(--tower-dark)" strokeWidth="1.5" />
      </g>

      {/* タイヤ（ホイールのスポークが回る） */}
      {[112, 448].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="136" r="22" fill="#1d1d2b" />
          <g className={styles.wheel}>
            <circle cx={cx} cy="136" r="10" fill="#c8cde0" stroke="var(--tower-dark)" strokeWidth="2" />
            <line x1={cx - 10} y1="136" x2={cx + 10} y2="136" stroke="var(--tower-dark)" strokeWidth="2" />
            <line x1={cx} y1="126" x2={cx} y2="146" stroke="var(--tower-dark)" strokeWidth="2" />
          </g>
        </g>
      ))}
    </svg>
  );
}
