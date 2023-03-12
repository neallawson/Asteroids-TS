//****************************************************************************
// ----- general information -----
//
// Rocks.java	--	The asteroids themselves
//
// Written by:				Neal Lawson, e-mail: nlawson@uga.icad.edu
// Initial Release:		01/29/97.
//
// Copyright (c) Neal Lawson, 1997
//
// ----- version information -----
// v 1.10a, 05/07/97, Rocks now extend VectorMover...see history & repairs
// v 1.00a,	12/20/96 - 01/29/97,	Initial Classes and testing.
//
// ----- history and repairs -----
// 05/07/97 -- v 1.10a,
//				Rocks now extend VectorMover instead of Mover.  Modified
//				code to support this change:
//				a. r_vecshape -> vm_vecshape in VectorMover
//				b. removed delta computations in tick(), remove x, y
//
// ----- Description -----
// Rocks is a Mover which implements the asteroid rocks.
//****************************************************************************

import java.awt.*;
import Mover;

class Rocks extends VectorMover {
	static final int Large_x[] = {0, 50, 300, 650, 670, 800,
											750, 600, 400, 150, 250, 0};
	static final int Large_y[] = {300, 100, 0, 100, 250, 400,
											650, 800, 700, 750, 500, 300};
	static Polygon LargePolygon;
	static final int R_LARGE = 0;
	static final int R_MEDIUM = 1;
	static final int R_SMALL = 2;
	static final int ROT_LEFT = 0;
	static final int ROT_RIGHT = 1;
	static final int R_LSCORE = 50;
	static final int R_MSCORE = 75;
	static final int R_SSCORE = 100;

	int rot_ticks;					// rotate how quickly
	int rot_dir;					// rotation direction
	int cur_tick;					// count up to rot_ticks before rotating
	int size;						// size of this rock

	// initClass()	--	This method is called once for the entire class:
	// It sets up the arrays of points used by subsequent rock instances.
	static public void initClass()
	{
		LargePolygon = new Polygon(Large_x, Large_y, Large_x.length);
	}
	
	public Rocks(int size, int x, int y, int xvelocity, int yvelocity)
	{
		super();

		// setup our VectorShape...scale if necessary
		this.size = size;
		vm_vecshape = new VectorShape(LargePolygon, parent.gc_vp, Large_x.length);
		if ( size == R_MEDIUM )
			parent.gc_vp.wp.scalepoly(vm_vecshape.world_pts, 0.6, 0.6);
		else if ( size == R_SMALL )
			parent.gc_vp.wp.scalepoly(vm_vecshape.world_pts, 0.3, 0.3);

		// Translate (move) this shape to x, y
		parent.gc_vp.wp.translatepoly(vm_vecshape.world_pts, x, y);
		m_x = x;
		m_y = y;
		vm_oldx = x;	// VectorMover uses these two to mesh with m_x, m_y.
		vm_oldy = y;

		// initialize remaining Mover variables
		m_xvel = xvelocity;
		m_yvel = yvelocity;
		m_alive = true;

		// setup random rotation variables
		cur_tick = 0;
		rot_ticks = 2 + Gameutil.rand(15);
		rot_dir = Gameutil.rand(100) < 50 ? ROT_LEFT : ROT_RIGHT;
	}

	public void tick()
	{
		// rotate the rock yet?
		cur_tick++;
		if (cur_tick == rot_ticks) {
			cur_tick = 0;
			if (rot_dir == ROT_LEFT)
				rotate_left();
			else
				rotate_right();
		}

		super.tick(); 	// VectorMover.tick(): apply topology, move vm_vecshape
	}

	public void paint(Graphics g)
	{
		g.setColor(Color.white);
		g.drawPolygon(vm_vecshape.screen_pts);
	}

	// Loop through the bullets[] array...check for point intersections
	public void checkHits(Mover bullets[])
	{
		int i;
		Bullet abullet;

		for (i=0; i<bullets.length; i++) {
			abullet = (Bullet) bullets[i];
			if ( abullet != null && abullet.m_alive ) {
				if ( vm_vecshape.PointInShape(abullet.m_x, abullet.m_y) ) {
					abullet.die();
					die();
					break;
				}
			}
		}
	}

	// rock has been hit by bullet or ship
	public void die()
	{
		super.die();
		hit();
	}

	// When rock is hit, this routine spawns new ones based on rock size
	private void hit()
	{
		if (size == R_LARGE) {
			parent.incrementScore(R_LSCORE);
			parent.addRock(parent.createRock(R_MEDIUM, m_x, m_y));
			parent.addRock(parent.createRock(R_MEDIUM, m_x, m_y));
		}
		else if (size == R_MEDIUM) {
			parent.incrementScore(R_MSCORE);
			parent.addRock(parent.createRock(R_SMALL, m_x, m_y));
			parent.addRock(parent.createRock(R_SMALL, m_x, m_y));
		}
		else if (size == R_SMALL)
			parent.incrementScore(R_SSCORE);
	}
}
