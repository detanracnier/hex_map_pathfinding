let svgCanvas = document.querySelector("#svg_canvas");
let canvasWidth = svgCanvas.getAttribute("width");
let canvasHeight = svgCanvas.getAttribute("height");

let hexInfo  = createHexPoints(20);

let rowNum = 0;
let columnNum = 0;
let yOffset = 0;
let shiftRowX = 0;
let shiftRowY = hexInfo.yOffset;
for(let y = hexInfo.height-shiftRowY; y < canvasHeight; y+=hexInfo.height-shiftRowY){
    let xOffset = 0;
    for(let x = hexInfo.width; x < canvasWidth; x+=hexInfo.width){
        let pointsString = "";
        for(const point of hexInfo.cords){
            let xCord = point.x+xOffset+shiftRowX;
            let yCord = point.y+yOffset;
            pointsString += `${xCord},${yCord} `;
        }
        createHexElement(rowNum+"-"+columnNum,pointsString);
        columnNum++;
        xOffset=x;
    }
    //shift every odd row
    shiftRowX===0 ? shiftRowX=hexInfo.width/2 : shiftRowX=0;
    yOffset=y;
    rowNum=0;
    columnNum++;
}

function createHexPoints(sideLength){
    let hexInfo = {};
    let charlie = sideLength;
    let alpha = Math.floor((charlie*Math.sin(30*Math.PI/180)));
    let beta = Math.floor(Math.sin(60*Math.PI/180)*charlie);
    let points=[];
    points.push({"x": 0,"y": alpha});               // point 1
    points.push({"x": 0,"y": alpha+charlie});       // point 2
    points.push({"x": beta,"y": charlie+(alpha*2)});// point 3
    points.push({"x": beta*2,"y": alpha+charlie});  // point 4
    points.push({"x": beta*2,"y": alpha});          // point 5
    points.push({"x": beta,"y": 0});                // point 6

    hexInfo.width = beta*2;
    hexInfo.height = alpha*2+charlie;
    hexInfo.yOffset = alpha;
    hexInfo.cords = points;
    return hexInfo;
}

function createHexElement(HexId,pointsString){
    let hex = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    hex.setAttribute("points",pointsString);
    hex.setAttribute("data-hexId",HexId);
    svgCanvas.appendChild(hex);
}