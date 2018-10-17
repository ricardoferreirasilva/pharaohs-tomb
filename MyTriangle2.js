/**
 * MyTriangle2
 * @constructor
 */
function MyTriangle2(scene,x1,y1,z1,x2,y2,z2,x3,y3,z3) {
    CGFobject.call(this, scene);
    this.x1 = x1;
    this.x2 = x2;
    this.x3 = x3;

    this.y1 = y1;
    this.y2 = y2;
    this.y3 = y3;

    this.z1 = z1;
    this.z2 = z2;
    this.z3 = z3;
    this.initBuffers();
};

MyTriangle2.prototype = Object.create(CGFobject.prototype);
MyTriangle2.prototype.constructor = MyTriangle2;
MyTriangle2.prototype.initBuffers = function() {
    /*
    0,0,0,
    1.0,0,0,
    0,0,1.0

    */
   /*


   */
    this.vertices = [
    	this.x1,this.y1,this.z1,
    	this.x2,this.y2,this.z2,
    	this.x3,this.y3,this.z3
    ];

    this.indices = [
        2,1,0
    ];

    this.normals = [
       0, 1,0,
       0, 1,0,
       0,1 ,0
    ];
    
    this.texCoords = [
    	0,0,
    	1,0,
    	0,1
    
    	
    ];
    
    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};