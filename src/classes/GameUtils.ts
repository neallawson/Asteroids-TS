
// ****************************************************************************
// Gameutils.ts -- Some helpful, shared functions.
// 
// Written by: Neal Lawson, captainneal@gmail.com
// Copyright (c) Neal Lawson, 2022
// 
// ----- Description -----
// ****************************************************************************

// from random import random

export class GameUtils {

    // some helpful functions using the random number generator

    static odds(percent: number): boolean
    {
        return random() * 100 < percent
    }

    static one2n(n: number): number
    {
        return 1 + random() * n;
    }
}