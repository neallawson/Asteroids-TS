import { Polygon } from "../../node_modules/pixi.js";
import { Rectangle } from "../../node_modules/pixi.js";
import { Point } from "../../node_modules/pixi.js";

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

export class VectorShape {
	public static COS_OFFSET = 0;	// offset into trig_vals
	public static SIN_OFFSET = 1;	// offset into trig_vals

	// npoints not needed in the typescript implentation.
	// protected npoints: number;				// number of points in following Poly's
	public world_pts: Polygon;		// world coordinates for this shape
	protected screen_pts: Polygon;		// transformed screen coordinates
	protected rot_pts: Polygon;			// rotated, world coordinates
	protected bounds: Rectangle;		// bounding rectangle (for world_pts)
	protected aboutx: number = 0;		// geometrical center of shape, x-coord.
	protected abouty: number = 0;		// geometrical center of shape, y-coord.
	protected num_rotations: number = 0;// number of rotations per 360 deg.
	protected trig_vals: number[][];	// cosine and sine for each num_rotation.
	protected position: number;			// rotation position
	// TODO: Should this really be a member of VectorShape? Should be able to map this world shape through any number of viewports, possibly dynamically at run-time.
	vp: Viewport;


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

	constructor(pts: Polygon, vp: Viewport, nrotate: number)
	{
		this.vp = vp;
		this.world_pts = pts.clone();
		this.screen_pts = pts.clone();
		this.rot_pts = pts.clone();
		this.vp.wp.WorldpolytoViewpoly(this.vp, this.world_pts, this.screen_pts);	// setup screen_pts
		this.bounds = new Rectangle();
		this.calc_bounds();
		this.position = 0;
		this.trig_vals = [];

		// Setup rotational variables if this VectorShape will need them
		if ( nrotate > 0 ) {
			this.num_rotations = nrotate;
			for (let i=0; i<this.num_rotations; i++) {
				let radians = Worldport.toradians(360 - i*(360/this.num_rotations));
				this.trig_vals.push([Math.cos(radians), Math.sin(radians)]);
			}
		}
	}


	// /**
	//  *		VectorShape.SetupPoints()	--	Allocate and initialize the various
	//  *		point arrays, bounding rectangle, and ALL instance variables EXCEPT
	//  *		the Viewport.
	//  */

	// SetupPoints(pts: Polygon, nrotate: number)
	// {
	// 	// npoints = pts.npoints; The typescript version of this class doesn't need this.
	// 	this.world_pts = pts.clone();
	// 	this.screen_pts = pts.clone();
	// 	this.rot_pts = pts.clone();
	// 	this.vp.wp.WorldpolytoViewpoly(this.vp, this.world_pts, this.screen_pts);	// setup screen_pts
	// 	this.bounds = new Rectangle();
	// 	this.calc_bounds();
	// 	this.position = 0;

	// 	// Setup rotational variables if this VectorShape will need them
	// 	if ( nrotate > 0 ) {
	// 		this.num_rotations = nrotate;
	// 		for (let i=0; i<this.num_rotations; i++) {
	// 			let radians = this.vp.wp.toradians(360 - i*(360/this.num_rotations));
	// 			this.trig_vals.push( [Math.cos(radians), Math.sin(radians)] );
	// 		}
	// 	}
	// }


	/**
	 *		VectorShape.calc_bounds - Re-calculate the bounding rectangle for
	 *		the world polygon and its geometrical center.
	 */

	calc_bounds(): void
	{
		let maxx = 0;
		let maxy = 0;

		// pixi.js Polygon object has a 'points' member - array of points in x,y,x,y... sequence.
		// Initialize bounds on the first point...skip it in the loop.
		this.bounds.x = this.world_pts.points[0];
		this.bounds.y = this.world_pts.points[1];
		const len = this.world_pts.points.length;
		for (let i=2; i<len; i+=2) {
			const x = p.points[i];
			const y = p.points[i+1];
			if (x < this.bounds.x) {
				this.bounds.x = x;
			}
			if (y < this.bounds.y) {
				this.bounds.y = y;
			}
			if (x > maxx) {
				maxx = x;
			}
			if (y > maxy) {
				maxy = y;
			}
		}

		this.bounds.width = maxx - this.bounds.x;
		this.bounds.height = maxy - this.bounds.y;
		this.aboutx = this.bounds.x + this.bounds.width/2;
		this.abouty = this.bounds.y + this.bounds.height/2;
	}


