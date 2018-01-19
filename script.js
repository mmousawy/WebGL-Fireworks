(() => {
	'use strict';

	let tau = Math.PI * 2;
	let width, height;
	let scene, camera, renderer, points;

	let material_fireworks = new THREE.PointsMaterial({
		size: 7,
		vertexColors: THREE.VertexColors
	})

	let material_flares = new THREE.PointsMaterial({
		size: 10,
		vertexColors: THREE.VertexColors
	});

	const geometry = new THREE.Geometry();
	const flares_bundles = [];

	let fireworks = [];

	const settings = {
		gravity: -.2,
		friction: .98
	};

	const bundle_texture = THREE.ImageUtils.loadTexture( 'images/bundle_texture.png' );

	document.addEventListener('DOMContentLoaded', onDocumentReady);
	
	function onDocumentReady() {
		initialize();
		
		renderer.render(scene, camera);
	}

	function initialize() {
		scene = new THREE.Scene();
		scene.background = new THREE.Color( 0x040506 );
		camera = new THREE.PerspectiveCamera(50, 16 / 9, 1, 10000);
		camera.position.z = 2000;
		renderer = new THREE.WebGLRenderer( { preserveDrawingBuffer: true } );
		document.body.appendChild(renderer.domElement);
		window.addEventListener('resize', onWindowResize);
		onWindowResize();

		for (let i = 0; i < 2; i++) {
			let firework = {
				position: {
					x: Math.random() * width * 2.25 - width * 1.125,
					y: -1000,
					z: 0
				},
				velocity: {
					x: 0,
					y: 35 + Math.random() * 15,
					z: Math.random() * 40 - 20
				}
			};

			fireworks.push(firework);

			geometry.colors.push(new THREE.Color(1, 1, 1));
			geometry.vertices.push(new THREE.Vector3(firework.position.x, firework.position.y, firework.position.z));
		}

		points = new THREE.Points(geometry, material_fireworks);
		scene.add(points);

		render();
	}

	function onWindowResize() {
		width = window.innerWidth;
		height = window.innerHeight;
		updateRendererSize();
	}

	function updateRendererSize() {
		renderer.setSize(width, height);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	}

	function render() {
		window.requestAnimationFrame(render);

		fireworks.forEach((firework, index) => {
			firework.position.y += firework.velocity.y;
			firework.position.x += firework.velocity.x;
			firework.position.z += firework.velocity.z;

			firework.velocity.x *= settings.friction;
			firework.velocity.y *= settings.friction;
			firework.velocity.z *= settings.friction;

			firework.velocity.y += settings.gravity;

			if (firework.velocity.y < 2) {
				createBundle(firework.position);

				firework.position = {
					x: Math.random() * width * 2.25 - width * 1.125,
					y: -1000,
					z: 0
				};

				firework.velocity = {
					x: 0,
					y: 35 + Math.random() * 15,
					z: Math.random() * 40 - 20
				}

				geometry.vertices[index] = new THREE.Vector3(firework.position.x, firework.position.y, firework.position.z);
			}

			geometry.vertices[index].add(new THREE.Vector3(firework.velocity.x, firework.velocity.y, firework.velocity.z));
		});

		geometry.verticesNeedUpdate = true;

		flares_bundles.forEach((bundle, bundle_index) => {
			const flares_geometry = bundle.geometry;

			bundle.flares.forEach((flare, index) => {
				flare.position.x += flare.velocity.x;
				flare.position.y += flare.velocity.y;
				flare.position.z += flare.velocity.z;

				flare.velocity.y += settings.gravity;
				flare.velocity.x *= flare.friction;
				flare.velocity.y *= flare.friction;
				flare.velocity.z *= flare.friction;

				if (flare.ttl < 50 && Math.round(Math.random() * ((Math.random() * 50) - 50) / 50) == 0) {
					flares_geometry.colors[index] = new THREE.Color(0x040506);
				} else {
					flares_geometry.colors[index] = bundle.color;
				}

				if (flare.ttl < 0) {
					flares_geometry.colors[index] = new THREE.Color(0x040506);
				}

				flares_geometry.vertices[index].add(new THREE.Vector3(flare.velocity.x, flare.velocity.y, flare.velocity.z));
				flare.ttl--;
			});

			flares_geometry.verticesNeedUpdate = true;
			flares_geometry.colorsNeedUpdate = true;

			bundle.ttl--;

			if (bundle.ttl < 0) {
				scene.remove(bundle.points);
				bundle.points.geometry.dispose();
				bundle.points.material.dispose();
				delete flares_bundles[bundle_index];
			}
		});

		renderer.render(scene, camera);
	}

	function createBundle(position) {
		const flares_geometry = new THREE.Geometry();
		const flares = [];
		const color = new THREE.Color(.5 + Math.random(), .5 + Math.random(), .5 + Math.random());

		const sprite_material = new THREE.SpriteMaterial( { map: bundle_texture } );
		sprite_material.transparent = true;
		sprite_material.blending = THREE['AdditiveBlending'];
		const sprite = new THREE.Sprite( sprite_material );
		sprite.position.set(position.x, position.y, position.z);
		sprite.scale.set( 1, 1, 1000.0 ); // imageWidth, imageHeight
		scene.add( sprite );

		for (let i = 0; i < 300; i++) {
			const angle = Math.random()*Math.PI*2;
			let flare = {
				position: {
					x: position.x,
					y: position.y,
					z: position.z
				},
				velocity: {
					x: Math.cos(angle) * 5 * Math.random() * 10,
					y: Math.sin(angle) * 5 * Math.random() * 10,
					z: Math.random() * 10 - 5
				},
				friction: .85 + Math.random() * .1,
				ttl: Math.random() * 50 + 100
			};

			flares.push(flare);

			flares_geometry.colors.push(color);
			flares_geometry.vertices.push(new THREE.Vector3(flare.position.x, flare.position.y, flare.position.z));
		}

		const flares_points = new THREE.Points(flares_geometry, material_flares);

		flares_bundles.push({
			points: flares_points,
			geometry: flares_geometry,
			flares: flares,
			color: color,
			ttl: 150
		});

		scene.add(flares_points);
	}
})();