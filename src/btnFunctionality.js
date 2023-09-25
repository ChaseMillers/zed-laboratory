import gsap from 'gsap'

const btnFunctionality = (
	btns, btnGreen, btnBlue, btnLeft, btnRight, 
	btnRed, sceneMaterial, btnLeftRightSwitch, beforePowerBtns,
	redLaserActivation, debugObject, colorSelect, powerMaterial,
	doorSwitch, rightDoor, leftDoor, btnMaterial, lasersSwitch, 
	btnsSlectionCallBack, disableLasers) => {
	
    /************************ 
	CLOSE DOOR BTN PREP
	*************************/
	const btnsClosedDoor=(btnGreen, btnBlue, btnLeft, btnRight, btnRed)=>{
		// Disable remaining Btns
		btns = [btnGreen]
		// Change material back
		beforePowerBtns = [ btnRed, btnBlue, btnLeft, btnRight]
		for (let i =0; i<beforePowerBtns.length; ++i){
			beforePowerBtns[i].material = sceneMaterial
			beforePowerBtns[i].position.y = -.0206
			beforePowerBtns[i].position.z = -.0103
		}
		// turn off arrows switch
		btnLeftRightSwitch = undefined
		doorSwitch = false
		btnsSlectionCallBack(btns, btnLeftRightSwitch, doorSwitch)
		disableLasers()
	}

	/************************ 
	Button Activation Logic
	*************************/
	
	const btnLogic = (pressedBtn, btnGreen, btnBlue, btnLeft, btnRight, btnRed, rightDoor, leftDoor, btnMaterial) =>{

		//Left Arrow - "mesh_7"
		if(pressedBtn.name === 'mesh_7'){
			disableLasers()
			btnLeftRightSwitch === 'right' || btnLeftRightSwitch === undefined?
				btnLeftRightSwitch = 'left'
			: btnLeftRightSwitch = undefined
			btnsSlectionCallBack(btns, btnLeftRightSwitch, doorSwitch)
		}
		
		//Right Arrow - "mesh_8"
		else if(pressedBtn.name === 'mesh_8'){
			disableLasers()
			btnLeftRightSwitch === 'left' || btnLeftRightSwitch === undefined?
				btnLeftRightSwitch = 'right'
			: btnLeftRightSwitch = undefined
			btnsSlectionCallBack(btns, btnLeftRightSwitch)
		}

		// Blue Btn - "mesh_6"
		else if(pressedBtn.name === 'mesh_6'){
			let randomInt = Math.floor(Math.random() * 9) // select random number
			
			debugObject.portalColorStart = colorSelect[randomInt]
			randomInt = Math.floor(Math.random() * 9) // select another random number
			debugObject.portalColorEnd = colorSelect[randomInt]
			
			// Change color based on random choice
			powerMaterial.uniforms.uColorStart.value.set(debugObject.portalColorStart)
			powerMaterial.uniforms.uColorEnd.value.set(debugObject.portalColorEnd)
		}
		
		// Red Btn "mesh_5"
		else if(pressedBtn.name === 'mesh_5'){
			btnLeftRightSwitch = undefined
			redLaserActivation()
			btnsSlectionCallBack(btns, btnLeftRightSwitch)
		}
		

		// Green Btn "mesh_4"
		else if(pressedBtn.name === 'mesh_4'){
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
				btnsSlectionCallBack(btns, btnLeftRightSwitch, doorSwitch)
			}
			else {
				gsap.to(leftDoor.position, { duration: 1, delay: 0, x: 0 })
				gsap.to(rightDoor.position, { duration: 1, delay: 0, x: 0 })

				btnsClosedDoor(btnGreen, btnBlue, btnLeft, btnRight, btnRed)
				disableLasers()
			}
		}
	}
	
	return {
		btnsClosedDoor,
		btnLogic
	}
}

export default btnFunctionality
