"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import CNN from "./mnist";

export default function Home() {
  return (
    <Canvas
      camera={{ position: [-6, 7, -5], fov: 30, up: [0, 0, -1] }}
      style={{ width: "100vw", height: "100vh", background: "#222" }}
    >
      <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />
      <CNN />
    </Canvas>
  );
}
