const express = require('express'),
  app = express(),
  fs = require('fs'),
  server = require('http').createServer(app),
  io = require('socket.io').listen(server),
  PORT = process.env.PORT = 8080;

// app.use(express.static('public'));

server.listen(PORT, () => {
  console.log('Server is running at: ', PORT);
});

app.get('/', function(req, res, next) {
  fs.readFile(__dirname + '/sender.html', function (err, data) {
    if (err) next();
    res.writeHead(200);
    res.end(data);
  });
});

app.get('/receiver', function(req, res, next) {
  fs.readFile(__dirname + '/receiver.html', function (err, data) {
    if (err) next();
    res.writeHead(200);
    res.end(data);
  });
});

io.sockets.on('connection', function (socket) {
  socket.on('Send', function (data){
      io.sockets.emit('Done', { 'Name': data['Name']});
  });
});
