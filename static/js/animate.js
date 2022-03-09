import * as THREE from "https://cdn.skypack.dev/three@0.136.0";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js";

let controls, camera, renderer, scene ;
let selectable, down_selected, origin, destination, halo, all, added;
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

    // Stanton sun object properties
    let coords = [1302000, 0, 2923345];
    let radius = 696e3
    const stanton_color = 0xFF8800

    // scene lighting
    const light = new THREE.AmbientLight( stanton_color, 0.10); // sunlight 
    scene.add( light )
    const pointlight = new THREE.PointLight( stanton_color, 2 );
    pointlight.position.set(coords[0]/orbit_factor, 
                            coords[1]/orbit_factor, 
                            coords[2]/orbit_factor);
    scene.add( pointlight );

    // Set up the renderer
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    // mouse event calbacks
    document.addEventListener('dblclick', onDocumentDblClick, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);

    // cause display to resize with window
    window.addEventListener( 'resize', onWindowResize, false );

    // Mouse Camera Controls
    controls = new OrbitControls( camera, renderer.domElement );

    // onscreen text
    hud0.childNodes[0].textContent = "To begin, double-click the origin of your Quantum Travel";
    hud1.childNodes[0].textContent = "Click and drag to rotate/pan, scroll to zoom";
    hud2.childNodes[0].textContent = "Aaron Halo Intercept Calculator";

    selectable = [];
    all = [];
    const isPlanet = true;
    
    // ****************
    // geometry
    // ****************

    // Stanton star
    let body = make_orbital_body(radius,stanton_color,coords,!isPlanet,'Stanton'); 

    // Stanton marker 
    coords = [0,0,0];
    radius = 1500
    body = make_orbital_body(radius, 0xFFFFFF, coords, !isPlanet, 'Stanton Marker');
    selectable.push(body)

    // Aaron Halo
    halo = {radius: 20320e3}
    scene.add(draw_circle(halo.radius/1000, 0x00FF00, 1)); // orbit line
    all.push(halo)

    // ****************
    // planets
    // ****************

    // Hurston
    coords = [12850457,0,0];
    radius = 4000;
    body = make_orbital_body(radius, 0xFFFF00, coords, isPlanet,'Hurston');
    selectable.push(body);

    // Crusader
    coords = [-18962176, -2664960, 0];
    radius = 7450; // TODO: needs real number
    body = make_orbital_body(radius, 0xFF0000, coords, isPlanet,'Crusader');
    selectable.push(body);
    
    // Arc-corp
    coords = [18587664.74, -22151916.92, 0];
    radius = 4500; // TODO: needs real number
    body = make_orbital_body(radius, 0xFFAA88, coords, isPlanet,'ArcCorp');
    selectable.push(body);

    // Micro-Tec
    coords = [22462016.306, 37185625.646, 0]
    radius = 3500; //TODO: needs real number
    body = make_orbital_body(radius, 0xAAFFFF, coords, isPlanet,'MicroTech');
    selectable.push(body);

    // ****************
    // Lagrange Points
    // ****************
    
    const clr_lagrange = 0x808080;
    const clr_refinery = 0x00FF00;
    
    // ARC-L1
    coords = [16729134.63, -19937006.92, 8.077];
    radius = 1500;
    body = make_orbital_body(radius, clr_refinery, coords, !isPlanet, 'ARC-L1 Refinery');
    selectable.push(body);

    coords = [20446718.50, -24367450.99, 8.077];
    body = make_orbital_body(radius, clr_lagrange, coords, !isPlanet, 'ARC-L2');
    selectable.push(body);

    coords = [-25043446.88, 14458841.78, 8.077];
    body = make_orbital_body(radius, clr_lagrange, coords, !isPlanet, 'ARC-L3');
    selectable.push(body);

    coords = [28478354.91, 5021502.38, 8.077];
    body = make_orbital_body(radius, clr_lagrange, coords, !isPlanet, 'ARC-L4');
    selectable.push(body);

    coords = [-9890422.51, -27173732.22, 8.077];
    body = make_orbital_body(radius, clr_lagrange, coords, !isPlanet, 'ARC-L5');
    selectable.push(body);

    coords = [-17065957.37, -2398464, 0];
    body = make_orbital_body(radius, clr_refinery, coords, !isPlanet, 'CRU-L1 Refinery');
    selectable.push(body);
    
    coords = [18962176, 2664960,0];
    body = make_orbital_body(radius, clr_lagrange, coords, !isPlanet, 'CRU-L3');
    selectable.push(body);

    coords = [-7173168.64, -17754204.16, 0];
    body = make_orbital_body(radius, clr_lagrange, coords, !isPlanet, 'CRU-L4');
    selectable.push(body);

    coords = [-11789008.988, 15089246.107, 0];
    body = make_orbital_body(radius, clr_lagrange, coords, !isPlanet, 'CRU-L5');
    selectable.push(body);

    coords = [11565411.32, 0, 0];
    body = make_orbital_body(radius, clr_refinery, coords, !isPlanet, 'HUR-L1 Refinery');
    selectable.push(body);

    coords = [14135502.84,0,0];
    body = make_orbital_body(radius, clr_refinery, coords, !isPlanet, 'HUR-L2 Refinery');
    selectable.push(body);

    coords = [-12850457.6, -1.123, 0];
    body = make_orbital_body(radius, clr_lagrange, coords, !isPlanet, 'HUR-L3');
    selectable.push(body);

    coords = [6424228.28,11128823,80, 0];
    body = make_orbital_body(radius, clr_lagrange, coords, !isPlanet, 'HUR-L4');
    selectable.push(body);

    coords = [6425227.77, -11128823.80];
    body = make_orbital_body(radius, clr_lagrange, coords, !isPlanet, 'HUR-L5');
    selectable.push(body);

    coords = [20215824.23, 33467065.008, 0];
    body = make_orbital_body(radius, clr_refinery, coords, !isPlanet, 'MIC-L1 Refinery');
    selectable.push(body);

    down_selected = selectable.slice();
    added = [];
    origin = [];
    destination = [];
}

