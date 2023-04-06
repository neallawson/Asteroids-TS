// import { Renderer, Container, Ticker, Graphics } from '../node_modules/pixi.js/dist/pixi.mjs';
import { Renderer, Container, Ticker, Graphics } from 'pixi.js';
import { GameConstants } from './classes/GameConstants.js';
import { Rock } from './classes/Rock.js';
import { Ship } from './classes/Ship.js';
import { Bullet } from './classes/Bullet.js';
import { Explosion } from './classes/Explosion.js';
import { Worldport, Viewport } from './classes/Engine2D.js';
import { GameUtils } from './classes/GameUtils.js';

// const canvas = document.getElementById('gamecanvas');
const canvas = document.body.appendChild(document.createElement('canvas'));
let _w = window.innerWidth;
let _h = window.innerHeight;

const renderer = new Renderer({
    view: canvas,
    width: _w,
    height: _h,
    antialias: true,
    background: 0x000000,
    resolution: devicePixelRatio,   // resolution and autoDensity for retina displays.
    autoDensity: true
})
// renderer.view.style.position = absolute;

// High-level pixi.js objects (includes renderer)
const stage = new Container();
const g = new Graphics();
stage.addChild(g);

// Setup Engine2D objects
const world_port = new Worldport(GameConstants.WORLD_MINX, GameConstants.WORLD_MAXX, GameConstants.WORLD_MINY, GameConstants.WORLD_MAXY);

// const view_port = new Viewport(world_port, 0, GameConstants.SCREEN_WIDTH, GameConstants.SCREEN_HEIGHT, 0);
const view_port = new Viewport(world_port, 0, _w, _h, 0);

// Containers for rocks, bullets, explosions
let rocks: Rock[] = [];
let bullets: Bullet[] = [];
let explosions: Explosion[] = [];

// Create Rocks
for (let i=0; i<20; i++) {
    let x = GameUtils.one2n(100);
    let size = Rock.R_LARGE;
    if (x < 30)
        size = Rock.R_MEDIUM;
    else if (x >= 30 && x < 60)
        size = Rock.R_SMALL;

    let xvel = GameUtils.one2n(Rock.ROCKS_MAX_SPEED);
    let yvel = GameUtils.one2n(Rock.ROCKS_MAX_SPEED);
    if (GameUtils.odds(50))
        xvel *= -1;
    if (GameUtils.odds(50))
        yvel *= -1;
    let begx = GameUtils.one2n(GameConstants.WORLD_MAXX-1);
    let begy = GameUtils.one2n(GameConstants.WORLD_MAXY-1);
    let num_rotations = GameUtils.one2n(64);

    // BUG: Bombs when num_rotations is 0.
    let rock = new Rock(view_port, size, begx, begy, xvel, yvel, num_rotations);
    // console.log(rock);
    rocks.push(rock);
}

// Create ship
const ship = new Ship(view_port, add_bullet);

// Manage adding rocks, bullets, and explosions.
function add_rock(new_rock: Rock): void
{
    for (let i=0; i<rocks.length; i++) {
        if (!rocks[i].isAlive()) {
            rocks[i] = new_rock;
            return;
        }
    }
    rocks.push(new_rock);
}

function add_bullet(new_bullet: Bullet): void
{
    for (let i=0; i<bullets.length; i++) {
        if (!bullets[i].isAlive()) {
            bullets[i] = new_bullet;
            return;
        }
    }
    bullets.push(new_bullet);
}

function add_explosion(new_explosion: Explosion): void
{
    for (let i=0; i<explosions.length; i++) {
        if (!explosions[i].isAlive()) {
            explosions[i] = new_explosion;
            return;
        }
    }
    explosions.push(new_explosion);
}


// MAIN GAME LOOP
let game_alive = true;
const ticker = new Ticker();
ticker.maxFPS  = GameConstants.FPS;
ticker.add(main_loop);
ticker.start();

function main_loop(delta: number): void {
    // Draw black background
    g.clear();

    // Tick ship, rocks, bullets, explosions
    ship.tick();
    rocks.forEach( (rock) => {
        if (rock.isAlive())
            rock.tick();
    });
    bullets.forEach( (bullet) => {
        if (bullet.isAlive())
            bullet.tick();
    });
    explosions.forEach( (explosion) => {
        if (explosion.isAlive())
            explosion.tick();
    });

    // Check collisions: rock-bullet, rock-ship
    let rlen = rocks.length;
    for (let rock_ctr=0; rock_ctr<rlen; rock_ctr++) {
        const rock = rocks[rock_ctr];
        if (!rock.isAlive())
            continue;

        // bullets
        let blen = bullets.length;
        for (let bullet_ctr=0; bullet_ctr<blen; bullet_ctr++) {
            let bullet = bullets[bullet_ctr];
            if (!bullet.isAlive())
                continue;

            if (rock.vecshape!.bounds.contains(bullet.x, bullet.y)) {
                bullet.die();
                rock.dieAndSpawn(add_rock);
                break;
            }
        }

        // ship
        if (ship.vecshape!.ShapeInShape(rock.vecshape!)) {
            ship.dieAndExplode(add_explosion);
            rock.dieAndSpawn(add_rock);
            break;
        }
    }


    
    // Draw ship, rocks, bullets, explosions
    if (ship.isAlive())
        ship.paint(g);
    rocks.forEach( (rock) => {
        if (rock.isAlive())
            rock.paint(g);
    });
    bullets.forEach( (bullet) => {
        if (bullet.isAlive())
            bullet.paint(g);
    });
    explosions.forEach( (explosion) => {
        if (explosion.isAlive())
            explosion.paint(g);
    });

    // Render the frame to the screen
    renderer.render(stage);

    if (!game_alive) {
        ticker.stop();
        g.destroy();
        return;
    }
// console.log("FPS: " + ticker.FPS);
}


// Event Handlers Handle window resize and keyboard events:

window.addEventListener('resize', resize);
function resize() {
    _w = window.innerWidth;
    _h = window.innerHeight;
    renderer.resize(_w, _h);
    view_port?.resize(0, _w, _h, 0);
}

window.addEventListener("keydown", keyDownHandler);
window.addEventListener("keyup", keyUpHandler);
function keyDownHandler(event: KeyboardEvent) {
    if (event.key !== undefined) {
        console.log("Keydown: <" + event.key + ">");
        switch(event.key) {
            case "ArrowLeft":
            case "ArrowRight":
            case "ArrowUp":
            case "ArrowDown":
            case " ":
                ship.handleKeyEvent('keydown', event.key)
                break;

            case "Escape":
                game_alive = false;
                break;
            default:
        }
    }
}
function keyUpHandler(event: KeyboardEvent) {
    if (event.key !== undefined) {
        switch(event.key) {
            case "ArrowLeft":
            case "ArrowRight":
            case "ArrowUp":
            case "ArrowDown":
            case "space":
                ship.handleKeyEvent('keyup', event.key)
                break;
            // case "Escape":
            //     break;
            default:
          }
    }
}