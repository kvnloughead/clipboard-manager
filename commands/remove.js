import fs from 'fs';

const dataFile = '/home/kevin/Dropbox/cb/clips.json';

function remove({ key }) {
  const data = JSON.parse(fs.readFileSync(dataFile));
  const val = data[key];
  delete data[key];
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
  console.log(
    `\nDeleted key value pair:\n  key: "${key}"\t  value: "${val}"\n`,
  );
}

export default remove;
