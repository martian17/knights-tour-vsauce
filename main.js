let body = new ELEM(document.body);

class CanvasGrid extends ELEM{
    constructor(n=5){
        super("canvas",0,0,"margin:30px auto;display:block;");
        this.width = 500;
        this.height = 500;
        this.n = n;
        this.canvas = this.e;
        this.ctx = this.canvas.getContext("2d");
    }
    _width = 0;
    set width(w){
        this._width = w;
        this.e.width = w;
    }
    get width(){
        return this._width;
    }
    _height = 0;
    set height(h){
        this._height = h;
        this.e.height = h;
    }
    get height(){
        return this._height;
    }
    drawGrid(){
        let {canvas,ctx,width,height,n} = this;
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#000";
        ctx.fillRect(0,0,width,height);
        this.ctx.translate(0.5, 0.5);
        //horizontal lines
        for(let i = 0; i < n; i++){
            let x = Math.floor(width/n*i);
            ctx.beginPath();
            ctx.moveTo(x,0);
            ctx.lineTo(x,height-1);
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(width-1,0);
        ctx.lineTo(width-1,height-1);
        ctx.stroke();
        //vertical line
        for(let i = 0; i < n; i++){
            let y = Math.floor(height/n*i);
            ctx.beginPath();
            ctx.moveTo(0,y);
            ctx.lineTo(width-1,y);
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(0,height-1);
        ctx.lineTo(width-1,height-1);
        ctx.stroke();
        
        this.ctx.translate(-0.5, -0.5);
    }
    toCanvasCoordinates(x,y){
        let cellWidth = this.width/this.n;
        let cellHeight = this.height/this.n;
        return [Math.floor((x+0.5)*cellWidth),Math.floor((y+0.5)*cellHeight)];
    }
    fromCanvasCoordinates(x,y){
        let cellWidth = this.width/this.n;
        let cellHeight = this.height/this.n;
        return [Math.floor(x/cellWidth),Math.floor(y/cellHeight)];
    }
    line(x1,y1,x2,y2,color="#0f0"){
        let {canvas,ctx,width,height,n} = this;
        [x1,y1] = this.toCanvasCoordinates(x1,y1);
        [x2,y2] = this.toCanvasCoordinates(x2,y2);
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(x1,y1);
        ctx.lineTo(x2,y2);
        ctx.stroke();
    }
};



//0 through 8th direction collision condition
//[rx,ry,bitfield]
let collisionMask = [
    [[-1,0,2],[-1,1,4],[-1,2,4],[0,1,14],[0,2,12],[0,3,8],[1,-1,128],[1,0,192],[1,1,224],[2,0,64],[2,1,64],[2,2,32]],
    [[0,-1,1],[1,-1,128],[2,-1,128],[1,0,193],[2,0,192],[3,0,64],[-1,1,4],[0,1,12],[1,1,28],[0,2,8],[1,2,8],[2,2,16]],
    [[0,1,8],[1,1,16],[2,1,16],[1,0,56],[2,0,48],[3,0,32],[-1,-1,2],[0,-1,3],[1,-1,131],[0,-2,1],[1,-2,1],[2,-2,128]],
    [[-1,0,4],[-1,-1,2],[-1,-2,2],[0,-1,7],[0,-2,3],[0,-3,1],[1,1,16],[1,0,48],[1,-1,112],[2,0,32],[2,-1,32],[2,-2,64]],
    [[1,0,32],[1,-1,64],[1,-2,64],[0,-1,224],[0,-2,192],[0,-3,128],[-1,1,8],[-1,0,12],[-1,-1,14],[-2,0,4],[-2,-1,4],[-2,-2,2]],
    [[0,1,16],[-1,1,8],[-2,1,8],[-1,0,28],[-2,0,12],[-3,0,4],[1,-1,64],[0,-1,192],[-1,-1,193],[0,-2,128],[-1,-2,128],[-2,-2,1]],
    [[0,-1,128],[-1,-1,1],[-2,-1,1],[-1,0,131],[-2,0,3],[-3,0,2],[1,1,32],[0,1,48],[-1,1,56],[0,2,16],[-1,2,16],[-2,2,8]],
    [[1,0,64],[1,1,32],[1,2,32],[0,1,112],[0,2,48],[0,3,16],[-1,-1,1],[-1,0,3],[-1,1,7],[-2,0,2],[-2,1,2],[-2,2,4]]
];

let moveOffsets = [
    [1,2],
    [2,1],
    [2,-1],
    [1,-2],
    [-1,-2],
    [-2,-1],
    [-2,1],
    [-1,2]
];

let moveOffsetX = [
    1,2,2,1,-1,-2,-2,-1
];
let moveOffsetY = [
    2,1,-1,-2,-2,-1,1,2
];

let findMaxRoute = function(w,h,x0,y0){
    let grid = [];
    for(let i = 0; i < w*h; i++){
        grid.push(0);
    }
    let x = x0+1;
    let y = y0+2;
    let route = [x0,y0];
    grid[y0+w*x0] = 1<<0;
    let max = 0;
    let records = [];//max records
    let itr = function(){
        if(route.length === 4)console.log("l4");
        //if(route.length === 6)console.log("l6");
        route.push(x);
        route.push(y);
        if(route.length > max){
            //console.log(records.length,max-2);
            records = [[...route]];
            max = route.length;
        }else if(route.length === max){
            records.push([...route]);
        }
        let cellidx = y*w+x;
        //check all direction, see if there is any move
        outer:
        for(let d = 0; d < 8; d++){
            let x1 = x+moveOffsetX[d];
            let y1 = y+moveOffsetY[d];
            let cellidx1 = y1*w+x1;
            if(x1 < 0 || x1 >= w || y1 < 0 || y1 >= h || grid[cellidx1] !== 0)continue;
            for(let [rx,ry,bf] of collisionMask[d]){
                let x2 = x+rx;
                let y2 = y+ry;
                if(x2 < 0 || x2 >= w || y2 < 0 || y2 >= h)continue;
                let cellidx2 = y2*w+x2;
                if(bf & grid[cellidx2]){
                    //route collision found
                    continue outer;
                }
            }
            grid[cellidx] = 1<<d;
            x = x1;
            y = y1;
            itr();
        }
        route.pop();
        route.pop();
        x = route[route.length-2];
        y = route[route.length-1];
        grid[cellidx] = 0;
    }
    itr();
    return records;
}


//console.log(findMaxRoute(4,4,0,0));

let findAllMaxPaths = function(w,h){
    let results = [];
    for(let y = 0; y < h-2; y++){
        for(let x = 0; x < w-1; x++){
            results.push(findMaxRoute(w,h,x,y));
            console.log(`${x}, ${y} complete`);
        }
    }
    return results;
}

let main = function(){
    let n = 8;
    /*let cg = body.add(new CanvasGrid(n));
    cg.drawGrid();
    let routes = findMaxRoute(n,n,0,0);
    //console.log(routes);
    let route = routes[0];
    for(let i = 0; i < route.length-2; i+=2){
        cg.line(route[i],route[i+1],route[i+2],route[i+3]);
    }*/
    
    console.log(JSON.stringify(findAllMaxPaths(n,n)));
};

main();




