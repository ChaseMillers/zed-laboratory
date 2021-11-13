import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from 'gsap'
import * as dat from 'dat.gui'
import Stats from 'stats.js'
import materials from "./materials";
import shaders from "./shaders";
import reflections from "./reflections"
import gltfLoad from "./gltfLoader"
import laserActivation from "./laserActivation"
import btnFunctionality from './btnFunctionality'

const App = () => {
  
  const mountRef = useRef(null);
  const raycaster = new THREE.Raycaster()

  useEffect(() => {

	/**
    DEBUGING UI press H to toggle
    **/
	const gui = new dat.GUI({ closed: true, hideable: true, width: 400})
	const debugObject = {}

    /**********
    STATS
    ************/
    const stats = new Stats()
    stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom)
   

    /*************
    Scene Setup
    **************/

    // Scene
    const scene = new THREE.Scene();

    // Window 
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    } 
  
    //  Camera Focus Group
    const cameraFocus = new THREE.Group()
    cameraFocus.position.y = 1
    cameraFocus.position.x = -.4
    scene.add(cameraFocus)


    //Updating
    window.addEventListener("resize", ()=>
    {
      // Update camera
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      // Update renderer
      renderer.setSize( window.innerWidth, window.innerHeight );
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
	})
	
	 // Mouse Window Move
	const mouse = new THREE.Vector2()
	const camera = new THREE.PerspectiveCamera( 75, sizes.width/sizes.height);
	const camX = camera.position.x = .1
	const camY = camera.position.y = 1.8
	camera.position.z = 3.5
	camera.lookAt(cameraFocus.position)

	
	//Renderer
	const renderer = new THREE.WebGL1Renderer()
	renderer.setSize( sizes.width, sizes.height );
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // Keeps pixel ratio between 1-2
	renderer.outputEncoding = THREE.sRGBEncoding; // for post processing pass
 


	/**************************************
    MATERIALS IMPORT
    ***************************************/
	// For reactive shell color
	let shellBurnPercent = 0
	const {
		// Contains an array of colors
		colorSelect,
		gridMaterial,
		shellMaterial,
		zedMaterial,
		laserMaterial,
		sceneMaterial,
		alphaBtns,
	} = materials(shellBurnPercent);
	
	
	/***********************************
	CUSTOM SHADERS 
	*************************************/  
	const {
		powerMaterial,
	} = shaders(colorSelect, scene);


	/***********************************
	REFLECTIONS
	*************************************/ 
	const {
		floorReflectionMaterial,
		cubeCamera1,
		cubeCamera2,
		horseReflectionMaterial
	} = reflections(scene)

	
	/***********************************
	GLTF LOADER
	************************************/
	const {
		gltfLoader
	} = gltfLoad()


	let mirror, horseHead, leftDoor, rightDoor, btnGreen, btnBlue, btnRed, btnLeft, btnRight, beforePowerBtns, stand, shell, btnMaterial, grid, dome, power
	const horseHeadGroup = new THREE.Group()
	const loadScene=()=>{

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
			power = gltf.scene.children.find(child => child.name === 'mesh_11')
			mirror = gltf.scene.children.find(child => child.name === 'mesh_12')
			leftDoor = gltf.scene.children.find(child => child.name === 'mesh_13')
			rightDoor = gltf.scene.children.find(child => child.name === 'mesh_14')
			stand = gltf.scene.children.find(child => child.name === 'mesh_15')
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
			}
		)
	}
	loadScene()	
	

    /*********************
	LASER!
	**********************/
	
	// FINAL SYSTEM OVERLOAD
	const systemOverload=(elapsedTime)=>{
		gsap.to(horseHeadGroup.rotation, { duration: 3, delay: 0, y: elapsedTime *2})
		lasersSwitch = false
		doorSwitch = false
		btnsClosedDoor(btnGreen, btnBlue, btnLeft, btnRight, btnRed)
		gsap.to(leftDoor.position, { duration: 1, delay: 3, x: 0 })
		gsap.to(rightDoor.position, { duration: 1, delay: 3, x: 0 })
	}

	
	// Atatch laser too mouse move event.
	const laserFire =()=>raycastBeam(dome, shell, btnGreen, btnRed, btnBlue, btnLeft, btnRight)
	// Disable Lasers if on
	const disableLasers =()=> {if (lasersSwitch) redLaserActivation()}

	// LASER TRIGGER
	let laserReactObjects
	let {
		// Contains an array of colors
		horseHeadFollowMouse,
		raycastBeam,
		beamOnShell,
		laserObjects
	} = laserActivation(
		mouse, camera, horseHeadGroup, raycaster, 
		laserReactObjects, shellBurnPercent, shell, powerMaterial,
		systemOverload, debugObject
	);
	


	//////////////////////////////////////////////////////////////////////////////////
	//		On Mouse Move Events						//
	//////////////////////////////////////////////////////////////////////////////////
	
	document.addEventListener('mousemove', function(event){
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1
		mouse.y = - (event.clientY / window.innerHeight) * 2 + 1
		raycaster.setFromCamera(mouse, camera);

		camera.position.x = camX + mouse.x * .1
		camera.position.y = camY + mouse.y * .1

		rayCaster()
		if(lasersSwitch){
			horseHeadFollowMouse()
			laserFire()
		}	
	}, false)
	

	/********************
	 ANIMATIONS Raycaster
	********************/
	const body = document.querySelector(".render")
	let intersects, activeBtn, btns, btnLeftRightSwitch, doorSwitch, lasersSwitch = false

	// Red laser activation function
	const redLaserActivation=()=>{
		// turns on lasers and horse head follow
		lasersSwitch = !lasersSwitch
		// makes lasers visible
		laserObjects.forEach(laser => {
			laser.visible = !laser.visible
		});
	}


	/********************
	BUTTON FUNCTIONALITY
	********************/

	const btnsSlectionCallBack =(storedBtnsList, storedBtnLeftRightSwitch, storedDoorSwitch)=>{
		btns = storedBtnsList; 
		btnLeftRightSwitch = storedBtnLeftRightSwitch;
		doorSwitch = storedDoorSwitch
	}
	const {
		btnsClosedDoor,
		btnLogic
	} = btnFunctionality (
		btns, btnGreen, btnBlue, btnLeft, btnRight, 
		btnRed, sceneMaterial, btnLeftRightSwitch, beforePowerBtns,
		redLaserActivation, debugObject, colorSelect, powerMaterial,
		doorSwitch, rightDoor, leftDoor, btnMaterial, lasersSwitch, 
		btnsSlectionCallBack, disableLasers
	)


	// Button Clicker Controll Animation
	let storedBtn = null 
	window.addEventListener('mousedown', () =>{
		if(btns && body.style.cursor === 'pointer'){
			storedBtn = activeBtn
			storedBtn.position.y = -.0206
			storedBtn.position.z = -.0103
		}
	},false)
	window.addEventListener('mouseup', () =>{
		if(storedBtn){
			storedBtn.position.y = 0
			storedBtn.position.z = 0	
			btnLogic(activeBtn, btnGreen, btnBlue, btnLeft, btnRight, btnRed, rightDoor, leftDoor, btnMaterial)	
			storedBtn = null
		}	
	},false)
	

	// Raycaster currently activated in mouse listener. 
	const rayCaster=()=>{
		if(btns){
			// Cast ray
			raycaster.setFromCamera(mouse, camera)
			// Reacting to buttons
			intersects = raycaster.intersectObjects(btns)
			
			if(intersects.length)
			{
				body.style.cursor = 'pointer';
				activeBtn = intersects[0].object;
			}
			else {
				body.style.cursor = 'default';
			};
		}	
	};



	/*
	ANIMATION
	*/
	let time = Date.now()
	const clock = new THREE.Clock()
	const animate =()=> {
		stats.begin()
		// Clock
		const elapsedTime = clock.getElapsedTime()
		// Update objects to move at same speed regardlass of user framerate.
		const currentTime = Date.now()
		const deltaTime = currentTime - time
		time = currentTime
		
		//Controls heat of Etherum
		beamOnShell(elapsedTime, shell)

		// Floor material reflection animation
		if(mirror){
			mirror.visible = false;
			grid.visible = false;
			cubeCamera1.update( renderer, scene );
			mirror.visible = true;
			grid.visible = true;
		}
		// Horse Head Reflection
		if(horseHead){
			horseHead.visible = false;
			cubeCamera2.update( renderer, scene );
			horseHead.visible = true;
		}

		//Buttons Left/Right
		if(btnLeftRightSwitch === 'right'){
			horseHeadGroup.rotation.y += deltaTime * .001 
		}
		if(btnLeftRightSwitch === 'left'){
			horseHeadGroup.rotation.y -= deltaTime * .001 
		}

		// Power material
		powerMaterial.uniforms.uTime.value += deltaTime * .001


		//Render
		renderer.render( scene, camera );
	
		requestAnimationFrame( animate );
		stats.end()
	};
	animate()
    

    
	// Debug parameters

    debugObject.portalColorStart = colorSelect[1]
    debugObject.portalColorEnd = colorSelect[2]
    gui
      .addColor(debugObject, 'portalColorStart')
      .onChange(() =>
      {
		powerMaterial.uniforms.uColorStart.value.set(debugObject.portalColorStart)
      })

	gui
	.addColor(debugObject, 'portalColorEnd')
	.onChange(() =>
	{
		powerMaterial.uniforms.uColorEnd.value.set(debugObject.portalColorEnd)
	})
    
    gui.add(camera.position, 'x').min(-6).max(6).step(.01).name('left-right')
    gui.add(camera.position, 'y').min(-6).max(6).step(.01).name('up-down')
    gui.add(camera.position, 'z').min(-6).max(6).step(.01).name('backward-forward')
    

    // MOUNT TO OUR REFRENCE 
    mountRef.current.appendChild( renderer.domElement );
    return () => mountRef.current.removeChild( renderer.domElement);   
  }, []);

  return (
   
    <div ref={mountRef} className='render'/>
  );
}

export default App;