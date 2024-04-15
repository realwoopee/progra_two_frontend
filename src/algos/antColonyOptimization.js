var width = 37;
var height = 28;
var squareSize = 30;

var canvas = document.getElementById('a-starCanvas');
var c = canvas.getContext('2d');

canvas.width = 1000;
canvas.height = 750;

function clearCanvas(){
    c.clearRect(0, 0, canvas.width, canvas.height );
    c.beginPath();
    c.rect(0, 0, canvas.width, canvas.height);
    c.fillStyle = "#ffffff";
    c.fill();
}
clearCanvas();

function Point(x, y, number){
    this.x = x;
    this.y = y;
    this.number = number;
}

//places a small circle where you click
function placePoint(x, y){
    c.beginPath();
    c.strokeStyle = "#000000";
    c.arc(x, y, 5, 0, Math.PI * 2);
    c.stroke();
}

var message = document.getElementById('WrongInputError');

function submitTriggered(){
    executed = false;
    

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
        message.innerHTML = "Input is incorrect.";
        return;
    }
    else{
        message.innerHTML = "";
        canvas.width = width * squareSize;
        canvas.height = height * squareSize;
    }


}


var cities = [];

function showPoints(cities){
    for (var i = 0;  i < cities.length; i+=1){
        c.beginPath();
        c.arc(cities[i].x, cities[i].y, 5, 0, Math.PI * 2);
        c.strokeStyle = "#000000";
        c.fillStyle = "black";
        c.fill()
        c.stroke();
    }
}

function Route(citiesOrder){
    this.citiesOrder = citiesOrder;
    this.rLength;
    this.length = this.citiesOrder.length;
}

function Path(firstCity, secondCity){
    this.distance = getDistance(firstCity, secondCity);
    this.pheromones;
}

//gets the distance between two cities
function getDistance(firstPoint, secondPoint){
    return Math.sqrt(Math.pow(firstPoint.x - secondPoint.x, 2) + Math.pow(firstPoint.y - secondPoint.y, 2));
}

const delay = (delayInms) => {
    return new Promise(resolve => setTimeout(resolve, delayInms));
};

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
    
}

function getRandomIntFromRange(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

//slice for circled arrays
function smartSlice(array, firstIndex, secondIndex){
    var newArray = [];
    for (var i = firstIndex; i % array.length != secondIndex; i+=1){
        newArray.push(array[i % array.length]);
    }
    return newArray;
}

//returns route's length (route starts and ends in the same city)
function setLength(route){
    var result = 0;
    for (var i = 0; i < route.length; i+=1){//or - 1?
        result += getDistance(route.citiesOrder[i], route.citiesOrder[(i+1)%route.length]);
    }
    route.rLength = result;
}

var beingExecuted = false;

var map = [];

async function exec(){
    routes = [];
    cities;

    for (var i = 0; i < cities.length; i+=1){
        routes.push([]);
        for (var j = 0; j < cities.length; j+=1){
            if (i != j){
                tempRoute = new Path(cities[i], cities[j]);
                tempRoute.pheromones = 0.2;
                routes[i].push(tempRoute);
            }
        }
    }

    console.log(routes);

}

var executed = false;

var execution = document.getElementById('executeAlgorithm');

function destroyCities(){
    if (!beingExecuted){
        clearCanvas();
        cities = [];
    }
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return [evt.clientX - rect.left, evt.clientY - rect.top];
}

execution.addEventListener('click', exec);

function updateLines(cities){
    var newPoint = cities[cities.length-1];
    for (var i = 0; i < cities.length; i++){
        var from = cities[i];
        var to = cities[(i+1) % cities.length];
        c.moveTo(from.x, from.y);
        c.lineTo(to.x, to.y);
        c.strokeStyle = "#900c3f";
        c.stroke();
    }
}

var counter = 0;
canvas.addEventListener('click', function(event){
    //TODO remove circle outline (idk why it happens)
    if (!beingExecuted){
        [x, y] = getMousePos(canvas, event);
        c.beginPath();
        c.arc(x, y, 5, 0, Math.PI * 2);
        c.strokeStyle = "#818181";
        c.fillStyle = "black";
        c.fill()
        c.stroke();
        cities.push(new Point(x, y, counter));
        counter+=1;
    }
});

var clearBtn = document.getElementById('clear');

clearBtn.addEventListener("click", destroyCities);

window.addEventListener('mouseup', function(){
    
});

window.addEventListener('mousedown', function(event){
    
});




