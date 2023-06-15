import { Polygon, Point } from "../../node_modules/pixi.js/dist/pixi.mjs";
// import { Polygon } from "pixi.js";
import { Mover, VectorMover } from "./Mover.js";
import { VectorShape, Worldport } from "./Engine2D.js";
import { Bullet } from './Bullet.js';
import { Particle } from './Particle.js';
import { GameConstants } from "./GameConstants.js";
import { GameUtils } from "./GameUtils.js";
//****************************************************************************
// ----- general information -----
//
// Saucer.java	-- The flying saucer
//
// Written by:				Neal Lawson, e-mail: nlawson@uga.icad.edu
// Initial Release:		05/08/97.
//
// Copyright (c) Neal Lawson, 1996
//
// ----- version information -----
// v 1.10a, 05/07/97 - 05/08/97, Initially written and tested
//
// ----- history and repairs -----
// ----- Description -----
// Saucer is a class extending VectorMover.  It contains the functionality
// for all flying saucers used in the Asteroids game.
//****************************************************************************
export class Saucer extends VectorMover {
    static LARGE = 1; // 2 types of saucers, large
    static SMALL = 2; // and small.
    static ROT = 0; // Number of rotates() for full rotation
    static LEFT = 0; // Saucer's direction of flight, left
    static RIGHT = 1; // or right.
    static XVEL = 30; // Saucer's horizontal velocity
    static YVEL = 30; // Saucer's vertical velocity
    static LARGE_POINTS = 250; // Points value of a large saucer
    static SMALL_POINTS = 1000; // Points value of a small saucer
    static MOVE = 30; // number of ticks before changing direction
    static L_FIRE = 120;	// number of ticks to fire for large
    static S_FIRE = 70; // number of ticks to fire for small
    // static data for building Saucer's VectorShape
    //	static   Saucer_x[] = {175, 0, 175, 262, 350, 437, 525, 700, 525, 175};
    // static   Saucer_x[] = {150, 0, 150, 225, 300, 375, 450, 600, 450, 150};
    // static   Saucer_y[] = {0, 125, 250, 250, 375, 250, 250, 125, 0, 0};
    static saucer_data = [
        150, 0, 0, 125, 150, 250, 225, 250, 300, 375, 375, 250, 450, 250, 600, 125, 450, 0, 150, 0
    ];
    static saucer_poly = new Polygon(Saucer.saucer_data);
    // instance data
    ship; // the ship we're chasing
    size;
    dir; // flight direction, LEFT or RIGHT
    points_value; // points value of this saucer
    movectr = 0; // move counter
    firectr = 0; // fire counter
    add_bullet;
    bullet;
    constructor(vp, size, ship, add_bullet) {
        super(vp, Mover.TOPO_WRAP, 0, 0, 0, 0);
        this.size = size;
        this.ship = ship;
        this.add_bullet = add_bullet;
        this.bullet = new Bullet(vp, this, 0, 0, 0, 0, 0, 0);
        this.bullet.die();
        // setup our VectorShape
        const vecshape = new VectorShape(Saucer.saucer_poly, this.vp, Saucer.ROT);
        this.addVectorShape(vecshape);
        if (size == Saucer.SMALL) {
            Worldport.scalepoly(vecshape.world_pts, 0.7, 0.7);
            this.points_value = Saucer.SMALL_POINTS;
        }
        else
            this.points_value = Saucer.LARGE_POINTS;
        // 	// setup initial position and flight direction
        if (GameUtils.odds(50)) {
            this.dir = Saucer.RIGHT;
            this.x = 0;
            this.xvel = Saucer.XVEL;
        }
        else {
            this.dir = Saucer.LEFT;
            this.x = GameConstants.WORLD_MAXX;
            this.xvel = -Saucer.XVEL;
        }
        // slow down big saucer
        if (size == Saucer.LARGE) {
            this.xvel *= 0.6;
            this.yvel *= 0.6;
        }
        this.y = GameUtils.one2n(GameConstants.WORLD_MAXY);
        this.yvel = 0;
    }
    steer() {
        this.movectr++;
        if (this.movectr > Saucer.MOVE) {
            this.yvel = Saucer.YVEL;
            this.movectr = 0;
            if (GameUtils.odds(50))
                this.yvel -= this.yvel;
        }
    }
    // // Given x, y, and r, return an angle between -PI & PI
    angle(x, y, r) {
        let a;
        if (x >= 0)
            return Math.asin(y / r);
        else
            return Math.PI - Math.asin(y / r);
    }
    fire() {
        this.firectr++;
        if (!this.bullet.isAlive()) {
            if ((this.size == Saucer.LARGE && this.firectr > Saucer.L_FIRE)
                || (this.size == Saucer.SMALL && this.firectr > Saucer.S_FIRE)) {
                this.firectr = 0;
                // Target Ship:  calculate the angle from saucer to ship.
                // Originate bullet from saucer center.
                const x = this.vecshape.aboutx;
                const y = this.vecshape.abouty;
                const dx = this.ship.x - x;
                const dy = this.ship.y - y;
                const r = Math.sqrt(dx * dx + dy * dy);
                const a = this.angle(dx, dy, r);
                const fire_sin = Math.sin(a);
                const fire_cos = Math.cos(a);
                // fire a bullet at the Ship
                // this.bullet = new Bullet(this.vp, x, y, this.xvel, this.yvel, fire_sin, -fire_cos);
                this.bullet = new Bullet(this.vp, this, x, y, this.xvel, this.yvel, -fire_cos, fire_sin);
                this.add_bullet(this.bullet);
            }
        }
    }
    tick() {
        // Is it time to die yet?
        if (this.dir == Saucer.RIGHT && this.x > GameConstants.WORLD_MAXX - 100)
            this.die();
        if (this.dir == Saucer.LEFT && this.x < 100)
            this.die();
        this.steer(); // steer saucer
        this.fire(); // fire a bullet...maybe
        super.tick(); // VectorMover.tick(): apply topology, move vm_vecshape
    }
    paint(g) {
        g.lineStyle(2, 0x00ff00, 1);
        g.drawPolygon(this.vecshape.screen_pts.points);
        g.closePath();
    }
    die() {
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
    }
}
