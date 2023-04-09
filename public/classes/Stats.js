class Stats {
    ship_total_shots;
    ship_total_hits;
    saucers_hit;
    score;
    // constructor(xmin, xmax, ymin, ymax)
    constructor(ship_total_shots = 0, ship_total_hits = 0, saucers_hit = 0, score = 0) {
        this.ship_total_shots = ship_total_shots;
        this.ship_total_hits = ship_total_hits;
        this.saucers_hit = saucers_hit;
        this.score = score;
    }
}
export {};
