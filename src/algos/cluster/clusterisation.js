let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let canvasSize;
function createCanvas(){
    canvasSize = parseInt(document.getElementById('size').value);
    if (canvasSize > 30) {
      alert("The size of canvas should be equal or less than 30");
      return;
    }

    canvas.width = canvasSize * 50;
    canvas.height = canvasSize * 50;

    ctx.beginPath();
    for (let i = 0; i <= canvas.width; i += 50) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
    }
    for (let i = 0; i <= canvas.height; i += 50) {
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
    }
    canvas.style.backgroundColor = 'white';
    ctx.strokeStyle = "#000";
    ctx.stroke();  
}

var сoordinates = [];
let start = null;
let matrix;
canvas.addEventListener('click', click);

function click(mouseClick) {
    let rect = canvas.getBoundingClientRect();
    let x = mouseClick.clientX - rect.left;
    let y = mouseClick.clientY - rect.top;
    let cellSize = canvas.width / canvasSize;

    let row = Math.floor(y / cellSize);
    let col = Math.floor(x / cellSize);

    сoordinates.push([row, col]);
    drawCell(row, col, 'red');
    matrix = createMatrix(canvasSize, сoordinates);

}
function createMatrix(size, coordinates) {
  const matrix = Array(size).fill().map(() => Array(size).fill(0));
  for (const [row, col] of coordinates) {
    matrix[row][col] = 1;
  }
  return matrix;
}

function drawCell(row, col, color) {
    ctx.fillStyle = color;
    ctx.fillRect(col * 50, row * 50, 50, 50);
}

function clusters(){
    coordinates = [];
    start = null;

    let kVal = document.getElementById("clusters");
    let k = kVal.value;
    if (k>7) {
        alert("The number of colors should be equal or less than 7");
    }
    const clusters = kMeansClustering(matrix, k);

    const colors = ['#ff4500', '#008080', '#000080', '#ffff00', '#800080', '#ffe4b5','#ffa07a'];

    for (let i = 0; i < clusters.length; i++) {
        const cluster = clusters[i];
        const color = colors[i % colors.length];
        for (const point of cluster) {
            drawCell(point.y, point.x, color);
            ctx.strokeStyle = "#000";
        }
    }
}

function kMeansClustering(matrix, k) {
    const points = [];
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col] == 1) {
                points.push({ x: col, y: row });
            } 
        }
  }

    let centroids = initializeCentroids(points, k);
    let clusters = assignPointsToClusters(points, centroids);
    let prevCentroids;

    do {
        prevCentroids = centroids;

        centroids = calculateCentroids(clusters);

        clusters = assignPointsToClusters(points, centroids);
    } while (!inaccuracy(prevCentroids, centroids));

    return clusters;
}

function initializeCentroids(points, k) {
    const centroids = [];
    const pointsCopy = [...points];
    while (centroids.length < k) {
        const randomInd = Math.floor(Math.random() * pointsCopy.length);
        const centroid = pointsCopy.splice(randomInd, 1)[0];
        centroids.push(centroid);
    }

    return centroids;
}

function assignPointsToClusters(points, centroids) {
    const clusters = new Array(centroids.length).fill().map(() => []);

    for (const point of points) {
        let minDistance = Infinity;
        let closestCentroidIndex = 0;

        for (let i = 0; i < centroids.length; i++) {
        const centroid = centroids[i];
        const distance = euclidDistance(point, centroid);

            if (distance < minDistance) {
                minDistance = distance;
                closestCentroidIndex = i;
            }
        }

        clusters[closestCentroidIndex].push(point);
    }

    return clusters;
}

function calculateCentroids(clusters) {
    return clusters.map((cluster) => {
        const clusterSize = cluster.length;
        const clusterSum = cluster.reduce(
        (sum, point) => ({
            x: sum.x + point.x,
            y: sum.y + point.y,
        }),
        { x: 0, y: 0 }
        );
        return {
        x: clusterSum.x / clusterSize,
        y: clusterSum.y / clusterSize,
        };
    });
}

function euclidDistance(dotA, dotB) {
    const dx = dotA.x - dotB.x;
    const dy = dotA.y - dotB.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function inaccuracy(prevCentroids, centroids) {
    for (let i = 0; i < centroids.length; i++) {
        if (euclidDistance(prevCentroids[i], centroids[i]) > 0.0001) {
        return false;
        }
    }
    return true;
}

var execBtn = document.getElementById("execution");

execBtn.addEventListener('click', () => clusters());

var createCanvasBtn = document.getElementById("createCanvas");

createCanvasBtn.addEventListener('click', () => createCanvas());