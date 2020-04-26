class Scanner extends Weapon {
    static RANGE = 20;
    static SPEED = 150;
    static COST  = SCANNER_COST;
    static COLOR = "rgba(255, 169, 31,";

    shoot() {
        super.shoot(this);
    }

    hitTarget(type, target) {
        var scannerInfo = {};
        scannerInfo["tileType"] = type;
        switch (type) {
            case OPPONENT:
                scannerInfo["location"] = [...target.location];
                break;
            case HOST_TYPE:
                scannerInfo["location"] = [...target.location];
                scannerInfo["tileType"] = target.getAttitudeTo(this.owner);
                break;
            case WALL:
            case EMPTY_GROUND:
                scannerInfo["location"] = target;
                break;
        }
        this.owner.scannerInfo = scannerInfo;
    }
}