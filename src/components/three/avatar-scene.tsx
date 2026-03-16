"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import type { AvatarConfig } from "@/lib/store";

function HumanoidModel({ config }: { config: AvatarConfig }) {
  const groupRef = useRef<THREE.Group>(null);
  const primaryColor = new THREE.Color(config.primaryColor);
  const secondaryColor = new THREE.Color(config.secondaryColor);

  useFrame((state) => {
    if (groupRef.current && config.animation === "idle") {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <capsuleGeometry args={[0.4, 0.8, 8, 16]} />
        <MeshDistortMaterial
          color={primaryColor}
          speed={2}
          distort={0.1}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.1, 0]}>
        <sphereGeometry args={[config.headShape === "round" ? 0.35 : 0.3, 32, 32]} />
        <meshStandardMaterial color={primaryColor} roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.12, 1.15, 0.28]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color={secondaryColor} emissive={secondaryColor} emissiveIntensity={2} />
      </mesh>
      <mesh position={[0.12, 1.15, 0.28]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color={secondaryColor} emissive={secondaryColor} emissiveIntensity={2} />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.6, 0.15, 0]} rotation={[0, 0, 0.3]}>
        <capsuleGeometry args={[0.1, 0.5, 4, 8]} />
        <meshStandardMaterial color={secondaryColor} roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[0.6, 0.15, 0]} rotation={[0, 0, -0.3]}>
        <capsuleGeometry args={[0.1, 0.5, 4, 8]} />
        <meshStandardMaterial color={secondaryColor} roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.2, -0.8, 0]}>
        <capsuleGeometry args={[0.12, 0.4, 4, 8]} />
        <meshStandardMaterial color={secondaryColor} roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[0.2, -0.8, 0]}>
        <capsuleGeometry args={[0.12, 0.4, 4, 8]} />
        <meshStandardMaterial color={secondaryColor} roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  );
}

function RobotModel({ config }: { config: AvatarConfig }) {
  const groupRef = useRef<THREE.Group>(null);
  const primaryColor = new THREE.Color(config.primaryColor);
  const secondaryColor = new THREE.Color(config.secondaryColor);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.7, 0.9, 0.5]} />
        <meshStandardMaterial color={primaryColor} roughness={0.1} metalness={0.9} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.6, 0.5, 0.5]} />
        <meshStandardMaterial color={primaryColor} roughness={0.1} metalness={0.9} />
      </mesh>
      {/* Visor */}
      <mesh position={[0, 0.95, 0.26]}>
        <boxGeometry args={[0.45, 0.15, 0.02]} />
        <meshStandardMaterial color={secondaryColor} emissive={secondaryColor} emissiveIntensity={3} />
      </mesh>
      {/* Antenna */}
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
        <meshStandardMaterial color={secondaryColor} />
      </mesh>
      <mesh position={[0, 1.48, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color={secondaryColor} emissive={secondaryColor} emissiveIntensity={3} />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.55, 0.1, 0]}>
        <boxGeometry args={[0.15, 0.7, 0.15]} />
        <meshStandardMaterial color={secondaryColor} roughness={0.2} metalness={0.9} />
      </mesh>
      <mesh position={[0.55, 0.1, 0]}>
        <boxGeometry args={[0.15, 0.7, 0.15]} />
        <meshStandardMaterial color={secondaryColor} roughness={0.2} metalness={0.9} />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.2, -0.75, 0]}>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color={secondaryColor} roughness={0.2} metalness={0.9} />
      </mesh>
      <mesh position={[0.2, -0.75, 0]}>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color={secondaryColor} roughness={0.2} metalness={0.9} />
      </mesh>
    </group>
  );
}

