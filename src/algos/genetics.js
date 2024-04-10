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
    }


}


var points = [];

function showPoints(points){
    for (var i = 0;  i < points.length; i+=1){
        c.beginPath();
        c.arc(points[i].x, points[i].y, 5, 0, Math.PI * 2);
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

//gets the distance between two points
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
  

function generateRandomRoute(cities){
    var citiesCopy = cities.map((x) => x);
    var citiesOrder = [];
    while (citiesCopy.length > 0){
        var index = getRandomInt(citiesCopy.length); // -1 ???
        citiesOrder.push(citiesCopy[index]);
        citiesCopy.splice(index, 1);
    }

    var newRoute = new Route(citiesOrder);
    return newRoute;
}

//slice for circled arrays
function smartSlice(array, firstIndex, secondIndex){
    var newArray = [];
    for (var i = firstIndex; i % array.length != secondIndex; i+=1){
        newArray.push(array[i % array.length]);
    }
    return newArray;
}

//changes two random cities in a route
function shuffleRoute(route){
    var first;
    var second;
    while (first == second){
    first = getRandomInt(route.length);
    second = getRandomInt(route.length);
    }
    var temp = route.citiesOrder[first];
    route.citiesOrder[first] = route.citiesOrder[second];
    route.citiesOrder[second] = temp;
}

//changes two random cities in an array
function shuffleArray(array){
    var first;
    var second;
    while (first == second){
    first = getRandomInt(array.length);
    second = getRandomInt(array.length);
    }
    var temp = array[first];
    array[first] = array[second];
    array[second] = temp;
}

//makes a new route by shuffling route and returns it
function getMutant(route){
    var mutantRoute = new Route(route.citiesOrder);
    shuffle(mutantRoute);
    return mutantRoute;
}

//returns an array of given size filled with random routes
function makeFirstPopulation(cities, size){
    var firstPopulation = [];
    for (var i = 0; i < size; i++){
        firstPopulation.push(generateRandomRoute(cities));
    }
    return firstPopulation;
}

//shuffles each route in routes
function shuffleRoutes(routes){
    for (var i = 0; i < routes.length; i++){
        //shuffle(routes[i], routes[(i+1)%routes.length]); //will it change the array?
        shuffle(routes[i]);
    }
}

//checks whether sets of elements of two given containers are the same
function areSetsEqual(first, second){
    if (first.length != second.length){
        console.log("LENGTHS OF GIVEN ARRAYS ARE DIFFERENT");
        return false;
    }
    for (var i = 0; i < first.length; i++){
        if (!second.includes(first[i])){
            return false
        }
    }
    return true;
}

var flagForTestingCrossingoverTheory = false;

//takes a part of a route and shuffles it multiple times
function imitateCrossingover(route){
    var copyCitiesOrder = [];
    for (var i = 0; i < route.length; i+=1){
        copyCitiesOrder.push(route.citiesOrder[i]);
    }
    
    var crossingoverStartPos = getRandomIntFromRange(1, copyCitiesOrder.length - 1);
    var crossingoverLength = getRandomIntFromRange(2, copyCitiesOrder.length / 2 + 1);

    var meiosis = smartSlice(route.citiesOrder, crossingoverStartPos, (crossingoverStartPos + crossingoverLength) % route.length);

    for (var i = 0; i < getRandomIntFromRange(1, meiosis.length); i+=1){
        shuffleArray(meiosis);
    }

    for (var i = crossingoverStartPos; i < crossingoverStartPos + crossingoverLength; i+=1){
        copyCitiesOrder[i % copyCitiesOrder.length] = meiosis[i - crossingoverStartPos];
    }

    var newRoute = new Route(copyCitiesOrder);

    return newRoute;
}

//crossingover for all neighbour-pairs of routes
function neighbourCrossingover(routes){
    var loopLimit = routes.length;
    for (var i = 0; i < loopLimit; i+=1){
        var newRoute = imitateCrossingover(routes[i]);
        routes.push(newRoute);
    }
    return routes;
}

//returns route's length (route starts and ends in the same city)
function setLength(route){
    var result = 0;
    for (var i = 0; i < route.length; i+=1){//or - 1?
        result += getDistance(route.citiesOrder[i], route.citiesOrder[(i+1)%route.length]);
    }
    route.rLength = result;
}

function naturalSelection(routes, survivorsQuantity){
    for (var i = 0; i < routes.length; i+=1){
        setLength(routes[i]);
    }
    routes.sort((firstRoute, secondRoute) => {
        return firstRoute.rLength - secondRoute.rLength;
    })
    return routes.slice(0, survivorsQuantity); //index issue
}

async function exec(){
    clearCanvas();
    showPoints(points);

    if (points.length === 2){
        updateLines(points);
        return;
    }
    var testSet;
    var population = makeFirstPopulation(points, 5);
    for (var i = 0; i < 1000; i+=1){
        population = neighbourCrossingover(population);
        testSet = new Set(population[0].citiesOrder);
        if (!testSet.size === population[0].length){
            console.log("CROSSINGOVER FAILED");
        }
        population = naturalSelection(population, 5);
        if (!testSet.size === population[0].length){
            console.log("SELECTION FAILED");
        }
    }

    var bestRouteFound = population[0];
    testSet = new Set(bestRouteFound.citiesOrder);
    if (!testSet.size === population[0].length){
        console.log("SELECTION FAILED");
    }
    updateLines(bestRouteFound.citiesOrder);

}

var executed = false;

var execution = document.getElementById('executeAlgorithm');

function destroyCities(){
    clearCanvas();
    points = [];
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return [evt.clientX - rect.left, evt.clientY - rect.top];
}

execution.addEventListener('click', exec);

function updateLines(points){
    var newPoint = points[points.length-1];
    for (var i = 0; i < points.length; i++){
        var from = points[i];
        var to = points[(i+1) % points.length];
        c.moveTo(from.x, from.y);
        c.lineTo(to.x, to.y);
        c.strokeStyle = "#900c3f";
        c.stroke();
    }
}

var counter = 1;
canvas.addEventListener('click', function(event){
    //TODO remove circle outline (idk why it happens)
    
    [x, y] = getMousePos(canvas, event);
    c.beginPath();
    c.arc(x, y, 5, 0, Math.PI * 2);
    c.strokeStyle = "#818181";
    c.fillStyle = "black";
    c.fill()
    c.stroke();
    points.push(new Point(x, y, counter));
    counter+=1;
});

var clearBtn = document.getElementById('clear');

clearBtn.addEventListener("click", destroyCities);

window.addEventListener('mouseup', function(){
    
});

window.addEventListener('mousedown', function(event){
    
});




