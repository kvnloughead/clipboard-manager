import fs from 'fs';

function set({ file, key, content }) {
  const data = JSON.parse(fs.readFileSync(file));
  data[key] = content;
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

export default set;
