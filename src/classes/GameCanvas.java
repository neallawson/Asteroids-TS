//****************************************************************************
// ----- general information -----
//
// GameCanvas.java	--	Asteroids game canvas.
//
// Written by:				Neal Lawson, e-mail: nlawson@uga.icad.edu
// Initial Release:		01/29/97.
//
// Copyright (c) Neal Lawson, 1996
//
// ----- version information -----
// v 1.10b, 06/06/97, Final changes and tweeks.  In beta.
// v 1.10b, 06/05/97, Changed ship/saucer clearing strategy.
// v 1.10a, 05/14/97, Added initial game text in start(), bug fixes.
// v 1.00a,	12/20/96 - 01/29/97,	Initial Classes and testing.
//
// ----- history and repairs -----
// 06/06/97 -- Modified run() slightly.  Make sure the ship is alive
//		before checking saucer and saucer bullet collisions with ship.
//
// 06/05/97 -- Changed strategy for bringing ship back into play when
//		it's destroyed.  Allow the saucer to clear the screen (i.e., do not
//		null it in notifyDead(), check if it's cleared in check_clear().
//		Also, check gc_restart before spawning a saucer, and set saucer_ctr
//		to zero (reset) when a new ship is spawned.
//
// 05/06/97 - 05/14/97, v 1.10a:
// 05/14/97 -- Added support for pausing.  Locks up when last rock is
//		destroyed, so I commented out the code.  Added method pauseToggle()
//		which is called by Ship.  Added instance var. gc_pause, boolean.
// 05/06/97 - 05/07/97 -- Various things.
//		a. Added initial game text in start().
//		b. fixed bug in addMisc(): check gc_miscmove != null first.
//		c. Added support for saucers (Saucer.java = new module in 1.10).
//
// ----- Description -----
// GameCanvas extends java.awt.Canvas to provide a graphical playing
// area for the Lunar Lander game.  It is the main game manager.  Many
// of the concepts of this class were taken from Chris Boyke's game,
// SpaceWar.
//****************************************************************************

import java.awt.*;
import java.util.Date;
//import Asteroids;
import Mover;
import Ship;
import Rocks;
import Saucer;

/**
 *		GameCanvas	--	Game's playing area.  Uses a thread to start/stop
 *		the game action, uses double-buffering for scene composition, and
 *		manages the game objects.
 *		@author	Neal Lawson
 *		@version	1.0
 */

class GameCanvas extends Canvas implements Runnable
{
	// constants
	final static int WORLD_MINX = 0;
	final static int WORLD_MAXX = 10000;
	final static int WORLD_MINY = 0;
	final static int WORLD_MAXY = 10000;
	final static int DELAY = 50;			// animation delay in milliseconds
	final static int MAX_BULLETS = 10;	// allocated size of gc_bullets[]
	final static int MAX_ROCKS = 50;		// allocated size of gc_rocks[]
	final static int MAX_MISC = 3;		// allocated size of gc_miscmove[];
	final static int START_ROCKS = 4;	// Round 1, starting # large rocks
	final static int NUM_SHIPS = 3;		// number of ships
	final static int FREE_SHIP = 10000;	// pts. to get a free ship
	
	// instance variables
	Graphics gc_graphics;		// double-buffering graphics
	Image gc_image;				// double-buffering image
	Thread gc_thread;				// Game Thread
	Viewport gc_vp;				// Viewport
	Worldport gc_wp;				// Worldport
	int gc_round;					// game round
	int gc_score;					// game score
	int gc_freescore;				// score at which a free ship is awarded
	Label gc_scorelabel;			// label displaying the game score
	Label gc_liveslabel;			// label displaying the remaining ship lives
	Label gc_roundlabel;			// label displaying the game round

