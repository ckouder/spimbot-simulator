class Player extends BasePlayer {
    static INITIALIZE = 0;
    static GO         = 1;
    static NEXT_OBJEC = 2;
    static BONK       = 3;
    static RESPAWN    = 4;

    constructor(color) {
        super(color);
        this.status = Player.INITIALIZE;
    }

    bonk() {
        this.status = Player.BONK;
    }

    respawn() {
        this.setAngle(10, 0);
        this.setSpeed(1);
    }

    suspend(ms) {
        var target = Date.now() + ms;
        while (Date.now() != target) { 
            this.render(); 
        }
    }

    initialize() {
        this.setAngle(45);
        this.setSpeed(10);
    }

    getPuzzle() {
        // console.log("Earning bytecoins!", this.bytecoin);
        this.submitPuzzle();
    }

    repeat() {
        // this.setSpeed(1);
        this.requestPuzzle();
        switch (this.status) {
            case Player.INITIALIZE:
                // console.log("At initialization");
                this.requestPuzzle();
                this.shootUDP();
                break;
            case Player.GO:
                // console.log("At stage go");
                this.setAngle(120, 1);
                this.setSpeed(0);
                this.shootUDP();
                // this.setSpeed(1);
                break;
            case Player.NEXT_OBJEC:
                // console.log("At stage find next object");
                this.setSpeed(0);
                break;
            case Player.BONK:
                // console.log("At stage bonk");
                this.wait(20, () => {
                    this.setSpeed(-2);
                    this.wait(600, () => {
                        this.wait(100, () => {
                            this.status = Player.GO;
                        })
                    });
                });
                break;
        }
    }
}