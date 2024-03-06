import { Renderer, Container, Ticker, Graphics } from '../node_modules/pixi.js/dist/pixi.mjs';
// import { Renderer, Container, Ticker, Graphics } from 'pixi.js';
// import { GameController } from './classes/GameController.js';
import { GameVars } from './classes/GameVars.js';
import { Rock } from './classes/Rock.js';
import { Ship } from './classes/Ship.js';
import { Saucer } from './classes/Saucer.js';
// import { Explosion } from './classes/Explosion.js';
import { Particle } from './classes/Particle.js';
import { Worldport, Viewport } from './classes/Engine2D.js';
import { GameUtils } from './classes/GameUtils.js';
import { MoverText } from './classes/MoverText.js';
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
    resolution: devicePixelRatio,
    autoDensity: true
});
// renderer.view.style.position = absolute;
// High-level pixi.js objects (includes renderer)
const stage = new Container();
const graphics = new Graphics();
stage.addChild(graphics);
// Setup Engine2D objects
// Scaling works to make the World ratio the same as the VP ratio.
// TODO: Make work when the screen height is > screen width.
GameVars.WORLD_MAXY = Math.round(GameVars.WORLD_MAXX * _h / _w);
const world_port = new Worldport(GameVars.WORLD_MINX, GameVars.WORLD_MAXX, GameVars.WORLD_MINY, GameVars.WORLD_MAXY);
const view_port = new Viewport(world_port, 0, _w, _h, 0);
// let game_controller = new GameController(vp, renderer, stage, g);
// Containers for rocks, bullets, explosions. 
// TODO: Could all be one container if I made the array of some interface type
//      with rocks, bullets, explosions, etc. implementing that interface.
// TODO: Fix, and pre-allocate, the size of these arrays and replace constructors with
// a factory method to generate and kill a new entity. Much, much faster and resource friendly.
let rocks = [];
let bullets = [];
let screen_text = [];
// Create Rocks
function createRocks(rocks, num_rocks) {
    for (let i = 0; i < num_rocks; i++) {
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
        let begx = GameUtils.one2n(GameVars.WORLD_MAXX - 1);
        let begy = GameUtils.one2n(GameVars.WORLD_MAXY - 1);
        let num_rotations = GameUtils.one2n(GameVars.ROCK_MAX_ROT);
        // BUG: Bombs when num_rotations is 0.
        let rock = new Rock(view_port, size, begx, begy, xvel, yvel, num_rotations);
        // console.log(rock);
        rocks.push(rock);
    }
    return num_rocks;
}
let num_rocks = createRocks(rocks, GameVars.START_ROCKS);
// Create ship - disable it initially.
const ship = new Ship(view_port, add_bullet);
ship.die();
// Start the game with a dead saucer.
let saucer = new Saucer(view_port, GameVars.SAUCER_LARGE, ship, add_bullet);
saucer.die();
// Manage adding rocks, bullets, screen text, and explosions.
function add_rock(new_rock) {
    for (let i = 0; i < rocks.length; i++) {
        if (!rocks[i].isAlive()) {
            rocks[i] = new_rock;
            return;
        }
    }
    rocks.push(new_rock);
}
function how_many_rocks() {
    return num_rocks;
    // for (let i=0; i<rocks.length; i++)
    //     if (!rocks[i].isAlive())
    //         num_rocks++
    // return(num_rocks)
}
function add_bullet(new_bullet) {
    for (let i = 0; i < bullets.length; i++) {
        if (!bullets[i].isAlive()) {
            bullets[i] = new_bullet;
            return;
        }
    }
    bullets.push(new_bullet);
}
function add_screen_text(new_text) {
    for (let i = 0; i < screen_text.length; i++) {
        if (!screen_text[i].isAlive()) {
            screen_text[i] = new_text;
            return;
        }
    }
    screen_text.push(new_text);
}
// MAIN GAME LOOP
let game_alive = true;
let game_paused = false;
let game_state = 'OVER';
let round_ctr = 1;
let cur_ship = 1;
let saucer_delay = 0;
let screen_message = '';
let msg_text = "KEYS:\n\n<LEFT Arrow> or A = Rotate Left\n<RIGHT Arrow> or D = Rotate Right\n<UP Arrow> or W = Thrust\n<Spacebar> = Gun\n<Enter> = Start Game\n<Esc> = Pause Game";
const msg_mt = new MoverText(view_port, msg_text, 500, 300, 0, 0);
const ticker = new Ticker();
ticker.maxFPS = GameVars.FPS;
ticker.add(main_loop);
ticker.start();
function main_loop(delta) {
    if (game_paused) {
        return;
    }
    // Draw black background
    graphics.clear();
    // Manage the various game states and transitions between them:
    if (game_state === "INTRO") {
        // const msg1 = new MoverText(view_port, "-- KEYS --: Rotate L/R: <Arrows> or A and D.", 300, 300, 0, 0);
        // const msg2 = new MoverText(view_port, "Thrust: <UP Arrow> or W. Gun: <Spacebar>", 400, 500, 0, 0);
        // const msg3 = new MoverText(view_port, "<Enter> to Start. <ESC> to Pause.", 400, 700, 0, 0);
        // // add_screen_text(msg);
        // stage.addChild(msg1.text_pixie, msg2.text_pixie, msg3.text_pixie);
    }
    else if (game_state === "START") {
        // remove msg_mt's Text object from the app.stage.
        msg_mt.text_pixie.removeFromParent();
        // Reset game state for new game.
        ship.resurrect();
        ship.startRound();
        rocks = []; // Clear out old rocks.
        num_rocks = createRocks(rocks, GameVars.START_ROCKS);
        round_ctr = 1;
        cur_ship = 1;
        game_state = "PLAYING";
        return;
    }
    else if (game_state === "OVER") {
        // Turn off ship...display INTRO text
        ship.die();
        stage.addChild(msg_mt.text_pixie);
        game_state = "INTRO";
        return;
    }
    // Tick ship, rocks, bullets, screentext, explosions, and saucer. Create new saucer if it's time.
    tick_game_elements();
    // Check collisions: rock-bullet, rock-saucer, rock-ship, bullets-saucer, bullets-ship, saucer-ship
    check_collisions();
    // Draw ship, saucers, rocks, bullets, screen text, and particles.
    paint_game_elements();
    // Render the frame to the screen
    renderer.render(stage);
    if (game_state === "PLAYING") {
        // Check for no more rocks (end of round) or dead ship
        if (num_rocks === 0) {
            let new_rocks = GameVars.START_ROCKS + GameVars.ROCKS_PER_ROUND * round_ctr;
            if (new_rocks > GameVars.MAX_ROCKS)
                new_rocks = GameVars.MAX_ROCKS;
            num_rocks = createRocks(rocks, new_rocks);
            round_ctr++;
        }
        if (!ship.isAlive()) {
            if (cur_ship === GameVars.NUM_SHIPS) {
                game_state = 'OVER';
                return;
            }
            else if (check_clear()) {
                cur_ship++;
                ship.startRound();
                // ship.centerShip();
                // ship.resurrect();
            }
        }
    }
    // if (!game_alive) {
    //     ticker.stop();
    //     graphics.destroy();
    //     return;
    // }
    // console.log("FPS: " + ticker.FPS);
}
function tick_game_elements() {
    // Tick ship, rocks, bullets, screentext, explosions, and saucer.
    if (ship.isAlive()) {
        ship.tick();
    }
    num_rocks = 0;
    rocks.forEach((rock) => {
        if (rock.isAlive()) {
            rock.tick();
            num_rocks++;
        }
    });
    bullets.forEach((bullet) => {
        if (bullet.isAlive()) {
            bullet.tick();
        }
    });
    screen_text.forEach((stext) => {
        if (stext.isAlive()) {
            stext.tick();
        }
    });
    Particle.tick_all();
    // Saucer: tick or see if it's time to spawn a new one.
    if (saucer.isAlive()) {
        saucer.tick();
    }
    else {
        saucer_delay++;
        let nrocks = how_many_rocks();
        if (nrocks >= 1 && nrocks < 5 && saucer_delay >= GameVars.SAUCER_DELAY) {
            saucer_delay = 0;
            // Half the time we'll spawn a saucer
            if (GameUtils.odds(50)) {
                // if round < 4, Large 70%, Small 30%. Else, Large 10%, Small 90%.
                let saucer_size = 0;
                if (round_ctr < 4) {
                    saucer_size = GameUtils.odds(70) ? GameVars.SAUCER_LARGE : GameVars.SAUCER_SMALL;
                }
                else {
                    saucer_size = GameUtils.odds(10) ? GameVars.SAUCER_LARGE : GameVars.SAUCER_SMALL;
                }
                saucer = new Saucer(view_port, saucer_size, ship, add_bullet);
            }
        }
    }
}
function check_collisions() {
    // Check collisions: rock-bullet, rock-saucer, rock-ship
    let rlen = rocks.length;
    for (let rock_ctr = 0; rock_ctr < rlen; rock_ctr++) {
        const rock = rocks[rock_ctr];
        if (!rock.isAlive())
            continue;
        // bullets
        let blen = bullets.length;
        for (let bullet_ctr = 0; bullet_ctr < blen; bullet_ctr++) {
            let bullet = bullets[bullet_ctr];
            if (!bullet.isAlive())
                continue;
            if (rock.vecshape.bounds.contains(bullet.x, bullet.y)) {
                bullet.die();
                rock.dieAndSpawn(add_rock);
                break;
            }
        }
        // saucer
        if (saucer.isAlive() && saucer.vecshape.ShapeInShape(rock.vecshape)) {
            saucer.die();
            rock.dieAndSpawn(add_rock);
            break;
        }
        // ship
        if (ship.isAlive() && ship.vecshape.ShapeInShape(rock.vecshape)) {
            ship.dieAndExplode();
            rock.dieAndSpawn(add_rock);
            break;
        }
    }
    // Check collisions: bullets-saucer, bullets-ship, saucer-ship
    let blen = bullets.length;
    for (let bullet_ctr = 0; bullet_ctr < blen; bullet_ctr++) {
        let bullet = bullets[bullet_ctr];
        if (!bullet.isAlive())
            continue;
        // bullet-saucer            
        if (saucer.isAlive() && bullet.owner != saucer && saucer.vecshape.bounds.contains(bullet.x, bullet.y)) {
            bullet.die();
            saucer.die();
            continue;
        }
        // bullet-ship
        if (ship.isAlive() && bullet.owner != ship && ship.vecshape.bounds.contains(bullet.x, bullet.y)) {
            bullet.die();
            ship.dieAndExplode();
            continue;
        }
    }
    // ship-saucer
    if (ship.isAlive() && saucer.isAlive() && ship.vecshape.ShapeInShape(saucer.vecshape)) {
        ship.dieAndExplode();
        saucer.die();
    }
}
function paint_game_elements() {
    if (ship.isAlive())
        ship.paint(graphics);
    if (saucer.isAlive())
        saucer.paint(graphics);
    rocks.forEach((rock) => {
        if (rock.isAlive())
            rock.paint(graphics);
    });
    bullets.forEach((bullet) => {
        if (bullet.isAlive())
            bullet.paint(graphics);
    });
    // screen_text.forEach( (stext) => {
    //     if (stext.isAlive())
    //         stext.paint(graphics);
    // });
    Particle.paint_all(graphics);
}
// Is the middle of the field clear of rocks so that the ship
// can start up?
function check_clear() {
    let midx;
    let midy;
    let clearx;
    let cleary;
    let allclear = true;
    // Wait until the saucer clears the screen
    // if ( saucer && saucer.isAlive() )
    // 	return false;
    if (rocks.length === 0)
        return true;
    midx = (GameVars.WORLD_MAXX - GameVars.WORLD_MINX) / 2;
    midy = (GameVars.WORLD_MAXY - GameVars.WORLD_MINY) / 2;
    clearx = midx / 20; // was 8 (4/8/2023)
    cleary = midy / 20;
    for (let i = 0; i < rocks.length; i++) {
        if (rocks[i].isAlive()) {
            if (Math.abs(rocks[i].x - midx) < clearx ||
                Math.abs(rocks[i].y - midy) < cleary) {
                allclear = false;
                break;
            }
        }
    }
    return (allclear);
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
function keyDownHandler(event) {
    if (event.key !== undefined) {
        // console.log("Keydown: <" + event.key + ">");
        switch (event.key) {
            case "ArrowLeft":
            case "ArrowRight":
            case "ArrowUp":
            case "ArrowDown":
            case 'w':
            case 'a':
            case 's':
            case 'd':
            case " ":
                ship.handleKeyEvent('keydown', event.key);
                break;
            case "Enter":
                if (game_state === 'INTRO') {
                    game_state = 'START';
                }
                break;
            case "Escape":
                game_paused = !game_paused;
                break;
            default:
        }
    }
}
function keyUpHandler(event) {
    if (event.key !== undefined) {
        switch (event.key) {
            case "ArrowLeft":
            case "ArrowRight":
            case "ArrowUp":
            case "ArrowDown":
            case 'w':
            case 'a':
            case 's':
            case 'd':
            case "space":
                ship.handleKeyEvent('keyup', event.key);
                break;
            // case "Escape":
            //     break;
            default:
        }
    }
}
/*
 *
 * GameController - Singleton that is the controller for the game.
 */
// class GameController {
//     constructor(vp, renderer, stage, g)
// 	{
// 		this.vp = vp;
//         this.wp = wp.world_port;
//         this.renderer = renderer;
//         this.stage = stage;
//         this.graphics = g;
//     }        
// }
// /*
//  * GameElementsManager - Singleton that manages all of the elements in the game.
//  */
// class GameElementsManager {
// }
