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
        fillGridWithRects();
    }


}

function Grid(x, y){
    

    var x = x;
    var y = y;
    var matrix = [];

    var startCell;
    var finishCell;


    this.getNeighbours = function(cell){
        var neighbours = [];

        for (var i = -1; i < 2; i+=1){
            for (var j = -1; j < 2; j+=1){
                var neighbourX = cell.xIndex + i;
                var neighbourY = cell.yIndex + j;
                if (neighbourX > -1 && neighbourX < this.x && neighbourY > -1 && neighbourY < this.y){
                    if (i == 0 && j == 0 || !this.matrix[cell.xIndex + i][cell.yIndex + j].walkable || (!this.matrix[cell.xIndex + i][cell.yIndex].walkable && !this.matrix[cell.xIndex][cell.yIndex + j].walkable)){
                        continue;
                    }
                    else{
                        var neighbour = this.matrix[neighbourX][neighbourY];

                        //neighbour.gCost = g(neighbour);
                        neighbour.hCost = h(neighbour);
                        neighbour.fCost = neighbour.gCost + neighbour.hCost; 

                        neighbours.push(this.matrix[neighbourX][neighbourY]);
                    }
                }
                
            }
        }
        return neighbours;
    }

} 

function Cell(x, y, squareSize, type){
    this.x = x;
    this.y = y;
    this.xIndex;
    this.yIndex;
    this.type = type;
    this.size = squareSize;
    this.gCost;
    this.hCost;
    this.fCost = this.gCost + this.hCost;
    this.parent;

    const types = new Map();
    types.set("space", '#F8F9F9');
    types.set("wall", '#1F221F');
    types.set("start", '#27FF00');
    types.set("finish", '#FF0000');
    types.set("routeOpened", '#F8F9F9');
    types.set("routeClosed", '#F8F9F9');
    types.set("routeIncluded", '#FF004D');

    var walkable = false;
    if (this.type == "space" || this.type == "routeOpened" || this.type == "finish" || this.type == "start"){
        walkable = true;
    }

    this.draw = function(){
        c.clearRect(x, y, squareSize, squareSize);
        c.beginPath();
        c.rect(x + 0.5, y + 0.5, squareSize - 1, squareSize - 1);
        c.fillStyle = types.get(this.type);
        c.fill();
        c.lineWidth = 0.3;
        c.strokeStyle = "#17202A";
        c.stroke();
        // c.rect(x+5, y+5, squareSize-10, squareSize-10);
        
        // c.stroke();
    }

    this.changeType = function(type) {
        this.type = type;
        if (this.type == "space" || this.type == "routeOpened" || this.type == "finish" || this.type == "routeIncluded" || this.type == "start"){
            this.walkable = true;
        }
        else{
            this.walkable = false;
        }
        this.draw();
        
        //this.displayFCost();
        
    }

    this.displayFCost = function(){
        c.font = "black 8px Georgia";
        c.fillStyle = "black";
        c.clearRect(this.x+5, this.y+5, squareSize-5, squareSize-5 );
        c.fillText(this.fCost, this.x, this.y + 15);
    }

}

