class Plane{
    constructor(scene,degree1,degree2,controlvertexes){
        this.surface = new CGFnurbsSurface(degree1, degree2, controlvertexes);
        this.obj = new CGFnurbsObject(scene, 20, 20, this.surface);
    }
    display(){
        this.obj.display();
    }
}