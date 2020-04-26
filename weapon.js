class Weapon {
    static LENGTH = 24;
    static WIDTH  = 2;
    constructor(owner) {
        this.owner  = owner;
    }

    get startPoint() {
        var startPoint = [
            this.owner.exactLocation[0] + Math.sin(this.owner.angleInRad) * Weapon.LENGTH,
            this.owner.exactLocation[1] + Math.cos(this.owner.angleInRad) * Weapon.LENGTH,
        ];
        return startPoint;
    }

    get endPoint() {
        var endPoint = Util.playground.mightHit(this.startPoint, this.owner.angleInRad, this);
        return endPoint;
    }

    shoot(weapon) {
        this.owner.beams.push(new Beam(
            this.startPoint, 
            this.endPoint, 
            weapon.constructor.COLOR));
    }

    render() {
        Util.line(
            this.owner.exactLocation, 
            this.startPoint, 
            Weapon.WIDTH, 
            this.owner.color, 
            Util.activeLayer);
    }
}