"use strict";
//****************************************************************************
// ----- general information -----
//
// Mover.java	--	Moving object
//
// Written by:				Neal Lawson, e-mail: nlawson@uga.icad.edu
// Initial Release:		01/29/97.
//
// Copyright (c) Neal Lawson, 1996
//
// ----- version information -----
// v 1.10a, 05/07/97, Began work on new class VectorMover.
// v 1.00a,	12/20/96 - 01/29/97,	Initial Classes and testing.
//
// ----- history and repairs -----
// v 1.10a:
//		a. Added new class, VectorMover
//		b. Added instance var's, m_oldx, m_oldy to Mover.  New logic also.
//
// ----- Description -----
// Mover is a simple class to define what a moving game object needs
// in order to be functional.  Many of the concepts of this class were 
// taken from Chris Boyke's game, SpaceWar.
//****************************************************************************
var java = .awt.;
 * ;
/**
 *		VectorMover	--	a moving, 2d vector object
 *		@author	Neal Lawson
 *		@version	1.0
 */
class VectorMover extends Mover {
    VectorMover() {
        super();
        vm_oldx = vm_oldy = 0;
    }
    xthrust(int, thrust) {
        return (vm_vecshape.xthrust(thrust));
    }
    ythrust(int, thrust) {
        return (vm_vecshape.ythrust(thrust));
    }
    rotate_right() {
        vm_vecshape.rotate_right();
    }
    rotate_left() {
        vm_vecshape.rotate_left();
    }
    rotate_center() {
        vm_vecshape.rotate_center();
    }
    tick() {
        int;
        dx, dy; // movement deltas
        // Call Mover.tick():  apply topology to m_x, m_y and m_xvel, m_yvel
        super.tick();
        // Compute Movement delta's and apply to vm_vecshape
        dx = m_xvel;
        dy = m_yvel;
        if (topology == TOPO_WRAP) {
            if (m_x != vm_oldx) {
                dx = m_x - vm_oldx;
                vm_oldx = m_x;
            }
            else {
                m_x += dx;
                vm_oldx = m_x;
            }
            if (m_y != vm_oldy) {
                dy = m_y - vm_oldy;
                vm_oldy = m_y;
            }
            else {
                m_y += dy;
                vm_oldy = m_y;
            }
        }
        vm_vecshape.move(dx, dy);
    }
    paint(Graphics, g) {
        g.setColor(Color.white);
        g.drawPolygon(vm_vecshape.screen_pts);
    }
}
/**
 *		Mover	--	a moving object class.
 *		@author	Neal Lawson
 *		@version	1.0
 */
class Mover {
    constructor() {
        this.TOPO_WRAP = 0;
        this.TOPO_BOUNCE = 1;
    }
    initClass(GameCanvas, gc, int, game_topology) {
        parent = gc;
        topology = game_topology;
    }
    // Constructor
    Mover() {
        m_xvel = m_yvel = 0;
        m_alive = true;
    }
    handleEvent(Event, e) {
        return (false);
    }
    paint(Graphics, g) {
    }
    die() {
        m_alive = false;
    }
    startRound() {
        m_xvel = m_yvel = 0;
        m_alive = true;
    }
    tick() {
        if (topology == TOPO_BOUNCE) {
            if (m_x < parent.gc_wp.xwl || m_x > parent.gc_wp.xwr)
                m_xvel = -m_xvel;
            if (m_y < parent.gc_wp.ywb || m_y > parent.gc_wp.ywt)
                m_yvel = -m_yvel;
        }
        else if (topology == TOPO_WRAP) {
            if (m_x < parent.gc_wp.xwl) {
                m_x = parent.gc_wp.xwr;
            }
            else if (m_x > parent.gc_wp.xwr)
                m_x = parent.gc_wp.xwl;
            if (m_y < parent.gc_wp.ywb) {
                m_y = parent.gc_wp.ywt;
            }
            else if (m_y > parent.gc_wp.ywt)
                m_y = parent.gc_wp.ywb;
        }
    }
}
