import { spawn } from 'child_process';

export function openFileInEditor(editor, file) {
  spawn(editor, [file], { stdio: 'inherit' });
}
