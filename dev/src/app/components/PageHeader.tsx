// 看板の色
export type SignTone = 'pink' | 'cyan' | 'gold' | 'green';

type Props = {
  kicker: string;
  title: string;
  lead?: string;
  /** 看板の色 */
  tone?: SignTone;
  /** 日本語の長いタイトル用（看板にせず、文字を小さくする） */
  compact?: boolean;
};

// ページ見出し: ▶ 日本語 + 看板のタイトル + 電球の列
export default function PageHeader({ kicker, title, lead, tone = 'pink', compact = false }: Props) {
  return (
    <header className="page-header">
      <p className="kicker">{kicker}</p>
      <h1 className={compact ? 'page-title-compact' : `sign sign-${tone} page-title`}>{title}</h1>
      {lead && <p className="page-lead">{lead}</p>}
      <div className="bulbs" aria-hidden="true" />
    </header>
  );
}