	// /**
	//  *		move() -- Move this shape by translating and rotating (if necessary)
	//  *		it's world and rotational polygons.  The correctly moved shape will be
	//  *		represented in the rotated polygon, rot_pts.  The shape is translated
	//  *		by 'xvel,yvel' world units.  Rotation is accomplished by 1) translating
	//  *		to 0,0, rotating about the geometrical center, translated back to
	//  *		the correct location.  The shape's screen polygon is then built by
	//  *		mapping the worldpoint polygon (rot_pts) into the viewport space.
	//  */

	move(xvel: number, yvel: number): void
	{	
		// translate the polygon by 'xvel, yvel'
		Worldport.translatepoly(this.world_pts, xvel, yvel);

		// calculate new bounding rectangle AND new geom. center
		this.calc_bounds();

		// translate the polygon by 'xvel, yvel'
		Worldport.translatepoly(this.world_pts, xvel, yvel);
			

		// copy the world polygon into the rotational polygon
		// System.arraycopy(world_pts.xpoints, 0, rot_pts.xpoints, 0, world_pts.npoints);
		// System.arraycopy(world_pts.ypoints, 0, rot_pts.ypoints, 0, world_pts.npoints);

		// rotate if not in the 0 position
		if ( this.position != 0 ) {
				// translate to (0,0)
				Worldport.translatepoly(this.rot_pts, -this.aboutx, -this.abouty);
				// fast version of rotatepoly()
			Worldport.rotatepoly(this.rot_pts, this.trig_vals[this.position][VectorShape.COS_OFFSET],
				this.trig_vals[this.position][VectorShape.SIN_OFFSET]);
				// translate back to (aboutx, abouty)
				Worldport.translatepoly(this.rot_pts, this.aboutx, this.abouty);
		}

		// Map the screen_pts (viewport coords) from rot_pts (worldport coords).
		this.vp.wp.WorldpolytoViewpoly(this.vp, this.rot_pts, this.screen_pts);
	}

	xthrust(thrust: number): number
	{
		return( this.trig_vals[this.position][VectorShape.SIN_OFFSET] * thrust );
	}

	ythrust(thrust: number): number
	{
		return( this.trig_vals[this.position][VectorShape.COS_OFFSET] * thrust );
	}

	rotate_right(): void
	{
		if ( this.position == this.num_rotations-1 )
			this.position = 0;
		else
			this.position++;
	}

	rotate_left(): void
	{
		if ( this.position == 0 )
			this.position = this.num_rotations-1;
		else
			this.position--;
	}

	rotate_center(): void
	{
		this.position = 0;
	}

	// paint(Graphics g)
	// {
	// 	g.drawPolygon(this.screen_pts);
	// }

	// Given a point (x,y) in World coordinates, return true if this
	// point is in world_pts and false otherwise.
	PointInShape(x: number, y: number): boolean
	{
		// First, check the bounding box...then polygon itself
		return( this.bounds.contains(x, y) );
		//		if ( bounds.inside(x, y) )
		//			return( world_pts.inside(x, y) );
		//		return( false );
	}

	// See if this.VectorShape intersects another VectorShape, vs, by
	// testing PointInShape() for each vertex of vs.
	ShapeInShape(vs: VectorShape): boolean
	{
		let len = vs.world_pts.points.length;
		for (let i=0; i<len; i+=2) {
			const x = vs.world_pts.points[i];
			const y = vs.world_pts.points[i+1];
			if (this.PointInShape(x, x))
				return( true );
		}
		return( false );
	}
}		// end class VectorShape


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

export class Worldport {

	// constructor(xmin, xmax, ymin, ymax)
	constructor(
		public xwl: number,
		public xwr: number,
		public ywb: number,
		public ywt: number,
	){}

	// never call this directly:  only called from a Viewport object!
	resize_port(xmin: number, xmax: number, ymin: number, ymax: number): void
	{
		this.xwl = xmin;
		this.xwr = xmax;
		this.ywb = ymin;
		this.ywt = ymax;
	}

