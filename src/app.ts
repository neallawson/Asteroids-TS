// import { Renderer, Container, Ticker, Graphics } from '../node_modules/pixi.js/dist/pixi.mjs';
import { Renderer, Container, Ticker, Graphics } from 'pixi.js';
// import { GameController } from './classes/GameController.js';
import { GameVars } from './classes/GameVars.js';
import { Rock } from './classes/Rock.js';
import { Ship } from './classes/Ship.js';
import { Saucer } from './classes/Saucer.js';
import { Bullet } from './classes/Bullet.js';
// import { Explosion } from './classes/Explosion.js';
import { Particle } from './classes/Particle.js';
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
// Scaling works to make World ratio scame as VP ratio.
// TODO: Make work when the screen height is > screen width.
GameVars.WORLD_MAXY = Math.round(GameVars.WORLD_MAXX * _h / _w);
const world_port = new Worldport(GameVars.WORLD_MINX, GameVars.WORLD_MAXX, GameVars.WORLD_MINY, GameVars.WORLD_MAXY);


// const view_port = new Viewport(world_port, 0, GameVars.SCREEN_WIDTH, GameVars.SCREEN_HEIGHT, 0);
const view_port = new Viewport(world_port, 0, _w, _h, 0);

// let game_controller = new GameController(vp, renderer, stage, g);


// Containers for rocks, bullets, explosions. 
// TODO: Could all be one container if I made the array of some interface type
//      with rocks, bullets, explosions, etc. implementing that interface.
let rocks: Rock[] = [];
let bullets: Bullet[] = [];

// Create Rocks
function createRocks(rocks: Rock[], num_rocks: number): void
{
    for (let i=0; i<num_rocks; i++) {
        let x = GameUtils.one2n(100);
        let size = GameVars.ROCK_LARGE;
        if (x < 30)
            size = GameVars.ROCK_MEDIUM;
        else if (x >= 30 && x < 60)
            size = GameVars.ROCK_SMALL;

        let xvel = GameUtils.one2n(GameVars.ROCK_MAX_SPEED);
        let yvel = GameUtils.one2n(GameVars.ROCK_MAX_SPEED);
        if (GameUtils.odds(50))
            xvel *= -1;
        if (GameUtils.odds(50))
            yvel *= -1;
        let begx = GameUtils.one2n(GameVars.WORLD_MAXX-1);
        let begy = GameUtils.one2n(GameVars.WORLD_MAXY-1);
        let num_rotations = GameUtils.one2n(64);

        // BUG: Bombs when num_rotations is 0.
        let rock = new Rock(view_port, size, begx, begy, xvel, yvel, num_rotations);
        // console.log(rock);
        rocks.push(rock);
    }
}
createRocks(rocks, GameVars.START_ROCKS);
let num_rocks = GameVars.START_ROCKS;

// Create ship
const ship = new Ship(view_port, add_bullet);

// Start the game with a dead saucer.
let saucer = new Saucer(view_port, GameVars.SAUCER_LARGE, ship, add_bullet);
saucer.die();   


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

