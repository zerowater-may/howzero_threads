"use client";

export default function MicroCta({ label = "→ 우리 회사도 되는지 물어보기" }: { label?: string }) {
  return (
    <button
      onClick={() => {
        document.getElementById("hero-chat")?.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
          document.querySelector<HTMLInputElement>("#hero-chat input")?.focus({ preventScroll: true });
        }, 600);
      }}
      className="mt-8 font-[family-name:var(--font-mono)] text-sm font-semibold text-[var(--cobalt)] hover:underline"
    >
      {label}
    </button>
  );
}