function MinHeap(){

    this.heap = [];

    this.up = function(index){ //put the element at *index* to a spot so all the this.heap 
                               //rules are satisfied by moving it up the this.heap
        //while (index != 0 && this.heap[index].fCost < this.heap[Math.round((index - 1) / 2 - 0.1)].fCost){ //will be float probably
        while (this.heap[index].fCost < this.heap[Math.round((index - 1) / 2)].fCost){ //will be float probably
            [this.heap[index], this.heap[Math.round((index - 1) / 2)]] = [this.heap[Math.round((index - 1) / 2)], this.heap[index]];
            index = Math.round((index - 1) / 2);
        }
        
        if (this.heap.length > 0){
            var min = this.heap[0];
            for (var i = 0; i < this.heap.length; i+=1){
                if (min > this.heap[i]){
                    console.log("SIFTUP INCORRECT PROCEDURE");
                }
            }
        }

    }

    this.down = function(index) {//put the element at *index* to a spot so all the this.heap 
                                 //rules are satisfied by moving it down the this.heap
        while (2 * index + 1 < this.heap.length) {
            
            var left = 2 * index + 1;
            var right = 2 * index + 2;
            j = left;

            if (right < this.heap.length && this.heap[right].fCost < this.heap[left].fCost){
                j = right;
            }
            if (this.heap[index].fCost <= this.heap[j].fCost){
                break;
            }

            [this.heap[index], this.heap[j]] = [this.heap[j], this.heap[index]];
            index = j;
        }
        if (this.heap.length > 0){
            var min = this.heap[0].fCost;
            for (var i = 0; i < this.heap.length; i+=1){
                if (min > this.heap[i].fCost){
                    debugger;
                    console.log("SIFTDOWN INCORRECT PROCEDURE");
                }
            }
        }
    }

    this.push = function(value) {//add a new element to the this.heap while keeping
        if (value.type != "start" && value.type != "finish"){
            value.changeType('routeOpened');
        }
        this.heap.push(value);
        this.heap.sort((a, b) => a.fCost - b.fCost);
    }

    this.pop = function() {//get the top element and delete it from the this.heap
        var value = this.heap[0];
        if (value.type != 'start' && value.type != 'finish'){
            value.changeType('routeClosed'); //???
        }
        this.heap.splice(0, 1);
        return value;
    }

    this.top = function(){//get the element at the top
        return this.heap[0];
    }

    this.size = function(){//get the size of the this.heap
        return this.heap.length;
    }

    this.getHeap = function(){
        return this.heap;
    }

}

grid = new Grid(0, 0);

function fillGridWithRects(){
    clearCanvas();
    grid.matrix = [];                                
    var row = 0;
    var column = 0;
    for (var i = 0; i <= canvas.width - squareSize; i += squareSize){
        column = 0;
        grid.matrix[row] = [];
        for(var j = 0; j <= canvas.height - squareSize; j += squareSize){
            var cell = new Cell(i, j, squareSize, "space");
            cell.walkable = true;
            grid.matrix[row][column] = cell;
            cell.xIndex = row;
            cell.yIndex = column;
            cell.draw();
            column += 1;
        }
        row += 1;
    }
    grid.matrix[Math.round(grid.matrix.length / 3)][Math.round(grid.matrix[0].length / 2)].changeType("start");
    grid.matrix[Math.round(grid.matrix.length / 3 * 2)][Math.round(grid.matrix[0].length / 2)].changeType("finish");
    grid.startCell = grid.matrix[Math.round(grid.matrix.length / 3)][Math.round(grid.matrix[0].length / 2)];
    grid.finishCell = grid.matrix[Math.round(grid.matrix.length / 3 * 2)][Math.round(grid.matrix[0].length / 2)];

    grid.x = grid.matrix.length;
    grid.y = grid.matrix[0].length;
}

var g = function(cell){
    cell.gCost = cell.parent.gCost + getDistance(cell, cell.parent);
    return cell.gCost;
}

var h = function(cell){
    xDist = Math.abs(cell.xIndex - grid.finishCell.xIndex);
    yDist = Math.abs(cell.yIndex - grid.finishCell.yIndex);

    if (xDist > yDist){
        return 14 * yDist + 10 * (xDist - yDist);
    }
    else{
        return 14 * xDist + 10 * (yDist - xDist);
    }


}

var drag = false;
var dragType;

canvas.width = 37 * squareSize;
canvas.height = 28 * squareSize;

fillGridWithRects();
//#######################################
var exploredCells = [];

function getDistance(firstCell, secondCell){
    xDist = Math.abs(firstCell.xIndex - secondCell.xIndex);
    yDist = Math.abs(firstCell.yIndex - secondCell.yIndex);

    if (xDist > yDist){
        return 14 * yDist + 10 * (xDist - yDist);
    }
    else{
        return 14 * xDist + 10 * (yDist - xDist);
    }
}

const delay = (delayInms) => {
    return new Promise(resolve => setTimeout(resolve, delayInms));
  };

