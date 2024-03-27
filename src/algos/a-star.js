function clearCanvas(){
    c.clearRect(0, 0, canvas.width, canvas.height );
}
//TODO: смотри видео отчет за 27.03
var width = 37;
var height = 28;
var squareSize = 30;

var canvas = document.getElementById('a-starCanvas');
var c = canvas.getContext('2d');

function submitTriggered(){
    var errorMessage = document.getElementById('WrongInputError');

    var widthEl = document.getElementById('aStarWidth');
    var heightEl = document.getElementById('aStarHeight');
    var squareSizeEl = document.getElementById('aStarSquareSize');

    if (widthEl.value){
        width = parseInt(widthEl.value);
    }
    else{
        width = 37;
    }
    if (heightEl.value){
        height = parseInt(heightEl.value);
    }
    else{
        width = 37;
    }
    if (squareSizeEl.value){
        squareSize = parseInt(squareSizeEl.value);
    }
    else{
        squareSize = 30;
    }

    if (width < 0 || height < 0 || squareSize < 0){
        //TODO сообщение не пропадает при повторном вводе
        errorMessage.innerHTML = "Input is incorrect.";
        return;
    }
    else{
        canvas.width = width * squareSize;
        canvas.height = height * squareSize;
        fillCanvasWithRects();
    }


}

// function lineCanvas(){
//     clearCanvas();
//     c.beginPath();
//     c.strokeStyle = "#566573";
//     for (var i = squareSize; i < squareSize * width; i+=squareSize){
//         c.moveTo(i, 0);
//         c.lineTo(i, height * squareSize);
//     }
//     for (var i = squareSize; i < squareSize * height; i+=squareSize){
//         c.moveTo(0, i);
//         c.lineTo(width * squareSize, i);
//     }
   
//     c.stroke();
// }

function Cell(x, y, squareSize){
    this.x = x;
    this.y = y;
    this.Size = squareSize;

    this.draw = function(){
        c.beginPath();
        c.rect(x, y, squareSize, squareSize);
        c.fillStyle = '#F8F9F9';
        c.fill();
        c.lineWidth = 0.3;
        c.strokeStyle = "#17202A";
        c.stroke();
    }

    this.changeState = function(){
        c.clearRect(x, y, squareSize, squareSize);
        c.beginPath();
        c.rect(x, y, squareSize, squareSize);
        c.fillStyle = '#A6ACAF';
        c.fill();
        c.lineWidth = 0.3;
        c.strokeStyle = "#17202A";
        c.stroke();
    }
}
var matrix = [];
function fillCanvasWithRects(){
    clearCanvas();
    var row = 0;
    var column = 0;
    for (var i = 0; i <= canvas.width - squareSize; i += squareSize){
        column = 0;
        matrix[row] = [];
        for(var j = 0; j <= canvas.height - squareSize; j += squareSize){
            var cell = new Cell(i, j, squareSize, squareSize);
            matrix[row][column] = cell;
            cell.draw();
            column += 1;
        }
        row += 1;
    }
}

const mouse = 

canvas.width = 37 * squareSize;
canvas.height = 28 * squareSize;

//lineCanvas();
fillCanvasWithRects();

var resSubBtn = document.getElementById('resolutionSubmitButton');
resSubBtn.addEventListener('click', submitTriggered);

var drag = false;

function mouseUp(){
    drag = false;
}

function mouseDown(){
    drag = true;
}

window.addEventListener('mouseup', mouseUp);

window.addEventListener('mousedown', mouseDown);

canvas.addEventListener('mousemove',function(event){
    if (drag == true){
        var x = parseInt((event.offsetX / squareSize + 0.5).toFixed());
        var y = parseInt((event.offsetY / squareSize + 0.5).toFixed());
        console.log(event);
        matrix[x-1][y-1].changeState();
    }
    
})

// var x = parseInt((event.offsetX / squareSize + 0.5).toFixed());
//     var y = parseInt((event.offsetY / squareSize + 0.5).toFixed());
//     console.log(event);
//     matrix[x-1][y-1].changeState();

console.log((6.6).toFixed());

console.log("test");