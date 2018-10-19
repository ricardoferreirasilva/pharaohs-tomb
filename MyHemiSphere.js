/**
 * Hemisphere
 * @constructor
 */
 function MyHemiSphere(scene, slices, stacks) {
 	CGFobject.call(this,scene);
	
	this.slices = slices;
	this.stacks = stacks;

 	this.initBuffers();
 };

 MyHemiSphere.prototype = Object.create(CGFobject.prototype);
 MyHemiSphere.prototype.constructor = MyHemiSphere;

 MyHemiSphere.prototype.initBuffers = function() {

 	this.vertices = [];
 	this.normals = [];
 	this.indices = [];
 	this.texCoords = [];

 	var angIncrement=(2*Math.PI) / this.slices;

 	for(j = 0; j <= this.stacks; j++)
	{
 		if(j < this.stacks)
 		{
 			for(i = 0; i < this.slices; i++)
 			{
 				var x = Math.cos(angIncrement*i)*Math.cos(Math.asin(j/this.stacks));
 				var y = Math.sin(angIncrement*i)*Math.cos(Math.asin(j/this.stacks));
 				
 				this.vertices.push(x);
	 			this.vertices.push(y);
	 			this.vertices.push(j/this.stacks);

	 			this.normals.push(x);
	 			this.normals.push(y);
				this.normals.push(j/this.stacks);

				this.texCoords.push(0.5*x + 0.5, 0.5 - 0.5*y);

				if(j < this.stacks-1)
				{
					if (i == this.slices - 1)
					{
						this.indices.push(0 + i + this.slices*j);
						this.indices.push(1 + i + this.slices*(j-1));
						this.indices.push(1 + i + this.slices*(j));

						this.indices.push(1 + i + this.slices*(j));
						this.indices.push(0 + i + this.slices*(j+1));
						this.indices.push(0 + i + this.slices*j);
					}
					else
					{
						this.indices.push(0 + i + this.slices*j);
						this.indices.push(1 + i + this.slices*j);
						this.indices.push(1 + i + this.slices*(j+1));

						this.indices.push(1 + i + this.slices*(j+1));
						this.indices.push(0 + i + this.slices*(j+1));
						this.indices.push(0 + i + this.slices*j);
					}
				}
 			} 			
 		}
 		else
 		{
 			this.vertices.push(0);
	 		this.vertices.push(0);
	 		this.vertices.push(1);

	 		this.normals.push(0);
	 		this.normals.push(0);
			this.normals.push(1);

			this.texCoords.push(.5, .5);

	 		for(i = 0; i < this.slices-1; i++)
 			{
 				this.indices.push(0 + i + this.slices*(j-1));
				this.indices.push(1 + i + this.slices*(j-1));
				this.indices.push(this.slices*this.stacks);
 			}
 			this.indices.push(this.slices*j-1);
			this.indices.push(this.slices*(j-1));
			this.indices.push(this.slices*this.stacks);
 		}
 	}

 	this.primitiveType = this.scene.gl.TRIANGLES;
 	this.initGLBuffers();
 };