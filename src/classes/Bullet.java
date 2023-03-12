
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

import java.awt.*;
import Mover;

class Bullet extends Mover {
	static final int BULLET_SPEED = 200;		// speed, world coords.
	static final int MAX_TICKS = 1000 / parent.DELAY;	// was 750

	// Use these two points with Viewport methods for
	// updating positions
	Point b_pw;			// Location in World coords.  Mesh with m_x, m_y
	Point b_pv;			// Location in Viewport coords
	int cur_tick;		// current tick

	// constructor:
	// x, y = position when fired.
	// xvelocity, yvelocity = velocity when fired.
	// sin, cos = sin & cos of ship position when fired.
	public Bullet(int x, int y, int xvelocity, int yvelocity, double sin, double cos)
	{
		b_pw = new Point(x, y);
		b_pv = new Point(x, y);		// x, y = placeholders for viewport point
		m_x = x;
		m_y = y;
		m_xvel = (int) (xvelocity - BULLET_SPEED*cos);
		m_yvel = (int) (yvelocity + BULLET_SPEED*sin);
		cur_tick = 0;
		m_alive = true;
	}

	public void tick()
	{
		if ( cur_tick++ <= MAX_TICKS ) {
			super.tick(); 	// apply topology to m_x, m_y and m_xvel, m_yvel

			// compute and execute moves

			// If topology relocated m_x or m_y, don't apply velocity
			if ( m_x != b_pw.x )
				b_pw.x = m_x;
			else {
				m_x += m_xvel;
				b_pw.x = m_x;
			}
			if ( m_y != b_pw.y )
				b_pw.y = m_y;
			else {
				m_y += m_yvel;
				b_pw.y = m_y;
			}

			// Update Viewport point
			parent.gc_vp.wp.Worldpoint2Viewpoint(parent.gc_vp, b_pw, b_pv);
		}
		else
			m_alive = false;
	}

	public void paint(Graphics g)
	{
		g.setColor(Color.yellow);
		g.drawOval(b_pv.x, b_pv.y, 2, 2);
	}

	public void checkHits(Mover rocks[])
	{
		int i;
		Rocks arock;

		for (i=0; i<rocks.length; i++) {
			arock = (Rocks) rocks[i];
			if ( arock != null && arock.m_alive ) {
				if ( arock.vm_vecshape.PointInShape(m_x, m_y) ) {
					super.die();
					arock.die();
					break;
				}
			}
		}
	}
}
