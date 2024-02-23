// import { Graphics, Polygon, Point, Text, TextStyle } from "../../node_modules/pixi.js";

// import { Polygon, Point } from "../../node_modules/pixi.js/dist/pixi.mjs";
import { Graphics, Polygon, Point, Text, TextStyle } from "pixi.js";
import { Mover, VectorMover } from "./Mover.js";
import { VectorShape, Worldport, Viewport } from "./Engine2D.js";
import { GameUtils } from "./GameUtils.js";
import { GameVars } from "./GameVars.js";

/*
 * MoverText.ts - Moving text.
 */

export class MoverText extends Mover {

   // instance variables    
   private display_text: string;
   private vp: Viewport;
   private text_pixie: Text;

   constructor(vp: Viewport, display_text: string, x=0, y=0, xv=0, yv=0)
   {
      super(vp.wp, Mover.TOPO_WRAP, x, y, xv, yv);
 
      this.vp = vp;
      this.display_text = display_text;
      this.text_pixie =  new Text(display_text, this.gradient_style());
   }

   gradient_style(): TextStyle
   {
      return new PIXI.TextStyle({
         fontFamily: 'Arial',
         fontSize: 36,
         fontStyle: 'italic',
         fontWeight: 'bold',
         fill: ['#ffffff', '#00ff99'], // gradient
         stroke: '#4a1850',
         strokeThickness: 5,
         dropShadow: true,
         dropShadowColor: '#000000',
         dropShadowBlur: 4,
         dropShadowAngle: Math.PI / 6,
         dropShadowDistance: 6,
         wordWrap: true,
         wordWrapWidth: 440,
         lineJoin: 'round',
     });
   }
 
   tick(): void
   {
      this.x += this.xvel;
      this.y += this.yvel;
      super.tick();
   }
 
   paint(g: Graphics): void
   {
      const world_point = new Point(this.x, this.y);
      const view_point = new Point(this.x, this.y);
      this.vp.Worldpoint2Viewpoint(world_point, view_point);
      this.text_pixie.x = view_point.x;
      this.text_pixie.y = view_point.y;
      g.
   }
}