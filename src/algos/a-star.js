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

function Cell(x, y, squareSize, squareSize, type){
    this.x = x;
    this.y = y;
    this.type = type;
    this.size = squareSize;
    this.wall = false;

    const types = new Map();
    types.set("space", '#F8F9F9');
    types.set("wall", '#A6ACAF');
    types.set("start", '#27FF00');
    types.set("finish", '#FF0000');

    this.draw = function(){
        c.beginPath();
        c.rect(x, y, squareSize, squareSize);
        c.fillStyle = types.get(this.type);
        c.fill();
        c.lineWidth = 0.3;
        c.strokeStyle = "#17202A";
        c.stroke();
    }

    this.turnWall = function(){
        this.changeType("wall");
        this.draw();

    }

    this.turnSpace = function(){
        this.changeType("space");
        this.draw();
    }

    this.changeState = function(){
        if (this.type == "space"){
            this.turnWall();
        }
        else{
            this.turnSpace();
        }
    }

    this.changeType = function(type) {
        this.type = type;
        this.draw();
        if (this.type == "start"){
            //TODO Do something
        }
        if (temporaryStartCells.length > 1){
            //Do something
        }
        if (this.type == "finish"){
            //Do something
        }
        if (temporaryFinishCells.length > 1){
            //Do something
        }
        
        
    }

}
var matrix = [];
function fillCanvasWithRects(){
    clearCanvas();
    matrix = [];                                
    var row = 0;
    var column = 0;
    for (var i = 0; i <= canvas.width - squareSize; i += squareSize){
        column = 0;
        matrix[row] = [];
        for(var j = 0; j <= canvas.height - squareSize; j += squareSize){
            var cell = new Cell(i, j, squareSize, squareSize, "space");
            matrix[row][column] = cell;
            cell.draw();
            column += 1;
        }
        row += 1;
    }
    matrix[0][0].changeType("start");
    matrix[matrix.length - 1][matrix[matrix.length - 1].length - 1].changeType("finish");
}
//TODO make it so there are single start and finish cells on the canvas

var drag = false;//determines whether mouse being held pressed over the canvas
var dragType;

canvas.width = 37 * squareSize;
canvas.height = 28 * squareSize;

fillCanvasWithRects();

var resSubBtn = document.getElementById('resolutionSubmitButton');
resSubBtn.addEventListener('click', submitTriggered);

window.addEventListener('mouseup', function(){
    drag = false;
});

window.addEventListener('mousedown', function(event){
    var x = parseInt((event.offsetX / squareSize + 0.5).toFixed());
    var y = parseInt((event.offsetY / squareSize + 0.5).toFixed());
    dragType = matrix[x-1][y-1].type;
    drag = true;
});

canvas.addEventListener('mousemove',function(event){
    if (drag == true){
        var x = parseInt((event.offsetX / squareSize + 0.5).toFixed());
        var y = parseInt((event.offsetY / squareSize + 0.5).toFixed());
        if (dragType == "space" && matrix[x-1][y-1].type == "space"){
            matrix[x-1][y-1].changeType("wall");
        }
        else if (dragType == "wall" && matrix[x-1][y-1].type == "wall"){
            matrix[x-1][y-1].changeType("space");
        }
        else if (dragType == "start" && matrix[x-1][y-1].type == "space"){
            matrix[x-1][y-1].changeType("start");
        }
        else if (dragType == "finish" && matrix[x-1][y-1].type == "space"){
            matrix[x-1][y-1].changeType("finish");
        }
    }
})

console.log((6.6).toFixed());

console.log("test");