"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";

/**
 * The compounding loop in WebGL.
 *
 * SVG could fake depth with scale and draw order, but it can't produce the
 * things that actually read as dimensional: real perspective, additive light
 * that bleeds, atmospheric falloff, and thousands of particles moving through
 * space. Bloom over emissive materials is what does most of the work here.
 *
 * Labels stay as DOM nodes via drei's Html so type is crisp and readable rather
 * than rasterised into the canvas.
 */

export type SceneProps = {
  /** 0 → 1 across the whole scroll track. */
  progress: number;
  /** Windows computed by the caller so narration and scene stay in step. */
  core: number;
  kynIn: number;
  linkIn: number;
  meta: number;
  transfer: number;
  /** The closing beat — every Kyn drawing down at once. */
  payoff: number;
  /** Narrow viewports: drop in-scene labels and sit behind the story. */
  compact?: boolean;
};

const KYNS = [
  { name: "Kyn 1", domain: "Sales", okr: "Funnel +25%", colour: "#8fc0ea" },
  {
    name: "Kyn 2",
    domain: "Finance",
    okr: "AR >60d under 10%",
    okrAfter: "+ play · call after 2 ignored emails",
    colour: "#8fc0ea",
  },
  { name: "Kyn 3", domain: "R&D", okr: "Spec-to-merge −30%", colour: "#8fc0ea" },
  {
    name: "Kyn 4",
    domain: "Marketing",
    okr: "Qualified leads +40%",
    colour: "#8fc0ea",
  },
];

const ORBIT = 4.9;
const TILT = 0.42;

const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3);

/**
 * Patches a standard material so its vertices ride a travelling wave. Cheaper
 * and smoother than rewriting the position attribute on the CPU every frame,
 * and it keeps the material's normal lighting and emissive response.
 */
