class Beam {
    static PERSIST_SECONDS = 1500;
    static WIDTH           = 3;
    constructor(origin, end, color) {
        this.t        = Date.now();
        this.origin   = origin;
        this.color    = color;
        this.end      = end;
        this.destroy = false;
    }

    render() {
        var deltaT = Date.now() - this.t;
        var a = 1 - Math.min(Beam.PERSIST_SECONDS, deltaT) / Beam.PERSIST_SECONDS;
        if (a === 0) { this.destroy = true; }
        Util.line(
            this.origin, 
            this.end, 
            Beam.WIDTH, 
            this.color + a + ")",
            Util.activeLayer
        );
    }
}