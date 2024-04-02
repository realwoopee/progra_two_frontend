var mainCanvas = document.getElementById("main-canvas") as HTMLCanvasElement;

mainCanvas.width = 1024;
mainCanvas.height = 1024;

var context = mainCanvas.getContext("2d");

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

class GameOfLife {
  data: number[][] = [];

  runner: NodeJS.Timeout | null = null;

  // FPS = 1 / speed;
  private _speed: number = 13;

  get speed() {
    return this._speed;
  }

  set speed(value: number) {
    this._speed = value;
    if(this.runner){
      this.stop();
      this.start();
    }
  }

  render: ((data: typeof this.data) => void) | null = null;

  public constructor(size: number) {
    for (var i: number = 0; i < size; i++) {
      this.data[i] = [];
      for (var j: number = 0; j < size; j++) {
        this.data[i][j] = Math.floor(Math.random() * 2);
      }
    }
  }


  public step() {
    const newdata = this.data.map(arr => arr.slice());

    let y_size = this.data.length;

    for (let y = 0; y < y_size; y++) {
      let x_size = this.data[y].length;
      for (let x = 0; x < x_size; x++) {
        let count = 0;
        count += this.data[mod(y - 1, y_size)][mod(x - 1, x_size)] + this.data[mod(y - 1, y_size)][x] + this.data[mod(y - 1, y_size)][mod(x + 1, x_size)];
        count += this.data[mod(y, y_size)][mod(x - 1, x_size)] + this.data[mod(y, y_size)][mod(x + 1, x_size)];
        count += this.data[mod(y + 1, y_size)][mod(x - 1, x_size)] + this.data[mod(y + 1, y_size)][x] + this.data[mod(y + 1, y_size)][mod(x + 1, x_size)];
        if (this.data[y][x] === 1)
          if (count < 2 || count > 3)
            newdata[y][x] = 0;
        if (this.data[y][x] === 0)
          if (count === 3)
            newdata[y][x] = 1;
      }
    }
    this.data = newdata;
  }

  public start() {
    this.runner = setInterval(() => {
      this.render?.(this.data);
      this.step();
    }, this.speed);
  }

  public stop() {
    if (this.runner)
      clearInterval(this.runner);
  }
}

var game = new GameOfLife(128);
var t = 32;
game.data[t + 0][t + 2] = game.data[t + 1][t + 2] = game.data[t + 0][t + 3] = game.data[t + 1][t + 3] = game.data[t + 2][t + 2] = game.data[t + 2][t + 0] = game.data[t + 2][t + 1] = game.data[t + 2][t + 2] = game.data[t + 3][t + 1] = 1;

game.render = (data: typeof game.data) => {
  for (var i: number = 0; i < data.length; i++) {
    for (var j: number = 0; j < data[i].length; j++) {
      context!.fillStyle = data[i][j] === 1 ? "white" : "black";
      context?.fillRect(j * (1024 / data.length), i * (1024 / data.length), 1024 / data.length, 1024 / data[i].length);
    }
  }
};

const step_button = document.getElementById("button-step") as HTMLButtonElement;
step_button.onclick = () => {
  game.step();
  game.render?.(game.data);
};

const start_button = document.getElementById("button-start") as HTMLButtonElement;
start_button.onclick = () => game.start();

const stop_button = document.getElementById("button-stop") as HTMLButtonElement;
stop_button.onclick = () => game.stop();

const speed_range = document.getElementById('range-speed') as HTMLInputElement;
const speed_range_indicator = document.getElementById('range-speed-value') as HTMLSpanElement;
game.speed = speed_range.valueAsNumber;
speed_range_indicator.innerText = game.speed.toString();
speed_range.oninput = () => {
  game.speed = speed_range.valueAsNumber;
  speed_range_indicator.innerText = game.speed.toString();
};
