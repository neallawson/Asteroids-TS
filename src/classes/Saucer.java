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

import java.awt.*;
import Mover;

class Saucer extends VectorMover {
	final static int LARGE = 1;	// 2 types of saucers, large
	final static int SMALL = 2;	// and small.
	final static int ROT = 0;	  	// Number of rotates() for full rotation
	final static int LEFT = 0;	  	// Saucer's direction of flight, left
	final static int RIGHT = 1;  	// or right.
	final static int XVEL = 50;  	// Saucer's horizontal velocity
	final static int YVEL = 50;  	// Saucer's vertical velocity
	final static int L_VAL = 250;	// Point value of a large saucer
	final static int S_VAL = 1000;// Point value of a small saucer
	final static int MOVE = 30;	// number of ticks before changing direction
	final static int L_FIRE = 30;	// number of ticks to fire for large
	final static int S_FIRE = 15; // number of ticks to fire for small

	// static data for building Saucer's VectorShape
//	static final int Saucer_x[] = {175, 0, 175, 262, 350, 437, 525, 700, 525, 175};
	static final int Saucer_x[] = {150, 0, 150, 225, 300, 375, 450, 600, 450, 150};
	static final int Saucer_y[] = {0, 125, 250, 250, 375, 250, 250, 125, 0, 0};
	static Polygon SaucerPolygon;

	// instance data
	Mover ship;	// the ship we're chasing
	int size;
	int dir;			// flight direction, LEFT or RIGHT
	int points;		// point value of this saucer
	int movectr;	// move counter
	int firectr;	// fire counter

	//---------------------------- METHODS -----------------------------------

	// initClass()	--	This method is called once for the entire class:
	// It sets up the arrays of points used by subsequent ship instances.
	static public void initClass()
	{
		SaucerPolygon = new Polygon(Saucer_x, Saucer_y, Saucer_x.length);
	}

	// constructor
	public Saucer(int size, Mover ship)
	{
		super();

		// save a reference to the ship we're trying to kill
		this.ship = ship;

		// setup our VectorShape
		vm_vecshape = new VectorShape(SaucerPolygon, parent.gc_vp, ROT);
		this.size = size;
		if ( size == SMALL ) {
			parent.gc_vp.wp.scalepoly(vm_vecshape.world_pts, 0.6, 0.6);
			points = S_VAL;
		}
		else
			points = L_VAL;

		// setup initial position and flight direction
		if (Gameutil.rand_percent(0.5)) {
			dir = RIGHT;
			m_x = 0;
			m_xvel = XVEL;
		}
		else {
			dir = LEFT;
			m_x = parent.WORLD_MAXX;
			m_xvel = -XVEL;
		}
		m_y = Gameutil.rand(parent.WORLD_MAXY);
		m_yvel = 0;
		m_alive = true;
		movectr = firectr = 0;
	}

	private void steer()
	{
		movectr++;
		if ( movectr > MOVE ) {
			m_yvel = YVEL;
			movectr = 0;
			if ( Gameutil.rand_percent(0.5) )
				m_yvel -= m_yvel;
		}
	}


	// Given x, y, and r, return an angle between -PI & PI
	double angle(double x, double y, double r) {
		double a;

		if(x>=0)
			return Math.asin(y/r);
		else 
			return Math.PI-Math.asin(y/r);
	}

	public void fire()
	{
		int x, y;
		int dx, dy;
		double r, a, fire_sin, fire_cos;

		firectr++;
		if ( parent.checkSaucerBullet() == false ) {
			if ( (size == LARGE && firectr > L_FIRE)
				|| (size == SMALL && firectr > S_FIRE) ) {
				firectr = 0;

				// Target Ship:  calculate the angle from saucer to ship
				x = vm_vecshape.aboutx;
				y = vm_vecshape.abouty;
				dx = ship.m_x-x;
				dy = ship.m_y-y;
				r = Math.sqrt(dx*dx + dy*dy);
				a = angle(dx,dy,r);
				fire_sin = Math.sin(a);
				fire_cos = Math.cos(a);

				// fire a bullet at the Ship
				parent.addSaucerBullet(x, y, 0, 0, fire_sin, -fire_cos);
			}
		}
	}

	public void tick()
	{
		// Is it time to die yet?
		if ( dir == RIGHT && m_x > parent.WORLD_MAXX-100 )
			die();
		if ( dir == LEFT && m_x < 100 )
			die();

		steer();			// steer saucer
		fire();			// fire a bullet

		super.tick(); 	// VectorMover.tick(): apply topology, move vm_vecshape
	}

	public void paint(Graphics g)
	{
		g.setColor(Color.green);
		g.drawPolygon(vm_vecshape.screen_pts);
	}

	public boolean checkRockHits(Mover rocks[])
	{
		int i;
		Rocks arock;

		for (i=0; i<rocks.length; i++) {
			arock = (Rocks) rocks[i];
			if ( arock != null && arock.m_alive ) {
				if ( vm_vecshape.ShapeInShape(arock.vm_vecshape) ) {
					parent.addMisc(new Explosion(m_x, m_y, m_xvel, m_yvel));
					die();
					arock.die();
					return(true);
				}
			}
		}
		return(false);
	}

	// Loop through the bullets[] array...check for point intersections
	public boolean checkBulletHits(Mover bullets[])
	{
		int i;
		Bullet abullet;

		for (i=0; i<bullets.length; i++) {
			abullet = (Bullet) bullets[i];
			if ( abullet != null && abullet.m_alive ) {
				if ( vm_vecshape.PointInShape(abullet.m_x, abullet.m_y) ) {
					abullet.die();
					parent.addMisc(new Explosion(m_x, m_y, m_xvel, m_yvel));
					die();
					parent.incrementScore(points);
					return(true);
				}
			}
		}
		return(false);
	}
}
