/*
    segmento = 1
    distancia animada = 0
    d deltaT = d * delta T
    d animado += d * deltaT
    if(d animado > dsegmento)
        danimado -= dsegmento
        dsegmento++


    deltaT = null
    lastT = null
    update(t)


*/

class LinearAnimation extends CGFscene {
    constructor(totalTime, segments) {
        super();
        this.started = false;
        this.finished = false;
        this.totalTime = totalTime;
        this.currentObjective = 0;
        this.currentPoint;
        this.segments = segments;
        this.distance = this.totalDistance();
        this.lastTime = Date.now();
        this.startTime = Date.now();
        this.rotationAngle = 0;
    }
    update(scene) {
        if (!this.finished) {
            let now = Date.now();
            let deltaTime = now - this.lastTime;
            this.lastTime = now;
            if (!this.started) {
                this.startTime = Date.now();
                let firstPoint = this.segments[this.currentObjective];
                //scene.translate(firstPoint.x, firstPoint.y, firstPoint.z);
                scene.rotate(this.rotationAngle, 0, 1, 0)
                this.currentPoint = firstPoint;
                this.currentObjective++;
                this.started = true;
            }
            else {
                //Next control point.
                let objectivePoint = this.segments[this.currentObjective];
                //Distance from current location to the next control point
                let calculatedDistance = this.calculateDistance(this.currentPoint.x, this.currentPoint.y, this.currentPoint.z, objectivePoint.x, objectivePoint.y, objectivePoint.z);

                if (calculatedDistance <= 0.1 && calculatedDistance >= -0.1) {
                    if (this.currentObjective < this.segments.length - 1) {
                        objectivePoint = this.segments[this.currentObjective];
                        //this.rotationAngle += 0.2
                        scene.translate(this.currentPoint.x, this.currentPoint.y, this.currentPoint.z);
                        scene.rotate(this.rotationAngle, 0, 1, 0)
                        this.currentObjective++;
                    }
                    else {
                        objectivePoint = this.segments[this.currentObjective];
                        scene.translate(this.currentPoint.x, this.currentPoint.y, this.currentPoint.z);
                        scene.rotate(this.rotationAngle, 0, 1, 0)
                        this.finished = true;
                        let finishTime = Date.now() - this.startTime;
                        console.log("Animation took : " + finishTime);
                    }
                }
                else {
                    //Distance to cover in this update
                    let nextStepDistance = this.calculateNextStepDistance(deltaTime);


                    let incX = (nextStepDistance * (objectivePoint.x - this.currentPoint.x)) / calculatedDistance;
                    let incY = (nextStepDistance * (objectivePoint.y - this.currentPoint.y)) / calculatedDistance;
                    let incZ = (nextStepDistance * (objectivePoint.z - this.currentPoint.z)) / calculatedDistance;
                    this.currentPoint.x += incX;
                    this.currentPoint.y += incY;
                    this.currentPoint.z += incZ;
                    scene.translate(this.currentPoint.x, this.currentPoint.y, this.currentPoint.z);
                }
            }
        }
        else {
            scene.translate(this.currentPoint.x, this.currentPoint.y, this.currentPoint.z);
            scene.rotate(this.rotationAngle, 0, 1, 0)
        }
    }
    apply() {

    }
    calculateDistance(x1, y1, z1, x2, y2, z2) {
        let distance = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1) + (z2 - z1) * (z2 - z1));
        return (distance);
    }
    totalDistance() {
        let totalDistance = 0;
        for (let i = 0; i < this.segments.length - 1; i++) {
            let p1 = this.segments[i];
            let p2 = this.segments[i + 1];
            totalDistance += this.calculateDistance(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
        }
        return totalDistance;
    }
    calculateNextStepDistance(deltaTime) {
        return ((deltaTime * this.distance) / toMilseconds(this.totalTime));
    }
}
function toMilseconds(seconds) {
    return (seconds * 1000);
}
function toSeconds(mil) {
    return (mil / 1000);
}