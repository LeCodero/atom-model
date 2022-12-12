import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Elements } from './elements.js';
export { Elements };

var NUCLEUS_PARTICLE_RADIUS = 1.75;
var ELECTRON_RADIUS = 1.5;
var NUM_PROTONS;
var NUM_NEUTRONS;
var NUM_ELECTRONS;
var COLOR_PROTON = 0xff0000;
var COLOR_NEUTRON = 0x0000ff;
var COLOR_ELECTRON = 0xfedd08;
var COLOR_LEVEL = 0xada3a4;

class Particle {
  constructor(color, size) {
    this.mesh = null;
    var geometry = new THREE.SphereGeometry(size, 32, 32);
    var material = new THREE.MeshLambertMaterial({ color: color });
    this.mesh = new THREE.Mesh(geometry, material);
  }

  rotate() {
    // rotate the proton around the x, y, and z axes
    this.mesh.position.applyAxisAngle(new THREE.Vector3(1, 0, 0), 0.01);
    this.mesh.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.01);
    this.mesh.position.applyAxisAngle(new THREE.Vector3(0, 0, 1), 0.01);
    // set the new position of the proton
    this.mesh.position.set(
      this.mesh.position.x,
      this.mesh.position.y,
      this.mesh.position.z
    );
  }
}

class Proton extends Particle {
  constructor() {
    super(COLOR_PROTON, NUCLEUS_PARTICLE_RADIUS);
  }
}

class Neutron extends Particle {
  constructor() {
    super(COLOR_NEUTRON, NUCLEUS_PARTICLE_RADIUS);
  }
}

class Electron {
  constructor(radius, angle, ring) {
    this.mesh = null;
    var geometry = new THREE.SphereGeometry(ELECTRON_RADIUS, 32, 32);
    var material = new THREE.LineBasicMaterial({ color: COLOR_ELECTRON });
    this.mesh = new THREE.Mesh(geometry, material);
    this.initialRadius = radius;
    this.initialAngle = angle;
    // Create a vector for the point on the ring we want to find
    const point = new THREE.Vector3(
      (this.initialRadius) * Math.cos(this.initialAngle),
      (this.initialRadius) * Math.sin(this.initialAngle),
      ring.position.z
    );
    this.initialPosition = point;
    point.applyAxisAngle(new THREE.Vector3(1, 0, 0), ring.rotation.x);
    point.applyAxisAngle(new THREE.Vector3(0, 1, 0), ring.rotation.y);
    point.applyAxisAngle(new THREE.Vector3(0, 0, 1), ring.rotation.z);
    // The rotated point is at the new x, y, and z coordinates of the vector
    this.mesh.position.set(
      point.x,
      point.y,
      point.z
    );
    this.point = point;
  }

  updatePosition(ring) {
    this.initialAngle += 0.01
    // Create a vector for the point on the ring we want to find
    this.point = new THREE.Vector3(
      (this.initialRadius) * Math.cos(this.initialAngle),
      (this.initialRadius) * Math.sin(this.initialAngle),
      0
    );
    this.point.applyAxisAngle(new THREE.Vector3(0, 0, 1), ring.rotation.z);
    this.point.applyAxisAngle(new THREE.Vector3(0, 1, 0), ring.rotation.y);
    this.point.applyAxisAngle(new THREE.Vector3(1, 0, 0), ring.rotation.x);
    // The rotated point is at the new x, y, and z coordinates of the vector
    this.mesh.position.set(
      this.point.x,
      this.point.y,
      this.point.z
    );
  }
}

class Nucleus {
  constructor() {
    this.protons = [];
    this.neutrons = [];
    this.mesh = new THREE.Group();
    const positions = this.calculateSpherePositions()
    for (var i = 0; i < NUM_PROTONS; i++) {
      var particle = new Proton();
      particle.mesh.position.set(positions[i][0], positions[i][1], positions[i][2]);
      this.protons.push(particle)
      this.mesh.add(particle.mesh);
    }
    for (var i = 0; i < NUM_NEUTRONS; i++) {
      var particle = new Neutron();
      particle.mesh.position.set(positions[i + NUM_PROTONS][0], positions[i + NUM_PROTONS][1], positions[i + NUM_PROTONS][2]);
      this.neutrons.push(particle)
      this.mesh.add(particle.mesh);
    }
  }

  //calculate the positions of the particles of the nucleus
  calculateSpherePositions() {
    const largeRadius = Math.cbrt((4 / 3) * Math.PI * NUCLEUS_PARTICLE_RADIUS ** 3 * NUM_NEUTRONS + NUM_PROTONS);
    const positions = [];
    for (let i = 0; i < NUM_NEUTRONS + NUM_PROTONS; i++) {
      let x, y, z, d;
      do {
        x = largeRadius * this.gaussRandom() / 2;
        y = largeRadius * this.gaussRandom() / 2;
        z = largeRadius * this.gaussRandom() / 2;
        d = Math.sqrt(x ** 2 + y ** 2 + z ** 2);

        var tooClose = false;
        for (let j = 0; j < positions.length; j++) {
          const [px, py, pz] = positions[j];
          const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2 + (z - pz) ** 2);
          if (distance < NUCLEUS_PARTICLE_RADIUS * 2) {
            tooClose = true;
            break;
          }
        }
      } while (d > largeRadius || tooClose);
      positions.push([x, y, z]);
    }
    return positions;
  }

  gaussRandom() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  rotate() {
    this.protons.forEach(function (proton) {
      proton.rotate();
    });
    this.neutrons.forEach(function (neutron) {
      neutron.rotate();
    });
  }
}

