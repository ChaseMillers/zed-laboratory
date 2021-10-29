import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from 'gsap'
import * as dat from 'dat.gui'
import Stats from 'stats.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import portalVertexShader from './shaders/vertex.js'
import portalFragmentShader from './shaders/fragment.js'

const App = () => {
  
  const Clock = new THREE.Clock()
  const mountRef = useRef(null);

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
  
    //  Focus Group
    const group = new THREE.Group()
    group.position.y = 0
    group.position.x = 0
    scene.add(group)

    // Camera
    const camera = new THREE.PerspectiveCamera( 75, sizes.width/sizes.height);
    camera.position.z = 3.5; // back forward .5
    camera.position.x = 1; // left right
    camera.position.y = 1; // up down
    camera.lookAt(group.position)
    scene.add(camera)

    //Renderer
    const renderer = new THREE.WebGL1Renderer()
    renderer.setSize( sizes.width, sizes.height );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // Keeps pixel ratio between 1-2
    
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
    UI Parameter Values
    **/
    const parameters = {
      color: 0xff,
      spinAnimation:()=>{
        gsap.to(group.rotation, { duration: 1, y: group.rotation.y + 10 })
      },
      zedColor: 0xffffff
    }

     /**
    TEXTURES
    **/
    const loadingManager = new THREE.LoadingManager()

    const textureLoader = new THREE.TextureLoader(loadingManager)
    
    const matcapHorse = textureLoader.load('/images/matcaps/3new.png')
    const matcapEth = textureLoader.load('/images/matcaps/11.png')
    const matcapEthShell = textureLoader.load('/images/matcaps/4.png')
    const darkBlue = textureLoader.load('/images/matcaps/5.png')


    /**
    Materials
    **/
   // horse Eyes material
    const horseHeadMaterial = new THREE.MeshMatcapMaterial({  //MeshBasicMaterial for no lights or MeshStandard for best all around. 
      flatShading: true,
      matcap: matcapHorse
    })

    const zedMaterial = new THREE.MeshBasicMaterial({  
      color: parameters.zedColor,
    })
    const shineBlue = new THREE.MeshMatcapMaterial({  
      matcap: matcapEthShell,
      flatShading: true,
    })
    const ethShellMaterial = new THREE.MeshMatcapMaterial({  
      matcap: matcapEth,
      flatShading: true,
    })
    const darkBlueMaterial = new THREE.MeshMatcapMaterial({  
      matcap: darkBlue
    })

    const floorMaterial = new THREE.MeshBasicMaterial({  
      color: 0x111111,
     
    })

    const wallMaterial = new THREE.MeshMatcapMaterial({  
      color: '#000000',
      transparent: true,
      opacity: .0,
    })

    /* 
    REFLECTION 
    */
  








    
    

    // Shader Effects
    let powerColor = {
      color: '#5d5dff'
    }
    let powerMaterial = new THREE.ShaderMaterial({
      uniforms:
      {
        uTime: { value: 0 },
        uColorStart: { value: new THREE.Color(0xff0000) },
        uColorEnd: { value: new THREE.Color(powerColor.color) }
      },
      vertexShader: portalVertexShader,
      fragmentShader: portalFragmentShader
    })


    // Draco loader
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderConfig({ type: 'js' });
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/'); // use a full url path
   
    // GLTF loader
    const gltfLoader = new GLTFLoader()
    gltfLoader.setDRACOLoader(dracoLoader)

    const objectsToUpdate = []
    gltfLoader.load(
      '/exportPackages/sceneMaya.glb',
      (gltf) =>
      {   
        scene.add(gltf.scene)
        gltf.scene.position.y = -1.9
        gltf.scene.position.x = -.5
      
        const horseHead = gltf.scene.children.find(child => child.name === 'mesh_0')
        const harnass = gltf.scene.children.find(child => child.name === 'mesh_1')
        const eye1 = gltf.scene.children.find(child => child.name === 'mesh_2')
        const eye2 = gltf.scene.children.find(child => child.name === 'mesh_3')
        const btnGreen = gltf.scene.children.find(child => child.name === 'mesh_4')
        const btnBlue = gltf.scene.children.find(child => child.name === 'mesh_5')
        const btnRed = gltf.scene.children.find(child => child.name === 'mesh_6')
        const btnLeft = gltf.scene.children.find(child => child.name === 'mesh_7')
        const btnRight = gltf.scene.children.find(child => child.name === 'mesh_8')
        const btnRing = gltf.scene.children.find(child => child.name === 'mesh_9')
        const floor = gltf.scene.children.find(child => child.name === 'mesh_10')
        const stand = gltf.scene.children.find(child => child.name === 'mesh_11')
        const table = gltf.scene.children.find(child => child.name === 'mesh_12')
        const shell = gltf.scene.children.find(child => child.name === 'mesh_13')
        const backLights = gltf.scene.children.find(child => child.name === 'mesh_14')
        const ethPower = gltf.scene.children.find(child => child.name === 'mesh_15')
        const zed = gltf.scene.children.find(child => child.name === 'mesh_16')
        const dome = gltf.scene.children.find(child => child.name === 'mesh_17')
        const wall = gltf.scene.children.find(child => child.name === 'mesh_18')

        // objects to update
        // objectsToUpdate.push({ 
        //   horseHead: horseHead,
        //   eye1 : eye1,
        //   eye2 : eye2
        // })


        // get materials
        horseHead.material = horseHeadMaterial
        harnass.material = zedMaterial
        eye1.material = powerMaterial
        eye2.material = powerMaterial
        btnGreen.material = powerMaterial
        btnBlue.material = darkBlueMaterial
        btnRed.material = ethShellMaterial
        btnLeft.material = powerMaterial
        btnRight.material = shineBlue
        
        dome.material = darkBlueMaterial
        backLights.material = powerMaterial
        zed.material = zedMaterial
        btnRing.material = shineBlue
        stand.material = darkBlueMaterial
        table.material = horseHeadMaterial
        shell.material = horseHeadMaterial
        ethPower.material = powerMaterial
        wall.material = wallMaterial
        floor.material = floorMaterial
        // const worldPosition = new THREE.Vector3();
        // floor.getWorldPosition( worldPosition );


               /**
          ANIMATIONS Raycaster
        **/
        const switchLights=(wall, bool)=>{
          let lights = bool
          lights?
          gsap.to(wall.material, {duration: 8, delay: 1, opacity:0 })
          : wall.material.opacity = 98
        }


        const raycaster = new THREE.Raycaster()
        const animate =()=> {

          stats.begin()
          // Update objects to move dependent of user framerate
          const elapsedTime = Clock.getElapsedTime()
          
          powerMaterial.uniforms.uTime.value = elapsedTime
          
          // Cast ray
          raycaster.setFromCamera(mouse, camera)

          const btns = [btnRed, btnGreen, btnBlue, btnLeft, btnRight]
          const intersects = raycaster.intersectObjects(btns)

          // pointer on button
          const body = document.querySelector(".render")
          if(intersects.length)
          {
            body.style.cursor = 'pointer';
          }
          else body.style.cursor = 'default';
           
         
          window.addEventListener('click', () =>
          {
              if(intersects.length && body.style.cursor === 'pointer')
              {
                btnGreen.position.y = -.77
                switchLights(wall, true) 
              }
          })

          // Update camera
          camera.position.x = mouse.x * .1
          camera.position.y = mouse.y * .1

          //Render
          renderer.render( scene, camera );
          requestAnimationFrame( animate );
          stats.end()
        };
        animate();
        }
    )

    console.log(objectsToUpdate)
    
    /**
    Mouse Window Move
    **/
    const mouse = new THREE.Vector2()
    window.addEventListener('mousemove', (event) =>
    {
        mouse.x = event.clientX / sizes.width * 2 - 1
        mouse.y = - (event.clientY / sizes.height) * 2 + 1
    })
  
    
    
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

export default App;