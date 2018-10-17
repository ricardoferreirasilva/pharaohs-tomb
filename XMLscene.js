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
        this.defaultTexture = new CGFtexture(this,"./scenes/images/default.jpg")



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
        this.graph.views.orthopedics.forEach(orthopedic => {
            console.log(orthopedic);
            if(orthopedic.id == this.graph.views.default){
                let position = vec3.fromValues(orthopedic.from.x, orthopedic.from.y, orthopedic.from.z);
                let direction = vec3.fromValues(orthopedic.to.x, orthopedic.to.y, orthopedic.to.z);
                let camera = new CGFcameraOrtho( orthopedic.left, orthopedic.right, orthopedic.bottom, orthopedic.top, orthopedic.near, orthopedic.far, position, direction);
            }
        });
        this.camera = chosenCamera;
        this.interface.changeCamera(this.camera);
    }
    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {
        // Global ambient light
        this.setGlobalAmbientLight(this.graph.ambient.ambient.r, this.graph.ambient.ambient.g, this.graph.ambient.ambient.b, this.graph.ambient.ambient.a);
        this.gl.clearColor(this.graph.ambient.background.r,this.graph.ambient.background.g,this.graph.ambient.background.b,this.graph.ambient.background.a);
        // Reads the lights from the scene graph.
        for (let i = 0; i < this.graph.lights.length; i++) {
            let light = this.graph.lights[i];
            if(light.type == "omni"){
                
                this.lights[i].setPosition(light.location.x, light.location.y, light.location.z, light.location.w);
                this.lights[i].setAmbient(light.ambient.r, light.ambient.g, light.ambient.b, light.ambient.a);
                this.lights[i].setDiffuse(light.diffuse.r, light.diffuse.g, light.diffuse.b, light.diffuse.a);
                this.lights[i].setSpecular(light.specular.r, light.specular.g, light.specular.b, light.specular.a);
                if(light.enabled == true){
                    this.lights[i].setVisible(true);
                    this.lights[i].enable();
                    this.lights[i].update();
                }
                else{
                    this.lights[i].setVisible(false);
                    this.lights[i].disable();
                }
            }
            else if(light.type == "spot"){
                this.lights[i].setSpotCutOff(light.angle);
                this.lights[i].setSpotExponent(light.exponent);
                this.lights[i].setPosition(light.location.x, light.location.y, light.location.z, light.location.w);
                this.lights[i].setSpotDirection(light.location.x, light.location.y, light.location.z, light.location.w);
                this.lights[i].setAmbient(light.ambient.r, light.ambient.g, light.ambient.b, light.ambient.a);
                this.lights[i].setDiffuse(light.diffuse.r, light.diffuse.g, light.diffuse.b, light.diffuse.a);
                this.lights[i].setSpecular(light.specular.r, light.specular.g, light.specular.b, light.specular.a);
                if(light.enabled == true){
                    this.lights[i].setVisible(true);
                    this.lights[i].enable();
                    this.lights[i].update();
                }
                else{
                    this.lights[i].setVisible(false);
                    this.lights[i].disable();
                }
            }
        }
        
    }


    /* Handler called when the graph is finally loaded. 
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onGraphLoaded() {
        this.placeCamera();

        // Setting axis length.
        this.axis = new CGFaxis(this, this.graph.axis_length);
        this.axis.display();

        // TODO: Change ambient and background details according to parsed graph
        this.initLights();

        //load textures
        for (let i = 0; i < this.graph.textures.length; i++) {
            let texture = this.graph.textures[i];
            let path = "./scenes/images/" + this.graph.textures[i].file;
            this.graph.textures[i].object = new CGFtexture(this,path);

            
        }

        this.sceneInited = true;
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
                if(this.graph.components[i].id == this.graph.root){
                    this.pushMatrix();
                    this.displayComponent(this.graph.components[i],this.materialDefault,this.defaultTexture);   
                    this.popMatrix();
                }
            }
        }

        // ---- END Background, camera and axis setup
    }
    // visit (matriz,material,textura)
    // este componente tem um material? se sim display it, caso contrario mostrar o que vem como arg
    // same para a textura.
    displayComponent(component,material,texture){
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
        //Things to pass to children;
        let foundMaterial = this.materialDefault;
        let foundTexture = this.defaultTexture;
        let maxS = 1;
        let maxT = 1;
        for (let i = 0; i < component.materials.length; i++) {
            let child = component.materials[i];

            //The material to display
            let materialIndex = 0;
            if(this.interface.materialCount >= 0 && this.interface.materialCount < component.materials.length){
                materialIndex = this.interface.materialCount;
            }
            else{
                let aid1 = this.interface.materialCount / component.materials.length;
                aid1 = Math.floor(aid1);
                materialIndex = this.interface.materialCount - (aid1 * component.materials.length)
            }
            if(i == materialIndex){

                let childMaterial = this.materialDefault;
                let childTexture = this.defaultTexture;
                if(child.id == "inherit"){
                    childMaterial = material;
                }
                else{
                    for (let i2 = 0; i2 < this.graph.materials.length; i2++) {
                        let currentMaterial = this.graph.materials[i2];
                        foundMaterial = currentMaterial;
                        if(child.id == currentMaterial.id){
                            childMaterial = currentMaterial;
                            break;
                        }
                    }
                }
                // Calculate the proper texture for this child
                if(component.texture != undefined){
                    if(component.texture.id == "inherit"){
                        //Apply parent texture.
                        this.applyMaterial(childMaterial,texture);
                    }
                    else if(component.texture.id == "none"){
                        //Apply default texture.
                        this.applyMaterial(childMaterial,this.defaultTexture);
                    }
                    for (let i = 0; i < this.graph.textures.length; i++) {
                        //Find chosen texture by ID.
                        let texture = this.graph.textures[i];               
                        if(component.texture.id == texture.id){
                            foundTexture = texture.object;
                            maxS = component.texture.length_s;
                            maxT = component.texture.length_t;
                            this.applyMaterial(childMaterial,texture.object);
                        }
                    }
                }
                else{
                    this.applyMaterial(currentMaterial,this.defaultTexture);
                }
            }
        }

        //Process children nodes.
        for (let i = 0; i < component.children.length; i++) {
            let child = component.children[i];
            if(child.type == "primitiveref"){
                
                this.displayPrimitive(child.id,maxT,maxS);
            }
            else if(child.type == "componentref"){
                for (let i2 = 0; i2 < this.graph.components.length; i2++) {
                    let currentComponent = this.graph.components[i2];
                    if(child.id == currentComponent.id){
                        this.pushMatrix();
                        this.displayComponent(currentComponent,foundMaterial,foundTexture);
                        this.popMatrix();
                    }
                }
            }
        }
    }
    displayPrimitive(id,maxT,maxS){
        for (let i = 0; i < this.graph.primitives.length; i++) {
            let primitive = this.graph.primitives[i];
            if(primitive.id == id){
                if(primitive.object.type == "rectangle"){
                    let x1 = primitive.object.x1;
                    let x2 = primitive.object.x2;
                    let y1 = primitive.object.y1;
                    let y2 = primitive.object.y2;
                    let obj = new MyQuad(this, x1 , y1, x2, y2, 0, maxS, 0, maxT);
                    obj.display();
                }
                else if(primitive.object.type == "triangle"){
                    let x1 = primitive.object.x1;
                    let y1 = primitive.object.y1;
                    let z1 = primitive.object.z1;

                    let x2 = primitive.object.x2;
                    let y2 = primitive.object.y2;
                    let z2 = primitive.object.z2;

                    let x3 = primitive.object.x3;
                    let y3 = primitive.object.y3;
                    let z3 = primitive.object.z3;

                    let obj = new MyTriangle2(this,x1,y1,z1,x2,y2,z2,x3,y3,z3);
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
    applyMaterial(material,texture){
        let newMaterial = new CGFappearance(this);
        newMaterial.setAmbient(material.ambient.r, material.ambient.g, material.ambient.b, material.ambient.a);
        newMaterial.setDiffuse(material.diffuse.r, material.diffuse.g, material.diffuse.b, material.diffuse.a);
        newMaterial.setSpecular(material.specular.r, material.specular.g, material.specular.b, material.specular.a);
        if(texture != undefined){
            newMaterial.setTexture(texture);
        }
        newMaterial.apply();
    }
}