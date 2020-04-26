class Playground {
    static GRID_COLOR = "rgba(0,0,0,0.3)";
    constructor(canvasElement, numOfGrids, numOfHosts, numOfPlayers) {
        this.canvasElement = canvasElement;
        this.ctx           = canvasElement.getContext("2d");
        this.size          = Math.min(canvasElement.height, canvasElement.width);
        this.gridSize      = this.size / numOfGrids;

        this.numOfGrids    = numOfGrids;
        this.numOfHosts    = numOfHosts;
        this.numOfPlayers  = Math.min(numOfPlayers, 4);

        this.hosts         = {};
        this.players       = [];
        this.hinders       = [];
        this.map           = [];
        this.abort         = false;

        this.initialize();
    }

    initialize() {
        for (let x = 0; x < this.numOfGrids; x++) {
            this.map[x] = [];
            for (let y = 0; y < this.numOfGrids; y++) {
                this.map[x][y] = 0;
            }
        }
        this.render();
        Util.playground = this;
    }

    renderStaticWall() {
        for (let x = 4; x < this.numOfGrids; x++) {
            Hinder.render(this.map, [x, 0], Hinder.STATIC_VARIANTS[0]);
            Hinder.render(this.map, [0, x], Hinder.STATIC_VARIANTS[0]);
            Hinder.render(this.map, [this.numOfGrids - 1, this.numOfGrids - x - 1], Hinder.STATIC_VARIANTS[0]);
            Hinder.render(this.map, [this.numOfGrids - x - 1, this.numOfGrids - 1], Hinder.STATIC_VARIANTS[0]);
        }
        Hinder.render(this.map, [23, 1],  Util.vflip(Hinder.STATIC_VARIANTS[3]));
        Hinder.render(this.map, [14, 36], Hinder.STATIC_VARIANTS[3]);
        Hinder.render(this.map, [1, 23],  Hinder.STATIC_VARIANTS[2]);
        Hinder.render(this.map, [36, 14], Util.hflip(Hinder.STATIC_VARIANTS[2]));
        Hinder.render(this.map, [12, 12], Hinder.STATIC_VARIANTS[6]);
        Hinder.render(this.map, [23, 23], Hinder.STATIC_VARIANTS[6]);
        Hinder.render(this.map, [31, 4],  Util.hflip(Hinder.STATIC_VARIANTS[6]));
        Hinder.render(this.map, [4, 31],  Util.hflip(Hinder.STATIC_VARIANTS[6]));
        Hinder.render(this.map, [36, 1],  Hinder.STATIC_VARIANTS[1]);
        Hinder.render(this.map, [1, 36],  Util.hflip(Util.vflip(Hinder.STATIC_VARIANTS[1])));
        Hinder.render(this.map, [14, 25], Hinder.STATIC_VARIANTS[0]);
        Hinder.render(this.map, [25, 14], Hinder.STATIC_VARIANTS[0]);
    }

    /**
     * render
     *  render elements in the playground
     */
    start() {
        this.renderPlayers();
        this.renderHosts();
        window.requestAnimationFrame(() => { 
            this.start(); 
        });
    }

    render() {
        this.drawGrid();
        this.renderStaticWall();
        this.renderHinders();
        this.renderHosts();
    }

    renderPlayers() {
        Util.clearActiveLayer();
        for (let player of this.players) {
            player.render(); 
        }
    }

    renderHinders() {
        for (let hinder of this.hinders) {
            hinder.render(this.map);
        }
    }

    renderHosts() {
        for (let hostid of Object.keys(this.hosts)) {
            if (this.hosts[hostid].isReadyForUpdate()) { 
                this.hosts[hostid].render(this.map);
            }
        }
    }

    /** addPlayer
     *   add a new player with given settings to the playground
     *  @param player: player to add
     *  @throws TypeError
     */
    addPlayer(player) {
        if (!player instanceof BasePlayer) { throw TypeError("Expected BasePlayer Type"); }
        this.players.push(player);
    }

    /* drawGrid
     *  draw grids on on playground
     */
    drawGrid() {
        for (let i = 0; i <= this.numOfGrids; i++) {
            Util.line([0, this.gridSize * i], [this.size, this.gridSize * i], 1, Playground.GRID_COLOR);
            Util.line([this.gridSize * i, 0], [this.gridSize * i, this.size], 1, Playground.GRID_COLOR);
        }
    }

    /* placeHosts
     * place hosts at specific locations
     * @param locations: array[n][2] location to draw the hosts
     */
    placeHosts(gridCoords) {
        for (let l of gridCoords) {
            this.placeHost(l);
        }
    }

    /* placeHinders
     * place hinders at specific locations
     * @param locations: array[n][2] location to draw the obstacle
     */
    placeHinders(gridCoords) {
        for (let l of gridCoords) {
            this.placeHinder(l);
        }
    }

    /* placeHost
     * place a host at specific location
     * @param location: int array[2] location to draw the host
     */
    placeHost(gridCoord) {
        var host = new Host(gridCoord);
        this.hosts[Util.getHostId(gridCoord)] = host;
    }

    /* placeHinder
     * place a hinder at specific location
     * @param location: int array[2] location to draw the obstacle
     */
    placeHinder(gridCoord) {
        var hinder = new Hinder(gridCoord);
        this.hinders.push(hinder);
    }

    isPlayer(exactCoord) {
        for (let player of this.players) {
            if (player.isAt(exactCoord)) {
                return player;
            }
        }
        return undefined;
    }

    isHost(gridCoord) {
        return this.hosts[Util.getHostId(gridCoord)];
    }

    isWall(gridCoord) {
        return this.map[gridCoord[0]][gridCoord[1]] === WALL;
    }

    isEmptyGround(gridCoord) {
        return this.map[gridCoord[0]][gridCoord[1]] === EMPTY_GROUND;
    }

    getHostsByAttitude(attitude, player) {
        var hostsByAttitude = {};
        for (let hostId of Object.keys(this.hosts)) {
            let a = this.hosts[hostId].getAttitudeTo(player);
            if (a === attitude) {
                hostsByAttitude[hostId] = this.hosts[hostId];
            }
        }
        return hostsByAttitude;
    }

    getNearestHostTo(location, radius = 0, hosts = this.hosts) {
        let nearestHost = {};
        let nearestDist = Infinity;
        for (let hostId of Object.keys(hosts)) {
            let distance = Util.distance(location, hosts[hostId].location) - radius;
            if (distance > 0 && distance < nearestDist) {
                nearestDist = distance;
                nearestHost = hosts[hostId];
            }
        }
        return nearestHost;
    }

    getOpponentGridLocation(forPlayer) {
        for (let player of this.players) {
            if (player.id != forPlayer.id) { return player.location; }
        }
    }

    getOpponentHint(forPlayer) {
        var hosts = this.getHostsByAttitude(forPlayer)[Host.FRIEND];
        
    }

    mightHit(exactFrom, angle, weapon) {
        var range = weapon.constructor.RANGE;
        var possibleEndExactCoord = [
            exactFrom[0] + Math.sin(angle) * range * GRID_SIZE,
            exactFrom[1] + Math.cos(angle) * range * GRID_SIZE,
        ];
        var hitEnd  = {};
        var hitType = EMPTY_GROUND;

        for (let i = 0; i < GRID_SIZE; i++) {
            let exactCoord = [
                exactFrom[0] + Math.sin(angle) * range * i,
                exactFrom[1] + Math.cos(angle) * range * i,
            ];
            let gridCoord = Util.toGridCoord(exactCoord);

            let player    = this.isPlayer(exactCoord);
            let host      = this.isHost(gridCoord);
            let wall      = this.isWall(gridCoord);
            if (!(player || host || wall)) {
                // console.log("skip: ", gridCoord, exactCoord);
                continue;
            } else {
                if (player) {
                    hitEnd          = player;
                    hitType         = OPPONENT;
                } else if (host) {
                    hitEnd          = host;
                    hitType         = HOST_TYPE;
                } else if (wall) {
                    hitEnd          = Util.toGridCoord(exactCoord);
                    hitType         = WALL;
                }
                weapon.hitTarget(hitType, hitEnd);
                return exactCoord;
            }
        }

        weapon.hitTarget(hitType, possibleEndExactCoord);
        return possibleEndExactCoord;
    }
}
