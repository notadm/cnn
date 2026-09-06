"use client";
// import { createRoot } from 'react-dom/client'
// import React, { useRef, useState, useEffect } from 'react'
// import { Canvas, useFrame } from '@react-three/fiber'
// import { animated, useSpring } from '@react-spring/web'
// import { OrbitControls, TransformControls, ContactShadows, useGLTF, useCursor,  Instances, Instance, Line } from '@react-three/drei'
// import { motion,stagger } from "framer-motion"
// import CNN from './mnist'
// import { useScramble } from 'use-scramble';
//
// export default function Home() {
//   return (
//     <Canvas
//       camera={{
//         position: [-6, 7, -5],
//         fov: 30,
//         up: [0, 0, -1],
//       }}
//       style={{ width: "100vw", height: "100vh", background: "#222222" }}
//     >
//       <OrbitControls
//         makeDefault
//         minPolarAngle={0}
//         maxPolarAngle={Math.PI / 1.75}
//         enableRotate
//         rotateSpeed={0.3}
//       />
//
//       <CNN />
//     </Canvas>
//   );
// }

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
