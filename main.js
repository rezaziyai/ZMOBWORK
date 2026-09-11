const { app, BrowserWindow, ipcMain, shell, safeStorage } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const crypto = require('crypto');

const AUTH_FILE = path.join(app.getPath('userData'), 'google-drive-auth.dat');
const DRIVE_NAME = 'zmobwork-backup.json';
let oauthServer = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 1440, height: 900, minWidth: 1100, minHeight: 700,
    backgroundColor: '#f6f9fc',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true }
  });
  win.loadFile('index.html');
}

function protect(text) {
  if (!safeStorage.isEncryptionAvailable()) return text;
  return safeStorage.encryptString(text).toString('base64');
}
function unprotect(text) {
  if (!safeStorage.isEncryptionAvailable()) return text;
  try { return safeStorage.decryptString(Buffer.from(text, 'base64')); } catch { return ''; }
}
function loadAuth() {
  try { return JSON.parse(unprotect(fs.readFileSync(AUTH_FILE, 'utf8'))); } catch { return null; }
}
function saveAuth(data) { fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true }); fs.writeFileSync(AUTH_FILE, protect(JSON.stringify(data))); }
function clearAuth() { try { fs.unlinkSync(AUTH_FILE); } catch {} }

async function tokenRequest(params) {
  const body = new URLSearchParams(params);
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error_description || data.error || 'خطا در دریافت توکن گوگل');
  return data;
}

async function refreshAccess(auth) {
  if (auth.access_token && auth.expires_at && Date.now() < auth.expires_at - 60000) return auth.access_token;
  if (!auth.refresh_token || !auth.clientId) throw new Error('اتصال Google Drive معتبر نیست.');
  const data = await tokenRequest({ client_id: auth.clientId, client_secret: auth.clientSecret || '', refresh_token: auth.refresh_token, grant_type: 'refresh_token' });
  auth.access_token = data.access_token;
  auth.expires_at = Date.now() + Number(data.expires_in || 3600) * 1000;
  saveAuth(auth);
  return auth.access_token;
}

function createAuthServer(clientId, clientSecret) {
  return new Promise((resolve, reject) => {
    oauthServer = http.createServer(async (req, res) => {
      try {
        const u = new URL(req.url, 'http://127.0.0.1');
        if (u.pathname !== '/oauth2callback' || !u.searchParams.get('code')) { res.end('ZMOBWORK OAuth'); return; }
        const code = u.searchParams.get('code');
        const port = oauthServer.address().port;
        const redirectUri = `http://127.0.0.1:${port}/oauth2callback`;
        const data = await tokenRequest({ code, client_id: clientId, client_secret: clientSecret || '', redirect_uri: redirectUri, grant_type: 'authorization_code' });
        saveAuth({ clientId, clientSecret: clientSecret || '', refresh_token: data.refresh_token || loadAuth()?.refresh_token || '', access_token: data.access_token, expires_at: Date.now() + Number(data.expires_in || 3600) * 1000 });
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h2>اتصال ZMOBWORK به Google Drive انجام شد.</h2><p>این پنجره را ببندید و به برنامه برگردید.</p>');
        const auth = loadAuth();
        oauthServer.close(() => { oauthServer = null; resolve(auth); });
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end(e.message || 'OAuth error');
        if (oauthServer) oauthServer.close(() => { oauthServer = null; reject(e); });
      }
    });
    oauthServer.on('error', reject);
    oauthServer.listen(0, '127.0.0.1');
  });
}

