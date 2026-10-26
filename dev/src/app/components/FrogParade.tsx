// フッターの上に並ぶカエルの行列
// ファビコンのカエル（public/icon-512.png）を画面の端から端まで並べ、奇数番目と偶数番目が交互に上下に跳ねる（global.css の .frog-parade）
// 大きさは 40px のまま、どんなに広い画面（4K 程度）でも端まで埋まる数を並べ、はみ出した分は隠す
const FROG_COUNT = 100;

export default function FrogParade() {
  return (
    <div className="frog-parade" aria-hidden="true">
      {Array.from({ length: FROG_COUNT }, (_, i) => (
        <img key={i} src={`${import.meta.env.BASE_URL}icon-512.png`} alt="" width="40" height="40" loading="lazy" />
      ))}
    </div>
  );
}
