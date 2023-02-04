import { spawn } from 'child_process';

export function openFile(editor, file) {
  spawn(editor, [file], { stdio: 'inherit' });
}
