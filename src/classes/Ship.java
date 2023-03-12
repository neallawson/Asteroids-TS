//****************************************************************************
// ----- general information -----
//
// Ship.java	--	The moving ship
//
// Written by:				Neal Lawson, e-mail: nlawson@uga.icad.edu
// Initial Release:		01/29/97.
//
// Copyright (c) Neal Lawson, 1996
//
// ----- version information -----
// v 1.10a, 05/07/97, Ship now extends VectorMover...cleaned up.
// v 1.00a,	12/20/96 - 01/29/97,	Initial Classes and testing.
//
// ----- history and repairs -----
// 05/07/97 -- 05/14/97, v 1.10a:
//
//	05/14/97 --  Added code to support pausing.  Causes a game
//				lockup when last rock is destroyed.  Commented out.
//				Only affects the pause code in handleEvent().
//05/07/94 --	Ship now extends VectorMover instead of Mover.
//				Modified code to support this change:
//				a. s_vecshape -> vm_vecshape in VectorMover
//				b. removed delta computations in tick(), remove s_x, s_y
//				c. removed rapid repeat FIRE code.
// 02/05/97 -- Implemented new keyboard management, and steer() method.
//             This allows for auto-repeating of the keyboard for rotation
//             and thrust.  Had to turn down the thrust POWER a bit from
//             30 to 15.  Also changed the SHIP_ROT (ship rotations) from
//             16 to 32.  Added the keyboard boolean instance variables.
//             Also changed ship color from cyan to white.
// 02/04/97 -- Fixed bug in the FADE.  Failed to check negative directions.
//
// ----- Description -----
// Mover is a simple class to define what a moving game object needs
// in order to be functional.  Many of the concepts of this class were 
// taken from Chris Boyke's game, SpaceWar.
//****************************************************************************

import java.awt.*;
import Mover;

class Ship extends VectorMover {
	// Movement commands:  LEFT, RIGHT, THRUST, FIRE
	final static int LEFT = Event.LEFT;
	final static int RIGHT = Event.RIGHT;
	final static int THRUST = Event.UP;
	final static int FIRE = ' ';

	final static int SHIP_ROT = 32;	// Number of rotates() for full rotation (was 16)
	final static int POWER = 15;		// World-coord:  Thrust per press (was 30)
	final static int FADE = 1;			// fade-per-tick deduction
	static int MAX_SPEED;				// fastest m_xvel and m_yvel allowed

	// static data for building Ship's VectorShape
	static final int Ship_x[] = {125, 0, 93, 93, 156, 156, 250, 125};
	static final int Ship_y[] = {500, 0, 187, 125, 125, 187, 0, 500};
	static Polygon ShipPolygon;

	// instance data
	boolean s_rotleft;			// Keyboard booleans
	boolean s_rotright;
	boolean s_thrust;
	boolean s_fire;

	//---------------------------- METHODS -----------------------------------

	// initClass()	--	This method is called once for the entire class:
	// It sets up the arrays of points used by subsequent ship instances.
	static public void initClass()
	{
		ShipPolygon = new Polygon(Ship_x, Ship_y, Ship_x.length);
		MAX_SPEED = (int)((parent.WORLD_MAXX-parent.WORLD_MINX)*1.5)/parent.DELAY;
	}

	// constructor
	public Ship()
	{
		super();

		// setup our VectorShape
		vm_vecshape = new VectorShape(ShipPolygon, parent.gc_vp, SHIP_ROT);
	}

	// Reset variables, re-center ship
	public void startRound()		// override Mover.startRound()
	{
		super.startRound();			// set m_alive to true, velocities to 0
		centerShip();
		s_rotleft = s_rotright = s_thrust = s_fire = false;
	}

