import * as THREE from "https://cdn.skypack.dev/three@0.136.0";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js";

let controls, camera, renderer, scene ;
let selectable, origin, destination, halo, all, added;
let orbit_factor = 1000;

init();
requestAnimationFrame( animate );

function init() {
    // Create the scene & background
    scene = new THREE.Scene();
    const bgcolor = 0x000000
    scene.background = new THREE.Color( bgcolor )

    // set up the camera
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 4e8);
    camera.position.x = 0
    camera.position.y = -8e4;
    camera.position.z = 3e4;

    // Set up the renderer
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    // Event calbacks
    document.addEventListener('dblclick', onDocumentDblClick, false);

    // cause display to resize with window
    window.addEventListener( 'resize', onWindowResize, false );

    // scene lighting
    const light = new THREE.AmbientLight( 0xffffff, 0.5 ); // soft white
    scene.add( light )
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.position.set( 0, 100, 0 );
    scene.add( directionalLight );

    // Mouse Camera Controls
    controls = new OrbitControls( camera, renderer.domElement );

    // ****************
    // geometry
    // ****************
    
    // Stanton
    let coords = [1302000, 0, 2923345];
    let radius = 696e3
    let stanton = make_orbital_body(radius,0xFF8800,coords,0,'stanton'); 

    // Hurston
    coords = [12850457,0,0];
    radius = 4000
    let hurston = make_orbital_body(radius, 0xFFFF00, coords, 1,'hurston');

    // Crusader
    coords = [-18962176, -2664960, 0];
    radius = 7450 // TODO: needs real number
    let crusader = make_orbital_body(radius, 0xFF0000, coords, 1,'crusader');
    
    // Arc-corp
    coords = [18587664.74, -22151916.92, 0];
    radius = 4500 // TODO: needs real number
    let arccorp = make_orbital_body(radius, 0xFFAA88, coords, 1,'arccorp');
    
    // Micro-Tec
    coords = [22462016.306, 37185625.646, 0]
    radius = 3500 //TODO: needs real number
    let microtec = make_orbital_body(radius, 0xAAFFFF, coords, 1,'microtec');

    // Aaron Halo
    halo = {radius: 20320e3}
    scene.add(draw_circle(halo.radius/1000, 0x00FF00, 1)); // orbit line

    all = {stanton: stanton, hurston: hurston, crusader:crusader, 
                  arccorp: arccorp, microtec: microtec, halo: halo}
    selectable = [hurston, crusader, arccorp, microtec]
    added = []
    origin = []
    destination = []
}

function make_orbital_body(radius,colour,coords,show_orbit,name) {
    let body_factor = 5
    if (name == 'stanton'){
        body_factor = body_factor * 50
    }
    const geometry = new THREE.SphereGeometry(radius/body_factor, 32, 32); // (radius, widthSegments, heightSegments)
    const material = new THREE.MeshBasicMaterial( {color: colour} );
    const sphere = new THREE.Mesh(geometry, material);
    sphere.geometry.name = name;
    sphere.translateX(coords[0]/orbit_factor);
    sphere.translateY(coords[1]/orbit_factor); // map to screen projection coods
    sphere.translateZ(coords[2]/orbit_factor);
    scene.add( sphere ); 
    const orbit_rad = ( coords[0] ** 2 + coords[1] ** 2 ) ** 0.5
    if (show_orbit) { scene.add(draw_circle(orbit_rad/orbit_factor,0xFFFFFF,1)) } ; // orbit line
    return {orbit_rad: orbit_rad, sphere: sphere, xyz_coords: coords};
}

function draw_circle(radius, colour, lineWidth){
    let points = [];
    // 360 full circle will be drawn clockwise
    for(let i = 0; i <= 360; i++){
        points.push( new THREE.Vector3( 
            Math.sin(i*(Math.PI/180)) * radius, 
            Math.cos(i*(Math.PI/180)) * radius, 
            0));
    }
    let geometry = new THREE.BufferGeometry().setFromPoints( points );
    let material = new THREE.LineBasicMaterial({ color: colour, linewidth: lineWidth });
    let line = new THREE.Line( geometry, material );
    return line
}

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate(t_currentframe) {
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
}

