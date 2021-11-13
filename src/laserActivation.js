import * as THREE from "three";
import THREEx1 from './threex.laserBeam.js'
import THREEx2 from './threex.laserCooked.js'
import shellCooking from './shellCooking.js'

const laserActivation = (
	mouse, camera, horseHeadGroup,
	raycaster, laserReactObjects, shellBurnPercent, shell, 
	powerMaterial, systemOverload, debugObject
) => {

	// return laser on shell booling value
	let activelyCooking = false

	/*
	HORSE HEAD FOLLOW ON LASER
	*/
	let target = new THREE.Vector3();
	const horseHeadFollowMouse =()=>{
		target.x += ( mouse.x - target.x ) * .09; // .08 creates a slight smoothing 
		target.z = camera.position.z * .01; // assuming the camera is located at ( 0, 0, z );
		horseHeadGroup.lookAt( target );
	}
	
	// target setup for cursor
	let plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -2.5);
	let targetLaser = new THREE.Vector3();

	// perpare lasers
	let laserBeams = []
	let laserObjects = []
	const laserCount = 2

	for (let i=0; i<laserCount; ++i){
		laserBeams[i] = new THREEx1.LaserBeam()

		laserObjects[i] = laserBeams[i].object3d
		laserObjects[i].position.z = .8
		laserObjects[i].position.y = 2.18
		
		laserObjects[i].rotateY(THREE.Math.degToRad(-90));
		laserObjects[i].scale.x	= 10	
		laserObjects[i].visible = false;
		horseHeadGroup.add( laserObjects[i] )
	}

	// push left/right for eye positions
	laserObjects[0].position.x = 0.19
	laserObjects[1].position.x = -0.19

	let laserCooked = []
	const raycastBeam =(dome, shell, btnGreen, btnRed, btnBlue, btnLeft, btnRight)=>{
		laserReactObjects =[dome, shell, btnGreen, btnRed, btnBlue, btnLeft, btnRight]
		if(laserReactObjects.length){
			raycaster.ray.intersectPlane(plane, targetLaser);
			
			for (let i = 0; i<laserCount; i++){
				laserCooked[i] = new THREEx2.LaserCooked(laserBeams[i],laserReactObjects)
				laserCooked[i].update()
				laserObjects[i].lookAt(targetLaser);
				laserObjects[i].rotateY(THREE.Math.degToRad(-90));
			}
		}
	
		let activeObject = THREEx2.LaserCooked.intersects
		if(activeObject.length && activeObject[0].object.name === "mesh_16"){
			activelyCooking = true
			isLaserOnShellCallBack(activelyCooking)
		}
		else {
			activelyCooking = false
			isLaserOnShellCallBack(activelyCooking)
		}
	}

	// SHELL COOKING
	const {
		beamOnShell,
		isLaserOnShellCallBack
	} = shellCooking(
		shellBurnPercent, activelyCooking, shell, powerMaterial,
		systemOverload, debugObject, laserObjects
	);
	

	return {
		horseHeadFollowMouse,
		plane,
		targetLaser,
		laserBeams,
		laserObjects,
		laserCount,
		laserCooked,
		activelyCooking,
		raycastBeam,
		beamOnShell
	}
}

export default laserActivation