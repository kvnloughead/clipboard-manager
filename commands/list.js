import fs from 'fs';

function list({ clipsPath }) {
  const terminalWidth = process.stdout.columns;
  const data = JSON.parse(fs.readFileSync(clipsPath));
  const columns = Object.fromEntries(
    Object.entries(data).map(([k, v], i) => {
      let newVal = v.trim();
      if (newVal.length > terminalWidth / 2) {
        newVal = newVal.substring(0, terminalWidth / 2) + '...';
      }
      return [k, newVal];
    }),
  );
  console.table(columns);
}

export default list;
