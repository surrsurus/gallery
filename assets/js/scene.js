import * as THREE from 'three';

const gridHelper = new THREE.GridHelper(40, 40);
const axesHelper = new THREE.AxesHelper();
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });

scene.add(gridHelper);
scene.add(axesHelper);
const canvasHtml = document.getElementById("gallery-canvas");
renderer.setSize(canvasHtml.offsetWidth, canvasHtml.offsetHeight);

export { scene, renderer };