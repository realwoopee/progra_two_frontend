var mainCanvas = document.getElementById('main-canvas') as HTMLCanvasElement;
var container = document.getElementById('canvas-contaienr') as HTMLDivElement;

mainCanvas.width = 1024;
mainCanvas.height = 1024;

var context = mainCanvas.getContext("2d");

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

class GameOfLife {
    data: number[][] = [];

    public constructor(size: number) {
        for(var i: number = 0; i < size; i++) {
            this.data[i] = [];
            for(var j: number = 0; j< size; j++) {
                this.data[i][j] = 0;
            }
        }
    }


    public step() {
        const newdata = this.data.map(arr => arr.slice());

        let y_size = this.data.length;

        for (let y = 0; y < y_size; y++) {
            let x_size = this.data[y].length;
            for(let x = 0; x < x_size; x++) {
                let count = 0;
                count += this.data[mod(y - 1,  y_size)][mod(x - 1, x_size)] + this.data[mod(y - 1,  y_size)][x] + this.data[mod(y - 1,  y_size)][mod(x + 1, x_size)];
                count += this.data[mod(y,  y_size)][mod(x - 1, x_size)] + this.data[mod(y,  y_size)][mod(x + 1, x_size)];
                count += this.data[mod(y + 1,  y_size)][mod(x - 1, x_size)] + this.data[mod(y + 1,  y_size)][x] + this.data[mod(y + 1,  y_size)][mod(x + 1, x_size)];
                if(this.data[y][x] === 1)
                  if(count < 2 || count > 3)
                    newdata[y][x] = 0;
                if(this.data[y][x] === 0)
                  if(count === 3)
                    newdata[y][x] = 1;
            }
        }
        this.data = newdata;
    }
}

var game = new GameOfLife(16);
game.data[0][1] = game.data[1][2] = game.data[2][0] = game.data[2][1] = game.data[2][2] = 1;

setInterval(() => {
    for(var i: number = 0; i < game.data.length; i++) {
        for(var j: number = 0; j < game.data[i].length; j++) {
            context!.fillStyle = game.data[i][j] === 1 ? 'white' : 'black';
            context?.fillRect(j * (1024/game.data.length), i * (1024/game.data.length), 1024/game.data.length, 1024/game.data[i].length);
        }
    }
    game.step();
    
}, 100);
