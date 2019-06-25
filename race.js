var canvas = document.getElementById("div_canvas");
var ctx = canvas.getContext("2d");
var height = canvas.height;
var width = canvas.width;
var position = Math.floor(height/2);
var block = [];
var speed = 10;

var mainCharacter = new MainCharacter();

function Block(x, y, width, height){

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = "black"
    let selfBlock = this;


    // console.log('------------------------------------');
    // // console.log(self);
    // console.log('------------------------------------');

    this.drawBlock = function(){
        ctx.beginPath();
        ctx.fillRect(selfBlock.x, selfBlock.y, selfBlock.width, selfBlock.height);
        ctx.fillStyle = selfBlock.color;
        ctx.fill();
        ctx.closePath();
    }

    this.draw = function(){
        selfBlock.drawBlock();

        selfBlock.x += -2;
    }

}

function MainCharacter(){

    this.x = 0;
    this.y = Math.floor(height / 2);
    this.width = 100;
    this.height = 50;
    this.color = "black"
    let self = this;

    this.drawMainCharacter = function(){
        ctx.beginPath();
        ctx.fillRect(self.x, self.y, self.width, self.height);
        ctx.fillStyle = self.color;
        ctx.fill();
        ctx.closePath();
    }

    this.draw = function(){
        self.drawMainCharacter();
    }

    this.right = function(){
        if(self.x + self.width < width){
            self.x += 50;
        }
    }

    this.left = function(){
        if(self.x > 0){
            self.x += -50;
        }
    }

    this.down = function(){
        if(self.y + self.height < height){
            self.y += 50;
        }
    }

    this.up = function(){
        if(self.y > 0){
            self.y += -50;
        }
    }
}

function animation(){

    ctx.clearRect(0, 0, width, height);
    mainCharacter.draw();
    for(let i = 0; i < block.length; i++){
        block[i].draw();
        // console.log(i);
    }
    // block.shift();

}

function animationShowBlock(){
    console.log("hello");
    let timeId = setInterval(function(){
        let random = 50 * getRandomInt(1, 9);
        block.push(new Block(width,random, 100, 50));
        console.log(block);
    }, 5000);

    setInterval(animation, speed);
    
    console.log('------------------------------------');
    console.log(block);
    console.log('------------------------------------');
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function changeDirection(e){
    console.log("hello");
    if(e.keyCode == 37 ){
        mainCharacter.left();
    }
    if(e.keyCode == 38){
        mainCharacter.up();
    }
    if(e.keyCode == 39){
        mainCharacter.right();
    }
    if(e.keyCode == 40){
        mainCharacter.down();
    }

}

window.onload = () => {

    document.addEventListener("keydown", changeDirection);
    animationShowBlock();

}