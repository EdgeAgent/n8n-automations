/**
 * Interactive agent graph: every visible node represents a real command, memory,
 * control, research, or delivery function in the simulated JARVIS architecture.
 */

import { OrbitControls } from "@react-three/drei";
import { Canvas, ThreeEvent, useFrame } from "@react-three/fiber";
import React, { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { BrainMode, NEURAL_EDGES, NEURAL_NODES, NeuralNode } from "@/lib/neural-data";
import "@/sphere-neural.css";

type NeuralGraphProps = { mode: BrainMode; selectedId: string; onSelect: (id: string) => void };

const COLORS = { cyan: "#39d9ff", cobalt: "#5b93a8", violet: "#9b7cff", ice: "#c8d6d8", amber: "#dca765", steel: "#283a40" };
export const NEURAL_ORBIT_CONTROLS = { enablePan: true, enableZoom: true, enableRotate: true, enableDamping: true, dampingFactor: 0.075, rotateSpeed: 0.82, zoomSpeed: 0.8, panSpeed: 0.7, minDistance: 5.5, maxDistance: 17, maxPolarAngle: Math.PI * 0.86, minPolarAngle: Math.PI * 0.14 };

const ROUTES: Record<BrainMode, Array<[string, string]>> = {
  idle: [["core", "router"], ["core", "speech-engine"]],
  listening: [["voice-gateway", "semantic-extractor"], ["semantic-extractor", "input-cortex"], ["input-cortex", "intent-evaluator"], ["intent-evaluator", "router"], ["router", "core"]],
  thinking: [["core", "task-planner"], ["task-planner", "operations"], ["operations", "event-router"], ["event-router", "automation-engineer"], ["core", "research"], ["research", "source-verifier"], ["source-verifier", "synthesis-analyst"]],
  speaking: [["core", "workspace"], ["workspace", "delivery-formatter"], ["delivery-formatter", "speech-engine"], ["speech-engine", "response-wave"]],
  approval: [["core", "policy-guard"], ["policy-guard", "approval-gate"], ["approval-gate", "audit-ledger"]],
};

const stateColor = (mode: BrainMode) => mode === "approval" ? COLORS.amber : mode === "thinking" ? COLORS.violet : mode === "speaking" ? COLORS.ice : mode === "listening" ? COLORS.cyan : COLORS.cobalt;

function colorForNode(node: NeuralNode, mode: BrainMode) {
  if (node.type === "decision") return COLORS.amber;
  if (mode === "listening" && ["voice-gateway", "semantic-extractor", "input-cortex", "intent-evaluator", "router", "core"].includes(node.id)) return COLORS.cyan;
  if (mode === "thinking" && ["core", "task-planner", "operations", "event-router", "automation-engineer", "research", "source-verifier", "synthesis-analyst"].includes(node.id)) return COLORS.violet;
  if (mode === "speaking" && ["core", "workspace", "delivery-formatter", "speech-engine", "response-wave"].includes(node.id)) return COLORS.ice;
  if (node.activity === "reasoning") return COLORS.violet;
  if (node.activity === "live") return COLORS.cyan;
  return COLORS.cobalt;
}

function NodeModule({ node, mode, selected, onSelect }: { node: NeuralNode; mode: BrainMode; selected: boolean; onSelect: (id: string) => void }) {
  const module = useRef<THREE.Group>(null);
  const halo = useRef<THREE.Mesh>(null);
  const color = colorForNode(node, mode);
  const baseSize = node.id === "core" ? 0.31 : node.type === "cortex" ? 0.22 : node.type === "manager" ? 0.175 : node.type === "decision" ? 0.16 : 0.12;

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const active = selected || node.activity === "live" || node.activity === "reasoning";
    if (module.current) module.current.scale.setScalar((active ? 1 + Math.sin(elapsed * (selected ? 3 : 1.8) + node.position[0]) * (selected ? 0.11 : 0.045) : 1) * (selected ? 1.14 : 1));
    if (halo.current) {
      halo.current.rotation.z = elapsed * (selected ? 0.8 : 0.28);
      (halo.current.material as THREE.MeshBasicMaterial).opacity = selected ? 0.62 : active ? 0.28 : 0.09;
    }
  });

  const select = (event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); onSelect(node.id); };
  return <group position={node.position} ref={module}>
    <mesh ref={halo} rotation={[0, 0, Math.PI / 4]}><ringGeometry args={[baseSize * 1.45, baseSize * 1.56, 4]} /><meshBasicMaterial color={color} transparent opacity={0.15} side={THREE.DoubleSide} /></mesh>
    <mesh rotation={[0.25, 0.44, 0]}><icosahedronGeometry args={[baseSize * 1.34, 1]} /><meshBasicMaterial color={color} wireframe transparent opacity={0.26} /></mesh>
    <mesh name={`node-${node.id}`} onClick={select} onPointerOver={(event) => { event.stopPropagation(); document.body.style.cursor = "pointer"; }} onPointerOut={() => { document.body.style.cursor = "default"; }}><icosahedronGeometry args={[baseSize, 2]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={selected ? 2.9 : 1.35} metalness={0.55} roughness={0.28} /></mesh>
  </group>;
}

