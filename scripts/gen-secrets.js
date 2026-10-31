// Prints a strong admin password and a session secret. Nothing is saved to disk.
const crypto = require('crypto');
const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'; // no look-alike characters
function chunk(n) {
  let out = '';
  for (let i = 0; i < n; i++) out += alphabet[crypto.randomInt(alphabet.length)];
  return out;
}
const password = [chunk(5), chunk(5), chunk(5), chunk(5)].join('-');
console.log('\nADMIN_PASSWORD=' + password);
console.log('SESSION_SECRET=' + crypto.randomBytes(32).toString('hex') + '\n');
console.log('Copy both lines into Vercel > Project > Settings > Environment Variables');
console.log('(and into a local .env file if you want to run it on your computer).\n');
