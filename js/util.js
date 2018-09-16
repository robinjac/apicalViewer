import { Scene, 
         HemisphereLight,
         PerspectiveCamera,
         WebGLRenderer,
         Vector3,
         Color } from 'three';

import dat from './dat.gui.min.js';
import OrbitControls from 'three-orbitcontrols';

export const DegToRad = Math.PI/180,
             xDim = 140, 
             yDim = 203, 
             zDim = 140,
             numOfFrames = 48;

export function createCamera(container){
    const camera = new PerspectiveCamera(70, container.offsetWidth / container.offsetHeight, 1, 1000);
    camera.position.z = 160;
    return camera;
}

export function createRenderer(container){
    //const renderer = new WebGLRenderer({ antialias: true });
    const renderer = new WebGLRenderer();
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setClearColor(0x353535, 1.0);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.autoClear = false;

    container.appendChild(renderer.domElement);

    return renderer;
}

export function createControls(camera, container){
    const controls = new OrbitControls(camera, container);
    controls.enablePan = false;
    //controls.enableZoom = true;
    controls.minDistance = 90;
    controls.maxDistance = 160;
    controls.target = new Vector3(-8, 0, -5);
    controls.update();
    return controls;
}

export function createScene(){
    const scene = new Scene();
    scene.background = new Color(0x353535);
    scene.add(new HemisphereLight(0x443333, 0xb2b2c1));
    return scene;
}

export function createGUI(){
    const controls = {
        Pitch: 0,
        Tilt: 0,
        Rotate: 0,
        Hold: false,
        Aquire: () => {}
    }

    const gui = new dat.GUI({autoPlace:false, width: 320}),
          pitchCtrl = gui.add(controls, 'Pitch', -90, 90),
          tiltCtrl = gui.add(controls, 'Tilt', -90, 90),
          rotateCtrl = gui.add(controls, 'Rotate',-90, 90),
          holdCtrl =  gui.add(controls, 'Hold'),
          aquireCtrl = gui.add(controls, 'Aquire');

    gui.closed = true;

    document.getElementById('gui').appendChild(gui.domElement);

    const buttons = gui.domElement.getElementsByClassName('property-name');

    buttons[0].innerHTML = '<i class="fas fa-arrows-alt-v"></i> &nbsp Pitch';
    buttons[1].innerHTML = '<i class="fas fa-arrows-alt-h"></i> &nbsp Tilt';
    buttons[2].innerHTML = '<i class="fas fa-sync-alt"></i> &nbsp Rotate';
    buttons[3].innerHTML = '<i class="fas fa-lock"></i> &nbsp Hold';
    buttons[4].innerHTML = '<i class="fas fa-check"></i> &nbsp Aquire';

    return {gui: gui, pitch: pitchCtrl, tilt: tiltCtrl, rotate: rotateCtrl, hold: holdCtrl, aquire: aquireCtrl};
}