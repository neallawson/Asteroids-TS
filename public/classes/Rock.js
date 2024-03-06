// import { Graphics, Polygon } from "../../node_modules/pixi.js";
import { Polygon, Point } from "../../node_modules/pixi.js/dist/pixi.mjs";
// import { Polygon } from "pixi.js";
import { Mover, VectorMover } from "./Mover.js";
import { VectorShape, Worldport } from "./Engine2D.js";
import { Particle } from "./Particle.js";
import { GameUtils } from "./GameUtils.js";
import { GameVars } from "./GameVars.js";
// Rock.ts -- The asteroids themselves
//
// Coded by: Neal Lawson, captainneal@gmail.com
// Copyright (c) Neal Lawson, 1996
export class Rock extends VectorMover {
    static Large_rock_data = [
        0, 300, 50, 100, 300, 0, 650, 100,
        670, 250, 800, 400, 750, 650, 600, 800,
        400, 700, 150, 750, 250, 500,
    ];
    static Large_rock_poly = new Polygon(Rock.Large_rock_data);
    // static ROCK_LARGE = 0;
    // static ROCK_MEDIUM = 1;
    // static ROCK_SMALL = 2;
    // static ROCK_MAX_SPEED = 30;
    // static ROCK_ROT_LEFT = 0;
    // static ROCK_ROT_RIGHT = 1;
    // static ROCK_LSCORE = 50;
    // static ROCK_MSCORE = 75;
    // static ROCK_SSCORE = 100;
    // instance variables
    num_rotations; // how many rotate steps to complete a full rotation
    rot_ticks; // rotate how quickly
    rot_dir; // rotation direction
    cur_tick; // count up to rot_ticks before rotating
    size; // size of this rock
    constructor(vp, size, x, y, xvelocity, yvelocity, num_rotations) {
        super(vp, Mover.TOPO_WRAP, x, y, xvelocity, yvelocity);
        this.size = size;
        this.num_rotations = num_rotations;
        // setup random rotation variables
        this.cur_tick = 0; // count up to rot_ticks before rotating
        this.rot_ticks = 2 + GameUtils.one2n(15); // rotate how quickly 1 + or 2 +
        // rotation direction
        this.rot_dir = GameUtils.odds(50) ? GameVars.ROCK_ROT_LEFT : GameVars.ROCK_ROT_RIGHT;
        // setup our VectorShape...scale if necessary...add to super() via inherited method.
        const vecshape = new VectorShape(Rock.Large_rock_poly, vp, num_rotations);
        if (size == GameVars.ROCK_MEDIUM)
            Worldport.scalepoly(vecshape.world_pts, 0.6, 0.6);
        else if (size == GameVars.ROCK_SMALL)
            Worldport.scalepoly(vecshape.world_pts, 0.3, 0.3);
        this.addVectorShape(vecshape);
        // Translate (move) this shape to x, y
        Worldport.translatepoly(vecshape.world_pts, x, y);
    }
    tick() {
        // rotate the rock yet?
        this.cur_tick++;
        if (this.cur_tick == this.rot_ticks) {
            this.cur_tick = 0;
            if (this.rot_dir == GameVars.ROCK_ROT_LEFT)
                this.rotate_left();
            else
                this.rotate_right();
        }
        super.tick(); // VectorMover.tick(): apply topology, move vm_vecshape
    }
    paint(g) {
        g.lineStyle(2, 0xffffff, 1);
        g.drawPolygon(this.vecshape.screen_pts.points);
        g.closePath();
        // let viewp = new Point(0, 0);
        // let worldp = new Point(this.vecshape!.aboutx, this.vecshape!.abouty);
        // g.lineStyle(2, 0xdd0000, 1);
        // this.vp.Worldpoint2Viewpoint(worldp, viewp);
        // g.drawCircle(viewp.x, viewp.y, 5);
    }
    // dieAndSpawn(add_rock: (r: Rock) => void): void
    dieAndSpawn(add_rock) {
        // super.die();
        let new_sz = -1;
        let magnitude = 0;
        if (this.size === GameVars.ROCK_LARGE) {
            new_sz = GameVars.ROCK_MEDIUM;
            magnitude = 2;
        }
        else if (this.size === GameVars.ROCK_MEDIUM) {
            new_sz = GameVars.ROCK_SMALL;
            magnitude = 1;
        }
        if (new_sz != -1) {
            add_rock(new Rock(this.vp, new_sz, // size
            this.x, this.y, // x, y
            GameUtils.one2n(GameVars.ROCK_MAX_SPEED), // xvel
            GameUtils.one2n(GameVars.ROCK_MAX_SPEED), // yvel
            GameUtils.one2n(64)) // num_rotations
            );
            add_rock(new Rock(this.vp, new_sz, // size
            this.x, this.y, // x, y
            GameUtils.one2n(GameVars.ROCK_MAX_SPEED), // xvel
            GameUtils.one2n(GameVars.ROCK_MAX_SPEED), // yvel
            GameUtils.one2n(64)) // num_rotations
            );
        }
        this.explode();
        super.die();
        // add_explosion(new Explosion(this.vp, this.x, this.y, this.xvel, this.yvel, magnitude));
    }
    explode() {
        const max_radius = Math.max(this.vecshape.bounds.width, this.vecshape.bounds.height);
        let size = 3;
        let num_particles = 4 + GameUtils.one2n(12);
        if (this.size === GameVars.ROCK_MEDIUM) {
            size = 2;
            num_particles = 2 + GameUtils.one2n(8);
        }
        else if (this.size === GameVars.ROCK_SMALL) {
            size = 1;
            num_particles = 4;
        }
        for (let i = 0; i < num_particles; i++) {
            const radius = Math.random() * max_radius;
            const angle_radians = Math.random() * 2 * Math.PI;
            const new_x = this.vecshape.aboutx + radius * Math.cos(angle_radians);
            const new_y = this.vecshape.abouty + radius * Math.sin(angle_radians);
            const ran_size = GameUtils.one2n(size);
            const vel = Math.abs(this.xvel) + Math.abs(this.yvel);
            const decay = GameUtils.one2n(vel / 32);
            let p = new Particle(this.vp, new_x, new_y, this.xvel, this.yvel, ran_size, decay);
            Particle.add_particle(p);
        }
    }
}
