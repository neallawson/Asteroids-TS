import { Polygon, Point } from "../../node_modules/pixi.js/dist/pixi.mjs";
// import { Polygon } from "pixi.js";
import { VectorMover } from "./Mover.js";
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
class Saucer extends VectorMover {
    static LARGE = 1; // 2 types of saucers, large
    static SMALL = 2; // and small.
    static ROT = 0; // Number of rotates() for full rotation
    static LEFT = 0; // Saucer's direction of flight, left
    static RIGHT = 1; // or right.
    static XVEL = 50; // Saucer's horizontal velocity
    static YVEL = 50; // Saucer's vertical velocity
    static L_VAL = 250; // Po value of a large saucer
    static S_VAL = 1000; // Po value of a small saucer
    static MOVE = 30; // number of ticks before changing direction
    static L_FIRE = 30; // number of ticks to fire for large
    static S_FIRE = 15; // number of ticks to fire for small
    // static data for building Saucer's VectorShape
    //	static   Saucer_x[] = {175, 0, 175, 262, 350, 437, 525, 700, 525, 175};
    // static   Saucer_x[] = {150, 0, 150, 225, 300, 375, 450, 600, 450, 150};
    // static   Saucer_y[] = {0, 125, 250, 250, 375, 250, 250, 125, 0, 0};
    static saucer_data = [
        150, 0, 0, 125, 150, 250, 225, 250, 300, 375, 375, 250, 450, 250, 600, 125, 450, 0, 150, 0
    ];
    static saucer_poly = new Polygon(Saucer.saucer_data);
}
