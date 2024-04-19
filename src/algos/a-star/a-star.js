function clearCanvas() {
    c.clearRect(0, 0, canvas.width, canvas.height);
}

var width = 60;
var height = 28;
var squareSize = 30;


var canvas = document.getElementById('a-starCanvas');
var c = canvas.getContext('2d');
canvas.width = 60 * squareSize;
canvas.height = 29 * squareSize;

const underButtonCanvas = document.getElementById('underButtonsCanvas');
const ctxUBC = underButtonCanvas.getContext('2d');

const maze = document.getElementById("generateMaze");
const execution = document.getElementById("Start Routing");
const resSubBtn = document.getElementById('resolutionSubmitButton');
const widthEl = document.getElementById('aStarWidth');
const heightEl = document.getElementById('aStarHeight');
const squareSizeEl = document.getElementById('aStarSquareSize');

const delay = (delayInms) => {
    return new Promise(resolve => setTimeout(resolve, delayInms));
};

var executed = false;
var beingExecuted = false;
var drag = false;
var dragType;

var exploredCells = [];

function Grid(x, y) {
    var x = x;
    var y = y;
    var matrix = [];

    var startCell;
    var finishCell;


    this.getNeighbours = function (cell) {
        var neighbours = [];

        for (var i = -1; i < 2; i += 1) {
            for (var j = -1; j < 2; j += 1) {
                var neighbourX = cell.xIndex + i;
                var neighbourY = cell.yIndex + j;
                if (neighbourX > -1 && neighbourX < this.x && neighbourY > -1 && neighbourY < this.y) {
                    if (i === 0 && j === 0 || !this.matrix[cell.xIndex + i][cell.yIndex + j].walkable ||
                        (!this.matrix[cell.xIndex + i][cell.yIndex].walkable && !this.matrix[cell.xIndex][cell.yIndex + j].walkable)) {

                        continue;
                    }
                    else {
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

function Cell(x, y, squareSize, type) {
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
    this.connections = [];

    const types = new Map();
    types.set("space", '#F8F9F9');
    types.set("wall", '#A8A8A8');
    types.set("start", '#001EC4');
    types.set("finish", '#C40000');
    types.set("routeOpened", '#E8D957');
    types.set("routeClosed", '#C5E857');
    types.set("routeIncluded", '#FF8213');

    var walkable = false;

    this.draw = function () {
        c.clearRect(x, y, squareSize, squareSize);
        c.beginPath();
        c.rect(x + 0.5, y + 0.5, squareSize - 1, squareSize - 1);
        c.fillStyle = types.get(this.type);
        c.fill();
        c.lineWidth = 0.3;
        c.strokeStyle = "#17202A";
        c.stroke();
    }

    this.changeType = function (type) {
        this.type = type;
        if (this.type === "space" || this.type === "routeOpened" || this.type === "finish" || this.type === "routeIncluded" || this.type === "start") {
            this.walkable = true;
        }
        else {
            this.walkable = false;
        }
        this.draw();
    }

    this.displayFCost = function () {
        c.font = "black 8px Georgia";
        c.fillStyle = "black";
        c.clearRect(this.x + 5, this.y + 5, squareSize - 5, squareSize - 5);
        c.fillText(this.fCost, this.x, this.y + 15);
    }



}

function myArray() {

    this.array = [];

    this.push = function (value) {
        if (value.type !== "start" && value.type !== "finish") {
            value.changeType('routeOpened');
        }
        this.array.push(value);
        this.array.sort((a, b) => a.fCost - b.fCost);
    }

    this.pop = function () {
        if (this.array.length > 0) {
            var value = this.array[0];
            if (value.type !== 'start' && value.type !== 'finish') {
                value.changeType('routeClosed'); //???
            }
            this.array.splice(0, 1);
            return value;
        }
        else {
            return null;
        }
    }

    this.top = function () {
        return this.array[0];
    }

    this.size = function () {
        return this.array.length;
    }

    this.getArray = function () {
        return this.array;
    }

}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);

}

function getRandomIntFromRange(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

function submitTriggered() {
    if (beingExecuted) {
        return;
    }
    
    var errorMessage = document.getElementById('WrongInputError');
    if (width < 0 || height < 0 || squareSize < 0) {
        errorMessage.innerHTML = "Input is incorrect.";
        return;
    }

    executed = false;
    beingExecuted = false;
    

    clearCanvas();
    grid.matrix = [];

    errorMessage.innerHTML = "";
    canvas.width = width * squareSize;
    canvas.height = height * squareSize;
    fillGridWithRects();

}

grid = new Grid(0, 0);

function fillGridWithRects() {
    clearCanvas();
    grid.matrix = [];
    var row = 0;
    var column = 0;
    for (var i = 0; i <= canvas.width - squareSize; i += squareSize) {
        column = 0;
        grid.matrix[row] = [];
        for (var j = 0; j <= canvas.height - squareSize; j += squareSize) {
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

var g = function (cell) {
    cell.gCost = cell.parent.gCost + getDistance(cell, cell.parent);
    return cell.gCost;
}

var h = function (cell) {
    xDist = Math.abs(cell.xIndex - grid.finishCell.xIndex);
    yDist = Math.abs(cell.yIndex - grid.finishCell.yIndex);

    if (xDist > yDist) {
        return 14 * yDist + 10 * (xDist - yDist);
    }
    else {
        return 14 * xDist + 10 * (yDist - xDist);
    }


}

function updateToCheck(toCheck, cell) {
    if (cell.xIndex + 2 < grid.matrix.length) {
        if (grid.matrix[cell.xIndex + 2][cell.yIndex].type === "wall") {
            toCheck.push(grid.matrix[cell.xIndex + 2][cell.yIndex]);
        }
    }

    if (cell.xIndex - 2 > 0) {
        if (grid.matrix[cell.xIndex - 2][cell.yIndex].type === "wall") {
            toCheck.push(grid.matrix[cell.xIndex - 2][cell.yIndex]);
        }
    }

    if (cell.yIndex + 2 < grid.matrix[0].length) {
        if (grid.matrix[cell.xIndex][cell.yIndex + 2].type === "wall") {
            toCheck.push(grid.matrix[cell.xIndex][cell.yIndex + 2]);
        }
    }

    if (cell.yIndex - 2 > 0) {
        if (grid.matrix[cell.xIndex][cell.yIndex - 2].type === "wall") {
            toCheck.push(grid.matrix[cell.xIndex][cell.yIndex - 2]);
        }
    }
}

function connectSpaces(cell) {

    while (true) {

        var randomDirection = getRandomInt(4);

        if (cell.xIndex + 2 < grid.matrix.length && randomDirection === 0) {
            if (grid.matrix[cell.xIndex + 2][cell.yIndex].type === "space") {
                grid.matrix[cell.xIndex + 1][cell.yIndex].changeType("space");
                return;
            }
        }

        if (cell.xIndex - 2 > 0 && randomDirection === 1) {
            if (grid.matrix[cell.xIndex - 2][cell.yIndex].type === "space") {
                grid.matrix[cell.xIndex - 1][cell.yIndex].changeType("space");
                return;
            }
        }

        if (cell.yIndex + 2 < grid.matrix[0].length && randomDirection === 2) {
            if (grid.matrix[cell.xIndex][cell.yIndex + 2].type === "space") {
                grid.matrix[cell.xIndex][cell.yIndex + 1].changeType("space");
                return;
            }
        }

        if (cell.yIndex - 2 > 0 && randomDirection === 3) {
            if (grid.matrix[cell.xIndex][cell.yIndex - 2].type === "space") {
                grid.matrix[cell.xIndex][cell.yIndex - 1].changeType("space");
                return;
            }
        }
    }
}

function placeStart() {
    for (var i = 1; i < grid.matrix.length - 1; i += 1) {
        for (var j = 1; j < grid.matrix[0].length - 1; j += 1) {
            if (grid.matrix[i][j].type === "space") {
                grid.matrix[i][j].changeType("start");
                grid.startCell = grid.matrix[i][j];
                return;
            }
        }
    }
}

function placeFinish() {
    for (var i = grid.matrix.length - 1; i > 1; i -= 1) {
        for (var j = grid.matrix[0].length - 1; j > 1; j -= 1) {
            if (grid.matrix[i][j].type === "space") {
                grid.matrix[i][j].changeType("finish");
                grid.finishCell = grid.matrix[i][j];
                return;
            }
        }
    }
}

async function generateMaze() {
    if (beingExecuted === true) {
        return;
    }
    beingExecuted = true;

    clearCanvas();
    fillGridWithRects();

    for (var i = 0; i < grid.matrix.length; i += 1) {
        for (var j = 0; j < grid.matrix[0].length; j += 1) {
            grid.matrix[i][j].changeType("wall");
        }
    }

    for (var i = 0; i < grid.matrix.length; i += 1) {
        grid.matrix[i][0].changeType("space");
        grid.matrix[i][grid.matrix[0].length - 1].changeType("space");
    }

    for (var i = 0; i < grid.matrix[0].length; i += 1) {
        grid.matrix[0][i].changeType("space");
        grid.matrix[grid.matrix.length - 1][i].changeType("space");
    }

    var randX;
    var randY;
    if (grid.matrix.length % 2 !== 0) {
        randX = getRandomIntFromRange(1, (grid.matrix.length - 2) / 2) * 2 + 1;
    }
    else {
        randX = getRandomIntFromRange(1, (grid.matrix.length) / 2) * 2;
    }

    if (grid.matrix[0].length % 2 !== 0) {
        randY = getRandomIntFromRange(1, (grid.matrix[0].length - 2) / 2) * 2 + 1;
    }
    else {
        randY = getRandomIntFromRange(1, (grid.matrix[0].length) / 2) * 2;
    }

    var curCell = grid.matrix[randX][randY];
    curCell.changeType("space");
    var toCheck = [];
    updateToCheck(toCheck, curCell);

    var smartDelay = 2000 / (grid.matrix.length * grid.matrix[0].length);
    var delayRequired = true;
    if (grid.matrix.length * grid.matrix[0].length > 2500){
        delayRequired = false;
    }

    while (toCheck.length > 0) {
        var randIndex = getRandomInt(toCheck.length);
        while (toCheck.length > 0 && toCheck[randIndex].type === "space") {
            toCheck.splice(randIndex, 1);
            randIndex = getRandomInt(toCheck.length);
        }
        if (randIndex % 3 === 0) {
            randIndex = getRandomInt(toCheck.length / 2);
        }
        else {
            randIndex = getRandomIntFromRange(toCheck.length / 2, toCheck.length);
        }
        if (randIndex < toCheck.length) {
            var randCell = toCheck[randIndex];
            randCell.changeType("space");
            toCheck.splice(randIndex, 1);
            connectSpaces(randCell);
            updateToCheck(toCheck, randCell);
            if (delayRequired){
                await delay(smartDelay);
            }
        }
    }



    for (var i = 0; i < grid.matrix.length; i += 1) {
        grid.matrix[i][0].changeType("wall");
        grid.matrix[i][grid.matrix[0].length - 1].changeType("wall");
        if (delayRequired){
            await delay(smartDelay);
        }
    }

    for (var i = 0; i < grid.matrix[0].length; i += 1) {
        grid.matrix[0][i].changeType("wall");
        grid.matrix[grid.matrix.length - 1][i].changeType("wall");
        if (delayRequired){
            await delay(smartDelay);
        }
    }

    if (grid.matrix[0].length % 2 === 0) {
        for (var i = 1; i < grid.matrix.length - 1; i += 1) {
            if (grid.matrix[i][2].type !== "wall") {
                grid.matrix[i][1].changeType("space");
            }
            if (delayRequired){
                await delay(smartDelay);
            }
        }
    }

    if (grid.matrix.length % 2 === 0) {
        for (var i = 1; i < grid.matrix[0].length - 1; i += 1) {
            if (grid.matrix[2][i].type !== "wall") {
                grid.matrix[1][i].changeType("space");
            }
            if (delayRequired){
                await delay(smartDelay);
            }
        }
    }

    placeStart();
    placeFinish();

    beingExecuted = false;

}

fillGridWithRects();

function getDistance(firstCell, secondCell) {
    xDist = Math.abs(firstCell.xIndex - secondCell.xIndex);
    yDist = Math.abs(firstCell.yIndex - secondCell.yIndex);

    if (xDist > yDist) {
        return 14 * yDist + 10 * (xDist - yDist);
    }
    else {
        return 14 * xDist + 10 * (yDist - xDist);
    }
}

async function pathFinder() {
    
    beingExecuted = true;
    path = [];
    currentCell = grid.finishCell;

    while (currentCell !== grid.startCell) {
        path.push(currentCell);
        currentCell = currentCell.parent;
    }

    path.reverse();
    for (var i = 0; i < path.length - 1; i += 1) {
        await delay(35);
        beingExecuted = true;
        if (path[i].type !== "startCell" && path[i].type !== "finishCell") {
            path[i].changeType("routeIncluded");
        }
    }
    executed = true;
    beingExecuted = false;
}



async function exec() {
    if (executed || beingExecuted) {
        return;
    }
    executed = true;
    beingExecuted = true;
    openSet = new myArray;
    closedSet = [];
    grid.startCell.gCost = 0;
    grid.startCell.fCost = grid.startCell.gCost + h(grid.startCell);
    openSet.push(grid.startCell);

    while (openSet.array.length > 0) {
        await delay(2);
        var currentCell = openSet.pop();
        if (currentCell.type !== "finish" && currentCell.type !== "start") {
            currentCell.changeType("reouteClosed");
        }
        closedSet.push(currentCell);

        if (currentCell === grid.finishCell) {
            pathFinder();
            
            return;
        }

        var neighbours = grid.getNeighbours(currentCell);
        neighbours.forEach(neighbour => {
            var tentativeScore = currentCell.gCost + getDistance(currentCell, neighbour);
            if (closedSet.includes(neighbour) || tentativeScore >= neighbour.gCost) {
                return;
            }
            if (!closedSet.includes(neighbour) || tentativeScore < neighbour.gCost) {

                neighbour.parent = currentCell;

                neighbour.gCost = g(neighbour);
                neighbour.fCost = neighbour.gCost + h(neighbour);

                if (!openSet.array.includes(neighbour) && neighbour.walkable) {
                    if (neighbour.type !== "finish" && neighbour.type !== "start") {
                        neighbour.changeType("routeOpened");
                    }
                    openSet.push(neighbour);
                }
            }
        });

    }
    document.getElementById("NoPathFound").innerHTML = "No path existing";
    beingExecuted = false; 
}


execution.addEventListener('click', exec);

maze.addEventListener('click', generateMaze);

resSubBtn.addEventListener('click', submitTriggered);

canvas.addEventListener('mouseup', function () {
    drag = false;
});

canvas.addEventListener('mousedown', function (event) {
    //TODO add a condition so this only works when cursor is over canvas 
    var x = parseInt((event.offsetX / squareSize + 0.5).toFixed());
    var y = parseInt((event.offsetY / squareSize + 0.5).toFixed());
    dragType = grid.matrix[x - 1][y - 1].type;
    drag = true;
});

canvas.addEventListener('mousemove', function (event) {
    if (!executed) {

        var x = parseInt((event.offsetX / squareSize + 0.5).toFixed());
        var y = parseInt((event.offsetY / squareSize + 0.5).toFixed());


        if (drag === true) {
            x = parseInt((event.offsetX / squareSize + 0.5).toFixed());
            y = parseInt((event.offsetY / squareSize + 0.5).toFixed());
            if (dragType === "space" && grid.matrix[x - 1][y - 1].type === "space") {
                grid.matrix[x - 1][y - 1].changeType("wall");
            }
            else if (dragType === "wall" && grid.matrix[x - 1][y - 1].type === "wall") {
                grid.matrix[x - 1][y - 1].changeType("space");
            }
            else if (dragType === "start" && grid.matrix[x - 1][y - 1].type === "space") {
                if (grid.startCell !== grid.matrix[x - 1][y - 1]) {
                    grid.startCell.changeType("space");
                    grid.matrix[x - 1][y - 1].changeType("start");
                    grid.startCell = grid.matrix[x - 1][y - 1];
                }
            }
            else if (dragType === "finish" && grid.matrix[x - 1][y - 1].type === "space") {
                if (grid.finishCell !== grid.matrix[x - 1][y - 1]) {
                    grid.finishCell.changeType("space");
                    grid.matrix[x - 1][y - 1].changeType("finish");
                    grid.finishCell = grid.matrix[x - 1][y - 1];
                }
            }
        }
    }
})


