import type { Feed } from '../data/articles';

// 記事がないときの表示
// feeds.config.json が未設定の場合は、開発中（npm run dev）だけ設定方法を出す
export default function FeedEmpty({ feed, configKey }: { feed: Feed; configKey: string }) {
  if (!feed.configured && import.meta.env.DEV) {
    return <p className="status">feeds.config.json の「{configKey}」を設定すると記事が表示されます。</p>;
  }
  return <p className="status">まだ記事がありません。</p>;
}