function make_orbital_body(radius,colour,coords,isPlanet,name) {
    let body_factor = 5
    let shadows = true
    let material = new THREE.MeshLambertMaterial( {color: colour} );
    if ( name == 'Stanton' ){
        body_factor = body_factor * 70
    }
    if (!isPlanet) {
        shadows = false
        material = new THREE.MeshBasicMaterial( {color: colour} );
    }
    const geometry = new THREE.SphereGeometry(radius/body_factor, 32, 32); // (radius, widthSegments, heightSegments)
    const sphere = new THREE.Mesh(geometry, material);
    sphere.geometry.name = name;
    sphere.receiveShadow = shadows;
    sphere.castShadow = shadows;
    sphere.translateX(coords[0]/orbit_factor);
    sphere.translateY(coords[1]/orbit_factor); // map to screen projection coods
    sphere.translateZ(coords[2]/orbit_factor);
    scene.add( sphere ); 
    all.push( sphere )
    const orbit_rad = ( coords[0] ** 2 + coords[1] ** 2 ) ** 0.5
    if (isPlanet) { scene.add(draw_circle(orbit_rad/orbit_factor,0xFFFFFF,1)) } ; // orbit line
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
    // let material = new THREE.LineBasicMaterial({ color: colour, linewidth: lineWidth });
    let material = new THREE.LineBasicMaterial({ color: colour, linewidth: lineWidth, 
                                            transparent: true, opacity: 0.35});
    let line = new THREE.Line( geometry, material );
    line.receiveShadow = true
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

function onDocumentMouseMove(event) {
    let vector = new THREE.Vector3(( event.clientX / window.innerWidth ) * 2 - 1, 
                                  -( event.clientY / window.innerHeight ) * 2 + 1, 
                                     0.5);
    vector = vector.unproject(camera);
    let raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    let spheres = []
    down_selected.forEach((item,index) => { spheres.push(item.sphere) } )
    let mousedOverSphere = raycaster.intersectObjects(spheres);

    if (mousedOverSphere.length == 0) {
        hud_popup.childNodes[0].textContent = '';
    } else {
        hud_popup.childNodes[0].textContent = mousedOverSphere[0].object.geometry.name;
        hud_popup.style.position = "absolute";
        hud_popup.style.top = (event.clientY - 40) + 'px';
        hud_popup.style.left = (event.clientX - 20) + 'px';
    }

}

function onDocumentDblClick(event) {
    let vector = new THREE.Vector3(( event.clientX / window.innerWidth ) * 2 - 1, 
                                  -( event.clientY / window.innerHeight ) * 2 + 1, 
                                     0.5);
    vector = vector.unproject(camera);
    let raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    let spheres = []
    down_selected.forEach((item,index) => { spheres.push(item.sphere) } )
    let wasClicked = raycaster.intersectObjects(spheres);

    if (wasClicked.length == 0) {
        // double-clicking empty space clears any selection
        down_selected = selectable;
        down_selected.forEach((item, index) => { item.sphere.material.transparent = false });
        added.forEach((item, index) => {
            scene.remove(item)
        })
        added = []
        origin = []
        destination = []

        // onscreen text
        hud0.childNodes[0].textContent = "To begin, double-click the origin of your Quantum Travel";
        hud1.childNodes[0].textContent = "Click and drag to rotate/pan, scroll to zoom";
        hud2.childNodes[0].textContent = "Aaron Halo Intercept Calculator";

        return
    }
    if (origin.length == 0) {
        show_routes(wasClicked)
    } else { 
        select_route(wasClicked)
    }
}

function show_routes(wasClicked) {
    let new_downselect = []
    down_selected.forEach((slctd, index) => { 
        if (slctd.sphere == wasClicked[0].object) { 
            // shade out the selected origin
            slctd.sphere.material.transparent = true;
            slctd.sphere.material.opacity = 0.25;
            slctd.halo_intersect = null;
            origin = slctd;
            return 
        }

        // calculate the intersection of selectable route with halo
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
        new_downselect.push(slctd);
        let coords = [ h_int.x , h_int.y , h_int.z];
        let body = make_orbital_body(1e3,0x00FF00,coords,0,0,'intercept');
        added.push(body.sphere)
    });
    down_selected = new_downselect;

    // onscreen text
    hud0.childNodes[0].textContent = String.prototype.concat(
        "Double-click on a valid QT destination, or on anything else to reset")
    hud1.childNodes[0].textContent = String.prototype.concat(
        "Selected QT Origin: ", wasClicked[0].object.geometry.name )
    hud2.childNodes[0].textContent = "";
}

function select_route(wasClicked) {
    down_selected.forEach((item, index) => { item.sphere.material.transparent = false });
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
    down_selected.forEach((slctd, index) => { 
        if (slctd.sphere == wasClicked[0].object) { 
            h_int = slctd.halo_intersect;
        }
    })
    let coords = [ h_int.x , h_int.y , h_int.z];
    let body = make_orbital_body(1e3,0x00FF00,coords,0,0,'intercept');
    added.push(body.sphere);
    const dest = wasClicked[0].object.clone().position.multiplyScalar(orbit_factor)
    const d_remain = h_int.clone().sub(dest).length()

    // onscreen text
    hud0.childNodes[0].textContent = String.prototype.concat(
        "Double-click on a valid QT destination, or on anything else to reset");
    let stringbase = hud1.childNodes[0].textContent.split('|')[0];
    hud1.childNodes[0].textContent = String.prototype.concat( stringbase, 
        " | Destination: ", wasClicked[0].object.geometry.name );
    hud2.childNodes[0].textContent = String.prototype.concat( 
        "Aaron Halo Intercept: Terminate QT with ", 
        d_remain.toLocaleString(undefined,{'maximumFractionDigits':0}), ' km remaining')

}

function calc_halo_intersect(ptA, ptB) {
    // ptA is the QT route origin, ptB is the QT route destination
    const len_A = ptA.length(); // distance of A from origin (ptO)
    const r = halo.radius / orbit_factor; // radius scaled to display coordinates
    let AB = ptB.clone().sub(ptA); // vector from A to B
    let nAB = AB.clone().normalize(); // normalized direction of AB vector
    const len_AB = AB.length(); // distance from A to B
    const ABdotA0 = AB.dot(ptA.clone().negate());  // dot product of vector AB and vector AO
    const ang_AB_AO = Math.acos(ABdotA0 / (len_AB * len_A)); // angle between AB and A0 
    // determine point C, which is line AB's closest point to the origin
    const len_C = len_A * Math.sin(ang_AB_AO); // distance from C to origin
    const len_AC = len_A * Math.cos(ang_AB_AO); // distance fomr A to C (along AB)
    const len_CB = len_AB - len_AC; // distance from C to B
    let ptC = ptA.clone().add(nAB.clone().multiplyScalar(len_AC)); // location of point C
    // distance from C to intersection with Aaron Halo (there are two "pt D" equidistant from C)
    const len_CD = ( r ** 2 - len_C ** 2 ) ** 0.5
    let intersect
    if ( len_C < r ) {
        // there are two intersections; if any are between A and B, choose the closer to A
        let AD1 = len_AC - len_CD;
        let AD2 = len_AC + len_CD;
        if (( len_CD < len_AC) && (AD1 > 0) && (AD1 < len_AB)) {
            intersect = ptA.clone().add(nAB.clone().multiplyScalar(AD1))
        } else if ((len_CD < len_CB) && (AD2 > 0) && AD2 < len_AB) {
            intersect = ptA.clone().add(nAB.clone().multiplyScalar(AD2))
        } else {
            intersect = null
        }
    } else if (len_C == halo.radius ) {
        // AB is tangent to the halo, single intersection
        intersect = ptC
    } else {
        // entire route lies outside the halo, no intersections
        intersect = null
    }
    if ( intersect != null ) {
        intersect.multiplyScalar(orbit_factor)
    }
    return intersect
}

