var mainCanvas = document.getElementById('main-canvas') as HTMLCanvasElement;
var container = document.getElementById('canvas-contaienr') as HTMLDivElement;

mainCanvas.width = 1024;
mainCanvas.height = 1024;

var context = mainCanvas.getContext("2d");
context?.fillRect(0,0,100,100);