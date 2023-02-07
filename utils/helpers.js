import fs from 'fs';
import { spawn } from 'child_process';

export function openFileInEditor(editor, file) {
  spawn(editor, [file], { stdio: 'inherit' });
}

export function parseJSON(file) {
  return JSON.parse(fs.readFileSync(file));
}
