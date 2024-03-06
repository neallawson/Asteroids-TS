// Stats.ts - Keep up with game statistics.
// Coded by: Neal Lawson, captainneal@gmail.com
// Copyright (c) Neal Lawson, 2023
export class Stats {
    gun_shots_fired;
    gun_shots_hit;
    large_rock_hits;
    medium_rock_hits;
    small_rock_hits;
    large_saucers_hit;
    small_saucers_hit;
    score;
    // constructor(xmin, xmax, ymin, ymax)
    constructor(gun_shots_fired = 0, gun_shots_hit = 0, large_rock_hits = 0, medium_rock_hits = 0, small_rock_hits = 0, large_saucers_hit = 0, small_saucers_hit = 0, score = 0) {
        this.gun_shots_fired = gun_shots_fired;
        this.gun_shots_hit = gun_shots_hit;
        this.large_rock_hits = large_rock_hits;
        this.medium_rock_hits = medium_rock_hits;
        this.small_rock_hits = small_rock_hits;
        this.large_saucers_hit = large_saucers_hit;
        this.small_saucers_hit = small_saucers_hit;
        this.score = score;
    }
    shoot() {
        this.gun_shots_fired++;
    }
    get_shots() {
        return this.gun_shots_fired;
    }
    hit_rock(size) {
        // TODO: Based on 'size', update correct rock counter
        // Count all hits
        this.gun_shots_hit++;
    }
    get_rock_hits() {
        return this.large_rock_hits + this.medium_rock_hits + this.small_rock_hits;
    }
    hit_saucer(size) {
        // TODO: Based on 'size', update correct saucer counter
        // Count all hits
        this.gun_shots_hit++;
    }
    get_saucer_hits() {
        return this.large_saucers_hit + this.small_saucers_hit;
    }
    add_to_score(points) {
        this.score += points;
        return this.score;
    }
    get_score() {
        return this.score;
    }
}
