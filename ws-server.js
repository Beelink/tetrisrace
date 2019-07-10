var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ host:'0.0.0.0', port: 8088 });

var wsList = [];

wss.on('connection', function (ws) { 
  console.log('WS CONNECTION ESTABLISHED');
  wsList.push(ws);

  ws.on('close', function () { 
    wsList.splice(wsList.indexOf(ws), 1);
    console.log('WS CLOSED');
  });

  ws.on('message', function (message) { 
    console.log('GOT WS MESSAGE: ' + message);
    wsList.forEach(function (ws) { 
      ws.send(message);
    });
  });
});

