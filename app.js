let g = null;

var config = { 'iceServers': [] };
var peer = new RTCPeerConnection(config);

var me;
var other;

var channel;

peer.ondatachannel = function (e) {
  channel = e.channel
  channel.onopen = e => console.log('CHANNEL OPENED', e);
  channel.onclose = e => console.log('CHANNEDL CLOSED', e);
  channel.onmessage = e => keepMessage(e);
}

peer.onicecandidate = function (e) {
  if (!e.candidate) return;
  console.log('GOT ICE CANDIDATE', e);
  ws.send(JSON.stringify({
    action: 'candidate',
    to: other,
    data: e.candidate
  }));
}

var ws = new WebSocket('ws://localhost:8088');
ws.onopen = e => console.log('WEBSOCKET OPENED');
ws.onclose = e => console.log('WEBSOCKET CLOSED');
ws.onmessage = e => {
  console.log('WEBSOCKET MESSAGE', e.data);
  var data = JSON.parse(e.data);
  if (data.to === me) {
    switch (data.action) {
      case 'candidate':
        peer.addIceCandidate(new RTCIceCandidate(data.data))
          .then(() => console.log('ADDED ICE CANDIDATE'))
          .catch(e => console.log('ADD ICE ERROR', e));
        break;
      case 'offer':
        peer.setRemoteDescription(new RTCSessionDescription(data.data))
          .then(() => peer.createAnswer())
          .then(sdp => {
            ws.send(JSON.stringify({
              action: 'answer',
              to: other,
              data: sdp
            }));
            peer.setLocalDescription(sdp);
          })
          .then(() => console.log('OFFER HANDLED'))
          .catch(e => console.log('ERROR HANDLING OFFER', e));
        break;
      case 'answer':
        peer.setRemoteDescription(new RTCSessionDescription(data.data))
          .then(() => console.log('ANSWER HANDLED'))
          .catch(e => console.log('ERROR HANDLING ANSWER', e));
        break;
    }
  }
}

function connect () {
  channel = peer.createDataChannel('main-channel');
  channel.onopen = e => console.log('CHANNEL OPENED', e);
  channel.onclose = e => console.log('CHANNEL CLOSED', e);
  channel.onmessage = e => keepMessage(e);

  peer.createOffer()
    .then(sdp => {
      peer.setLocalDescription(sdp);
      ws.send(JSON.stringify({
        action: 'offer',
        to: other,
        data: sdp
      }));
    })
    .catch(e => console.log('ERROR CREATING AND SENDING OFFER', e));
}

function sendMessage(message) {
  channel.send(message);
}

function keepMessage(message) {
  if(g == null) {
    g = new Game(document.getElementById("div_canvas"), document.getElementById("score_value"), document.getElementById("dificulty_value"), document.getElementById("complexity_value"));
    g.startGame();
  } else {
    switch(message.data) {
      case "controller-left": g.left();
          break;
      case "controller-right": g.right();
          break;
      case "controller-up": g.up();
          break;
      case "controller-down": g.down();
          break;
      case "controller-restart": restart();
          break;
      case "controller-complexity": g.toggleComplexity();
          break;
      case "game-complexity-easy": document.getElementById('complexity-btn').innerHTML = "💚";
          break;
      case "game-complexity-hard": document.getElementById('complexity-btn').innerHTML = "😡";
          break;
      }
  }
}

function startAsGame() {
  document.getElementById('start-div').style.display = "none";
  document.getElementById('game-div').style.display = "block";

  me = "game";
  other = "controller";

  console.log("STARTED AS GAME");
}

function startAsController() {
  document.getElementById('start-div').style.display = "none";
  document.getElementById('controller-div').style.display = "block";

  me = "controller";
  other = "game";

  console.log("STARTED AS CONTROLLER");

	document.onkeydown = checkKey;

  connect();
}

function checkKey(e) {
  e = e || window.event;

  if (e.keyCode == '38') {
    sendMessage('controller-up');
  } else if (e.keyCode == '40') {
    sendMessage('controller-down');
  } else if (e.keyCode == '37') {
    sendMessage('controller-left');
  } else if (e.keyCode == '39') {
    sendMessage('controller-right');
  } else if (e.keyCode == '13') {
    sendMessage('controller-restart');
  } else if (e.keyCode == '32') {
    sendMessage('controller-complexity');
  }
}

