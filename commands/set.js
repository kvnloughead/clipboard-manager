import fs from 'fs';
import clipboard from 'clipboardy';

function set({ configFile, key, clipsFile }) {
  const data = JSON.parse(fs.readFileSync(clipsFile));
  data[key] = clipboard.readSync();
  fs.writeFileSync(clipsFile, JSON.stringify(data, null, 2));
}

export default set;
