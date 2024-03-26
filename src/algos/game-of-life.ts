var mainCanvas = document.getElementById('main-canvas') as HTMLCanvasElement;
var container = document.getElementById('canvas-contaienr') as HTMLDivElement;

mainCanvas.width = 1024;
mainCanvas.height = 1024;

var context = mainCanvas.getContext("2d");

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
        let y_size = this.data.length;
        for (let y = 0; y < this.data.length; y++) {
            let x_size = this.data[y].length;
            for(let x = 0; x < this.data[y].length; y++) {
                let count = 0;
                count += this.data[(y - 1)%y_size][(x - 1) % x_size] + this.data[(y - 1)%y_size][(x) % x_size] + this.data[(y - 1)%y_size][(x + 1) % x_size];
                count += this.data[(y)%y_size][(x - 1) % x_size] + 0 + this.data[(y)%y_size][(x + 1) % x_size];
                count += this.data[(y + 1)%y_size][(x - 1) % x_size] + this.data[(y + 1)%y_size][(x) % x_size] + this.data[(y + 1)%y_size][(x + 1) % x_size];
                if(count < 3 || count > 5)
                    this.data[y][x] = 0;
                else
                    this.data[y][x] = 1;
            }
        }
    }
}

var game = new GameOfLife(128);

setInterval(() => {
    for(var i: number = 0; i < game.data.length; i++) {
        for(var j: number = 0; j < game.data[i].length; j++) {
            context!.fillStyle = game.data[i][j] === 1 ? 'white' : 'black';
            context?.fillRect(j * (1024/game.data.length), i * (1024/game.data.length), 1024/game.data.length, 1024/game.data[i].length);
        }
    }
    
}, 500);