document.onkeydown = checkKey;

/*
.##.....##....###....########..########.....########..##........#######...######..##....##
.##.....##...##.##...##.....##.##.....##....##.....##.##.......##.....##.##....##.##...##.
.##.....##..##...##..##.....##.##.....##....##.....##.##.......##.....##.##.......##..##..
.#########.##.....##.########..##.....##....########..##.......##.....##.##.......#####...
.##.....##.#########.##...##...##.....##....##.....##.##.......##.....##.##.......##..##..
.##.....##.##.....##.##....##..##.....##....##.....##.##.......##.....##.##....##.##...##.
.##.....##.##.....##.##.....##.########.....########..########..#######...######..##....##
*/

function HardBlock(x1, y1, width1, height1, game, targetY) {
  let x = x1;
  let y = y1;
  let width = width1;
  let height = height1;

  this.getWidth = function() {
      return width;
  }

  this.getHeight = function() {
      return height;
  }

  this.getX = function() {
      return x;
  }

  this.getY = function() {
      return y;
  }

  this.draw = function() {
      x -= game.getDificulty();
      
      if(y > targetY) {
          y--;
      }
      if(y < targetY) {
          y++;
      }

      game.getCtx().beginPath();
      game.getCtx().fillStyle = "rgb(240, 58, 23)";
      game.getCtx().fillRect(x, y, width, height);
      game.getCtx().closePath();
  }
}

/*
.########....###.....######..##....##....########..##........#######...######..##....##
.##.........##.##...##....##..##..##.....##.....##.##.......##.....##.##....##.##...##.
.##........##...##..##.........####......##.....##.##.......##.....##.##.......##..##..
.######...##.....##..######.....##.......########..##.......##.....##.##.......#####...
.##.......#########.......##....##.......##.....##.##.......##.....##.##.......##..##..
.##.......##.....##.##....##....##.......##.....##.##.......##.....##.##....##.##...##.
.########.##.....##..######.....##.......########..########..#######...######..##....##
*/

function EasyBlock(x1, y1, width1, height1, game) {
  let x = x1;
  let y = y1;
  let width = width1;
  let height = height1;

  this.getWidth = function() {
      return width;
  }

  this.getHeight = function() {
      return height;
  }

  this.getX = function() {
      return x;
  }

  this.getY = function() {
      return y;
  }

  this.draw = function() {
      x -= game.getDificulty();

      game.getCtx().beginPath();
      game.getCtx().fillStyle = "rgb(0, 0, 0)";
      game.getCtx().fillRect(x, y, width, height);
      game.getCtx().closePath();
  }
}

/*
.##.....##....###....####.##....##.....######..##.....##....###....########.
.###...###...##.##....##..###...##....##....##.##.....##...##.##...##.....##
.####.####..##...##...##..####..##....##.......##.....##..##...##..##.....##
.##.###.##.##.....##..##..##.##.##....##.......#########.##.....##.########.
.##.....##.#########..##..##..####....##.......##.....##.#########.##...##..
.##.....##.##.....##..##..##...###....##....##.##.....##.##.....##.##....##.
.##.....##.##.....##.####.##....##.....######..##.....##.##.....##.##.....##
*/

function MainCharacter(game) {
  let x = 0;
  let y = Math.floor(game.getCanvasHeight() / 2);
  let width = 100;
  let height = 50;
  let targetX = x;
  let targetY = y;

  this.getWidth = function() {
      return width;
  }

  this.getHeight = function() {
      return height;
  }

  this.getX = function() {
      return x;
  }

  this.getY = function() {
      return y;
  }

  this.getTargetY = function() {
      return targetY;
  }
  
  this.draw = function() {
      if(x < targetX) {
          x += 10;
      }
      if(x > targetX) {
          x -= 10;
      }
      if(y < targetY) {
          y += 10;
      }
      if(y > targetY) {
          y -= 10;
      }

      game.getCtx().beginPath();
      game.getCtx().fillStyle = "rgb(22, 198, 12)";;
      game.getCtx().fillRect(x, y, width, height);
      game.getCtx().closePath();
  }

  this.right = function() {
      if(targetX + width < game.getCanvasWidth()) {
          targetX += 50;
      }
  }

  this.left = function() {
      if(targetX > 0) {
          targetX += -50;
      }
  }

  this.down = function() {
      if(targetY + height < game.getCanvasHeight()) {
          targetY += 50;
      }
  }

  this.up = function() {
      if(targetY > 0) {
          targetY += -50;
      }
  }
}

