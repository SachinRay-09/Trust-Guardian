import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface ThreeDGhostProps {
  threatLevel: 'low' | 'medium' | 'high';
  mousePosition: { x: number; y: number };
}

export const ThreeDGhost = ({ threatLevel, mousePosition }: ThreeDGhostProps) => {
  const ghostRef = useRef<THREE.Mesh>(null);
  const eyeLeftRef = useRef<THREE.Mesh>(null);
  const eyeRightRef = useRef<THREE.Mesh>(null);

  // Color based on threat level
  const ghostColor = useMemo(() => {
    switch (threatLevel) {
      case 'high': return '#ff1744';
      case 'medium': return '#ff9800';
      default: return '#8a2be2';
    }
  }, [threatLevel]);

  const eyeColor = useMemo(() => {
    switch (threatLevel) {
      case 'high': return '#ff0000';
      case 'medium': return '#ffff00';
      default: return '#00ffff';
    }
  }, [threatLevel]);

  // Distortion intensity based on threat
  const distortIntensity = useMemo(() => {
    switch (threatLevel) {
      case 'high': return 0.8;
      case 'medium': return 0.5;
      default: return 0.3;
    }
  }, [threatLevel]);

  // Animation
  useFrame((state) => {
    if (!ghostRef.current) return;

    const time = state.clock.getElapsedTime();
    
    // Float up and down
    ghostRef.current.position.y = Math.sin(time * 0.5) * 0.3;
    
    // Follow mouse with smooth interpolation
    const targetX = (mousePosition.x - 0.5) * 3;
    const targetZ = (mousePosition.y - 0.5) * 3;
    
    ghostRef.current.position.x += (targetX - ghostRef.current.position.x) * 0.05;
    ghostRef.current.position.z += (targetZ - ghostRef.current.position.z) * 0.05;
    
    // Gentle rotation
    ghostRef.current.rotation.y = Math.sin(time * 0.3) * 0.2;
    
    // Eyes follow mouse more directly
    if (eyeLeftRef.current && eyeRightRef.current) {
      const eyeTargetX = (mousePosition.x - 0.5) * 0.3;
      const eyeTargetY = (mousePosition.y - 0.5) * 0.3;
      
      eyeLeftRef.current.position.x = -0.3 + eyeTargetX;
      eyeLeftRef.current.position.y = 0.3 + eyeTargetY;
      
      eyeRightRef.current.position.x = 0.3 + eyeTargetX;
      eyeRightRef.current.position.y = 0.3 + eyeTargetY;
      
      // Pulse eyes
      const eyeScale = 1 + Math.sin(time * 3) * 0.1;
      eyeLeftRef.current.scale.setScalar(eyeScale);
      eyeRightRef.current.scale.setScalar(eyeScale);
    }
  });

  return (
    <group>
      {/* Ghost body */}
      <Sphere ref={ghostRef} args={[1, 32, 32]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color={ghostColor}
          transparent
          opacity={0.7}
          distort={distortIntensity}
          speed={2}
          roughness={0.4}
          metalness={0.1}
        />
      </Sphere>

      {/* Left eye */}
      <Sphere ref={eyeLeftRef} args={[0.15, 16, 16]} position={[-0.3, 0.3, 0.9]}>
        <meshStandardMaterial
          color={eyeColor}
          emissive={eyeColor}
          emissiveIntensity={2}
        />
      </Sphere>

      {/* Right eye */}
      <Sphere ref={eyeRightRef} args={[0.15, 16, 16]} position={[0.3, 0.3, 0.9]}>
        <meshStandardMaterial
          color={eyeColor}
          emissive={eyeColor}
          emissiveIntensity={2}
        />
      </Sphere>

      {/* Glow effect */}
      <pointLight
        position={[0, 0, 0]}
        intensity={threatLevel === 'high' ? 2 : 1}
        distance={5}
        color={ghostColor}
      />
    </group>
  );
};
