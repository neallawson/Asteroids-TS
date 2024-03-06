import { Polygon, Point } from "../../node_modules/pixi.js/dist/pixi.mjs";
// import { Polygon } from "pixi.js";
import { Mover, VectorMover } from "./Mover.js";
import { VectorShape, Worldport } from "./Engine2D.js";
import { Bullet } from './Bullet.js';
import { Particle } from './Particle.js';
import { GameVars } from "./GameVars.js";
import { GameUtils } from "./GameUtils.js";
// Ship.ts -- The moving ship
// Coded by: Neal Lawson, captainneal@gmail.com
// Copyright (c) Neal Lawson, 1996
export class Ship extends VectorMover {
    // Movement commands:  LEFT, RIGHT, THRUST, FIRE
    // static LEFT = Event.LEFT;
    // static RIGHT = Event.RIGHT;
    // static THRUST = Event.UP;
    // static FIRE = ' ';
    // static SHIP_ROT = 64;		// Number of rotates() for full rotation (was 16)
    // static SHIP_POWER = 5;		// World-coord:  Thrust per press (was 30)
    // static SHIP_FADE = 0.3;		// fade-per-tick deduction
    // static SHIP_MAX_SPEED = 60;	// fastest this.xvel and this.yvel allowed
    // static data for building Ship's VectorShape
    // static final int Ship_x[] = {125, 0, 93, 93, 156, 156, 250, 125};
    // static final int Ship_y[] = {500, 0, 187, 125, 125, 187, 0, 500};
    static ship_data = [
        125, 500, 0, 0, 93, 187, 93, 125, 156, 125, 156, 187, 250, 0, 125, 500
    ];
    static ship_poly = new Polygon(Ship.ship_data);
    // instance data
    num_rotations; // how many rotate steps to complete a full rotation
    key_rotleft = false; // Keyboard booleans
    key_rotright = false;
    key_thrust = false;
    key_fire = false;
    add_bullet;
    constructor(vp, add_bullet) {
        super(vp, Mover.TOPO_WRAP, 0, 0, 0, 0);
        this.num_rotations = GameVars.SHIP_ROT;
        this.add_bullet = add_bullet;
        // setup our VectorShape
        const vecshape = new VectorShape(Ship.ship_poly, this.vp, GameVars.SHIP_ROT);
        this.addVectorShape(vecshape);
        // Translate (move) this shape to screen center
        Worldport.scalepoly(vecshape.world_pts, 0.7, 0.7); // Shrink ship a bit.
        this.centerShip();
        // Worldport.translatepoly(vecshape.world_pts, x, y);
    }
    // Reset variables, re-center ship
    startRound() {
        super.startRound(); // set alive to true, velocities to 0
        this.centerShip();
        this.key_rotleft = this.key_rotright = this.key_thrust = this.key_fire = false;
    }
    // Bring ship back to life in a usable state.
    resurrect() {
        this.key_rotleft = false;
        this.key_rotright = false;
        this.key_thrust = false;
        this.key_fire = false;
        super.resurrect();
    }
    // handle keyboard events
    handleKeyEvent(event, key) {
        if (!this.isAlive())
            return false;
        if (event === 'keydown') {
            switch (key) {
                case "ArrowLeft":
                case 'a':
                    this.key_rotleft = true;
                    break;
                case "ArrowRight":
                case 'd':
                    this.key_rotright = true;
                    break;
                case "ArrowUp":
                case 'w':
                    this.key_thrust = true;
                    break;
                case 's':
                case "ArrowDown":
                    break;
                // Fire one shot from the gun:
                case " ":
                    const vs = this.vecshape;
                    const vs_sin = vs.trig_vals[vs.position][VectorShape.SIN_OFFSET];
                    const vs_cos = vs.trig_vals[vs.position][VectorShape.COS_OFFSET];
                    this.add_bullet(new Bullet(this.vp, this, vs.rot_pts.points[0], vs.rot_pts.points[1], this.xvel, this.yvel, vs.trig_vals[vs.position][VectorShape.SIN_OFFSET], vs.trig_vals[vs.position][VectorShape.COS_OFFSET]));
                    break;
            }
            return true;
        }
        else if (event === 'keyup') {
            switch (key) {
                case "ArrowLeft":
                case 'a':
                    this.key_rotleft = false;
                    break;
                case "ArrowRight":
                case 'd':
                    this.key_rotright = false;
                    break;
                case "ArrowUp":
                case 'w':
                    this.key_thrust = false;
                    break;
                case "ArrowDown":
                case 's':
                    break;
                case "space":
                    // Nothing to do on keyup. Must press the fire button each time to shoot.
                    break;
            }
            return true;
        }
        else
            return false;
    }
    steer() {
        // rotate left and right
        if (this.key_rotleft)
            this.rotate_left();
        if (this.key_rotright)
            this.rotate_right();
        // thrust	
        if (this.key_thrust) {
            let i = this.xvel - Math.round(this.vecshape.xthrust(GameVars.SHIP_POWER));
            if ((i > 0 && i <= GameVars.SHIP_MAX_SPEED) || (i < 0 && i > -GameVars.SHIP_MAX_SPEED))
                this.xvel = i;
            i = this.yvel + Math.round(this.vecshape.ythrust(GameVars.SHIP_POWER));
            if ((i > 0 && i <= GameVars.SHIP_MAX_SPEED) || (i < 0 && i > -GameVars.SHIP_MAX_SPEED))
                this.yvel = i;
        }
    }
    tick() {
        this.steer(); // Based on keyboard booleans, manage ship
        // slow ship down a touch...check drift in all directions
        if (this.xvel > GameVars.SHIP_FADE)
            this.xvel -= GameVars.SHIP_FADE;
        else if (this.xvel < -GameVars.SHIP_FADE)
            this.xvel += GameVars.SHIP_FADE;
        if (this.yvel > GameVars.SHIP_FADE)
            this.yvel -= GameVars.SHIP_FADE;
        else if (this.yvel < -GameVars.SHIP_FADE)
            this.yvel += GameVars.SHIP_FADE;
        super.tick(); // VectorMover.tick(): apply topology, move vm_vecshape
    }
    paint(g) {
        g.lineStyle(2, 0x00ffff, 1);
        g.drawPolygon(this.vecshape.screen_pts.points);
        g.closePath();
        // const worldp=new Point(	this.vecshape!.rot_pts.points[0],
        // 					this.vecshape!.rot_pts.points[1]);
        // let viewp = new Point(0, 0);
        // this.vp.Worldpoint2Viewpoint(worldp, viewp);
        // g.lineStyle(2, 0xdd0000, 1);
        // g.drawCircle(viewp.x, viewp.y, 5);
    }
    centerShip() {
        // center the coordinates
        this.x = GameVars.WORLD_MAXX / 2;
        this.y = GameVars.WORLD_MAXY / 2;
        const dx = this.x - this.oldx;
        const dy = this.y - this.oldy;
        this.oldx = this.x;
        this.oldy = this.y;
        // Translate (move) the VectorShape to m_x, m_y
        this.vecshape.position = 0;
        this.vecshape.move(dx, dy);
        // Ship velocity to zero
        this.xvel = 0;
        this.yvel = 0;
    }
    // dieAndExplode(add_explosion: (e: Explosion) => void): void
    dieAndExplode() {
        const max_radius = Math.max(this.vecshape.bounds.width, this.vecshape.bounds.height);
        for (let i = 0; i < 6; i++) {
            const radius = Math.random() * max_radius;
            const angle_radians = Math.random() * 2 * Math.PI;
            const new_x = this.vecshape.aboutx + radius * Math.cos(angle_radians);
            const new_y = this.vecshape.abouty + radius * Math.sin(angle_radians);
            let p = new Particle(this.vp, new_x, new_y, this.xvel, this.yvel, GameUtils.one2n(4), GameUtils.one2n(10));
            Particle.add_particle(p);
        }
        super.die();
        // add_explosion(new Explosion(this.vp, this.x, this.y, this.xvel, this.yvel, 3));
    }
}
