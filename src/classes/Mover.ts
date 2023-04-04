//import { Polygon } from "../../node_modules/pixi.js";
import { VectorShape, Worldport, Viewport } from "./Engine2D.js";


//****************************************************************************
// ----- general information -----
//
// Mover.java	--	Moving object
//
// Written by:				Neal Lawson, e-mail: nlawson@uga.icad.edu
// Initial Release:		01/29/97.
//
// Copyright (c) Neal Lawson, 1996
//
// ----- version information -----
// v 1.10a, 05/07/97, Began work on new class VectorMover.
// v 1.00a,	12/20/96 - 01/29/97,	Initial Classes and testing.
//
// ----- history and repairs -----
// v 1.10a:
//		a. Added new class, VectorMover
//		b. Added instance var's, m_oldx, m_oldy to Mover.  New logic also.
//
// ----- Description -----
// Mover is a simple class to define what a moving game object needs
// in order to be functional.  Many of the concepts of this class were 
// taken from Chris Boyke's game, SpaceWar.
//****************************************************************************


// /**
//  *		Mover	--	a moving object class.
//  *		@author	Neal Lawson
//  *		@version	1.0
//  */

 export class Mover
{
	// Two types of topological interaction with the GameCanvas:
	static TOPO_WRAP = 0;
	static TOPO_BOUNCE = 1;
	public alive: boolean;

	constructor( 
		private wp: Worldport,
		protected topology: number,
		protected x: number,			// x-position of this mover (World coords)
		protected y: number,			// y-position of this mover
		protected xvel: number,		// x-velocity of this mover
		protected yvel: number		// y-velocity of this mover
	)
	{
		this.alive = true;
	}

	// handleEvent(Event e)
	// {
	// 	return( false );
	// }

	// paint(Graphics g)
	// {
	// }

	die(): void
	{
		this.alive = false;
	}

	startRound(): void
	{
		this.xvel = 0;
		this.yvel = 0;
		this.alive = true;
	}

	// tick()	--	This method is called by the GameCanvas 'parent'.
	// Use this method to move and do something.
	tick(): void
	{
		if (this.topology == Mover.TOPO_WRAP) {
			if ( this.x < this.wp.xwl ) {
				this.x = this.wp.xwr;
			}
			else if ( this.x > this.wp.xwr )
				this.x = this.wp.xwl;
			if ( this.y < this.wp.ywb ) {
				this.y = this.wp.ywt;
			}
			else if ( this.y > this.wp.ywt )
				this.y = this.wp.ywb;
		}
		else if (this.topology == Mover.TOPO_BOUNCE) {
			if ( this.x < this.wp.xwl || this.x > this.wp.xwr )
				this.xvel = -this.xvel;
			if ( this.y < this.wp.ywb || this.y > this.wp.ywt )
				this.yvel = -this.yvel;
		}
		// TOTO add else {error}
	}
}


/**
 *		VectorMover	--	a moving, 2d vector object 
 *		@author	Neal Lawson
 *		@version	1.0
 */

export class VectorMover extends Mover
{
	protected vp: Viewport;	// TODO: Should this really be here?
	protected oldx: number;	// previous x-position.  Mesh with m_x
	protected oldy: number;	// previous y-position.  Mesh with m_y
	protected vecshape: VectorShape | null;	// The Vector Shape object for this VM.

	constructor(vp: Viewport, topology: number, x: number, y: number, xvel: number, yvel: number)
	{
		super(vp.wp, topology, x, y, xvel, yvel);
		this.vp = vp;
		this.oldx = x;
		this.oldy = y;
		this.vecshape = null;
	}

	addVectorShape(vecshape: VectorShape): void
	{
		this.vecshape = vecshape;
	}

	// The following 5 methods are movement wrappers for vm_vecshape

	xthrust(thrust: number): number
	{
		// The exclamation point tells compiler, trust me - there will be a vecshape here.
		// https://www.cloudhadoop.com/typescript-object-is-possibly-null-undefined/
		return this.vecshape!.xthrust(thrust);
	}

	ythrust(thrust: number): number
	{
		return this.vecshape!.ythrust(thrust);
	}

	rotate_right(): void
	{
		this.vecshape!.rotate_right();
	}

	rotate_left(): void
	{
		this.vecshape!.rotate_left();
	}

	rotate_center(): void
	{
		this.vecshape!.rotate_center();
	}

	// tick()	--	This method overrides Mover.tick() and subclasses 
	// should override to provide specific movement instructions via
	// x, y, xvel, yvel, and VectorShape rotation calls.
	// Overridden tick() should call super.tick() (i.e., VectorMover.tick()
	// before adding their own movement code.

	tick(): void
	{
		// Call Mover.tick():  apply topology to x, y and xvel, yvel
		super.tick();

		// Compute Movement delta's and apply to vm_vecshape
		let dx = this.xvel;
		let dy = this.yvel;
		if ( this.topology == Mover.TOPO_WRAP ) {
			if (this.x != this.oldx) {
				dx = this.x - this.oldx;
				this.oldx = this.x;
			}
			else {
				this.x += dx;
				this.oldx = this.x;
			}
			if ( this.y != this.oldy ) {
				dy = this.y - this.oldy;
				this.oldy = this.y;
			}
			else {
				this.y += dy;
				this.oldy = this.y;
			}
		}
		this.vecshape!.move(dx, dy);
	}

	// public void paint(Graphics g)
	// {
	// 	g.setColor(Color.white);
	// 	g.drawPolygon(vm_vecshape.screen_pts);
	// }
}