// import { Renderer, Container, Ticker, Graphics } from '../node_modules/pixi.js/dist/pixi.mjs';

// import { Renderer, Container, Ticker, Graphics } from 'pixi.js';
// import { GameConstants } from './classes/GameConstants.js';
// import { Rock } from './classes/Rock.js';
// import { Ship } from './classes/Ship.js';
// import { Bullet } from './classes/Bullet.js';
// import { Explosion } from './classes/Explosion.js';
// import { Worldport, Viewport } from './classes/Engine2D.js';
// import { GameUtils } from './classes/GameUtils.js';


// export class GameController {

//     private vp: Viewport;
//     private wp: Worldport;
//     private renderer: Renderer;
//     private stage: Container;
//     private graphics: Graphics;


//     constructor(vp: Viewport, renderer: Renderer, stage: Container, g: Graphics) {
//         this.vp = vp;
//         this.wp = vp.wp;
//         this.renderer = renderer;
//         this.stage = stage;
//         this.graphics = g;
//     }

	// // Add a miscellaneous Mover (i.e., MoverText, Explosion) to the
	// // gc_miscmove array
	// public void addMisc(Mover m)
	// {
	// 	int i;

	// 	if ( gc_miscmove != null ) {
	// 		for (i=0; i<MAX_MISC; i++) {
	// 			if (gc_miscmove[i] == null || !gc_miscmove[i].m_alive) {
	// 				gc_miscmove[i] = m;
	// 				break;
	// 			}
	// 		}
	// 	}
	// }

	// public void incrementScore(int s)
	// {
	// 	gc_score += s;
	// 	gc_freescore += s;
	// 	if ( gc_freescore > FREE_SHIP ) {
	// 		gc_lives++;
	// 		gc_freescore -= FREE_SHIP;
	// 	}
	// 	updateScore();
	// }

    	// Only Ship calls this method.  Re-start if any lives are left.
// 	public void notifyDead()
// 	{
// // 6/5/97:  Try a different strategy than taking out the saucer at death.
// // New strategy uses check_clear() to allow the saucer to clear the screen.
// //		gc_saucer = null;
// 		gc_lives--;
// 		updateScore();
// 		if ( gc_lives > 0 ) {
// 			gc_ship.startRound();
// 			gc_restart = true;
// 			gc_ship.m_alive = false;	// check_clear() == true resets
// 		}
// 		else {
// 			gc_gameOver = true;
// 			addMisc(new MoverText("Game Over", Font.ITALIC));
// 		}
// 	}

    // Is the middle of the field clear of rocks so that the ship
	// can start up?
	// private boolean check_clear()
	// {
	// 	int i;
 	// 	int midx, midy;
	// 	int clearx, cleary;
	// 	boolean allclear;

	// 	// Wait until the saucer clears the screen
	// 	if ( gc_saucer != null && gc_saucer.m_alive )
	// 		return( false );

	// 	if ( gc_rocks == null )
	// 		return( true );

 	// 	midx = (WORLD_MAXX - WORLD_MINX) / 2;
	// 	midy = (WORLD_MAXY - WORLD_MINY) / 2;
	// 	clearx = midx / 8;
	// 	cleary = midy / 8;
	// 	allclear = true;
	// 	for (i=0; i<gc_rocks.length; i++) {
	// 		if ( gc_rocks[i] != null && gc_rocks[i].m_alive ) {
	// 			if ( Math.abs(gc_rocks[i].m_x-midx) < clearx ||
	// 				  Math.abs(gc_rocks[i].m_y-midy) < cleary ) {
	// 					allclear = false;
	// 					break;
	// 			}
	// 		}
	// 	}
	// 	return( allclear );
	// }

// }