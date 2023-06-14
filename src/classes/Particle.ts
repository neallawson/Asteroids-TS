// import { Graphics, Point } from "../../node_modules/pixi.js/dist/pixi.mjs";
import { Graphics, Point } from "pixi.js";
import { Mover } from "./Mover.js";
import { GameConstants } from "./GameConstants.js";
import { GameUtils } from "./GameUtils.js";
import { Viewport } from "./Engine2D.js";


//****************************************************************************
// ----- general information -----
//
// Explosion.java -- Ship Explosion
//
// Written by:				Neal Lawson, e-mail: nlawson@uga.icad.edu
// Initbreak
// ----- history and repairs -----
//
// ----- Description -----
// Explosion is a Mover that is an animated ship explosion.
//****************************************************************************
                
export class Particle extends Mover {
    // class variable
    static particle_container: Particle[] = [];

    // instance data
    private size: number;
    private decay: number;
    private vp: Viewport;

    constructor(vp: Viewport, x: number, y: number, xv: number, yv: number, size: number, decay: number)
    {
        super(vp.wp, Mover.TOPO_WRAP, x, y, xv, yv);

        this.vp = vp;
        this.size = size;
        this.decay = decay;
        // Particle.add_particle(this);
    }

    static add_particle(p: Particle): void
    {
        const len = Particle.particle_container.length;
        for (let i=0; i<len; i++) {
            if (!Particle.particle_container[i].isAlive()) {
                Particle.particle_container[i] = p;
                return;
            }
        }
        Particle.particle_container.push(p);
    }

    static tick_all(): void
    {
        Particle.particle_container.forEach( (p) => {
            if (p.isAlive())
                p.tick();
        });                
    }

    static paint_all(g: Graphics): void
    {
        Particle.particle_container.forEach( (p) => {
            if (p.isAlive())
                p.paint(g);
        });    
    }

    tick(): void
    {
        // Slow down - apply the decay, account for direction of velocity.
        this.xvel = this.apply_decay(this.xvel, this.decay);
        this.yvel = this.apply_decay(this.yvel, this.decay);

        // Die if particle has no velocity in both directions.
        if (this.xvel == 0 && this.yvel == 0)
            this.die();

        // Else, apply velocity.            
        else {
            this.x += this.xvel;
            this.y += this.yvel;
            super.tick();
        }
    }

    apply_decay(vel: number, decay_val: number): number
    {
        if (vel > 0) {
            vel -= decay_val;
            if (vel < 0)
                vel = 0;
        }
        else if (vel < 0) {
            vel += decay_val;
            if (vel > 0)
                vel = 0;                
        }
        return vel;
    }

    paint(g: Graphics): void
    {
        const world_point = new Point(this.x, this.y);
        const view_point = new Point(this.x, this.y);
        this.vp.Worldpoint2Viewpoint(world_point, view_point);

   		g.lineStyle(1, 0xffffff, 1);
        g.beginFill(0xffffff, 1);
		g.drawCircle(view_point.x, view_point.y, this.size);
        g.endFill();
    }
}