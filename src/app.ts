// export {};
// import * as PIXI from 'pixi.js';

let p = new PIXI.Polygon(0,300, 50,100, 300,0, 650,100, 670,250, 800,400,
    750,650, 600,800, 400,700, 150,750, 250,500, 0,300);


// console.log('Polygon points  : ' + p);

const npoints = p.points.length / 2;
console.log('Num points in polygon = ' + npoints);
for (let point_ctr=0; point_ctr<npoints; point_ctr++) {
    let x = p.points[point_ctr*2];
    let y = p.points[point_ctr*2+1];
    console.log('Point ' + (point_ctr+1) + ' is (' + x + ',' + y + ')');
}


const len = p.points.length;
for (let i=0; i<len; i+=2) {
    let x = p.points[i];
    let y = p.points[i+1];
    console.log('Point is (' + x + ',' + y + ')');
}