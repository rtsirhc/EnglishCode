import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';

const PORT = 5174;
const HOST = '0.0.0.0';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');

const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.svg', 'image/svg+xml'],
  ['.mp4', 'video/mp4'],
  ['.mp3', 'audio/mpeg'],
  ['.wav', 'audio/wav'],
  ['.ttf', 'font/ttf'],
  ['.otf', 'font/otf'],
  ['.ico', 'image/x-icon'],
]);

function safeFilePath(urlPath) {
  const decodedPath = decodeURIComponent(urlPath.split('?')[0]);
  const requestedPath = path.normalize(decodedPath).replace(/^(\.\.[/\\])+/, '');
  let filePath = path.join(root, requestedPath);

  if (!filePath.startsWith(root)) {
    filePath = path.join(root, 'index.html');
  }

  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!existsSync(filePath)) {
    filePath = path.join(root, 'index.html');
  }

  return filePath;
}

function localUrls() {
  const urls = ['http://localhost:5174/'];
  const interfaces = os.networkInterfaces();

  Object.values(interfaces)
    .flat()
    .filter(Boolean)
    .filter((address) => address.family === 'IPv4' && !address.internal)
    .forEach((address) => urls.push(`http://${address.address}:5174/`));

  return urls;
}

const server = http.createServer((req, res) => {
  const filePath = safeFilePath(req.url ?? '/');
  const ext = path.extname(filePath).toLowerCase();
  res.setHeader('Content-Type', mimeTypes.get(ext) ?? 'application/octet-stream');
  res.setHeader('Cache-Control', 'no-store');
  createReadStream(filePath)
    .on('error', () => {
      res.writeHead(500);
      res.end('Could not load game file.');
    })
    .pipe(res);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log('');
    console.log('The game already seems to be running on port 5174.');
    console.log('Open: http://localhost:5174/');
    console.log('');
    openBrowser();
    return;
  }
  console.error(error);
  process.exitCode = 1;
});

server.listen(PORT, HOST, () => {
  console.log('');
  console.log('English World Cup is running.');
  console.log('');
  console.log('Open on this laptop:');
  console.log('  http://localhost:5174/');
  console.log('');
  console.log('Open from another device on the same Wi-Fi:');
  localUrls().slice(1).forEach((url) => console.log(`  ${url}`));
  console.log('');
  console.log('Keep this window open while playing.');
  console.log('');
  openBrowser();
});

function openBrowser() {
  if (process.platform !== 'darwin') return;
  setTimeout(() => {
    execFile('open', ['http://localhost:5174/'], () => undefined);
  }, 500);
}
