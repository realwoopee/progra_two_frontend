function clearCanvas(){
    c.clearRect(0, 0, canvas.width, canvas.height );
}
//TODO: смотри видео отчет за 27.03
var width = 37;
var height = 28;
var squareSize = 30;

var canvas = document.getElementById('a-starCanvas');
var c = canvas.getContext('2d');

//TODO rectanle for buttons to be on OR removing 
// var buttonCanvas = document.getElementById('underButtonCanvas');
// var buttonContext = buttonCanvas.getContext('2d');
// var buttonPos = document.getElementById("Width and Height");
// var buttonRect = buttonPos.getBoundingClientRect();

// buttonCanvas.style.left = (buttonRect.left - 25).toString() + "px";
// buttonCanvas.style.top = (buttonRect.top - 7).toString() + "px";
// buttonCanvas.style.width = (buttonRect.right - buttonRect.left + 20).toString() + "px";
// buttonCanvas.style.height = (buttonRect.bottom - buttonRect.top).toString() + "px";
// buttonCanvas.style.position = "absolute";
// buttonContext.beginPath();
// buttonContext.rect(0, 0, 300, 150);
// buttonContext.fillStyle = "#BDBDBD";
// buttonContext.fill();
// buttonContext.lineWidth = 0.3;
// buttonContext.strokeStyle = "#17202A";
// buttonContext.stroke();


function submitTriggered(){
    executed = false;
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
        height = 28;
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
        errorMessage.innerHTML = "";
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
    types.set("wall", '#A8A8A8');
    types.set("start", '#001EC4');
    types.set("finish", '#C40000');
    types.set("routeOpened", '#E8D957');
    types.set("routeClosed", '#C5E857');
    types.set("routeIncluded", '#FF8213');

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

    this.up = function(index){ 
        while (this.heap[index].fCost < this.heap[Math.round((index - 1) / 2)].fCost){
            [this.heap[index], this.heap[Math.round((index - 1) / 2)]] = [this.heap[Math.round((index - 1) / 2)], this.heap[index]];
            index = Math.round((index - 1) / 2);
        }
    }

    this.down = function(index) {
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
        }
    }

    this.push = function(value) {
        if (value.type != "start" && value.type != "finish"){
            value.changeType('routeOpened');
        }
        this.heap.push(value);
        this.heap.sort((a, b) => a.fCost - b.fCost);
    }

    this.pop = function() {
        if (this.heap.length > 0){
            var value = this.heap[0];
            if (value.type != 'start' && value.type != 'finish'){
                value.changeType('routeClosed'); //???
            }
            this.heap.splice(0, 1);
            return value;
        }
        else{
            return null;
        }
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

    if (typeof currentCell.parent === 'undefined'){
        document.getElementById("NoPathFound").innerHTML = "No path existing";
        return;
    }

    while (currentCell != grid.startCell){
        path.push(currentCell);
        currentCell = currentCell.parent;
    }

    path.reverse();
    for (var i = 0; i < path.length - 1; i += 1){
        await delay(35);
        if (path[i].type != "startCell" && path[i].type != "finishCell"){
            path[i].changeType("routeIncluded");
        }
    }
}



async function exec(){
    executed = true;
    openSet = new MinHeap;
    closedSet = [];
    grid.startCell.gCost = 0;
    grid.startCell.fCost = grid.startCell.gCost + h(grid.startCell);
    openSet.push(grid.startCell);

    while (openSet.heap.length > 0){
        await delay(2);
        var currentCell = openSet.pop();
        if (currentCell.type != "finish" && currentCell.type != "start"){
            currentCell.changeType("reouteClosed");
        }
        closedSet.push(currentCell);

        if (currentCell == grid.finishCell){
            pathFinder();
            return;
        }

        var neighbours = grid.getNeighbours(currentCell);
        neighbours.forEach(neighbour => {
            var tentativeScore = currentCell.gCost + getDistance(currentCell, neighbour);
            if (closedSet.includes(neighbour) || tentativeScore >= neighbour.gCost){
                return;
            }
            if (!closedSet.includes(neighbour) || tentativeScore < neighbour.gCost){
                
                neighbour.parent = currentCell;
                console.log('+1');

                neighbour.gCost = g(neighbour);
                neighbour.fCost = neighbour.gCost + h(neighbour);
                
                if (!openSet.heap.includes(neighbour) && neighbour.walkable){
                    console.log("TEST_LOG");
                    if (neighbour.type != "finish" && neighbour.type != "start"){
                        neighbour.changeType("routeOpened");
                    }
                    openSet.push(neighbour);
                }
            }
        });

    }
    pathFinder();
}

var executed = false;

var execution = document.getElementById("Start Routing");

execution.addEventListener('click', exec);

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
    if (executed == false){

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
    }
})