	// handle keyboard events
	public boolean handleEvent(Event e)
	{
		int i;

		switch(e.id) {
			case Event.KEY_PRESS:
			case Event.KEY_ACTION:
				if (e.key == LEFT) s_rotleft = true;
				if (e.key == RIGHT) s_rotright = true;
				if (e.key == THRUST) s_thrust = true;
				if (e.key == FIRE) {
					parent.addBullet(vm_vecshape.rot_pts.xpoints[0],
						vm_vecshape.rot_pts.ypoints[0],
						m_xvel, m_yvel,
						vm_vecshape.trig_vals[vm_vecshape.position][vm_vecshape.COS],
						vm_vecshape.trig_vals[vm_vecshape.position][vm_vecshape.SIN]);
				}
/*****COMMENTED OUT BECAUSE OF BUG*****
				if (e.key == 'p' || e.key == 'P')
					parent.pauseToggle();
*****/
				break;

			case Event.KEY_RELEASE:
			case Event.KEY_ACTION_RELEASE:
				if (e.key == LEFT) s_rotleft = false;
				if (e.key == RIGHT) s_rotright = false;
				if (e.key == THRUST) s_thrust = false;
				break;
		}
		return true;
	}

	private void steer()
	{
		int i;

		// rotate left and right
		if ( s_rotleft )
			rotate_left();
		if ( s_rotright )
			rotate_right();

		// thrust
		if ( s_thrust ) {
			i = m_xvel - (int) xthrust(POWER);
			if ( (i > 0 && i <= MAX_SPEED) || (i < 0 && i > -MAX_SPEED) )
				m_xvel = i;
			i = m_yvel + (int) ythrust(POWER);
			if ( (i > 0 && i <= MAX_SPEED) || (i < 0 && i > -MAX_SPEED) )
				m_yvel = i;
		}
	}

	public void tick()
	{
		steer();			// Based on keyboard booleans, manage ship

		// slow ship down a touch...check drift in all directions
		if ( m_xvel > FADE )
			m_xvel -= FADE;
		else if ( m_xvel < -FADE )
			m_xvel += FADE;
		if ( m_yvel > FADE )
			m_yvel -= FADE;
		else if ( m_yvel < -FADE )
			m_yvel += FADE;

		super.tick(); 	// VectorMover.tick(): apply topology, move vm_vecshape
	}

	public void paint(Graphics g)
	{
		g.setColor(Color.cyan);
		g.drawPolygon(vm_vecshape.screen_pts);
	}

	void centerShip()
	{
		int dx, dy;

		// center the coordinates
		m_x = parent.WORLD_MAXX / 2;
		m_y = parent.WORLD_MAXY / 2;
		dx = m_x - vm_oldx;
		dy = m_y - vm_oldy;
		vm_oldx = m_x;
		vm_oldy = m_y;

		// Translate (move) the VectorShape to m_x, m_y
		vm_vecshape.position = 0;
		vm_vecshape.move(dx, dy);
	}

	public void checkHits(Mover rocks[])
	{
		int i;
		Rocks arock;

		for (i=0; i<rocks.length; i++) {
			arock = (Rocks) rocks[i];
			if ( arock != null && arock.m_alive ) {
				if ( vm_vecshape.ShapeInShape(arock.vm_vecshape) ) {
					parent.addMisc(new Explosion(m_x, m_y, m_xvel, m_yvel));
					super.die();
					arock.die();
					parent.notifyDead();
					break;
				}
			}
		}
	}

	public boolean checkSaucerCollision(Mover s)
	{
		Saucer saucer = (Saucer) s;

		if ( saucer != null && saucer.m_alive ) {
			if ( vm_vecshape.ShapeInShape(saucer.vm_vecshape) ) {
				parent.addMisc(new Explosion(m_x, m_y, m_xvel, m_yvel));
				parent.addMisc(new Explosion(saucer.m_x, saucer.m_y,
					saucer.m_xvel, saucer.m_yvel));
				saucer.die();
				super.die();
				parent.notifyDead();
				return( true );
			}
		}
		return( false );
	}

	public void checkSaucerBulletHit(Bullet b)
	{
		if ( b != null && b.m_alive ) {
			if ( vm_vecshape.PointInShape(b.m_x, b.m_y) ) {
				parent.addMisc(new Explosion(m_x, m_y, m_xvel, m_yvel));
				super.die();
				b.die();
				parent.notifyDead();
			}
		}
	}
}
