# Third-party notices

This site bundles the following open-source components. They keep their own licenses.

| Component | Used for | License | Where |
| --- | --- | --- | --- |
| [Stockfish](https://stockfishchess.org/) via the [stockfish.js](https://github.com/nmrugg/stockfish.js) JavaScript build (npm `stockfish@10.0.2`) | The chess bot | GNU GPL v3 | `public/stockfish.js`, license text in `public/licenses/stockfish-GPLv3.txt` |
| [chess.js](https://github.com/jhlywa/chess.js) 0.10.3 | Chess rules and move validation | BSD 2-Clause | inlined in `public/index.html`, license in `public/licenses/chess.js-BSD.txt` |
| [Google Fonts](https://fonts.google.com/): Press Start 2P, Pixelify Sans, VT323, Bricolage Grotesque, Figtree | Typography | SIL Open Font License 1.1 | loaded from fonts.googleapis.com |
| [@vercel/blob](https://www.npmjs.com/package/@vercel/blob) | Saving edited content on Vercel | Apache-2.0 | npm dependency |

## About the Stockfish license

Stockfish is licensed under the GPL v3. If you distribute this site you must keep
the Stockfish license text and offer its source code. The complete corresponding
source is available at the links above. Do not remove `public/licenses/`.
If you would rather not bundle Stockfish, delete `public/stockfish.js`: the chess
game keeps working with a small built-in engine (weaker).
