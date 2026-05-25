import Image from "next/image"
import { Section } from "./section"
import { photos } from "@/lib/testimonials"

/**
 * 03 신뢰 증거 — 사람 말투 한 줄 카드 4장 + 실제 현장 사진 3장(사기꾼 의심 차단).
 * 내부 placeholder("운영 입력") 노출은 결제 직전 신뢰를 깨므로 제거.
 */
const facts = [
  { body: "지금도 직접 올리는 셀러예요." },
  { body: "혼자 1만 개를 올려봤습니다." },
  { body: "강의 전에, 현업이 먼저입니다." },
  { body: "회사 다니며 애 재우고 올렸습니다." },
]

export function TrustEvidence() {
  return (
    <Section
      label="왜 믿어도 되나"
      title={<>강사이기 전에, 지금도 직접 올리는 셀러입니다.</>}
      lead="수익 자랑하려고 만든 페이지가 아닙니다. 확인할 수 있는 사실만 둡니다."
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {facts.map((f) => (
          <div
            key={f.body}
            className="flex border-2 border-foreground bg-background p-5 transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="text-base font-bold leading-snug tracking-tight sm:text-lg">
              {f.body}
            </div>
          </div>
        ))}
      </div>

      {/* 사진 3장 갤러리 — 페이지 핵심 메시지와 연결되는 감동 톤 캡션 */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <figure className="relative aspect-square overflow-hidden border-2 border-foreground bg-background">
          <Image
            src={photos.classroom}
            alt="용팀장 오프라인 강의실 — 각자의 상품을 가져와 같이 고치는 자리"
            fill
            sizes="(min-width:768px) 33vw, 100vw"
            className="object-cover"
          />
          <figcaption className="absolute bottom-0 left-0 right-0 bg-foreground/85 px-3 py-2.5 text-[11px] font-bold leading-snug text-background">
            혼자 1만 개 올리던 사람이,<br />같이 10개를 만드는 자리
          </figcaption>
        </figure>
        <figure className="relative aspect-square overflow-hidden border-2 border-foreground bg-background">
          <Image
            src={photos.groupMeetup}
            alt="용팀장 스터디 단체 사진 — 강의가 끝난 후 같이 가는 사람들"
            fill
            sizes="(min-width:768px) 33vw, 100vw"
            className="object-cover"
          />
          <figcaption className="absolute bottom-0 left-0 right-0 bg-foreground/85 px-3 py-2.5 text-[11px] font-bold leading-snug text-background">
            강의는 6주지만,<br />같이 가는 건 6주 뒤부터
          </figcaption>
        </figure>
        <figure className="relative aspect-square overflow-hidden border-2 border-foreground bg-background">
          <Image
            src={photos.groupHands}
            alt="용팀장 스터디 수강생들의 손모음 — 혼자 끙끙 앓던 사람들이 같이 시작하는 순간"
            fill
            sizes="(min-width:768px) 33vw, 100vw"
            className="object-cover"
          />
          <figcaption className="absolute bottom-0 left-0 right-0 bg-foreground/85 px-3 py-2.5 text-[11px] font-bold leading-snug text-background">
            ‘나만 이런 게 아니었구나’<br />— 같이 시작하는 손
          </figcaption>
        </figure>
      </div>

      {/* 1기 후기 자리 — 정직 안내 (사람 말투) */}
      <div className="mt-6 border-l-4 border-foreground bg-background p-6">
        <p className="text-sm leading-relaxed text-foreground/75 sm:text-base">
          <span className="font-bold text-foreground">1기 모집 중이에요.</span>{" "}
          아래 후기는 그동안 진행한 스터디·라이브 클래스 카페에 실제로 달린 글이고요.
          이번 6주 오프라인 실전반 1기는 <span className="font-bold text-foreground">‘첫 후기를 같이 만들 분들’</span>과 합니다.
          가짜 후기·부풀린 숫자는 안 넣습니다.
        </p>
      </div>
    </Section>
  )
}
