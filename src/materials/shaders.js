import * as THREE from "three";
import PortalVertex from '../shaders/powerVertex.glsl'
import PowerFragment from '../shaders/powerFragment.glsl'

const shaders = (colorSelect, scene) => {

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

	return {
		powerMaterial,
	}
}

export default shaders