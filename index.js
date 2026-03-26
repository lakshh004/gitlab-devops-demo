const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ status: 'healthy' }));
  } else {
    res.end("Version 3");
  }
});

server.listen(3000);