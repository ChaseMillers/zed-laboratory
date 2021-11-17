import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

const gltfLoad = (
	mirror, leftDoor, rightDoor, btnGreen, btnBlue, 
	btnRed, btnLeft, btnRight, beforePowerBtns, shell, 
	btnMaterial, grid, dome, horseHeadGroup, scene, horseHead,
	sceneMaterial, shellMaterial, gridMaterial, btns, horseReflectionMaterial,
	zedMaterial, laserMaterial, powerMaterial, floorReflectionMaterial,
	alphaBtns) => {

    // Draco Loader
	const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderConfig({ type: 'js' });
		dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/'); // use a full url path

	// GLTF Loader
	const gltfLoader = new GLTFLoader()
	gltfLoader.setDRACOLoader(dracoLoader)

	const loadScene=(gltfLoaderValuesCallBack)=>{

		// GLTF loader
		gltfLoader.load(
		  '/exportPackages/sceneMaya.glb', 
		  (gltf) =>
		  {   
			// Horse Head Prep
			horseHead = gltf.scene.children.find(child => child.name === 'mesh_0')
			const harnass = gltf.scene.children.find(child => child.name === 'mesh_1')
			const eyes = gltf.scene.children.find(child => child.name === 'mesh_2')
			const rotater = gltf.scene.children.find(child => child.name === 'mesh_3')
			horseHeadGroup.add(horseHead, harnass, eyes, rotater)
			horseHeadGroup.position.z = -1
			horseHeadGroup.rotation.y = -.5
			scene.add(horseHeadGroup)
			
			// scene prep
			btnGreen = gltf.scene.children.find(child => child.name === 'mesh_4')
			btnBlue = gltf.scene.children.find(child => child.name === 'mesh_5')
			btnRed = gltf.scene.children.find(child => child.name === 'mesh_6')
			btnLeft = gltf.scene.children.find(child => child.name === 'mesh_7')
			btnRight = gltf.scene.children.find(child => child.name === 'mesh_8')
			dome = gltf.scene.children.find(child => child.name === 'mesh_9')
			const zed = gltf.scene.children.find(child => child.name === 'mesh_10')
			const power = gltf.scene.children.find(child => child.name === 'mesh_11')
			mirror = gltf.scene.children.find(child => child.name === 'mesh_12')
			leftDoor = gltf.scene.children.find(child => child.name === 'mesh_13')
			rightDoor = gltf.scene.children.find(child => child.name === 'mesh_14')
			const stand = gltf.scene.children.find(child => child.name === 'mesh_15')
			shell = gltf.scene.children.find(child => child.name === 'mesh_16')
			grid = gltf.scene.children.find(child => child.name === 'mesh_17')

			// material assigments
			horseHead.material = horseReflectionMaterial
			rotater.material = sceneMaterial
			harnass.material = zedMaterial
			zed.material = zedMaterial
			eyes.material = laserMaterial
			dome.material = sceneMaterial
			power.material = powerMaterial
			mirror.material = floorReflectionMaterial
			leftDoor.material = sceneMaterial
			rightDoor.material = sceneMaterial
			stand.material = sceneMaterial
			shell.material = shellMaterial
			grid.material = gridMaterial
			
			// Wireframe Helper, EdgesGeometry will render the hard edges only, also WireframeGeometry for all edges.
			let wireframeGeo = [stand, horseHead] 
			const wireframeMaterial = new THREE.LineBasicMaterial( { color: 0x111111})
			for (let i =0; i<wireframeGeo.length; ++i){ 
				const wireframeGeometry = new THREE.EdgesGeometry( wireframeGeo[i].geometry );
				const wireframe = new THREE.LineSegments( wireframeGeometry, wireframeMaterial );
				wireframeGeo[i].add( wireframe );
			}

			// Button prep
			beforePowerBtns = [ btnRed, btnBlue, btnLeft, btnRight]
			for (let i =0; i<beforePowerBtns.length; ++i){
				beforePowerBtns[i].material = sceneMaterial
				beforePowerBtns[i].position.y = -.0206
				beforePowerBtns[i].position.z = -.0103

				// add material group
				beforePowerBtns[i].geometry.addGroup(0, Infinity, 0);
				beforePowerBtns[i].geometry.addGroup(0, Infinity, 1);
			}

			// Perpare start btn
			btns = [btnGreen]
			btnMaterial = [sceneMaterial, alphaBtns];

			for (let i =0; i<btns.length; ++i){
				btns[i].geometry.addGroup(0, Infinity, 0);
				btns[i].geometry.addGroup(0, Infinity, 1);
				btns[i].material = btnMaterial
			}

			scene.add(gltf.scene)
			// Match order to the Apps InteractiveObjects[] 
			const storedInteractiveObjects = [
				mirror, leftDoor, rightDoor, btnGreen, btnBlue, btnRed, btnLeft, btnRight, 
				beforePowerBtns, shell, btnMaterial, grid, dome, btns, horseHead]
				
			gltfLoaderValuesCallBack(storedInteractiveObjects)
			}
		)
	}
	// loadScene()
	
	return {
		loadScene
	}
}

export default gltfLoad