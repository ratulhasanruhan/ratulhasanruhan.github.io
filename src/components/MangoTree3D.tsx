"use client";

import { OrbitControls, Sparkles } from "@react-three/drei";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { BranchId } from "@/data/types";

export type TreeBranch = { id: BranchId; label: string; count: number };

type MangoTree3DProps = {
  branches: TreeBranch[];
  hoveredBranch: BranchId | null;
  onHoverBranch: (branch: BranchId | null) => void;
  onSelectBranch: (branch: BranchId) => void;
  night: boolean;
  season: string;
  reducedMotion: boolean;
};

type Vec3 = [number, number, number];

type PlaceLabel = (branch: BranchId, x: number, y: number, viewportWidth: number, opacity: number) => void;

const GROUND_Y = -2;

const crown: Record<BranchId, Vec3> = {
  writing: [-2.05, 0.4, 0.05],
  projects: [-1.25, 1.4, 0.35],
  communities: [-0.45, 2.2, -0.15],
  research: [1.0, 1.85, -0.2],
  awards: [1.55, 1.1, 0.45],
  experience: [2.15, 0.3, 0],
};

const palettes: Record<string, string[]> = {
  Grishma: ["#355f35", "#4f7f3d", "#77a046", "#9cba55"],
  Borsha: ["#255a3a", "#3b7446", "#5a9150", "#7fae63"],
  Sharat: ["#3a6338", "#56803f", "#7c9e4c", "#a8bf6b"],
  Hemanta: ["#4f6a32", "#6d8638", "#9aa046", "#c4ae55"],
  Sheet: ["#3d5d48", "#557459", "#76917a", "#9aae95"],
  Basanta: ["#3e6d3b", "#5c8d44", "#86ac52", "#b3c86c"],
};

function seeded(seed: number) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function easeOutBack(value: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(value - 1, 3) + c1 * Math.pow(value - 1, 2);
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function taperedTube(points: Vec3[], startRadius: number, endRadius: number, segments = 28, radial = 9) {
  const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
  const geometry = new THREE.TubeGeometry(curve, segments, 1, radial, false);
  const position = geometry.attributes.position as THREE.BufferAttribute;
  const vertex = new THREE.Vector3();
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const center = curve.getPointAt(t);
    const radius = THREE.MathUtils.lerp(startRadius, endRadius, Math.pow(t, 0.85));
    for (let j = 0; j <= radial; j += 1) {
      const index = i * (radial + 1) + j;
      vertex.fromBufferAttribute(position, index).sub(center).multiplyScalar(radius).add(center);
      position.setXYZ(index, vertex.x, vertex.y, vertex.z);
    }
  }
  geometry.computeVertexNormals();
  return geometry;
}

