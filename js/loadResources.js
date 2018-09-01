/*
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
*/

import torsoURL from '../files/stl/torso.bin';
import heartURL from '../files/stl/heart.bin';
import probeURL from '../files/stl/probe.bin';

import pako from 'pako';
import STLBuilder from './STLBuilder.js';

import {LoadingManager, FileLoader} from 'three';

const // Initialize all the loaders
    manager = new LoadingManager(),
    file = new FileLoader(manager).setResponseType('arraybuffer');

// Initialize return object
const resources = {
    torsoGeometry: null,
    heartGeometry: null,
    probeGeometry: null
    //frames: new Array(48)
}

export default {
    loadAll: () => {
        /*
        for(let n = 0; n < 48; n++){
            file.load(frameURL[n], (data) => {
                resources.frames[n] = pako.inflate(data);
            });
        }*/

        file.load(torsoURL, (data) => {
            const torso = pako.inflate(data);
            resources.torsoGeometry = STLBuilder.parse(torso.buffer);
        });
        
        file.load(heartURL, (data) => {
            const heart = pako.inflate(data);
            resources.heartGeometry = STLBuilder.parse(heart.buffer);
        });
        
        file.load(probeURL, (data) => {
            const probe = pako.inflate(data);
            resources.probeGeometry = STLBuilder.parse(probe.buffer);
        });
    },
    whileLoading: (fn) => {manager.onProgress = fn},
    whenDone: (fn) => {manager.onLoad = () => fn(resources)},
}