	static toradians(d: number): number
	{
		return d * Math.PI / 180.0;
	}

	static translatepoint(p: Point, tx: number, ty: number): void
	{
		p.x += tx;
		p.y += ty;
	}

	static translatepoly(poly: Polygon, tx: number, ty: number): void
	{
		const len = poly.points.length;
		for (let i=0; i<len; i+=2) {
			poly.points[i]   += tx;
			poly.points[i+1] += ty;
		}
	}

	static scalepoly(poly: Polygon, sx: number, sy: number): void
	{
		const len = poly.points.length;
		for (let i=0; i<len; i+=2) {
			poly.points[i]   *= sx;
			poly.points[i+1] *= sy;
		}
	}

	static rotatepoint_by_angle(p: Point, angle_degrees: number): void
	{
		const rad = Worldport.toradians(angle_degrees);
		const costheta = Math.cos(rad);
		const sintheta = Math.sin(rad);
		const x = p.x;
		const y = p.y;
		p.x = x * costheta - y * sintheta;
		p.y = x * sintheta + y * costheta;
	}

	static rotatepoly_by_angle(poly: Polygon, angle_degrees: number): void
	{
		const rad = Worldport.toradians(angle_degrees);
		const costheta = Math.cos(rad);
		const sintheta = Math.sin(rad);

		const len = poly.points.length;
		for (let i=0; i<len; i+=2) {
			const x = poly.points[i];
			const y = poly.points[i+1];
			poly.points[i] = x * costheta - y * sintheta;
			poly.points[i+1] = x * sintheta + y * costheta;
		}
	}

	static rotatepoint(p: Point, cost: number, sint: number): void
	{
		const x = p.x;
		const y = p.y;
		p.x = x * cost - y * sint;
		p.y = x * sint + y * cost;
	}

	static rotatepoly(poly: Polygon, cost: number, sint: number): void
	{
		const len = poly.points.length;
		for (let i=0; i<len; i+=2) {
			const x = poly.points[i];
			const y = poly.points[i+1];
			poly.points[i] = x * cost - y * sint;
			poly.points[i+1] = x * sint + y * cost;
		}
	}

	static copypoly(polyfrom: Polygon, polyto: Polygon): boolean
	{
		if (polyfrom.points.length != polyto.points.length)
			return false;

		const len = polyfrom.points.length;
		for (let i=0; i<len; i++) {
			polyto.points[i] = polyfrom.points[i];
		}
		return true;
	}

	Worldpoint2Viewpoint(vp: Viewport, worldp: Point, viewp: Point): void
	{
		viewp.x = vp.a * worldp.x + vp.b;
		viewp.y = vp.c * worldp.y + vp.d;
	}

	WorldpolytoViewpoly(vp: Viewport, wpoly: Polygon, vpoly: Polygon): boolean
	{
		if (wpoly.points.length != vpoly.points.length)
			return false;

		const len = wpoly.points.length;
		for (let i=0; i<len; i+=2) {
			vpoly.points[i]   = vp.a * wpoly.points[i] + vp.b;
			vpoly.points[i+1] = vp.c * wpoly.points[i+1] + vp.d
		}
		return true;
	}
}		// end class Worldport


// /**
//  *		class Viewport -- Implement a 2d screen coordinate system.
//  *		Notice that a Viewport is linked to a Worldport.
//  *		This system is based on integers and provides methods for
//  *		translating, scaling, rotating, and copying polygons defined
//  *		in Java.Awt.Polygon.
//  *		Method ViewtoWorld will convert Viewport coordinates to
//  *		the linked Worldport coordinates.
//  *
//  *		@author	Neal Lawson
//  *		@version	1.0
//  */


export class Viewport {
	public a: number;
	public b: number;
	public c: number;
	public d: number;
// protected aspectratio: number;