function how_many_rocks(): number
{
    return num_rocks;
    // for (let i=0; i<rocks.length; i++)
    //     if (!rocks[i].isAlive())
    //         num_rocks++
    // return(num_rocks)
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


// MAIN GAME LOOP
let game_alive = true;
let round_ctr = 1;
let saucer_delay = 0;
const ticker = new Ticker();
ticker.maxFPS  = GameVars.FPS;
ticker.add(main_loop);
ticker.start();

function main_loop(delta: number): void {
    // Draw black background
    g.clear();

    // Tick ship, rocks, bullets, explosions, and saucer.
    if (ship.isAlive())
        ship.tick();

    num_rocks = 0;        
    rocks.forEach( (rock) => {
        if (rock.isAlive()) {
            rock.tick();
            num_rocks++;
        }
    });
    bullets.forEach( (bullet) => {
        if (bullet.isAlive())
            bullet.tick();
    });
    Particle.tick_all();

    // Saucer: tick or see if it's time to spawn a new one.
    if (saucer.isAlive())
        saucer.tick();
    else {
        saucer_delay++;
        let nrocks = how_many_rocks();
        if (nrocks >= 1 && nrocks < 5 && saucer_delay >= GameVars.SAUCER_DELAY) {
            saucer_delay = 0;
            // Half the time we'll spawn a saucer
            if (GameUtils.odds(50)) {
                // if round < 4, Large 70%, Small 30%. Else, Large 10%, Small 90%.
                let saucer_size = 0;
                if (round_ctr < 4)
                    saucer_size = GameUtils.odds(70) ? GameVars.SAUCER_LARGE : GameVars.SAUCER_SMALL;
                else
                    saucer_size = GameUtils.odds(10) ? GameVars.SAUCER_LARGE : GameVars.SAUCER_SMALL;
                saucer = new Saucer(view_port, saucer_size, ship, add_bullet);
            }
        }
    }

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

        // saucer
        if (saucer.isAlive() && saucer.vecshape!.ShapeInShape(rock.vecshape!)) {
            saucer.die();
            rock.dieAndSpawn(add_rock);
            break;
        }

        // ship
        if (ship.isAlive() && ship.vecshape!.ShapeInShape(rock.vecshape!)) {
            ship.dieAndExplode();
            rock.dieAndSpawn(add_rock);
            break;
        }
    }

    // Check collisions: bullets-saucer, bullets-ship, saucer-ship
    let blen = bullets.length;
    for (let bullet_ctr=0; bullet_ctr<blen; bullet_ctr++) {
        let bullet = bullets[bullet_ctr];
        if (!bullet.isAlive())
            continue;
        
        // bullet-saucer            
        if (saucer.isAlive() && bullet.owner!=saucer && saucer.vecshape!.bounds.contains(bullet.x, bullet.y)) {
            bullet.die();
            saucer.die();
            continue;
        }

        // bullet-ship
        if (ship.isAlive() && bullet.owner!=ship && ship.vecshape!.bounds.contains(bullet.x, bullet.y)) {
            bullet.die();
            ship.dieAndExplode();
            continue;
        }
    }
    // ship-saucer
    if (ship.isAlive() && saucer.isAlive() && ship.vecshape!.ShapeInShape(saucer.vecshape!)) {
        ship.dieAndExplode();
        saucer.die();
    }
    
    // Draw ship, saucers, rocks, bullets.
    if (ship.isAlive())
        ship.paint(g);
    if (saucer.isAlive())
        saucer .paint(g);
    rocks.forEach( (rock) => {
        if (rock.isAlive())
            rock.paint(g);
    });
    bullets.forEach( (bullet) => {
        if (bullet.isAlive())
            bullet.paint(g);
    });
    Particle.paint_all(g);

    // Render the frame to the screen
    renderer.render(stage);

    // Check for no more rocks (end of round) or dead ship
    if ( num_rocks === 0 ) {
        let new_rocks = GameVars.START_ROCKS + GameVars.ROCKS_PER_ROUND*round_ctr
        if ( new_rocks > GameVars.MAX_ROCKS)
            new_rocks = GameVars.MAX_ROCKS;
        createRocks(rocks, new_rocks);
        round_ctr++;
    }

    if ( !ship.isAlive() && check_clear() ) {
        ship.centerShip();
        ship.resurrect();
    }

    if (!game_alive) {
        ticker.stop();
        g.destroy();
        return;
    }
// console.log("FPS: " + ticker.FPS);
}


   // Is the middle of the field clear of rocks so that the ship
	// can start up?
function check_clear(): boolean
{
    let midx: number;
    let midy: number;
    let clearx: number;
    let cleary: number
	let allclear = true;

	// Wait until the saucer clears the screen
	// if ( saucer && saucer.isAlive() )
    // 	return false;

	if ( rocks.length === 0 )
		return true;

 	midx = (GameVars.WORLD_MAXX - GameVars.WORLD_MINX) / 2;
	midy = (GameVars.WORLD_MAXY - GameVars.WORLD_MINY) / 2;
	clearx = midx / 20; // was 8 (4/8/2023)
	cleary = midy / 20;
	for (let i=0; i<rocks.length; i++) {
		if ( rocks[i].isAlive() ) {
			if ( Math.abs(rocks[i].x - midx) < clearx ||
				  Math.abs(rocks[i].y - midy) < cleary ) {
					allclear = false;
					break;
			}
		}
	}
	return( allclear );
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