// import { Graphics, Point } from "../../node_modules/pixi.js/dist/pixi.mjs";
import { Graphics, Point } from "pixi.js";
import { Mover } from "./Mover.js";
import { GameConstants } from "./GameConstants.js";
import { GameUtils } from "./GameUtils.js";


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
                

class Explosion extends Mover {
    static MAX_SIZE = 80;
    static SIZE_INC = 4;
    static SPEED_MUL = 0.95;
    private size = 0;			// explosion size
    private world_point: Point;      // world point -> view point
    private view_point: Point;		

    public Explosion(x, int y, int sx, int sy)	
    {
        size = 0;
        x = x;
        y = y;
        xvel = sx;
        yvel = sy;
        alive = true;
        world_point = new Point(m_x, m_y);
        view_point = new Point(m_x, m_y);
    }

    public void tick() {
        // Slow down
        m_xvel *= SPEED_MUL;
        m_yvel *= SPEED_MUL;

        // Grow the explosion
        size += SIZE_INC;
        if (size >= MAX_SIZE)
            m_alive = false;

        // Move
        m_x += m_xvel;
        m_y += m_yvel;
        super.tick();
    }

    public void paint(g: Graphics)
    {
        world_point.x = m_x;
        world_point.y = m_y;

        parent.gc_vp.wp.Worldpoint2Viewpoint(parent.gc_vp, world_point, view_point);
        g.setColor(Gameutil.randomColor());
//		g.setColor(Color.white);
        g.fillOval(view_point.x-size, view_point.y-size, size*2, size*2);
    }
}