function onDocumentDblClick(event) {
    let vector = new THREE.Vector3(( event.clientX / window.innerWidth ) * 2 - 1, 
                                  -( event.clientY / window.innerHeight ) * 2 + 1, 
                                     0.5);
    vector = vector.unproject(camera);
    let raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    let spheres = []
    selectable.forEach((item,index) => { spheres.push(item.sphere) } )
    let wasClicked = raycaster.intersectObjects(spheres);

    if (wasClicked.length == 0) {
        // double-clicking empty space clears any selection
        selectable = [all.hurston, all.crusader, all.arccorp, all.microtec]
        selectable.forEach((item, index) => { item.sphere.material.transparent = false });
        added.forEach((item, index) => {
            scene.remove(item)
        })
        added = []
        origin = []
        destination = []
        return
    }
    if (origin.length == 0) {
        show_routes(wasClicked)
    } else { 
        select_route(wasClicked)
    }
}

function show_routes(wasClicked) {
    let new_selectable = []
    selectable.forEach((slctd, index) => { 
        if (slctd.sphere == wasClicked[0].object) { 
            slctd.sphere.material.transparent = true;
            slctd.sphere.material.opacity = 0.25;
            slctd.halo_intersect = null;
            origin = slctd;
            return 
        }

        let h_int = calc_halo_intersect(wasClicked[0].object.position, slctd.sphere.position);
        if (h_int == null) { 
            // no intersections with the halo
            slctd.sphere.material.transparent = true;
            slctd.sphere.material.opacity = 0.25;
            slctd.halo_intersect = null;
            return 
        } 
        slctd.sphere.material.transparent = false;
        slctd.sphere.material.opacity = 1.0;
        let points = [wasClicked[0].object.position, slctd.sphere.position]
        let geometry = new THREE.BufferGeometry().setFromPoints( points );
        let material = new THREE.LineBasicMaterial({ color: 0x00FF00, linewidth: 1});
        let line = new THREE.Line( geometry, material );
        scene.add(line);
        added.push(line)
        slctd.halo_intersect = h_int;
        new_selectable.push(slctd);
        let coords = [ h_int.x , h_int.y , h_int.z];
        let body = make_orbital_body(5000,0x00FF00,coords,0,'int');
        added.push(body.sphere)
    });
    selectable = new_selectable;
}

function select_route(wasClicked) {
    console.log('test')
    selectable.forEach((item, index) => { item.sphere.material.transparent = false });
    added.forEach((item, index) => {
        scene.remove(item)
    })
    added = []
    let points = [wasClicked[0].object.position, origin.sphere.position]
    let geometry = new THREE.BufferGeometry().setFromPoints( points );
    let material = new THREE.LineBasicMaterial({ color: 0x00FF00, linewidth: 1});
    let line = new THREE.Line( geometry, material );
    scene.add(line);
    added.push(line)
    let h_int
    selectable.forEach((slctd, index) => { 
        if (slctd.sphere == wasClicked[0].object) { 
            h_int = slctd.halo_intersect;
        }
    })
    let coords = [ h_int.x , h_int.y , h_int.z];
    let body = make_orbital_body(5000,0x00FF00,coords,0,'int');
    added.push(body.sphere)
}

function calc_halo_intersect(ptA, ptB) {
    const len_A = ptA.length();
    const r = halo.radius / orbit_factor;
    let AB = ptB.clone().sub(ptA);
    let nAB = AB.clone().normalize();
    const len_AB = AB.length();
    const ABdotA0 = AB.dot(ptA.clone().negate()); 
    const ang_AB_A = Math.acos(ABdotA0 / (len_AB * len_A));
    // point c is line AB's closest point to the origin
    const len_C = len_A * Math.sin(ang_AB_A); 
    const len_AC = len_A * Math.cos(ang_AB_A);
    const len_CB = len_AB - len_AC;
    let ptC = ptA.clone().add(nAB.clone().multiplyScalar(len_AC));
    const len_CD = ( r ** 2 - len_C ** 2 ) ** 0.5
    let c1
    if ( len_C < r ) {
        // two intersections
        if (len_CD < len_AC) {
            c1 = ptA.clone().add(nAB.clone().multiplyScalar(len_AC - len_CD))
        } else if (len_CD < len_CB) {
            c1 = ptA.clone().add(nAB.clone().multiplyScalar(len_AC + len_CD))
        } else {
            c1 = null
        }
    } else if (OC > halo.radius ) {
        // no intersections
        c1 = null
    } else {
        // single
        c1 = ptC
    }
    if ( c1 != null ) {
        c1.multiplyScalar(orbit_factor)
    }
    return c1
}

