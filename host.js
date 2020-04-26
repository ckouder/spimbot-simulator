class Host extends Updateable {
    /* Host
     *  host in the playground
     * @property occupant: Player
     *   occupant of the host, undefined if the host is neutral
     * @property location:
     *   the location of the host on map
     */
    static COLOR_NEUTRAL = "green";
    static NEUTRAL       = NEUTRAL_MUSK;
    static FRIEND        = FRIENDLY_MUSK;
    static ENEMY         = ENEMY_MUSK;

    constructor(location) {
        super();
        this.occupant = undefined;
        this.location = location;
        this.color = Host.COLOR_NEUTRAL;
        this.status = Host.NEUTRAL;
    }

    neutralize() {
        this.occupant = undefined;
        this.color    = Host.COLOR_NEUTRAL;
        this.updateRenderState();
    }

    occupy(player) {
        console.log("Occupy: ", player);
        this.occupant = player;
        this.color    = player.color;
        this.updateRenderState();
    }

    hitBy(player) {
        if (this.occupant === undefined) {
            this.occupy(player);
        } else if (this.occupant !== player) {
            this.neutralize();
        }
    }

    getStatus() {
        return this.status;
    }

    getAttitudeTo(player) {
        if (this.occupant === undefined) {
            return Host.NEUTRAL;
        } else if (this.occupant === player) {
            return Host.FRIEND;
        } else {
            return Host.ENEMY;
        }
    }

    render(map) {
        map[this.location[0]][this.location[1]] = this.status;
        Util.square(GRID_SIZE, Util.toExactCoord(this.location), this.color);
        super.render();
    }
}
