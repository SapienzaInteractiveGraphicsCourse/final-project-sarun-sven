import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';
import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';


let scene, camera, renderer, cube, light, ambientlight, plane;
let loaded_model, leftarm , lefForeArm, rightarm, rightForeArm, leftupleg, leftlowleg, rightupleg, rightlowleg, leftFoot, rightFoot;

var near = 0.1;
var far = 1000;
var fov = 80;

var theta =             [20, 0, 0, 20, 0, 0,        3.5, 1, 2.5, 0];
var theta_end =         [20, -0.5, -1, 20, -0.5, 0, 2.5, 0, 2.5, 0];
var theta_start =       [20, 0.5, 0, 20, 0.5, 1,    3.5, 1, 3.5, 1];
var decrease_theta =    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0];
var increase_theta =    [0, 1, 1, 0, 1, 1, 0, 1, 1, 1];

var walk = false;

var keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
  };

function initialize(){
    //Renderer
    renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
    renderer.setClearColor("#e5e5e5");
    renderer.setSize( window.innerWidth, window.innerHeight );
    
    document.body.appendChild( renderer.domElement );

    //Camera
    camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, near, far );
    camera.position.set(75, 20, 0);

    //scene
    scene = new THREE.Scene();

    //Light
    light = new THREE.DirectionalLight(0xFFFFFF, .7);
    light.position.set(100, 200, 100);
    light.target.position.set(0,0,0);
    light.castShadow = true;
    light.shadow.bias = -0.01;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = near;
    light.shadow.camera.far = far;
    light.shadow.camera.left = 400;
    light.shadow.camera.right = -400;
    light.shadow.camera.top = 400;
    light.shadow.camera.bottom = -400; 
    scene.add(light);

    ambientlight = new THREE.AmbientLight(0x404040);
    scene.add(ambientlight);

    //Responsive canvas size
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;

        // camera.updateProjectMatrix();
    });

    //Cube
    load_cube();

    //controls
    let controls = new OrbitControls(camera, renderer.domElement);
    // controls.addEventListener('change', renderer);

    //skybox background
    scene.background=new THREE.CubeTextureLoader().setPath("skybox_img/").load(["mystic_lf.jpg","mystic_rt.jpg","mystic_up.jpg","mystic_dn.jpg","mystic_ft.jpg","mystic_bk.jpg"]);

    //plane
    plane = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100, 1, 1),
        new THREE.MeshPhongMaterial({color: 0xFFFFFF})
    );
    plane.castShadow = true;
    plane.recieveShadow = true;
    plane.rotation.x = -Math.PI/2;
    plane.position.y = -20;
    scene.add(plane);

    //model
    const loader = new GLTFLoader().load( 'models/Soldier.glb', function ( gltf ) {
        loaded_model = gltf.scene;
        loaded_model.castShadow = true;
        loaded_model.traverse(function (node) {
            if (node.isMesh) {
              node.castShadow = true;
              node.receiveShadow = true;
            }
        });
        loaded_model.scale.setScalar(10);
        loaded_model.position.set(0,-20,0);
        scene.add(loaded_model);

        leftarm = loaded_model.getObjectByName('mixamorigLeftArm');
        lefForeArm = loaded_model.getObjectByName('mixamorigLeftForeArm');
        rightarm = loaded_model.getObjectByName('mixamorigRightArm');
        rightForeArm = loaded_model.getObjectByName('mixamorigRightForeArm');
        leftupleg = loaded_model.getObjectByName('mixamorigLeftUpLeg');
        leftlowleg = loaded_model.getObjectByName('mixamorigLeftLeg');
        rightupleg = loaded_model.getObjectByName('mixamorigRightUpLeg');
        rightlowleg = loaded_model.getObjectByName('mixamorigRightLeg');
        leftFoot = loaded_model.getObjectByName('mixamorigLeftFoot');
        rightFoot = loaded_model.getObjectByName('mixamorigRightFoot');

        //rotation of the modelobject for correct start orientation
        leftarm.rotation.z = theta[0];
        rightarm.rotation.z = theta[0];
        
        animate();
        
           
    });
    
    

    document.addEventListener('keydown', (e) => onKeyDown(e), false);
    document.addEventListener('keyup', (e) => onKeyUp(e), false);
}