function AnimalModel({ config }: { config: AvatarConfig }) {
  const groupRef = useRef<THREE.Group>(null);
  const primaryColor = new THREE.Color(config.primaryColor);
  const secondaryColor = new THREE.Color(config.secondaryColor);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh position={[0, 0, 0]} rotation={[0.2, 0, 0]}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <MeshDistortMaterial color={primaryColor} speed={1.5} distort={0.15} roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.7, 0.2]}>
        <sphereGeometry args={[0.38, 32, 32]} />
        <meshStandardMaterial color={primaryColor} roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Ears */}
      <mesh position={[-0.25, 1.1, 0.15]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.12, 0.3, 8]} />
        <meshStandardMaterial color={secondaryColor} />
      </mesh>
      <mesh position={[0.25, 1.1, 0.15]} rotation={[0, 0, 0.3]}>
        <coneGeometry args={[0.12, 0.3, 8]} />
        <meshStandardMaterial color={secondaryColor} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.13, 0.78, 0.5]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color={secondaryColor} emissive={secondaryColor} emissiveIntensity={2} />
      </mesh>
      <mesh position={[0.13, 0.78, 0.5]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color={secondaryColor} emissive={secondaryColor} emissiveIntensity={2} />
      </mesh>
      {/* Tail */}
      <mesh position={[0, 0.1, -0.6]} rotation={[0.5, 0, 0]}>
        <capsuleGeometry args={[0.06, 0.4, 4, 8]} />
        <meshStandardMaterial color={secondaryColor} />
      </mesh>
    </group>
  );
}

function AbstractModel({ config }: { config: AvatarConfig }) {
  const groupRef = useRef<THREE.Group>(null);
  const primaryColor = new THREE.Color(config.primaryColor);
  const secondaryColor = new THREE.Color(config.secondaryColor);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Core */}
      <mesh>
        <icosahedronGeometry args={[0.6, 1]} />
        <MeshDistortMaterial
          color={primaryColor}
          speed={3}
          distort={0.3}
          roughness={0.1}
          metalness={0.9}
          wireframe={false}
        />
      </mesh>
      {/* Inner glow */}
      <mesh>
        <icosahedronGeometry args={[0.4, 2]} />
        <meshStandardMaterial
          color={secondaryColor}
          emissive={secondaryColor}
          emissiveIntensity={1.5}
          transparent
          opacity={0.6}
        />
      </mesh>
      {/* Orbiting rings */}
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[0.9, 0.02, 8, 64]} />
        <meshStandardMaterial color={secondaryColor} emissive={secondaryColor} emissiveIntensity={2} />
      </mesh>
      <mesh rotation={[-Math.PI / 4, Math.PI / 4, 0]}>
        <torusGeometry args={[1.0, 0.015, 8, 64]} />
        <meshStandardMaterial color={primaryColor} emissive={primaryColor} emissiveIntensity={1} />
      </mesh>
    </group>
  );
}

function ParticleEffects({ effect, color }: { effect: string; color: string }) {
  if (effect === "none") return null;
  const particleColor = new THREE.Color(color);

  return (
    <Sparkles
      count={effect === "sparkle" ? 50 : effect === "fire" ? 80 : 30}
      scale={3}
      size={effect === "fire" ? 4 : 2}
      speed={effect === "fire" ? 2 : 0.5}
      color={particleColor}
    />
  );
}

function AvatarModel({ config }: { config: AvatarConfig }) {
  const ModelComponent = useMemo(() => {
    switch (config.bodyType) {
      case "robot": return RobotModel;
      case "animal": return AnimalModel;
      case "abstract": return AbstractModel;
      default: return HumanoidModel;
    }
  }, [config.bodyType]);

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <ModelComponent config={config} />
      <ParticleEffects effect={config.particleEffect} color={config.secondaryColor} />
    </Float>
  );
}

export function AvatarScene({ config }: { config: AvatarConfig }) {
  return (
    <div className="w-full h-full min-h-[400px] rounded-xl overflow-hidden bg-background/50 border border-border">
      <Canvas 
        camera={{ position: [0, 0.5, 3.5], fov: 45 }}
        gl={{ 
          preserveDrawingBuffer: true,
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (event) => {
            event.preventDefault();
            console.warn('WebGL context lost. Attempting to restore...');
          });
          gl.domElement.addEventListener('webglcontextrestored', () => {
            console.log('WebGL context restored.');
          });
        }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-3, 2, -3]} intensity={0.5} color={config.primaryColor} />
        <pointLight position={[3, -2, 3]} intensity={0.5} color={config.secondaryColor} />
        <AvatarModel config={config} />
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={2}
          maxDistance={6}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 1.5}
        />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
