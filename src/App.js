import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from 'gsap'
import * as dat from 'dat.gui'
import Stats from 'stats.js'
import materials from "./materials/materials";
import shaders from "./materials/shaders";
import reflections from "./materials/reflections"
import gltfLoad from "./gltfLoader"
import laserActivation from "./laser/laserActivation"
import btnFunctionality from './btnFunctionality'

const App = () => {
  
  const mountRef = useRef(null);
  const raycaster = new THREE.Raycaster()
	

  useEffect(() => {



	/***************************
    DEBUGING UI press H to toggle
    ****************************/
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
	// Interactive variables
	// Match order to the gltfLoader storedInteractiveObjects[] 
	// Scene Interactive Objects
	let object = {
		mirror : null,
		leftDoor : null,
		rightDoor : null,
		btnGreen : null,
		btnBlue : null,
		btnRed : null,
		btnLeft : null,
		btnRight : null,
		beforePowerBtns : null,
		shell : null,
		btnMaterial : null,
		grid : null,
		dome : null,
		btns : null,
		horseHead: null
	}

	// Update objects
	const gltfLoaderValuesCallBack=(storedInteractiveObjects)=>{
		let i = 0
		for (let property in object){
			object[property] = storedInteractiveObjects[i]
			console.log(`${property}: ${object[property]}`);
			++i
		}
	}
	
	// Call Loader
	const horseHeadGroup = new THREE.Group()
	const {
		loadScene,
	} = gltfLoad(
		object.mirror, object.leftDoor, object.rightDoor, object.btnGreen, object.btnBlue, 
		object.btnRed, object.btnLeft, object.btnRight, object.beforePowerBtns, object.shell, 
		object.btnMaterial, object.grid, object.dome, horseHeadGroup, scene, object.horseHead,
		sceneMaterial, shellMaterial, gridMaterial, object.btns, horseReflectionMaterial,
		zedMaterial, laserMaterial, powerMaterial, floorReflectionMaterial,
		alphaBtns
		)
	loadScene(gltfLoaderValuesCallBack)
	


    /*********************
	LASER!
	**********************/

	// FINAL SYSTEM OVERLOAD
	const systemOverload=(elapsedTime)=>{
		gsap.to(horseHeadGroup.rotation, { duration: 3, delay: 0, y: elapsedTime *2})
		lasersSwitch = false
		doorSwitch = false
		btnsClosedDoor(object.btnGreen, object.btnBlue, object.btnLeft, object.btnRight, object.btnRed)
		gsap.to(object.leftDoor.position, { duration: 1, delay: 3, x: 0 })
		gsap.to(object.rightDoor.position, { duration: 1, delay: 3, x: 0 })
	}

	// Atatch laser too mouse move event.
	const laserFire =()=>raycastBeam(object.dome, object.shell, object.btnGreen, object.btnRed, object.btnBlue, object.btnLeft, object.btnRight)
	
	// Disable Lasers if switch is on
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
		laserReactObjects, shellBurnPercent, object.shell, powerMaterial,
		systemOverload, debugObject
	);

	const body = document.querySelector(".render")
	let intersects, activeBtn, btnLeftRightSwitch, doorSwitch, lasersSwitch = false

	// Red laser activation function
	const redLaserActivation=()=>{
		// turns on lasers and horse head follow
		lasersSwitch = !lasersSwitch
		// makes lasers visible
		laserObjects.forEach(laser => {
			laser.visible = !laser.visible
		});
	}
	


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
	BUTTON FUNCTIONALITY
	********************/

	//Update Buttons
	const btnsSlectionCallBack =(storedBtnsList, storedBtnLeftRightSwitch, storedDoorSwitch)=>{
		object.btns = storedBtnsList; 
		btnLeftRightSwitch = storedBtnLeftRightSwitch;
		doorSwitch = storedDoorSwitch
	}

	const {
		btnsClosedDoor,
		btnLogic
	} = btnFunctionality (
		object.btns, object.btnGreen, object.btnBlue, object.btnLeft, object.btnRight, 
		object.btnRed, sceneMaterial, btnLeftRightSwitch, object.beforePowerBtns,
		redLaserActivation, debugObject, colorSelect, powerMaterial,
		doorSwitch, object.rightDoor, object.leftDoor, object.btnMaterial, lasersSwitch, 
		btnsSlectionCallBack, disableLasers
	)

	// Button Clicker Controll Animation
	let storedBtn = null 
	window.addEventListener('mousedown', () =>{
		if(object.btns && body.style.cursor === 'pointer'){
			storedBtn = activeBtn
			storedBtn.position.y = -.0206
			storedBtn.position.z = -.0103
		}
	},false)
	window.addEventListener('mouseup', () =>{
		if(storedBtn){
			storedBtn.position.y = 0
			storedBtn.position.z = 0	
			btnLogic(
				activeBtn, object.btnGreen, object.btnBlue, object.btnLeft, object.btnRight, 
				object.btnRed, object.rightDoor, object.leftDoor, object.btnMaterial
				)	
			storedBtn = null
		}	
	},false)

	// Raycaster currently activated in mouse listener. 
	const rayCaster=()=>{
		if(object.btns){
			// Cast ray
			raycaster.setFromCamera(mouse, camera)
			// Reacting to buttons
			intersects = raycaster.intersectObjects(object.btns)
			
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



	/********************
	ANIMATION
	*********************/

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
		beamOnShell(elapsedTime, object.shell)

		// Floor material reflection animation
		if(object.mirror){
			object.mirror.visible = false;
			object.grid.visible = false;
			cubeCamera1.update( renderer, scene );
			object.mirror.visible = true;
			object.grid.visible = true;
		}

		// Horse Head Reflection
		if(object.horseHead){
			object.horseHead.visible = false;
			cubeCamera2.update( renderer, scene );
			object.horseHead.visible = true;
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
    


	/********************
	DEBUG PARAMETERS
	*********************/

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
    

    // MOUNT TO REFRENCE 
    mountRef.current.appendChild( renderer.domElement );
    return () => mountRef.current.removeChild( renderer.domElement);   
  }, []);

  return (
   
    <div ref={mountRef} className='render'/>
  );
}

export default App;