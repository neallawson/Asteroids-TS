// import { Graphics, Point } from "../../node_modules/pixi.js/dist/pixi.mjs";
import { Graphics, Point } from "pixi.js";
import { Mover } from "./Mover.js";
import { GameConstants } from "./GameConstants.js";
import { GameUtils } from "./GameUtils.js";
import { Viewport } from "./Engine2D.js";

//****************************************************************************
// ----- general information -----
//
// Bullet.java	--	The bullets
//
// Written by:				Neal Lawson, e-mail: nlawson@uga.icad.edu
// Initial Release:		01/29/97.
//
// Copyright (c) Neal Lawson, 1997
//
// ----- version information -----
// v 1.10a, 05/07/97, 'Rocks' now use vm_vecshape not r_vecshape, so
//		the r_vecshape reference in checkHits() was changed.
// v 1.00a,	12/20/96 - 01/29/97,	Initial Classes and testing.
//
// ----- history and repairs -----
//
// ----- Description -----
// Bullet is a Mover that serves as the Asteroids game bullets the
// Ship fires.
//****************************************************************************


export class Bullet extends Mover {
	static BULLET_SPEED = 200;		// speed, world coords.
	static MAX_TICKS = 1000 / GameConstants.DELAY;

    private vp: Viewport;
	private cur_tick: number;		// current tick
    private world_point: Point;
    private view_point: Point;

	// constructor:
	// x, y = position when fired.
	// xvelocity, yvelocity = velocity when fired.
	// sin, cos = sin & cos of ship position when fired.
	constructor(vp: Viewport, x: number, y: number, xvelocity: number, yvelocity: number, sin: number, cos: number)
	{
        super(vp.wp, Mover.TOPO_WRAP, x, y, xvelocity, yvelocity);
        this.vp = vp;

		// this.xvel = Math.round(xvelocity - Bullet.BULLET_SPEED*cos);
		// this.yvel = Math.round(yvelocity + Bullet.BULLET_SPEED*sin);
		this.xvel = xvelocity + Bullet.BULLET_SPEED*cos;
		this.yvel = yvelocity + Bullet.BULLET_SPEED*sin;
		this.cur_tick = 0;
        this.world_point = new Point(x, y);
        this.view_point  = new Point(x, y);
	}

	tick(): void
	{
		if ( this.cur_tick++ <= Bullet.MAX_TICKS ) {
			super.tick(); 	// apply topology to m_x, m_y and m_xvel, m_yvel

			// apply x and y velocities
			// Old: (If topology relocated m_x or m_y, don't apply velocity.) Why?
            this.x += this.xvel;
            this.y += this.xvel;

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

	paint(g: Graphics): void
	{
       	g.lineStyle(1, 0xffff00, 1);
		g.drawCircle(this.view_point.x, this.view_point.y, 2);
		// g.setColor(Color.yellow);
		// g.drawOval(b_pv.x, b_pv.y, 2, 2);
	}

	// public void checkHits(Mover rocks[])
	// {
	// 	int i;
	// 	Rocks arock;

	// 	for (i=0; i<rocks.length; i++) {
	// 		arock = (Rocks) rocks[i];
	// 		if ( arock != null && arock.m_alive ) {
	// 			if ( arock.vm_vecshape.PointInShape(m_x, m_y) ) {
	// 				super.die();
	// 				arock.die();
	// 				break;
	// 			}
	// 		}
	// 	}
	// }
}
