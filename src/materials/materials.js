import * as THREE from "three";


const materials = (shellBurnPercent) => {

	/*********
    TEXTURES
    **********/
    const loadingManager = new THREE.LoadingManager()
    const textureLoader = new THREE.TextureLoader(loadingManager)
    
    const shellTexture = textureLoader.load('/images/matcaps/11.png')
	const darkBlue = textureLoader.load('/images/matcaps/5New.png')
	const alphaColorTexture = textureLoader.load('/images/alphaColors.png')
	const colorTexture = textureLoader.load('/images/color.png')
	const normalTexture = textureLoader.load('/images/normal.png')

	//Texture optimization when using minFilter, images must be divisible by 2! Ex: 512x512, 1024x1024, 512x2048
	colorTexture.generateMipmaps = false 
	colorTexture.minFilter = THREE.NearestFilter // NearestFilter will provide better optimization.
	
	/*********
    COLOR SELECT
    **********/
	const colorSelect = [
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
	let shellColor = new THREE.Color(`hsl(0, ${shellBurnPercent}%, 30% )`);

	/*********
    MATERIALS 
    **********/
	const gridMaterial = new THREE.MeshBasicMaterial({ 
		color: 0x111111, 
		side: THREE.DoubleSide,
	})
	
	const shellMaterial = new THREE.MeshMatcapMaterial({  
		color: shellColor,
		matcap: shellTexture,
	})

	const zedMaterial = new THREE.MeshBasicMaterial({  
		color: colorSelect[0],
	})

	const laserMaterial = new THREE.MeshBasicMaterial({  
		color: colorSelect[1]
	})

	const sceneMaterial = new THREE.MeshMatcapMaterial({  
		map: colorTexture,
		normalMap: normalTexture,
		matcap: darkBlue,
    })

	const alphaBtns = new THREE.MeshBasicMaterial({  
		map: alphaColorTexture,
		alphaTest: .5,
	})


	return {
		gridMaterial,
		shellMaterial,
		zedMaterial,
		laserMaterial,
		sceneMaterial,
		alphaBtns,
		colorSelect,
	}
}

export default materials