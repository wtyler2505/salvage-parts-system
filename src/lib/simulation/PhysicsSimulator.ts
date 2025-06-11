import { World, RigidBody, Collider, JointData, ImpulseJoint } from '@rapier3d/rapier3d';
import * as THREE from 'three';

export interface PhysicsProperties {
  mass: number;
  density: number;
  friction: number;
  restitution: number;
  linearDamping: number;
  angularDamping: number;
  collisionShape: 'box' | 'sphere' | 'cylinder' | 'mesh' | 'convexHull';
}

export interface GearProperties {
  teeth: number;
  module: number;
  pressureAngle: number;
  helixAngle: number;
  faceWidth: number;
  material: string;
}

export interface MotorProperties {
  type: 'dc' | 'ac' | 'stepper' | 'servo';
  maxTorque: number;
  maxSpeed: number;
  torqueCurve: Array<{ speed: number; torque: number }>;
  efficiency: number;
  inertia: number;
}

export interface SpringDamperProperties {
  springConstant: number;
  dampingCoefficient: number;
  restLength: number;
  maxCompression: number;
  maxExtension: number;
  preload: number;
}

export interface BreakableJointProperties {
  maxForce: number;
  maxTorque: number;
  stressConcentration: number;
  fatigueLimit: number;
  cycleCount: number;
}

export class PhysicsSimulator {
  private world: World;
  private rigidBodies: Map<string, RigidBody> = new Map();
  private joints: Map<string, ImpulseJoint> = new Map();
  private gearTrains: Map<string, GearTrain> = new Map();
  private motors: Map<string, Motor> = new Map();
  private springDampers: Map<string, SpringDamper> = new Map();
  private breakableJoints: Map<string, BreakableJoint> = new Map();
  private particleSystems: Map<string, ParticleSystem> = new Map();
  private softBodies: Map<string, SoftBody> = new Map();

  constructor() {
    this.world = new World({ x: 0, y: -9.81, z: 0 });
  }

  // Rigid Body Management
  createRigidBody(
    id: string, 
    position: THREE.Vector3, 
    rotation: THREE.Quaternion,
    properties: PhysicsProperties,
    geometry: THREE.BufferGeometry
  ): RigidBody {
    const rigidBodyDesc = this.world.createRigidBody({
      translation: { x: position.x, y: position.y, z: position.z },
      rotation: { x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w },
      mass: properties.mass,
      linearDamping: properties.linearDamping,
      angularDamping: properties.angularDamping
    });

    const colliderDesc = this.createColliderFromGeometry(geometry, properties);
    this.world.createCollider(colliderDesc, rigidBodyDesc);

    this.rigidBodies.set(id, rigidBodyDesc);
    return rigidBodyDesc;
  }

  private createColliderFromGeometry(geometry: THREE.BufferGeometry, properties: PhysicsProperties) {
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    const size = box.getSize(new THREE.Vector3());

    switch (properties.collisionShape) {
      case 'box':
        return this.world.createCollider({
          shape: 'cuboid',
          hx: size.x / 2,
          hy: size.y / 2,
          hz: size.z / 2,
          friction: properties.friction,
          restitution: properties.restitution,
          density: properties.density
        });
      
      case 'sphere':
        const radius = Math.max(size.x, size.y, size.z) / 2;
        return this.world.createCollider({
          shape: 'ball',
          radius,
          friction: properties.friction,
          restitution: properties.restitution,
          density: properties.density
        });
      
      case 'cylinder':
        return this.world.createCollider({
          shape: 'cylinder',
          hx: size.x / 2,
          hy: size.y / 2,
          friction: properties.friction,
          restitution: properties.restitution,
          density: properties.density
        });
      
      default:
        return this.world.createCollider({
          shape: 'cuboid',
          hx: size.x / 2,
          hy: size.y / 2,
          hz: size.z / 2,
          friction: properties.friction,
          restitution: properties.restitution,
          density: properties.density
        });
    }
  }

  // Gear Train Simulation
  createGearTrain(id: string, gears: Array<{ id: string; properties: GearProperties; position: THREE.Vector3 }>): GearTrain {
    const gearTrain = new GearTrain(id, gears);
    this.gearTrains.set(id, gearTrain);
    return gearTrain;
  }

