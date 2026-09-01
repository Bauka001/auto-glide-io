import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";

/** Placeholder path — replace {{CAR_MODEL_FILE}} with the real GLB file name. */
export const MODEL_URL = "/models/car.glb";

function CarModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} position={[0, 0, 0]} />;
}

/** Cinematic dolly-in from a wide shot to a medium shot over ~1.8s. */
function CameraIntro({ enabled }: { enabled: boolean }) {
  const { camera } = useThree();
  const elapsed = useRef(0);
  const from = useRef(new THREE.Vector3(0, 4.0, 15));
  const to = useRef(new THREE.Vector3(0, 1.8, 7.2));

  useFrame((_, rawDelta) => {
    if (!enabled) return;
    const dt = Math.min(rawDelta, 0.05);
    if (elapsed.current >= 1.8) return;
    elapsed.current += dt;
    const t = Math.min(elapsed.current / 1.8, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    camera.position.lerpVectors(from.current, to.current, eased);
    camera.lookAt(0, 0.7, 0);
  });

  return null;
}

export default function Car3DScene({
  url = MODEL_URL,
  reducedMotion = false,
}: {
  url?: string;
  reducedMotion?: boolean;
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: reducedMotion ? [0, 1.8, 7.2] : [0, 4.0, 15], fov: 38 }}
    >
      <color attach="background" args={["#0b0d12"]} />
      <fog attach="fog" args={["#0b0d12", 12, 30]} />

      <ambientLight intensity={0.45} />
      <directionalLight
        position={[6, 9, 5]}
        intensity={2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <Environment>
        <Lightformer intensity={2} position={[0, 5, 2]} scale={[10, 6, 1]} />
        <Lightformer
          intensity={1.2}
          color="#8ab4ff"
          position={[-6, 2, -2]}
          rotation-y={Math.PI / 2}
          scale={[20, 2, 1]}
        />
      </Environment>

      <Suspense fallback={null}>
        <CarModel url={url} />
      </Suspense>

      <ContactShadows position={[0, -0.01, 0]} opacity={0.55} scale={14} blur={2.6} far={6} />

      <CameraIntro enabled={!reducedMotion} />
      <OrbitControls
        enablePan={false}
        autoRotate={!reducedMotion}
        autoRotateSpeed={0.6}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 0.7, 0]}
      />
    </Canvas>
  );
}
