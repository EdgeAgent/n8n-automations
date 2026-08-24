// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

const orbitControlsSpy = vi.fn();

vi.mock("@react-three/fiber", () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="neural-canvas">{children}</div>,
  useFrame: () => undefined,
}));

vi.mock("@react-three/drei", () => ({
  OrbitControls: (props: Record<string, unknown>) => {
    orbitControlsSpy(props);
    return <div data-testid="orbit-controls" />;
  },
}));

import { NEURAL_ORBIT_CONTROLS, NeuralBrain } from "./NeuralBrain";

describe("contained neural sphere interactions", () => {
  it("keeps the brain graph inside an interactive orbit canvas with visible zoom and node-inspection guidance", () => {
    const { container } = render(<NeuralBrain mode="thinking" selectedId="core" onSelect={() => undefined} />);

    expect(screen.getByLabelText(/contained in a reactive AI sphere/i)).toBeTruthy();
    expect(screen.getByText("NEURAL CONTAINMENT")).toBeTruthy();
    expect(screen.getByText("SCROLL")).toBeTruthy();
    expect(orbitControlsSpy).toHaveBeenCalledWith(expect.objectContaining(NEURAL_ORBIT_CONTROLS));
    expect(container.querySelectorAll('[data-interaction-guard="pass-through"]')).toHaveLength(2);
  });

  it("keeps bounded orbit distances and all user navigation modes enabled after the sphere is added", () => {
    expect(NEURAL_ORBIT_CONTROLS).toMatchObject({ enablePan: true, enableZoom: true, enableRotate: true, minDistance: 5.5, maxDistance: 17 });
  });

  it("keeps contained neural nodes directly selectable after the sphere is added", () => {
    const onSelect = vi.fn();
    const { container } = render(<NeuralBrain mode="thinking" selectedId="core" onSelect={onSelect} />);
    const researchNode = container.querySelector('mesh[name="node-research"]');
    expect(researchNode).toBeTruthy();
    fireEvent.click(researchNode!);
    expect(onSelect).toHaveBeenCalledWith("research");
  });
});
