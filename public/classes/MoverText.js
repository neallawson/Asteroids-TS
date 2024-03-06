// import { Graphics, Polygon, Point, Text, TextStyle } from "../../node_modules/pixi.js";
import { Text, TextStyle } from "../../node_modules/pixi.js/dist/pixi.mjs";
// import { Text, TextStyle } from "pixi.js";
import { Mover } from "./Mover.js";
/*
 * MoverText.ts - Moving text.
 */
export class MoverText extends Mover {
    // instance variables    
    display_text;
    vp;
    text_pixie;
    constructor(vp, display_text, x = 0, y = 0, xv = 0, yv = 0) {
        super(vp.wp, Mover.TOPO_WRAP, x, y, xv, yv);
        this.vp = vp;
        this.display_text = display_text;
        this.text_pixie = new Text(display_text, this.gradient_style());
        this.text_pixie.x = x;
        this.text_pixie.y = y;
    }
    gradient_style() {
        return new TextStyle({
            fontFamily: 'Arial',
            fontSize: 24,
            //  fontStyle: 'italic',
            //  fontWeight: 'bold',
            fill: ['#ffffff', '#00ff99'], // gradient
            //  stroke: '#4a1850',
            //  strokeThickness: 5,
            //  dropShadow: true,
            //  dropShadowColor: '#000000',
            //  dropShadowBlur: 4,
            //  dropShadowAngle: Math.PI / 6,
            //  dropShadowDistance: 6,
            //  wordWrap: true,
            //  wordWrapWidth: 440,
            //  lineJoin: 'round',
        });
    }
    tick() {
        this.x += this.xvel;
        this.y += this.yvel;
        this.text_pixie.x = this.x;
        this.text_pixie.y = this.y;
        super.tick();
    }
}
