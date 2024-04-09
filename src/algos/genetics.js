function clearCanvas(){
    c.clearRect(0, 0, canvas.width, canvas.height );
}

var width = 37;
var height = 28;
var squareSize = 30;

var canvas = document.getElementById('a-starCanvas');
var c = canvas.getContext('2d');

canvas.width = 1000;
canvas.height = 750;

c.beginPath();
c.rect(0, 0, 1000, 750);
c.fillStyle = "#ffffff";
c.fill();

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
        fillGridWithRects();
    }


}


var points = [];

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
        var index = getRandomInt(citiesCopy.length - 1); // -1 ???
        citiesOrder.push(citiesCopy[index]);
        citiesCopy.splice(index, 1);
    }

    var newRoute = new Route(citiesOrder);
    return newRoute;
}

//slice for circled arrays
function smartSlice(array, firstIndex, secondIndex){
    var newArray = [];
    for (var i = 0; i < Math.abs(secondIndex-firstIndex); i+=1){
        newArray.push(array[(i + firstIndex) % array.length]);
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
    first = getRandomInt(route.length);
    second = getRandomInt(route.length);
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

//peculiar crossingover - treats DNA as a circled structure
function crossingover(firstRoute, secondRoute){
    var copyFirstRoute = {...firstRoute};
    var copySecondRoute = {...secondRoute};
    //cicle this around?
    var crossingoverStartPos = getRandomIntFromRange(1, firstRoute.length / 2);// or -3?
    var crossingoverLen = getRandomIntFromRange(2,  Math.floor(firstRoute.length / 2)); // +- ???

    var firstMeiosis = smartSlice(firstRoute.citiesOrder, crossingoverStartPos, crossingoverStartPos + crossingoverLen); // indexes issue
    var secondMeiosis = smartSlice(secondRoute.citiesOrder, crossingoverStartPos, crossingoverStartPos + crossingoverLen);
    if (firstMeiosis.length >= firstRoute.citiesOrder.length / 2){
        console.log("MEIOSIS POTENTIALLY TOO LONG");
    }
    if (firstMeiosis.length != crossingoverLen){
        console.log("MEIOSIS POTENTIALLY TOO SHORT");
    }

    var crossingoverSecondStartPos = crossingoverStartPos;

    for (var i = 0; i < secondRoute.citiesOrder.length; i++){ // "< secondMeiosis.length" or length +- 1 ??
        if (areSetsEqual(firstMeiosis, secondMeiosis)){
            flagForTestingCrossingoverTheory = true;
            break;
        }
        crossingoverSecondStartPos += 1;
        secondMeiosis = smartSlice(secondRoute.citiesOrder, crossingoverStartPos + i, crossingoverStartPos + crossingoverLen + i);
    }
    if (!flagForTestingCrossingoverTheory){
        console.log("CROSSINGOVER FAILED");
    }

    //SWAPPING ARRAY ELEMENTS (js links issue)
    for (var i = 0; i < firstMeiosis.length; i+=1){
        //[firstMeiosis[i], secondMeiosis[i]] = [secondMeiosis[i], firstMeiosis[i]]; // does this even swap anything?
        copyFirstRoute[crossingoverStartPos + i] = copySecondRoute[crossingoverSecondStartPos + i];
    }

    return copyFirstRoute;
}

//crossingover for all neighbour-pairs of routes
function neighbourCrossingover(routes){
    for (var i = 0; i < routes.length - 2; i+=1){
        crossingover(routes[i], routes[i+1]);
    }
}

//returns route's length (route starts and ends in the same city)
function getLength(route){
    var result = 0;
    for (var i = 0; i < route.length - 1; i+=1){//or - 0?
        result += getDistance(route[i], route[(i+1)%route.length]);
    }
    route.rLength = result;
}

function naturalSelection(routes, survivorsQuantity){
    routes.sort((firstRoute, secondRoute) => {
        return firstRoute.rLength - secondRoute.rLength;
    })
    return routes.subarray(0, survivorsQuantity); //index issue
}

async function exec(){
    let testPoint3 = new Point(100,200,3);
    let testPoint4 = new Point(50,43,4);
    let testPoint5 = new Point(80,23,5);
    let testPoint6 = new Point(33,11,6);
    let testPoint7 = new Point(25,45,7);
    let testArray1 = [testPoint3,testPoint4,testPoint5,testPoint6,testPoint7];
    let testArray2 = testArray1.slice();
    testArray2.push(testPoint3);
    var country = makeFirstPopulation(testArray1, 2);

    var testRoute1 = country[0];
    var testRoute2 = country[1];

    var testChildRoute = crossingover(testRoute1,testRoute2);

}

var executed = false;

var execution = document.getElementById("Start Routing");

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return [evt.clientX - rect.left, evt.clientY - rect.top];
}

execution.addEventListener('click', exec);

function updateLines(points){
    var newPoint = points[points.length-1];
    for (var i = 0; i < points.length - 1; i++){
        var current = points[i];
        c.moveTo(newPoint.x, newPoint.y);
        c.lineTo(current.x, current.y);
        c.strokeStyle = "#c0ff8f";
        c.stroke();
    }
}

canvas.addEventListener('click', function(event){
    //TODO remove circle outsile (idk why it happens)
    [x, y] = getMousePos(canvas, event);
    c.beginPath();
    c.arc(x, y, 5, 0, Math.PI * 2);
    c.strokeStyle = "#000000";
    c.fillStyle = "black";
    c.fill()
    c.stroke();
    points.push(new Point(x, y));
    updateLines(points);
});

var resSubBtn = document.getElementById('resolutionSubmitButton');

window.addEventListener('mouseup', function(){
    
});

window.addEventListener('mousedown', function(event){
    
});