	public Mover gc_rocks[]; 	// array of asteroid 'rocks'
	public Mover gc_bullets[];	// array of bullets
	public Mover gc_miscmove[];// array of miscellaneous movers (text...)
	public Ship gc_ship;			// the player's ship
	public Saucer gc_saucer;	// the flying saucer
	public Bullet gc_SaucerBullet;	// the saucer's lone bullet
	public int gc_lives;
	public boolean gc_gameOver;
	public boolean gc_pause;
	private boolean gc_restart = false;

	//----------------------------------------------------------------
	//	METHODS
	//----------------------------------------------------------------

	// Test method:  Remove when testing is done!
	public void newShip()
	{
		gc_lives++;
	}

	// Initialize the canvas.  Store the score label for updating
	public void init(Label scorelabel, Label liveslabel, Label roundlabel)
	{
		gc_scorelabel = scorelabel;
		gc_liveslabel = liveslabel;
		gc_roundlabel = roundlabel;
	}

	// Update the score
	void updateScore()
	{
		gc_scorelabel.setText(String.valueOf(gc_score));
		if ( gc_lives != 0 )
			gc_liveslabel.setText(String.valueOf(gc_lives-1));
		else
			gc_liveslabel.setText(String.valueOf(gc_lives));
		gc_roundlabel.setText(String.valueOf(gc_round));
	}

	public void start()
	{
		setBackground(Color.black);
		Mover.initClass(this, Mover.TOPO_WRAP);
		Rocks.initClass();
		Ship.initClass();
		Saucer.initClass();

		// Create the double-buffering image
		gc_image = createImage(size().width, size().height);
		gc_graphics = gc_image.getGraphics();

		// Create the Worldport and Viewport
		gc_wp = new Worldport(WORLD_MINX, WORLD_MAXX, WORLD_MINY, WORLD_MAXY);
		gc_vp = new Viewport(gc_wp, 0, size().width, size().height, 0);

		// Use gc_miscmove for startup text
		gc_miscmove = new Mover[MAX_MISC];
		addMisc(new MoverText("Asteroids, v 1.10b", Font.ITALIC));
		addMisc(new MoverText("(c) Copyright 1997, Neal Lawson", Font.ITALIC, 20));
		addMisc(new MoverText("press <START GAME> to begin", Font.ITALIC, 20));

		// Start the thread
		startThread();
	}

	// This method is called only by the GUI "start button".
	public void startGame()
	{
		// Grab a lock to modify instance data since the thread
		// is running

		synchronized(this) {
			requestFocus();
			gc_gameOver = false;
			gc_pause = false;
			gc_round = 0;
			gc_score = gc_freescore = 0;
			gc_lives = NUM_SHIPS;
			updateScore();
			gc_bullets = new Mover[MAX_BULLETS];
			gc_rocks = new Mover[MAX_ROCKS];
			gc_miscmove = new Mover[MAX_MISC];
			gc_ship = new Ship();

			startRound();
		}
		// If thread is stopped (someone pressed "stop game"), start it up
		startThread();			
	}

	// This method called once per round.
	void startRound()
	{
		int i;
		int num_big_rocks;

		// clean up rock and bullet arrays before restart
		for (i=0; i<MAX_ROCKS; i++) gc_rocks[i] = null;
		for (i=0; i<MAX_BULLETS; i++) gc_bullets[i] = null;
		for (i=0; i<MAX_MISC; i++) gc_miscmove[i] = null;
		gc_saucer = null;
		gc_SaucerBullet = null;

		// Reset the ship
		gc_ship.startRound();

		// Compute number of big rocks with which to start round
		gc_round++;
//		num_big_rocks = START_ROCKS+(int)Math.round(START_ROCKS * Math.log(gc_round));
		num_big_rocks = START_ROCKS+
				Gameutil.rand((int)Math.round(START_ROCKS * Math.log(gc_round)));

		// Create the rocks
		for (i=0; i<num_big_rocks; i++)
			gc_rocks[i] = createRock(Rocks.R_LARGE, 0, 0);
	}

	void startThread()
	{
		if ( gc_thread == null ) {
			gc_thread = new Thread(this);
			gc_thread.start();
		}
	}

