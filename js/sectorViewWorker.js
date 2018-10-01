import frames from '../files/frames/*.bin';
import pako from 'pako';

// Number of frames are 48, read from dicom file
const volume = new Array(48);

// Volume dimension are read from the dicom file
const xDim = 140, yDim = 203, zDim = 140, yzDim = yDim*zDim,
      width = 100, height = 100;

let init = false;
let xScale, yScale, zScale,
    buf, buf8, data,
    shiftX,
    start, end;

// Length of one volume array 4007300

for(let n = 0; n < 48; n++){
  fetch(frames[`vol${n}`])
    .then( e => e.arrayBuffer() )
    .then( e => {
      volume[n] = pako.inflate(e);
      postMessage(0);
      if(n === 47){
        initVolume();
      }
    });
}

// Precompute sector so points laying on the sector only updates in the loop (to make slicing more efficient)
function calcSector(){
  const a = Math.round(width * 0.125); 
  const b = width - a;
  let i;

  for(i = 0; i < height; ++i){
    if (i < b) {
      start[i] = Math.floor(width / 2.0 - i / 2.0);
      end[i] = Math.floor(width / 2.0 + i / 2.0);
    } else {
      start[i] = Math.floor(a / 2.0 + 0.5 * (b / (a ** 2)) * (i - b) ** 2);
      end[i] = Math.floor((width - a / 2.0) - 0.5 * (b / (a ** 2)) * (i - b) ** 2);
    }
  }
}

function initVolume(){
    //volume = e.data.frames;

    //width = e.data.width;
    //height = e.data.height;
    shiftX = width/2;

    xScale = xDim/width; 
    yScale = yDim/height; 
    zScale = zDim/width;

    buf = new ArrayBuffer(width*height*4);
    buf8 = new Uint8ClampedArray(buf);
    data = new Uint32Array(buf);

    start = new Uint8Array(height);
    end = new Uint8Array(height);

    calcSector();

    init = true;
}

function slice(e){

  let i = 0, j = 0, // pixel coordinates
      x1 = 0, y1 = 0, // image plane coordinates
      k = 0;

  const view = e.data;

  const frame = view.frame;

  const qZ = view.quaternion._x,
        qX = view.quaternion._y,
        qY = view.quaternion._z,
        qW = view.quaternion._w;

  const x_0 = view.x, 
        y_0 = view.y,
        z_0 = view.z;

  // calculate rotation matrix from quarternion orientation (scaled and first column removed)
  const R2 = xScale*2*(qX*qY - qZ*qW), R3 = xScale*2*(qX*qZ + qY*qW),
        R5 = yScale*(1 - 2*(qX*qX + qZ*qZ)), R6 = yScale*2*(qY*qZ - qX*qW),
        R8 = zScale*2*(qY*qZ + qX*qW), R9 = zScale*(1 - 2*(qX*qX + qY*qY));

  for (i = 0; i < height; ++i) { // draws along height	
    y1 = i;

    for (j = start[i], k = end[i]; j < k; ++j) { // draws rows
      x1 = j - shiftX;

      const x = R2*y1 + R3*x1 + x_0;
      const y = R5*y1 + R6*x1 + y_0;
      const z = R8*y1 + R9*x1 + z_0;

      // trilinear interpolation
      const ix = x >> 0
      , fx = x - ix
      , s0 = 0 <= ix && ix < xDim
      , s1 = 0 <= ix + 1 && ix + 1 < xDim
      , iy = y >> 0
      , fy = y - iy
      , t0 = 0 <= iy && iy < yDim
      , t1 = 0 <= iy + 1 && iy + 1 < yDim
      , iz = z >> 0
      , fz = z - iz
      , u0 = 0 <= iz && iz < zDim
      , u1 = 0 <= iz + 1 && iz + 1 < zDim
      , w000 = s0 && t0 && u0 ? volume[frame][80 + ix + zDim*iy + yzDim*iz] : 0
      , w010 = s0 && t1 && u0 ? volume[frame][80 + ix + zDim*(iy+1) + yzDim*iz] : 0
      , w100 = s1 && t0 && u0 ? volume[frame][80 + (ix+1) + zDim*iy + yzDim*iz] : 0
      , w110 = s1 && t1 && u0 ? volume[frame][80 + (ix+1) + zDim*(iy+1) + yzDim*iz] : 0
      , w001 = s0 && t0 && u1 ? volume[frame][80 + ix + zDim*iy + yzDim*(iz+1)] : 0
      , w011 = s0 && t1 && u1 ? volume[frame][80 + ix + zDim*(iy+1) + yzDim*(iz+1)] : 0
      , w101 = s1 && t0 && u1 ? volume[frame][80 + (ix+1) + zDim*iy + yzDim*(iz+1)] : 0
      , w111 = s1 && t1 && u1 ? volume[frame][80 + (ix+1) + zDim*(iy+1) + yzDim*(iz+1)] : 0;
      
      let val = (1 - fz) * ((1 - fy) * ((1 - fx) * w000 + fx * w100) + fy * ((1 - fx) * w010 + fx * w110)) + fz * ((1 - fy) * ((1 - fx) * w001 + fx * w101) + fy * ((1 - fx) * w011 + fx * w111));

      // fill missing pixels with noise
      if (val <= 50) val = (10.0 * Math.random() >> 0) + 40;

      data[i * width + j] =
        (255   << 24) |	// alpha
          (val << 16) |	// blue
          (val <<  8) |	// green
                val;		// red
    }

  }

  postMessage(buf8);
}

//onmessage = (e) => !init ? initVolume(e) : slice(e);

onmessage = (e) => {
  if(init){
    slice(e);
  };
} 