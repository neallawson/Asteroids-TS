// import { Graphics, Polygon } from "../../node_modules/pixi.js";

// import { Polygon, Point } from "../../node_modules/pixi.js/dist/pixi.mjs";
import { Graphics, Polygon, Point } from "pixi.js";
import { Mover, VectorMover } from "./Mover.js";
import { VectorShape, Worldport, Viewport } from "./Engine2D.js";
import { GameUtils } from "./GameUtils.js";


//****************************************************************************
// ----- general information -----
//
// Rock.java	--	The asteroids themselves
//
// Written by:				Neal Lawson, e-mail: nlawson@uga.icad.edu
// Initial Release:		01/29/97.
//
// Copyright (c) Neal Lawson, 1997
//
// ----- version information -----
// v 1.10a, 05/07/97, Rock now extend VectorMover...see history & repairs
// v 1.00a,	12/20/96 - 01/29/97,	Initial Classes and testing.
//
// ----- history and repairs -----
// 05/07/97 -- v 1.10a,
//				Rock now extend VectorMover instead of Mover.  Modified
//				code to support this change:
//				a. r_vecshape -> vm_vecshape in VectorMover
//				b. removed delta computations in tick(), remove x, y
//
// ----- Description -----
// Rock is a Mover which implements the asteroid rock.
//****************************************************************************


export class Rock extends VectorMover {
	static Large_rock_data = [
        0, 300,   50, 100,   300, 0,   650, 100,
        670, 250, 800, 400,  750, 650, 600, 800,
        400, 700, 150, 750,  250, 500,
    ];
	// private static Large_x = [0, 50, 300, 650, 670, 800,
	// 								750, 600, 400, 150, 250, 0];
	// private static Large_y = [300, 100, 0, 100, 250, 400,
	// 								650, 800, 700, 750, 500, 300];
	static Large_rock_poly: Polygon = new Polygon(Rock.Large_rock_data);
	static R_LARGE = 0;
	static R_MEDIUM = 1;
	static R_SMALL = 2;
	static ROCKS_MAX_SPEED = 30;
	static ROT_LEFT = 0;
	static ROT_RIGHT = 1;
	static R_LSCORE = 50;
	static R_MSCORE = 75;
	static R_SSCORE = 100;

	private num_rotations: number;		// how many rotate steps to complete a full rotation
	private rot_ticks: number;			// rotate how quickly
	private rot_dir: number;			// rotation direction
	private cur_tick: number;			// count up to rot_ticks before rotating
	private size: number;				// size of this rock
	
	constructor(vp: Viewport, size: number, x: number, y: number, xvelocity: number, yvelocity: number, num_rotations: number)
	{
		super(vp, Mover.TOPO_WRAP, x, y, xvelocity, yvelocity);

		this.size = size;
		this.num_rotations = num_rotations;

		// setup random rotation variables
		this.cur_tick = 0;							// count up to rot_ticks before rotating
        this.rot_ticks = 2 + GameUtils.one2n(15);	// rotate how quickly 1 + or 2 +
													// rotation direction
		this.rot_dir = GameUtils.odds(50) ? Rock.ROT_LEFT : Rock.ROT_RIGHT;

		// setup our VectorShape...scale if necessary...add to super() via inherited method.
		const vecshape: VectorShape = new VectorShape(Rock.Large_rock_poly, vp, num_rotations);
		if ( size == Rock.R_MEDIUM )
			Worldport.scalepoly(vecshape.world_pts, 0.6, 0.6);
		else if ( size == Rock.R_SMALL )
			Worldport.scalepoly(vecshape.world_pts, 0.3, 0.3);
		this.addVectorShape(vecshape);

		// Translate (move) this shape to x, y
		Worldport.translatepoly(vecshape.world_pts, x, y);
	}

	tick(): void
	{
		// rotate the rock yet?
		this.cur_tick++;
		if (this.cur_tick == this.rot_ticks) {
			this.cur_tick = 0;
			if (this.rot_dir == Rock.ROT_LEFT)
				this.rotate_left();
			else
				this.rotate_right();
		}

		super.tick(); 	// VectorMover.tick(): apply topology, move vm_vecshape
	}

	paint(g: Graphics): void
	{
		g.lineStyle(2, 0xffffff, 1);
		g.drawPolygon(this.vecshape!.screen_pts.points);
		g.closePath();
		// let viewp = new Point(0, 0);
		// let worldp = new Point(this.vecshape!.aboutx, this.vecshape!.abouty);
		// g.lineStyle(2, 0xdd0000, 1);
		// this.vp.Worldpoint2Viewpoint(worldp, viewp);
		// g.drawCircle(viewp.x, viewp.y, 5);
	}

	dieAndSpawn(addrock: (r: Rock) => void): void
	{
		super.die();

		let new_sz = -1;
		if (this.size === Rock.R_LARGE)
			new_sz = Rock.R_MEDIUM;
		else if (this.size === Rock.R_MEDIUM)
			new_sz = Rock.R_SMALL;			
		if (new_sz != -1) {
			addrock(new Rock(this.vp,
				new_sz,									// size
				this.x, this.y,							// x, y
				GameUtils.one2n(Rock.ROCKS_MAX_SPEED),	// xvel
				GameUtils.one2n(Rock.ROCKS_MAX_SPEED),	// yvel
				GameUtils.one2n(64))					// num_rotations
			);
			addrock(new Rock(this.vp,
				new_sz,									// size
				this.x, this.y,							// x, y
				GameUtils.one2n(Rock.ROCKS_MAX_SPEED),	// xvel
				GameUtils.one2n(Rock.ROCKS_MAX_SPEED),	// yvel
				GameUtils.one2n(64))					// num_rotations
			);
		}
	}


	// public void paint(Graphics g)
	// {
	// 	g.setColor(Color.white);
	// 	g.drawPolygon(vm_vecshape.screen_pts);
	// }

	// Loop through the bullets[] array...check for point intersections
	// public void checkHits(Mover bullets[])
	// {
	// 	int i;
	// 	Bullet abullet;

	// 	for (i=0; i<bullets.length; i++) {
	// 		abullet = (Bullet) bullets[i];
	// 		if ( abullet != null && abullet.m_alive ) {
	// 			if ( vm_vecshape.PointInShape(abullet.m_x, abullet.m_y) ) {
	// 				abullet.die();
	// 				die();
	// 				break;
	// 			}
	// 		}
	// 	}
	// }

	// rock has been hit by bullet or ship
	// die(): void
	// {
	// 	super.die();
	// 	this.hit();
	// }

	// When rock is hit, this routine spawns new ones based on rock size
	// hit(): void
	// {
	// 	if (size == R_LARGE) {
	// 		parent.incrementScore(R_LSCORE);
	// 		parent.addRock(parent.createRock(R_MEDIUM, m_x, m_y));
	// 		parent.addRock(parent.createRock(R_MEDIUM, m_x, m_y));
	// 	}
	// 	else if (size == R_MEDIUM) {
	// 		parent.incrementScore(R_MSCORE);
	// 		parent.addRock(parent.createRock(R_SMALL, m_x, m_y));
	// 		parent.addRock(parent.createRock(R_SMALL, m_x, m_y));
	// 	}
	// 	else if (size == R_SMALL)
	// 		parent.incrementScore(R_SSCORE);
	// }
}	