"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pixi_js_1 = require("../../node_modules/pixi.js");
//****************************************************************************
// ----- general information -----
//
// TwoDimEngine.java	--	A two-dimensional, geometrical, vector engine.
//
// Written by:				Neal Lawson, e-mail: nlawson@uga.icad.edu
// Initial Release:		12/20/96.
//
// Copyright (c) Neal Lawson, 1996
//
// ----- version information -----
// v 1.00,	10/2/96 - 12/20/96,	Initial Classes and testing.
//
// ----- history and repairs -----
//
// ----- Description -----
// TwoDimEngine is a two-dimensional, geometrical, vector engine.
// Classes in this package include:
//
// 1) VectorShape is a class for two-dimensional shapes composed of a polygon.
// 	Linked to a Viewport (which is linked to a Worldport), VectorShape
//		objects can be moved and rotated.
//
// 2) Worldport is a class that implements a World coordinate system.
//
// 3) Viewport is a class that implements a Viewport coordinate system.
//		An instance of a ViewPort is linked to an instance of a WorldPort.
//
// 4) Line is a 2-d line class with methods for testing intersection.
//****************************************************************************
// /**
//  *		class VectorShape - A VectorShape is a 2-d vector item composed of world
//  *		and screen polygons.  When constructed, a shape gets a Viewport (which
//  *		is linked to a Worldport) and, possibly, a polygon.
//  *		@author	Neal Lawson
//  *		@version	1.0
//  */
class VectorShape {
    // /**
    //  *		VectorShape(Viewport)	--	This is VectorShape's simplest constructor.
    //  *		Classes extending VectorShape which call this constructor must setup
    //  *		the polygons themselves.
    //  */
    // constructor(vp: Viewport)
    // {
    // 	this.vp = vp;
    // }
    // /**
    //  *		VectorShape(Polygon, Viewport)	--	This constructor is called for
    //  *		VectorShape's that have pre-determined polygons.  If a VectorShape
    //  *		generates its own polygons (say, randomly), then it calls the simpler
    //  *		constructor.  In this latter case, the class extending VectorShape
    //  *		must call SetupPoints() when it has a polygon available.
    //  */
    constructor(pts, vp, nrotate) {
        this.vp = vp;
        this.SetupPoints(pts, nrotate);
    }
    // /**
    //  *		VectorShape.SetupPoints()	--	Allocate and initialize the various
    //  *		point arrays, bounding rectangle, and ALL instance variables EXCEPT
    //  *		the Viewport.
    //  */
    SetupPoints(pts, nrotate) {
        // npoints = pts.npoints; The typescript version of this class doesn't need this.
        this.world_pts = pts.clone();
        this.screen_pts = pts.clone();
        this.rot_pts = pts.clone();
        this.vp.wp.WorldpolytoViewpoly(vp, world_pts, screen_pts); // setup screen_pts
        this.bounds = new pixi_js_1.Rectangle();
        this.calc_bounds();
        this.position = 0;
        // Setup rotational variables if this VectorShape will need them
        if (nrotate > 0) {
            this.num_rotations = nrotate;
            trig_vals = new double[num_rotations][2];
            for (int; i = 0; i < num_rotations)
                ;
            i++;
            {
                double;
                radians = vp.wp.toradians(360 - i * (360 / num_rotations));
                trig_vals[i][COS] = Math.cos(radians);
                trig_vals[i][SIN] = Math.sin(radians);
            }
        }
    }
    calc_bounds() {
        int;
        maxx = 0;
        int;
        maxy = 0;
        bounds.x = world_pts.xpoints[0];
        bounds.y = world_pts.ypoints[0];
        for (int; i = 0; i < world_pts.npoints)
            ;
        i++;
        {
            if (world_pts.xpoints[i] < bounds.x)
                bounds.x = world_pts.xpoints[i];
            if (world_pts.ypoints[i] < bounds.y)
                bounds.y = world_pts.ypoints[i];
            if (world_pts.xpoints[i] > maxx)
                maxx = world_pts.xpoints[i];
            if (world_pts.ypoints[i] > maxy)
                maxy = world_pts.ypoints[i];
        }
        bounds.width = maxx - bounds.x;
        bounds.height = maxy - bounds.y;
        aboutx = bounds.x + bounds.width / 2;
        abouty = bounds.y + bounds.height / 2;
    }
    move(int, xvel, int, yvel) {
        // translate the polygon by 'xvel, yvel'
        vp.wp.translatepoly(world_pts, xvel, yvel);
        // calculate new bounding rectangle AND new geom. center
        calc_bounds();
        // copy the world polygon into the rotational polygon
        System.arraycopy(world_pts.xpoints, 0, rot_pts.xpoints, 0, world_pts.npoints);
        System.arraycopy(world_pts.ypoints, 0, rot_pts.ypoints, 0, world_pts.npoints);
        // rotate if not in the 0 position
        if (position != 0) {
            // translate to (0,0)
            vp.wp.translatepoly(rot_pts, -aboutx, -abouty);
            // fast version of rotatepoly()
            vp.wp.rotatepoly(rot_pts, trig_vals[position][COS], trig_vals[position][SIN]);
            // translate back to (aboutx, abouty)
            vp.wp.translatepoly(rot_pts, aboutx, abouty);
        }
        // Map the screen_pts (viewport coords) from rot_pts (worldport coords).
        vp.wp.WorldpolytoViewpoly(vp, rot_pts, screen_pts);
    }
    xthrust(int, thrust) {
        return (trig_vals[position][SIN] * thrust);
    }
    ythrust(int, thrust) {
        return (trig_vals[position][COS] * thrust);
    }
    rotate_right() {
        if (position == num_rotations - 1)
            position = 0;
        else
            position++;
    }
    rotate_left() {
        if (position == 0)
            position = num_rotations - 1;
        else
            position--;
    }
    rotate_center() {
        position = 0;
    }
    paint(Graphics, g) {
        g.drawPolygon(screen_pts);
    }
    PointInShape(int, x, int, y) {
        // First, check the bounding box...then polygon itself
        return (bounds.inside(x, y));
        //		if ( bounds.inside(x, y) )
        //			return( world_pts.inside(x, y) );
        //		return( false );
    }
    ShapeInShape(VectorShape, vs) {
        int;
        i;
        int;
        n = vs.world_pts.xpoints.length;
        int;
        vs_x[] = vs.world_pts.xpoints;
        int;
        vs_y[] = vs.world_pts.ypoints;
        for (i = 0; i < n; i++) {
            if (PointInShape(vs_x[i], vs_y[i]))
                return (true);
        }
        return (false);
    }
} // end class VectorShape
VectorShape.COS = 0; // offset into trig_vals
VectorShape.SIN = 1; // offset into trig_vals
/**
 *		class Worldport -- Implement a 2d World coordinate system.
 *		This system is based on integers and provides methods for
 *		translating, scaling, rotating, and copying polygons defined
 *		in Java.Awt.Polygon.
 *		A method, WorldtoView will convert a World coordinate point
 *		to a given Viewport coordinate point.
 *
 *		@author	Neal Lawson
 *		@version	1.0
 */
