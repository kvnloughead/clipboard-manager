import fs from 'fs';

const clipsPath = '/home/kevin/Dropbox/cb/clips.json';

function remove({ key }) {
  const data = JSON.parse(fs.readFileSync(clipsPath));
  const val = data[key];
  delete data[key];
  fs.writeFileSync(clipsPath, JSON.stringify(data, null, 2));
  console.log(
    `\nDeleted key value pair:\n  key: "${key}"\t  value: "${val}"\n`,
  );
}

export default remove;