	void stop()
	{
		if ( gc_thread != null ) {
			gc_thread.stop();
			gc_thread = null;
		}
	}

	public void paint(Graphics g)
	{
		int i;

		// Paint the ship first
		if ( gc_ship != null && gc_ship.m_alive )
			gc_ship.paint(g);

		// Next, paint the saucer
		if ( gc_saucer != null && gc_saucer.m_alive )
			gc_saucer.paint(g);

		// Next, paint the rocks
		if ( gc_rocks != null ) {
			for (i=0; i<MAX_ROCKS; i++) {
				if ( gc_rocks[i] != null && gc_rocks[i].m_alive ) {
					gc_rocks[i].paint(g);
				}
			}
		}

		// Next, paint the bullets
		if ( gc_bullets != null ) {
			for (i=0; i<MAX_BULLETS; i++) {
				if ( gc_bullets[i] != null && gc_bullets[i].m_alive ) {
					gc_bullets[i].paint(g);
				}
			}
		}

		// Next, paint the Saucer Bullet
		if ( gc_SaucerBullet != null && gc_SaucerBullet.m_alive )
			gc_SaucerBullet.paint(g);

		// And, finally the miscellaneous stuff
		if ( gc_miscmove != null ) {
			for (i=0; i<MAX_MISC; i++) {
				if ( gc_miscmove[i] != null && gc_miscmove[i].m_alive ) {
					gc_miscmove[i].paint(g);
				}
			}
		}
	}

	public void update(Graphics g)
	{
		if ( gc_graphics != null ) {
			gc_graphics.setColor(Color.black);
			gc_graphics.fillRect(0, 0, size().width, size().height);
			paint(gc_graphics);
			g.drawImage(gc_image, 0, 0, this);
		}
		else {
			super.update(g);
		}
	}

