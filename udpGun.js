class UdpGun extends Weapon {
    static RANGE = 15;
    static SPEED = 150;
    static COST  = UDP_COST;
    static COLOR = "rgba(99, 57, 250, ";

    shoot() {
        super.shoot(this);
    }

    hitTarget(type, target) {
        switch (type) {
            case HOST_TYPE:
                target.hitBy(this.owner);
                this.owner.incScore(HOST_HIT_SCORE);
                break;
            case OPPONENT:
                target.prepareRespawn();
                this.owner.incScore(PLAYER_HIT_SCORE);
                break;
        }
    }
}