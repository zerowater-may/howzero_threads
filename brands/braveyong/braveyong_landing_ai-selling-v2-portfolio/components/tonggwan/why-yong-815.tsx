import Image from "next/image"
import { Section } from "@/components/section"
import { Signature } from "@/components/handwriting"
import { photos } from "@/lib/testimonials"

/**
 * 권위 섹션 — 전직 공인인증서 담당 + 현직 셀러라는 이중 당사자성을 증명.
 * 얼굴 사진 + 1인칭 4문단 + 팩트카드 4장 + 현장사진 4장(trust-evidence figure 패턴 차용).
 */
const FACTS = [
  "전직 공인인증서 담당",
  "지금도 직접 올리는 현직 셀러",
  "혼자 1만 개 등록",
  "실전반 1기 + 스터디 운영",
]

const FIELD_PHOTOS = [
  {
    src: photos.classroom,
    alt: "용팀장 강남 오프라인 실전반 강의실 현장",
    caption: "강남 오프라인 실전반 현장",
  },
  {
    src: photos.groupMeetup,
    alt: "AI셀링 실전반 1기 수료 단체사진",
    caption: "1기 수료 단체사진",
  },
  {
    src: photos.groupHands,
    alt: "강의가 끝난 뒤에도 이어지는 스터디 — 수강생들의 손모음",
    caption: "강의 끝나고도 같이 가는 스터디",
  },
  {
    src: photos.studyDesk,
    alt: "노트북을 펴고 둘러앉아 같이 고치는 스터디 자리",
    caption: "노트북 펴고 같이 고치는 자리",
  },
]

export function WhyYong815() {
  return (
    <Section
      id="why-yong"
      tone="light"
      label="WHO"
      title={<>전직 공인인증서 담당, 현직 구매대행 셀러입니다.</>}
    >
      <div className="grid gap-8 md:grid-cols-[auto_1fr] md:gap-10">
        {/* 좌측 — 얼굴 + 서명 */}
        <div className="flex flex-col items-start gap-4">
          <Image
            src="/assets/face.jpg"
            alt="용감한 용팀장 — 현직 구매대행·글로벌위탁 셀러"
            width={220}
            height={220}
            className="h-[220px] w-[220px] border-2 border-foreground object-cover grayscale"
          />
          <Signature small="현직 구매대행·글로벌위탁 셀러">용감한 용팀장</Signature>
        </div>

        {/* 우측 — 1인칭 멘트 3문단 + 팩트카드 4장 */}
        <div className="flex flex-col gap-6">
          <div className="space-y-4 text-base leading-relaxed text-foreground/80 sm:text-lg">
            <p>
              <span className="font-bold text-foreground">공인인증서를 일로 다루던 사람</span>입니다. 인증서가 어떤
              순서로 나오고, 어디서 막히는지 업무로 겪어봤습니다.
            </p>
            <p>
              강의가 본업이 아닙니다. 지금도 <span className="font-bold text-foreground">구매대행·글로벌위탁을 직접</span>{" "}
              돌립니다. 8.15는 남 일이 아니라 제 일이고, 제 사업자부터 이 방법으로 등록합니다.
            </p>
            <p>
              혼자 상품 <span className="font-bold text-foreground">1만 개를 직접</span> 올려봤습니다. 직장 다니면서,
              애 재우고 올리던 시절도 있었습니다. 여러분이 지금 서 있는 자리에서 출발했다는 뜻입니다.
            </p>
            <p>
              올해 서울 강남에서 <span className="font-bold text-foreground">AI셀링 실전반 1기</span>를 오프라인으로
              열었고, 강의가 끝나도 스터디로 같이 갑니다. 한 번 팔고 사라지는 장사는 안 합니다.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {FACTS.map((f) => (
              <div key={f} className="border-2 border-foreground p-3 text-sm font-bold leading-snug sm:text-base">
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 현장 사진 4장 — 말이 아니라 장면으로 증명 */}
      <div className="mt-10 grid gap-3 grid-cols-2 sm:grid-cols-4">
        {FIELD_PHOTOS.map((p) => (
          <figure key={p.src} className="relative aspect-square overflow-hidden border-2 border-foreground bg-background">
            <Image
              src={p.src}
              alt={p.alt}
              fill
              sizes="(min-width:640px) 25vw, 50vw"
              className="object-cover"
            />
            <figcaption className="absolute bottom-0 left-0 right-0 bg-foreground/85 px-3 py-2 text-[11px] font-bold leading-snug text-background">
              {p.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  )
}
