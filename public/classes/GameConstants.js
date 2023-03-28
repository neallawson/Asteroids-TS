// # ****************************************************************************
// #
// # Const.py -- Constants for the Asteroids game. Game objects need access to
// #     some of these, so they're consolidated here.
// #
// # Written by: Neal Lawson, captainneal@gmail.com
// # Copyright (c) Neal Lawson, 2022
// #
// # ****************************************************************************
export class GameConstants {
}
// # The DELAY" in the original game was used as the basis for other calculations. It was 50 (for 50 milliseconds) which
// # equates to 20 frames per second. To keep those relative timings, etc. as close as possible to the original, multiply
// # uses of "DELAY" in the code by this (this is the ratio of the cur/old frames-per-second to normalize the DELAY.
GameConstants.FPS = 60; // set the game frame rate
GameConstants.DELAY = 1000; // # Delay (in milliseconds) between frames.
GameConstants.OLD_DELAY = 50; //Delay in the original game, used to create the "fudge"
// For tick() timings, multiply old "DELAY" by this fudge.
GameConstants.DELAY_FUDGE = Math.floor(GameConstants.FPS / (1000 / GameConstants.OLD_DELAY));
// Game pieces move in the World coordinate system and are projected into a screen viewport for rendering.
GameConstants.WORLD_MINX = 0;
GameConstants.WORLD_MAXX = 10000;
GameConstants.WORLD_MINY = 0;
GameConstants.WORLD_MAXY = 10000;
GameConstants.SCREEN_WIDTH = 1000;
GameConstants.SCREEN_HEIGHT = Math.trunc(GameConstants.SCREEN_WIDTH * 0.8);
// Allocated array sizes for holding the various game objects
GameConstants.MAX_BULLETS = 10; // allocated size of gc_bullets[]
GameConstants.MAX_ROCKS = 50; // allocated size of gc_rocks[]
GameConstants.MAX_MISC = 3; // allocated size of gc_miscmove[]
GameConstants.START_ROCKS = 4; //Round 1, starting # large rocks
GameConstants.NUM_SHIPS = 3; // number of ships
GameConstants.FREE_SHIP = 10000; // pts. to get a free ship
