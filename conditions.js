let itr = function (n,x0,y0){
    let grid = [];
    for(let i = 0; i < n*n; i++){
        grid.push(100);
    }
    let x = x0;
    let y = y0;
    let locations = [x,y];//previous location
    let advance = function(){
        //check nw direction, see if we can advance there
        
    }
}


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
}


let drawGrid = function(n){
    let cg = body.add(new CanvasGrid(7));
    cg.drawGrid();
    let x = y = 3;
    cg.line(x,y,x+1,y+2,"#f00");
    /*cg.line(x,y,x-1,y+2);
    cg.line(x,y,x+1,y-2);
    cg.line(x,y,x-1,y-2);
    cg.line(x,y,x+2,y+1);
    cg.line(x,y,x-2,y+1);
    cg.line(x,y,x+2,y-1);
    cg.line(x,y,x-2,y-1);*/
    
    cg.line(x+0,y+1,x+1,y-1);
    cg.line(x+0,y+2,x+1,y+0);
    cg.line(x+0,y+3,x+1,y+1);
    
    cg.line(x-1,y+1,x+1,y+0);
    cg.line(x-1,y+2,x+1,y+1);
    cg.line(x+0,y+1,x+2,y+0);
    cg.line(x+0,y+2,x+2,y+1);
    
    cg.line(x-1,y+0,x+1,y+1);
    cg.line(x+0,y+1,x+2,y+2);
    
    //direction numbering
    //see 0
    //ese 1
    //ene 2
    //nne 3
    //nnw 4
    //wnw 5
    //wsw 6
    //ssw 7
    //crossings for 0th direction
    let baseCrossings = [
        [-1,0,1],
        [-1,1,2],
        [-1,2,2],
        
        [0,1 ,1,2,3],
        [0,2 ,2,3],
        [0,3 ,3],
        
        [1,-1,7],
        [1,0 ,6,7],
        [1,1 ,5,6,7],
        
        [2,0 ,6],
        [2,1 ,6],
        [2,2 ,5]
    ];
    
    let getConditionForDirection = function(baseCrossings,d){//d is the direction number
        let result = [];
        for(let cell of baseCrossings){
            if(d%2 === 0){
                let x,y;
                if(d === 0){
                    x = cell[0];
                    y = cell[1];
                }else if(d === 2){
                    x = cell[1];
                    y = -cell[0];
                }else if(d === 4){
                    x = -cell[0];
                    y = -cell[1];
                }else if(d === 6){
                    x = -cell[1];
                    y = cell[0];
                }
                let bitfield = 0;
                for(let i = 2; i < cell.length; i++){
                    let dd = (cell[i]+d)%8;
                    bitfield |= 1<<dd;
                }
                result.push([x,y,bitfield]);
            }else{
                let x,y;
                if(d === 1){
                    x = cell[1];
                    y = cell[0];
                }else if(d === 3){
                    x = cell[0];
                    y = -cell[1];
                }else if(d === 5){
                    x = -cell[1];
                    y = -cell[0];
                }else if(d === 7){
                    x = -cell[0];
                    y = cell[1];
                }
                let bitfield = 0;
                /*
                mirror mapping
                0=>1
                1=>0
                2=>7
                3=>6
                4=>5
                5=>4
                6=>3
                7=>2
                */
                for(let i = 2; i < cell.length; i++){
                    let dd = ((8-cell[i])+1+(d-1))%8;
                    bitfield |= 1<<dd;
                }
                result.push([x,y,bitfield]);
            }
        }
        return result;
    };
    
    let conditionsToDirections = function(conditions){
        let result = [];
        for(let cond of conditions){
            let x = cond[0];
            let y = cond[1];
            for(let d = 0; d < 8; d++){
                if(!((1<<d)&cond[2]))continue;
                if(d === 0)result.push([x,y,x+1,y+2]);
                if(d === 1)result.push([x,y,x+2,y+1]);
                if(d === 2)result.push([x,y,x+2,y-1]);
                if(d === 3)result.push([x,y,x+1,y-2]);
                if(d === 4)result.push([x,y,x-1,y-2]);
                if(d === 5)result.push([x,y,x-2,y-1]);
                if(d === 6)result.push([x,y,x-2,y+1]);
                if(d === 7)result.push([x,y,x-1,y+2]);
            }
        }
        return result;
    };
    
    let cnt = 0
    setInterval(()=>{
        cnt++;
        cg.drawGrid();
        conditionsToDirections([[0,0,1<<(cnt%8)]])
        .map(([x1,y1,x2,y2])=>cg.line(x1+3,y1+3,x2+3,y2+3,"#f00"));
        //cg.line(3,3,x+1,y+2,"#f00");
        conditionsToDirections(getConditionForDirection(baseCrossings,cnt%8))
        .map(([x1,y1,x2,y2])=>cg.line(x1+3,y1+3,x2+3,y2+3));
    },1000);
    
    
    
    console.log(JSON.stringify([0,1,2,3,4,5,6,7].map(d=>getConditionForDirection(baseCrossings,d))));
}


drawGrid();