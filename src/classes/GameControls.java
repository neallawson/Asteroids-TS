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

import java.awt.*;
import java.applet.Applet;

/*
 * GameControls -- manage the UI.  Primitive, but it seems to work.
 */

class GameControls extends Panel
{
   GameCanvas m_canvas;
	Button m_start;
	Button m_stop;
//	Button m_new;

	// constructor
    public GameControls(GameCanvas c) {
		m_canvas = c;
		add(m_start = new Button("Start Game"));
		add(m_stop = new Button("Stop Game"));
//		add(m_new = new Button("New Ship"));
    }

    public boolean action(Event ev, Object arg) {
		if (ev.target == m_start) m_canvas.startGame();
		else if (ev.target == m_stop) m_canvas.stop();
//		else if (ev.target == m_new) m_canvas.newShip();
		return true;
	}
}