function useBlobShadowTexture() {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext("2d");
    if (context) {
      const gradient = context.createRadialGradient(64, 64, 4, 64, 64, 64);
      gradient.addColorStop(0, "rgba(28, 36, 22, 0.55)");
      gradient.addColorStop(0.55, "rgba(28, 36, 22, 0.18)");
      gradient.addColorStop(1, "rgba(28, 36, 22, 0)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, 128, 128);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
}

function useGroundTexture() {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext("2d");
    if (context) {
      const gradient = context.createRadialGradient(128, 128, 10, 128, 128, 128);
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.95)");
      gradient.addColorStop(0.45, "rgba(255, 255, 255, 0.6)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, 256, 256);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
}

function Wood({ night }: { night: boolean }) {
  const geometries = useMemo(() => {
    const trunk = taperedTube(
      [
        [0, GROUND_Y - 0.05, 0],
        [0.1, -1.25, 0.06],
        [-0.06, -0.5, 0],
        [0.02, 0.2, -0.02],
      ],
      0.34,
      0.17,
    );
    const limbs = (Object.values(crown) as Vec3[]).map(([x, y, z], index) =>
      taperedTube(
        [
          [0, -0.25 + (index % 3) * 0.12, 0],
          [x * 0.4, y * 0.5 + 0.1, z * 0.45],
          [x * 0.82, y * 0.88, z * 0.8],
        ],
        0.13,
        0.035,
        22,
        7,
      ),
    );
    const random = seeded(17);
    const roots = Array.from({ length: 6 }, (_, index) => {
      const angle = (index / 6) * Math.PI * 2 + random() * 0.4;
      const distance = 0.75 + random() * 0.45;
      return taperedTube(
        [
          [0, -1.8, 0],
          [Math.cos(angle) * distance * 0.45, GROUND_Y + 0.04, Math.sin(angle) * distance * 0.45],
          [Math.cos(angle) * distance, GROUND_Y - 0.02, Math.sin(angle) * distance],
        ],
        0.11,
        0.015,
        14,
        6,
      );
    });
    return [trunk, ...limbs, ...roots];
  }, []);

  useEffect(() => () => geometries.forEach((geometry) => geometry.dispose()), [geometries]);

  return (
    <group>
      {geometries.map((geometry, index) => (
        <mesh key={index} geometry={geometry} castShadow>
          <meshStandardMaterial color={night ? "#6a5340" : "#7a5434"} roughness={0.92} flatShading />
        </mesh>
      ))}
    </group>
  );
}

type Blob = { position: Vec3; radius: number; color: string; phase: number };

function Canopy({ season, reducedMotion }: { season: string; reducedMotion: boolean }) {
  const palette = palettes[season] ?? palettes.Grishma;
  const blobs = useMemo<Blob[]>(() => {
    const random = seeded(42);
    const list: Blob[] = [];
    const core: [Vec3, number][] = [
      [[0, 1.25, -0.1], 1.05],
      [[-0.85, 0.95, -0.35], 0.85],
      [[0.85, 1.15, -0.3], 0.88],
      [[0.05, 1.95, -0.45], 0.82],
      [[0, 0.55, -0.55], 0.72],
    ];
    core.forEach(([position, radius]) =>
      list.push({ position, radius, color: palette[Math.floor(random() * 2)], phase: random() * 6 }),
    );
    (Object.values(crown) as Vec3[]).forEach(([x, y, z]) => {
      for (let i = 0; i < 7; i += 1) {
        list.push({
          position: [x + (random() - 0.5) * 1.05, y + (random() - 0.35) * 0.75, z + (random() - 0.5) * 0.85],
          radius: 0.4 + random() * 0.34,
          color: palette[Math.floor(random() * palette.length)],
          phase: random() * 6,
        });
      }
    });
    return list;
  }, [palette]);

  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!groupRef.current || reducedMotion) return;
    const t = clock.elapsedTime;
    groupRef.current.rotation.z = Math.sin(t * 0.55) * 0.018;
    groupRef.current.children.forEach((child, index) => {
      const blob = blobs[index];
      if (!blob) return;
      child.position.y = blob.position[1] + Math.sin(t * 0.9 + blob.phase) * 0.025;
    });
  });

  return (
    <group ref={groupRef}>
      {blobs.map((blob, index) => (
        <mesh key={index} position={blob.position} castShadow>
          <icosahedronGeometry args={[blob.radius, 1]} />
          <meshStandardMaterial color={blob.color} roughness={0.82} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function Blossoms() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = 70;
  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const random = seeded(7);
    const dummy = new THREE.Object3D();
    const anchors = Object.values(crown) as Vec3[];
    for (let i = 0; i < count; i += 1) {
      const [x, y, z] = anchors[i % anchors.length];
      const direction = new THREE.Vector3(random() - 0.5, random() - 0.2, random() - 0.3).normalize();
      dummy.position.set(x + direction.x * 0.75, y + direction.y * 0.6, z + direction.z * 0.75);
      dummy.scale.setScalar(0.6 + random() * 0.8);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.045, 6, 6]} />
      <meshStandardMaterial color="#fff2c8" emissive="#f6dc8f" emissiveIntensity={0.25} roughness={0.6} />
    </instancedMesh>
  );
}

function DecorativeFruit() {
  const fruits = useMemo(() => {
    const random = seeded(99);
    const anchors = Object.values(crown) as Vec3[];
    return Array.from({ length: 12 }, (_, index) => {
      const [x, y, z] = anchors[index % anchors.length];
      return {
        position: [x + (random() - 0.5) * 1.1, y - 0.25 - random() * 0.3, z + 0.35 + random() * 0.3] as Vec3,
        scale: 0.45 + random() * 0.25,
      };
    });
  }, []);
  return (
    <group>
      {fruits.map((fruit, index) => (
        <mesh key={index} position={fruit.position} scale={[fruit.scale * 0.95, fruit.scale * 1.2, fruit.scale * 0.9]}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshStandardMaterial color="#c9a53e" roughness={0.45} />
        </mesh>
      ))}
    </group>
  );
}

function FallingLeaves({ count, palette, reducedMotion }: { count: number; palette: string[]; reducedMotion: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.09);
    shape.quadraticCurveTo(0.06, 0, 0, 0.09);
    shape.quadraticCurveTo(-0.06, 0, 0, -0.09);
    return new THREE.ShapeGeometry(shape, 6);
  }, []);
  const state = useMemo(() => {
    const random = seeded(3);
    return Array.from({ length: count }, () => ({
      x: (random() - 0.5) * 5.2,
      y: GROUND_Y + random() * 4.6,
      z: (random() - 0.5) * 2.4,
      speed: 0.18 + random() * 0.28,
      spin: (random() - 0.5) * 2.4,
      phase: random() * Math.PI * 2,
      drift: 0.15 + random() * 0.3,
    }));
  }, [count]);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const color = new THREE.Color();
    state.forEach((_, index) => {
      mesh.setColorAt(index, color.set(palette[(index % (palette.length - 1)) + 1]));
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [palette, state]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(({ clock }, delta) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = clock.elapsedTime;
    const step = reducedMotion ? 0 : Math.min(delta, 0.05);
    state.forEach((leaf, index) => {
      leaf.y -= leaf.speed * step;
      leaf.x += Math.sin(t * 0.8 + leaf.phase) * leaf.drift * step;
      if (leaf.y < GROUND_Y + 0.02) {
        leaf.y = 2.6;
        leaf.x = (Math.random() - 0.5) * 4.6;
      }
      dummy.position.set(leaf.x, leaf.y, leaf.z);
      dummy.rotation.set(t * leaf.spin * 0.6 + leaf.phase, t * leaf.spin + leaf.phase, Math.sin(t + leaf.phase) * 0.8);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[geometry, undefined, count]}>
      <meshStandardMaterial side={THREE.DoubleSide} roughness={0.7} />
    </instancedMesh>
  );
}

function Mango({
  branch,
  index,
  active,
  night,
  reducedMotion,
  onHover,
  onSelect,
  placeLabel,
}: {
  placeLabel: PlaceLabel;
  branch: TreeBranch;
  index: number;
  active: boolean;
  night: boolean;
  reducedMotion: boolean;
  onHover: (branch: BranchId | null) => void;
  onSelect: (branch: BranchId) => void;
}) {
  const [x, y, z] = crown[branch.id];
  const pivotRef = useRef<THREE.Group>(null);
  const fruitRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const startRef = useRef<number | null>(null);
  const anchorRef = useRef<THREE.Object3D>(null);
  const projected = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock, camera, size }, delta) => {
    const pivot = pivotRef.current;
    const fruit = fruitRef.current;
    if (!pivot || !fruit) return;
    if (startRef.current === null) startRef.current = clock.elapsedTime;
    const elapsed = clock.elapsedTime - startRef.current;
    const pop = reducedMotion ? 1 : easeOutBack(clamp01((elapsed - 1.25 - index * 0.13) / 0.55));
    const hoverScale = active ? 1.22 : 1;
    const current = pivot.scale.x;
    const target = Math.max(0.0001, pop * hoverScale);
    pivot.scale.setScalar(reducedMotion ? target : THREE.MathUtils.damp(current, target, 10, delta));
    if (!reducedMotion) {
      pivot.rotation.z = Math.sin(clock.elapsedTime * 1.25 + index * 1.7) * (active ? 0.02 : 0.085);
      pivot.rotation.x = Math.cos(clock.elapsedTime * 0.9 + index) * 0.04;
    }
    if (materialRef.current) {
      const glow = active ? 0.55 : night ? 0.32 : 0.08;
      materialRef.current.emissiveIntensity = THREE.MathUtils.damp(
        materialRef.current.emissiveIntensity,
        glow,
        8,
        delta,
      );
    }
    if (anchorRef.current) {
      anchorRef.current.getWorldPosition(projected).project(camera);
      placeLabel(
        branch.id,
        (projected.x + 1) * 0.5 * size.width,
        (1 - projected.y) * 0.5 * size.height,
        size.width,
        clamp01((pop - 0.6) / 0.4),
      );
    }
  });

  function handleOver(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    onHover(branch.id);
    document.body.style.cursor = "pointer";
  }

  function handleOut() {
    onHover(null);
    document.body.style.cursor = "";
  }

  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    onSelect(branch.id);
  }

  return (
    <group position={[x * 1.02, y - 0.38, z + 0.6]}>
      <group ref={pivotRef} scale={0.0001}>
        <mesh position={[0, -0.12, 0]}>
          <cylinderGeometry args={[0.014, 0.02, 0.26, 6]} />
          <meshStandardMaterial color="#5a3f27" roughness={0.9} />
        </mesh>
        <mesh position={[0.1, -0.03, 0]} rotation={[0, 0, -0.9]} scale={[1, 0.38, 0.12]}>
          <sphereGeometry args={[0.13, 10, 8]} />
          <meshStandardMaterial color="#4f8a3d" roughness={0.7} />
        </mesh>
        <mesh
          ref={fruitRef}
          position={[0, -0.47, 0]}
          rotation={[0, 0, 0.32]}
          scale={[0.95, 1.22, 0.9]}
          onPointerOver={handleOver}
          onPointerOut={handleOut}
          onClick={handleClick}
        >
          <sphereGeometry args={[0.27, 32, 32]} />
          <meshPhysicalMaterial
            ref={materialRef}
            color={active ? "#ffb444" : "#f2a23a"}
            emissive="#ff7a1a"
            emissiveIntensity={0.08}
            roughness={0.32}
            clearcoat={0.8}
            clearcoatRoughness={0.25}
            sheen={0.4}
            sheenColor="#ffd38a"
          />
        </mesh>
        <object3D ref={anchorRef} position={[0, -0.98, 0]} />
      </group>
    </group>
  );
}