function EdgeField({ mode, selectedId }: { mode: BrainMode; selectedId: string }) {
  const { allEdges, selectedEdges } = useMemo(() => {
    const byId = new Map(NEURAL_NODES.map((node) => [node.id, node]));
    const all: number[] = [];
    const selected: number[] = [];
    NEURAL_EDGES.forEach(([from, to]) => {
      const source = byId.get(from)?.position;
      const destination = byId.get(to)?.position;
      if (!source || !destination) return;
      all.push(...source, ...destination);
      if (from === selectedId || to === selectedId) selected.push(...source, ...destination);
    });
    const allEdges = new THREE.BufferGeometry(); allEdges.setAttribute("position", new THREE.Float32BufferAttribute(all, 3));
    const selectedEdges = new THREE.BufferGeometry(); selectedEdges.setAttribute("position", new THREE.Float32BufferAttribute(selected, 3));
    return { allEdges, selectedEdges };
  }, [selectedId]);

  return <><lineSegments geometry={allEdges}><lineBasicMaterial color={mode === "idle" ? COLORS.steel : "#627879"} transparent opacity={0.28} /></lineSegments><lineSegments geometry={selectedEdges}><lineBasicMaterial color={COLORS.cyan} transparent opacity={0.78} /></lineSegments></>;
}

function SignalPacket({ source, destination, index, color }: { source: [number, number, number]; destination: [number, number, number]; index: number; color: string }) {
  const packet = useRef<THREE.Mesh>(null);
  const tail = useRef<THREE.Mesh>(null);
  const from = useMemo(() => new THREE.Vector3(...source), [source]);
  const to = useMemo(() => new THREE.Vector3(...destination), [destination]);
  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const progress = (elapsed * 0.38 + index * 0.23) % 1;
    if (packet.current) { packet.current.position.lerpVectors(from, to, progress); packet.current.scale.setScalar(0.82 + Math.sin(elapsed * 8 + index) * 0.16); }
    if (tail.current) { tail.current.position.lerpVectors(from, to, Math.max(0, progress - 0.11)); tail.current.scale.setScalar(0.52); }
  });
  return <group><mesh ref={tail}><sphereGeometry args={[0.075, 12, 12]} /><meshBasicMaterial color={color} transparent opacity={0.26} /></mesh><mesh ref={packet}><sphereGeometry args={[0.105, 16, 16]} /><meshBasicMaterial color={color} transparent opacity={1} /></mesh></group>;
}

function ActiveSignalRoutes({ mode }: { mode: BrainMode }) {
  const route = ROUTES[mode];
  const byId = useMemo(() => new Map(NEURAL_NODES.map((node) => [node.id, node])), []);
  const geometry = useMemo(() => {
    const positions: number[] = [];
    route.forEach(([from, to]) => { const source = byId.get(from)?.position; const destination = byId.get(to)?.position; if (source && destination) positions.push(...source, ...destination); });
    const result = new THREE.BufferGeometry(); result.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3)); return result;
  }, [byId, route]);
  const color = stateColor(mode);
  return <><lineSegments geometry={geometry}><lineBasicMaterial color={color} transparent opacity={0.98} /></lineSegments>{route.flatMap(([from, to], index) => {
    const source = byId.get(from)?.position; const destination = byId.get(to)?.position;
    return source && destination ? [<SignalPacket key={`${from}-${to}-a`} source={source} destination={destination} index={index} color={color} />, <SignalPacket key={`${from}-${to}-b`} source={source} destination={destination} index={index + 0.44} color={color} />, <SignalPacket key={`${from}-${to}-c`} source={source} destination={destination} index={index + 0.74} color={color} />] : [];
  })}</>;
}

function CalibrationField({ mode }: { mode: BrainMode }) {
  const color = stateColor(mode);
  const ticks = useMemo(() => Array.from({ length: 84 }, (_, index) => index), []);
  return <group rotation={[0.03, 0.02, -0.12]}>{ticks.map((index) => {
    const angle = (index / ticks.length) * Math.PI * 2;
    const radius = index % 7 === 0 ? 4.62 : 4.48;
    const size = index % 7 === 0 ? 0.18 : 0.075;
    return <mesh key={index} position={[Math.cos(angle) * radius, Math.sin(angle) * radius * 0.73, -1.8]} rotation={[0, 0, angle + Math.PI / 2]}><boxGeometry args={[0.01, size, 0.01]} /><meshBasicMaterial color={color} transparent opacity={index % 7 === 0 ? 0.34 : 0.14} /></mesh>;
  })}</group>;
}