  // Motor Simulation
  createMotor(id: string, properties: MotorProperties, attachedBodyId: string): Motor {
    const motor = new Motor(id, properties, this.rigidBodies.get(attachedBodyId)!);
    this.motors.set(id, motor);
    return motor;
  }

  // Spring-Damper Systems
  createSpringDamper(
    id: string, 
    bodyA: string, 
    bodyB: string, 
    anchorA: THREE.Vector3, 
    anchorB: THREE.Vector3,
    properties: SpringDamperProperties
  ): SpringDamper {
    const springDamper = new SpringDamper(
      id,
      this.rigidBodies.get(bodyA)!,
      this.rigidBodies.get(bodyB)!,
      anchorA,
      anchorB,
      properties
    );
    this.springDampers.set(id, springDamper);
    return springDamper;
  }

  // Breakable Joints
  createBreakableJoint(
    id: string,
    bodyA: string,
    bodyB: string,
    jointType: 'fixed' | 'revolute' | 'prismatic',
    properties: BreakableJointProperties
  ): BreakableJoint {
    const breakableJoint = new BreakableJoint(
      id,
      this.rigidBodies.get(bodyA)!,
      this.rigidBodies.get(bodyB)!,
      jointType,
      properties
    );
    this.breakableJoints.set(id, breakableJoint);
    return breakableJoint;
  }

  // Particle Systems for Fluids/Gases
  createParticleSystem(id: string, type: 'fluid' | 'gas' | 'smoke', properties: any): ParticleSystem {
    const particleSystem = new ParticleSystem(id, type, properties);
    this.particleSystems.set(id, particleSystem);
    return particleSystem;
  }

  // Soft Body Deformation
  createSoftBody(id: string, geometry: THREE.BufferGeometry, material: string): SoftBody {
    const softBody = new SoftBody(id, geometry, material);
    this.softBodies.set(id, softBody);
    return softBody;
  }

  // Simulation Step
  step(deltaTime: number): void {
    // Update motors
    this.motors.forEach(motor => motor.update(deltaTime));
    
    // Update gear trains
    this.gearTrains.forEach(gearTrain => gearTrain.update(deltaTime));
    
    // Update spring-dampers
    this.springDampers.forEach(springDamper => springDamper.update(deltaTime));
    
    // Check breakable joints
    this.breakableJoints.forEach(joint => joint.checkStress());
    
    // Update particle systems
    this.particleSystems.forEach(system => system.update(deltaTime));
    
    // Update soft bodies
    this.softBodies.forEach(softBody => softBody.update(deltaTime));
    
    // Step physics world
    this.world.step();
  }

  // Getters
  getRigidBody(id: string): RigidBody | undefined {
    return this.rigidBodies.get(id);
  }

  getGearTrain(id: string): GearTrain | undefined {
    return this.gearTrains.get(id);
  }

  getMotor(id: string): Motor | undefined {
    return this.motors.get(id);
  }
}

// Supporting Classes
class GearTrain {
  constructor(
    public id: string,
    public gears: Array<{ id: string; properties: GearProperties; position: THREE.Vector3 }>
  ) {}

  calculateGearRatio(): number {
    if (this.gears.length < 2) return 1;
    
    let ratio = 1;
    for (let i = 0; i < this.gears.length - 1; i++) {
      const drivingGear = this.gears[i];
      const drivenGear = this.gears[i + 1];
      ratio *= drivenGear.properties.teeth / drivingGear.properties.teeth;
    }
    return ratio;
  }

  update(deltaTime: number): void {
    // Update gear rotations based on input speed and gear ratios
    const ratio = this.calculateGearRatio();
    // Apply rotational constraints between meshing gears
  }
}

class Motor {
  private currentSpeed = 0;
  private currentTorque = 0;
  private targetSpeed = 0;

  constructor(
    public id: string,
    public properties: MotorProperties,
    public attachedBody: RigidBody
  ) {}

  setTargetSpeed(speed: number): void {
    this.targetSpeed = Math.min(speed, this.properties.maxSpeed);
  }