async function googleAuth(clientId, clientSecret) {
  if (!clientId) throw new Error('Client ID گوگل وارد نشده است.');
  if (oauthServer) throw new Error('یک ورود گوگل دیگر در حال انجام است.');
  const serverPromise = createAuthServer(clientId.trim(), String(clientSecret || '').trim());
  await new Promise(r => oauthServer.once('listening', r));
  const port = oauthServer.address().port;
  const redirectUri = `http://127.0.0.1:${port}/oauth2callback`;
  const state = crypto.randomBytes(16).toString('hex');
  const params = new URLSearchParams({ client_id: clientId.trim(), redirect_uri: redirectUri, response_type: 'code', access_type: 'offline', prompt: 'consent', scope: 'https://www.googleapis.com/auth/drive.appdata', state });
  await shell.openExternal('https://accounts.google.com/o/oauth2/v2/auth?' + params.toString());
  return await serverPromise;
}
async function driveRequest(method, url, token, body) {
  const options = { method, headers: { Authorization: `Bearer ${token}` } };
  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json'; options.body = JSON.stringify(body);
  }
  const r = await fetch(url, options); const text = await r.text();
  let data = {}; try { data = text ? JSON.parse(text) : {}; } catch {}
  if (!r.ok) throw new Error(data.error?.message || `Google Drive error ${r.status}`);
  return data;
}

async function findBackup(auth, token) {
  const q = `name = '${DRIVE_NAME}' and trashed = false`;
  const data = await driveRequest('GET', 'https://www.googleapis.com/drive/v3/files?' + new URLSearchParams({ q, spaces: 'appDataFolder', fields: 'files(id,name,modifiedTime,size)' }), token);
  return data.files?.[0] || null;
}

async function readBackup(auth, token, fileId) {
  return await driveRequest('GET', `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, token);
}

async function writeBackup(auth, token, payload, existing) {
  const metadata = { name: DRIVE_NAME, description: 'ZMOBWORK automatic backup' };
  let url = 'https://www.googleapis.com/drive/v3/files';
  let method = 'POST';
  let body = metadata;
  if (!existing) metadata.parents = ['appDataFolder'];
  if (existing) { url += '/' + existing.id; method = 'PATCH'; }
  const options = { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
  const boundary = '-------zmobwork' + crypto.randomBytes(8).toString('hex');
  options.headers['Content-Type'] = `multipart/related; boundary=${boundary}`;
  const content = Buffer.from(JSON.stringify(payload), 'utf8').toString('utf8');
  options.body = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${content}\r\n--${boundary}--`;
  const r = await fetch(url + '?' + new URLSearchParams({ uploadType: 'multipart' }), options);
  const text = await r.text(); let data = {}; try { data = JSON.parse(text); } catch {}
  if (!r.ok) throw new Error(data.error?.message || `خطا در آپلود بکاپ (${r.status})`);
  return data;
}

async function syncDrive(payload) {
  const auth = loadAuth(); if (!auth?.refresh_token) throw new Error('Google Drive متصل نیست.');
  const token = await refreshAccess(auth);
  const existing = await findBackup(auth, token);
  if (!existing) { await writeBackup(auth, token, payload, null); return { mode: 'uploaded', changedAt: payload.changedAt }; }
  const remote = await readBackup(auth, token, existing.id);
  const remoteChanged = Date.parse(remote.changedAt || existing.modifiedTime || 0) || 0;
  const localChanged = Date.parse(payload.changedAt || 0) || 0;
  if (remoteChanged > localChanged) return { mode: 'downloaded', data: remote, remoteChanged };
  if (localChanged > remoteChanged) { await writeBackup(auth, token, payload, existing); return { mode: 'uploaded', changedAt: payload.changedAt }; }
  return { mode: 'none', changedAt: payload.changedAt };
}

app.whenReady().then(() => {
  ipcMain.handle('app-version', () => app.getVersion());
  ipcMain.handle('drive-status', () => {
    const a = loadAuth(); return { connected: !!a?.refresh_token };
  });
  ipcMain.handle('drive-auth', async (_event, { clientId, clientSecret }) => {
    try { await googleAuth(clientId, clientSecret); return { ok: true }; }
    catch (e) { return { ok: false, error: e.message || String(e) }; }
  });
  ipcMain.handle('drive-sync', async (_event, payload) => {
    try { return { ok: true, ...(await syncDrive(payload)) }; }
    catch (e) { return { ok: false, error: e.message || String(e) }; }
  });
  ipcMain.handle('drive-signout', () => { clearAuth(); return { ok: true }; });
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