class Worldport {
    Worldport(int, xmin, int, xmax, int, ymin, int, ymax) {
        xwl = xmin;
        xwr = xmax;
        ywb = ymin;
        ywt = ymax;
    }
    resize_port(int, xmin, int, xmax, int, ymin, int, ymax) {
        xwl = xmin;
        xwr = xmax;
        ywb = ymin;
        ywt = ymax;
    }
    toradians(double, d) {
        return (d * Math.PI / 180.0);
    }
    translatepoint(Point, p, int, tx, int, ty) {
        p.x += tx;
        p.y += ty;
    }
    translatepoly(Polygon, poly, int, tx, int, ty) {
        for (int; i = 0; i < poly.npoints)
            ;
        i++;
        {
            poly.xpoints[i] += tx;
            poly.ypoints[i] += ty;
        }
    }
    scalepoly(Polygon, poly, double, sx, double, sy) {
        for (int; i = 0; i < poly.npoints)
            ;
        i++;
        {
            poly.xpoints[i] = (int)((double), poly.xpoints[i] * sx);
            poly.ypoints[i] = (int)((double), poly.ypoints[i] * sy);
        }
    }
    rotatepoint(Point, p, double, angle) {
        int;
        x, y;
        double;
        rad, costheta, sintheta;
        rad = toradians(angle);
        costheta = Math.cos(rad);
        sintheta = Math.sin(rad);
        x = p.x;
        y = p.y;
        p.x = (int)(x * costheta - y * sintheta);
        p.y = (int)(x * sintheta + y * costheta);
    }
    rotatepoly(Polygon, poly, double, angle) {
        int;
        x, y;
        double;
        rad, costheta, sintheta;
        rad = toradians(angle);
        costheta = Math.cos(rad);
        sintheta = Math.sin(rad);
        for (int; i = 0; i < poly.npoints)
            ;
        i++;
        {
            x = poly.xpoints[i];
            y = poly.ypoints[i];
            poly.xpoints[i] = (int)(x * costheta - y * sintheta);
            poly.ypoints[i] = (int)(x * sintheta + y * costheta);
        }
    }
    rotatepoint(Point, p, double, cost, double, sint) {
        int;
        x, y;
        x = p.x;
        y = p.y;
        p.x = (int)(x * cost - y * sint);
        p.y = (int)(x * sint + y * cost);
    }
    rotatepoly(Polygon, poly, double, cost, double, sint) {
        int;
        x, y;
        for (int; i = 0; i < poly.npoints)
            ;
        i++;
        {
            x = poly.xpoints[i];
            y = poly.ypoints[i];
            poly.xpoints[i] = (int)(x * cost - y * sint);
            poly.ypoints[i] = (int)(x * sint + y * cost);
        }
    }
    copypoly(Polygon, polyfrom, Polygon, polyto) {
        if (polyfrom.npoints != polyto.npoints)
            return (false);
        for (int; i = 0; i < polyfrom.npoints)
            ;
        i++;
        {
            polyto.xpoints[i] = polyfrom.xpoints[i];
            polyto.ypoints[i] = polyfrom.ypoints[i];
        }
        return (true);
    }
    Worldpoint2Viewpoint(Viewport, vp, Point, worldp, Point, viewp) {
        viewp.x = (int)(vp.a * worldp.x + vp.b);
        viewp.y = (int)(vp.c * worldp.y + vp.d);
    }
    WorldpolytoViewpoly(Viewport, vp, Polygon, wpoly, Polygon, vpoly) {
        if (wpoly.npoints != vpoly.npoints)
            return (false);
        for (int; i = 0; i < wpoly.npoints)
            ;
        i++;
        {
            vpoly.xpoints[i] = (int)(vp.a * wpoly.xpoints[i] + vp.b);
            vpoly.ypoints[i] = (int)(vp.c * wpoly.ypoints[i] + vp.d);
        }
        return (true);
    }
} // end class Worldport
/**
 *		class Viewport -- Implement a 2d screen coordinate system.
 *		Notice that a Viewport is linked to a Worldport.
 *		This system is based on integers and provides methods for
 *		translating, scaling, rotating, and copying polygons defined
 *		in Java.Awt.Polygon.
 *		Method ViewtoWorld will convert Viewport coordinates to
 *		the linked Worldport coordinates.
 *
 *		@author	Neal Lawson
 *		@version	1.0
 */
