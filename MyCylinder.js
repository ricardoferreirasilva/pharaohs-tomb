/**
 * MyCylinder
 * @constructor
 */
 function MyCylinder(scene, slices, stacks) {
 	CGFobject.call(this,scene);
	
	this.slices = slices;
	this.stacks = stacks;

 	this.initBuffers();
 };

 MyCylinder.prototype = Object.create(CGFobject.prototype);
 MyCylinder.prototype.constructor = MyCylinder;

 MyCylinder.prototype.initBuffers = function() {
 	this.vertices = [];
 	this.indices = [];
 	this.normals = [];
	this.texCoords = [];

 	var angIncrement=(2*Math.PI) / this.slices;

 	 for (j = 0; j <= this.stacks; j++) {
         for (i = 0; i < this.slices; i++) 
         {
             this.vertices.push(Math.cos(angIncrement * i));
             this.vertices.push(Math.sin(angIncrement * i));
             this.vertices.push(j / this.stacks);
             
             this.normals.push(Math.cos(angIncrement * i));
             this.normals.push(Math.sin(angIncrement * i));
             this.normals.push(0);
             
        	 this.texCoords.push(i / this.slices, 1 - j / this.stacks);

             if (j < this.stacks) 
             {
                 if (i == this.slices - 1) 
                 {
                     this.indices.push(0 + i + this.slices * j);
                     this.indices.push(1 + i + this.slices * (j - 1));
                     this.indices.push(1 + i + this.slices * (j));
                     
                     this.indices.push(1 + i + this.slices * (j));
                     this.indices.push(0 + i + this.slices * (j + 1));
                     this.indices.push(0 + i + this.slices * j);
                 } 
                 else 
                 {
                     this.indices.push(0 + i + this.slices * j);
                     this.indices.push(1 + i + this.slices * j);
                     this.indices.push(1 + i + this.slices * (j + 1));
                     
                     this.indices.push(1 + i + this.slices * (j + 1));
                     this.indices.push(0 + i + this.slices * (j + 1));
                     this.indices.push(0 + i + this.slices * j);
                 }
             }
         }
     }
 	 
 	for (j = 0; j <= this.stacks; j++) {
        for (i = 0; i < this.slices; i++) 
        {
            this.vertices.push(Math.cos(angIncrement * i));
            this.vertices.push(j / this.stacks);
            this.vertices.push(Math.sin(angIncrement * i));
            
            
            this.normals.push(Math.cos(angIncrement * i));
            this.normals.push(0);
            this.normals.push(Math.sin(angIncrement * i));
            
       	 this.texCoords.push(i / this.slices, 1 - j / this.stacks);

            if (j < this.stacks) 
            {
                if (i == this.slices - 1) 
                {
                    this.indices.push(0 + i + this.slices * j);
                    this.indices.push(1 + i + this.slices * (j));
                    this.indices.push(1 + i + this.slices * (j - 1));
                    
                    
                    this.indices.push(1 + i + this.slices * (j));
                    this.indices.push(0 + i + this.slices * j);
                    this.indices.push(0 + i + this.slices * (j + 1));
                } 
                else 
                {
                    this.indices.push(0 + i + this.slices * j);
                    this.indices.push(1 + i + this.slices * (j + 1));
                    this.indices.push(1 + i + this.slices * j);
                    
                    this.indices.push(1 + i + this.slices * (j + 1));
                    this.indices.push(0 + i + this.slices * j);
                    this.indices.push(0 + i + this.slices * (j + 1));
                }
            }
        }
    }
 	 
     
		
	this.primitiveType = this.scene.gl.TRIANGLES;
 	this.initGLBuffers();
	
 	
 };
