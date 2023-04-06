import { Graphics, Point } from "../../node_modules/pixi.js/dist/pixi.mjs";
// import { Point } from "pixi.js";
import { Mover } from "./Mover.js";
//****************************************************************************
// ----- general information -----
//
// Explosion.java -- Ship Explosion
//
// Written by:				Neal Lawson, e-mail: nlawson@uga.icad.edu
// Initbreak
// ----- history and repairs -----
//
// ----- Description -----
// Explosion is a Mover that is an animated ship explosion.
//****************************************************************************
export class Explosion extends Mover {
    static MAX_SIZE = 80;
    static SIZE_INC = 4;
    static SPEED_MUL = 0.6;
    size = 0; // explosion size
    vp;
    // private world_point: Point;      // world point -> view point
    // private view_point: Point;		
    constructor(vp, x, y, xv, yv) {
        super(vp.wp, Mover.TOPO_WRAP, x, y, xv, yv);
        this.vp = vp;
        // this.world_point = new Point(x, y);
        // this.view_point = new Point(x, y);
        // vp.Worldpoint2Viewpoint(this.world_point, this.view_point);
    }
    tick() {
        // Slow down
        this.xvel *= Explosion.SPEED_MUL;
        this.yvel *= Explosion.SPEED_MUL;
        // Grow the explosion
        this.size += Explosion.SIZE_INC;
        if (this.size >= Explosion.MAX_SIZE)
            this.alive = false;
        // Move
        this.x += this.xvel;
        this.y += this.yvel;
        super.tick();
    }
    paint(g) {
        const world_point = new Point(this.x, this.y);
        const view_point = new Point(this.x, this.y);
        this.vp.Worldpoint2Viewpoint(world_point, view_point);
        g.lineStyle(2, 0xdd0000, 1);
        g.beginFill(0xff00, 0.8);
        g.drawCircle(view_point.x, view_point.y, this.size * 2);
        g.endFill();
        //         g.setColor(Gameutil.randomColor());
        // //		g.setColor(Color.white);
        //         g.fillOval(view_point.x-size, view_point.y-size, size*2, size*2);
    }
}