class Viewport {
    Viewport(Worldport, wp, int, xmin, int, xmax, int, ymin, int, ymax) {
        this.wp = wp;
        xvl = xmin;
        xvr = xmax;
        yvb = ymin;
        yvt = ymax;
        calc_scalefactors();
    }
    calc_scalefactors() {
        //		int xd, yd;
        a = (double)(xvr - xvl) / (double)(wp.xwr - wp.xwl);
        b = (double);
        xvl - a * wp.xwl;
        c = (double)(yvt - yvb) / (double)(wp.ywt - wp.ywb);
        d = (double);
        yvb - c * wp.ywb;
        // NOTE:  Tried to implement aspectratio in WorldPort.WorldpolyToViewpoly().
        // This experiment failed...try again later. -Neal
        //		xd = Math.abs(xvr-xvl);
        //		yd = Math.abs(yvt-yvb);
        //		if (xd > yd)
        //			aspectratio = yd/xd;
        //		else
        //			aspectratio = xd/yd;
    }
    resize_worldport(int, xmin, int, xmax, int, ymin, int, ymax) {
        wp.resize_port(xmin, xmax, ymin, ymax);
        calc_scalefactors();
    }
    set_aspect(double, asp) {
        aspectratio = asp;
    }
    translatepoly(Polygon, poly, int, tx, int, ty) {
        for (int; i = 0; i < poly.npoints)
            ;
        i++;
        {
            poly.xpoints[i] += tx;
            poly.ypoints[i] += ty;
        }
    }
    scalepoly(Polygon, poly, int, sx, int, sy) {
        for (int; i = 0; i < poly.npoints)
            ;
        i++;
        {
            poly.xpoints[i] *= sx;
            poly.ypoints[i] *= sy;
        }
    }
    rotatepoly(Polygon, poly, double, angle) {
        int;
        x, y;
        double;
        rad, costheta, sintheta;
        rad = wp.toradians(angle);
        costheta = Math.cos(rad);
        sintheta = Math.sin(rad);
        for (int; i = 0; i < poly.npoints)
            ;
        i++;
        {
            x = poly.xpoints[i];
            y = poly.ypoints[i];
            poly.xpoints[i] = (int)(x * costheta - y * sintheta / aspectratio);
            poly.ypoints[i] = (int)(x * sintheta * aspectratio + y * costheta);
        }
    }
    rotatepoly(Polygon, poly, double, cost, double, sint) {
        int;
        x, y;
        for (int; i = 0; i < poly.npoints)
            ;
        i++;
        {
            x = poly.xpoints[i];
            y = poly.ypoints[i];
            poly.xpoints[i] = (int)(x * cost - y * sint / aspectratio);
            poly.ypoints[i] = (int)(x * sint * aspectratio + y * cost);
        }
    }
    copypoly(Polygon, polyfrom, Polygon, polyto) {
        if (polyfrom.npoints != polyto.npoints)
            return (false);
        for (int; i = 0; i < polyfrom.npoints)
            ;
        i++;
        {
            polyto.xpoints[i] = polyfrom.xpoints[i];
            polyto.ypoints[i] = polyfrom.ypoints[i];
        }
        return (true);
    }
    ViewtoWorld(int, vx, int, vy, int, wx, int, wy) {
        wx = (int)(((double)), vx - b) / a;
        ;
        wy = (int)(((double)), vy - d) / c;
        ;
    }
    ViewpolytoWorldpoly(Polygon, vpoly, Polygon, wpoly) {
        if (vpoly.npoints != wpoly.npoints)
            return (false);
        for (int; i = 0; i < vpoly.npoints)
            ;
        i++;
        ViewtoWorld(vpoly.xpoints[i], vpoly.ypoints[i], wpoly.xpoints[i], wpoly.ypoints[i]);
        return (true);
    }
} // end class Viewport
/**
 *		class Line -- Define a line as two endpoints.  Provide
 *		methods for testing line intersections geometrically.
 *
 *		@author	Neal Lawson
 *		@version	1.0
 */
