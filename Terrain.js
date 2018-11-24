class Terrain{
    constructor(scene,idtexture,idheightmap,parts,heightscale){
        this.scene = scene;

        this.heightmap = new CGFtexture(this.scene, "scenes/images/heightmap.jpg");
        this.colormap = new CGFtexture(this.scene, "scenes/images/terrain.jpg");
        
        this.terrainShader = new CGFshader(this.scene.gl, "scenes/shaders/heightmap.vert", "scenes/shaders/texture1.frag");
        this.terrainShader.setUniformsValues({heightmap: 1,colormap: 2});


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
        this.scene.setActiveShader(this.terrainShader);
        this.terrainShader.setUniformsValues({heightmap:1,colormap: 2});
        this.heightmap.bind(1);
        this.colormap.bind(2);
        this.plane.display();
        this.scene.setActiveShader(this.scene.defaultShader);
    }
}