let addWallsBtn = $("#add_walls_button");
let setDestinationBtn = $("#set_destination_button");
let resetBtn = $("#reset_button");
let startPoint = null;
let endPoint = null;
let drawMode = 'wall';
let drawingWalls = false;
let stillPathfinding = false;



$(document).on("click", function (event) {
    let target = $(event.target);
    if (target.is("polygon")) {
        //set destinations
        if (drawMode === 'setDestination') {
            if (!target.data("isWall")) {
                let row = target.data("row");
                let column = target.data("column");
                let id = row + "-" + column;
                if (startPoint === null) {
                    startPoint = { "row": row, "col": column, "id": id };
                    target.attr("id", "start_point");
                    console.log("Start point ", id);
                } else if (!stillPathfinding) {
                    endPoint = { "row": row, "col": column, "id": id };
                    if($("#end_point").length > 0){
                        $("#end_point").removeAttr("id");
                        let mapHexEls = $("polygon");
                        mapHexEls.removeClass("frontier_point explored_point final_path");
                    }
                    target.attr("id", "end_point");
                    console.log("End point ", id);
                    $("button").attr("disabled","true");
                    pathfinding(startPoint, endPoint);
                }
            }
        }
    }
})

$(document).mousedown(function (event) {
    let target = $(event.target);
    if (target.is("polygon")) {
        if (drawMode === 'wall') {
            target.attr("data-isWall", "true");
            target.addClass("wall");
            drawingWalls = true;
        }
    }
})

$(window).mouseup(function () {
    if (drawingWalls) {
        drawingWalls = false;
    }
})

$(document).mouseover(function (event) {
    let target = $(event.target);
    if (target.is("polygon")) {
        if (drawingWalls) {
            target.attr("data-isWall", "true");
            target.addClass("wall");
        }
    }
})

addWallsBtn.on("click", function () {
    $("button").removeClass("button_selected");
    addWallsBtn.addClass("button_selected");
    drawMode = 'wall';
})

setDestinationBtn.on("click", function () {
    $("button").removeClass("button_selected");
    setDestinationBtn.addClass("button_selected");
    drawMode = 'setDestination';
})


let reset = function(){
    $("button").removeClass("button_selected");
    addWallsBtn.addClass("button_selected");
    let mapHexEls = $("polygon");
    mapHexEls.removeClass();
    mapHexEls.removeAttr("data-isWall");
    mapHexEls.removeAttr("id");
    startPoint = null;
    endPoint = null;
    drawMode = 'wall';
}

resetBtn.on("click", reset);
canvasWidthIncreaseBtn.on("click", reset);
canvasWidthDecreaseBtn.on("click", reset);
canvasHeightIncreaseBtn.on("click", reset);
canvasHeightDecreaseBtn.on("click", reset);
hexIncreaseBtn.on("click", reset);
hexDecreaseBtn.on("click", reset);

function getCanvasBounds() {
    let mapHexEls = $("polygon");
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

function pathfinding(startPoint, endPoint) {
    stillPathfinding = true;
    let currentHex = startPoint;
    currentHex.gscore = 1;
    let frontier = [currentHex];
    let explored = [];
    let canvasBounds = getCanvasBounds();

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
                        neighbor.hscore = Math.abs(neighbor.row - endPoint.row) + Math.abs(neighbor.col - endPoint.col);
                        neighbor.gscore = hex.gscore + 1;
                        neighbor.fscore = neighbor.hscore + neighbor.gscore;
                        neighborEl.classList.add("frontier_point");
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
            $("button").removeAttr("disabled");
            stillPathfinding = false;
            clearInterval(myTimer);
        }
    }, 50);
}

function traceFinalPath(finalPath) {
    while (finalPath.length > 0) {
        let currentHex = finalPath[0];
        console.log(currentHex);
        finalPath.splice(0, 1);
        let selectorQuerry = '[data-row="' + currentHex.row + '"][data-column="' + currentHex.col + '"]';
        let currentHexEl = document.querySelector(selectorQuerry);
        currentHexEl.classList.add("final_path");
    }
}