// Where the edited site content lives.
//  - On Vercel: a Vercel Blob store (BLOB_STORE_ID or BLOB_READ_WRITE_TOKEN is added
//    automatically when you connect a Blob store to the project).
//  - Locally (npm run dev): a plain file at .data/site.json.
const fs = require('fs/promises');
const path = require('path');

const DEFAULT_KEY = 'site.json';
const localFile = (key) => path.join(__dirname, '..', '..', '.data', key);

// Create the Blob store as "Private" (recommended). If you made a Public store,
// set BLOB_ACCESS=public in the project's environment variables.
const access = () => (process.env.BLOB_ACCESS === 'public' ? 'public' : 'private');
// Newer Vercel Blob stores sign in with BLOB_STORE_ID (OIDC) instead of a token.
const hasBlob = () => !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

// key is a file name such as 'site.json' or 'scores.json'.
async function read(key = DEFAULT_KEY) {
  if (hasBlob()) {
    const { get } = require('@vercel/blob');
    try {
      const result = await get(key, { access: access(), useCache: false });
      if (!result || result.statusCode !== 200) return null;
      return JSON.parse(await new Response(result.stream).text());
    } catch (e) {
      if (e && e.name === 'BlobNotFoundError') return null;
      throw e;
    }
  }
  if (!process.env.VERCEL) {
    try {
      return JSON.parse(await fs.readFile(localFile(key), 'utf8'));
    } catch (e) {
      return null;
    }
  }
  return null;
}

async function write(data, key = DEFAULT_KEY) {
  const body = JSON.stringify(data);
  if (hasBlob()) {
    const { put } = require('@vercel/blob');
    await put(key, body, {
      access: access(),
      allowOverwrite: true,
      addRandomSuffix: false,
      contentType: 'application/json',
    });
    return;
  }
  if (!process.env.VERCEL) {
    await fs.mkdir(path.dirname(localFile(key)), { recursive: true });
    await fs.writeFile(localFile(key), body);
    return;
  }
  throw new Error('Storage is not set up. Create a Vercel Blob store and connect it to this project (see README, step 4).');
}

module.exports = { read, write };
