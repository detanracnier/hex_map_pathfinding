let mapHexEls = $(".map_hex");
let addWallsBtn = $("#add_walls_button");
let setDestinationBtn = $("#set_destination_button");
let resetBtn = $("#reset_button");
let startPoint = null;
let endPoint = null;
let drawMode = 'wall';
let drawingWalls = false;

let canvasBounds = getCanvasBounds();

mapHexEls.on("click", function (event) {
    //set destinations
    if (drawMode === 'setDestination') {
        if (!$(this).data("isWall")) {
            let row = $(this).data("row");
            let column = $(this).data("column");
            let id = row + "-" + column;
            if (startPoint === null) {
                startPoint = { "row": row, "col": column, "id": id };
                $(this).attr("id","start_point");
                console.log("Start point ", id);
            } else if (endPoint === null) {
                endPoint = { "row": row, "col": column, "id": id };
                $(this).attr("id","end_point");
                console.log("End point ", id);
                pathfinding(startPoint, endPoint, canvasBounds);
            }
        }
    }
})

mapHexEls.mousedown(function(){
    if(drawMode==='wall'){
        $(this).attr("data-isWall", "true");
        $(this).addClass("wall");
        $(this).removeClass("map_hex");
        drawingWalls = true;
    }
})

$(window).mouseup(function(){
    if(drawingWalls){
        drawingWalls = false;
    }
})

mapHexEls.mouseover(function(event){
    if(drawingWalls){
        $(this).attr("data-isWall", "true");
        $(this).addClass("wall");
        $(this).removeClass("map_hex");
    }
})
addWallsBtn.on("click", function () {
    drawMode = 'wall';
})

setDestinationBtn.on("click", function () {
    drawMode = 'setDestination';
})

resetBtn.on("click", function () {
    mapHexEls.removeClass();
    mapHexEls.addClass("map_hex");
    mapHexEls.removeAttr("data-isWall");
    mapHexEls.removeAttr("id");
    startPoint = null;
    endPoint = null;
    drawMode = 'wall';
})

function getCanvasBounds() {
    let rowMax = 0;
    let colMax = 0;
    mapHexEls.each(function () {
        let currentRow = $(this).data("row");
        let currentCol = $(this).data("column");
        if (currentRow > rowMax) {
            rowMax = currentRow;
        }
        if (currentCol > colMax) {
            colMax = currentCol;
        }
    });

    return { "row": rowMax, "col": colMax };
}

function pathfinding(startPoint, endPoint, canvasBounds) {
    let currentHex = startPoint;
    let frontier = [currentHex];
    let explored = [];


    getNeighbors = function (hex) {
        let nRow = "";
        let nCol = "";

        //North West Neighbor
        nRow = hex.row - 1;
        nCol = hex.row % 2 === 0 ? hex.col - 1 : hex.col;
        addNeighbor(nRow, nCol, hex);
        //North East Neighbor
        nRow = hex.row - 1;
        nCol = hex.row % 2 === 0 ? hex.col : hex.col + 1;
        addNeighbor(nRow, nCol, hex);
        //East Neighbor
        nRow = hex.row;
        nCol = hex.col + 1;
        addNeighbor(nRow, nCol, hex);
        //South East Neighbor
        nRow = hex.row + 1;
        nCol = hex.row % 2 === 0 ? hex.col : hex.col + 1;
        addNeighbor(nRow, nCol, hex);
        //South West Neighbor
        nRow = hex.row + 1;
        nCol = hex.row % 2 === 0 ? hex.col - 1 : hex.col;
        addNeighbor(nRow, nCol, hex);
        //West Neighbor
        nRow = hex.row;
        nCol = hex.col - 1;
        addNeighbor(nRow, nCol, hex);
    }

    addNeighbor = function (nRow, nCol, hex) {
        //Check if withing canvas bounds
        if (nRow >= 0 && nRow < canvasBounds.row + 1 && nCol >= 0 && nCol < canvasBounds.col + 1) {
            let nId = nRow + "-" + nCol;
            //Make sure hex is not already in the frontier array
            if (frontier.filter(fhex => fhex.id === nId).length === 0) {
                //Make sure hex is not already in the explored array
                if (explored.filter(ehex => ehex.id === nId).length === 0) {
                    neighbor = { "row": nRow, "col": nCol, "id": nId };
                    let selectorQuerry = '[data-row="' + neighbor.row + '"][data-column="' + neighbor.col + '"]';
                    let neighborEl = document.querySelector(selectorQuerry);
                    if (neighborEl.getAttribute("data-isWall")) {

                    } else {
                        neighbor.parent = hex;
                        neighbor.fscore = Math.abs(neighbor.row - endPoint.row) + Math.abs(neighbor.col - endPoint.col);
                        neighborEl.classList.add("frontier_point");
                        neighborEl.classList.remove("map_hex");
                        frontier.push(neighbor);
                    }
                }
            }
        }
    }

    let myTimer = setInterval(function () {
        if (frontier.length > 0) {
            currentHex = frontier[0];
            let selectorQuerry = '[data-row="' + currentHex.row + '"][data-column="' + currentHex.col + '"]';
            let currentHexEl = document.querySelector(selectorQuerry);
            currentHexEl.classList.add("explored_point");
            currentHexEl.classList.remove("map_hex");
            //Are we at the end point?
            if (currentHex.id === endPoint.id) {
                frontier = [];
                let finalPath = [];
                while (currentHex.parent) {
                    finalPath.push(currentHex);
                    currentHex = currentHex.parent;
                }
                finalPath.reverse();
                traceFinalPath(finalPath);
            } else {
                explored.push(frontier[0]);
                frontier.splice(0, 1);
                getNeighbors(currentHex);
                frontier.sort((a, b) => (a.fscore > b.fscore) ? 1 : -1);
            }
        } else {
            clearInterval(myTimer);
        }
    }, 50);
}

function traceFinalPath(finalPath) {
    while (finalPath.length > 0) {
        let currentHex = finalPath[0];
        finalPath.splice(0, 1);
        let selectorQuerry = '[data-row="' + currentHex.row + '"][data-column="' + currentHex.col + '"]';
        let currentHexEl = document.querySelector(selectorQuerry);
        currentHexEl.classList.add("final_path");
        currentHexEl.classList.remove("map_hex");
    }
}