// # ****************************************************************************
// #
// # Const.py -- Constants for the Asteroids game. Game objects need access to
// #     some of these, so they're consolidated here.
// #
// # Written by: Neal Lawson, captainneal@gmail.com
// # Copyright (c) Neal Lawson, 2022
// #
// # ****************************************************************************

export class GameVars {
    
    // # The DELAY" in the original game was used as the basis for other calculations. It was 50 (for 50 milliseconds) which
    // # equates to 20 frames per second. To keep those relative timings, etc. as close as possible to the original, multiply
    // # uses of "DELAY" in the code by this (this is the ratio of the cur/old frames-per-second to normalize the DELAY.
    static FPS = 60;               // set the game frame rate
    static DELAY = 17;             // # Delay (in milliseconds) between frames.
    static OLD_DELAY = 50;         //Delay in the original game, used to create the "fudge" Implies 20 FPS.
                                   // For tick() timings, multiply old "DELAY" by this fudge.
    static DELAY_FUDGE = Math.round(GameVars.FPS / (1000 / GameVars.OLD_DELAY));

    // Game pieces move in the World coordinate system and are projected into a screen viewport for rendering.
    static WORLD_MINX = 0;
    static WORLD_MAXX = 18000;
    static WORLD_MINY = 0;
    static WORLD_MAXY = 18000;
    // These are now determined by the max capability of the device's display (Neal, 4/2023)
    // static SCREEN_WIDTH = 1000;
    // static SCREEN_HEIGHT = Math.trunc(GameVars.SCREEN_WIDTH * 0.8);

    // Allocated array sizes for holding the various game objects
    static MAX_BULLETS = 10;    // allocated size of gc_bullets[]
    static MAX_ROCKS = 50;      // allocated size of gc_rocks[]
    static MAX_MISC = 3;        // allocated size of gc_miscmove[]
    static START_ROCKS = 7;     //Round 1, starting # large rocks
    static ROCKS_PER_ROUND = 3; // Number of rocks to add per round.
    static NUM_SHIPS = 3;       // number of ships
    static FREE_SHIP = 10000;   // pts. to get a free ship

    static SAUCER_DELAY = 100;  // How many ticks before trying to spawn saucer.

    // These constants should probably not be changed

    // define colors
    // BG = (144, 201, 120)
    // RED = (255, 0, 0)
    // WHITE = (255, 255, 255)
    // GREEN = (0, 255, 0)
    // BLACK = (0, 0, 0)
    // PINK = (235, 65, 54)
}