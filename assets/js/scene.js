import * as THREE from 'three';

const gridHelper = new THREE.GridHelper(40, 40);
const axesHelper = new THREE.AxesHelper();
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });

scene.add(gridHelper);
scene.add(axesHelper);
renderer.setSize(window.innerWidth, window.innerHeight);

export { scene, renderer };