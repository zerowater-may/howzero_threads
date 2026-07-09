"use client";

import { useEffect, useRef, type ReactNode } from "react";

// 스크롤 진입 시 무겁게 떠오르는 리빌. 뷰포트 안에 이미 있는 요소는 숨기지 않는다(플래시 방지).
// reduced-motion이면 아무것도 하지 않는다. JS 없으면 그냥 보인다(기본 노출).
export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.85) return; // 이미 보이는 건 안 숨김

    el.classList.add("reveal-init");
    el.style.transitionDelay = `${delay}ms`;
    const show = () => {
      el.classList.add("reveal-in");
      io.disconnect();
      clearTimeout(failSafe);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) show();
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    // 어떤 이유로든 IO가 안 울리면 콘텐츠를 영영 숨기지 않는다 (안전 우선)
    const failSafe = setTimeout(show, 6000);
    return () => {
      io.disconnect();
      clearTimeout(failSafe);
    };
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