function ContainmentSphere({ mode }: { mode: BrainMode }) {
  const shell = useRef<THREE.Group>(null);
  const color = stateColor(mode);
  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const pulse = mode === "listening" ? 0.028 : mode === "thinking" ? 0.018 : mode === "speaking" ? 0.042 : mode === "approval" ? 0.012 : 0.008;
    shell.current?.scale.setScalar(1 + Math.sin(elapsed * (mode === "speaking" ? 3.1 : 1.35)) * pulse);
    if (shell.current) shell.current.rotation.y = elapsed * 0.025;
  });
  return <group ref={shell}>
    <mesh><sphereGeometry args={[4.92, 64, 48]} /><meshPhysicalMaterial color={color} transparent opacity={0.09} roughness={0.12} metalness={0.36} transmission={0.22} thickness={0.3} side={THREE.DoubleSide} depthWrite={false} /></mesh>
    <mesh scale={[1, 0.73, 1]} rotation={[0.18, 0.08, 0.2]}><torusGeometry args={[4.7, 0.018, 8, 96]} /><meshBasicMaterial color={color} transparent opacity={0.58} /></mesh>
    <mesh rotation={[Math.PI / 2, 0.48, 0]}><torusGeometry args={[4.86, 0.014, 8, 96]} /><meshBasicMaterial color={COLORS.cyan} transparent opacity={0.34} /></mesh>
    <mesh rotation={[0.62, Math.PI / 2.8, 0.34]}><torusGeometry args={[4.88, 0.009, 8, 96]} /><meshBasicMaterial color={COLORS.violet} transparent opacity={0.24} /></mesh>
  </group>;
}

function GraphScene({ mode, selectedId, onSelect }: NeuralGraphProps) {
  const graph = useRef<THREE.Group>(null);
  useFrame(({ clock }) => { if (graph.current) { graph.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.08) * 0.018; graph.current.rotation.x = Math.cos(clock.getElapsedTime() * 0.06) * 0.009; } });
  return <>
    <color attach="background" args={["#080d0d"]} /><fog attach="fog" args={["#080d0d", 10, 22]} /><ambientLight intensity={0.5} color="#9baeb2" /><pointLight position={[0, 3, 4]} intensity={14} color="#39d9ff" distance={12} /><pointLight position={[-4, -2, 3]} intensity={8} color="#9b7cff" distance={11} />
    <ContainmentSphere mode={mode} />
    <CalibrationField mode={mode} />
    <group ref={graph} onPointerMissed={() => onSelect("core")}><EdgeField mode={mode} selectedId={selectedId} /><ActiveSignalRoutes mode={mode} />{NEURAL_NODES.map((node) => <NodeModule key={node.id} node={node} mode={mode} selected={node.id === selectedId} onSelect={onSelect} />)}</group>
    <OrbitControls {...NEURAL_ORBIT_CONTROLS} />
  </>;
}

export function NeuralBrain(props: NeuralGraphProps) {
  const [navigationState, setNavigationState] = useState("ready");
  const dragOrigin = useRef<{ x: number; y: number } | null>(null);
  return <div className="neural-canvas-shell neural-sphere-shell" aria-label="Interactive neural system graph contained in a reactive AI sphere. Drag to orbit, scroll to zoom, and click a node to inspect it." data-navigation-state={navigationState} onWheel={() => setNavigationState("zoom")} onPointerDown={(event) => { dragOrigin.current = { x: event.clientX, y: event.clientY }; }} onPointerMove={(event) => { if (dragOrigin.current && Math.hypot(event.clientX - dragOrigin.current.x, event.clientY - dragOrigin.current.y) > 8) setNavigationState("orbit"); }} onPointerUp={() => { dragOrigin.current = null; }}><Canvas camera={{ position: [0.4, 0.35, 12.4], fov: 42 }} dpr={[1, 1.75]}><GraphScene {...props} /></Canvas><div className="sphere-status" data-interaction-guard="pass-through" aria-hidden="true"><span>NEURAL CONTAINMENT</span><i /> <b>LIVE FIELD</b></div><div className="canvas-hint" data-interaction-guard="pass-through"><span>DRAG</span> orbit <i /> <span>SCROLL</span> zoom <i /> <span>SELECT</span> inspect</div></div>;
}