	// constructor(wp, xmin, xmax, ymin, ymax)
	constructor(
		public wp: Worldport,
		protected xvl: number,
		protected xvr: number,
		protected yvb: number,
		protected yvt: number,
	){
		this.a = (xvr - xvl) / (wp.xwr - wp.xwl);
		this.b = xvl - this.a * wp.xwl;
		this.c = (yvt - yvb) / (wp.ywt - wp.ywb);
		this.d = yvb - this.c * wp.ywb;

		// NOTE:  Tried to implement aspectratio in WorldPort.WorldpolyToViewpoly().
		// This experiment failed...try again later. -Neal
		//		xd = Math.abs(xvr-xvl);
		//		yd = Math.abs(yvt-yvb);
		//		if (xd > yd)
		//			aspectratio = yd/xd;
		//		else
		//			aspectratio = xd/yd;
	}

	calc_scalefactors(): void
	{
		this.a = (this.xvr - this.xvl) / (this.wp.xwr - this.wp.xwl);
		this.b = this.xvl - this.a * this.wp.xwl;
		this.c = (this.yvt - this.yvb) / (this.wp.ywt - this.wp.ywb);
		this.d = this.yvb - this.c * this.wp.ywb;

		// a = (double)(xvr - xvl) / (double)(wp.xwr - wp.xwl);
		// b = (double)xvl - a * wp.xwl;
		// c = (double)(yvt - yvb) / (double)(wp.ywt - wp.ywb);
		// d = (double)yvb - c * wp.ywb;

// NOTE:  Tried to implement aspectratio in WorldPort.WorldpolyToViewpoly().
// This experiment failed...try again later. -Neal
//		xd = Math.abs(xvr-xvl);
//		yd = Math.abs(yvt-yvb);
//		if (xd > yd)
//			aspectratio = yd/xd;
//		else
//			aspectratio = xd/yd;
	}

	resize_worldport(xmin: number, xmax: number, ymin: number, ymax: number): void
	{
		this.wp.resize_port(xmin, xmax, ymin, ymax);
		this.calc_scalefactors();
	}

	// set_aspect(asp: number)
	// {
	// 	this.aspectratio = asp;
	// }

	static translatepoly(poly: Polygon, tx: number, ty: number): void
	{
		Worldport.translatepoly(poly, tx, ty);
	}

	static scalepoly(poly: Polygon, sx: number, sy: number): void
	{
		Worldport.scalepoly(poly, sx, sy);
	}

	static rotatepoly_by_angle(poly: Polygon, angle: number): void
	{
		Worldport.rotatepoly_by_angle(poly, angle);
	}

	static rotatepoly(poly: Polygon, cost: number, sint: number): void
	{
		Worldport.rotatepoly(poly, cost, sint);
	}

	static copypoly(polyfrom: Polygon, polyto: Polygon): boolean
	{
		return Worldport.copypoly(polyfrom, polyto);
	}

	// TODO: Neal isn't sure this will work - if these are passed in as some (poly[i], poly[i+1]),
	// will changing wx and wy locally be references into the passed array? Or just local values?
	ViewtoWorld(vx: number, vy: number, wx: number, wy: number): void
	{
		wx = (vx - this.b) / this.a;
		wy = (vy - this.d) / this.c;
	}

	ViewpolytoWorldpoly(vpoly: Polygon, wpoly: Polygon): boolean
	{
		if (vpoly.points.length != wpoly.points.length)
			return false;
		
		const len = vpoly.points.length;
		for (let i=0; i<len; i+=2) {
			wpoly.points[i]   = (vpoly.points[i] - this.b) / this.a;
			wpoly.points[i+1] = (vpoly.points[i+1] - this.d) / this.c;
		}
		return true;
	}
}		// end class Viewport


// /**
//  *		class Line -- Define a line as two endpoints.  Provide
//  *		methods for testing line intersections geometrically.
//  *
//  *		@author	Neal Lawson
//  *		@version	1.0
//  */

// class Line {
// 	protected Point leftend;
// 	protected Point rightend;

// 	public Line(int leftx, int lefty, int rightx, int righty)
// 	{
// 		leftend  = new Point(leftx, lefty);
// 		rightend = new Point(rightx, righty);
// 	}

// 	public Line(Point leftin, Point rightin)
// 	{
// 		leftend  = new Point(leftin.x, leftin.y);
// 		rightend = new Point(rightin.x, rightin.y);
// 	}

// 	public void setleft(int x, int y)
// 	{
// 		leftend.x = x;
// 		leftend.y = y;
// 	}

// 	public void setright(int x, int y)
// 	{
// 		rightend.x = x;
// 		rightend.y = y;
// 	}

