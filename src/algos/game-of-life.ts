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
    if (this.runner) {
      this.stop();
      this.start();
    }
  }

  get isRunning() {
    return this.runner !== null;
  }

  renderCell: ((data: number, x: number, y: number) => void) | null = null;

  public constructor(size: number) {
    for (var i: number = 0; i < size; i++) {
      this.data[i] = [];
      for (var j: number = 0; j < size; j++) {
        this.data[i][j] = 0; //Math.floor(Math.random() * 2);
      }
    }
  }

  public render() {
    for (var i: number = 0; i < this.data.length; i++) {
      for (var j: number = 0; j < this.data[i].length; j++) {
        this.renderCell?.(this.data[i][j], i, j);
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
      this.step();
      this.render();
    }, this.speed);
  }

  public stop() {
    if (this.runner)
      clearInterval(this.runner);
    this.runner = null;
  }
}

class GameUI {
  private _game: GameOfLife;
  private _controls: Record<string, HTMLElement>;

  public constructor(game?: GameOfLife) {
    this._game = game ?? new GameOfLife(128);
    this._controls = {};
  }

  private init_controls() {
    this._controls['button-step'] = document.getElementById("button-step") as HTMLButtonElement;
    this._controls['button-step'].onclick = () => this.step_click();

    this._controls['button-play'] = document.getElementById("button-play") as HTMLButtonElement;
    this._controls['button-play'].onclick = () => this.play_click();

    this._controls['button-clear'] = document.getElementById("button-clear") as HTMLButtonElement;
    this._controls['button-clear'].onclick = () => this.clear_click();

    this._controls['button-random'] = document.getElementById("button-random") as HTMLButtonElement;
    this._controls['button-random'].onclick = () => this.randomize_click();

    this._controls['range-speed'] = document.getElementById('range-speed') as HTMLInputElement;
    this._controls['range-speed-value'] = document.getElementById('range-speed-value') as HTMLSpanElement;

    const speed_value = Math.round(1000 / 30);
    (this._controls['range-speed'] as HTMLInputElement).valueAsNumber = speed_value;
    this._game.speed = speed_value;

    this._controls['range-speed'].oninput = () => {
      const speed_value = (this._controls['range-speed'] as HTMLInputElement).valueAsNumber;
      this._game.speed = speed_value;
    };
  }

  public init() {
    this.init_controls();


    this._game.render();
  }

  public play_click() {
    if (this._game.isRunning) {
      this._game.stop();
      this._controls['button-play'].classList.remove('bi-pause');
      this._controls['button-play'].classList.add('bi-play');
      this._controls['button-play'].innerText = 'Start';
    }
    else {
      this._game.start();
      this._controls['button-play'].classList.remove('bi-play');
      this._controls['button-play'].classList.add('bi-pause');
      this._controls['button-play'].innerText = 'Stop';
    }

  }

  public step_click() {
    this._game.step();
    this._game.render();
  }

  public clear_click() {
    for (var i: number = 0; i < this._game.data.length; i++) {
      for (var j: number = 0; j < this._game.data[i].length; j++) {
        this._game.data[i][j] = 0;
      }
    }
    this._game.render();
  }

  public randomize_click() {
    for (var i: number = 0; i < this._game.data.length; i++) {
      for (var j: number = 0; j < this._game.data[i].length; j++) {
        this._game.data[i][j] = Math.floor(Math.random() * 2);
      }
    }
    this._game.render();
  }
}

const renderToCanvas = (cell: number, i: number, j: number) => {
  context!.fillStyle = cell === 1 ? "white" : "black";
  context?.fillRect(j * (mainCanvas.width / game.data.length), i * (mainCanvas.height / game.data[i].length), mainCanvas.width / game.data.length, mainCanvas.height / game.data[i].length);
};

const template1 = (game: GameOfLife) => {
  var t = 32;
  game.data[t + 0][t + 2] = game.data[t + 1][t + 2] = game.data[t + 0][t + 3] 
  = game.data[t + 1][t + 3] = game.data[t + 2][t + 2] = game.data[t + 2][t + 0] 
  = game.data[t + 2][t + 1] = game.data[t + 2][t + 2] = game.data[t + 3][t + 1] = 1;
}

var game = new GameOfLife(128);
template1(game);
game.renderCell = renderToCanvas;
game.render();

var ui = new GameUI(game);
ui.init();