	public void run() {
		int i;
		int rocks_alive;
		int saucer_ctr = 0;

		while (true) {
			try {
				repaint();
				gc_thread.sleep(DELAY);

				synchronized(this) {

					// miscellaneous stuff first (in case of pause)
					if ( gc_miscmove != null ) {
						for (i=0; i<MAX_MISC; i++) {
							if (gc_miscmove[i] != null && gc_miscmove[i].m_alive) {
								gc_miscmove[i].tick();
							}
						}
					}

/*****COMMENTED OUT BECAUSE OF BUG*****
					// skip over everything but miscellaneous in case of pause
					if ( gc_pause == true )
						continue;
*****/

					// Ship next
					if ( gc_restart && check_clear() ) {
						gc_restart = false;
						gc_ship.m_alive = true;
						saucer_ctr = 0;		// force saucer counter restart
					}
					if ( gc_ship != null && gc_ship.m_alive )
						gc_ship.tick();

					// Bullets next
					if ( gc_bullets != null ) {
						for (i=0; i<MAX_BULLETS; i++) {
							if (gc_bullets[i] != null && gc_bullets[i].m_alive) {
								gc_bullets[i].tick();
								if ( gc_rocks != null )
									((Bullet)gc_bullets[i]).checkHits(gc_rocks);
							}
						}
					}

					// rocks next
					rocks_alive = 0;
					if ( gc_rocks != null ) {	// check this first!
						for (i=0; i<MAX_ROCKS; i++) {
							if (gc_rocks[i] != null && gc_rocks[i].m_alive) {
								rocks_alive++;
								gc_rocks[i].tick();
//								if ( gc_bullets != null )
//									((Rocks)gc_rocks[i]).checkHits(gc_bullets);
							}
						}
					}

					// Saucer time?
					saucer_ctr++;
// See notes on 06/05/97:
//					if ( !gc_gameOver && gc_saucer == null
					if ( !gc_gameOver && gc_saucer == null && gc_restart == false
						&& rocks_alive >= 1 && rocks_alive < 5 )
						if (saucer_ctr > 100) {
							saucer_ctr = 0;
							if ( Gameutil.rand_percent(0.5) ) {
								if ( gc_round < 4 )
									gc_saucer = new Saucer(Gameutil.rand_percent(0.7)?Saucer.LARGE:Saucer.SMALL, gc_ship);
								else
									gc_saucer = new Saucer(Gameutil.rand_percent(0.1)?Saucer.LARGE:Saucer.SMALL, gc_ship);
							}
						}

					// Saucer tick()
					if ( gc_saucer != null && gc_saucer.m_alive )
						gc_saucer.tick();
					if (gc_saucer != null && gc_saucer.m_alive==false)
						gc_saucer = null;

					// check for Saucer-Bullet-Rocks collision
					if (gc_rocks != null && gc_saucer != null && gc_saucer.m_alive)
						if (gc_saucer.checkRockHits(gc_rocks))
							gc_saucer = null;
					if (gc_bullets != null && gc_saucer!=null && gc_saucer.m_alive)
						if (gc_saucer.checkBulletHits(gc_bullets))
							gc_saucer = null;

					// check for Saucer-Ship collision
// 06/06/97, Added line 2 of if: check the ship state also
					if ( gc_saucer != null && gc_saucer.m_alive
						&& gc_ship != null && gc_ship.m_alive )
						if ( gc_ship.checkSaucerCollision(gc_saucer) )
							gc_saucer = null;

					// Process Saucer Bullet
					if (gc_SaucerBullet != null && gc_SaucerBullet.m_alive) {
						gc_SaucerBullet.tick();
						if ( gc_rocks != null )
							gc_SaucerBullet.checkHits(gc_rocks);
// 06/06/97, check if the ship is alive yet (check_clear() == true sets)
//						if ( gc_ship != null )
						if ( gc_ship != null && gc_ship.m_alive )
							gc_ship.checkSaucerBulletHit(gc_SaucerBullet);
					}

					// check for Ship-Rocks collision
					if ( gc_ship != null && gc_ship.m_alive )
						gc_ship.checkHits(gc_rocks);
					if ( rocks_alive == 0 && gc_round > 0 && gc_gameOver == false )
						startRound();
				}	// end synchronized() block
			}
			catch( InterruptedException e) {
				gc_thread.stop();
			}
		}
	}
 
	// Pass keyboard event to ship, all others to superclass
	public boolean handleEvent(Event e)
	{
		if (e.id >= Event.KEY_PRESS && e.id <= Event.KEY_ACTION_RELEASE) {
			if ( gc_ship != null && gc_ship.m_alive )
				gc_ship.handleEvent(e);
			return( true );
		}
		else {
			return super.handleEvent(e);
		}
	}

	// add a rock to gc_rocks[] if space is available
	public void addRock(Rocks r)
	{
		int i;

		if ( gc_rocks != null ) {
			for (i=0; i<gc_rocks.length; i++) {
				if ( gc_rocks[i] == null || !gc_rocks[i].m_alive ) {
					gc_rocks[i] = r;
					break;
				}
			}
		}
	}

	// Create a rock of a specified size and at a
	// specified location (except R_LARGE).
	public Rocks createRock(int size, int wx, int wy)
	{
		int x, y;
		int xv, yv;
		int one_sec_world;

		// if the size if LARGE, randomly generate the rock's
		// position away from canvas center, ignoring wx, wy.
		if ( size == Rocks.R_LARGE ) {
			int xmin = (WORLD_MAXX-WORLD_MINX) / 3;	// min x-distance
			int ymin = (WORLD_MAXY-WORLD_MINY) / 3;	// min y-distance
			int xc = (WORLD_MAXX-WORLD_MINX) / 2;		// center of canvas
			int yc = (WORLD_MAXY-WORLD_MINY) / 2;		// center of canvas
			do {
				x = Gameutil.rand(WORLD_MAXX);
				y = Gameutil.rand(WORLD_MAXY);
			} while ( Math.abs(xc-x) < xmin || Math.abs(yc-y) < ymin);
		}
		else {
			x = wx;
			y = wy;
		}
		one_sec_world = WORLD_MAXX / DELAY;	// speed to cover world per sec.
		xv = one_sec_world/10 + Gameutil.rand(one_sec_world/5);
		yv = one_sec_world/10 + Gameutil.rand(one_sec_world/5);
		if (Gameutil.rand_percent(0.5))
			xv = -xv;
		if (Gameutil.rand_percent(0.5))
			yv = -yv;
		return(new Rocks(size, x, y, xv, yv));
	}

