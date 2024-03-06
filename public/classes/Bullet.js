import { Graphics, Point } from "../../node_modules/pixi.js/dist/pixi.mjs";
// import { Point } from "pixi.js";
import { Mover } from "./Mover.js";
import { GameVars } from "./GameVars.js";
// Bullet
// Coded by: Neal Lawson, captainneal@gmail.com
// Copyright (c) Neal Lawson, 1996
export class Bullet extends Mover {
    static BULLET_SPEED = 200; // speed, world coords.
    static BULLET_MAX_TICKS = 700 / GameVars.DELAY;
    vp;
    cur_tick; // current tick
    world_point;
    view_point;
    owner; // Who shot this bullet?
    // constructor:
    // x, y = position when fired.
    // xvelocity, yvelocity = velocity when fired.
    // sin, cos = sin & cos of ship position when fired.
    constructor(vp, owner, x, y, xvelocity, yvelocity, sin, cos) {
        super(vp.wp, Mover.TOPO_WRAP, x, y, xvelocity, yvelocity);
        this.vp = vp;
        this.owner = owner;
        this.xvel = Math.round(xvelocity - Bullet.BULLET_SPEED * sin);
        this.yvel = Math.round(yvelocity + Bullet.BULLET_SPEED * cos);
        // console.log("xvel: "+this.xvel+" yvel: "+this.yvel);
        this.cur_tick = 0;
        this.world_point = new Point(x, y);
        this.view_point = new Point(x, y);
    }
    tick() {
        if (this.cur_tick++ <= Bullet.BULLET_MAX_TICKS) {
            super.tick(); // apply topology to m_x, m_y and m_xvel, m_yvel
            // apply x and y velocities
            // Old: (If topology relocated m_x or m_y, don't apply velocity.) Why?
            this.x += this.xvel;
            this.y += this.yvel;
            // if ( m_x != b_pw.x )
            // 	b_pw.x = m_x;
            // else {
            // 	m_x += m_xvel;
            // 	b_pw.x = m_x;
            // }
            // if ( m_y != b_pw.y )
            // 	b_pw.y = m_y;
            // else {
            // 	m_y += m_yvel;
            // 	b_pw.y = m_y;
            // }
            // Update internal points used for drawing.
            this.world_point.x = this.x;
            this.world_point.y = this.y;
            this.vp.Worldpoint2Viewpoint(this.world_point, this.view_point);
        }
        else
            this.alive = false;
    }
    paint(g) {
        g.lineStyle(1, 0xffff00, 1);
        g.drawCircle(this.view_point.x, this.view_point.y, 2);
        // g.setColor(Color.yellow);
        // g.drawOval(b_pv.x, b_pv.y, 2, 2);
    }
}
