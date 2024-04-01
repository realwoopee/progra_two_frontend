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

function dull(){

}

function Cell(x, y, squareSize, squareSize, type){
    this.x = x;
    this.y = y;
    this.xIndex;
    this.yIndex;
    this.type = type;
    this.size = squareSize;
    this.wall = false;
    this.startDistance;
    this.finishDistance;
    this.overallDistance;

    const types = new Map();
    types.set("space", '#F8F9F9');
    types.set("wall", '#A6ACAF');
    types.set("start", '#27FF00');
    types.set("finish", '#FF0000');
    types.set("routeOpened", '#FFEB3F');
    types.set("routeClosed", '#7DFF79');
    types.set("routeIncluded", '#009BFF');

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


    this.changeType = function(type) {
        this.type = type;
        this.draw();
        // if (this.type == "start"){
        //     //TODO Do something
        // }
        // if (temporaryStartCells.length > 1){
        //     //Do something
        // }
        // if (this.type == "finish"){
        //     //Do something
        // }
        // if (temporaryFinishCells.length > 1){
        //     //Do something
        // }
        
        
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
            cell.xIndex = row;
            cell.yIndex = column;
            cell.draw();
            column += 1;
        }
        row += 1;
    }
    matrix[Math.round(matrix.length / 3)][Math.round(matrix[0].length / 2)].changeType("start");
    matrix[Math.round(matrix.length / 3 * 2)][Math.round(matrix[0].length / 2)].changeType("finish");
    startCell = matrix[Math.round(matrix.length / 3)][Math.round(matrix[0].length / 2)];
    finishCell = matrix[Math.round(matrix.length / 3 * 2)][Math.round(matrix[0].length / 2)];
}
//TODO make it so cell borders don't become thicker when their type changes


var drag = false;//determines whether mouse being held pressed over the canvas
var dragType;

canvas.width = 37 * squareSize;
canvas.height = 28 * squareSize;

fillCanvasWithRects();
//#######################################
var exploredCells = [];

function compareCells(a, b){
    if (a.overallDistance < b.overallDistance){
        return 1;
    }
    else if (a.overallDistance > b.overallDistance){
        return -1;
    }
    else{
    return (a.finishDistance < b.finishDistance) ? 1 : -1;
    }
    //return (first.overallDistance < second.overallDistance) ? first : (first.overallDistance > second.overallDistance ? second : (first.overallDistance < second.overallDistance ? first : second));
}

function controlBounds(x, y){
    return (x > -1 && x < matrix.length && y > -1 && y < matrix[0].length) ? true : false;
}

function exploreCellVicinity(cell){
    var flagTest;
    var iteratorX = -1;
    var iteratorY = -1;
    while (iteratorX < 2){
        iteratorY = -1;
        while (iteratorY < 2){
            (iteratorX == 0 && iteratorY == 0) ? iteratorY += 1 : iteratorY += 0;
            if (controlBounds(cell.xIndex + iteratorX, cell.yIndex + iteratorY)){
                tempCell = matrix[cell.xIndex + iteratorX][cell.yIndex + iteratorY];
            
                if (cell.xIndex != tempCell.xIndex && cell.yIndex != tempCell.yIndex){ //diagonal cells
                    //find the coordinates of cells that make a full 2x2 square:
                    var cellFirst = matrix[cell.xIndex][tempCell.yIndex];
                    var cellSecond = matrix[tempCell.xIndex][cell.yIndex];
                    if (cellFirst.type == 'wall' && cellSecond.type == 'wall'){
                        flagTest = true;
                    }
                    else{
                        flagTest = false;
                    }
                }
                if (tempCell.type != 'wall' && tempCell.type != 'routeClosed' && flagTest == false){
                    tempCell.startDistance = parseInt(Math.pow(Math.pow(Math.abs((startCell.xIndex - tempCell.xIndex) * 10), 2) + Math.pow(Math.abs((startCell.yIndex - tempCell.yIndex) * 10), 2), 0.5).toFixed());
                    tempCell.finishDistance = parseInt(Math.pow(Math.pow(Math.abs((finishCell.xIndex - tempCell.xIndex) * 10), 2) + Math.pow(Math.abs((finishCell.yIndex - tempCell.yIndex) * 10), 2), 0.5).toFixed());
                    // console.log(tempCell.startDistance);
                    // console.log(tempCell.finishDistance);
                    tempCell.overallDistance = parseInt((tempCell.startDistance + tempCell.finishDistance).toFixed());
                    
                    if (tempCell.type != 'routeOpened'){
                        exploredCells.push(tempCell);
                    }
                    if (tempCell.type == 'space'){
                        tempCell.changeType('routeOpened');
                    }
                }
            }
            iteratorY += 1;
        }
        iteratorX += 1;
    }
    exploredCells.sort(compareCells);
    console.log(exploredCells);
}

