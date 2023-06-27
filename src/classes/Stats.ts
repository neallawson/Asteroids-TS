export class Stats {
   	// constructor(xmin, xmax, ymin, ymax)
    constructor(
        private gun_shots_fired = 0,
        private gun_shots_hit = 0,
        private large_rock_hits = 0,
        private medium_rock_hits = 0,
        private small_rock_hits = 0,
        private large_saucers_hit = 0,
        private small_saucers_hit = 0,
        private score = 0
    ){}

    shoot(): void
    {
        this.gun_shots_fired++
    }

    get_shots(): number
    {
        return this.gun_shots_fired
    }

    hit_rock(size: number)
    {
        // TODO: Based on 'size', update correct rock counter

        // Count all hits
        this.gun_shots_hit++

    }

    get_rock_hits(): number
    {
        return this.large_rock_hits + this.medium_rock_hits + this.small_rock_hits
    }

    hit_saucer(size: number)
    {
        // TODO: Based on 'size', update correct saucer counter

        // Count all hits
        this.gun_shots_hit++
    }

    get_saucer_hits()
    {
        return this.large_saucers_hit + this.small_saucers_hit
    }

    add_to_score(points: number): number
    {
        this.score += points
        return this.score
    }

    get_score(): number
    {
        return this.score
    }
}