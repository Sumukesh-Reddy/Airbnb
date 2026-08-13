/**
 * Render Backend Server Keepalive Script (Node.js)
 * Triggers every 5 minutes (300,000 ms) and prints "alive"
 *
 * Usage:
 *   node scripts/keepalive.js
 */

const https = require('https');

const SERVER_URL = 'https://airbnb-ojom.onrender.com/health';
const INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

function pingServer() {
  const startTime = Date.now();
  https
    .get(SERVER_URL, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const duration = Date.now() - startTime;
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [Status: ${res.statusCode}] Backend ping successful (${duration}ms) - alive`);
      });
    })
    .on('error', (err) => {
      console.error(`[${new Date().toISOString()}] Ping error: ${err.message}`);
    });
}

console.log(`🚀 Keepalive monitor started for: ${SERVER_URL}`);
console.log(`⏱️ Triggering ping every 5 minutes...`);

// Initial ping
pingServer();

// Repeat every 5 minutes
setInterval(pingServer, INTERVAL_MS);
