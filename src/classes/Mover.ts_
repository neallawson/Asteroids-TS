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

import java.awt.*;


/**
 *		VectorMover	--	a moving, 2d vector object 
 *		@author	Neal Lawson
 *		@version	1.0
 */

class VectorMover extends Mover
{
	VectorShape vm_vecshape;	// The Vector Shape object for this VM.
	int vm_oldx;					// previous x-position.  Mesh with m_x
	int vm_oldy;					// previous y-position.  Mesh with m_y

	public VectorMover()
	{
		super();
		vm_oldx = vm_oldy = 0;
	}

	// The following 5 methods are movement wrappers for vm_vecshape

	public double xthrust(int thrust)
	{
		return( vm_vecshape.xthrust(thrust) );
	}

	public double ythrust(int thrust)
	{
		return( vm_vecshape.ythrust(thrust) );
	}

	public void rotate_right()
	{
		vm_vecshape.rotate_right();
	}

	public void rotate_left()
	{
		vm_vecshape.rotate_left();
	}

	public void rotate_center()
	{
		vm_vecshape.rotate_center();
	}

	// tick()	--	This method overrides Mover.tick() and subclasses 
	// should override to provide specific movement instructions via
	// m_x, m_y, m_xvel, m_yvel, and VectorShape rotation calls.
	// Overridden tick() should call super.tick() (i.e., VectorMover.tick()
	// before adding their own movement code.

	public void tick()
	{
		int dx, dy;		// movement deltas

		// Call Mover.tick():  apply topology to m_x, m_y and m_xvel, m_yvel
		super.tick();

		// Compute Movement delta's and apply to vm_vecshape
		dx = m_xvel;
		dy = m_yvel;
		if ( topology == TOPO_WRAP ) {
			if ( m_x != vm_oldx ) {
				dx = m_x - vm_oldx;
				vm_oldx = m_x;
			}
			else {
				m_x += dx;
				vm_oldx = m_x;
			}
			if ( m_y != vm_oldy ) {
				dy = m_y - vm_oldy;
				vm_oldy = m_y;
			}
			else {
				m_y += dy;
				vm_oldy = m_y;
			}
		}
		vm_vecshape.move(dx, dy);
	}

	public void paint(Graphics g)
	{
		g.setColor(Color.white);
		g.drawPolygon(vm_vecshape.screen_pts);
	}
}


/**
 *		Mover	--	a moving object class.
 *		@author	Neal Lawson
 *		@version	1.0
 */

class Mover
{
	// Two types of topological interaction with the GameCanvas:
	static final int TOPO_WRAP = 0;
	static final int TOPO_BOUNCE = 1;

	static GameCanvas parent;
	static int topology;

	// instance variables
	int m_x;						// x-position of this mover (World coords)
	int m_y;						// y-position of this mover
	int m_xvel;					// x-velocity of this mover
	int m_yvel;					// y-velocity of this mover
	public boolean m_alive;	// well, are we?


	//----------------------------------------------------------------
	//	METHODS
	//----------------------------------------------------------------

	// This static method initializes the static data that is shared
	// by ALL instances (& subclass instances) of Mover
	static public void initClass(GameCanvas gc, int game_topology)
	{
		parent = gc;
		topology = game_topology;
	}

	// Constructor
	public Mover()
	{
		m_xvel = m_yvel = 0;
		m_alive = true;
	}

	public boolean handleEvent(Event e)
	{
		return( false );
	}

	public void paint(Graphics g)
	{
	}

	public void die()
	{
		m_alive = false;
	}

	public void startRound()
	{
		m_xvel = m_yvel = 0;
		m_alive = true;
	}

	// tick()	--	This method is called by the GameCanvas 'parent'.
	// Use this method to move and do something.
	public void tick()
	{
		if (topology == TOPO_BOUNCE) {
			if ( m_x < parent.gc_wp.xwl || m_x > parent.gc_wp.xwr )
				m_xvel = -m_xvel;
			if ( m_y < parent.gc_wp.ywb || m_y > parent.gc_wp.ywt )
				m_yvel = -m_yvel;
		}
		else if (topology == TOPO_WRAP) {
			if ( m_x < parent.gc_wp.xwl ) {
				m_x = parent.gc_wp.xwr;
			}
			else if ( m_x > parent.gc_wp.xwr )
				m_x = parent.gc_wp.xwl;
			if ( m_y < parent.gc_wp.ywb ) {
				m_y = parent.gc_wp.ywt;
			}
			else if ( m_y > parent.gc_wp.ywt )
				m_y = parent.gc_wp.ywb;
		}
	}
}
