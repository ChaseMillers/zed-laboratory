import * as THREE from "three";

const shaders = (scene) => {

/***************
FLOOR REFLECTION
***************/
const cubeRenderTarget1 = new THREE.WebGLCubeRenderTarget( 512, {
	format: THREE.RGBFormat,
	generateMipmaps: true,
	minFilter: THREE.LinearMipmapLinearFilter,
	encoding: THREE.sRGBEncoding // to prevent the material's shader from recompiling every frame
} );

const floorReflectionMaterial = new THREE.MeshBasicMaterial( {
	envMap: cubeRenderTarget1.texture,
	color: 0x011111,
} );
  
const cubeCamera1 = new THREE.CubeCamera( .1, 10, cubeRenderTarget1 );
	cubeCamera1.position.z = 3
	cubeCamera1.position.x = .4
	cubeCamera1.position.y = -2
	scene.add( cubeCamera1 );

/********************
HORSE HEAD REFLECTION
*********************/
const cubeRenderTarget2 = new THREE.WebGLCubeRenderTarget( 256, {
	format: THREE.RGBFormat,
	generateMipmaps: true,
	minFilter: THREE.LinearMipmapLinearFilter,
	encoding: THREE.sRGBEncoding // to prevent the material's shader from recompiling every frame
} );
const cubeCamera2 = new THREE.CubeCamera( .1, 10, cubeRenderTarget2 );
	cubeCamera2.position.z = 1
	cubeCamera2.position.y = 1.3
	scene.add( cubeCamera2 );

const horseReflectionMaterial = new THREE.MeshBasicMaterial( {
	envMap: cubeRenderTarget2.texture
} );

	return {
		floorReflectionMaterial,
		cubeCamera1,
		cubeCamera2,
		horseReflectionMaterial
	}
}

export default shaders