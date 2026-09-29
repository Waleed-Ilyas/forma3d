"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { useStore } from "zustand";
import type { Config } from "@/lib/options";
import { Chair } from "./Chair";
import { useConfigStore } from "./ConfigProvider";

export type CaptureFn = () => string | null;

/** Hands the parent a function that renders one fresh frame and returns it as a PNG data URL. */
function CaptureBridge({ capture }: { capture: React.MutableRefObject<CaptureFn | null> }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    capture.current = () => {
      gl.render(scene, camera);
      return gl.domElement.toDataURL("image/png");
    };
    return () => {
      capture.current = null;
    };
  }, [gl, scene, camera, capture]);
  return null;
}

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function Scene({ capture }: { capture: React.MutableRefObject<CaptureFn | null> }) {
  const store = useConfigStore();
  const frame = useStore(store, (s) => s.frame);
  const upholstery = useStore(store, (s) => s.upholstery);
  const color = useStore(store, (s) => s.color);
  const base = useStore(store, (s) => s.base);
  const arms = useStore(store, (s) => s.arms);
  const config = useMemo<Config>(() => ({ frame, upholstery, color, base, arms }), [frame, upholstery, color, base, arms]);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [spin, setSpin] = useState(true);
  const [narrow, setNarrow] = useState(false);
  const reduced = useRef(false);

  useEffect(() => {
    setSupported(webglAvailable());
    setNarrow(window.innerWidth < 640);
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced.current) setSpin(false);
  }, []);

  if (supported === false) {
    return (
      <div role="alert" className="grid h-full place-items-center p-8 text-center">
        <div>
          <p className="font-medium">This browser cannot run 3D graphics (WebGL).</p>
          <p className="mt-1 text-sm text-ink-2">The options and the live price still work. Try a current version of Chrome, Edge, Safari or Firefox to see the chair.</p>
        </div>
      </div>
    );
  }

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: narrow ? [1.75, 1.15, 2.75] : [1.5, 1.05, 2.1], fov: 34 }}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      aria-label="Interactive 3D lounge chair. Drag to rotate, scroll or pinch to zoom."
    >
      <color attach="background" args={["#e9e4d8"]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[2.5, 4, 2]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} />
      {/* studio lighting built from light panels, so no HDR file is downloaded */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2.2} position={[0, 4, -3]} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[-4, 1.5, 2]} scale={[3, 5, 1]} />
        <Lightformer form="rect" intensity={1.4} position={[4, 2, 1]} scale={[3, 5, 1]} />
        <Lightformer form="circle" intensity={1} position={[0, 0.2, 5]} scale={4} />
      </Environment>
      <group position={[0, 0, 0]}>
        <Chair config={config} />
      </group>
      <ContactShadows position={[0, 0.001, 0]} opacity={0.5} scale={4} blur={2.6} far={1.4} />
      <OrbitControls
        target={[0, narrow ? 0.42 : 0.5, 0]}
        enablePan={false}
        minDistance={1.3}
        maxDistance={3.6}
        maxPolarAngle={Math.PI / 2.03}
        autoRotate={spin}
        autoRotateSpeed={1.1}
        onStart={() => setSpin(false)}
      />
      <CaptureBridge capture={capture} />
    </Canvas>
  );
}
