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
        console.log(nodes)
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
                this.onXMLMinorError("tag <ambient> out of order");
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
        }

        // <TRANSFORMATIONS>
        if ((index = nodeNames.indexOf("transformations")) == -1)
        return "tag <transformations> missing";
            else {
                if (index != TRANSFORMATIONS_INDEX)
                    this.onXMLMinorError("tag <transformations> out of order");
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

            }
            else{
                this.onXMLMinorError("unknown view tag " + viewName);
            }
        }
        
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

    parsePrimitives(primitives){
        console.log(primitives);
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
        // console.log("Axis length = " + this.axis_length);
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