  getCurrentTorque(): number {
    // Interpolate torque from speed curve
    const curve = this.properties.torqueCurve;
    for (let i = 0; i < curve.length - 1; i++) {
      if (this.currentSpeed >= curve[i].speed && this.currentSpeed <= curve[i + 1].speed) {
        const t = (this.currentSpeed - curve[i].speed) / (curve[i + 1].speed - curve[i].speed);
        return curve[i].torque + t * (curve[i + 1].torque - curve[i].torque);
      }
    }
    return 0;
  }

  update(deltaTime: number): void {
    // Update motor speed towards target
    const speedDiff = this.targetSpeed - this.currentSpeed;
    const acceleration = speedDiff * 10; // Simple PI controller
    this.currentSpeed += acceleration * deltaTime;
    
    // Calculate current torque
    this.currentTorque = this.getCurrentTorque();
    
    // Apply torque to attached body
    const torqueVector = { x: 0, y: 0, z: this.currentTorque };
    this.attachedBody.addTorque(torqueVector, true);
  }
}

class SpringDamper {
  constructor(
    public id: string,
    public bodyA: RigidBody,
    public bodyB: RigidBody,
    public anchorA: THREE.Vector3,
    public anchorB: THREE.Vector3,
    public properties: SpringDamperProperties
  ) {}

  update(deltaTime: number): void {
    // Calculate current length and velocity
    const posA = this.bodyA.translation();
    const posB = this.bodyB.translation();
    const currentLength = Math.sqrt(
      Math.pow(posB.x - posA.x, 2) + 
      Math.pow(posB.y - posA.y, 2) + 
      Math.pow(posB.z - posA.z, 2)
    );
    
    const displacement = currentLength - this.properties.restLength;
    
    // Calculate spring force
    const springForce = -this.properties.springConstant * displacement;
    
    // Calculate damping force (simplified)
    const velA = this.bodyA.linvel();
    const velB = this.bodyB.linvel();
    const relativeVelocity = Math.sqrt(
      Math.pow(velB.x - velA.x, 2) + 
      Math.pow(velB.y - velA.y, 2) + 
      Math.pow(velB.z - velA.z, 2)
    );
    const dampingForce = -this.properties.dampingCoefficient * relativeVelocity;
    
    const totalForce = springForce + dampingForce;
    
    // Apply forces to bodies
    const direction = {
      x: (posB.x - posA.x) / currentLength,
      y: (posB.y - posA.y) / currentLength,
      z: (posB.z - posA.z) / currentLength
    };
    
    const force = {
      x: direction.x * totalForce,
      y: direction.y * totalForce,
      z: direction.z * totalForce
    };
    
    this.bodyA.addForce(force, true);
    this.bodyB.addForce({ x: -force.x, y: -force.y, z: -force.z }, true);
  }
}

class BreakableJoint {
  private broken = false;
  private stressHistory: number[] = [];

  constructor(
    public id: string,
    public bodyA: RigidBody,
    public bodyB: RigidBody,
    public jointType: string,
    public properties: BreakableJointProperties
  ) {}

  checkStress(): void {
    if (this.broken) return;

    // Calculate current stress (simplified)
    const forceA = this.bodyA.linvel();
    const forceB = this.bodyB.linvel();
    const currentStress = Math.sqrt(
      Math.pow(forceA.x - forceB.x, 2) + 
      Math.pow(forceA.y - forceB.y, 2) + 
      Math.pow(forceA.z - forceB.z, 2)
    );

    // Check immediate failure
    if (currentStress > this.properties.maxForce) {
      this.breakJoint();
      return;
    }

    // Check fatigue failure
    this.stressHistory.push(currentStress);
    if (this.stressHistory.length > 1000) {
      this.stressHistory.shift();
    }

    const cycleCount = this.calculateCycles();
    if (cycleCount > this.properties.fatigueLimit) {
      this.breakJoint();
    }
  }

  private calculateCycles(): number {
    // Simplified cycle counting using rainflow algorithm
    return this.stressHistory.length / 2;
  }

  private breakJoint(): void {
    this.broken = true;
    // Remove joint constraint
    console.log(`Joint ${this.id} has broken due to stress`);
  }

  isBroken(): boolean {
    return this.broken;
  }
}

class ParticleSystem {
  private particles: Array<{
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    life: number;
    maxLife: number;
  }> = [];

