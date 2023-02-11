import fs from 'fs';

function remove({ key, file }) {
  const data = JSON.parse(fs.readFileSync(file));
  const val = data[key];
  delete data[key];
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  console.log(
    `\nDeleted key value pair:\n  key: "${String(
      key,
    ).trim()}"\n  value: "${val.trim()}"\n`,
  );
}

export default remove;
