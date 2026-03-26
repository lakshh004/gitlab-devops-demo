const http = require('http');

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>gitlab-devops-demo</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: monospace; background: #0a0a0a; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; }
    .card { background: #111; border: 1px solid #222; border-radius: 12px; width: 100%; max-width: 480px; overflow: hidden; }
    .top { background: #0f0f0f; padding: 1.5rem 2rem; border-bottom: 1px solid #222; }
    .dots { display: flex; gap: 6px; margin-bottom: 1.2rem; }
    .dot { width: 12px; height: 12px; border-radius: 50%; }
    .label { font-size: 11px; color: #555; letter-spacing: 2px; text-transform: uppercase; }
    .name { font-size: 26px; font-weight: 500; color: #fff; margin-top: 4px; letter-spacing: -0.5px; }
    .badge { display: inline-block; font-size: 11px; padding: 3px 10px; border-radius: 20px; background: #0d1f17; color: #3dd68c; border: 1px solid #1a4a2e; margin-top: 10px; }
    .body { padding: 0 2rem; }
    .row { display: flex; align-items: center; gap: 12px; padding: 13px 0; border-bottom: 1px solid #1a1a1a; }
    .row:last-child { border-bottom: none; }
    .key { font-size: 11px; color: #444; text-transform: uppercase; letter-spacing: 0.5px; width: 80px; flex-shrink: 0; }
    .val { font-size: 13px; color: #ccc; }
    .green-dot { width: 7px; height: 7px; border-radius: 50%; background: #3dd68c; flex-shrink: 0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="top">
      <div class="dots">
        <div class="dot" style="background:#ff5f57"></div>
        <div class="dot" style="background:#ffbd2e"></div>
        <div class="dot" style="background:#28c840"></div>
      </div>
      <div class="label">DevOps Project</div>
      <div class="name">gitlab-devops-demo</div>
      <div class="badge">&#9679; live</div>
    </div>
    <div class="body">
      <div class="row"><span class="key">version</span><span class="val">v2.0.0</span></div>
      <div class="row"><span class="key">status</span><div class="green-dot"></div><span class="val">running</span></div>
      <div class="row"><span class="key">pipeline</span><span class="val">GitLab CI/CD</span></div>
      <div class="row"><span class="key">runner</span><span class="val">ec2-runner &middot; self-hosted</span></div>
      <div class="row"><span class="key">deploy</span><span class="val">Docker &middot; commit SHA</span></div>
    </div>
  </div>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy' }));
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }
});

throw new Error("Intentional crash for rollback test");