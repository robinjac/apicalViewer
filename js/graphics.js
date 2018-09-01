import ProgressBar from './progressbar.min.js';
import dat from './dat.gui.min.js';

// Create the loadingbar animation
export function createLoadingBar(element){ 

    document.getElementById('loadingScreen').innerHTML = 
       '<div id="heartBox" class="human-heart" style="z-index:1; position: absolute; top: -120px; left: -120px"><i class="fas fa-heart fa-8x" style="color: #f2373d; position: absolute; top: 60px; left: 60px"></i></div><div style="z-index:2" id="loading"></div>'

    const loadingBar = new ProgressBar.Circle(element, {
        color: '#aaa',
        // This has to be the same size as the maximum width to
        // Prevent clipping
        strokeWidth: 6,
        trailWidth: 1,
        easing: 'easeInOut',
        duration: 1400,
        text: {
        autoStyleContainer: false
        },
        from: { color: '#7de887', width: 1 },
        to: { color: '#7de887', width: 6 },
        // Set default step function for all animate calls
        step: function(state, circle) {
                circle.path.setAttribute('stroke', state.color);
                circle.path.setAttribute('stroke-width', state.width);
            
                var value = Math.round(circle.value() * 100);
                if (value === 0) {
                    circle.setText('');
                } else {
                    circle.setText(value);
                }
    
            }
        });

        loadingBar.text.style.fontSize = '2rem';
        loadingBar.text.style.color = 'white';
    
    return loadingBar;
};

// Draws the 2D slice display
export function drawBorder(){

    const canvas = document.getElementById('display');
    const ctx = canvas.getContext('2d');
    const dwidth = canvas.width;
    const dheight = canvas.height;

    const c = dheight * 0.879;
    const d = dwidth * 0.115 * 0.5;

    ctx.strokeStyle = '#00000';
    ctx.lineWidth = 9;

    ctx.beginPath();
    ctx.moveTo(dwidth / 2, 0);
    ctx.lineTo(dwidth - d, c);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(dwidth / 2, 0);
    ctx.lineTo(d, c);
    ctx.stroke();

    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.ellipse(dwidth / 2, c, (dwidth) / 2 - d, dheight * 0.09, 0, 0, Math.PI);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, dheight);
    ctx.lineTo(dwidth, dheight);
    ctx.stroke();
};

export function createGUI(controls){

    const gui = new dat.GUI({autoPlace:false});
    const pitchCtrl = gui.add(controls, 'Pitch', -90, 90);
    const tiltCtrl = gui.add(controls, 'Tilt', -90, 90);
    const rotateCtrl = gui.add(controls, 'Rotate',-90, 90);
    const holdCtrl =  gui.add(controls, 'Hold');
    const aquireCtrl = gui.add(controls, 'Aquire');

    return {domElement: gui.domElement, pitch: pitchCtrl, tilt: tiltCtrl, rotate: rotateCtrl, hold: holdCtrl, aquire: aquireCtrl};
}

export function createAndInitializefeedback(){

    const style = {
        strokeWidth: 4,
        easing: 'easeInOut',
        duration: 1400,
        color: '#FFEA82',
        trailColor: '#eee',
        trailWidth: 1,
        svgStyle: {width: '100%', height: '100%'},
        step: (state, bar) => {
          bar.path.setAttribute('stroke', state.color);
        }
      }

    const orientationBar = new ProgressBar.Line('#orientation', style);  
    const positionBar = new ProgressBar.Line('#position', style);

    return {orientationBar, positionBar};
}