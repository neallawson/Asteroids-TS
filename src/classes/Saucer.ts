// import { Polygon, Point } from "../../node_modules/pixi.js/dist/pixi.mjs";
import { Graphics, Polygon, Point } from "pixi.js";
import { Mover, VectorMover } from "./Mover.js";
import { VectorShape, Worldport, Viewport } from "./Engine2D.js";
import { Bullet } from './Bullet.js';
import { Ship } from './Ship.js';
import { Particle } from './Particle.js';
import { Explosion } from './Explosion.js';
import { GameVars } from "./GameVars.js";
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
	//  static  SAUCER_LARGE = 1;	// 2 types of saucers, large
	//  static  SAUCER_SMALL = 2;	// and small.
	//  static  SAUCER_ROT = 0;	  	// Number of rotates() for full rotation
	//  static  SAUCER_LEFT = 0;	  	// Saucer's direction of flight, left
	//  static  SAUCER_RIGHT = 1;  	// or right.
	//  static  SAUCER_XVEL = 30;  	// Saucer's horizontal velocity
	//  static  SAUCER_YVEL = 30;  	// Saucer's vertical velocity
	//  static  SAUCER_LARGE_POINTS = 250;	// Points value of a large saucer
	//  static  SAUCER_SMALL_POINTS = 1000;// Points value of a small saucer
	//  static  SAUCER_MOVE = 30;	// number of ticks before changing direction
	//  static  SAUCER_LARGE_FIRE = 120;	// number of ticks to fire for large
	//  static  SAUCER_SMALL_FIRE = 70; // number of ticks to fire for small

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
	private dir: number;		// flight direction, SAUCER_LEFT or SAUCER_RIGHT
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

		this.bullet = new Bullet(vp, this, 0, 0, 0, 0, 0, 0);
		this.bullet.die();

		// setup our VectorShape
		const vecshape = new VectorShape(Saucer.saucer_poly, this.vp, GameVars.SAUCER_ROT);
		this.addVectorShape(vecshape);

		if (size == GameVars.SAUCER_SMALL) {
			Worldport.scalepoly(vecshape.world_pts, 0.7, 0.7);
			this.points_value = GameVars.SAUCER_SMALL_POINTS;
		}
		else
			this.points_value = GameVars.SAUCER_LARGE_POINTS;

		// 	// setup initial position and flight direction
		if (GameUtils.odds(50)) {
			this.dir = GameVars.SAUCER_RIGHT;
			this.x = 0;
			this.xvel = GameVars.SAUCER_XVEL;
		}
		else {
			this.dir = GameVars.SAUCER_LEFT;
			this.x = GameVars.WORLD_MAXX;
			this.xvel = -GameVars.SAUCER_XVEL;
		}
        // slow down big saucer
		if (size == GameVars.SAUCER_LARGE) {
			this.xvel *= 0.6;
			this.yvel *= 0.6;
		}
	 	this.y = GameUtils.one2n(GameVars.WORLD_MAXY);
		this.yvel = 0;
	}

	steer(): void
	{
		this.movectr++;
		if ( this.movectr > GameVars.SAUCER_MOVE ) {
			this.yvel = GameVars.SAUCER_YVEL;
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
		this.firectr++;
		if ( !this.bullet.isAlive() ) {
			if ( (this.size == GameVars.SAUCER_LARGE && this.firectr > GameVars.SAUCER_LARGE_FIRE)
				|| (this.size == GameVars.SAUCER_SMALL && this.firectr > GameVars.SAUCER_SMALL_FIRE) ) {
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
				// this.bullet = new Bullet(this.vp, x, y, this.xvel, this.yvel, fire_sin, -fire_cos);
				this.bullet = new Bullet(this.vp, this, x, y, this.xvel, this.yvel, -fire_cos, fire_sin);
				this.add_bullet(this.bullet);
			}
		}
	}

	tick(): void
	{
		// Is it time to die yet?
		if ( this.dir == GameVars.SAUCER_RIGHT && this.x > GameVars.WORLD_MAXX-100 )
			this.die();
		if ( this.dir == GameVars.SAUCER_LEFT && this.x < 100 )
			this.die();

		this.steer();			// steer saucer
		this.fire();			// fire a bullet...maybe

		super.tick(); 	// VectorMover.tick(): apply topology, move vm_vecshape
	}

	paint(g: Graphics): void
	{
        g.lineStyle(2, 0x00ff00, 1);
		g.drawPolygon(this.vecshape!.screen_pts.points);
		g.closePath();
	}

	die(): void
	{
		const max_radius = Math.max(this.vecshape!.bounds.width, this.vecshape!.bounds.height);
		for(let i=0; i<6; i++) {
			const radius = Math.random() * max_radius;
			const angle_radians = Math.random() * 2*Math.PI;
			const new_x = this.vecshape!.aboutx + radius * Math.cos(angle_radians);
			const new_y = this.vecshape!.abouty + radius * Math.sin(angle_radians);
			let p = new Particle(this.vp, new_x, new_y, this.xvel, this.yvel, GameUtils.one2n(4), GameUtils.one2n(10));
			Particle.add_particle(p);
		}

		super.die();
	}


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
