"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { byId, COLORS, FRAMES, UPHOLSTERY, type Config } from "@/lib/options";

/** Material that eases toward its target instead of snapping, so a colour or finish change reads as a change. */
function EasedMaterial({
  color,
  roughness,
  metalness = 0,
  sheen = 0,
  clearcoat = 0,
}: {
  color: string;
  roughness: number;
  metalness?: number;
  sheen?: number;
  clearcoat?: number;
}) {
  const ref = useRef<THREE.MeshPhysicalMaterial>(null);
  const target = useRef(new THREE.Color(color));
  target.current.set(color);
  useFrame((_, dt) => {
    const m = ref.current;
    if (!m) return;
    const k = 1 - Math.exp(-dt * 9);
    m.color.lerp(target.current, k);
    m.roughness = THREE.MathUtils.lerp(m.roughness, roughness, k);
    m.metalness = THREE.MathUtils.lerp(m.metalness, metalness, k);
    m.sheen = THREE.MathUtils.lerp(m.sheen, sheen, k);
    m.clearcoat = THREE.MathUtils.lerp(m.clearcoat, clearcoat, k);
  });
  return <meshPhysicalMaterial ref={ref} color={color} roughness={roughness} metalness={metalness} sheen={sheen} sheenColor="#ffffff" sheenRoughness={0.6} clearcoat={clearcoat} />;
}

const Box = ({
  size,
  position,
  rotation,
  children,
}: {
  size: [number, number, number];
  position: [number, number, number];
  rotation?: [number, number, number];
  children: React.ReactNode;
}) => (
  <mesh position={position} rotation={rotation} castShadow receiveShadow>
    <boxGeometry args={size} />
    {children}
  </mesh>
);

export function Chair({ config }: { config: Config }) {
  const frame = byId(FRAMES, config.frame);
  const uph = byId(UPHOLSTERY, config.upholstery);
  const color = byId(COLORS, config.color);
  const F = <EasedMaterial color={frame.color} roughness={frame.roughness} metalness={frame.metalness} />;
  const U = <EasedMaterial color={color.hex} roughness={uph.roughness} sheen={uph.sheen} clearcoat={uph.id === "leather" ? 0.25 : 0} />;
  const tilt = -0.14;

  return (
    <group>
      {/* upholstered seat and back */}
      <RoundedBox args={[0.58, 0.11, 0.54]} radius={0.045} smoothness={5} position={[0, 0.47, 0.02]} castShadow receiveShadow>
        {U}
      </RoundedBox>
      <RoundedBox args={[0.58, 0.5, 0.09]} radius={0.045} smoothness={5} position={[0, 0.8, -0.25]} rotation={[tilt, 0, 0]} castShadow receiveShadow>
        {U}
      </RoundedBox>

      {/* seat rail and back posts */}
      <Box size={[0.5, 0.04, 0.46]} position={[0, 0.405, 0.02]}>
        {F}
      </Box>
      {[-0.28, 0.28].map((x) => (
        <Box key={x} size={[0.04, 0.62, 0.04]} position={[x, 0.7, -0.275]} rotation={[tilt, 0, 0]}>
          {F}
        </Box>
      ))}

      {/* base */}
      {config.base === "legs" &&
        [
          [-0.22, -0.2],
          [0.22, -0.2],
          [-0.22, 0.22],
          [0.22, 0.22],
        ].map(([x, z]) => (
          <mesh key={`${x}${z}`} position={[x, 0.2, z]} rotation={[z > 0 ? -0.09 : 0.09, 0, x > 0 ? 0.07 : -0.07]} castShadow receiveShadow>
            <cylinderGeometry args={[0.024, 0.017, 0.42, 20]} />
            {F}
          </mesh>
        ))}
      {config.base === "sled" && (
        <>
          {[-0.235, 0.235].map((x) => (
            <group key={x}>
              <Box size={[0.035, 0.035, 0.6]} position={[x, 0.0175, 0]}>
                {F}
              </Box>
              <Box size={[0.035, 0.4, 0.035]} position={[x, 0.2, 0.21]}>
                {F}
              </Box>
              <Box size={[0.035, 0.4, 0.035]} position={[x, 0.2, -0.2]}>
                {F}
              </Box>
            </group>
          ))}
          <Box size={[0.47, 0.03, 0.03]} position={[0, 0.3, 0.21]}>
            {F}
          </Box>
        </>
      )}
      {config.base === "pedestal" && (
        <>
          <mesh position={[0, 0.21, 0.02]} castShadow receiveShadow>
            <cylinderGeometry args={[0.035, 0.045, 0.4, 32]} />
            {F}
          </mesh>
          <mesh position={[0, 0.016, 0.02]} castShadow receiveShadow>
            <cylinderGeometry args={[0.28, 0.3, 0.032, 64]} />
            {F}
          </mesh>
        </>
      )}

      {/* armrests */}
      {config.arms &&
        [-0.335, 0.335].map((x) => (
          <group key={x}>
            <Box size={[0.06, 0.035, 0.46]} position={[x, 0.66, -0.02]}>
              {F}
            </Box>
            <Box size={[0.04, 0.2, 0.04]} position={[x, 0.56, 0.19]}>
              {F}
            </Box>
          </group>
        ))}
    </group>
  );
}
