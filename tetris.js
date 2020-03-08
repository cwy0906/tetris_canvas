//畫布相關設定
var canvas = document.getElementById("gameScreen");
var ctx = canvas.getContext("2d");
var gridLength = 40;

//遊戲公共訊息
var score = 0;
var level = 1;
var nextOneBlockedBoolean = false;

//骨牌共通設定
var tetrominoSpeed   = 1;
var speedLv          = 1;
var crossStep        = 1;

//按鍵事件布林
var rightPressed = false;
var leftPressed  = false;
var spinPressed  = false;
var controllFlag = 0;

//設定初始背景陣列
var arrayBackground = [];
for(let i=0; i<20; i++) {
    arrayBackground[i] = [];
    for(let j=0; j<10; j++) {
        arrayBackground[i][j] = 0;
    }    
}

//骨牌對照瑪(0:J,1:L,2:T,3:S,4:Z,5:O,6:I)
var polyominoKindList   = [ [[5,1],[4,0],[4,1],[6,1]], [[5,1],[6,0],[4,1],[6,1]],
                            [[5,1],[5,0],[4,1],[6,1]], [[5,1],[5,0],[6,0],[4,1]],
                            [[5,1],[4,0],[5,0],[6,1]], [[5,1],[4,0],[5,0],[4,1]],
                            [[5,1],[4,1],[6,1],[7,1]],                         ];
var polyominoColorList  = [ "#0040FF", "#FFBF00",
                            "#8000FF", "#40FF00",
                            "#FF0000", "#00FFFF",
                            "#F5ED00" ];
var polyominoSpinList   = [  0, 0,
                             0, 0,
                             0, 1,
                             2 ];                            

//骨牌設定測試1
var polyominoCode       = getRandomInt(0,7);
var polyominoArray      = JSON.parse(JSON.stringify(polyominoKindList[polyominoCode]));
var polyominoColor      = polyominoColorList[polyominoCode];
var polyominoSpin       = polyominoSpinList[polyominoCode];
var nextPolyominoCode   = getRandomInt(0,7);
var nextPolyominoArray  = JSON.parse(JSON.stringify(polyominoKindList[nextPolyominoCode]));
var nextPolyominoColor  = polyominoColorList[nextPolyominoCode];
var nextPolyominoSpin   = polyominoSpinList[nextPolyominoCode];
var counter = 0;

