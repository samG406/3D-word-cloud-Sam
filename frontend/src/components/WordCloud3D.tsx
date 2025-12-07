import { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Line } from "@react-three/drei";
import { Group, BufferGeometry, Float32BufferAttribute } from "three";

export type Word = { word: string; weight: number };

function spherePoints(count: number, radius: number): [number, number, number][] {
  const pts: [number, number, number][] = [];
  const offset = 2 / count;
  const inc = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = i * offset - 1 + offset / 2;
    const r = Math.sqrt(1 - y * y);
    const phi = i * inc;
    pts.push([
      Math.cos(phi) * r * radius,
      y * radius,
      Math.sin(phi) * r * radius,
    ]);
  }
  return pts;
}

function WordMesh({ text, size, position,}: {
  text: string;
  size: number;
  position: [number, number, number];}) {
  const ref = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const scaleRef = useRef(1.0);
  const baseY = useRef(position[1]);
  const basePosition = useRef<[number, number, number]>(position);

  useEffect(() => {
    baseY.current = position[1];
    basePosition.current = position;
  }, [position]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    
    // Gentle rotation
    ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.7) * 0.02;
    
    // Floating animation - gentle up and down movement
    const floatOffset = Math.sin(clock.getElapsedTime() * 0.8 + basePosition.current[0] * 0.1) * 0.15;
    ref.current.position.set(
      basePosition.current[0],
      baseY.current + floatOffset,
      basePosition.current[2]
    );
    
    // Smooth zoom on hover
    const targetScale = hovered ? 1.3 : 1.0;
    scaleRef.current += (targetScale - scaleRef.current) * 0.1;
    ref.current.scale.setScalar(scaleRef.current);
  });

  return (
    <group
      ref={ref}
      position={[position[0], position[1], position[2]]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Text
        fontSize={size}
        anchorX="center"
        anchorY="middle"
        color="#ffffff"
        fontWeight="600"
      >
        {text}
      </Text>
    </group>
  );
}

export function GalaxyBackground({ isStatic = false }: { isStatic?: boolean }) {
  const count = 800; // Reduced from 5000 to make it minimal

  const { positions, colors, whitePositions, whiteColors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const whitePositions: number[] = [];
    const whiteColors: number[] = [];
    let coloredCount = 0;
    
    for (let i = 0; i < count; i++) {
      // Create spiral galaxy distribution
      const radius = Math.random() * 50;
      const spinAngle = radius * 0.5;
      const branchAngle = (i % 8) / 8 * Math.PI * 2;
      
      const x = Math.cos(branchAngle + spinAngle) * radius + (Math.random() - 0.5) * 5;
      const y = (Math.random() - 0.5) * 20;
      const z = Math.sin(branchAngle + spinAngle) * radius + (Math.random() - 0.5) * 5;
      
      // Galaxy colors: blues, purples, whites
      const colorMix = Math.random();
      if (colorMix < 0.3) {
        // Blue stars
        positions[coloredCount * 3] = x;
        positions[coloredCount * 3 + 1] = y;
        positions[coloredCount * 3 + 2] = z;
        colors[coloredCount * 3] = 0.5 + Math.random() * 0.5; // R
        colors[coloredCount * 3 + 1] = 0.7 + Math.random() * 0.3; // G
        colors[coloredCount * 3 + 2] = 1.0; // B
        coloredCount++;
      } else if (colorMix < 0.6) {
        // Purple stars
        positions[coloredCount * 3] = x;
        positions[coloredCount * 3 + 1] = y;
        positions[coloredCount * 3 + 2] = z;
        colors[coloredCount * 3] = 0.7 + Math.random() * 0.3; // R
        colors[coloredCount * 3 + 1] = 0.5 + Math.random() * 0.3; // G
        colors[coloredCount * 3 + 2] = 0.8 + Math.random() * 0.2; // B
        coloredCount++;
      } else {
        // White/yellow stars - separate array for smaller size
        const brightness = 0.8 + Math.random() * 0.2;
        whitePositions.push(x, y, z);
        whiteColors.push(brightness, brightness, brightness);
      }
    }
    
    return { 
      positions: positions.slice(0, coloredCount * 3), 
      colors: colors.slice(0, coloredCount * 3),
      whitePositions: new Float32Array(whitePositions),
      whiteColors: new Float32Array(whiteColors)
    };
  }, []);

  const geometryRef = useRef<BufferGeometry>(null);
  const whiteGeometryRef = useRef<BufferGeometry>(null);
  const groupRef = useRef<Group>(null);

  useEffect(() => {
    if (geometryRef.current) {
      geometryRef.current.setAttribute('position', new Float32BufferAttribute(positions, 3));
      geometryRef.current.setAttribute('color', new Float32BufferAttribute(colors, 3));
    }
    if (whiteGeometryRef.current && whitePositions.length > 0) {
      whiteGeometryRef.current.setAttribute('position', new Float32BufferAttribute(whitePositions, 3));
      whiteGeometryRef.current.setAttribute('color', new Float32BufferAttribute(whiteColors, 3));
    }
  }, [positions, colors, whitePositions, whiteColors]);

  // Make galaxy follow camera so it appears fixed in background (skybox effect)
  // Skip this if static prop is true
  useFrame(({ camera }) => {
    if (isStatic || !groupRef.current) return;
    // Position galaxy group at camera position
    groupRef.current.position.set(
      camera.position.x,
      camera.position.y,
      camera.position.z
    );
    // Rotate galaxy group to match camera rotation (inverse so stars appear fixed)
    groupRef.current.rotation.set(
      camera.rotation.x,
      camera.rotation.y,
      camera.rotation.z
    );
  });

  return (
    <group ref={groupRef}>
      {/* Colored stars (blue and purple) */}
      <points>
        <bufferGeometry ref={geometryRef} />
        <pointsMaterial
          size={0.1}
          sizeAttenuation={true}
          vertexColors={true}
          transparent
          opacity={0.7}
        />
      </points>
      {/* White stars - very small */}
      {whitePositions.length > 0 && (
        <points>
          <bufferGeometry ref={whiteGeometryRef} />
          <pointsMaterial
            size={0.03}
            sizeAttenuation={true}
            vertexColors={true}
            transparent
            opacity={0.6}
          />
        </points>
      )}
    </group>
  );
}

