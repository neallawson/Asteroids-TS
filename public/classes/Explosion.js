import { Graphics, Point } from "../../node_modules/pixi.js/dist/pixi.mjs";
// import { Point } from "pixi.js";
import { Mover } from "./Mover.js";
// Explosion.java -- Ship Explosion
// Explosion is a Mover that is an animated ship explosion.
export class Explosion extends Mover {
    static MAX_SIZE = [30, 60, 90, 300];
    static SIZE_INC = [1, 3, 5, 8];
    static COLOR = [0xff0000, 0xF5B507, 0xF7E96A, 0xffffff];
    static SPEED_MUL = 0.95;
    magnitude; // "Class" of explosion - use as index in above arrays.
    cur_size = 0; // explosion size at the moment.
    vp;
    // private world_point: Point;      // world point -> view point
    // private view_point: Point;		
    constructor(vp, x, y, xv, yv, magnitude) {
        super(vp.wp, Mover.TOPO_WRAP, x, y, xv, yv);
        // magnitude is used as an offset into an array. Bad form. Bounds check it.
        if (magnitude < 0)
            magnitude = 0;
        if (magnitude > 3)
            magnitude = 3;
        this.magnitude = magnitude;
        this.vp = vp;
    }
    tick() {
        // Slow down
        this.xvel *= Explosion.SPEED_MUL;
        this.yvel *= Explosion.SPEED_MUL;
        // Grow the explosion
        this.cur_size += Explosion.SIZE_INC[this.magnitude];
        // Explosion is done?
        if (this.cur_size >= Explosion.MAX_SIZE[this.magnitude])
            this.die();
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
        g.beginFill(Explosion.COLOR[this.magnitude], 0.8);
        g.drawCircle(view_point.x, view_point.y, this.cur_size * 2);
        g.endFill();
        //         g.setColor(Gameutil.randomColor());
        // //		g.setColor(Color.white);
        //         g.fillOval(view_point.x-size, view_point.y-size, size*2, size*2);
    }
}
