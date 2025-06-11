import * as THREE from 'three';

// Custom shader materials for advanced rendering effects
export const createXRayMaterial = () => {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      opacity: { value: 0.3 },
      color: { value: new THREE.Color(0x00ffff) }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float opacity;
      uniform vec3 color;
      
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      void main() {
        float fresnel = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
        float pulse = sin(time * 2.0 + vPosition.y * 0.1) * 0.5 + 0.5;
        
        vec3 finalColor = color * (fresnel + pulse * 0.3);
        gl_FragColor = vec4(finalColor, opacity * fresnel);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });
};

export const createHologramMaterial = () => {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color(0x00ff88) },
      opacity: { value: 0.6 }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 color;
      uniform float opacity;
      
      varying vec2 vUv;
      varying vec3 vNormal;
      
      void main() {
        float scanline = sin(vUv.y * 100.0 + time * 5.0) * 0.04;
        float fresnel = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
        
        vec3 finalColor = color + scanline;
        float alpha = opacity * fresnel * (0.8 + scanline);
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide
  });
};

export const createMetallicMaterial = (color: number = 0x888888) => {
  return new THREE.MeshStandardMaterial({
    color: color,
    metalness: 0.8,
    roughness: 0.2,
    envMapIntensity: 1.0
  });
};

export const createPlasticMaterial = (color: number = 0x333333) => {
  return new THREE.MeshStandardMaterial({
    color: color,
    metalness: 0.0,
    roughness: 0.7,
    clearcoat: 0.3,
    clearcoatRoughness: 0.1
  });
};

export const createGlassMaterial = (color: number = 0xffffff, opacity: number = 0.1) => {
  return new THREE.MeshPhysicalMaterial({
    color: color,
    metalness: 0.0,
    roughness: 0.0,
    transmission: 0.9,
    transparent: true,
    opacity: opacity,
    ior: 1.5,
    thickness: 0.5
  });
};