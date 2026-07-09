"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { PRESETS, PRESET_ORDER, type PresetKey, type OsNodeData } from "./presets";

// react-flow는 SSR 불가 — 클라이언트 래퍼(이 파일) 안에서 dynamic 로드 (스펙 §5 주의)
const FlowCanvas = dynamic(() => import("./FlowCanvas"), {
  ssr: false,
  loading: () => (
    <div className="canvas-dots h-[420px] w-full animate-pulse rounded-xl border border-[var(--line)]" />
  ),
});

export default function OsCanvas() {
  const [preset, setPreset] = useState<PresetKey>("cs");
  const [selected, setSelected] = useState<OsNodeData | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const onSelect = useCallback((d: OsNodeData | null) => setSelected(d), []);

  return (
    <div>
      {/* 업무별 프리셋 탭 */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="업무별 자동화 파이프라인">
        {PRESET_ORDER.map((key) => (
          <button
            key={key}
            role="tab"
            aria-selected={preset === key}
            onClick={() => setPreset(key)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              preset === key
                ? "border-[var(--cobalt)] bg-[var(--cobalt)] text-black"
                : "border-[var(--line)] bg-transparent text-[var(--dim)] hover:text-[var(--ink)]"
            }`}
          >
            {PRESETS[key].label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {isMobile ? (
          /* 모바일 폴백 — 같은 정보의 세로 스텝 리스트 (스펙 §4) */
          <ol className="space-y-3">
            {PRESETS[preset].nodes.map((node, i) => (
              <li key={node.id} className="rounded-lg border border-[var(--line)] bg-[var(--card)] p-4">
                <div className="flex items-center gap-2">
                  <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--cobalt)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-bold">{node.data.label}</span>
                  <span className="text-xs text-[var(--dim)]">{node.data.sub}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[var(--dim)]">{node.data.detail}</p>
              </li>
            ))}
          </ol>
        ) : (
          <>
            <FlowCanvas preset={preset} onSelect={onSelect} />
            <p className="mt-2 text-xs text-[var(--dim)]">
              노드를 끌어서 움직이고, 클릭하면 각 단계가 하는 일을 볼 수 있습니다.
            </p>
            {/* 상세 카드 */}
            <div
              aria-live="polite"
              className={`mt-4 rounded-xl border border-[var(--line)] bg-[var(--card)] p-5 transition-opacity ${
                selected ? "opacity-100" : "opacity-60"
              }`}
            >
              {selected ? (
                <>
                  <p className="text-sm font-bold">
                    {selected.label} <span className="ml-1 font-normal text-[var(--dim)]">{selected.sub}</span>
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--dim)]">{selected.detail}</p>
                </>
              ) : (
                <p className="text-sm text-[var(--dim)]">노드를 클릭하면 이 자리에 단계 설명이 나옵니다.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
