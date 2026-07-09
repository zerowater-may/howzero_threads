"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  type Node,
  type NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nodeTypes } from "./nodes";
import { PRESETS, type PresetKey, type OsNodeData } from "./presets";

interface Props {
  preset: PresetKey;
  onSelect: (data: OsNodeData | null) => void;
}

export default function FlowCanvas({ preset, onSelect }: Props) {
  const [nodes, setNodes] = useState<Node<OsNodeData>[]>(PRESETS[preset].nodes);

  // 탭 전환 시 노드셋 교체 + 선택 해제
  useEffect(() => {
    setNodes(PRESETS[preset].nodes);
    onSelect(null);
  }, [preset, onSelect]);

  const onNodesChange = useCallback(
    (changes: NodeChange<Node<OsNodeData>>[]) => setNodes((ns) => applyNodeChanges(changes, ns)),
    [],
  );

  return (
    <div className="canvas-dots h-[420px] w-full rounded-xl border border-[var(--line)]">
      <ReactFlow
        nodes={nodes}
        edges={PRESETS[preset].edges.map((e) => ({
          ...e,
          animated: true,
          style: { stroke: "#3f3f46" },
        }))}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onNodeClick={(_, node) => onSelect(node.data)}
        onPaneClick={() => onSelect(null)}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        nodesConnectable={false}
        deleteKeyCode={null}
        colorMode="dark"
        style={{ background: "transparent" }}
      />
    </div>
  );
}
