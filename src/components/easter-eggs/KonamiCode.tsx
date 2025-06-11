import React, { useEffect, useState } from 'react';
import * as THREE from 'three';

interface KonamiCodeProps {
  onActivate: () => void;
  scene: THREE.Scene;
}

const KonamiCode: React.FC<KonamiCodeProps> = ({ onActivate, scene }) => {
  const [sequence, setSequence] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [particles, setParticles] = useState<THREE.Points | null>(null);

  const konamiSequence = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isActive) return;

      const newSequence = [...sequence, event.code].slice(-konamiSequence.length);
      setSequence(newSequence);

      // Check if sequence matches
      if (newSequence.length === konamiSequence.length) {
        const matches = newSequence.every((key, index) => key === konamiSequence[index]);
        
        if (matches) {
          activateEasterEgg();
        } else {
          // Reset if sequence is wrong
          setSequence([]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sequence, isActive]);

  const activateEasterEgg = () => {
    setIsActive(true);
    createParticleEffect();
    onActivate();

    // Play sound effect
    playSound();

    // Reset after 10 seconds
    setTimeout(() => {
      setIsActive(false);
      setSequence([]);
      if (particles) {
        scene.remove(particles);
        setParticles(null);
      }
    }, 10000);
  };

  const createParticleEffect = () => {
    const particleCount = 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Random positions
      positions[i3] = (Math.random() - 0.5) * 20;
      positions[i3 + 1] = (Math.random() - 0.5) * 20;
      positions[i3 + 2] = (Math.random() - 0.5) * 20;

      // Rainbow colors
      const hue = Math.random();
      const color = new THREE.Color().setHSL(hue, 1, 0.5);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      // Random velocities
      velocities[i3] = (Math.random() - 0.5) * 0.1;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.1;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
    setParticles(particleSystem);

    // Animate particles
    const animate = () => {
      if (!particleSystem.parent) return;

      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      const velocities = particleSystem.geometry.attributes.velocity.array as Float32Array;

      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i];
        positions[i + 1] += velocities[i + 1];
        positions[i + 2] += velocities[i + 2];

        // Add some gravity and turbulence
        velocities[i + 1] -= 0.001;
        velocities[i] += (Math.random() - 0.5) * 0.001;
        velocities[i + 2] += (Math.random() - 0.5) * 0.001;
      }

      particleSystem.geometry.attributes.position.needsUpdate = true;
      particleSystem.rotation.y += 0.01;

      requestAnimationFrame(animate);
    };

    animate();
  };

  const playSound = () => {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  return (
    <>
      {isActive && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-pulse">
            🎉 KONAMI CODE ACTIVATED! 🎉
          </div>
        </div>
      )}
      
      {/* Debug sequence display (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black/50 text-white p-2 rounded text-xs font-mono">
          Sequence: {sequence.join(' ')}
          <br />
          Target: {konamiSequence.join(' ')}
        </div>
      )}
    </>
  );
};

export default KonamiCode;