function useWavyMaterial(amplitude: number, speed: number) {
  const uniforms = useRef({ uTime: { value: 0 } });
  useFrame((state) => {
    uniforms.current.uTime.value = state.clock.elapsedTime * speed;
  });
  const onBeforeCompile = useMemo(
    () => (shader: THREE.WebGLProgramParametersWithUniforms) => {
      shader.uniforms.uTime = uniforms.current.uTime;
      shader.vertexShader =
        "uniform float uTime;\n" +
        shader.vertexShader.replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
           float wave = sin(position.x * 5.2 + uTime * 1.7)
                      + sin(position.y * 4.1 - uTime * 1.3)
                      + sin(position.z * 6.3 + uTime * 0.9);
           transformed += normalize(normal) * wave * ${amplitude.toFixed(3)};`
        );
    },
    [amplitude]
  );
  return onBeforeCompile;
}

function nodePosition(i: number, spin: number): THREE.Vector3 {
  const a = ((20 + i * 90) * Math.PI) / 180 + spin;
  return new THREE.Vector3(
    Math.cos(a) * ORBIT,
    Math.sin(a) * ORBIT * TILT,
    Math.sin(a) * ORBIT * 0.72
  );
}

/** The shared model: a slowly churning cloud of points around a lit centre. */
function Core({ amount, energy }: { amount: number; energy: number }) {
  const points = useRef<THREE.Points>(null);
  const inner = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const COUNT = 2600;
    const pos = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      // Even distribution on a sphere, pulled inward at random depths so the
      // cloud has volume rather than reading as a shell.
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = 1.9 * (0.55 + Math.pow(Math.random(), 0.4) * 0.45);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  useFrame((state, delta) => {
    if (points.current) {
      points.current.rotation.y += delta * 0.09;
      points.current.rotation.x += delta * 0.03;
      points.current.scale.setScalar(amount);
    }
    if (inner.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.1) * 0.045;
      inner.current.scale.setScalar(amount * pulse);
      const m = inner.current.material as THREE.MeshBasicMaterial;
      m.opacity = amount * (0.5 + energy * 0.35);
    }
  });

  return (
    <group>
      <points ref={points} geometry={geometry}>
        <pointsMaterial
          size={0.045}
          color="#9fd4ec"
          transparent
          opacity={0.85 * amount}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <mesh ref={inner}>
        <sphereGeometry args={[1.28, 48, 48]} />
        <meshBasicMaterial
          color="#2f7fb8"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* A dense bright centre gives bloom something to catch. */}
      <mesh scale={amount}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshBasicMaterial color="#cfeaf8" toneMapped={false} />
      </mesh>
    </group>
  );
}

/**
 * A Kyn, drawn as woven knots rather than a sphere.
 *
 * Each company is two interlocking closed curves — the functions Saga runs,
 * bound into one form. Torus knots rather than free-form splines: random
 * control points read as scribble, where a knot's regularity reads as
 * structure. The (p, q) pair is fixed per Kyn, so each has its own signature.
 */
const KNOTS: [number, number][] = [
  [2, 3],
  [3, 4],
  [3, 5],
  [5, 2],
];

function KynForm({
  position,
  amount,
  highlight,
  seed,
}: {
  position: THREE.Vector3;
  amount: number;
  highlight: number;
  seed: number;
}) {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const wavy = useWavyMaterial(0.012, 0.9 + seed * 0.07);

  const strands = useMemo(() => {
    const [p, q] = KNOTS[seed % KNOTS.length];
    return [
      {
        geometry: new THREE.TorusKnotGeometry(0.44, 0.032, 220, 10, p, q),
        tilt: new THREE.Euler(0.4 * seed, 0.9 * seed, 0.2 * seed),
      },
      {
        geometry: new THREE.TorusKnotGeometry(0.3, 0.02, 180, 8, q, p),
        tilt: new THREE.Euler(1.1 * seed, 0.3 * seed, 0.8 * seed),
      },
    ];
  }, [seed]);

  useEffect(
    () => () => strands.forEach((st) => st.geometry.dispose()),
    [strands]
  );

  useFrame((state, delta) => {
    if (group.current) {
      group.current.position.copy(position);
      group.current.scale.setScalar(amount * (0.92 + highlight * 0.16));
    }
    if (inner.current) {
      inner.current.rotation.y += delta * 0.2;
      inner.current.rotation.z += delta * 0.07;
      // Counter-rotate the nested knot so the pair keeps shifting against
      // itself rather than reading as one solid object.
      const nested = inner.current.children[1];
      if (nested) {
        nested.rotation.x -= delta * 0.34;
        nested.rotation.y += delta * 0.19;
      }
    }
  });

  const emissive = highlight > 0.5 ? "#5fd4ea" : "#4a93d8";

  return (
    <group ref={group}>
      <group ref={inner}>
        {strands.map((st, k) => (
          <mesh key={k} geometry={st.geometry} rotation={st.tilt}>
            <meshStandardMaterial
              color="#0f2440"
              emissive={new THREE.Color(emissive)}
              emissiveIntensity={(k === 0 ? 1.5 : 1.0) + highlight * 2.4}
              roughness={0.25}
              metalness={0.45}
              toneMapped={false}
              onBeforeCompile={wavy}
            />
          </mesh>
        ))}
      </group>
      {/* Just enough shell for bloom to catch and for distance to dim. */}
      <mesh>
        <sphereGeometry args={[0.62, 24, 24]} />
        <meshBasicMaterial
          color={highlight > 0.5 ? "#6fd0e8" : "#4f8fc8"}
          transparent
          opacity={0.07 + highlight * 0.13}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/**
 * Signal along one spoke. A ribbon of points travelling a slightly bowed curve,
 * so traffic reads as flowing rather than as dots on a straight line.
 */
function Signal({
  from,
  to,
  strength,
  colour,
  offset,
  reverse,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  strength: number;
  colour: string;
  offset: number;
  reverse?: boolean;
}) {
  const ref = useRef<THREE.Points>(null);
  const COUNT = 26;

  const curve = useMemo(() => {
    const mid = from.clone().lerp(to, 0.5);
    // Bow the path off-axis so the two directions don't overlap.
    mid.add(new THREE.Vector3(0, 0.55, 0).multiplyScalar(reverse ? -1 : 1));
    return new THREE.QuadraticBezierCurve3(from.clone(), mid, to.clone());
  }, [from, to, reverse]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3)
    );
    return g;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const attr = geometry.getAttribute("position") as THREE.BufferAttribute;
    const t0 = (state.clock.elapsedTime * 0.26 + offset) % 1;
    for (let i = 0; i < COUNT; i++) {
      // A short comet of points rather than one dot — reads as motion.
      const t = (t0 + i * 0.006) % 1;
      const p = curve.getPoint(reverse ? 1 - t : t);
      attr.setXYZ(i, p.x, p.y, p.z);
    }
    attr.needsUpdate = true;
    const m = ref.current.material as THREE.PointsMaterial;
    m.opacity = strength;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.11}
        color={colour}
        transparent
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}

/** The static connector, drawn once the architecture beat lands. */
function Spoke({ from, to, amount }: { from: THREE.Vector3; to: THREE.Vector3; amount: number }) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints([from, to]);
    return g;
  }, [from, to]);
  return (
    <line>
      <primitive object={geometry} attach="geometry" />
      <lineBasicMaterial
        color="#5f9fd6"
        transparent
        opacity={0.34 * amount}
        depthWrite={false}
      />
    </line>
  );
}

/**
 * The rest of the portfolio. A wider, sparser ring that fades up on the closing
 * beat — the point being that the four you were shown are not the edge of it.
 */
function Beyond({ amount }: { amount: number }) {
  const g = useRef<THREE.Group>(null);
  const seeds = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2 + 0.4;
        const r = ORBIT * (1.75 + (i % 3) * 0.22);
        return new THREE.Vector3(
          Math.cos(a) * r,
          Math.sin(a) * r * TILT * 1.1,
          Math.sin(a) * r * 0.72
        );
      }),
    []
  );
  useFrame((state, delta) => {
    if (g.current) g.current.rotation.y += delta * 0.014;
  });
  return (
    <group ref={g}>
      {seeds.map((pos, i) => (
        <group key={i} position={pos} rotation={[i * 0.7, i * 1.1, i * 0.4]}>
          <mesh>
            {/* Same family as the four, just smaller and quieter. */}
            <torusKnotGeometry
              args={[0.26, 0.022, 120, 8, KNOTS[i % KNOTS.length][0], KNOTS[i % KNOTS.length][1]]}
            />
            <meshStandardMaterial
              color="#12263f"
              emissive={new THREE.Color("#3f8fd0")}
              emissiveIntensity={1.1 * amount}
              roughness={0.3}
              metalness={0.4}
              transparent
              opacity={amount}
              toneMapped={false}
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshBasicMaterial
              color="#4f8fc8"
              transparent
              opacity={0.08 * amount}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Rig({ progress, shift }: { progress: number; shift: number }) {
  const { camera } = useThree();
  useFrame((state, delta) => {
    // Dolly from inside the cloud out to the whole system, then back in a touch.
    const z = progress < 0.3
      ? THREE.MathUtils.lerp(4.2, 17, easeOut(progress / 0.3))
      : progress < 0.8
        ? THREE.MathUtils.lerp(17, 15.6, easeOut((progress - 0.3) / 0.5))
        : THREE.MathUtils.lerp(15.6, 26, easeOut((progress - 0.8) / 0.2));
    const y = THREE.MathUtils.lerp(0.4, 3.4, easeOut(progress));
    // A little breathing on top so the camera is never perfectly still.
    const drift = Math.sin(state.clock.elapsedTime * 0.25) * 0.22;
    camera.position.lerp(new THREE.Vector3(drift, y, z), 1 - Math.pow(0.001, delta));
    // Aim left of origin so the system sits right of frame centre.
    camera.lookAt(-THREE.MathUtils.lerp(0, shift, easeOut(progress * 1.4)), 0, 0);
  });
  return null;
}

function Scene(props: SceneProps) {
  const { progress, core, kynIn, linkIn, meta, transfer, payoff, compact } =
    props;
  const spin = THREE.MathUtils.lerp(-0.28, 0.34, progress);
  const positions = KYNS.map((_, i) => nodePosition(i, spin));

  const legOut = Math.max((transfer - 0.5) / 0.5, 0);

  return (
    <>
      <fog attach="fog" args={["#162230", 10, 30]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 0]} intensity={14} color="#4aa6d8" distance={18} />
      <pointLight position={[6, 6, 8]} intensity={9} color="#8fc0ea" distance={30} />

      <Core amount={core} energy={Math.max(meta, payoff)} />
      {payoff > 0.01 && <Beyond amount={payoff} />}

      {positions.map((pos, i) => {
        const appear = easeOut(Math.min(Math.max(kynIn * 1.5 - i * 0.16, 0), 1));
        if (appear < 0.01) return null;
        const highlight = Math.max(
          payoff,
          i === 1 ? legOut : i === 0 ? transfer : 0
        );
        const link = easeOut(Math.min(Math.max(linkIn * 1.5 - i * 0.1, 0), 1));
        const dir = pos.clone().normalize();
        const from = dir.clone().multiplyScalar(1.5);
        const to = pos.clone().sub(dir.clone().multiplyScalar(0.85));
        return (
          <group key={i}>
            {link > 0.02 && <Spoke from={from} to={to} amount={link} />}
            {link > 0.6 && (
              <>
                <Signal
                  from={to}
                  to={from}
                  colour="#3aaccc"
                  strength={(0.55 + meta * 0.45) * link}
                  offset={i * 0.25}
                />
                <Signal
                  from={from}
                  to={to}
                  colour="#8fc0ea"
                  strength={(0.3 + Math.max(transfer, payoff) * 0.7) * link}
                  offset={i * 0.25 + 0.5}
                  reverse
                />
              </>
            )}
            <KynForm
              position={pos}
              amount={appear}
              highlight={highlight}
              seed={i + 1}
            />
            {!compact && (
            <Html
              position={[pos.x * 1.24, pos.y * 1.24 - 0.85, pos.z * 1.24]}
              center
              distanceFactor={13}
              style={{
                pointerEvents: "none",
                opacity: appear * (0.5 + ((pos.z / (ORBIT * 0.72)) + 1) / 2 * 0.5),
                whiteSpace: "nowrap",
              }}
            >
              <div
                style={{
                  fontFamily: '"Bricolage Grotesque", sans-serif',
                  fontWeight: 500,
                  fontSize: 15,
                  letterSpacing: "-0.02em",
                  color: i === 1 && legOut > 0.2 ? "#6fd0e8" : "#e8edf2",
                }}
              >
                {KYNS[i].name}
              </div>
            </Html>
            )}
          </group>
        );
      })}

      {!compact && (
      <Html
        position={[0, -3.1, 0]}
        center
        distanceFactor={13}
        style={{ pointerEvents: "none", opacity: core, whiteSpace: "nowrap" }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: '"Bricolage Grotesque", sans-serif',
              fontWeight: 500,
              fontSize: 22,
              letterSpacing: "-0.03em",
              color: "#f2f7fb",
            }}
          >
            Kyndred
          </div>
          <div
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: 9,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#7d90a1",
              marginTop: 5,
            }}
          >
            shared intelligence
          </div>
        </div>
      </Html>
      )}

      <Rig progress={progress} shift={compact ? 0 : 2.3} />

      <EffectComposer>
        <Bloom
          intensity={1.5}
          luminanceThreshold={0.18}
          luminanceSmoothing={0.35}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

export default function KyndredScene(props: SceneProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.4, 3.2], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <Scene {...props} />
    </Canvas>
  );
}
