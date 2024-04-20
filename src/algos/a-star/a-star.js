import { delay, getRandomInt, getRandomIntFromRange } from "../../utils";

class AStar {
  constructor(canvas, logFunc) {
    this.canvas = canvas;
    this.canvasContext = canvas.getContext("2d");
    this.logFunc = logFunc;
    this.grid = new Grid(0, 0);
  }

  clearCanvas() {
    this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  fillGridWithRects() {
    this.clearCanvas();
    this.grid.matrix = [];
    let row = 0;
    let column = 0;
    for (let i = 0; i < width; i += 1) {
      column = 0;
      this.grid.matrix[row] = [];
      for (let j = 0; j < height; j += 1) {
        const cell = new Cell(i * squareSize, j * squareSize, squareSize, "space", this.canvasContext);
        this.grid.matrix[row][column] = cell;
        cell.xIndex = row;
        cell.yIndex = column;
        cell.draw();
        column += 1;
      }
      row += 1;
    }

    this.grid.x = width;
    this.grid.y = height;

    this.grid.matrix[Math.round(this.grid.x / 3)][Math.round(this.grid.y / 2)].changeType("start");
    this.grid.matrix[Math.round(this.grid.x / 3 * 2)][Math.round(this.grid.y / 2)].changeType("finish");
    this.grid.startCell = this.grid.matrix[Math.round(this.grid.x / 3)][Math.round(this.grid.y / 2)];
    this.grid.finishCell = this.grid.matrix[Math.round(this.grid.x / 3 * 2)][Math.round(this.grid.y / 2)];

  }

  submitTriggered() {
    if (this.executing) {
      return;
    }

    this.executing = true;

    if (width < 0 || height < 0 || squareSize < 0) {
      this.logFunc?.("Input is incorrect.");
      return;
    }

    this.canvas.width = width * squareSize;
    this.canvas.height = height * squareSize;
    this.clearCanvas();
    this.grid.matrix = [];
    this.fillGridWithRects();

    this.executing = false;
  }

  updateToCheck(toCheck, cell) {
    if (cell.xIndex + 2 < this.grid.matrix.length) {
      if (!this.grid.matrix[cell.xIndex + 2][cell.yIndex].type.walkable) {
        toCheck.push(this.grid.matrix[cell.xIndex + 2][cell.yIndex]);
      }
    }

    if (cell.xIndex - 2 > 0) {
      if (!this.grid.matrix[cell.xIndex - 2][cell.yIndex].type.walkable) {
        toCheck.push(this.grid.matrix[cell.xIndex - 2][cell.yIndex]);
      }
    }

    if (cell.yIndex + 2 < this.grid.matrix[0].length) {
      if (!this.grid.matrix[cell.xIndex][cell.yIndex + 2].type.walkable) {
        toCheck.push(this.grid.matrix[cell.xIndex][cell.yIndex + 2]);
      }
    }

    if (cell.yIndex - 2 > 0) {
      if (!this.grid.matrix[cell.xIndex][cell.yIndex - 2].type.walkable) {
        toCheck.push(this.grid.matrix[cell.xIndex][cell.yIndex - 2]);
      }
    }
  }

  connectSpaces(cell) {

    while (true) {

      const randomDirection = getRandomInt(4);

      if (cell.xIndex + 2 < this.grid.x && randomDirection === 0) {
        if (this.grid.matrix[cell.xIndex + 2][cell.yIndex].type.walkable) {
          this.grid.matrix[cell.xIndex + 1][cell.yIndex].changeType("space");
          return;
        }
      }

      if (cell.xIndex - 2 > 0 && randomDirection === 1) {
        if (this.grid.matrix[cell.xIndex - 2][cell.yIndex].type.walkable) {
          this.grid.matrix[cell.xIndex - 1][cell.yIndex].changeType("space");
          return;
        }
      }

      if (cell.yIndex + 2 < this.grid.y && randomDirection === 2) {
        if (this.grid.matrix[cell.xIndex][cell.yIndex + 2].type.walkable) {
          this.grid.matrix[cell.xIndex][cell.yIndex + 1].changeType("space");
          return;
        }
      }

      if (cell.yIndex - 2 > 0 && randomDirection === 3) {
        if (this.grid.matrix[cell.xIndex][cell.yIndex - 2].type.walkable) {
          this.grid.matrix[cell.xIndex][cell.yIndex - 1].changeType("space");
          return;
        }
      }
    }
  }

  placeStart() {
    for (const row of this.grid.matrix.slice(1, -1)) {
      for (const cell of row.slice(1, -1)) {
        if (cell.type.name !== "space") continue;
        cell.changeType("start");
        this.grid.startCell = cell;
        return;
      }
    }
  }

  placeFinish() {
    for (const row of this.grid.matrix.slice(1, -1).toReversed()) {
      for (const cell of row.slice(1, -1).toReversed()) {
        if (cell.type.name !== "space") continue;
        cell.changeType("finish");
        this.grid.finishCell = cell;
        return;
      }
    }
  }

  async generateMaze() {
    if (this.executing) {
      return;
    }
    this.executing = true;

    this.clearCanvas();
    this.fillGridWithRects();

    for (const col of this.grid.matrix) {
      for (const cell of col) {
        cell.changeType("wall");
      }
    }

    for (const col of this.grid.matrix) {
      col[0].changeType("space");
      col[col.length - 1].changeType("space");
    }

    for (const col of this.grid.matrix.toSpliced(1, this.grid.matrix.length - 2)) {
      for (const cell of col) {
        cell.changeType("space");
      }
    }

    let randX;
    let randY;
    if (this.grid.x % 2 !== 0) {
      randX = getRandomIntFromRange(1, (this.grid.x - 2) / 2) * 2 + 1;
    } else {
      randX = getRandomIntFromRange(1, (this.grid.x) / 2) * 2;
    }

    if (this.grid.y % 2 !== 0) {
      randY = getRandomIntFromRange(1, (this.grid.y - 2) / 2) * 2 + 1;
    } else {
      randY = getRandomIntFromRange(1, (this.grid.y) / 2) * 2;
    }

    const curCell = this.grid.matrix[randX][randY];
    curCell.changeType("space");
    const toCheck = [];
    this.updateToCheck(toCheck, curCell);

    const smartDelay = 2000 / (this.grid.x * this.grid.y);
    let delayRequired = true;
    if (this.grid.x * this.grid.y > 2500) {
      delayRequired = false;
    }

    while (toCheck.length > 0) {
      let randIndex = getRandomInt(toCheck.length);
      while (toCheck.length > 0 && toCheck[randIndex].type.walkable) {
        toCheck.splice(randIndex, 1);
        randIndex = getRandomInt(toCheck.length);
      }
      if (randIndex % 3 === 0) {
        randIndex = getRandomInt(toCheck.length / 2);
      } else {
        randIndex = getRandomIntFromRange(toCheck.length / 2, toCheck.length);
      }
      if (randIndex < toCheck.length) {
        const randCell = toCheck[randIndex];
        randCell.changeType("space");
        toCheck.splice(randIndex, 1);
        this.connectSpaces(randCell);
        this.updateToCheck(toCheck, randCell);
        if (delayRequired) {
          await delay(smartDelay);
        }
      }
    }

    for (const col of this.grid.matrix) {
      col[0].changeType("wall");
      col[col.length - 1].changeType("wall");
      if (delayRequired) {
        await delay(smartDelay);
      }
    }

    for (const col of this.grid.matrix.toSpliced(1, this.grid.matrix.length - 2)) {
      for (const cell of col) {
        cell.changeType("wall");
        if (delayRequired) {
          await delay(smartDelay);
        }
      }
    }

    if (this.grid.y % 2 === 0) {
      for (const col of this.grid.matrix.toSpliced(1, this.grid.matrix.length - 2)) {
        if (col[2].type.walkable) {
          col[1].changeType("space");
        }
        if (delayRequired) {
          await delay(smartDelay);
        }
      }
    }

    if (this.grid.x % 2 === 0) {
      for (let i = 1; i < this.grid.y - 1; i += 1) {
        if (this.grid.matrix[2][i].type.walkable) {
          this.grid.matrix[1][i].changeType("space");
        }
        if (delayRequired) {
          await delay(smartDelay);
        }
      }
    }

    this.placeStart();
    this.placeFinish();

    this.executing = false;
  }

  async exec() {
    if (this.executing) {
      return;
    }
    this.executing = true;
    let openSet = [];
    let closedSet = [];
    this.grid.startCell.gCost = 0;
    this.grid.startCell.fCost = this.grid.startCell.gCost + this.h(this.grid.startCell);
    openSet.push(this.grid.startCell);

    while (openSet.length > 0) {
      await delay(2);
      const currentCell = openSet.shift();
      if (currentCell.type.name !== "finish" && currentCell.type.name !== "start") {
        currentCell.changeType("routeClosed");
      }
      closedSet.push(currentCell);

      if (currentCell === this.grid.finishCell) {
        await this.pathFinder();
        this.executing = false;
        return;
      }

      const neighbours = this.grid.getNeighbours(currentCell, this.h);
      for (const neighbour of neighbours) {
        const tentativeScore = currentCell.gCost + getDistance(currentCell, neighbour);
        if (closedSet.includes(neighbour) || tentativeScore >= neighbour.gCost) {
          continue;
        }
        if (!closedSet.includes(neighbour) || tentativeScore < neighbour.gCost) {
          neighbour.parent = currentCell;

          neighbour.gCost = this.g(neighbour);
          neighbour.fCost = neighbour.gCost + this.h(neighbour);

          if (!openSet.includes(neighbour) && neighbour.walkable) {
            if (neighbour.type.name !== "finish" && neighbour.type.name !== "start") {
              neighbour.changeType("routeOpened");
            }
            openSet.push(neighbour);
          }
        }
      }

      openSet.sort((a, b) => a.fCost - b.fCost);
    }
    this.logFunc?.("No path existing");
    this.executing = false;
  }

  async pathFinder() {
    this.executing = true;
    const path = [];
    let currentCell = this.grid.finishCell;

    while (currentCell !== this.grid.startCell) {
      path.push(currentCell);
      currentCell = currentCell.parent;
    }

    path.reverse();
    for (const cell of path) {
      await delay(35);
      if (cell.type.name !== "start" && cell.type.name !== "finish") {
        cell.changeType("routeIncluded");
      }
    }
    this.executing = false;
  }


  g(cell) {
    cell.gCost = cell.parent.gCost + getDistance(cell, cell.parent);
    return cell.gCost;
  };

  h = (cell) => getDistance(cell, this.grid.finishCell);
}


class Grid {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.matrix = [];
    this.startCell = undefined;
    this.finishCell = undefined;
  }


