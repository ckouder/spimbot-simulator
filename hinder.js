class Hinder {
    static FLAG         = WALL;
    static AREA_SIZE    = HINDER_AREA_SIZE;
    static AREA_LEN     = HINDER_AREA_LEN;
    static COLOR        = HINDER_COLOR;
    static SIZE         = GRID_SIZE;
    static VARIANTS     = [
        [
            [0,0,0,0],      // - - - -
            [0,1,1,0],      // - * * -
            [0,0,1,0],      // - - * -
            [0,0,0,0],      // - - - -
        ],
        [
            [0,0,0,0],      // - - - -
            [1,0,0,0],      // * - - -
            [1,1,0,0],      // * * - -
            [0,1,1,0],      // - * * -
        ],
        [
            [0,0,0,0],      // - - - -
            [1,1,1,0],      // * * * -
            [1,0,0,0],      // * - - -
            [0,0,0,0],      // - - - -
        ],
        [
            [0,0,0,0],      // - - - -
            [1,0,0,0],      // * - - -
            [1,1,1,0],      // * * * -
            [0,0,0,0],      // - - - -
        ],
        [
            [0,0,0,0],      // - - - -
            [0,1,1,0],      // - * * -
            [0,1,1,0],      // - * * -
            [0,0,0,0],      // - - - -
        ],
        [
            [0,1,1,0],      // - * * -
            [0,0,0,0],      // - - - -
            [0,0,0,0],      // - - - -
            [0,1,1,0],      // - * * -
        ]
    ];
    static STATIC_VARIANTS = [
        [
            [1],            // *
        ],
        [
            [1,1,1],        // * * *
            [0,1,1],        // - * *
            [0,0,1],        // - - *
        ],
        [
            [1,0,0],        // * - -
            [1,1,0],        // * * -
            [1,0,0],        // * - -
        ],
        [
            [0,0,0],        // - - -
            [0,1,0],        // - * -
            [1,1,1],        // * * *
        ],
        [
            [1],            // *
            [1],            // *
            [1],            // *
            [1],            // *
        ],
        [
            [1,1,1,1],      // * * * *
        ],
        [
            [1,1,0,0,0],    // * * - - -
            [1,0,0,0,0],    // * - - - -
            [0,0,0,0,0],    // - - - - -
            [0,0,0,0,1],    // - - - - *
            [0,0,0,1,1],    // - - - * *
        ],
    ]

    static render(map, location, variant) {
        var column = location[0];
        var row    = location[1];
        for (let r of variant) {
            for (let cell of r) {
                if (cell) {
                    map[column][row] = Hinder.FLAG;
                    Util.square(
                        GRID_SIZE, 
                        Util.toExactCoord([column, row]), 
                        Hinder.COLOR);
                }
                column ++;
            }
            column = location[0];
            row ++;
        }
    }
    
    constructor(location) {
        this.location = location;
        this.variant  = Hinder.VARIANTS[Math.floor(Math.random() * Hinder.VARIANTS.length)];
        switch (Math.floor(Math.random() * 4)) {
            case 1:
                this.variant = Util.hflip(this.variant);
                break;
            case 2:
                this.variant = Util.vflip(this.variant);
                break;
            case 3:
                this.variant = Util.vflip(Util.hflip(this.variant));
        }
    }

    render(map) {
        Hinder.render(map, this.location, this.variant);
    }
}