async function pathFinder(){
    path = [];
    currentCell = grid.finishCell;

    while (currentCell != grid.startCell){
        path.push(currentCell);
        currentCell = currentCell.parent;
    }

    path.reverse();
    for (var i = 0; i < path.length - 1; i += 1){
        await delay(50);
        path[i].changeType("routeIncluded")
    }
    // for (var i = 0; i < path.length - 1; i += 1){
    //     c.beginPath();
    //     c.moveTo(path[i].x + 15, path[i].y + 15);
    //     c.lineTo(path[i].parent.x + 15, path[i].parent.y + 15);
    //     c.lineWidth = 5;
    //     c.stroke();
    //     path[i].changeType("routeIncluded")
    // }
}



async function exec(){
    openSet = new MinHeap;
    closedSet = [];
    grid.startCell.gCost = 0;
    grid.startCell.fCost = grid.startCell.gCost + h(grid.startCell);
    openSet.push(grid.startCell);

    while (openSet.length != 0){
        var currentCell = openSet.top();


        if (currentCell == grid.finishCell){
            pathFinder();
            return;
        }

        openSet.pop();
        closedSet.push(currentCell);

        var neighbours = grid.getNeighbours(currentCell);
        neighbours.forEach(neighbour => {
            var tentativeScore = currentCell.gCost + getDistance(currentCell, neighbour);
            if (closedSet.includes(neighbour) && tentativeScore >= neighbour.gCost){
                return;
            }
            if (!closedSet.includes(neighbour) || tentativeScore < neighbour.gCost){
                
                neighbour.parent = currentCell;

                neighbour.gCost = g(neighbour);
                neighbour.fCost = neighbour.gCost + h(neighbour);
                
                if (!openSet.heap.includes(neighbour)){
                    openSet.push(neighbour);
                }
            }
        });

    }
}

var execution = document.getElementById("Start Routing");

function testFunction(){
    testOpenSet = new MinHeap;

    testCellOne = new Cell(1, 1, 1, 'space');
    testCellOne.fCost = 5;
    testCellTwo = new Cell(1, 1, 1, 'space');
    testCellTwo.fCost = 1;
    testCellThree = new Cell(1, 1, 1, 'space');
    testCellThree.fCost = 7;
    testCellFour = new Cell(1, 1, 1, 'space');
    testCellFour.fCost = 3;

    testOpenSet.push(testCellOne);
    testOpenSet.push(testCellTwo);
    testOpenSet.push(testCellThree);
    testOpenSet.push(testCellFour);

    var testArray = testOpenSet.getHeap();

    console.log(testArray);
}

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
    dragType = grid.matrix[x-1][y-1].type;
    drag = true;
});

canvas.addEventListener('mousemove',function(event){

    var x = parseInt((event.offsetX / squareSize + 0.5).toFixed());
    var y = parseInt((event.offsetY / squareSize + 0.5).toFixed());


    if (drag == true){
        x = parseInt((event.offsetX / squareSize + 0.5).toFixed());
        y = parseInt((event.offsetY / squareSize + 0.5).toFixed());
        if (dragType == "space" && grid.matrix[x-1][y-1].type == "space"){
            grid.matrix[x-1][y-1].changeType("wall");
        }
        else if (dragType == "wall" && grid.matrix[x-1][y-1].type == "wall"){
            grid.matrix[x-1][y-1].changeType("space");
        }
        else if (dragType == "start" && grid.matrix[x-1][y-1].type == "space"){
            if (grid.startCell != grid.matrix[x-1][y-1])
            {
                grid.startCell.changeType("space");
                grid.matrix[x-1][y-1].changeType("start");
                grid.startCell = grid.matrix[x-1][y-1];
            }
        }
        else if (dragType == "finish" && grid.matrix[x-1][y-1].type == "space"){
            if (grid.finishCell != grid.matrix[x-1][y-1])
            {
                grid.finishCell.changeType("space");
                grid.matrix[x-1][y-1].changeType("finish");
                grid.finishCell = grid.matrix[x-1][y-1];
            }
        }
    }
})


