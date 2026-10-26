import PageHeader from '../components/PageHeader';
import { hatena, qiita } from '../data/articles';

// 自己紹介ページ: あいさつ・プロフィール・外部リンク

// プロフィールの表（項目と内容）
const PROFILE = [
  { label: '拠点', value: '岩手県盛岡市' },
  { label: '趣味', value: '個人開発、旅行、カメラ' },
  { label: 'すきな〇〇', value: 'Official髭男dism、ラーメン、たぬき' },
  { label: '資格', value: '応用情報技術者試験、JavaGold17、色彩検定1級' },
];

export default function About() {
  return (
    // ページ全体を枠で囲む（Tech・Diary と同じまとまりの見た目）
    <section className="section-group">
      <PageHeader kicker="▶ 自己紹介" title="About" tone="gold" />

      <div className="prose">
        <p>
          こんにちは！さとうひろとです！
          <br />
          コードを書いたり旅行に行くのが好きです！
        </p>

        <h2>Profile</h2>
        <dl className="profile">
          {PROFILE.map(({ label, value }) => (
            <div key={label} className="profile-row">
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <h2>Links</h2>
        {/* Qiita・はてなブログは feeds.config.json に設定があるときだけ出す */}
        <ul className="link-list">
          <li><a href="https://github.com/sato-hirotoro" target="_blank" rel="noreferrer">GitHub</a></li>
          {qiita.profileUrl && (
            <li><a href={qiita.profileUrl} target="_blank" rel="noreferrer">Qiita</a></li>
          )}
          {hatena.profileUrl && (
            <li><a href={hatena.profileUrl} target="_blank" rel="noreferrer">Hatena Blog</a></li>
          )}
        </ul>
      </div>
    </section>
  );
}