	// Give birth to a new bullet
	public void addBullet(int x, int y, int xv, int yv, double sin, double cos)
	{
		int i;

		for (i=0; i<MAX_BULLETS; i++) {
			if (gc_bullets[i] == null || !gc_bullets[i].m_alive) {
				gc_bullets[i] = new Bullet(x, y, xv, yv, sin, cos);
				break;
			}
		}
	}

	// Give birth to a new saucer bullet
	public void addSaucerBullet(int x, int y, int xv, int yv, double sin, double cos)
	{
		gc_SaucerBullet = new Bullet(x, y, xv, yv, sin, cos);
	}

	// is a SaucerBullet currently active?
	public boolean checkSaucerBullet()
	{
		if ( gc_SaucerBullet != null && gc_SaucerBullet.m_alive )
			return( true );
		return( false );
	}

	// Add a miscellaneous Mover (i.e., MoverText, Explosion) to the
	// gc_miscmove array
	public void addMisc(Mover m)
	{
		int i;

		if ( gc_miscmove != null ) {
			for (i=0; i<MAX_MISC; i++) {
				if (gc_miscmove[i] == null || !gc_miscmove[i].m_alive) {
					gc_miscmove[i] = m;
					break;
				}
			}
		}
	}

	public void incrementScore(int s)
	{
		gc_score += s;
		gc_freescore += s;
		if ( gc_freescore > FREE_SHIP ) {
			gc_lives++;
			gc_freescore -= FREE_SHIP;
		}
		updateScore();
	}

	// Only Ship calls this method.  Re-start if any lives are left.
	public void notifyDead()
	{
// 6/5/97:  Try a different strategy than taking out the saucer at death.
// New strategy uses check_clear() to allow the saucer to clear the screen.
//		gc_saucer = null;
		gc_lives--;
		updateScore();
		if ( gc_lives > 0 ) {
			gc_ship.startRound();
			gc_restart = true;
			gc_ship.m_alive = false;	// check_clear() == true resets
		}
		else {
			gc_gameOver = true;
			addMisc(new MoverText("Game Over", Font.ITALIC));
		}
	}

/*****COMMENTED OUT BECAUSE OF BUG*****
	public void pauseToggle()
	{
		if ( gc_pause == true ) {
			gc_miscmove = null;
			gc_pause = false;
		}
		else {
			addMisc(new MoverText("<Paused>, Press 'p' to resume", Font.ITALIC, 20));
			gc_pause = true;
		}
	}
*****/

	// Is the middle of the field clear of rocks so that the ship
	// can start up?
	private boolean check_clear()
	{
		int i;
 		int midx, midy;
		int clearx, cleary;
		boolean allclear;

		// Wait until the saucer clears the screen
		if ( gc_saucer != null && gc_saucer.m_alive )
			return( false );

		if ( gc_rocks == null )
			return( true );

 		midx = (WORLD_MAXX - WORLD_MINX) / 2;
		midy = (WORLD_MAXY - WORLD_MINY) / 2;
		clearx = midx / 8;
		cleary = midy / 8;
		allclear = true;
		for (i=0; i<gc_rocks.length; i++) {
			if ( gc_rocks[i] != null && gc_rocks[i].m_alive ) {
				if ( Math.abs(gc_rocks[i].m_x-midx) < clearx ||
					  Math.abs(gc_rocks[i].m_y-midy) < cleary ) {
						allclear = false;
						break;
				}
			}
		}
		return( allclear );
	}
}
