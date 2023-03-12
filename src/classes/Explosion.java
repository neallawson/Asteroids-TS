//****************************************************************************
// ----- general information -----
//
// Explosion.java -- Ship Explosion
//
// Written by:				Neal Lawson, e-mail: nlawson@uga.icad.edu
// Initial Release:		01/29/97.
//
// Copyright (c) Neal Lawson, 1997
//
// ----- version information -----
// v 1.00a,	12/20/96 - 01/29/97,	Initial Classes and testing.
//
// ----- history and repairs -----
//
// ----- Description -----
// Explosion is a Mover that is an animated ship explosion.
//****************************************************************************
/*---------------------------------------------------------------------------
	Many of the concepts of this class and game were generously taken from
	Chris Boyke's game, Spacewar.  Here is Chris' copyright statement and
	address:

   Copyright (C) 1996 by Chris Boyke, Clear View Consulting
                http://www.clear-view.com
 *--------------------------------------------------------------------------*/

import Mover;
import java.awt.*;
import Gameutil;

/*
 *
 *	Explosion
 *
 */
class Explosion extends Mover {
	static final int MAX_SIZE = 40;
	static final int SIZE_INC = 4;
	static final double SPEED_MUL = 0.95;
	int e_size;			// explosion size
	Point wp, vp;		// world point -> view point

	public Explosion(int x, int y, int sx, int sy)	
	{
		e_size = 0;
		m_x = x;
		m_y = y;
		m_xvel = sx;
		m_yvel = sy;
		m_alive = true;
		wp = new Point(m_x, m_y);
		vp = new Point(m_x, m_y);
	}

	public void tick() {
		// Slow down
		m_xvel *= SPEED_MUL;
		m_yvel *= SPEED_MUL;

		// Grow the explosion
		e_size += SIZE_INC;
		if (e_size >= MAX_SIZE)
			m_alive = false;

		// Move
		m_x += m_xvel;
		m_y += m_yvel;
		super.tick();
	}

	public void paint(Graphics g)
	{
		wp.x = m_x;
		wp.y = m_y;

		parent.gc_vp.wp.Worldpoint2Viewpoint(parent.gc_vp, wp, vp);
		g.setColor(Gameutil.randomColor());
//		g.setColor(Color.white);
		g.fillOval(vp.x-e_size, vp.y-e_size, e_size*2, e_size*2);
	}
}
