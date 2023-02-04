import fs from 'fs';

const clipsFile = '/home/kevin/Dropbox/cb/clips.json';

function remove({ key }) {
  const data = JSON.parse(fs.readFileSync(clipsFile));
  const val = data[key];
  delete data[key];
  fs.writeFileSync(clipsFile, JSON.stringify(data, null, 2));
  console.log(
    `\nDeleted key value pair:\n  key: "${key}"\t  value: "${val}"\n`,
  );
}

export default remove;
