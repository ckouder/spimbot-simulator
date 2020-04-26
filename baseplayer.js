class BasePlayer {
    static SIZE        = PLAYER_SIZE;
    static EDGE_NUM    = 8;
    static SHOOT_COE   = 0.8;
    // interruption musk
    static TIMER_INT   = 1;
    static BONK_INT    = 2;
    static PUZZLE_INT  = 3;
    static RESPAWN_INT = 4;

    constructor(color, exactLocation = [10, 10], angleInDeg = 0) {
        this.id            = Math.random();
        this.color         = color;
        this.exactLocation = exactLocation;
        this.speed         = 0;
        this.angleInDeg    = angleInDeg || 0;
        this.bytecoin      = 0;
        this.status        = 0;
        this.score         = 0;
        this.puzzle        = []; // never use that
        this.map           = [];
        this.beams         = [];
        this.edges         = [];
        this.udpGun        = new UdpGun(this);
        this.scanner       = new Scanner(this);
        this.scannerInfo   = {};
        this.opponentHint  = {};
        this.interruptions = {
            [BasePlayer.BONK_INT]   : undefined,
            [BasePlayer.TIMER_INT]  : undefined,
            [BasePlayer.PUZZLE_INT] : undefined,
            [BasePlayer.RESPAWN_INT]: undefined,
        };
        // this.updateEdges();
        this.initialize();
        // proxy enables us to detect and handle interruptions 
        // before each player property access, in a way that 
        // realizes a fake asynchronizing interruption handler
        return this.observer();
    }

    observer() {
        return new Proxy(this, {
            get(player, property, receiver) {
                for (let interruptionMusk of Object.keys(player.interruptions)) {
                    let interruptionHandler = player.interruptions[interruptionMusk];
                    if (typeof(interruptionHandler) === "function") {
                        // make sure the function applies to the player class, not the proxy
                        interruptionHandler.apply(player);
                        player.interruptions[interruptionMusk] = {};
                    }
                }
                return Reflect.get(...arguments);
            }
        });
    }

    /**
     * set angle of the bot
     */
    set angle(angle) {
        this.angleInDeg = angle;
    }

    /**
     * get angle in radians
     */
    get angleInRad() {
        return Util.degToRad(this.angle);
    }

    /**
     * get angle in degrees
     */
    get angle() {
        return this.angleInDeg;
    }

    /**
     * get the location of the bot in playground.
     * the location is at center of the bot.
     */
    get location() {
        return Util.toGridCoord(this.exactLocation);
    }

    /**
     * update the boundary box of the bot
     * deprecated because in fact we don't need it
     */
    // updateEdges() {
    //     for (let i = 0; i < BasePlayer.EDGE_NUM; i++) {
    //         let o = [...this.exactLocation];
    //         o[0] += Math.floor(Math.sin(Math.PI*2 / (i + 1)) * BasePlayer.SIZE);
    //         o[1] += Math.floor(Math.cos(Math.PI*2 / (i + 1)) * BasePlayer.SIZE);
    //         this.edges[i] = o;
    //     }
    // }

    /** set angle of the player bot
     * angle degree must be within -360 to 360 
     * @param {int} angle 
     * @param {boolean} absolute 
     * 
     */
    setAngle(angle, absolute) {
        if (angle >= 360 || angle <= -360) {
            throw RangeError("Angle must be in [-360, 360]");
        }
        if (absolute) { 
            this.angle = angle; 
        } else {
            this.angle += angle;
        }
    }

    /** set speed of the player bot
     * speed of the spim bot
     * @param {int} speed speed of the bot
     */
    setSpeed(speed) {
        if (speed > 10 || speed < -10) {
            throw RangeError("Speed must be in [-10, 10]");
        }
        this.speed = speed;
    }

    /**
     * getX
     * get x coordinate of the player bot
     */
    getX() {
        return this.location[0];
    }

    /**
     * getY
     * get y coordinate of the player bot
     */
    getY() {
        return this.location[1];
    }

    /**
     * get score
     */
    getScore() {
        return this.score;
    }

    /**
     * increase your score
     * @param {int} val increase score by this much
     */
    incScore(val) {
        this.score += val;
    }


    /**
     * get the bot exact location after cycle number
     * @param {*} cycle step num to calculate
     */
    futureStepLocation(cycle = 1) {
        return [
            this.exactLocation[0] + Math.sin(this.angleInRad) * this.speed * cycle,
            this.exactLocation[1] + Math.cos(this.angleInRad) * this.speed * cycle,
        ]
    }

    /**
     * check if a future move is possible.
     */
    possibleToMove() {
        // calculate COE step forwards if the bot collides with walls
        if (this.speed === 0) { return true; }

        let destination = this.futureStepLocation();
        let gridDest = Util.toGridCoord(destination);
        if (Util.playground.isEmptyGround(gridDest)) {
            return true;

        } else if (Util.playground.isWall(gridDest)) {
            this.prepareBonk();
            // check if the bonk handler really solve the problem
            let dest = Util.toGridCoord(this.futureStepLocation());
            if (Util.playground.isWall(dest)) { return false; }
        }
        return true;
    }

    /**
     * move the spimbot
     */
    move() {
        this.exactLocation[0] += Math.sin(this.angleInRad) * this.speed;
        this.exactLocation[1] += Math.cos(this.angleInRad) * this.speed;
    }

    /**
     * check if the bot is at the coord, including size of the bot
     * @param {array} exactCoord 
     */
    isAt(exactCoord) {
        return exactCoord[0] > (this.exactLocation[0] - BasePlayer.SIZE) 
            && exactCoord[0] < (this.exactLocation[0] + BasePlayer.SIZE)
            && exactCoord[1] > (this.exactLocation[1] - BasePlayer.SIZE)
            && exactCoord[1] < (this.exactLocation[1] + BasePlayer.SIZE);
    }

    /**
     * fire! 
     */
    shootUDP() {
        if (this.bytecoin < UdpGun.COST) { return; }
        this.udpGun.shoot();
        this.bytecoin -= UdpGun.COST;
    }

    /**
     * knock, knock
     */
    shootScanner() {
        if (this.bytecoin < Scanner.COST) { return; }
        this.scanner.shoot();
        this.bytecoin -= Scanner.COST;
    }

    /**
     * get opponent hint from your host friends.
     * get -1 if you don't have any.
     */
    fetchOpponentHint() {
        let hosts = Util.playground.getHostsByAttitude(Host.FRIEND, this);
        if (!Object.keys(hosts).length) { return -1; }
        let opponentLocation = Util.playground.getOpponentGridLocation(this);
        this.opponentHint = Util.playground.getNearestHostTo(opponentLocation, 0, hosts);
    }

/* -------------------- Prepare for interruption handling ------------------- */

    prepare(type, handler) {
        this.interruptions[type] = handler;
    }

    /**
     * prepare to handle the bonk interruption
     */
    prepareBonk() {
        this.prepare(BasePlayer.BONK_INT, this.bonk);
    }

    /**
     * prepare to handle the respawn interruption
     */
    prepareRespawn() {
        this.prepare(BasePlayer.RESPAWN_INT, function() {
            let hosts                  = Util.playground.getHostsByAttitude(Host.FRIEND, this);
            if (!Object.keys(hosts).length) { hosts = Util.playground.getHostsByAttitude(Host.NEUTRAL, this); }
            if (!Object.keys(hosts).length) { hosts = Util.playground.getHostsByAttitude(Host.ENEMY, this); }
            let opponentLocation       = Util.playground.getOpponentGridLocation(this);
            let nearestHost            = Util.playground.getNearestHostTo(opponentLocation, UdpGun.RANGE, hosts);
            let reviveHostLocation     = Util.toExactCoord(nearestHost.location);
            nearestHost.occupy(this);
            this.exactLocation = [
                reviveHostLocation[0] + BasePlayer.SIZE,
                reviveHostLocation[1] + BasePlayer.SIZE,
            ];
            this.speed = 0;
            this.respawn();
        });
    }

    /**
     * prepare to handle the getPuzzle interruption
     * fake puzzle requesting because I don't want to
     * implement
     */
    preparePuzzle() {
        this.prepare(BasePlayer.PUZZLE_INT, function() {
            this.getPuzzle();
        });
    }

    /**
     * execute task after x ms.
     * @param {int} time 
     * @param {function} task 
     */
    prepareTimer(time, task) {
        this.prepare(BasePlayer.TIMER_INT, setTimeout.bind(
            window, 
            typeof(task) === "function" ? task : this.task, 
            time));
    }
    
    /**
     * alias of prepareTimer
     */
    wait(time, task) {
        this.prepareTimer(time, task);
    }

    /**
     * I assume you did it correctly
     */
    submitPuzzle() {
        this.bytecoin += PUZZLE_REWARD;
    }

/* ---------------------- Default Interruption Handlers --------------------- */

    /**
     * default bonk handler 
     */
    bonk() {
        this.speed = 0;
        console.log("You crash, man!");
    }

    /**
     * default timer handler
     */
    task() {
        console.log("Times up!");
    }

    /**
     * default respawn handler
     */
    respawn() {
        console.log("Make me great again!");
    }

    /**
     * default puzzle ready handler
     */
    getPuzzle() {
        console.log("Puzzle is ready!");
    }

/* ------------------- End Default Interruptions Handlers ------------------- */

    /**
     * do once when initialized, never again even respawn
     */
    initialize() {
        console.log("do something once here");
    }

    /**
     * put your smart calculations here
     */
    repeat() {
        console.log("Contemplating ...");
    }

    /**
     * draw the bot on playground
     */
    render() {
        this.repeat();
        if (this.possibleToMove()) {
            this.move();
        }
        Util.circle(
            BasePlayer.SIZE, 
            this.exactLocation, 
            this.color, 
            Util.activeLayer
            );
        this.udpGun.render();
        this.scanner.render();
        for (let i = 0; i < this.beams.length; i++) {
            if (!this.beams[i].destroy) {
                this.beams[i].render();
            } else {
                this.beams.splice(i, 1);
            }
        }
    }
}