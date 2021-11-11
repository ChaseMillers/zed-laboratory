import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

const gltfLoad = () => {

    // Draco Loader
	const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderConfig({ type: 'js' });
		dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/'); // use a full url path

	// GLTF Loader
	const gltfLoader = new GLTFLoader()
	gltfLoader.setDRACOLoader(dracoLoader)

	
	return {
		gltfLoader
	}
}

export default gltfLoad