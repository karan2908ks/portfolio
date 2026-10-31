// Where the edited site content lives.
//  - On Vercel: a Vercel Blob store (BLOB_READ_WRITE_TOKEN is added automatically
//    when you connect a Blob store to the project).
//  - Locally (npm run dev): a plain file at .data/site.json.
const fs = require('fs/promises');
const path = require('path');

const KEY = 'site.json';
const LOCAL_FILE = path.join(__dirname, '..', '..', '.data', 'site.json');

// Create the Blob store as "Private" (recommended). If you made a Public store,
// set BLOB_ACCESS=public in the project's environment variables.
const access = () => (process.env.BLOB_ACCESS === 'public' ? 'public' : 'private');
   const hasBlob = () => !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

async function read() {
  if (hasBlob()) {
    const { get } = require('@vercel/blob');
    try {
      const result = await get(KEY, { access: access(), useCache: false });
      if (!result || result.statusCode !== 200) return null;
      return JSON.parse(await new Response(result.stream).text());
    } catch (e) {
      if (e && e.name === 'BlobNotFoundError') return null;
      throw e;
    }
  }
  if (!process.env.VERCEL) {
    try {
      return JSON.parse(await fs.readFile(LOCAL_FILE, 'utf8'));
    } catch (e) {
      return null;
    }
  }
  return null;
}

async function write(data) {
  const body = JSON.stringify(data);
  if (hasBlob()) {
    const { put } = require('@vercel/blob');
    await put(KEY, body, {
      access: access(),
      allowOverwrite: true,
      addRandomSuffix: false,
      contentType: 'application/json',
    });
    return;
  }
  if (!process.env.VERCEL) {
    await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
    await fs.writeFile(LOCAL_FILE, body);
    return;
  }
  throw new Error('Storage is not set up. Create a Vercel Blob store and connect it to this project (see README, step 4).');
}

module.exports = { read, write };
