import { Polygon } from "../../node_modules/pixi.js/dist/pixi.mjs";
// import { Polygon } from "pixi.js";
import { Mover, VectorMover } from "./Mover.js";
import { VectorShape } from "./Engine2D.js";
import { GameConstants } from "./GameConstants.js";
//****************************************************************************
// ----- general information -----
//
// Ship.java	--	The moving ship
//
// Written by:				Neal Lawson, e-mail: nlawson@uga.icad.edu
// Initial Release:		01/29/97.
//
// Copyright (c) Neal Lawson, 1996
//
// ----- version information -----
// v 1.10a, 05/07/97, Ship now extends VectorMover...cleaned up.
// v 1.00a,	12/20/96 - 01/29/97,	Initial Classes and testing.
//
// ----- history and repairs -----
// 05/07/97 -- 05/14/97, v 1.10a:
//
//	05/14/97 --  Added code to support pausing.  Causes a game
//				lockup when last rock is destroyed.  Commented out.
//				Only affects the pause code in handleEvent().
//05/07/94 --	Ship now extends VectorMover instead of Mover.
//				Modified code to support this change:
//				a. s_vecshape -> vm_vecshape in VectorMover
//				b. removed delta computations in tick(), remove s_x, s_y
//				c. removed rapid repeat FIRE code.
// 02/05/97 -- Implemented new keyboard management, and steer() method.
//             This allows for auto-repeating of the keyboard for rotation
//             and thrust.  Had to turn down the thrust POWER a bit from
//             30 to 15.  Also changed the SHIP_ROT (ship rotations) from
//             16 to 32.  Added the keyboard boolean instance variables.
//             Also changed ship color from cyan to white.
// 02/04/97 -- Fixed bug in the FADE.  Failed to check negative directions.
//
// ----- Description -----
// Mover is a simple class to define what a moving game object needs
// in order to be functional.  Many of the concepts of this class were 
// taken from Chris Boyke's game, SpaceWar.
//****************************************************************************
export class Ship extends VectorMover {
    // Movement commands:  LEFT, RIGHT, THRUST, FIRE
    // static LEFT = Event.LEFT;
    // static RIGHT = Event.RIGHT;
    // static THRUST = Event.UP;
    // static FIRE = ' ';
    static SHIP_ROT = 32; // Number of rotates() for full rotation (was 16)
    static POWER = 15; // World-coord:  Thrust per press (was 30)
    static FADE = 1; // fade-per-tick deduction
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
    constructor(vp, x, y) {
        super(vp, Mover.TOPO_WRAP, x, y, 0, 0);
        this.num_rotations = Ship.SHIP_ROT;
        // setup our VectorShape
        const vecshape = new VectorShape(Ship.ship_poly, this.vp, Ship.SHIP_ROT);
        this.addVectorShape(vecshape);
        // Translate (move) this shape to screen center
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
                case "space":
                    // Fire one shot from the gun:
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
    // 		switch(e.id) {
    // 			case Event.KEY_PRESS:
    // 			case Event.KEY_ACTION:
    // 				if (e.key == LEFT) this.key_rotleft = true;
    // 				if (e.key == RIGHT) this.key_rotright = true;
    // 				if (e.key == THRUST) this.key_thrust = true;
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
    // 			case Event.KEY_RELEASE:
    // 			case Event.KEY_ACTION_RELEASE:
    // 				if (e.key == LEFT) this.key_rotleft = false;
    // 				if (e.key == RIGHT) this.key_rotright = false;
    // 				if (e.key == THRUST) this.key_thrust = false;
    // 				break;
    // 		}
    // 		return true;
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
