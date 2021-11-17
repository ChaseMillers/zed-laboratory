import * as THREE from "three";


let THREEx = {}
THREEx.LaserCooked	= function(laserBeam, objects){
	// for update loop
	let updateFcts	= []
	this.update	= function(){
		updateFcts.forEach(function(updateFct){
			updateFct()	
		})
	}
	
	let object3d	= laserBeam.object3d

	// to exports last intersects
	this.lastIntersects	= []

	let raycaster	= new THREE.Raycaster()
	// TODO assume object3d.position are worldPosition. works IFF attached to scene
	raycaster.ray.origin.copy(object3d.position)

	updateFcts.push(function(){
		// get laserBeam matrixWorld
		object3d.updateMatrixWorld();
		let matrixWorld	= object3d.matrixWorld.clone()
		// set the origin
		raycaster.ray.origin.setFromMatrixPosition(matrixWorld)
		// keep only the roation
		matrixWorld.setPosition(new THREE.Vector3(0,0,0))		
		// set the direction
		raycaster.ray.direction.set(1,0,0)
			.applyMatrix4( matrixWorld )
			.normalize()

		let intersects		= raycaster.intersectObjects( objects );
		if( intersects.length > 0 ){
			let position	= intersects[0].point
			let distance	= position.distanceTo(raycaster.ray.origin)
			object3d.scale.x	= distance
			THREEx.LaserCooked.intersects = intersects
		}else{
			object3d.scale.x	= 10	
			THREEx.LaserCooked.intersects = this.lastIntersects		
		}
		// backup last intersects
		this.lastIntersects	= intersects
	}.bind(this));
}

THREEx.LaserCooked.baseURL	= '../'

export default THREEx;