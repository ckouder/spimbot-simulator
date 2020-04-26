class Updateable {
    constructor() {
        this.update = true;
    }

    isReadyForUpdate() {
        return this.update;
    }

    updateRenderState() {
        this.update = true;
    }

    resetRenderState() {
        this.update = false;
    }

    render() {
        this.resetRenderState();
    }
}