function Rig({ reducedMotion, enableControls }: { reducedMotion: boolean; enableControls: boolean }) {
  const { camera, size } = useThree();
  useEffect(() => {
    const aspect = size.width / Math.max(size.height, 1);
    const halfFov = Math.tan(THREE.MathUtils.degToRad(18));
    const distance = Math.max(3.45 / (halfFov * aspect), 2.85 / halfFov);
    camera.position.set(0, 0.55, distance);
    camera.lookAt(0, 0.15, 0);
    camera.updateProjectionMatrix();
  }, [camera, size.height, size.width]);

  if (!enableControls) return null;
  return (
    <OrbitControls
      target={[0, 0.15, 0]}
      enablePan={false}
      enableZoom={false}
      enableDamping={!reducedMotion}
      dampingFactor={0.08}
      rotateSpeed={0.55}
      minAzimuthAngle={-0.85}
      maxAzimuthAngle={0.85}
      minPolarAngle={1.18}
      maxPolarAngle={1.72}
    />
  );
}

function Scene({
  branches,
  hoveredBranch,
  onHoverBranch,
  onSelectBranch,
  night,
  season,
  reducedMotion,
  compact,
  enableControls,
  placeLabel,
}: MangoTree3DProps & { compact: boolean; enableControls: boolean; placeLabel: PlaceLabel }) {
  const outerRef = useRef<THREE.Group>(null);
  const swayRef = useRef<THREE.Group>(null);
  const startRef = useRef<number | null>(null);
  const shadow = useBlobShadowTexture();
  const ground = useGroundTexture();
  const palette = palettes[season] ?? palettes.Grishma;

  useEffect(() => () => shadow.dispose(), [shadow]);
  useEffect(() => () => ground.dispose(), [ground]);

  useFrame(({ clock, pointer }, delta) => {
    if (startRef.current === null) startRef.current = clock.elapsedTime;
    const elapsed = clock.elapsedTime - startRef.current;
    const growth = reducedMotion ? 1 : easeOutCubic(clamp01((elapsed - 0.1) / 1.7));
    if (outerRef.current) {
      outerRef.current.scale.set(0.2 + growth * 0.8, Math.max(0.0001, growth), 0.2 + growth * 0.8);
    }
    if (swayRef.current && !reducedMotion) {
      const sway = Math.sin(clock.elapsedTime * 0.16) * (compact ? 0.16 : 0.32);
      swayRef.current.rotation.y = THREE.MathUtils.damp(swayRef.current.rotation.y, sway + pointer.x * 0.28, 2.4, delta);
      swayRef.current.rotation.x = THREE.MathUtils.damp(swayRef.current.rotation.x, -pointer.y * 0.05, 2.4, delta);
    }
  });

  return (
    <>
      <hemisphereLight
        args={[night ? "#b9c6ea" : "#fff6e2", night ? "#3b4a3a" : "#8a9a68", night ? 1.25 : 1.55]}
      />
      <ambientLight intensity={night ? 0.35 : 0.45} />
      <directionalLight
        position={night ? [-3, 5, 5] : [4, 6, 6]}
        intensity={night ? 1.6 : 2.6}
        color={night ? "#d4dcff" : "#ffe6b3"}
      />
      <directionalLight position={[-4, 2, -3]} intensity={night ? 0.35 : 0.6} color="#cfe3ff" />
      {season === "Sheet" && <fog attach="fog" args={[night ? "#1d2b26" : "#e9ebe2", 7, 15]} />}

      <group ref={swayRef}>
        <group ref={outerRef} position={[0, GROUND_Y, 0]} scale={[0.2, 0.0001, 0.2]}>
          <group position={[0, -GROUND_Y, 0]}>
            <Wood night={night} />
            <Canopy season={season} reducedMotion={reducedMotion} />
            {season === "Basanta" && <Blossoms />}
            {season === "Grishma" && <DecorativeFruit />}
          </group>
        </group>
        {branches.map((branch, index) => (
          <Mango
            key={branch.id}
            branch={branch}
            index={index}
            active={hoveredBranch === branch.id}
            night={night}
            reducedMotion={reducedMotion}
            onHover={onHoverBranch}
            onSelect={onSelectBranch}
            placeLabel={placeLabel}
          />
        ))}
        <FallingLeaves count={compact ? 18 : 36} palette={palette} reducedMotion={reducedMotion} />
        <mesh position={[0, GROUND_Y - 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[7.4, 7.4]} />
          <meshBasicMaterial map={ground} color={night ? "#53664f" : "#cfc39f"} transparent depthWrite={false} />
        </mesh>
        <mesh position={[0, GROUND_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[5.4, 5.4]} />
          <meshBasicMaterial map={shadow} transparent depthWrite={false} />
        </mesh>
      </group>

      <Sparkles
        count={night ? 46 : 22}
        scale={[6.5, 4.4, 3]}
        position={[0, 0.4, 0]}
        size={night ? 4 : 2.2}
        speed={reducedMotion ? 0 : 0.35}
        opacity={night ? 0.95 : 0.55}
        color={night ? "#ffd57a" : "#fff1bf"}
      />

      <Rig reducedMotion={reducedMotion} enableControls={enableControls} />
    </>
  );
}

export default function MangoTree3D(props: MangoTree3DProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const [finePointer, setFinePointer] = useState(false);
  const [compact, setCompact] = useState(false);
  const labelRefs = useRef<Partial<Record<BranchId, HTMLButtonElement | null>>>({});
  const placeLabel = useCallback<PlaceLabel>((branch, x, y, viewportWidth, opacity) => {
    const label = labelRefs.current[branch];
    if (!label) return;
    const half = label.offsetWidth / 2 + 6;
    const left = Math.min(Math.max(x, half), viewportWidth - half);
    label.style.transform = `translate3d(${left.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
    label.style.opacity = String(opacity);
  }, []);

  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(element);
    const onVisibility = () => setPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    const pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const compactQuery = window.matchMedia("(max-width: 760px)");
    const syncQueries = () => {
      setFinePointer(pointerQuery.matches);
      setCompact(compactQuery.matches);
    };
    syncQueries();
    pointerQuery.addEventListener("change", syncQueries);
    compactQuery.addEventListener("change", syncQueries);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      pointerQuery.removeEventListener("change", syncQueries);
      compactQuery.removeEventListener("change", syncQueries);
      document.body.style.cursor = "";
    };
  }, []);

  const running = inView && pageVisible;

  return (
    <div
      ref={wrapperRef}
      className="mango3d"
      role="img"
      aria-label="An interactive 3D mango tree. Each glowing mango opens a part of Ratul's work."
    >
      <Canvas
        frameloop={running ? (props.reducedMotion ? "demand" : "always") : "never"}
        dpr={[1, compact ? 1.5 : 1.8]}
        camera={{ position: [0, 0.55, 8.4], fov: 36, near: 0.1, far: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        flat
        fallback={<div className="mango3d-fallback" />}
      >
        <Scene {...props} compact={compact} enableControls={finePointer} placeLabel={placeLabel} />
      </Canvas>
      <div className="mango3d-labels">
        {props.branches.map((branch) => (
          <button
            key={branch.id}
            ref={(element) => {
              labelRefs.current[branch.id] = element;
            }}
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            className={`mango3d-label${props.hoveredBranch === branch.id ? " is-active" : ""}`}
            onPointerEnter={() => props.onHoverBranch(branch.id)}
            onPointerLeave={() => props.onHoverBranch(null)}
            onClick={() => props.onSelectBranch(branch.id)}
          >
            <span className="mango3d-label-name">{branch.label}</span>
            <span className="mango3d-label-count">{branch.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
