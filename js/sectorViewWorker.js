const frameURL = [];
import f0 from '../files/frames/vol0.bin';frameURL.push(f0);import f1 from '../files/frames/vol1.bin';frameURL.push(f1);import f2 from '../files/frames/vol2.bin';frameURL.push(f2);
import f3 from '../files/frames/vol3.bin';frameURL.push(f3);import f4 from '../files/frames/vol4.bin';frameURL.push(f4);import f5 from '../files/frames/vol5.bin';frameURL.push(f5);
import f6 from '../files/frames/vol6.bin';frameURL.push(f6);import f7 from '../files/frames/vol7.bin';frameURL.push(f7);import f8 from '../files/frames/vol8.bin';frameURL.push(f8);
import f9 from '../files/frames/vol9.bin';frameURL.push(f9);import f10 from '../files/frames/vol10.bin';frameURL.push(f10);import f11 from '../files/frames/vol11.bin';frameURL.push(f11);
import f12 from '../files/frames/vol12.bin';frameURL.push(f12);import f13 from '../files/frames/vol13.bin';frameURL.push(f13);import f14 from '../files/frames/vol14.bin';frameURL.push(f14);
import f15 from '../files/frames/vol15.bin';frameURL.push(f15);import f16 from '../files/frames/vol16.bin';frameURL.push(f16);import f17 from '../files/frames/vol17.bin';frameURL.push(f17);
import f18 from '../files/frames/vol18.bin';frameURL.push(f18);import f19 from '../files/frames/vol19.bin';frameURL.push(f19);import f20 from '../files/frames/vol20.bin';frameURL.push(f20);
import f21 from '../files/frames/vol21.bin';frameURL.push(f21);import f22 from '../files/frames/vol22.bin';frameURL.push(f22);import f23 from '../files/frames/vol23.bin';frameURL.push(f23);
import f24 from '../files/frames/vol24.bin';frameURL.push(f24);import f25 from '../files/frames/vol25.bin';frameURL.push(f25);import f26 from '../files/frames/vol26.bin';frameURL.push(f26);
import f27 from '../files/frames/vol27.bin';frameURL.push(f27);import f28 from '../files/frames/vol28.bin';frameURL.push(f28);import f29 from '../files/frames/vol29.bin';frameURL.push(f29);
import f30 from '../files/frames/vol30.bin';frameURL.push(f30);import f31 from '../files/frames/vol31.bin';frameURL.push(f31);import f32 from '../files/frames/vol32.bin'; frameURL.push(f32); import f33 from '../files/frames/vol33.bin'; frameURL.push(f33);
import f34 from '../files/frames/vol34.bin';frameURL.push(f34);import f35 from '../files/frames/vol35.bin';frameURL.push(f35);import f36 from '../files/frames/vol36.bin';frameURL.push(f36);import f37 from '../files/frames/vol37.bin';frameURL.push(f37);
import f38 from '../files/frames/vol38.bin';frameURL.push(f38);import f39 from '../files/frames/vol39.bin';frameURL.push(f39);import f40 from '../files/frames/vol40.bin';frameURL.push(f40);import f41 from '../files/frames/vol41.bin';frameURL.push(f41);
import f42 from '../files/frames/vol42.bin';frameURL.push(f42);import f43 from '../files/frames/vol43.bin';frameURL.push(f43);import f44 from '../files/frames/vol44.bin';frameURL.push(f44);import f45 from '../files/frames/vol45.bin';frameURL.push(f45);
import f46 from '../files/frames/vol46.bin';frameURL.push(f46);import f47 from '../files/frames/vol47.bin';frameURL.push(f47);

//import frames from '../files/frames';

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
  fetch(frameURL[n])
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