/*
..######......###....##.....##.########
.##....##....##.##...###...###.##......
.##.........##...##..####.####.##......
.##...####.##.....##.##.###.##.######..
.##....##..#########.##.....##.##......
.##....##..##.....##.##.....##.##......
..######...##.....##.##.....##.########
*/

function Game(canvas, scoreText, dificultyText, complexityText) {
  let ctx = canvas.getContext("2d");
  let height = canvas.height;
  let width = canvas.width;
  let play = true;
  let easyComplexity = true;
  let blocks = [];
  let score = 0;
  let dificulty = 1;
  let self = this;
  let mainCharacter = null;
  let timer = Date.now();

  this.toggleComplexity = function() {
      if(easyComplexity) {
          easyComplexity = false;
          complexityText.innerHTML = "😡 Hard";
          sendMessage('game-complexity-hard')
      } else {
          easyComplexity = true;
          complexityText.innerHTML = "💚 Easy";
          sendMessage('game-complexity-easy')
      }
  }

  this.left = function() {
      mainCharacter.left();
  }

  this.right = function() {
      mainCharacter.right();
  }

  this.up = function() {
      mainCharacter.up();
  }

  this.down = function() {
      mainCharacter.down();
  }

  this.getCtx = function() {
      return ctx;
  }

  this.getCanvasHeight = function() {
      return height;
  }

  this.getCanvasWidth = function() {
      return width;
  }

  this.getDificulty = function() {
      return dificulty;
  }

  let loop = function() {
      if(play) {
          ctx.fillStyle = "rgb(255, 255, 255)";
          ctx.fillRect(0, 0, width, height);
          mainCharacter.draw();
          for(let i = 0; i < blocks.length; i++) { 
              if(blocks[i].getX() + blocks[i].getWidth() < 0) {
                  blocks.splice(i, 1);
              } else {
                  if(blocks[i].getY() == mainCharacter.getY()) {
                      if(blocks[i].getX() < mainCharacter.getX() + mainCharacter.getWidth() && blocks[i].getX() + blocks[i].getWidth() > mainCharacter.getX()) {
                          play = false;
                      }
                  }
                  blocks[i].draw();
              }                            
          }
          score++;
          scoreText.innerHTML = "💯 " + score;

          dificulty += 0.0025;
          dificultyText.innerHTML = "⚡ x" + Math.round(dificulty * 100) / 100;

          if(Date.now() - timer > 5000 * (1 / dificulty)) {
              timer = Date.now();
              if(easyComplexity) {
                  createEasyBlock();
              } else {
                  createHardBlock();
              }
          }
      } else {
          scoreText.innerHTML = "💥 " + score; 
                  
          ctx.fillStyle = "rgb(240, 58, 23)";
          ctx.fillRect(0, 0, width, height);
      }

      window.requestAnimationFrame(loop);
  }

  let createEasyBlock = function() {
      let random = 50 * getRandomInt(1, 6);
      blocks.push(new EasyBlock(width, random, 100, 50, self));
  }

  let createHardBlock = function() {
      let random = 50 * getRandomInt(1, 6);
      blocks.push(new HardBlock(width, random, 100, 50, self, mainCharacter.getTargetY()));
  }

  this.startGame = function() {
      mainCharacter = new MainCharacter(self);

      window.requestAnimationFrame(loop);
  }
}   

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function restart() {
  g = new Game(document.getElementById("div_canvas"), document.getElementById("score_value"), document.getElementById("dificulty_value"), document.getElementById("complexity_value"));
  g.startGame();
}