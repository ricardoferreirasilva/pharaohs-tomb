var DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
let SCENE_INDEX = 0;
let VIEWS_INDEX = 1;
let AMBIENT_INDEX = 2;
let LIGHTS_INDEX = 3;
let TEXTURES_INDEX = 4;
let MATERIALS_INDEX = 5;
let TRANSFORMATIONS_INDEX = 6;
let PRIMITIVES_INDEX = 7;
let COMPONENTS_INDEX = 8;

/**
 * MySceneGraph class, representing the scene graph.
 */
class MySceneGraph {
    /**
     * @constructor
     */
    constructor(filename, scene) {
        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        scene.graph = this;

        this.nodes = [];

        this.idRoot = null;                    // The id of the root element.

        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

        // File reading 
        this.reader = new CGFXMLreader();

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */

        this.reader.open('scenes/' + filename, this);
    }


    /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        this.log("XML Loading finished.!!!123");
        var rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the various blocks
        var error = this.parseXMLFile(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        }

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded();
    }

    /**
     * Parses the XML file, processing each block. (semantic check)
     * @param {XML root element} rootElement
     */
    parseXMLFile(rootElement) {


        if (rootElement.nodeName != "yas")
            return "root tag <yas> missing";

        var nodes = rootElement.children;
        // Reads the names of the nodes to an auxiliary buffer.
        var nodeNames = [];

        for (var i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }
        
        // Processes each node, verifying errors.
        let error;

        // <Scenes>
        let index;
        if ((index = nodeNames.indexOf("scene")) == -1)
            return "tag <scene> missing";
        else {
            if (index != SCENE_INDEX)
                this.onXMLMinorError("tag <scene> out of order");
            if ((error = this.parseScene(nodes[index])) != null)
                return error;
        }

        // <VIEWS>
        if ((index = nodeNames.indexOf("views")) == -1)
            return "tag <views> missing";
        else {
            if (index != VIEWS_INDEX)
                this.onXMLMinorError("tag <views> out of order");
            if ((error = this.parseViews(nodes[index])) != null)
                return error;
        }

        // <VIEWS>
        if ((index = nodeNames.indexOf("ambient")) == -1)
            return "tag <ambient> missing";
        else {
            if (index != AMBIENT_INDEX)
                this.onXMLMinorError("tag <ambient> out of order");
            if ((error = this.parseAmbient(nodes[index])) != null)
                return error;
        }

        
        // <AMBIENT>
        if ((index = nodeNames.indexOf("ambient")) == -1)
            return "tag <ambient> missing";
        else {
            if (index != AMBIENT_INDEX)
                this.onXMLMinorError("tag <ambient> out of order");
            if ((error = this.parseAmbient(nodes[index])) != null)
                return error;
        }
        // <LIGHTS>
        if ((index = nodeNames.indexOf("lights")) == -1)
            return "tag <lights> missing";
        else {
            if (index != LIGHTS_INDEX)
                this.onXMLMinorError("tag <lights> out of order");
            if ((error = this.parseLights(nodes[index])) != null)
                return error;
        }
        
        // <TEXTURES>
        if ((index = nodeNames.indexOf("textures")) == -1)
         return "tag <textures> missing";
            else {
                if (index != TEXTURES_INDEX)
                    this.onXMLMinorError("tag <textures> out of order");
        }

        // <MATERIALS>
        if ((index = nodeNames.indexOf("materials")) == -1)
        return "tag <materials> missing";
            else {
                if (index != MATERIALS_INDEX)
                    this.onXMLMinorError("tag <materials> out of order");
                if ((error = this.parseMaterials(nodes[index])) != null)
                    return error;
        }

        // <TRANSFORMATIONS>
        if ((index = nodeNames.indexOf("transformations")) == -1)
        return "tag <transformations> missing";
            else {
                if (index != TRANSFORMATIONS_INDEX)
                    this.onXMLMinorError("tag <transformations> out of order");
                if ((error = this.parseTransformations(nodes[index])) != null)
                    return error;
        }

        // <PRIMITIVES>
        if ((index = nodeNames.indexOf("primitives")) == -1)
            return "tag <primitives> missing";
        else {
            if (index != PRIMITIVES_INDEX)
                this.onXMLMinorError("tag <primitives> out of order");
            if ((error = this.parsePrimitives(nodes[index])) != null)
                return error;
        }

         // <COMPONENTS>
         if ((index = nodeNames.indexOf("components")) == -1)
            return "tag <components> missing";
            else {
                if (index != COMPONENTS_INDEX)
                    this.onXMLMinorError("tag <components> out of order");
                if ((error = this.parseComponents(nodes[index])) != null)
                    return error;
            }


        
    }
    parseScene(scene){

        this.root = this.reader.getString(scene, 'root');
        if (this.root == null)
            return "no ID defined for the root.";
        this.axis_length = this.reader.getFloat(scene, 'axis_length');
        if (!(this.axis_length != null && !isNaN(this.axis_length))) {
            this.axis_length = 3.0;
            this.onXMLMinorError("unable to parse value for axis length; assuming 'axis_length = 3.0'");
        }
    }
    parseViews(views){
        this.views = {};
        this.views.perspectives = [];
        this.views.orthopedics = [];
        this.views.default = this.reader.getString(views, 'default');
        if (this.views.default == null)
            return "no default view defined.";
        var nodes = views.children;
        for (var i = 0; i < nodes.length; i++) {
            let viewNode = nodes[i];
            let viewName = viewNode.nodeName;
            if(viewName == "perspective"){
                let children = viewNode.children;
                let id =  this.reader.getString(viewNode, 'id');
                let near =  this.reader.getFloat(viewNode, 'near');
                this.validateField("float",near);
                let far =  this.reader.getFloat(viewNode, 'far');
                let angle =  this.reader.getFloat(viewNode, 'angle');
                
                let perspective = {id:id,near:near,far:far,angle:angle};
                if(children.length != 2){
                    this.onXMLMinorError("a perspective needs from and to tags");
                }
                else{
                    let from = children[0];
                    if(from.nodeName != "from"){
                        this.onXMLMinorError("first tag needs to be named form.");
                    }
                    let x =  this.reader.getFloat(from, 'x');
                    let y =  this.reader.getFloat(from, 'y');
                    let z =  this.reader.getFloat(from, 'z');
                    perspective.from = {x:x,y:y,z:z};

                    let to = children[1];
                    if(to.nodeName != "to"){
                        this.onXMLMinorError("first tag needs to be named to.");
                    }
                    let x1 =  this.reader.getFloat(to, 'x');
                    let y1 =  this.reader.getFloat(to, 'y');
                    let z1 =  this.reader.getFloat(to, 'z');
                    perspective.to = {x:x1,y:y1,z:z1};
                }
                this.views.perspectives.push(perspective);
            }
            else if(viewName == "ortho"){
                let children = viewNode.children;
                let id =  this.reader.getString(viewNode, 'id');
                let near =  this.reader.getFloat(viewNode, 'near');
                this.validateField("float",near);
                let far =  this.reader.getFloat(viewNode, 'far');
                let left =  this.reader.getFloat(viewNode, 'left');
                let right =  this.reader.getFloat(viewNode, 'right');
                let top =  this.reader.getFloat(viewNode, 'top');
                let bottom =  this.reader.getFloat(viewNode, 'bottom');
                
                let orthopedic = {id:id,near:near,far:far,left:left,right:right,top:top,bottom:bottom};
                if(children.length != 2){
                    this.onXMLMinorError("a perspective needs from and to tags");
                }
                else{
                    let from = children[0];
                    if(from.nodeName != "from"){
                        this.onXMLMinorError("first tag needs to be named form.");
                    }
                    let x =  this.reader.getFloat(from, 'x');
                    let y =  this.reader.getFloat(from, 'y');
                    let z =  this.reader.getFloat(from, 'z');
                    orthopedic.from = {x:x,y:y,z:z};

                    let to = children[1];
                    if(to.nodeName != "to"){
                        this.onXMLMinorError("first tag needs to be named to.");
                    }
                    let x1 =  this.reader.getFloat(to, 'x');
                    let y1 =  this.reader.getFloat(to, 'y');
                    let z1 =  this.reader.getFloat(to, 'z');
                    orthopedic.to = {x:x1,y:y1,z:z1};
                }
                this.views.orthopedics.push(orthopedic);
            }
            else{
                this.onXMLMinorError("unknown view tag " + viewName);
            }
        }
        console.log(this.views)
    }
    parseAmbient(ambient){
        let ambientChildren = ambient.children;
        this.ambient = {ambient: undefined, background: undefined};
        for (var i = 0; i < ambientChildren.length; i++) {
            let child = ambientChildren[i];
            if(child.nodeName == "ambient"){
                let r =  this.reader.getFloat(child, 'r');
                let g =  this.reader.getFloat(child, 'g');
                let b =  this.reader.getFloat(child, 'b');
                let a =  this.reader.getFloat(child, 'a');
                this.ambient.ambient = {r:r,g:g,b:b,a:a};
            }
            else if(child.nodeName == "background"){
                let r =  this.reader.getFloat(child, 'r');
                let g =  this.reader.getFloat(child, 'g');
                let b =  this.reader.getFloat(child, 'b');
                let a =  this.reader.getFloat(child, 'a');
                this.ambient.background = {r:r,g:g,b:b,a:a};
            }
            else{
                this.onXMLMinorError("Unknown ambient tag :" + child.nodeName);
            }
        }

    }
    parseLights(lights){
        this.lights = [];
        let children = lights.children;
        for (var i = 0; i < children.length; i++) {
            let light = children[i];
            if(light.nodeName == "omni")
            {
                this.parseOmniLight(light);
            }
            else if(light.nodeName == "spot"){
                this.parseSpotLight(light);
            }
            else{
                this.onXMLMinorError("Unknown light type :" + child.nodeName);
            }

        }
    }
    parseSpotLight(light){
        let id = this.reader.getString(light, 'id');
        let angle =  this.reader.getFloat(light, 'angle');
        let exponent =  this.reader.getFloat(light, 'exponent');
        let enabled = this.reader.getBoolean(light, 'enabled');
        let lightObject = {type:"spot",id:id,exponent:exponent,angle:angle,enabled:enabled,location:undefined,target:undefined,ambient:undefined,diffuse:undefined,specular:undefined};
        let children = light.children;
        for (var i = 0; i < children.length; i++) {
            let property = children[i];
            let name = property.nodeName;
            if(name == "location"){
                let x =  this.reader.getFloat(property, 'x');
                let y =  this.reader.getFloat(property, 'y');
                let z =  this.reader.getFloat(property, 'z');
                let w =  this.reader.getFloat(property, 'w');
                lightObject.location = {x:x,y:y,z:z,w:w};
            }
            else if(name == "target"){
                let x =  this.reader.getFloat(property, 'x');
                let y =  this.reader.getFloat(property, 'y');
                let z =  this.reader.getFloat(property, 'z');
                lightObject.target = {x:x,y:y,z:z};
            }
            else if(name == "ambient"){
                let r =  this.reader.getFloat(property, 'r');
                let g =  this.reader.getFloat(property, 'g');
                let b =  this.reader.getFloat(property, 'b');
                let a =  this.reader.getFloat(property, 'a');
                lightObject.ambient = {r:r,g:g,b:b,a:a};
            }
            else if(name == "diffuse"){
                let r =  this.reader.getFloat(property, 'r');
                let g =  this.reader.getFloat(property, 'g');
                let b =  this.reader.getFloat(property, 'b');
                let a =  this.reader.getFloat(property, 'a');
                lightObject.diffuse = {r:r,g:g,b:b,a:a};
            }
            else if(name == "specular"){
                let r =  this.reader.getFloat(property, 'r');
                let g =  this.reader.getFloat(property, 'g');
                let b =  this.reader.getFloat(property, 'b');
                let a =  this.reader.getFloat(property, 'a');
                lightObject.specular = {r:r,g:g,b:b,a:a};
            }
            else{
                this.onXMLMinorError("Unknown light property tag :" + name);
            }
        }
        this.lights.push(lightObject);
    }
    parseOmniLight(light){
        let id = this.reader.getString(light, 'id');
        let enabled = this.reader.getBoolean(light, 'enabled');
        let lightObject = {type:"omni",id:id,enabled:enabled,location:undefined,ambient:undefined,diffuse:undefined,specular:undefined};
        let children = light.children;
        for (var i = 0; i < children.length; i++) {
            let property = children[i];
            let name = property.nodeName;
            if(name == "location"){
                let x =  this.reader.getFloat(property, 'x');
                let y =  this.reader.getFloat(property, 'y');
                let z =  this.reader.getFloat(property, 'z');
                let w =  this.reader.getFloat(property, 'w');
                lightObject.location = {x:x,y:y,z:z,w:w};
            }
            else if(name == "ambient"){
                let r =  this.reader.getFloat(property, 'r');
                let g =  this.reader.getFloat(property, 'g');
                let b =  this.reader.getFloat(property, 'b');
                let a =  this.reader.getFloat(property, 'a');
                lightObject.ambient = {r:r,g:g,b:b,a:a};
            }
            else if(name == "diffuse"){
                let r =  this.reader.getFloat(property, 'r');
                let g =  this.reader.getFloat(property, 'g');
                let b =  this.reader.getFloat(property, 'b');
                let a =  this.reader.getFloat(property, 'a');
                lightObject.diffuse = {r:r,g:g,b:b,a:a};
            }
            else if(name == "specular"){
                let r =  this.reader.getFloat(property, 'r');
                let g =  this.reader.getFloat(property, 'g');
                let b =  this.reader.getFloat(property, 'b');
                let a =  this.reader.getFloat(property, 'a');
                lightObject.specular = {r:r,g:g,b:b,a:a};
            }
            else{
                this.onXMLMinorError("Unknown light property tag :" + name);
            }
        }
        this.lights.push(lightObject);
    }
    parseMaterials(materials){
        this.materials = [];
        let children = materials.children;
        for (var i = 0; i < children.length; i++) {
            let material = children[i];
            if(material.nodeName != "material"){
                this.onXMLMinorError("Unknown materials tag :" + material.nodeName);
            }
            else{
                let id = this.reader.getString(material, 'id');
                let shininess =  this.reader.getFloat(material, 'shininess');
                let materialObject = {id:id,shininess:shininess,emission:undefined,ambient:undefined,diffuse:undefined,specular:undefined};
                let grandchildren = material.children;
                for (var i2 = 0; i2 < grandchildren.length; i2++) {
                    let grandchild = grandchildren[i2];
                    if(grandchild.nodeName == "emission"){
                        let r =  this.reader.getFloat(grandchild, 'r');
                        let g =  this.reader.getFloat(grandchild, 'g');
                        let b =  this.reader.getFloat(grandchild, 'b');
                        let a =  this.reader.getFloat(grandchild, 'a');
                        materialObject.emission = {r:r,g:g,b:b,a:a};
                    }
                    else if(grandchild.nodeName == "ambient"){
                        let r =  this.reader.getFloat(grandchild, 'r');
                        let g =  this.reader.getFloat(grandchild, 'g');
                        let b =  this.reader.getFloat(grandchild, 'b');
                        let a =  this.reader.getFloat(grandchild, 'a');
                        materialObject.ambient = {r:r,g:g,b:b,a:a};
                    }
                    else if(grandchild.nodeName == "diffuse"){
                        let r =  this.reader.getFloat(grandchild, 'r');
                        let g =  this.reader.getFloat(grandchild, 'g');
                        let b =  this.reader.getFloat(grandchild, 'b');
                        let a =  this.reader.getFloat(grandchild, 'a');
                        materialObject.diffuse = {r:r,g:g,b:b,a:a};
                    }
                    else if(grandchild.nodeName == "specular"){
                        let r =  this.reader.getFloat(grandchild, 'r');
                        let g =  this.reader.getFloat(grandchild, 'g');
                        let b =  this.reader.getFloat(grandchild, 'b');
                        let a =  this.reader.getFloat(grandchild, 'a');
                        materialObject.specular = {r:r,g:g,b:b,a:a};
                    }
                    else{
                        this.onXMLMinorError("Unknown material tag :" + grandchild.nodeName);
                    }
                }
                this.materials.push(materialObject);
            }
        }
        console.log(this.materials)
    }
    parseTransformations(transformations){
        this.transformations = [];
        let children = transformations.children;
        for (var i = 0; i < children.length; i++) {
            let transform = children[i];
            let nodeName = transform.nodeName;
            let id = this.reader.getString(transform, 'id');
            let transformationObject = {id:id,operations:[]};
            let grandchildren = transform.children;
            for (var i2 = 0; i2 < grandchildren.length; i2++) {
                let operation = grandchildren[i2];
                if(operation.nodeName == "translate"){
                    let x =  this.reader.getFloat(operation, 'x');
                    let y =  this.reader.getFloat(operation, 'y');
                    let z =  this.reader.getFloat(operation, 'z');
                    transformationObject.operations.push({type:"translate",x:x,y:y,z:z});
                }
                else if(operation.nodeName == "rotate"){
                    let angle =  this.reader.getFloat(operation, 'angle');
                    let axis =  this.reader.getString(operation, 'axis');
                    transformationObject.operations.push({type:"rotate",axis:axis,angle:angle});
                }
                else if(operation.nodeName == "scale"){
                    let x =  this.reader.getFloat(operation, 'x');
                    let y =  this.reader.getFloat(operation, 'y');
                    let z =  this.reader.getFloat(operation, 'z');
                    transformationObject.operations.push({type:"scale",x:x,y:y,z:z});
                }

            }
            this.transformations.push(transformationObject)
        }
        console.log(this.transformations);
    }
    parsePrimitives(primitives){
        let children = primitives.children;
        this.primitives = [];
        for (var i = 0; i < children.length; i++) {
            let primitive = children[i];
            if(primitive.nodeName != "primitive"){
                this.onXMLMinorError("Unknown ambient tag :" + child.nodeName);
            }
            else{
                let id = this.reader.getString(primitive, 'id');
                let objects = primitive.children;
                let currentPrimitive = {id:id,object:undefined};
                if(objects.length != 1){
                    this.onXMLMinorError("Only one base object per primitive.");
                }
                else{
                    let object = objects[0];
                    if(object.nodeName == "rectangle"){
                        let x1 =  this.reader.getFloat(object, 'x1');
                        let y1 =  this.reader.getFloat(object, 'y1');
                        let x2 =  this.reader.getFloat(object, 'x2');
                        let y2 =  this.reader.getFloat(object, 'y2');
                        currentPrimitive.object = {type:object.nodeName,x1:x1,y1:y1,x2:x2,y2:y2};
                        this.primitives.push(currentPrimitive);
                    }
                }

            }
        }
        console.log(this.primitives);
    }
    parseComponents(components){
        this.components = [];
        let children = components.children;
        for (var i = 0; i < children.length; i++) {
            let component = children[i];
            if(component.nodeName != "component"){
                this.onXMLMinorError("Components group only accepts children of the component type.");
            }
            else{
                this.parseComponent(component);
            }
        }
        
    }
    parseComponent(component){
        let id =  this.reader.getString(component, 'id');
        let componentObject = {id:id,transformations:[],materials:[],texture:undefined,children:[]};
        let children = component.children;
        for (var i = 0; i < children.length; i++) {
            let property = children[i];
            //Children parsing
            if(property.nodeName == "children"){
                let grandchildren = property.children;
                for (var x = 0; x < grandchildren.length; x++) {
                    let grandchild = grandchildren[x];
                    //Primitiveref parsing
                    if(grandchild.nodeName == "primitiveref"){
                        let id =  this.reader.getString(grandchild, 'id');
                        componentObject.children.push({type:"primitiveref",id:id})
                    }
                    else if(grandchild.nodeName == "componentref"){
                        let id =  this.reader.getString(grandchild, 'id');
                        componentObject.children.push({type:"componentref",id:id})
                    }

                }
            }
            else if(property.nodeName == "transformation"){
                let grandchildren = property.children;
                for (var x = 0; x < grandchildren.length; x++) {
                    let grandchild = grandchildren[x];
                    //Primitiveref parsing
                    if(grandchild.nodeName == "transformationref"){
                        let id =  this.reader.getString(grandchild, 'id');
                        componentObject.transformations.push({type:"transformationref",id:id})
                    }
                    else if(grandchild.nodeName == "translate"){
                        let x =  this.reader.getFloat(grandchild, 'x');
                        let y =  this.reader.getFloat(grandchild, 'y');
                        let z =  this.reader.getFloat(grandchild, 'z');
                        componentObject.transformations.push({type:"translate",x:x,y:y,z:z});
                    }
                    else if(grandchild.nodeName == "scale"){
                        let x =  this.reader.getFloat(grandchild, 'x');
                        let y =  this.reader.getFloat(grandchild, 'y');
                        let z =  this.reader.getFloat(grandchild, 'z');
                        componentObject.transformations.push({type:"scale",x:x,y:y,z:z});
                    }
                    else if(grandchild.nodeName == "rotate"){
                        let angle =  this.reader.getFloat(grandchild, 'angle');
                        let axis =  this.reader.getString(grandchild, 'axis');
                        componentObject.transformations.push({type:"rotate",axis:axis,angle:angle});
                    }

                }
            }
            else if(property.nodeName == "materials"){
                let grandchildren = property.children;
                for (var x = 0; x < grandchildren.length; x++) {
                    let grandchild = grandchildren[x];
                    //Primitiveref parsing
                    if(grandchild.nodeName == "material"){
                        let id =  this.reader.getString(grandchild, 'id');
                        componentObject.materials.push({id:id})
                    }
                }
            }
        }
        this.components.push(componentObject);

    }





    
    /**
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn("Warning: " + message);
    }


    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log("   " + message);
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {
        // entry point for graph rendering
        //TODO: Render loop starting at root of graph
        //this.floor.display();
        
    }
    validateField(type,value){
        switch (type) {
            case "float":
                if (!(value != null && !isNaN(value))) {
                    this.onXMLMinorError(value + " is not a float.");
                }
                break;
            default:
                break;
        }
    }
}