const LINE_COLORS = [
  '#b794f6', // shiny purple
  '#4fd1c7', // shiny cyan/teal
  '#f6ad55', // shiny orange
  '#fc8181', // shiny coral/pink
  '#63b3ed', // shiny blue
  '#68d391', // shiny green
  '#fbbf24', // shiny yellow
  '#a78bfa', // shiny violet
  '#48bb78', // shiny emerald
  '#ed64a6', // shiny pink
];

function ConnectionLines({ 
  points, 
  nearestNeighbors = 4 
}: { 
  points: [number, number, number][]; 
  nearestNeighbors?: number;
}) {
  const connections = useMemo(() => {
    const conns: Array<{
      start: [number, number, number];
      end: [number, number, number];
      color: string;
    }> = [];
    const connectedPairs = new Set<string>();

    // For each point, find its nearest neighbors
    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      const distances: Array<{ index: number; distance: number }> = [];

      // Calculate distance to all other points
      for (let j = 0; j < points.length; j++) {
        if (i === j) continue;
        const p2 = points[j];
        const dx = p1[0] - p2[0];
        const dy = p1[1] - p2[1];
        const dz = p1[2] - p2[2];
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        distances.push({ index: j, distance });
      }

      // Sort by distance and take nearest neighbors
      distances.sort((a, b) => a.distance - b.distance);
      const neighbors = distances.slice(0, nearestNeighbors);

      // Create connections to nearest neighbors
      for (const neighbor of neighbors) {
        const j = neighbor.index;
        // Use a consistent key to avoid duplicate connections
        const pairKey = i < j ? `${i}-${j}` : `${j}-${i}`;
        
        if (!connectedPairs.has(pairKey)) {
          connectedPairs.add(pairKey);
          const colorIndex = Math.floor((i + j) % LINE_COLORS.length);
          conns.push({
            start: p1,
            end: points[j],
            color: LINE_COLORS[colorIndex],
          });
        }
      }
    }

    return conns;
  }, [points, nearestNeighbors]);

  return (
    <>
      {connections.map((conn, idx) => (
        <Line
          key={idx}
          points={[conn.start, conn.end]}
          color={conn.color}
          lineWidth={1}
          transparent
          opacity={0.5}
        />
      ))}
    </>
  );
}

export function WordCloudScene({ words }: { words: Word[] }) {
  const radius = 6;
  const points = useMemo(
    () => spherePoints(words.length || 1, radius),
    [words.length]
  );

  const sorted = useMemo(
    () => [...words].sort((a, b) => b.weight - a.weight),
    [words]
  );

  const minSize = 0.28;
  const maxSize = 1.1;

  return (
    <Canvas camera={{ position: [0, 0, 14], fov: 45 }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 10, 5]} intensity={1.1} />
      <ConnectionLines points={points} nearestNeighbors={5} />
      {sorted.map((w, i) => {
        const size = minSize + (maxSize - minSize) * (w.weight || 0);
        return (
          <WordMesh
            key={w.word + i}
            text={w.word}
            size={size}
            position={points[i % points.length]}
          />
        );
      })}
      <OrbitControls 
        enablePan={false} 
        enableZoom={true}
        enableRotate={true}
        makeDefault
      />
    </Canvas>
  );
}
