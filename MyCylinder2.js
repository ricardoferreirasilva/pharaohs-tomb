class MyCylinder2{
    constructor(scene,base,top,height,stacks,slices){
        this.surface = new CGFnurbsSurface(5, 1, [	// U = 0
            [
                [-1, -stacks, 0.0, 1],
                [-1, stacks, 0.0, 1]

            ],
            [ 
                [-1, -stacks, 1.0, 1],
                [-1, stacks, 1.0, 1]
            ],
            [ 
                [0, -stacks, 1.5, 1],
                [0, stacks, 1.5, 1]
            ],
            [ 
                [1, -stacks, 1.0, 1],
                [1, stacks, 1.0, 1]
            ],
            [ 						 
                [1, -stacks, 0.0, 1],
                [1, stacks, 0.0, 1]
            ],
            [ 					 
                [1, -stacks, 0.0, 1],
                [1, stacks, 0.0, 1]
            ],
            
        ]);
        this.half1 = new CGFnurbsObject(scene, 20, 20, this.surface);
        this.half2 = new CGFnurbsObject(scene, 20, 20, this.surface);
        this.scene = scene;


    }
    display(){
        this.scene.pushMatrix();
        this.half1.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.rotate(Math.PI, 0, 1, 0)
        this.half2.display();
        this.scene.popMatrix();
    }
}