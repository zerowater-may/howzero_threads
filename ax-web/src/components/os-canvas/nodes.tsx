"use client";

import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import type { OsNodeData, OsNodeKind } from "./presets";

// 레퍼런스(flow-*.jpg)의 카드형 노드 — 다크 재해석
const KIND_STYLE: Record<OsNodeKind, { border: string; badge: string; badgeText: string }> = {
  trigger: { border: "border-[var(--line)]", badge: "bg-zinc-700 text-white", badgeText: "TRIGGER" },
  ai: { border: "border-[var(--cobalt)]/60", badge: "bg-[var(--cobalt)] text-black", badgeText: "AI" },
  gate: { border: "border-dashed border-[var(--dim)]", badge: "bg-zinc-600 text-white", badgeText: "HUMAN" },
  running: { border: "border-[var(--ok)]/70", badge: "bg-[var(--ok)] text-black", badgeText: "RUNNING" },
};

export function OsNode({ data, selected }: NodeProps<Node<OsNodeData>>) {
  const s = KIND_STYLE[data.kind];
  return (
    <div
      className={`w-[200px] cursor-pointer rounded-lg border bg-[var(--card)] px-3.5 py-3 shadow-[0_4px_16px_rgba(0,0,0,0.4)] transition-shadow ${s.border} ${
        selected ? "ring-2 ring-[var(--cobalt)]" : ""
      }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-[var(--dim)]" />
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-[var(--ink)]">{data.label}</span>
        <span
          className={`flex items-center gap-1 rounded px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[9px] font-semibold ${s.badge} ${
            data.kind === "running" ? "pulse-dot" : ""
          }`}
        >
          {s.badgeText}
        </span>
      </div>
      <p className="mt-1 text-xs text-[var(--dim)]">{data.sub}</p>
      <Handle type="source" position={Position.Right} className="!bg-[var(--dim)]" />
    </div>
  );
}

export const nodeTypes = { os: OsNode };
