import fs from 'fs';
import clipboard from 'clipboardy';

const dataFile = '/home/kevin/Dropbox/cb/clips.json';

function set({ key }) {
  const data = JSON.parse(fs.readFileSync(dataFile));
  data[key] = clipboard.readSync();
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

export default set;