  constructor(
    public id: string,
    public type: 'fluid' | 'gas' | 'smoke',
    public properties: any
  ) {
    this.initializeParticles();
  }

  private initializeParticles(): void {
    const count = this.properties.particleCount || 1000;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ),
        life: Math.random() * 5,
        maxLife: 5
      });
    }
  }

  update(deltaTime: number): void {
    this.particles.forEach(particle => {
      // Update position
      particle.position.add(particle.velocity.clone().multiplyScalar(deltaTime));
      
      // Update life
      particle.life -= deltaTime;
      
      // Reset particle if dead
      if (particle.life <= 0) {
        particle.life = particle.maxLife;
        particle.position.set(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10
        );
      }
      
      // Apply forces based on type
      switch (this.type) {
        case 'fluid':
          // Apply viscosity and pressure forces
          particle.velocity.multiplyScalar(0.99); // Damping
          break;
        case 'gas':
          // Apply pressure and temperature effects
          particle.velocity.add(new THREE.Vector3(0, 0.1, 0)); // Buoyancy
          break;
        case 'smoke':
          // Apply convection currents
          particle.velocity.add(new THREE.Vector3(0, 0.5, 0)); // Rising
          break;
      }
    });
  }

  getParticles() {
    return this.particles;
  }
}

class SoftBody {
  private vertices: Float32Array;
  private originalVertices: Float32Array;
  private constraints: Array<{ a: number; b: number; restLength: number }> = [];

  constructor(
    public id: string,
    public geometry: THREE.BufferGeometry,
    public material: string
  ) {
    this.vertices = geometry.attributes.position.array as Float32Array;
    this.originalVertices = this.vertices.slice();
    this.createConstraints();
  }

  private createConstraints(): void {
    // Create spring constraints between nearby vertices
    const vertexCount = this.vertices.length / 3;
    
    for (let i = 0; i < vertexCount; i++) {
      for (let j = i + 1; j < vertexCount; j++) {
        const distance = this.getVertexDistance(i, j);
        if (distance < 2.0) { // Only connect nearby vertices
          this.constraints.push({
            a: i,
            b: j,
            restLength: distance
          });
        }
      }
    }
  }

  private getVertexDistance(a: number, b: number): number {
    const ax = this.vertices[a * 3];
    const ay = this.vertices[a * 3 + 1];
    const az = this.vertices[a * 3 + 2];
    
    const bx = this.vertices[b * 3];
    const by = this.vertices[b * 3 + 1];
    const bz = this.vertices[b * 3 + 2];
    
    return Math.sqrt(
      Math.pow(bx - ax, 2) + 
      Math.pow(by - ay, 2) + 
      Math.pow(bz - az, 2)
    );
  }

  update(deltaTime: number): void {
    // Apply constraint forces
    this.constraints.forEach(constraint => {
      const currentLength = this.getVertexDistance(constraint.a, constraint.b);
      const difference = currentLength - constraint.restLength;
      const force = difference * 0.1; // Spring constant
      
      // Apply force to vertices (simplified)
      const ax = this.vertices[constraint.a * 3];
      const ay = this.vertices[constraint.a * 3 + 1];
      const az = this.vertices[constraint.a * 3 + 2];
      
      const bx = this.vertices[constraint.b * 3];
      const by = this.vertices[constraint.b * 3 + 1];
      const bz = this.vertices[constraint.b * 3 + 2];
      
      const direction = {
        x: (bx - ax) / currentLength,
        y: (by - ay) / currentLength,
        z: (bz - az) / currentLength
      };
      
      const displacement = force * deltaTime;
      
      this.vertices[constraint.a * 3] += direction.x * displacement;
      this.vertices[constraint.a * 3 + 1] += direction.y * displacement;
      this.vertices[constraint.a * 3 + 2] += direction.z * displacement;
      
      this.vertices[constraint.b * 3] -= direction.x * displacement;
      this.vertices[constraint.b * 3 + 1] -= direction.y * displacement;
      this.vertices[constraint.b * 3 + 2] -= direction.z * displacement;
    });
  }

  getDeformedGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(this.vertices, 3));
    geometry.computeVertexNormals();
    return geometry;
  }
}