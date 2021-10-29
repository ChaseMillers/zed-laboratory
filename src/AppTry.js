import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from 'gsap'
import * as dat from 'dat.gui'
import Stats from 'stats.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import PortalVertex from './shaders/powerVertex.glsl'
import PortalFragment from './shaders/powerFragment.glsl'

const AppTry = () => {
  
  const mountRef = useRef(null);
  const mouse = new THREE.Vector2()
  const raycaster = new THREE.Raycaster()

  useEffect(() => {
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

    //Renderer
    const renderer = new THREE.WebGL1Renderer()
    renderer.setSize( sizes.width, sizes.height );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // Keeps pixel ratio between 1-2
    renderer.outputEncoding = THREE.sRGBEncoding

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
  

    /**
    UI Parameter Values
    **/
    const parameters = {
      color: 0xff,
      spinAnimation:()=>{
        gsap.to(horseHeadGroup.rotation, { duration: 1, y: horseHeadGroup.rotation.y + 10 })
      },
      zedColor: 0xffffff
    }

     /**
    TEXTURES
    **/
    const loadingManager = new THREE.LoadingManager()

    const textureLoader = new THREE.TextureLoader(loadingManager)
    
    const matcapHorse = textureLoader.load('/images/matcaps/3new.png')
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
	const horseHeadMaterial = new THREE.MeshMatcapMaterial({  //MeshBasicMaterial for no lights or MeshStandard for best all around. 
      matcap: matcapHorse,
    })

    const zedMaterial = new THREE.MeshBasicMaterial({  
      color: parameters.zedColor,
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
    REFLECTIONs 
    */
	let floorReflectionMaterial, horseReflectionMaterial, cubeCamera1, cubeCamera2, cubeRenderTarget1,cubeRenderTarget2;
	const reflection=()=> {
		
		renderer.outputEncoding = THREE.sRGBEncoding; // for post processing pass
	
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
	
		floorReflectionMaterial = new THREE.MeshBasicMaterial( {
			envMap: cubeRenderTarget1.texture,
			color: 0x011111,
		} );
		horseReflectionMaterial = new THREE.MeshBasicMaterial( {
			envMap: cubeRenderTarget2.texture
		} );

	}
	reflection()



    // Power Shader Effects
    let powerColor = {
      color: '#5d5dff'
    }
    let powerMaterial = new THREE.ShaderMaterial({
      uniforms:
      {
        uTime: { value: 0 },
        uColorStart: { value: new THREE.Color(0xffffff) },
        uColorEnd: { value: new THREE.Color(powerColor.color) }
      },
      vertexShader: PortalVertex.toString(),
      fragmentShader: PortalFragment.toString()
    })
	
	let mirror = null
	let horseHead = null
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
			
			const btnGreen = gltf.scene.children.find(child => child.name === 'mesh_5')
			const btnBlue = gltf.scene.children.find(child => child.name === 'mesh_6')
			const btnRed = gltf.scene.children.find(child => child.name === 'mesh_7')
			const btnLeft = gltf.scene.children.find(child => child.name === 'mesh_8')
			const btnRight = gltf.scene.children.find(child => child.name === 'mesh_9')
			const dome = gltf.scene.children.find(child => child.name === 'mesh_10')
			const zed = gltf.scene.children.find(child => child.name === 'mesh_11')
			const power = gltf.scene.children.find(child => child.name === 'mesh_12')
			mirror = gltf.scene.children.find(child => child.name === 'mesh_13')
			const opacity = gltf.scene.children.find(child => child.name === 'mesh_14')

			horseHead.material = horseReflectionMaterial
			rotater.material = sceneMaterial
			harnass.material = zedMaterial
			eye1.material = zedMaterial
			eye2.material = zedMaterial
			dome.material = sceneMaterial
			zed.material = zedMaterial
			power.material = powerMaterial
			mirror.material = floorReflectionMaterial
			opacity.material = opacityMaterial

			// Wireframe Helper, EdgesGeometry will render the hard edges only.
			const wireframeGeometry = new THREE.EdgesGeometry( horseHead.geometry );
			const wireframeMaterial = new THREE.LineBasicMaterial( { color: 0x111111 })
			const wireframe = new THREE.LineSegments( wireframeGeometry, wireframeMaterial );
			horseHead.add( wireframe );
			
			// Button prep
			btns = [btnRed, btnGreen, btnBlue, btnLeft, btnRight]
			let btnMaterial = [sceneMaterial, alphaBtns];

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
	let intersects = null
	let activeBtn = null
	let btns = null
	let switchLeftRight = null

	// Button Logic
	const btnLogic = (pressedBtn) =>{
		//Left Arrow - "mesh_8"
		if(pressedBtn.name === 'mesh_8'){
			switchLeftRight === 'right' || switchLeftRight === null?
				switchLeftRight = 'left'
			: switchLeftRight = null
		}
		
		//Right Arrow - "mesh_9"
		else if(pressedBtn.name === 'mesh_9'){
			switchLeftRight === 'left' || switchLeftRight === null?
				switchLeftRight = 'right'
			: switchLeftRight = null
		}

		// Blue Btn - "mesh_7"
		else if(pressedBtn.name === 'mesh_7'){
			console.log('Blue Btn Pressed')
		}

		// Red Btn "mesh_6"
		else if(pressedBtn.name === 'mesh_6'){
			console.log('Red Btn Pressed')
		}

		// Green Btn "mesh_5"
		else if(pressedBtn.name === 'mesh_5'){
			console.log('Green Btn Pressed')
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
		if(switchLeftRight === 'right'){
			horseHeadGroup.rotation.y += deltaTime * .001 
		}
		if(switchLeftRight === 'left'){
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
  
    
    
    /**
      DEBUGING UI press H to toggle
    **/
    const gui = new dat.GUI({ closed: true, width: 400})
  
    
    const debugObject = {}
    debugObject.portalColorStart = '#ff0000'
    debugObject.portalColorEnd = '#5d5dff'
    
    gui
      .addColor(debugObject, 'portalColorEnd')
      .onChange(() =>
      {
          powerMaterial.uniforms.uColorEnd.value.set(debugObject.portalColorEnd)
      })
    
    gui.add(camera.position, 'x').min(-6).max(6).step(.01).name('left-right')
    gui.add(camera.position, 'y').min(-6).max(6).step(.01).name('up-down')
    gui.add(camera.position, 'z').min(-6).max(6).step(.01).name('backward-forward')
    // gui.add(group, 'lights off').name
    

    // MOUNT TO OUR REFRENCE 
    mountRef.current.appendChild( renderer.domElement );
    return () => mountRef.current.removeChild( renderer.domElement);   
  }, []);

  return (
   
    <div ref={mountRef} className='render'/>
  );
}

export default AppTry;