class EnergyLevel {
  constructor(numElectrons, radius, xRotation, yRotation, zRotation) {
    // create the electrons and the energy level ring
    this.electrons = [];
    this.ring = null;
    var ringGeometry = new THREE.RingGeometry(radius - 0.015, radius + 0.015, 2880);
    var ringMaterial = new THREE.LineBasicMaterial({ color: COLOR_LEVEL, transparent: true, opacity: 25 });
    this.ring = new THREE.LineLoop(ringGeometry, ringMaterial);
    this.ring.rotation.x += THREE.MathUtils.degToRad(xRotation);
    this.ring.rotation.y += THREE.MathUtils.degToRad(yRotation);
    this.ring.rotation.z += THREE.MathUtils.degToRad(zRotation);
    this.ring.position.x = 0;
    this.ring.position.y = 0;
    for (var i = 0; i < numElectrons; i++) {
      var angle = (i / numElectrons) * Math.PI * 2;
      this.electrons.push(new Electron(radius, angle, this.ring));
    }
  }

  rotate() {
    // choose a small angle to rotate around each axis
    var angleX = 0.02;
    var angleY = 0.02;
    var angleZ = 0.02;

    // create quaternions for each rotation
    var quaternionX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), angleX);
    var quaternionY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angleY);
    var quaternionZ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), angleZ);
    // apply the rotations using quaternions
    this.ring.quaternion.multiply(quaternionX);
    this.ring.quaternion.multiply(quaternionY);
    this.ring.quaternion.multiply(quaternionZ);

    var ring = this.ring
    this.electrons.forEach(function (electron) {
      electron.updatePosition(ring);
    });
  }
}

export class Atom {
  constructor(
    element,
    nucleusParticleRadius = NUCLEUS_PARTICLE_RADIUS,
    electronRadius = ELECTRON_RADIUS,
    colorProton = COLOR_PROTON,
    colorNeutron = COLOR_NEUTRON,
    colorElectron = COLOR_ELECTRON,
    colorEnergyLevel = COLOR_LEVEL,
    sceneWidth = window.innerWidth,
    sceneHeight = window.innerHeight,
    cameraDistance = 150
  ) {
    // define the scene
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, sceneWidth / sceneHeight, 1, 1000);
    this.camera.position.set(0, 0, cameraDistance);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(sceneWidth, sceneHeight);
    document.body.appendChild(this.renderer.domElement);
    var light = new THREE.AmbientLight(0xffffff);
    this.scene.add(light);
    var controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.03;
    controls.enableZoom = true;
    
    // define parameters
    NUM_PROTONS = element.protons;
    NUM_NEUTRONS = element.neutrons;
    NUM_ELECTRONS = element.electrons;
    NUCLEUS_PARTICLE_RADIUS = nucleusParticleRadius;
    ELECTRON_RADIUS = electronRadius;
    COLOR_PROTON = colorProton;
    COLOR_NEUTRON = colorNeutron;
    COLOR_ELECTRON = colorElectron;
    COLOR_LEVEL = colorEnergyLevel;

    var numElectrons = NUM_ELECTRONS
    // create the nucleus and energy levels
    this.nucleus = new Nucleus();
    this.energyLevels = [];

    var numLevel = 1;
    var radiusLevel = Math.cbrt((4 / 3) * Math.PI * NUCLEUS_PARTICLE_RADIUS ** 3 * NUM_NEUTRONS + NUM_PROTONS);
    while (numElectrons > 0) {
      radiusLevel += 10;
      if (numElectrons >= (2 * Math.pow(numLevel, 2))) {
        this.energyLevels.push(new EnergyLevel(2 * Math.pow(numLevel, 2), radiusLevel, randomIntFromInterval(20, 160), randomIntFromInterval(20, 160), randomIntFromInterval(20, 160)));
        numElectrons -= (2 * Math.pow(numLevel, 2));
        numLevel += 1
      } else {
        this.energyLevels.push(new EnergyLevel(numElectrons, radiusLevel, randomIntFromInterval(20, 160), randomIntFromInterval(20, 160), randomIntFromInterval(20, 160)));
        numLevel += 1
        numElectrons = 0;
      }
    }

    // add the nucleus and energy levels to the scene
    this.scene.add(this.nucleus.mesh);
    var scene = this.scene;
    this.energyLevels.forEach(function (level) {
      scene.add(level.ring);
      level.electrons.forEach(function (electron) {
        scene.add(electron.mesh);
      });
    });
  }

  rotate() {
    this.energyLevels.forEach(function (level) {
      level.rotate();
    });
    this.nucleus.rotate();
  }

  animate() {
    this.rotate();
    this.renderer.render(this.scene, this.camera); // call the renderer.render() method to draw the scene
    requestAnimationFrame(this.animate.bind(this));
  }
}

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}