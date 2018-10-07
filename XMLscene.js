var DEGREE_TO_RAD = Math.PI / 180;

/**
 * XMLscene class, representing the scene that is to be rendered.
 */
class XMLscene extends CGFscene {
    /**
     * @constructor
     * @param {MyInterface} myinterface 
     */
    constructor(myinterface) {
        super();

        this.interface = myinterface;
        this.lightValues = {};
    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);
        this.floor = new MyQuad(this, 1 , 1, 1, 1, 0, 1.5, 0, 1.5);
        this.sceneInited = false;

        this.initCameras();

        // Materials
         this.materialDefault = new CGFappearance(this);
         this.materialDefault.setAmbient(0.3, 0.3, 0.3, 1);
        this.materialDefault.setDiffuse(0.6, 0.6, 0.6, 1);
        this.materialDefault.setSpecular(0, 0.2, 0.8, 1);





        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.axis = new CGFaxis(this);
    }

    /**
     * Initializes the scene cameras.
     */
    initCameras() {
        this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
    }
    placeCamera(){
        let chosenCamera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));;
        this.graph.views.perspectives.forEach(perspective => {
            if(perspective.id == this.graph.views.default){
                let position = vec3.fromValues(perspective.from.x, perspective.from.y, perspective.from.z);
                let direction = vec3.fromValues(perspective.to.x, perspective.to.y, perspective.to.z);
                chosenCamera= new CGFcamera(perspective.angle, perspective.near, perspective.far,position,direction); 
            }
        });
        this.camera = chosenCamera;

    }
    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {
        // Global ambient light
        this.setGlobalAmbientLight(this.graph.ambient.ambient.r, this.graph.ambient.ambient.g, this.graph.ambient.ambient.b, this.graph.ambient.ambient.a);
        // Reads the lights from the scene graph.
        for (let i = 0; i < this.graph.lights.length; i++) {
            let light = this.graph.lights[i];
            console.log(light)
            if(light.type == "omni"){
                this.lights[i].setPosition(light.location.x, light.location.y, light.location.z, light.location.w);
                this.lights[i].setAmbient(light.ambient.r, light.ambient.g, light.ambient.b, light.ambient.a);
                this.lights[i].setDiffuse(light.diffuse.r, light.diffuse.g, light.diffuse.b, light.diffuse.a);
                this.lights[i].setSpecular(light.specular.r, light.specular.g, light.specular.b, light.specular.a);
                if(light.enabled){
                    this.lights[i].setVisible(true);
                    this.lights[i].enable();
                }
                else{
                    this.lights[i].setVisible(true);
                    this.lights[i].disable();
                }
            }
            else if(light.type == "spot"){

            }
        }
        
    }


    /* Handler called when the graph is finally loaded. 
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onGraphLoaded() {
        console.log(this.graph.components);
        console.log(this.graph.transformations);
        this.placeCamera();

        // Setting axis length.
        this.axis = new CGFaxis(this, this.graph.axis_length);

        // TODO: Change ambient and background details according to parsed graph
        console.log("init lights")
        this.initLights();

        // Adds lights group.
        //this.interface.addLightsGroup(this.graph.lights);

        this.sceneInited = true;

        //  this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
    }


    /**
     * Displays the scene.
     */
    display() {
        // ---- BEGIN Background, camera and axis setup

        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        this.axis.display();
        this.materialDefault.apply();


        if (this.sceneInited) {
           
            // Displays the scene (MySceneGraph function).
            this.graph.displayScene();
            //this.floor.display();
            for (let i = 0; i < this.graph.components.length; i++) {
                this.pushMatrix();
                this.displayComponent(this.graph.components[i]);   
                this.popMatrix();
            }
        }

        // ---- END Background, camera and axis setup
    }
    displayComponent(component){
        //Apply transformations
        for (let i = 0; i < component.transformations.length; i++) {
            let transform = component.transformations[i];
            
            if(transform.type == "transformationref"){
                for (let i2 = 0; i2 < this.graph.transformations.length; i2++) {
                    let transformation = this.graph.transformations[i2]
                    if(transformation.id == transform.id)
                    {
                        for (let i3 = 0; i3 < transformation.operations.length; i3++) {
                            let operation = transformation.operations[i3];
                            this.applyTransformation(operation);
                        }
                    }
                }
            }
            else if(transform.type == "translate") this.applyTransformation(transform);
            else if(transform.type == "rotate") this.applyTransformation(transform);
            else if(transform.type == "scale") this.applyTransformation(transform);
        }
        //Apply materials
        for (let i = 0; i < component.materials.length; i++) {
            let child = component.materials[i];
            for (let i2 = 0; i2 < this.graph.materials.length; i2++) {
                let currentMaterial = this.graph.materials[i2];
                if(child.id == currentMaterial.id){
                    this.applyMaterial(currentMaterial);
                }
            }
        }

        //Process children nodes.
        for (let i = 0; i < component.children.length; i++) {
            let child = component.children[i];
            if(child.type == "primitiveref"){
                
                this.displayPrimitive(child.id);
            }
            else if(child.type == "componentref"){
                for (let i2 = 0; i2 < this.graph.components.length; i2++) {
                    let currentComponent = this.graph.components[i2];
                    if(child.id == currentComponent.id){
                        this.displayComponent(currentComponent);
                    }
                }
            }
        }
    }
    displayPrimitive(id){
        for (let i = 0; i < this.graph.primitives.length; i++) {
            let primitive = this.graph.primitives[i];
            if(primitive.id == id){
                if(primitive.object.type == "rectangle"){
                    let x1 = primitive.object.x1;
                    let x2 = primitive.object.x2;
                    let y1 = primitive.object.y1;
                    let y2 = primitive.object.y2;
                    let obj = new MyQuad(this, x1 , y1, x2, y2, 0, 1.5, 0, 1.5);
                    obj.display();
                }
            }
        }
    }
    applyTransformation(transformation){
        if(transformation.type == "translate"){
            this.translate(transformation.x,transformation.y,transformation.z);
        }
        else if(transformation.type == "scale"){
            this.scale(transformation.x,transformation.y,transformation.z);
        }
        else if(transformation.type == "rotate"){
            switch (transformation.axis) {
                case "x":
                    this.rotate(transformation.angle,1,0,0)
                    break;
                case "y":
                    this.rotate(transformation.angle,0,1,0)
                    break;
                case "z":
                    this.rotate(transformation.angle,0,0,1)
                    break;
                default:
                    break;
            }
        }
    }
    applyMaterial(material){
        let newMaterial = new CGFappearance(this);
        newMaterial.setAmbient(material.ambient.r, material.ambient.g, material.ambient.b, material.ambient.a);
        newMaterial.setDiffuse(material.diffuse.r, material.diffuse.g, material.diffuse.b, material.diffuse.a);
        newMaterial.setSpecular(material.specular.r, material.specular.g, material.specular.b, material.specular.a);
        newMaterial.apply();
    }
}