// 	public void draw(Graphics g)
// 	{
// 		g.drawLine(leftend.x, leftend.y, rightend.x, rightend.y);
// 	}

// 	public boolean intersect(Line other, Point where)
// 	{
// 		if (leftend.x>other.leftend.x && leftend.x>other.rightend.x
// 			&& rightend.x>other.leftend.x && rightend.x>other.rightend.x)
// 			return( false );
// 		if (leftend.y>other.leftend.y && leftend.y>other.rightend.y
// 			&& rightend.y>other.leftend.y && rightend.y>other.rightend.y)
// 			return( false );

// 		if (leftend.x<other.leftend.x && leftend.x<other.rightend.x
// 			&& rightend.x<other.leftend.x && rightend.x<other.rightend.x)
// 			return( false );
// 		if (leftend.y<other.leftend.y && leftend.y<other.rightend.y
// 			&& rightend.y<other.leftend.y && rightend.y<other.rightend.y)
// 			return( false );

// 		return( slow_intersect(other, where) );
// 	}

// 	public boolean slow_intersect(Line other, Point where)
// 	{
// 		double dkx, dky;
// 		double dlx, dly;
// 		double dmx, dmy;
// 		double dnx, dny;
// 		double b1, b2, a1, a2;
// 		double xi, yi;
// 		double tol = 0.0001;

// 						// doubles of endoints
// 		dkx=(double) leftend.x; dky=(double) leftend.y;
// 		dlx=(double) rightend.x; dly=(double) rightend.y;
// 		dmx=(double) other.leftend.x; dmy=(double) other.leftend.y;
// 		dnx=(double) other.rightend.x; dny=(double) other.rightend.y;

// 						// check for common endpoint
// 		if ( (dmx == dkx && dmy == dky)
// 			|| (dmx == dlx && dmy == dly) ) {
// 			where.x = other.leftend.x;
// 			where.y = other.leftend.y;
// 			return(true);
// 		}
// 		if ( (dnx == dkx && dny == dky)
// 			|| (dnx == dlx && dny == dly) ) {
// 			where.x = other.rightend.x;
// 			where.y = other.rightend.y;
// 			return(true);
// 		}

// 		if ( dkx != dlx ) {
// 			b1 = (dly - dky) / (dlx - dkx);
// 			if ( dmx != dnx ) {
// 				b2 = (dny - dmy) / (dnx - dmx);
// 				a1 = (dky - b1*dkx);
// 				a2 = (dmy - b2*dmx);
// 				if ( java.lang.Math.abs(b1-b2) < tol )
// 					return(false);
// 				else {
// 					xi = -(a1-a2)/(b1-b2);
// 					yi = a1+b1*xi;
// 				}
// 			}
// 			else {
// 				xi = dmx;
// 				a1 = (dky - b1*dkx);
// 				yi = a1+b1*xi;
// 			}
// 		}
// 		else {
// 			xi = dkx;
// 			if (dmx != dnx) {
// 				b2 = (dny - dmy) / (dnx - dmx);
// 				a2 = (dmy - b2*dmx);
// 				yi = (a2 + b2*xi);
// 			}
// 			else
// 				return(false);
// 		}

// 		if ( (dkx-xi)*(xi-dlx) >= 0 && (dmx-xi)*(xi-dnx) >= 0
//  			&& (dky-yi)*(yi-dly) >= 0 && (dmy-yi)*(yi-dny) >= 0 ) {
// 				where.x = round(xi);
// 				where.y = round(yi);
// 				return(true);
// 		}
// 		else
// 			return(false);

// 	}

// 	static int round(double x)
// 	{
// 		double a, b, c;

// 		if ( x > 0 ) {
// 			a = java.lang.Math.floor(x);
// 			b = java.lang.Math.floor(x+0.5);
// 			if (a == b)
// 				return((int) a);
// 			else
// 				return((int) (a+1.0));
// 		}
// 		else {
// 			a = java.lang.Math.ceil(x);
// 			b = java.lang.Math.ceil(x-0.5);
// 			if (a == b)
// 				return((int)(a));
// 			else
// 				return((int) (a-1.0));
// 		}
// 	}
// }		// end class Line