//character control
function animate() {

    const Q = new THREE.Quaternion();
    const A = new THREE.Vector3();
    const R = loaded_model.quaternion.clone();
    walk = false;
    
    requestAnimationFrame( animate );
    if(keys.forward){
        walk = true;
        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyQuaternion(R);
        forward.normalize();
        loaded_model.position.z -= forward.z * 0.7;
        loaded_model.position.x -= forward.x * 0.7;
    }
    if(keys.backward){
        walk = true;
        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyQuaternion(R);
        forward.normalize(); 
        loaded_model.position.z += forward.z * 0.7;
        loaded_model.position.x += forward.x * 0.7;  
    }
    if(keys.left){
        walk = true;
        A.set(0, 1, 0);
        Q.setFromAxisAngle(A, 4.0 * Math.PI * 0.01);
        R.multiply(Q);
        loaded_model.quaternion.copy(R);
    }
    if(keys.right){
        walk = true;
        A.set(0, 1, 0);
        Q.setFromAxisAngle(A, -4.0 * Math.PI * 0.01);
        R.multiply(Q);
        loaded_model.quaternion.copy(R);
    }
    
    update(walk);
    renderer.render( scene, camera );
}



function update(walk){
    
    if(walk){
        //left arm
        setanitmaion_interval(1, 0.01, true, 2);
        setanitmaion_interval(2, 0.01, true, 2);
        leftarm.rotation.y = theta[1];
        lefForeArm.rotation.x = theta[2];
        
        // //right arm
        setanitmaion_interval(4, 0.01, true, 2);
        setanitmaion_interval(5, 0.01, true, 2);
        rightarm.rotation.y = theta[4];
        rightForeArm.rotation.x = theta[5];

        //left leg
        setanitmaion_interval(6, 0.01, true, 2);
        setanitmaion_interval(7, 0.01, true, 2);
        leftupleg.rotation.x = theta[6];
        leftlowleg.rotation.x = theta[7];

        //right leg
        setanitmaion_interval(8, 0.01, true, 2);
        setanitmaion_interval(9, 0.01, true, 2);
        rightupleg.rotation.x = theta[8];
        rightlowleg.rotation.x = theta[9];
    }
    cube.rotation.y += 0.05;
    cube.rotation.x += 0.05;
}

function setanitmaion_interval(id, deltaTime, enable_descreace, speed){
    
    if(increase_theta[id] == 1){
        theta[id] += speed*deltaTime;
        
        if(theta[id] > theta_start[id]){
            
            increase_theta[id] = 0;
            decrease_theta[id] = 1;
        }
    }
    else if(decrease_theta[id] == 1){
        
        theta[id] -= speed*deltaTime;
        if(theta[id] < theta_end[id]){
            decrease_theta[id] = 0;
            increase_theta[id] = 1;
        }
    }
}

function onKeyDown(event) {
    switch (event.keyCode) {
      case 87: // w
        keys.forward = true;
        break;
      case 65: // a
        keys.left = true;
        break;
      case 83: // s
        keys.backward = true;
        break;
      case 68: // d
        keys.right = true;
        break;
    }
}

function onKeyUp(event) {
    switch (event.keyCode) {
        case 87: // w
            keys.forward = false;
            break;
        case 65: // a
            keys.left = false;
            break;
        case 83: // s
            keys.backward = false;
            break;
        case 68: // d
            keys.right = false;
            break; 
    }
}

//function to print scene graph of the model https://r105.threejsfundamentals.org/threejs/lessons/threejs-load-gltf.html
function dumpObject(obj, lines = [], isLast = true, prefix = '') {
    const localPrefix = isLast ? '└─' : '├─';
    lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);
    const newPrefix = prefix + (isLast ? '  ' : '│ ');
    const lastNdx = obj.children.length - 1;
    obj.children.forEach((child, ndx) => {
      const isLast = ndx === lastNdx;
      dumpObject(child, lines, isLast, newPrefix);
    });
    return lines;
}

function load_cube() {
    const geometry = new THREE.BoxGeometry( 5, 5, 5 );
    const material = new THREE.MeshPhongMaterial( { color: 0xFFAD0 } );
    cube = new THREE.Mesh( geometry, material );
    cube.position.z = -5;
    cube.position.y = -15;
    cube.castShadow = true;
    cube.recieveShadow = true;
    scene.add( cube );
}

initialize();



