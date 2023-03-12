/************************************************************
 * Copyright (C) 1996 by Chris Boyke, Clear View Consulting	*
 *               http://www.clear-view.com                  *
 * Send questions, comments, and bug reports to:		      *
 * chris@clear-view.com                                     *
 *											                           *
 * This file may be freely copied and distributed for 		*
 * non-commercial and commercial purposes, as long as the   *
 * copyright information is maintained intact.				   *
 ************************************************************/

import Mover;
import java.awt.*;
import Gameutil;

/*
 *
 * MoverText
 *
 */
class MoverText extends Mover {
	String mt_string;
	Font mt_font;
	Color mt_color;
	Point wp, vp;

	public MoverText(String s, int style)
	{
		Common(s, style, 42);
	}

	public MoverText(String s, int style, int size)
	{
		Common(s, style, size);
	}

	public void Common(String s, int style, int size)
	{
		mt_string = s;
		mt_font = new Font("Arial",style,size);
		m_xvel = 50 + Gameutil.rand(50);
		m_yvel = 50 + Gameutil.rand(50);
		m_x = Gameutil.rand(5000);
		m_y = Gameutil.rand(5000);
		m_alive = true;
		mt_color = Gameutil.randomColor();
		wp = new Point(m_x, m_y);
		vp = new Point(m_x, m_y);
	}

	public void tick() {
		m_x += m_xvel;
		m_y += m_yvel;
		super.tick();
	}

	public void paint(Graphics g)
	{
		wp.x = m_x;
		wp.y = m_y;

		parent.gc_vp.wp.Worldpoint2Viewpoint(parent.gc_vp, wp, vp);
		g.setFont(mt_font);
		g.setColor(mt_color);
		g.drawString(mt_string, vp.x, vp.y);
	}
}
