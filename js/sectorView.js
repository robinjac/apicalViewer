import {drawBorder} from './graphics.js';

export default class SectorView {

    constructor(volume, volDim){

        const canvas = document.getElementById('slice');

        this.ctx = canvas.getContext('2d', {alpha: false});
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
        this.imageData = this.ctx.getImageData(0, 0, canvas.width,canvas.height);
        this.data = this.imageData.data;

        drawBorder();

        this.volume = volume;
        this.width = canvas.width;
        this.height = canvas.height;
        this.shiftX = this.width/2;

        this.xDim = volDim.x;
        this.yDim = volDim.y;
        this.zDim = volDim.z;
        this.yzDim = this.yDim*this.zDim;

        this.xScale = volDim.x/canvas.width;
        this.yScale = volDim.y/canvas.height;
        this.zScale = volDim.z/canvas.width; // Usually has the same dimension as x
        
        this.a = Math.round(canvas.width * 0.125);
        this.b = canvas.width - this.a;
      
        this.start = new Uint8Array(this.height);
        this.end = new Uint8Array(this.height);

        // Precompute sector so points laying on the sector only updates in the loop
        for(let i = 0; i < this.height; ++i){
          if (i < this.b) {
            this.start[i] = Math.floor(this.width / 2 - i / 2);
            this.end[i] = Math.floor(this.width / 2 + i / 2);
          } else {
            this.start[i] = Math.floor(this.a / 2 + 0.5 * (this.b / (this.a * this.a)) * (i - this.b) * (i - this.b));
            this.end[i] = Math.floor((this.width - this.a / 2) - 0.5 * (this.b / (this.a * this.a)) * (i - this.b) * (i - this.b));
          }
        }
    }

    slice(quaternion, x_0, y_0, z_0, frame){

        let i = 0, j = 0; // pixel coordinates
        let x1 = 0, y1 = 0; // image plane coordinates
        let k = 0;
        
        const qZ = quaternion.x;
        const qX = quaternion.y;
        const qY = quaternion.z;
        const qW = quaternion.w;
  
        // calculate rotation matrix from quarternion orientation (scaled and first column removed)
        const R2 = this.xScale*2*(qX*qY - qZ*qW), R3 = this.xScale*2*(qX*qZ + qY*qW);
        const R5 = this.yScale*(1 - 2*(qX*qX + qZ*qZ)), R6 = this.yScale*2*(qY*qZ - qX*qW);
        const R8 = this.zScale*2*(qY*qZ + qX*qW), R9 = this.zScale*(1 - 2*(qX*qX + qY*qY));
  
        for (i = 0; i < this.height; ++i) { // draws along height	
          y1 = i;
      
          for (j = this.start[i], k = this.end[i]; j < k; ++j) { // draws rows
            x1 = j - this.shiftX;
      
            const x = R2*y1 + R3*x1 + x_0;
            const y = R5*y1 + R6*x1 + y_0;
            const z = R8*y1 + R9*x1 + z_0;

            // trilinear interpolation
            const ix = Math.floor(x)
            , fx = x - ix
            , s0 = 0 <= ix && ix < this.xDim
            , s1 = 0 <= ix + 1 && ix + 1 < this.xDim
            , iy = Math.floor(y)
            , fy = y - iy
            , t0 = 0 <= iy && iy < this.yDim
            , t1 = 0 <= iy + 1 && iy + 1 < this.yDim
            , iz = Math.floor(z)
            , fz = z - iz
            , u0 = 0 <= iz && iz < this.zDim
            , u1 = 0 <= iz + 1 && iz + 1 < this.zDim
            , w000 = s0 && t0 && u0 ? this.volume[frame][80 + ix + this.zDim*iy + this.yzDim*iz] : 0
            , w010 = s0 && t1 && u0 ? this.volume[frame][80 + ix + this.zDim*(iy+1) + this.yzDim*iz] : 0
            , w100 = s1 && t0 && u0 ? this.volume[frame][80 + (ix+1) + this.zDim*iy + this.yzDim*iz] : 0
            , w110 = s1 && t1 && u0 ? this.volume[frame][80 + (ix+1) + this.zDim*(iy+1) + this.yzDim*iz] : 0
            , w001 = s0 && t0 && u1 ? this.volume[frame][80 + ix + this.zDim*iy + this.yzDim*(iz+1)] : 0
            , w011 = s0 && t1 && u1 ? this.volume[frame][80 + ix + this.zDim*(iy+1) + this.yzDim*(iz+1)] : 0
            , w101 = s1 && t0 && u1 ? this.volume[frame][80 + (ix+1) + this.zDim*iy + this.yzDim*(iz+1)] : 0
            , w111 = s1 && t1 && u1 ? this.volume[frame][80 + (ix+1) + this.zDim*(iy+1) + this.yzDim*(iz+1)] : 0;
    
            let val = (1 - fz) * ((1 - fy) * ((1 - fx) * w000 + fx * w100) + fy * ((1 - fx) * w010 + fx * w110)) + fz * ((1 - fy) * ((1 - fx) * w001 + fx * w101) + fy * ((1 - fx) * w011 + fx * w111));
            let index = (i * this.width + j)*4;
      
            // fill missing pixels with noise
            if (val <= 50) val = Math.floor(10.0 * Math.random()) + 40;
  
  
            this.data[index] = val;
            this.data[++index] = val;
            this.data[++index] = val;
          }
      
        }
      
        this.ctx.putImageData(this.imageData, 0, 0);
      }

}