class ExamplePlayer extends BasePlayer {
    static INITIALIZE = 0;
    static GO         = 1;
    static NEXT_OBJEC = 2;
    static BONK       = 3;
    static RESPAWN    = 4;

    // you can also customize its initial position and angle 
    // by giving location in pixel, and angle in degree
    // see baseplayer.js for detail
    constructor(color) {
        // call baseplayer constructor
        super(color);
        this.status = ExamplePlayer.INITIALIZE;
    }

    bonk() {
        this.status = ExamplePlayer.BONK;
    }

    respawn() {
        this.setAngle(10, 0);
        this.setSpeed(1);
    }

    initialize() {
        this.setAngle(45);
        this.setSpeed(10);
    }

    getPuzzle() {
        this.submitPuzzle();
    }

    repeat() {
        this.preparePuzzle();
        switch (this.status) {
            case ExamplePlayer.INITIALIZE:
                this.preparePuzzle();
                this.shootUDP();
                break;

            case ExamplePlayer.GO:
                this.setAngle(120, 1);
                this.setSpeed(0);
                this.shootUDP();
                break;

            case ExamplePlayer.NEXT_OBJEC:
                this.setSpeed(0);
                break;

            case ExamplePlayer.BONK:
                this.wait(20, () => {
                    this.setSpeed(-2);
                    this.wait(600, () => {
                        this.wait(100, () => {
                            this.status = ExamplePlayer.GO;
                        })
                    });
                });
                break;
        }
    }
}