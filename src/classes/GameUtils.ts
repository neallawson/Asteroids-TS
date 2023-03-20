// ****************************************************************************
// Gameutils.ts -- Some helpful, shared functions.
// 
// Written by: Neal Lawson, captainneal@gmail.com
// Copyright (c) Neal Lawson, 2022
// 
// ----- Description -----
// ****************************************************************************

export class GameUtils {

    // some helpful functions using the random number generator

    static odds(percent: number): boolean
    {
        return Math.random() * 100 < percent
    }

    static one2n(n: number): number
    {
        return 1 + Math.floor(Math.random() * n);
    }
}