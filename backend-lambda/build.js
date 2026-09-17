import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// สร้างโฟลเดอร์ dist ถ้ายังไม่มี
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

console.log('🔨 Building Lambda function...');

esbuild.build({
  entryPoints: ['src/lambda.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile: 'dist/index.js',
  format: 'cjs',                    // Lambda ต้องใช้ CommonJS
  external: [],                     // Bundle ทุกอย่าง
  sourcemap: true,                  // สร้าง source map สำหรับ debug
  minify: false,                    // ไม่ minify เพื่อ debug ง่าย
  logLevel: 'info',
}).then(() => {
  console.log('✅ Build complete!');
  console.log('📦 Output: dist/index.js');
}).catch((error) => {
  console.error('❌ Build failed:', error);
  process.exit(1);
});
