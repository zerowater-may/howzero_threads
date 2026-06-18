import Image from "next/image"
import { Section } from "./section"
import { Check } from "lucide-react"
import { photos } from "@/lib/testimonials"

/** 11 졸업 후 오프라인 스터디 — 실제 모임·스터디 사진으로 증거 보강 */
const how = [
  "매월 한 번, 강남에서 오프라인 정기 모임",
  "매 모임마다 용팀장 특강 1타임 — 매번 새로운 주제로",
  "남는 시간은 같이 실습하고, 막힌 부분 풀어드려요",
  "정책·시장 바뀔 때마다 신규 내용으로 업데이트",
]

export function Study() {
  return (
    <Section
      label="졸업 후에도 이어집니다"
      title={<>보통 강의는 끝나면 거기서 끝나죠.</>}
    >
      <div className="mb-6 border-l-4 border-foreground bg-background p-6">
        <p className="text-lg font-bold leading-snug sm:text-xl">
          저는 <span className="text-foreground">끝나고 나서가 더 중요하다</span>고 생각해요.<br />
          5주가 끝나도 매월 한 번 강남에서 같이 모여요. 정책이 바뀌고, 네이버 로직이 바뀌고, 시장이 바뀌어도 — 천천히 같이 따라갑니다.
        </p>
        <p className="font-memo mt-4 text-base leading-relaxed text-foreground/75 sm:text-lg">
          <span className="marker">같이 한다는 게,</span> 5주짜리 약속이 아니어서요.
        </p>
      </div>

      {/* 실제 스터디 사진 — 노트북 가져와 매월 모인다는 증거 */}
      <figure className="relative mb-6 aspect-[16/9] overflow-hidden border-2 border-foreground bg-background">
        <Image
          src={photos.studyDesk}
          alt="용팀장 오프라인 스터디 모임 — 노트북을 둘러앉아 실습하는 매월 모임"
          fill
          sizes="(min-width:768px) 900px, 100vw"
          className="object-cover"
        />
        <figcaption className="absolute bottom-0 left-0 right-0 bg-foreground/85 px-4 py-2.5 text-sm font-bold text-background">
          매월 오프라인 정기 모임 — 노트북 가져와 함께 실습
        </figcaption>
      </figure>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="border-2 border-foreground bg-background p-6">
          <h3 className="mb-3 text-lg font-bold tracking-tight">운영 방식</h3>
          <ul className="space-y-2.5">
            {how.map((h) => (
              <li key={h} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 h-4 w-4 flex-none" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-2 border-foreground bg-background p-6">
          <h3 className="mb-3 text-lg font-bold tracking-tight">참여 안내</h3>
          <p className="text-sm leading-relaxed text-foreground/75">
            <span className="font-bold text-foreground">강제 참여 아닙니다.</span> 의지 있는 분만 참여하는 선택 과정입니다.
            비용·일정·장소는 2기 졸업 시점에 개별 안내드립니다.
          </p>
          <hr className="my-4 border-foreground/10" />
          <ul className="space-y-2.5">
            <li className="flex items-start gap-2.5 text-sm">
              <Check className="mt-0.5 h-4 w-4 flex-none" />
              5주 본강의를 끝낸 분만 참여하실 수 있어요.
            </li>
            <li className="flex items-start gap-2.5 text-sm">
              <Check className="mt-0.5 h-4 w-4 flex-none" />
              매월 한 번, 강남에서 오프라인으로 모입니다.
            </li>
            <li className="flex items-start gap-2.5 text-sm">
              <Check className="mt-0.5 h-4 w-4 flex-none" />
              비용·일정은 졸업하실 때 따로 안내드려요.
            </li>
          </ul>
          <div className="mt-4 border border-[var(--warm-border)] bg-[var(--warm)] p-4 text-sm font-bold">
            2기 수강생은 졸업 후 스터디 우선 참여권을 드립니다.
          </div>
        </div>
      </div>
    </Section>
  )
}
