let mapHexEls = $(".map_hex");
let addWallsBtn = $("#add_walls_button");
let setDestinationBtn = $("#set_destination_button");
let resetBtn = $("#reset_button");
let startPoint = null;
let endPoint = null;
let wallMode = true;

let canvasBounds = getCanvasBounds();

mapHexEls.on("click", function (event) {
    if (!wallMode) {
        if (!$(this).data("isWall")) {
            let row = $(this).data("row");
            let column = $(this).data("column");
            let id = row + "-" + column;
            if (startPoint === null) {
                startPoint = { "row": row, "col": column, "id": id };
                $(this).addClass("start_point");
                $(this).removeClass("map_hex");
                console.log("Start point ", id);
            } else if (endPoint === null) {
                endPoint = { "row": row, "col": column, "id": id };
                $(this).addClass("end_point");
                $(this).removeClass("map_hex");
                console.log("End point ", id);
                pathfinding(startPoint, endPoint, canvasBounds);
            }
        }
    } else {
        $(this).attr("data-isWall", "true");
        $(this).addClass("wall");
        $(this).removeClass("map_hex");
    }
})

addWallsBtn.on("click", function () {
    wallMode = true;
})

setDestinationBtn.on("click", function () {
    wallMode = false;
})

resetBtn.on("click", function () {
    mapHexEls.addClass("map_hex");
    mapHexEls.removeClass("start_point");
    mapHexEls.removeClass("end_point");
    mapHexEls.removeClass("frontier_point");
    mapHexEls.removeClass("wall");
    mapHexEls.removeData("isWall");
    startPoint = null;
    endPoint = null;
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
        let nId = "";

        //North West Neighbor
        nRow = hex.row - 1;
        nCol = hex.row % 2 === 0 ? hex.col - 1 : hex.col;
        addNeighbor(nRow, nCol);
        //North East Neighbor
        nRow = hex.row - 1;
        nCol = hex.row % 2 === 0 ? hex.col : hex.col + 1;
        addNeighbor(nRow, nCol);
        //East Neighbor
        nRow = hex.row;
        nCol = hex.col + 1;
        addNeighbor(nRow, nCol);
        //South East Neighbor
        nRow = hex.row + 1;
        nCol = hex.row % 2 === 0 ? hex.col : hex.col + 1;
        addNeighbor(nRow, nCol);
        //South West Neighbor
        nRow = hex.row + 1;
        nCol = hex.row % 2 === 0 ? hex.col - 1 : hex.col;
        addNeighbor(nRow, nCol);
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
                    let selectorQuerry = '[data-row="'+neighbor.row+'"][data-column="'+neighbor.col+'"]';
                    let neighborEl = document.querySelector(selectorQuerry);
                    console.log(neighborEl);
                    console.log(neighborEl.getAttribute("data-isWall"));
                    if(neighborEl.getAttribute("data-isWall")){
                        console.log(neighborEl);
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
            //Are we at the end point?
            if (currentHex.id === endPoint.id) {
                frontier = [];
                //
                //
                //
                //
                //

            } else {
                explored.push(frontier[0]);
                frontier.splice(0, 1);
                getNeighbors(currentHex);
                frontier.sort((a, b) => (a.fscore > b.fscore) ? 1 : -1);
            }
        } else {
            clearInterval(myTimer);
        }
    }, 200);
}