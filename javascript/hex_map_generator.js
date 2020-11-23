let svgCanvas = document.querySelector("#svg_canvas");
let canvasWidth = svgCanvas.getAttribute("width");
let canvasHeight = svgCanvas.getAttribute("height");
let canvasWidthIncreaseBtn = $("#increase_canvas_width_button");
let canvasWidthDecreaseBtn = $("#decrease_canvas_width_button");
let canvasHeightIncreaseBtn = $("#increase_canvas_height_button");
let canvasHeightDecreaseBtn = $("#decrease_canvas_height_button");
let hexIncreaseBtn = $("#increase_hex_button");
let hexDecreaseBtn = $("#decrease_hex_button");
let hexSize = 15;

hexIncreaseBtn.on("click", function () {
    hexSize += 2;
    createHexMap(hexSize);
})

hexDecreaseBtn.on("click", function () {
    if (hexSize > 5) {
        hexSize -= 2;
        createHexMap(hexSize);
    }
})

canvasWidthIncreaseBtn.on("click", function () {
    if (canvasWidth < 1400) {
        canvasWidth += 50;
        $("#svg_canvas").attr("width", canvasWidth);
        createHexMap(hexSize);
    }
})

canvasWidthDecreaseBtn.on("click", function () {
    if (canvasWidth > 200) {
        canvasWidth -= 50;
        $("#svg_canvas").attr("width", canvasWidth);
        createHexMap(hexSize);
    }
})

canvasHeightIncreaseBtn.on("click", function () {
    if (canvasHeight < 1400) {
        canvasHeight += 50;
        $("#svg_canvas").attr("height", canvasHeight)
        createHexMap(hexSize);
    }
})

canvasHeightDecreaseBtn.on("click", function () {
    if (canvasHeight > 200) {
        canvasHeight -= 50;
        $("#svg_canvas").attr("height", canvasHeight)
        createHexMap(hexSize);
    }
})


function createHexMap(hexSize) {
    svgCanvas.innerHTML = '';
    let hexInfo = getHexInfo(hexSize);
    let rowNum = 0;
    let columnNum = 0;
    let yOffset = 0;
    let shiftRowX = 0;
    let shiftRowY = hexInfo.yOffset;
    for (let y = hexInfo.height - shiftRowY; y < canvasHeight; y += hexInfo.height - shiftRowY) {
        let xOffset = 0;
        for (let x = hexInfo.width; x < canvasWidth; x += hexInfo.width) {
            let pointsString = "";
            for (const point of hexInfo.cords) {
                let xCord = point.x + xOffset + shiftRowX;
                let yCord = point.y + yOffset;
                pointsString += `${xCord},${yCord} `;
            }
            createHexElement(rowNum, columnNum, pointsString);
            columnNum++;
            xOffset = x;
        }
        //shift every odd row
        shiftRowX === 0 ? shiftRowX = hexInfo.width / 2 : shiftRowX = 0;
        yOffset = y;
        rowNum++;
        columnNum = 0;
    }
}

function getHexInfo(sideLength) {
    let hexInfo = {};
    let charlie = sideLength;
    let alpha = Math.floor((charlie * Math.sin(30 * Math.PI / 180)));
    let beta = Math.floor(Math.sin(60 * Math.PI / 180) * charlie);
    let points = [];
    points.push({ "x": 0, "y": alpha });               // point 1
    points.push({ "x": 0, "y": alpha + charlie });       // point 2
    points.push({ "x": beta, "y": charlie + (alpha * 2) });// point 3
    points.push({ "x": beta * 2, "y": alpha + charlie });  // point 4
    points.push({ "x": beta * 2, "y": alpha });          // point 5
    points.push({ "x": beta, "y": 0 });                // point 6

    hexInfo.width = beta * 2;
    hexInfo.height = alpha * 2 + charlie;
    hexInfo.yOffset = alpha;
    hexInfo.cords = points;
    return hexInfo;
}

function createHexElement(rowNum, columnNum, pointsString) {
    let hex = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    hex.classList.add("map_hex");
    hex.setAttribute("points", pointsString);
    hex.setAttribute("data-row", rowNum);
    hex.setAttribute("data-column", columnNum);
    svgCanvas.appendChild(hex);
}

$(document).ready(function () {
    canvasWidth = Math.floor($("#main_container").width() * 0.90);
    canvasHeight = Math.floor(canvasWidth * 1.2);
    $("#svg_canvas").attr("height", canvasHeight);
    $("#svg_canvas").attr("width", canvasWidth);
    createHexMap(hexSize);
})
