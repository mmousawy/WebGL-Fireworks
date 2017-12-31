(() => {
	let tau = Math.PI * 2;
	let width, height;
	let scene, camera, renderer, pointCloud;

	document.addEventListener('DOMContentLoaded', onDocumentReady);
	
	function onDocumentReady(){
		initialize();
		
		renderer.render(scene, camera);
	}

	function initialize(){
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(120, 16 / 9, 1, 1000);
		renderer = new THREE.WebGLRenderer();
		document.body.appendChild(renderer.domElement);
		window.addEventListener('resize', onWindowResize);
		onWindowResize();

		scene.add(pointCloud);

		for (let i = 0; i < 1000; i++) {
			let firework = {
				position: {
					x: 0,
					y: 0,
					z: -200
				},
				velocity: {
					x: 0,
					y: 20,
					z: 0
				}
			};

			fireworks.push(firework);

			geometry.vertices.push(new THREE.Vector3(firework.position.x, firework.position.y, firework.position.z));

			render();
		}
	}

	function onWindowResize(){
		width = window.innerWidth;
		height = window.innerHeight;
		updateRendererSize();
	}

	function updateRendererSize(){
		renderer.setSize(width, height);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	}

	let material = new THREE.PointsMaterial({
		color: 0xffffcc
	});

	let geometry = new THREE.Geometry();

	let fireworks = [];

	pointCloud = new THREE.Points(geometry, material);

	function render() {
		window.requestAnimationFrame(render);

		fireworks.forEach((firework, index) => {
			firework.position.y += firework.velocity.y;

			geometry.vertices[index].add(new THREE.Vector3(firework.position.x, firework.position.y, firework.position.z));
		});
		geometry.verticesNeedUpdate = true;

		renderer.render(scene, camera);
	}
})();