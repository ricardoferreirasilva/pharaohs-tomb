class Water{
    constructor(scene,idtexture,idwavemap,parts,heightscale,texscale){
        this.scene = scene;
        this.ocean = new CGFtexture(this.scene, "scenes/images/ocean.jpg");
        this.WaterShader = new CGFshader(this.scene.gl, "scenes/shaders/ocean.vert", "scenes/shaders/texture1.frag");
        this.WaterShader.setUniformsValues({date:Date.now(),colormap: 2});
        this.plane = new Plane(this.scene,1,1,[	// U = 0
            [ // V = 0..1;
                [-1.0, -1.0, 0.0, 1],
                [-1.0, 1.0, 0.0, 1]
            ],
            // U = 1
            [ // V = 0..1
                [1.0, -1.0, 0.0, 1],
                [1.0, 1.0, 0.0, 1]
            ]
        ]);
    }
    display(){
        this.scene.setActiveShader(this.WaterShader);
        let factor = Math.sin(Date.now() * 0.00001) * 20;
        this.WaterShader.setUniformsValues({factor:factor,colormap: 2});
        this.ocean.bind(2);
        this.plane.display();
        this.scene.setActiveShader(this.scene.defaultShader);
    }
}