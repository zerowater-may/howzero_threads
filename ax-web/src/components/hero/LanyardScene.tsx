/* eslint-disable @typescript-eslint/no-explicit-any, react/no-unknown-property */
"use client";

// rapier RigidBody refs 는 내부 API(setNextKinematicTranslation, lerped 등) 접근이 잦아
// 정확한 제네릭 타이핑이 실익보다 비용이 큼 — ref 들은 any 로 둔다 (파일 상단 eslint 허용).

import { useEffect, useRef, useState } from "react";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import { useGLTF, useTexture, Environment, Lightformer } from "@react-three/drei";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
} from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import * as THREE from "three";
import { makeHowzeroCardTexture } from "./lanyard-texture";

extend({ MeshLineGeometry, MeshLineMaterial });

const CARD_GLB = "/card.glb";

export default function LanyardScene({
  onCardClick,
  onContextLost,
}: {
  onCardClick: () => void;
  onContextLost?: () => void;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 20], fov: 20 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color(0x000000), 0);
        // Safari가 GPU 프로세스를 죽이면 캔버스 자리에 흰 박스+사드페이스가 남는다.
        // 컨텍스트 로스트 시 배지 전체를 내려서(미표시 정책, 스펙 §3·§6) 그 잔해를 없앤다.
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          onContextLost?.();
        });
      }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={Math.PI} />
      <Physics gravity={[0, -40, 0]} timeStep={1 / 60}>
        <Band onCardClick={onCardClick} />
      </Physics>
      <Environment blur={0.75}>
        <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
        <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
        <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
        <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
      </Environment>
    </Canvas>
  );
}

function Band({ onCardClick, maxSpeed = 50, minSpeed = 0 }: { onCardClick: () => void; maxSpeed?: number; minSpeed?: number }) {
  const band = useRef<any>(null);
  const fixed = useRef<any>(null);
  const j1 = useRef<any>(null);
  const j2 = useRef<any>(null);
  const j3 = useRef<any>(null);
  const card = useRef<any>(null);

  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();

  const segmentProps = { type: "dynamic" as const, canSleep: true, colliders: false as const, angularDamping: 4, linearDamping: 4 };
  const { nodes, materials } = useGLTF(CARD_GLB) as any;
  const texture = useTexture("/lanyard-rope.png");

  const [cardTexture, setCardTexture] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    let mounted = true;
    let loadedTexture: THREE.Texture | null = null;
    makeHowzeroCardTexture().then((dataUrl) => {
      if (!dataUrl || !mounted) return;
      new THREE.TextureLoader().load(dataUrl, (t) => {
        if (!mounted) {
          t.dispose();
          return;
        }
        t.flipY = false;
        t.colorSpace = THREE.SRGBColorSpace;
        loadedTexture = t;
        setCardTexture(t);
      });
    });
    return () => {
      mounted = false;
      loadedTexture?.dispose();
    };
  }, []);

  const [curve] = useState(() => new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]));
  // 안정 참조 — 인라인 args 는 매 렌더마다 material 재생성됨
  const [materialArgs] = useState<ConstructorParameters<typeof MeshLineMaterial>>(() => [{ resolution: new THREE.Vector2(1000, 1000) }]);
  const [dragged, drag] = useState<false | THREE.Vector3>(false);
  const [hovered, hover] = useState(false);
  const pointerDown = useRef<{ x: number; y: number; t: number } | null>(null);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.45, 0]]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? "grabbing" : "grab";
      return () => {
        document.body.style.cursor = "auto";
      };
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z });
    }
    if (fixed.current) {
      [j1, j2].forEach((ref) => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(ref.current.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)));
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(32));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = "chordal";
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps} type="dynamic">
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps} type="dynamic">
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps} type="dynamic">
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? "kinematicPosition" : "dynamic"}>
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerDown={(e: any) => {
              e.target.setPointerCapture(e.pointerId);
              pointerDown.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY, t: Date.now() };
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
            }}
            onPointerUp={(e: any) => {
              e.target.releasePointerCapture(e.pointerId);
              drag(false);
              const down = pointerDown.current;
              pointerDown.current = null;
              if (!down) return;
              const dist = Math.hypot(e.nativeEvent.clientX - down.x, e.nativeEvent.clientY - down.y);
              if (dist < 6 && Date.now() - down.t < 400) onCardClick();
            }}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                {...(cardTexture ? { map: cardTexture, "map-anisotropy": 16 } : { color: "#161618" })}
                clearcoat={1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial args={materialArgs} color="white" depthTest={false} useMap={1} map={texture} repeat={[-4, 1]} lineWidth={1} />
      </mesh>
    </>
  );
}

useGLTF.preload(CARD_GLB);
