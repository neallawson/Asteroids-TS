// import { Polygon } from '../node_modules/pixi.js';
import { Renderer, Container, Ticker, Graphics } from '../node_modules/pixi.js/dist/pixi.js';
import { GameConstants } from './classes/GameConstants.js';
import { Rock } from './classes/Rock.js';
import { Worldport, Viewport } from './classes/Engine2D.js';
import { GameUtils } from './classes/GameUtils.js';
// let p = new Polygon(0,300, 50,100, 300,0, 650,100, 670,250, 800,400,
//     750,650, 600,800, 400,700, 150,750, 250,500, 0,300);
// console.log(p);
// const canvas = document.getElementById('gamecanvas');
const canvas = document.body.appendChild(new HTMLCanvasElement);
let _w = window.innerWidth;
let _h = window.innerHeight;
const renderer = new Renderer({
    view: canvas,
    width: _w,
    height: _h,
    antialias: true,
    background: 0x000000,
    resolution: devicePixelRatio,
    autoDensity: true
});
// renderer.view.style.position = absolute;
window.addEventListener('resize', resize);
function resize() {
    _w = window.innerWidth;
    _h = window.innerHeight;
    renderer.resize(_w, _h);
    view_port?.resize(0, _w, _h, 0);
}
const stage = new Container();
const ticker = new Ticker();
// Setup Engine2D objects
const world_port = new Worldport(GameConstants.WORLD_MINX, GameConstants.WORLD_MAXX, GameConstants.WORLD_MINY, GameConstants.WORLD_MAXY);
// const view_port = new Viewport(world_port, 0, GameConstants.SCREEN_WIDTH, GameConstants.SCREEN_HEIGHT, 0);
const view_port = new Viewport(world_port, 0, _w, _h, 0);
// Create Game Objects
let rocks = [];
for (let i = 0; i < 20; i++) {
    let x = GameUtils.one2n(100);
    let size = Rock.R_LARGE;
    if (x < 30)
        size = Rock.R_MEDIUM;
    else if (x >= 30 && x < 60)
        size = Rock.R_SMALL;
    let xvel = GameUtils.one2n(50);
    let yvel = GameUtils.one2n(50);
    if (GameUtils.odds(50))
        xvel *= -1;
    if (GameUtils.odds(50))
        yvel *= -1;
    let begx = GameUtils.one2n(9000);
    let begy = GameUtils.one2n(9000);
    let num_rotations = GameUtils.one2n(64);
    let g = new Graphics();
    stage.addChild(g);
    const rock = new Rock(g, view_port, size, begx, begy, xvel, yvel, num_rotations);
    rocks.push(rock);
}
// const graphics = new Graphics();
// MAIN GAME LOOP
ticker.add(main_loop);
ticker.start();
function main_loop(delta) {
    // Draw black background
    // Tick rocks
    rocks.forEach((rock) => {
        rock.tick();
    });
    // Draw rocks
    rocks.forEach((rock) => {
        rock.paint();
    });
}
// let p = new Polygon(0,300, 50,100, 300,0, 650,100, 670,250, 800,400,
//     750,650, 600,800, 400,700, 150,750, 250,500, 0,300);
