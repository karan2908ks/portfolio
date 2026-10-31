// Rebuilds public/index.html from scripts/page-source.html (+ chess.js inlined).
// You normally do NOT need this. Edit public/index.html directly instead.
// Run: node scripts/build-page.js
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
let src = fs.readFileSync(path.join(__dirname, 'page-source.html'), 'utf8');
const chess = fs.readFileSync(path.join(__dirname, 'chess.lib.js'), 'utf8');
src = src.replace('<!--@CHESSJS-->', () => '<script>\n' + chess + '\n</script>');
src = src.replace(/<meta name="claude:viewport-fit-sides"[^>]*>\n?/, '');

const split = src.indexOf('</style>') + '</style>'.length;
const head = src.slice(0, split);
const body = src.slice(split);

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#15122b">
<meta name="description" content="Karan Sharma, B.Tech student. Projects, skills and a playable pixel arcade with chess, Dino Rush and more.">
<meta property="og:title" content="Karan Sharma">
<meta property="og:description" content="B.Tech student portfolio with a playable pixel arcade.">
<meta property="og:type" content="website">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<script>try{var m=localStorage.getItem("ks-mode");if(m)document.documentElement.setAttribute("data-mode",m)}catch(e){}</script>
${head}
</head>
<body>
${body}
</body>
</html>
`;
fs.writeFileSync(path.join(root, 'public', 'index.html'), html);
const defaults = src.match(/<script type="application\/json" id="defaults">\s*([\s\S]*?)\s*<\/script>/);
fs.writeFileSync(path.join(root, 'public', 'site.json'), JSON.stringify(JSON.parse(defaults[1]), null, 2) + '\n');
console.log('Built public/index.html and public/site.json');