const delay = (delayInms) => {
    return new Promise(resolve => setTimeout(resolve, delayInms));
  };

async function exec(){
    var currentCell = startCell;

    while (finishCell.type == 'finish'){
        await delay(15);
        exploreCellVicinity(currentCell);
        currentCell = exploredCells[exploredCells.length - 1];
        exploredCells.splice(exploredCells.length - 1, 1);
        if (currentCell == exploredCells[exploredCells.length - 1]){
            console.log("ERROR: CELL DELETED INCORRECTLY");
        }
        for (var i = 0; i < exploredCells.length; i += 1){
            if (exploredCells[i].type == 'routeClosed'){
                console.log("ERROR: routeClosed CELL AFTER DELETING ACCURED");
            }
        }
        if (currentCell.type != 'start'){
            currentCell.changeType('routeClosed');
            var testVariableOne = 1;
        }
    }
    finishCell.changeType('finish');
}

var execution = document.getElementById("Start Routing");

execution.addEventListener('click', exec);

//#######################################
var resSubBtn = document.getElementById('resolutionSubmitButton');
resSubBtn.addEventListener('click', submitTriggered);

window.addEventListener('mouseup', function(){
    drag = false;
});

window.addEventListener('mousedown', function(event){
    //TODO add a condition so this only works when cursor is over canvas 
    var x = parseInt((event.offsetX / squareSize + 0.5).toFixed());
    var y = parseInt((event.offsetY / squareSize + 0.5).toFixed());
    dragType = matrix[x-1][y-1].type;
    drag = true;
});



var startCell;
var finishCell;

canvas.addEventListener('mousemove',function(event){
    //determine which cell is the cursor over now

    var x = parseInt((event.offsetX / squareSize + 0.5).toFixed());
    var y = parseInt((event.offsetY / squareSize + 0.5).toFixed());


    if (drag == true){
        x = parseInt((event.offsetX / squareSize + 0.5).toFixed());
        y = parseInt((event.offsetY / squareSize + 0.5).toFixed());
        if (dragType == "space" && matrix[x-1][y-1].type == "space"){
            matrix[x-1][y-1].changeType("wall");
        }
        else if (dragType == "wall" && matrix[x-1][y-1].type == "wall"){
            matrix[x-1][y-1].changeType("space");
        }
        else if (dragType == "start" && matrix[x-1][y-1].type == "space"){
            if (startCell != matrix[x-1][y-1])
            {
                matrix[x-1][y-1].changeType("start");
                startCell.changeType("space");
                //if ()
                startCell = matrix[x-1][y-1];
            }
        }
        else if (dragType == "finish" && matrix[x-1][y-1].type == "space"){
            if (finishCell != matrix[x-1][y-1])
            {
                matrix[x-1][y-1].changeType("finish");
                finishCell.changeType("space");
                //if ()
                finishCell = matrix[x-1][y-1];
            }
        }
    }
})