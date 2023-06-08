// import { Polygon, Point } from "../../node_modules/pixi.js/dist/pixi.mjs";
import { Graphics, Polygon, Point } from "pixi.js";
import { Mover, VectorMover } from "./Mover.js";
import { VectorShape, Worldport, Viewport } from "./Engine2D.js";
import { Bullet } from './Bullet.js';
import { Ship } from './Ship.js';
import { Explosion } from './Explosion.js';
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



class Saucer extends VectorMover {
	 static  LARGE = 1;	// 2 types of saucers, large
	 static  SMALL = 2;	// and small.
	 static  ROT = 0;	  	// Number of rotates() for full rotation
	 static  LEFT = 0;	  	// Saucer's direction of flight, left
	 static  RIGHT = 1;  	// or right.
	 static  XVEL = 50;  	// Saucer's horizontal velocity
	 static  YVEL = 50;  	// Saucer's vertical velocity
	 static  L_VAL = 250;	// Points value of a large saucer
	 static  S_VAL = 1000;// Points value of a small saucer
	 static  MOVE = 30;	// number of ticks before changing direction
	 static  L_FIRE = 30;	// number of ticks to fire for large
	 static  S_FIRE = 15; // number of ticks to fire for small

	// static data for building Saucer's VectorShape
//	static   Saucer_x[] = {175, 0, 175, 262, 350, 437, 525, 700, 525, 175};

	// static   Saucer_x[] = {150, 0, 150, 225, 300, 375, 450, 600, 450, 150};
	// static   Saucer_y[] = {0, 125, 250, 250, 375, 250, 250, 125, 0, 0};
    static saucer_data = [
        150, 0, 0, 125, 150, 250, 225, 250, 300, 375, 375, 250, 450, 250, 600, 125, 450, 0, 150, 0
    ];
	static saucer_poly = new Polygon(Saucer.saucer_data);

	// instance data
	private ship: Mover;    	// the ship we're chasing
	private size: number;
	private dir: number;		// flight direction, LEFT or RIGHT
	private points_value: number;		// points value of this saucer
	private movectr: number = 0;	// move counter
	private firectr: number = 0;	// fire counter
	private add_bullet: (b: Bullet) => void;
	private bullet: Bullet;


    constructor(vp: Viewport, size: number, ship: Ship, add_bullet: (b: Bullet) => void)
	{
		super(vp, Mover.TOPO_WRAP, 0, 0, 0, 0);
		this.size = size;
		this.ship = ship;
		this.add_bullet = add_bullet;

		this.bullet = new Bullet(vp, 0, 0, 0, 0, 0, 0);
		this.bullet.die();

		// setup our VectorShape
		const vecshape = new VectorShape(Saucer.saucer_poly, this.vp, Saucer.ROT);
		this.addVectorShape(vecshape);

		if (size == Saucer.SMALL) {
			Worldport.scalepoly(vecshape.world_pts, 0.6, 0.6);
			this.points_value = Saucer.S_VAL;
		}
		else
			this.points_value = Saucer.L_VAL;

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
	 	this.y = GameUtils.one2n(GameConstants.WORLD_MAXY);
		this.yvel = 0;
	}

	steer(): void
	{
		this.movectr++;
		if ( this.movectr > Saucer.MOVE ) {
			this.yvel = Saucer.YVEL;
			this.movectr = 0;
			if ( GameUtils.odds(50) )
				this.yvel -= this.yvel;
		}
	}


	// // Given x, y, and r, return an angle between -PI & PI
	angle(x: number, y: number, r: number): number
	{
		let a: number;

		if(x >= 0)
			return Math.asin(y/r);
		else 
			return Math.PI-Math.asin(y/r);
	}

	fire(): void
	{
	// 	int x, y;
	// 	int dx, dy;
	// 	double r, a, fire_sin, fire_cos;

		this.firectr++;
		if ( !this.bullet.isAlive() ) {
			if ( (this.size == Saucer.LARGE && this.firectr > Saucer.L_FIRE)
				|| (this.size == Saucer.SMALL && this.firectr > Saucer.S_FIRE) ) {
				this.firectr = 0;

				// Target Ship:  calculate the angle from saucer to ship.
				// Originate bullet from saucer center.
				const x = this.vecshape!.aboutx;
				const y = this.vecshape!.abouty;
				const dx = this.ship.x - x;
				const dy = this.ship.y - y;
				const r = Math.sqrt(dx*dx + dy*dy);
				const a = this.angle(dx, dy, r);
				const fire_sin = Math.sin(a);
				const fire_cos = Math.cos(a);

				// fire a bullet at the Ship
				this.bullet = new Bullet(this.vp, x, y, this.xvel, this.yvel, fire_sin, -fire_cos);
				this.add_bullet(this.bullet);
			}
		}
	}

	// public void tick()
	// {
	// 	// Is it time to die yet?
	// 	if ( dir == RIGHT && m_x > parent.WORLD_MAXX-100 )
	// 		die();
	// 	if ( dir == LEFT && m_x < 100 )
	// 		die();

	// 	steer();			// steer saucer
	// 	fire();			// fire a bullet

	// 	super.tick(); 	// VectorMover.tick(): apply topology, move vm_vecshape
	// }

	// public void paint(Graphics g)
	// {
	// 	g.setColor(Color.green);
	// 	g.drawPolygon(vm_vecshape.screen_pts);
	// }

	// public boolean checkRockHits(Mover rocks[])
	// {
	// 	int i;
	// 	Rocks arock;

	// 	for (i=0; i<rocks.length; i++) {
	// 		arock = (Rocks) rocks[i];
	// 		if ( arock != null && arock.m_alive ) {
	// 			if ( vm_vecshape.ShapeInShape(arock.vm_vecshape) ) {
	// 				parent.addMisc(new Explosion(m_x, m_y, m_xvel, m_yvel));
	// 				die();
	// 				arock.die();
	// 				return(true);
	// 			}
	// 		}
	// 	}
	// 	return(false);
	// }

	// // Loop through the bullets[] array...check for point intersections
	// public boolean checkBulletHits(Mover bullets[])
	// {
	// 	int i;
	// 	Bullet abullet;

	// 	for (i=0; i<bullets.length; i++) {
	// 		abullet = (Bullet) bullets[i];
	// 		if ( abullet != null && abullet.m_alive ) {
	// 			if ( vm_vecshape.PointInShape(abullet.m_x, abullet.m_y) ) {
	// 				abullet.die();
	// 				parent.addMisc(new Explosion(m_x, m_y, m_xvel, m_yvel));
	// 				die();
	// 				parent.incrementScore(points);
	// 				return(true);
	// 			}
	// 		}
	// 	}
	// 	return(false);
	// }
}