class Line {
    Line(int, leftx, int, lefty, int, rightx, int, righty) {
        leftend = new Point(leftx, lefty);
        rightend = new Point(rightx, righty);
    }
    Line(Point, leftin, Point, rightin) {
        leftend = new Point(leftin.x, leftin.y);
        rightend = new Point(rightin.x, rightin.y);
    }
    setleft(int, x, int, y) {
        leftend.x = x;
        leftend.y = y;
    }
    setright(int, x, int, y) {
        rightend.x = x;
        rightend.y = y;
    }
    draw(Graphics, g) {
        g.drawLine(leftend.x, leftend.y, rightend.x, rightend.y);
    }
    intersect(Line, other, Point, where) {
        if (leftend.x > other.leftend.x && leftend.x > other.rightend.x
            && rightend.x > other.leftend.x && rightend.x > other.rightend.x)
            return (false);
        if (leftend.y > other.leftend.y && leftend.y > other.rightend.y
            && rightend.y > other.leftend.y && rightend.y > other.rightend.y)
            return (false);
        if (leftend.x < other.leftend.x && leftend.x < other.rightend.x
            && rightend.x < other.leftend.x && rightend.x < other.rightend.x)
            return (false);
        if (leftend.y < other.leftend.y && leftend.y < other.rightend.y
            && rightend.y < other.leftend.y && rightend.y < other.rightend.y)
            return (false);
        return (slow_intersect(other, where));
    }
    slow_intersect(Line, other, Point, where) {
        double;
        dkx, dky;
        double;
        dlx, dly;
        double;
        dmx, dmy;
        double;
        dnx, dny;
        double;
        b1, b2, a1, a2;
        double;
        xi, yi;
        double;
        tol = 0.0001;
        // doubles of endoints
        dkx = (double);
        leftend.x;
        dky = (double);
        leftend.y;
        dlx = (double);
        rightend.x;
        dly = (double);
        rightend.y;
        dmx = (double);
        other.leftend.x;
        dmy = (double);
        other.leftend.y;
        dnx = (double);
        other.rightend.x;
        dny = (double);
        other.rightend.y;
        // check for common endpoint
        if ((dmx == dkx && dmy == dky)
            || (dmx == dlx && dmy == dly)) {
            where.x = other.leftend.x;
            where.y = other.leftend.y;
            return (true);
        }
        if ((dnx == dkx && dny == dky)
            || (dnx == dlx && dny == dly)) {
            where.x = other.rightend.x;
            where.y = other.rightend.y;
            return (true);
        }
        if (dkx != dlx) {
            b1 = (dly - dky) / (dlx - dkx);
            if (dmx != dnx) {
                b2 = (dny - dmy) / (dnx - dmx);
                a1 = (dky - b1 * dkx);
                a2 = (dmy - b2 * dmx);
                if (java.lang.Math.abs(b1 - b2) < tol)
                    return (false);
                else {
                    xi = -(a1 - a2) / (b1 - b2);
                    yi = a1 + b1 * xi;
                }
            }
            else {
                xi = dmx;
                a1 = (dky - b1 * dkx);
                yi = a1 + b1 * xi;
            }
        }
        else {
            xi = dkx;
            if (dmx != dnx) {
                b2 = (dny - dmy) / (dnx - dmx);
                a2 = (dmy - b2 * dmx);
                yi = (a2 + b2 * xi);
            }
            else
                return (false);
        }
        if ((dkx - xi) * (xi - dlx) >= 0 && (dmx - xi) * (xi - dnx) >= 0
            && (dky - yi) * (yi - dly) >= 0 && (dmy - yi) * (yi - dny) >= 0) {
            where.x = round(xi);
            where.y = round(yi);
            return (true);
        }
        else
            return (false);
    }
    round(double, x) {
        double;
        a, b, c;
        if (x > 0) {
            a = java.lang.Math.floor(x);
            b = java.lang.Math.floor(x + 0.5);
            if (a == b)
                return ((int));
            a;
            ;
        }
        else
            return ((int)(a + 1.0));
    }
}
{
    a = java.lang.Math.ceil(x);
    b = java.lang.Math.ceil(x - 0.5);
    if (a == b)
        return ((int)(a));
    else
        return ((int)(a - 1.0));
}
