import fs from 'fs';
import { exec } from 'node:child_process';
import path from 'path';

function set(args) {
  const { file, images, key, content } = args;
  exec(
    `xclip -selection clipboard -t image/png -o > ${path.join(
      images,
      key.toString() + '.png',
    )}`,
    (error, stdout, stderr) => {
      if (error || stderr || args.img) {
        const data = JSON.parse(fs.readFileSync(file));
        data[key] = content;
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
      } else {
        console.log(`success`);
      }
    },
  );
}

export default set;
