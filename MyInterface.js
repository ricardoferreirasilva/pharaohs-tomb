/**
* MyInterface class, creating a GUI interface.
*/
class MyInterface extends CGFinterface {
    /**
     * @constructor
     */
    constructor() {
        super();
        this.materialCount = 0;
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui

        this.gui = new dat.GUI();

        // add a group of controls (and open/expand by defult)

        return true;
    }
    changeCamera(camera){
        this.setActiveCamera(camera);
    }
    /**
     * Adds a folder containing the IDs of the lights passed as parameter.
     * @param {array} lights
     */
    addLightsGroup(lights) {

        var group = this.gui.addFolder("Lights");
        group.open();

        for(let i=0;i<lights.length;i++){
            let light = lights[i];
            group.add(light,"enabled");
        }
    }
    processKeyboard( event ){
        if(event.key == "m"){
            this.materialCount++;
            console.log(this.materialCount);
        }
    }
}