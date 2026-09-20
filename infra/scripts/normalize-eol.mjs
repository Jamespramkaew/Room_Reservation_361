// แปลง CRLF -> LF ให้สคริปต์ bash ก่อนรัน
//
// Git for Windows ตั้ง core.autocrlf=true มาให้ตั้งแต่ติดตั้ง ใครที่ clone ด้วย Git
// ฝั่ง Windows แล้วมารันผ่าน WSL จะได้ไฟล์ CRLF ซึ่ง bash อ่าน shebang ไม่ออก
// (`$'\r': command not found`) .gitattributes กันได้เฉพาะ clone ใหม่ ส่วน clone
// ที่มีอยู่ก่อนแล้วต้องอาศัยไฟล์นี้ซ่อมให้ตอนรัน
//
// ผลลัพธ์ตรงกับที่เก็บใน git index อยู่แล้ว (LF) จึงไม่ทำให้ git status สกปรก

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const fixed = [];

for (const name of readdirSync(dir)) {
  if (!name.endsWith('.sh')) continue;

  const path = join(dir, name);
  const text = readFileSync(path, 'utf8');
  if (!text.includes('\r')) continue;

  writeFileSync(path, text.replace(/\r\n/g, '\n').replace(/\r/g, '\n'), 'utf8');
  fixed.push(name);
}

if (fixed.length > 0) {
  console.log(`normalize-eol: แปลง CRLF -> LF ให้ ${fixed.join(', ')}`);
}
