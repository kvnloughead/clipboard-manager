import fs from 'fs';
import clipboard from 'clipboardy';

function set({ file, key }) {
  const data = JSON.parse(fs.readFileSync(file));
  data[key] = clipboard.readSync();
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

export default set;