  getNeighbours(cell, h) {
    const neighbours = [];

    for (let i = -1; i < 2; i += 1) {
      for (let j = -1; j < 2; j += 1) {
        const neighbourX = cell.xIndex + i;
        const neighbourY = cell.yIndex + j;
        if (neighbourX > -1 && neighbourX < this.x && neighbourY > -1 && neighbourY < this.y) {
          if (!(i === 0 && j === 0 || !this.matrix[cell.xIndex + i][cell.yIndex + j].walkable ||
            (!this.matrix[cell.xIndex + i][cell.yIndex].walkable && !this.matrix[cell.xIndex][cell.yIndex + j].walkable))) {
            const neighbour = this.matrix[neighbourX][neighbourY];

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

class Cell {
  #types = new Map([
    ["space", { name: "space", color: "#F8F9F9", walkable: true }],
    ["wall", { name: "wall", color: "#A8A8A8", walkable: false }],
    ["start", { name: "start", color: "#001EC4", walkable: true }],
    ["finish", { name: "finish", color: "#C40000", walkable: true }],
    ["routeOpened", { name: "routeOpened", color: "#E8D957", walkable: true }],
    ["routeClosed", { name: "routeClosed", color: "#C5E857", walkable: false }],
    ["routeIncluded", { name: "routeIncluded", color: "#FF8213", walkable: true }]]);

  parent;
  gCost;
  fCost;
  xIndex;
  yIndex;

  constructor(x, y, squareSize, type, canvasContext) {
    this.x = x;
    this.y = y;
    this.type = this.#types.get(type);
    this.squareSize = squareSize;
    this.canvasContext = canvasContext;
  }

  draw() {
    this.canvasContext.clearRect(this.x, this.y, this.squareSize, this.squareSize);
    this.canvasContext.beginPath();
    this.canvasContext.rect(this.x + 0.5, this.y + 0.5, this.squareSize - 1, this.squareSize - 1);
    this.canvasContext.fillStyle = this.type.color;
    this.canvasContext.fill();
    this.canvasContext.lineWidth = 0.3;
    this.canvasContext.strokeStyle = "#17202A";
    this.canvasContext.stroke();
  };

  get walkable() {
    return this.type.walkable;
  }

  changeType(type) {
    this.type = this.#types.get(type);
    this.draw();
  };
}


function getDistance(firstCell, secondCell) {
  const xDist = Math.abs(firstCell.xIndex - secondCell.xIndex);
  const yDist = Math.abs(firstCell.yIndex - secondCell.yIndex);

  if (xDist > yDist) {
    return 14 * yDist + 10 * (xDist - yDist);
  } else {
    return 14 * xDist + 10 * (yDist - xDist);
  }
}


let widthInput = document.getElementById("aStarWidth");
let heightInput = document.getElementById("aStarHeight");
let squareSizeInput = document.getElementById("aStarSquareSize");

let width = widthInput.value = 30;
let height = heightInput.value = 23;
let squareSize = squareSizeInput.value = 20;

document.getElementById("aStarWidth").onchange = ev => width = ev.target.value;
document.getElementById("aStarHeight").onchange = ev => height = ev.target.value;
document.getElementById("aStarSquareSize").onchange = ev => squareSize = ev.target.value;

let canvas = document.getElementById("a-starCanvas");
canvas.width = 60 * squareSize;
canvas.height = 28 * squareSize;

const maze = document.getElementById("generateMaze");
const execution = document.getElementById("startRouting");
const resSubBtn = document.getElementById("resolutionSubmitButton");

let drag = false;
let dragType;

const algos = new AStar(canvas, alert);

algos.fillGridWithRects();

execution.addEventListener("click", () => algos.exec());

maze.addEventListener("click", () => algos.generateMaze());

resSubBtn.addEventListener("click", () => algos.submitTriggered());

canvas.addEventListener("mouseup", function() {
  drag = false;
});

canvas.addEventListener("mousedown", function(event) {
  //TODO add a condition so this only works when cursor is over canvas
  const x = parseInt((event.offsetX / squareSize + 0.5).toFixed());
  const y = parseInt((event.offsetY / squareSize + 0.5).toFixed());
  dragType = algos.grid.matrix[x - 1][y - 1].type.name;
  drag = true;
});

canvas.addEventListener("mousemove", function(event) {
  if (!algos.executing) {
    if (drag === true) {
      const x = parseInt((event.offsetX / squareSize + 0.5).toFixed());
      const y = parseInt((event.offsetY / squareSize + 0.5).toFixed());
      if (dragType === "space" && algos.grid.matrix[x - 1][y - 1].type.name === "space") {
        algos.grid.matrix[x - 1][y - 1].changeType("wall");
      } else if (dragType === "wall" && algos.grid.matrix[x - 1][y - 1].type.name === "wall") {
        algos.grid.matrix[x - 1][y - 1].changeType("space");
      } else if (dragType === "start" && algos.grid.matrix[x - 1][y - 1].type.name === "space") {
        if (algos.grid.startCell !== algos.grid.matrix[x - 1][y - 1]) {
          algos.grid.startCell.changeType("space");
          algos.grid.matrix[x - 1][y - 1].changeType("start");
          algos.grid.startCell = algos.grid.matrix[x - 1][y - 1];
        }
      } else if (dragType === "finish" && algos.grid.matrix[x - 1][y - 1].type.name === "space") {
        if (algos.grid.finishCell !== algos.grid.matrix[x - 1][y - 1]) {
          algos.grid.finishCell.changeType("space");
          algos.grid.matrix[x - 1][y - 1].changeType("finish");
          algos.grid.finishCell = algos.grid.matrix[x - 1][y - 1];
        }
      }
    }
  }
});


