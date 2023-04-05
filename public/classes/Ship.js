import { Polygon } from "../../node_modules/pixi.js/dist/pixi.mjs";
// import { Polygon } from "pixi.js";
import { Mover, VectorMover } from "./Mover.js";
import { VectorShape, Worldport } from "./Engine2D.js";
import { Bullet } from './Bullet.js';
import { GameConstants } from "./GameConstants.js";
//****************************************************************************
// Ship.java	--	The moving ship
//
// Written by:			Neal Lawson, e-mail: nlawson@uga.icad.edu
// Initial Release:		01/29/97.
//
// Copyright (c) Neal Lawson, 1996
//
// ----- version information -----
// v 1.10a, 05/07/97, Ship now extends VectorMover...cleaned up.
// v 1.00a,	12/20/96 - 01/29/97,	Initial Classes and testing.
//
//****************************************************************************
export class Ship extends VectorMover {
    // Movement commands:  LEFT, RIGHT, THRUST, FIRE
    // static LEFT = Event.LEFT;
    // static RIGHT = Event.RIGHT;
    // static THRUST = Event.UP;
    // static FIRE = ' ';
    static SHIP_ROT = 64; // Number of rotates() for full rotation (was 16)
    static POWER = 5; // World-coord:  Thrust per press (was 30)
    static FADE = 0.3; // fade-per-tick deduction
    static MAX_SPEED = 60; // fastest this.xvel and this.yvel allowed
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
        this.num_rotations = Ship.SHIP_ROT;
        this.add_bullet = add_bullet;
        // setup our VectorShape
        const vecshape = new VectorShape(Ship.ship_poly, this.vp, Ship.SHIP_ROT);
        this.addVectorShape(vecshape);
        // Translate (move) this shape to screen center
        Worldport.scalepoly(vecshape.world_pts, 0.7, 0.7); // Shrink ship a bit.
        this.centerShip();
        // Worldport.translatepoly(vecshape.world_pts, x, y);
    }
    // Reset variables, re-center ship
    startRound() {
        super.startRound(); // set m_alive to true, velocities to 0
        this.centerShip();
        this.key_rotleft = this.key_rotright = this.key_thrust = this.key_fire = false;
    }
    // handle keyboard events
    handleKeyEvent(event, key) {
        if (event === 'keydown') {
            switch (key) {
                case "ArrowLeft":
                    this.key_rotleft = true;
                    break;
                case "ArrowRight":
                    this.key_rotright = true;
                    break;
                case "ArrowUp":
                    this.key_thrust = true;
                    break;
                case "ArrowDown":
                    break;
                // Fire one shot from the gun:
                case " ":
                    const vs = this.vecshape;
                    this.add_bullet(new Bullet(this.vp, vs.rot_pts.points[0], vs.rot_pts.points[1], this.xvel, this.yvel, vs.trig_vals[vs.position][VectorShape.COS_OFFSET], vs.trig_vals[vs.position][VectorShape.SIN_OFFSET]));
                    break;
            }
            return true;
        }
        else if (event === 'keyup') {
            switch (key) {
                case "ArrowLeft":
                    this.key_rotleft = false;
                    break;
                case "ArrowRight":
                    this.key_rotright = false;
                    break;
                case "ArrowUp":
                    this.key_thrust = false;
                    break;
                case "ArrowDown":
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
    // 				if (e.key == FIRE) {
    // 					parent.addBullet(vm_vecshape.rot_pts.xpoints[0],
    // 						vm_vecshape.rot_pts.ypoints[0],
    // 						this.xvel, this.yvel,
    // 						vm_vecshape.trig_vals[vm_vecshape.position][vm_vecshape.COS],
    // 						vm_vecshape.trig_vals[vm_vecshape.position][vm_vecshape.SIN]);
    // 				}
    // /*****COMMENTED OUT BECAUSE OF BUG*****
    // 				if (e.key == 'p' || e.key == 'P')
    // 					parent.pauseToggle();
    // *****/
    // 				break;
    steer() {
        // rotate left and right
        if (this.key_rotleft)
            this.rotate_left();
        if (this.key_rotright)
            this.rotate_right();
        // thrust
        if (this.key_thrust) {
            let i = this.xvel - Math.round(this.vecshape.xthrust(Ship.POWER));
            if ((i > 0 && i <= Ship.MAX_SPEED) || (i < 0 && i > -Ship.MAX_SPEED))
                this.xvel = i;
            i = this.yvel + Math.round(this.vecshape.ythrust(Ship.POWER));
            if ((i > 0 && i <= Ship.MAX_SPEED) || (i < 0 && i > -Ship.MAX_SPEED))
                this.yvel = i;
        }
    }
    tick() {
        this.steer(); // Based on keyboard booleans, manage ship
        // slow ship down a touch...check drift in all directions
        if (this.xvel > Ship.FADE)
            this.xvel -= Ship.FADE;
        else if (this.xvel < -Ship.FADE)
            this.xvel += Ship.FADE;
        if (this.yvel > Ship.FADE)
            this.yvel -= Ship.FADE;
        else if (this.yvel < -Ship.FADE)
            this.yvel += Ship.FADE;
        super.tick(); // VectorMover.tick(): apply topology, move vm_vecshape
    }
    paint(g) {
        g.lineStyle(2, 0x00ffff, 1);
        g.drawPolygon(this.vecshape.screen_pts.points);
        g.closePath();
    }
    centerShip() {
        // center the coordinates
        this.x = GameConstants.WORLD_MAXX / 2;
        this.y = GameConstants.WORLD_MAXY / 2;
        const dx = this.x - this.oldx;
        const dy = this.y - this.oldy;
        this.oldx = this.x;
        this.oldy = this.y;
        // Translate (move) the VectorShape to m_x, m_y
        this.vecshape.position = 0;
        this.vecshape.move(dx, dy);
    }
}
