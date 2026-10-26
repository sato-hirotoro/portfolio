// GitHub Pages は SPA のルーティングに対応していないため、
// index.html を 404.html としてコピーし /tech/1F などへの直アクセスに対応する
// （GitHub Pages は存在しないパスに 404.html を返すので、中身が index.html なら React Router が正しいページを表示できる）
import { copyFileSync } from 'node:fs';

copyFileSync('dist/index.html', 'dist/404.html');
console.log('copied dist/index.html -> dist/404.html');
