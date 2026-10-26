# Portfolio

Sato Hiroto のポートフォリオサイト「NEW HIROTO CITY」。技術記事と日記をまとめている。
React + TypeScript + Vite で作った静的サイトを、GitHub Pages でホスティングする。
Tech は Qiita、Diary ははてなブログの記事をビルド時に取得して表示する。

## ディレクトリ

```
Portfolio/
├── doc/          # 設計書
│   └── images/   #   README などで使う画像
└── dev/          # サイトのソース・設定
```

設計の詳細は [doc/](doc/README.md) を参照。

## 開発

Node.js 22.12 以上が必要。

```bash
cd dev
npm install
npm test         # 単体テスト（GitHub Actions でもビルドの前に実行）
npm run dev      # http://localhost:5173（起動前に記事を取得）
npm run build    # dev/dist/ に出力
npm run preview  # ビルド結果を確認
```

## よく使うドキュメント

- [要件定義書](doc/01_要件定義書/要件定義書.md)
- [基本設計書（構成・デプロイ・独自ドメイン・運用）](doc/02_基本設計書/基本設計書.md)
- [画面設計書](doc/03_詳細設計書/画面設計書.md)
- [処理設計書（記事の取得・階数）](doc/03_詳細設計書/処理設計書.md)
- [テスト設計書](doc/04_テスト設計書/テスト設計書.md)

<!-- 画像を載せる場合は doc/images/ に置き、次のように書く
![トップページ](doc/images/home.png)
-->
