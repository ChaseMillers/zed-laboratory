import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from 'gsap'
import * as dat from 'dat.gui'
import Stats from 'stats.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import PortalVertex from './shaders/powerVertex.glsl'
import PowerFragment from './shaders/powerFragment.glsl'

const AppTry = () => {
  
  const mountRef = useRef(null);
  const mouse = new THREE.Vector2()
  const raycaster = new THREE.Raycaster()

  useEffect(() => {

	/**
      DEBUGING UI press H to toggle
    **/
	const gui = new dat.GUI({ closed: true, hideable: true, width: 400})
	const debugObject = {}

    /**
    STATS
    **/
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
      }
    )
   
    
	/**
	 Mouse Window Move
	**/
	const camera = new THREE.PerspectiveCamera( 75, sizes.width/sizes.height);
	const camX = camera.position.x = .5
	const camY = camera.position.y = 1.8
	camera.position.z = 3.5
	camera.lookAt(cameraFocus.position)
	window.addEventListener('mousemove', (event) =>
	{
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1
		mouse.y = - (event.clientY / window.innerHeight) * 2 + 1

		// Camera Update
		camera.position.x = camX + mouse.x * .1
		camera.position.y = camY + mouse.y * .1
	})

	//Renderer
	const renderer = new THREE.WebGL1Renderer()
	renderer.setSize( sizes.width, sizes.height );
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // Keeps pixel ratio between 1-2
	renderer.outputEncoding = THREE.sRGBEncoding; // for post processing pass

     /**
    TEXTURES
    **/
    const loadingManager = new THREE.LoadingManager()

    const textureLoader = new THREE.TextureLoader(loadingManager)
    
    const darkBlue = textureLoader.load('/images/matcaps/5New.png')
	const alphaColorTexture = textureLoader.load('/images/alphaColors.png')
	const colorTexture = textureLoader.load('/images/color.png')
	const normalTexture = textureLoader.load('/images/normal.png')

	//Texture optimization when using minFilter, images must be divisible by 2! Ex: 512x512, 1024x1024, 512x2048
	colorTexture.generateMipmaps = false 
	colorTexture.minFilter = THREE.NearestFilter // NearestFilter will provide better optimization.
    

	/**
    Materials
    **/

	let colorSelect = [
		0xffffff, // White
		0xff0000, // Red
		0x5d5dff, // Blue
		0xff1e, // Green
		0xff00d1, // Pink
		0xffe1, // Light Blue
		0xe1ff00, // Yellow
		0xff6800, // Orange
		0x0, // black
	]

    // const zedMaterial = new THREE.MeshBasicMaterial({  
    //   color: colorSelect[0],
    // })

	const zedMaterial = new THREE.MeshBasicMaterial({  
		color: colorSelect[0],
	  })

	const sceneMaterial = new THREE.MeshMatcapMaterial({  
		map: colorTexture,
		normalMap:normalTexture,
		matcap: darkBlue,
    })

	const alphaBtns = new THREE.MeshBasicMaterial({  
		map: alphaColorTexture,
		alphaTest: .5,
	  })

    const opacityMaterial = new THREE.MeshMatcapMaterial({  
      color: '#000000',
      transparent: true,
      opacity: .0,
    })

	
		/*
	CUSTOM SHADERS
	*/    
	
	// Power Shader 
	let powerMaterial = new THREE.ShaderMaterial({
	uniforms:
	{
		uTime: { value: 0 },
		uColorStart: { value: new THREE.Color(colorSelect[1]) },
		uColorEnd: { value: new THREE.Color(colorSelect[2]) }
	},
	vertexShader: PortalVertex, 
	fragmentShader: PowerFragment,
	})


    // Reflections
	let floorReflectionMaterial, horseReflectionMaterial, cubeCamera1,cubeCamera2, cubeRenderTarget1, cubeRenderTarget2;
	const reflection=()=> {
	
		// Floor Reflection
		cubeRenderTarget1 = new THREE.WebGLCubeRenderTarget( 512, {
			format: THREE.RGBFormat,
			generateMipmaps: true,
			minFilter: THREE.LinearMipmapLinearFilter,
			encoding: THREE.sRGBEncoding // to prevent the material's shader from recompiling every frame
		} );
		cubeCamera1 = new THREE.CubeCamera( .1, 10, cubeRenderTarget1 );
			cubeCamera1.position.z = 3
			cubeCamera1.position.x = .4
			cubeCamera1.position.y = -2
			scene.add( cubeCamera1 );

		floorReflectionMaterial = new THREE.MeshBasicMaterial( {
			envMap: cubeRenderTarget1.texture,
			color: 0x011111,
		} );

		// Horse Head Reflection
		cubeRenderTarget2 = new THREE.WebGLCubeRenderTarget( 256, {
			format: THREE.RGBFormat,
			generateMipmaps: true,
			minFilter: THREE.LinearMipmapLinearFilter,
			encoding: THREE.sRGBEncoding // to prevent the material's shader from recompiling every frame
		} );
		cubeCamera2 = new THREE.CubeCamera( .1, 10, cubeRenderTarget2 );
		cubeCamera2.position.z = 1
		cubeCamera2.position.y = 1.3
		scene.add( cubeCamera2 );

		horseReflectionMaterial = new THREE.MeshBasicMaterial( {
			envMap: cubeRenderTarget2.texture
		} );

	}
	reflection()



	/*
	GLTF LOADER
	*/
	let mirror, horseHead, leftDoor, rightDoor, btnGreen, btnBlue, btnRed, btnLeft, btnRight, beforePowerBtns, marbleBlack, btnMaterial
	const horseHeadGroup = new THREE.Group()
	const loadScene=()=>{

		// Draco loader
		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderConfig({ type: 'js' });
		dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/'); // use a full url path
	   
		// GLTF loader
		const gltfLoader = new GLTFLoader()
		gltfLoader.setDRACOLoader(dracoLoader)
		gltfLoader.load(
		  '/exportPackages/sceneMaya.glb', 
		  (gltf) =>
		  {   
			// Horse Head Prep
			horseHead = gltf.scene.children.find(child => child.name === 'mesh_0')
			const harnass = gltf.scene.children.find(child => child.name === 'mesh_1')
			const eye1 = gltf.scene.children.find(child => child.name === 'mesh_2')
			const eye2 = gltf.scene.children.find(child => child.name === 'mesh_3')
			const rotater = gltf.scene.children.find(child => child.name === 'mesh_4')
			horseHeadGroup.add(horseHead, harnass, eye1, eye2, rotater)
			horseHeadGroup.position.z = -1
			scene.add(horseHeadGroup)
			
			// scene prep
			btnGreen = gltf.scene.children.find(child => child.name === 'mesh_5')
			btnBlue = gltf.scene.children.find(child => child.name === 'mesh_6')
			btnRed = gltf.scene.children.find(child => child.name === 'mesh_7')
			btnLeft = gltf.scene.children.find(child => child.name === 'mesh_8')
			btnRight = gltf.scene.children.find(child => child.name === 'mesh_9')
			const dome = gltf.scene.children.find(child => child.name === 'mesh_10')
			const zed = gltf.scene.children.find(child => child.name === 'mesh_11')
			const power = gltf.scene.children.find(child => child.name === 'mesh_12')
			mirror = gltf.scene.children.find(child => child.name === 'mesh_13')
			leftDoor = gltf.scene.children.find(child => child.name === 'mesh_14')
			rightDoor = gltf.scene.children.find(child => child.name === 'mesh_15')
			marbleBlack = gltf.scene.children.find(child => child.name === 'mesh_16')
			const grid = gltf.scene.children.find(child => child.name === 'mesh_17')

			// material assigments
			horseHead.material = horseReflectionMaterial
			rotater.material = sceneMaterial
			harnass.material = zedMaterial
			zed.material = zedMaterial
			eye1.material = zedMaterial
			eye2.material = zedMaterial
			dome.material = sceneMaterial
			power.material = powerMaterial
			mirror.material = floorReflectionMaterial
			leftDoor.material = sceneMaterial
			rightDoor.material = sceneMaterial
			marbleBlack.material = sceneMaterial
			
			// Wireframe Helper, EdgesGeometry will render the hard edges only, also WireframeGeometry for all edges.
			let wireframeGeo = [marbleBlack, horseHead, grid] 
			const wireframeMaterial = new THREE.LineBasicMaterial( { color: 0x111111 })
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

	

		/**
	 ANIMATIONS Raycaster
	**/
	const body = document.querySelector(".render")
	let intersects, activeBtn, btns, btnLeftRightSwitch, doorSwitch

	// Button Logic
	const btnLogic = (pressedBtn) =>{
		
		//Left Arrow - "mesh_8"
		if(pressedBtn.name === 'mesh_8'){
			btnLeftRightSwitch === 'right' || btnLeftRightSwitch === undefined?
				btnLeftRightSwitch = 'left'
			: btnLeftRightSwitch = undefined
		}
		
		//Right Arrow - "mesh_9"
		else if(pressedBtn.name === 'mesh_9'){
			btnLeftRightSwitch === 'left' || btnLeftRightSwitch === undefined?
				btnLeftRightSwitch = 'right'
			: btnLeftRightSwitch = undefined
		}

		// Blue Btn - "mesh_7"
		else if(pressedBtn.name === 'mesh_7'){
			let randomInt = Math.floor(Math.random() * 9) // select random number
			debugObject.portalColorStart = colorSelect[randomInt]
			randomInt = Math.floor(Math.random() * 9) // select another random number
			debugObject.portalColorEnd = colorSelect[randomInt]
			// Change color based on random choice
			powerMaterial.uniforms.uColorStart.value.set(debugObject.portalColorStart)
			powerMaterial.uniforms.uColorEnd.value.set(debugObject.portalColorEnd)
		}

		// Red Btn "mesh_6"
		else if(pressedBtn.name === 'mesh_6'){
			console.log('Red Btn Pressed')
		}

		// Green Btn "mesh_5"
		else if(pressedBtn.name === 'mesh_5'){
			doorSwitch = !doorSwitch;
			if (doorSwitch){
				gsap.to(leftDoor.position, { duration: 1, delay: 0, x: -3 })
				gsap.to(rightDoor.position, { duration: 1, delay: 0, x: 3 })

				// Activate remaining Btns
				btns = [btnRed, btnGreen, btnBlue, btnLeft, btnRight]

				for (let i =0; i<btns.length; ++i){
					btns[i].position.y = 0
					btns[i].position.z = 0
					btns[i].material = btnMaterial
				}
			}
			else {
				gsap.to(leftDoor.position, { duration: 1, delay: 0, x: 0 })
				gsap.to(rightDoor.position, { duration: 1, delay: 0, x: 0 })

				// Disable remaining Btns
				btns = [btnGreen]
				// Change material back
				beforePowerBtns = [ btnRed, btnBlue, btnLeft, btnRight]
				for (let i =0; i<beforePowerBtns.length; ++i){
					beforePowerBtns[i].material = sceneMaterial
					beforePowerBtns[i].position.y = -.0206
					beforePowerBtns[i].position.z = -.0103
				}
				
			}
		}
	}


	// Button Clicker Animation
	let storedBtn = null 
	window.addEventListener('mousedown', () =>{
		if(btns && intersects.length && body.style.cursor === 'pointer'){
			storedBtn = activeBtn
			storedBtn.position.y = -.0206
			storedBtn.position.z = -.0103
		}
	})
	window.addEventListener('mouseup', () =>{
		if(storedBtn){
			storedBtn.position.y = 0
			storedBtn.position.z = 0	
			btnLogic(activeBtn)	
			storedBtn = null
		}	
	})
	

	// Raycaster currently activated in the animation function. 
	const rayCaster=()=>{
		
		if(btns){

			// Cast ray
			raycaster.setFromCamera(mouse, camera)
		
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
	const animate =()=> {

		stats.begin()

		// Update objects to move at same speed regardlass of user framerate.
		const currentTime = Date.now()
		const deltaTime = currentTime - time
		time = currentTime

		// Floor material reflection animation
		if(mirror){
			mirror.visible = false;
			cubeCamera1.update( renderer, scene );
			mirror.visible = true;
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

		// Interactive button animations
		rayCaster()

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

export default AppTry;