//設定鍵盤監聽事件
document.addEventListener("keypress", keyPressHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
window.requestAnimationFrame(gameLoop);

function keyPressHandler(e) {
    if(e.key === "d") {
        rightPressed = true;
    }else if(e.key === "a") {
        leftPressed = true;
    }else if(e.key === "w") {
        spinPressed = true;
    }
}

function keyUpHandler(e) {
    if(e.key === "d") {
        rightPressed = false;
    }else if(e.key === "a") {
        leftPressed = false;
    }else if(e.key === "w") {
        spinPressed = false;
    }
}

var oldTimeStamp = 0;
//主要遊戲迴圈
function gameLoop(timestamp) {

    counter = counter+1;
    
    if( counter%28===0 ){
        fall(timestamp);    
    }

    if( counter%4===0 ) {
        controll(timestamp); 
    }
    
    if( counter%2===0 ) {    
        update(timestamp);
    }

    if(!nextOneBlockedBoolean) {
        draw();        
    }else{        
        drawGameOver();
        alert("Game Over! Your Score is "+score);
        score = 0;
        document.location.reload();
    }

    window.requestAnimationFrame(gameLoop);
          
}

//控制
function controll(timestamp) {

    //左右移動與邊界限制
    let rightLimit            = setRightBoundary();
    let leftLimit             = setLeftBoundary();
    let rightContactBoolean   = isRightBoundaryContact();
    let leftContactBoolean    = isLeftBoundaryContact();
        
    if( rightPressed  && rightLimit>1 && !rightContactBoolean ) {
        polyominoArray = shiftPolyominoRight();
        rightPressed   = false;
    } else if( leftPressed && leftLimit>1 && !leftContactBoolean ) {        
        polyominoArray = shiftPolyominoLeft();
        leftPressed    = false;
    }

    //骨牌旋轉與限制
    let spinAbleBoolean = isSpinAble();
    if( spinPressed && spinAbleBoolean ) {
        polyominoArray  = spinPolyominoClockwise();
        spinPressed = false;    
    }

}

//骨牌落下
function fall(timestamp){
    let dx = tetrominoSpeed*speedLv;
    polyominoArray[0][1] = polyominoArray[0][1]+dx;
    polyominoArray[1][1] = polyominoArray[1][1]+dx;
    polyominoArray[2][1] = polyominoArray[2][1]+dx;
    polyominoArray[3][1] = polyominoArray[3][1]+dx;
    if((polyominoArray[0][1]>19) || (polyominoArray[1][1]>19) || 
       (polyominoArray[2][1]>19) || (polyominoArray[3][1]>19)) {
        polyominoArray[0][1] = polyominoArray[0][1]-dx;
        polyominoArray[1][1] = polyominoArray[1][1]-dx;
        polyominoArray[2][1] = polyominoArray[2][1]-dx;
        polyominoArray[3][1] = polyominoArray[3][1]-dx;
    }
}

//數值更新
function update(timestamp) {
    //結算處理:將落地的骨牌存入背景矩陣，並重置下一骨牌
    let downLimit             = setDownBoundary();
    let GroundContactBoolean  = isGroundContact();
 
    if ( downLimit === 0 || GroundContactBoolean ) {      
        summaryContact();
        score = summaryResults();
        drawScore(); 
        let tempNextOneArray = nextPolyominoArray;
        nextOneBlockedBoolean = isNextOneBlocked(tempNextOneArray);
        if(!nextOneBlockedBoolean) {
            polyominoCode       = nextPolyominoCode;
            polyominoArray      = JSON.parse(JSON.stringify(polyominoKindList[nextPolyominoCode]));
            polyominoColor      = polyominoColorList[nextPolyominoCode];
            polyominoSpin       = polyominoSpinList[nextPolyominoCode];
            nextPolyominoArray = getNewPolyomino();
        }
    }
}

//繪圖相關
function draw() {
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.clearRect(0, 0, 400, canvas.height);
    drawBackground();   
    drawPolyomino();
    drawGridLines();
    drawScore();
}

function drawGameOver() {
    ctx.clearRect(0, 0, 400, canvas.height);
    drawBackground();   
    drawGridLines();
    drawScore();
}

function setRightBoundary() {
    let array      = polyominoArray;
    let rightLimit = 9;
    let tempLimit  = 9;

    array.forEach(function(element) {
        let xJudge = element[0];
        let yJudge = element[1];     
        for (let i=xJudge; i<=9; i++) {
            if( arrayBackground[yJudge][i] ===1 ){
                tempLimit = i-xJudge;
                break;    
            }    
        }
        if( tempLimit<rightLimit ){
            rightLimit = tempLimit;     
        }    
    });
    return rightLimit;
}

function setLeftBoundary() {
    let array      = polyominoArray;
    let leftLimit = 9;
    let tempLimit  = 9;

    array.forEach(function(element) {
        let xJudge = element[0];
        let yJudge = element[1];     
        for(let i=xJudge; i>=0; i--) {
            if ( arrayBackground[yJudge][i] ===1 ){
                tempLimit = xJudge-i;
                break;    
            }    
        }
        if( tempLimit<leftLimit ){
            leftLimit = tempLimit;     
        }    
    });
    return leftLimit;
}

function setDownBoundary() {
    let array      = polyominoArray;
    let downLimit  = 19;
    let tempLimit  = 19;

    array.forEach(function(element) {
        let xJudge = element[0];
        let yJudge = element[1];
        for (let i=yJudge; i<=19; i++) {
            if( arrayBackground[i][xJudge] === 1 ){
                tempLimit = i-yJudge-1;    
            }
            if( tempLimit<downLimit ) {
                downLimit = tempLimit;              
            }

        }
    });
    return downLimit;
}

function isRightBoundaryContact() {
    let array      = polyominoArray;
    let boolJudge  = false;

    for(let i=0; i<array.length; i++) {
        let xJudge = array[i][0];    
        if( xJudge === 9 ) {
            boolJudge = true;
            break;    
        }
    }
    return boolJudge;
}

function isLeftBoundaryContact() {
    let array      = polyominoArray;
    let boolJudge  = false;

    for(let i=0; i<array.length; i++) {
        let xJudge = array[i][0];    
        if( xJudge === 0 ) {
            boolJudge = true;
            break;    
        }
    }
    return boolJudge;
}

function isGroundContact() {
    let array      = polyominoArray;
    let boolJudge  = false; 

    for(let i=0; i<array.length; i++) {
        let yJudge = array[i][1];    
        if( yJudge === 19 ) {
            boolJudge = true;
            break;    
        }
    }    
    return boolJudge; 
}

function isNextOneBlocked(tempNextOneArray) {
    let array  = tempNextOneArray;
    let xJudge = 0;
    let yJudge = 0;
    let boolJudge  = false;

    for(let i=0; i<array.length; i++) {
        xJudge = array[i][0];
        yJudge = array[i][1];
        if(arrayBackground[yJudge][xJudge] === 1) {
            boolJudge  = true;
            break;    
        }    
    }
    return boolJudge;
}

function shiftPolyominoRight() {
    let array = polyominoArray;
    array.forEach(function(element){
        element[0] = element[0]+crossStep;
    });
    return array;
}

function shiftPolyominoLeft() {
    let array = polyominoArray;
    array.forEach(function(element){
        element[0] = element[0]-crossStep;
    });
    return array;
}

function spinPolyominoClockwise() {    
    let array = polyominoArray;
    let xCent = array[0][0];
    let yCent = array[0][1];
    for(let i=1; i<array.length; i++) {
        array[i][0] = (array[i][0]-xCent);
        array[i][1] = (array[i][1]-yCent);
        let temp    = array[i][0];
        array[i][0] = array[i][1];
        array[i][1] = temp;
        array[i][0] = -1*array[i][0]+xCent;
        array[i][1] = array[i][1]+yCent;
    }
    return array;
}

function isSpinAble() {
    let array     = polyominoArray;
    let xJudge    = array[0][0];
    let yJudge    = array[0][1];
    let boolJudge = false;

    if( xJudge>=1 && xJudge<=9 && yJudge>=1 && yJudge<=18 && polyominoCode!= 5 && polyominoCode!= 6){
        let grid_01   = arrayBackground[yJudge-1][xJudge-1];
        let grid_02   = arrayBackground[yJudge-1][xJudge];
        let grid_03   = arrayBackground[yJudge-1][xJudge+1];
        let grid_04   = arrayBackground[yJudge][xJudge-1];
        let grid_06   = arrayBackground[yJudge][xJudge+1];
        let grid_07   = arrayBackground[yJudge+1][xJudge-1];
        let grid_08   = arrayBackground[yJudge+1][xJudge];
        let grid_09   = arrayBackground[yJudge+1][xJudge+1];
        if( (grid_01+grid_02+grid_03+grid_04+grid_06+grid_07+grid_08+grid_09)===0 ) {
            boolJudge = true;
        }
    }else if( polyominoCode=== 5 ){
        boolJudge = false;    
    }else if( xJudge>=2 && xJudge<=8 && yJudge>=2 && yJudge<=17 && polyominoCode=== 6 ){
        let grid_01  =  arrayBackground[yJudge-1][xJudge];
        let grid_02  =  arrayBackground[yJudge+1][xJudge];
        let grid_03  =  arrayBackground[yJudge+2][xJudge];
        let grid_04  =  arrayBackground[yJudge][xJudge-1];
        let grid_05  =  arrayBackground[yJudge][xJudge+1];
        let grid_06  =  arrayBackground[yJudge][xJudge+2];
        if( (grid_01+grid_02+grid_03+grid_04+grid_06)===0 ) {
            boolJudge = true;
        }
    }

    return boolJudge;
}

function summaryContact() {
    let array  = polyominoArray;
    let xJudge = 0;
    let yJudge = 0;

    array.forEach(function(element){
        xJudge = element[0];
        yJudge = element[1];
        arrayBackground[yJudge][xJudge] = 1;    
    });
}

function summaryResults() {
    let arraySummary = [];
    for(let i=0; i<20; i++) {
        arraySummary[i] = [];
        for(let j=0; j<10; j++) {
            arraySummary[i][j] = 0;
        }    
    }

    let sumRow  = 0;
    let isCopyed  = false;
    let copyRow = 19;

    for(let i=19; i>=0; i--) {
        sumRow = 0;
        for(let j=0; j<10; j++) {
            if( arrayBackground[i][j] === 1 ) {
                sumRow = sumRow+1;                     
            }    
        }
        if( sumRow != 10 ){
            arraySummary[copyRow] = arrayBackground[i];
            copyRow = copyRow-1;            
        }else{
            isCopyed  = true;
            score = score +100;
        } 
    }
    
    if(isCopyed){
        arrayBackground = arraySummary;
    }
    
    return score;
}

function getNewPolyomino() {
    let code  = getRandomInt(0,7);
    let array = JSON.parse(JSON.stringify(polyominoKindList[code]));
    nextPolyominoCode   = code;
    nextPolyominoArray  = array;
    nextPolyominoColor  = polyominoColorList[code];
    nextPolyominoSpin   = polyominoSpinList[code];
    return array;
}

function drawPolyomino() {
    let array  = polyominoArray;
    let xOrder = 0;
    let yOrder = 0; 
    ctx.beginPath();
    ctx.fillStyle = polyominoColor;
    array.forEach(function(element) {
        xOrder = element[0];    
        yOrder = element[1];
        ctx.fillRect(0+gridLength*xOrder, 0+gridLength*yOrder, gridLength, gridLength);
    });
    ctx.closePath();
}

function drawBackground() {
    ctx.beginPath();
    for(let i=0; i<20; i++) {
        for(let j=0; j<10; j++) {
            if( arrayBackground[i][j] === 1) {
                ctx.fillStyle="#737476";
                ctx.fillRect(0+gridLength*j, 0+gridLength*i, gridLength, gridLength);    
            }            
        }
    }
    ctx.closePath();
}

function drawGridLines() {
    ctx.beginPath();
    // for( let i=0; i<=canvas.width; i=i+gridLength ) {
    for( let i=0; i<=400; i=i+gridLength ) {
        ctx.moveTo(i,0);
        ctx.lineTo(i,canvas.height);
        ctx.stroke();
    }
    for( let i=0; i<=canvas.height; i=i+gridLength ){
        ctx.moveTo(0,i);
        // ctx.lineTo(canvas.width,i);
        ctx.lineTo(400,i);
        ctx.stroke();
    }
    ctx.closePath();
}

function drawScore() {
    ctx.clearRect(400, 0, 100, canvas.height);
    ctx.font = "15px Arial";
    ctx.fillStyle = "#000000";
    ctx.fillText("Score:"+score, 420, 100);
    ctx.fillText("Next:", 420, 180);
    let array = JSON.parse(JSON.stringify(nextPolyominoArray));
    for (let i=0; i<array.length; i++){
        array[i][0] = array[i][0]-4;       
    }
    drawNextInfom(array);
}

function drawNextInfom(array) {
    let xOrder = 0;
    let yOrder = 0;   
    ctx.beginPath();
    ctx.fillStyle = nextPolyominoColor;
    array.forEach(function(element) {
        xOrder = element[0];    
        yOrder = element[1]+1;
        ctx.fillRect(420+15*xOrder, 200+15*yOrder, 15, 15);
    });
    ctx.closePath();
 
    ctx.beginPath();
    for( let i=420; i<=480; i=i+15 ) {
        ctx.moveTo(i,200);
        ctx.lineTo(i,260);
        ctx.stroke();
    }
    for( let i=200; i<=260; i=i+15 ){
        ctx.moveTo(420,i);
        ctx.lineTo(480,i);
        ctx.stroke();
    }
    ctx.closePath();
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; 
}