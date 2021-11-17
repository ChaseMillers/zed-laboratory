import * as THREE from "three";

const shellCooking = (
	shellBurnPercent, activelyCooking, shell, powerMaterial,
	systemOverload, debugObject, laserObjects
) => {
	let redValue = 100
	let redLightSwitch = true
	activelyCooking = false
	const isLaserOnShellCallBack=(bool)=>{activelyCooking = bool}

	const beamOnShell=(elapsedTime, shell)=>{
		// If mesh-16 'ethereum shell' is touched by laser. 
		// shellBurnPercent starts at 0 meaning grey, counting up to 100 to = Red
		if(activelyCooking){
			shellBurnPercent++ 
			// colorValueCallBacks(shellBurnPercent, redValue)

			// Color is max red at 100
			shell.material.color.set(`hsl(0, ${shellBurnPercent}%, 30% )`)
			
			// Flashy Red Warnning Lights
			if (shellBurnPercent > 200){
				if(redValue === 200) redLightSwitch = false
				if(redValue === 100) redLightSwitch = true
				// lights up red
				if(redLightSwitch && redValue < 200){
					redValue += 5
					powerMaterial.uniforms.uColorStart.value.set(`rgb(${redValue}, 0, 0)`)
					powerMaterial.uniforms.uColorEnd.value.set(`rgb(${redValue}, 0, 0)`)
				}
				// turns down red
				if(!redLightSwitch && redValue > 100){
					redValue -= 5
					powerMaterial.uniforms.uColorStart.value.set(`rgb(${redValue}, 0, 0)`)
					powerMaterial.uniforms.uColorEnd.value.set(`rgb(${redValue}, 0, 0)`)
				}	
			}
			// Final horse freak out before closing doors. 
			if (shellBurnPercent > 300){
				systemOverload(elapsedTime)
			}
			// turn off lasers shortly after power overload.
			if(shellBurnPercent > 380){
				laserObjects.forEach(laser => {
					laser.visible = false
				});
				activelyCooking = false
			}
		}
		else if(shellBurnPercent > 0){
			shellBurnPercent--
			shell.material.color.set(`hsl(0, ${shellBurnPercent}%, 30% )`)
			powerMaterial.uniforms.uColorStart.value.set(debugObject.portalColorStart)
			powerMaterial.uniforms.uColorEnd.value.set(debugObject.portalColorEnd)
		}
	}	

	return {
		beamOnShell,
		isLaserOnShellCallBack
	}
}

export default shellCooking