import { useEffect, useRef } from "react";
import * as THREE from "three";
import { AxesHelper, BufferGeometryUtils, HemisphereLightHelper } from "three";
import gsap from 'gsap'
import * as dat from 'dat.gui'
import Stats from 'stats.js'

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

    //Lights 
    // east cost: AmbientLight & HemiphereLight. 
    // moderate cost: DirectionalLight & PointLight
    const ambientLight = new THREE.AmbientLight(0xffffff, .5)
    scene.add(ambientLight)

    const HemiphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, .5)
    scene.add(HemiphereLight)

    const pointLight = new THREE.PointLight(0xffffff, .5)
    const pointLightHelp = new THREE.PointLightHelper(pointLight, .2)
    pointLight.position.set(1,1,2)
    scene.add(pointLight, pointLightHelp)

    const DirectionalLight = new THREE.DirectionalLight(0x00fffc, .3)
    DirectionalLight.position.set(0, .65, 2)
    const DirectionalLightHelp = new THREE.DirectionalLightHelper(DirectionalLight, .2)
    scene.add(DirectionalLight, DirectionalLightHelp)

    // Window 
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    } 

    // Camera
    const camera = new THREE.PerspectiveCamera( 75, sizes.width/sizes.height);
    camera.position.z = 3;
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
    const cursor = {
      x: 0,
      y: 0
    }
    window.addEventListener('mousemove', (event) =>{
      cursor.x = event.clientX / sizes.width - 0.5
      cursor.y = - (event.clientY / sizes.height - 0.5)
    })
    
    /**
    TEXTURES
    **/
    const loadingManager = new THREE.LoadingManager()

    const textureLoader = new THREE.TextureLoader(loadingManager)
    const colorTexture = textureLoader.load('/images/door/color.jpg')
    const AOTexture = textureLoader.load('/images/door/ambientOcclusion.jpg')
    const heightTexture = textureLoader.load('/images/door/height.jpg')
    const roughTexture = textureLoader.load('/images/door/roughness.jpg')
    const metalTexture = textureLoader.load('/images/door/metalness.jpg')
    const normalTexture = textureLoader.load('/images/door/normal.jpg')
    const matcapTexture = textureLoader.load('/images/matcaps/3.png')
    const alphaTexture = textureLoader.load('/images/door/alpha.jpg')

    const environmentMapTexture = new THREE.CubeTextureLoader()
    .setPath('/images/environmentMaps/0/')
    .load([
      'px.jpg',
      'nx.jpg',
      'py.jpg',
      'ny.jpg',
      'pz.jpg',
      'nz.jpg',
    ])

    //Texture optimization when using minFilter, images must be divisible by 2! Ex: 512x512, 1024x1024, 512x2048
    colorTexture.generateMipmaps = false 
    colorTexture.minFilter = THREE.NearestFilter // NearestFilter will provide better optimization.
   
    /**
    UI Parameter Values
    **/
    const parameters = {
      color: 0xff00,
      spinAnimation:()=>{
        gsap.to(mesh.rotation, { duration: 1, y: mesh.rotation.y + 10 })
      }
    }

    /**
    Materials
    **/
   // material 1
    const material = new THREE.MeshStandardMaterial({  //MeshBasicMaterial for no lights or MeshStandard for best all around. 
      map: colorTexture,
      // alphaMap: alphaTexture,
      // transparent: true,
      aoMap: AOTexture,
      aoMapIntensity: 1,
      displacementMap: heightTexture,
      displacementScale: .05,
      metalnessMap:metalTexture,
      roughnessMap:roughTexture,
      normalMap:normalTexture,
      normalScale: new THREE.Vector2(1,1),
    })
  
    // material 2
    let material2 = new THREE.MeshStandardMaterial({  //MeshBasicMaterial for no lights or MeshStandard for best all around. 
      color: parameters.color,
      flatShading: true,
      metalness: .7,
      roughness: .2,
      envMap: environmentMapTexture
    })

    // material 3
    let material3 = new THREE.MeshMatcapMaterial({  //MeshBasicMaterial for no lights or MeshStandard for best all around. 
      flatShading: true,
      matcap: matcapTexture
    })

    /**
    OBJECTS NOTE Merged objects = better porfomrance.
    **/
    //  group
    const group = new THREE.Group()
    scene.add(group)

    // cube object
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1,1,1),
      material,
    ) 
    // Second UV set for AO
    mesh.geometry.setAttribute('uv2', new THREE.BufferAttribute(mesh.geometry.attributes.uv.array, 2))
    
    // ring object
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.3, 0.2, 16, 32), 
      material2
    )
    ring.position.x = 1.5

    // triangle object 
    const triangle = new THREE.Mesh(
      new THREE.OctahedronGeometry(.5),
      material3
    )
    triangle.position.x = -1.5
    
    // add group
    // group.add(ring, mesh, triangle)
    const geometries = []
    for(let i = 0; i < 50; i++)
    const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries)
    const merged = new THREE.Mesh(mergedGeometry, material)

    /**
    ANIMATIONS
    **/
    const animate =()=> {

      stats.begin()
      // Update objects to move dependent of user framerate
      const elapsedTime = Clock.getElapsedTime()
      
      // group.rotation.y = elapsedTime * Math.PI 
      // group.rotation.x = elapsedTime * Math.PI * 1
      // group.position.y = Math.sin(elapsedTime)
      // group.position.x = Math.cos(elapsedTime)

      // Update camera
      camera.position.x = cursor.x * 5
      camera.position.y = cursor.y * 5
      camera.lookAt(group.position)

      //Render
      renderer.render( scene, camera );
      requestAnimationFrame( animate );
      stats.end()
    };
    animate();

    /**
    PARTICALS
    **/
    // Geo
    const particlesGeometry = new THREE.SphereGeometry(1, 32, 32)
    // Material
    const particlesMaterial = new THREE.PointsMaterial()
    particlesMaterial.size = 0.02
    particlesMaterial.sizeAttenuation = true
    // Points
    const particles = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particles)
    
    /**
      DEBUGING UI press H to toggle
    **/
    scene.add(AxesHelper)
    const gui = new dat.GUI({ closed: true, width: 400})
    gui.add(material, 'aoMapIntensity').min(0).max(10).step(.0001).name('Ambient Occulusion')
    gui.add(material2, 'metalness').min(0).max(1).step(.0001).name('Metalness')
    gui.add(material2, 'roughness').min(0).max(1).step(.0001).name('Roughness')
    gui.add(group.position, 'x').min(-6).max(6).step(.01).name('left-right')
    gui.add(group.position, 'y').min(-6).max(6).step(.01).name('up-down')
    gui.add(group.position, 'z').min(-6).max(6).step(.01).name('backward-forward')
    gui.add(group, 'visible')
    gui.addColor(parameters, 'color').onChange(()=>{material2.color.set(parameters.color)})
    gui.add(parameters, 'spinAnimation')

    // MOUNT TO OUR REFRENCE 
    mountRef.current.appendChild( renderer.domElement );
    return () => mountRef.current.removeChild( renderer.domElement);   
  }, []);

  return (
   
    <div ref={mountRef} />
  );
}

export default App;