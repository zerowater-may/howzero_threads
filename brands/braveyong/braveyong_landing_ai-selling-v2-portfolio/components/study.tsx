import Image from "next/image"
import { Section } from "./section"
import { Check } from "lucide-react"
import { photos } from "@/lib/testimonials"

/** 11 졸업 후 오프라인 스터디 — 실제 모임·스터디 사진으로 증거 보강 */
const how = [
  "매월 1회 오프라인 정기 모임",
  "매 모임마다 용팀장 특강 1타임",
  "남는 시간은 실습 + Q&A",
  "정책·시장 변화에 맞춘 신규 내용 업데이트",
]

export function Study() {
  return (
    <Section
      label="졸업 후에도 이어집니다"
      title={<>6주 강의는 시작일 뿐입니다.</>}
    >
      <div className="mb-6 border-l-4 border-foreground bg-background p-6">
        <p className="text-lg font-bold leading-snug sm:text-xl">
          졸업 후에는 매월 1회 오프라인 스터디로 계속 만나서 함께 성장합니다.<br />
          정책이 바뀌고, 네이버 로직이 바뀌고, 시장이 바뀌어도{" "}
          <span className="text-foreground">혼자 다시 막히지 않도록 계속 업데이트</span>합니다.
        </p>
      </div>

      {/* 실제 스터디·모임 사진 — 강의가 아니라 매월 모이는 모임이라는 증거 */}
      <div className="mb-6 grid gap-3 md:grid-cols-2">
        <figure className="relative aspect-[4/3] overflow-hidden border-2 border-foreground bg-background">
          <Image
            src={photos.studyDesk}
            alt="용팀장 오프라인 스터디 모임 — 노트북을 둘러앉아 실습"
            fill
            sizes="(min-width:768px) 50vw, 100vw"
            className="object-cover"
          />
          <figcaption className="absolute bottom-0 left-0 right-0 bg-foreground/85 px-3 py-2 text-xs font-bold text-background">
            매월 오프라인 정기 모임 — 노트북 가져와 함께 실습
          </figcaption>
        </figure>
        <figure className="relative aspect-[4/3] overflow-hidden border-2 border-foreground bg-background">
          <Image
            src={photos.groupMeetup}
            alt="용팀장 스터디 단체 사진 — 서울 강남 모임 직후"
            fill
            sizes="(min-width:768px) 50vw, 100vw"
            className="object-cover"
          />
          <figcaption className="absolute bottom-0 left-0 right-0 bg-foreground/85 px-3 py-2 text-xs font-bold text-background">
            서울 강남 — 실제 매월 모이는 분들
          </figcaption>
        </figure>
      </div>

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
          <h3 className="mb-3 text-lg font-bold tracking-tight">비용</h3>
          <div className="text-3xl font-bold tracking-tight">
            15<span className="ml-1 text-base font-bold text-foreground/65">만원 / 3개월</span>
          </div>
          <p className="mt-2 text-sm text-foreground/65">월 5만원 꼴입니다.</p>
          <hr className="my-4 border-foreground/10" />
          <p className="flex items-start gap-2.5 text-sm">
            <Check className="mt-0.5 h-4 w-4 flex-none" />
            강제 참여 아님 — 의지 있는 분만 참여
          </p>
          <div className="mt-4 border border-[var(--warm-border)] bg-[var(--warm)] p-4 text-sm font-bold">
            1기 수강생은 졸업 후 스터디 우선 참여권을 드립니다.
          </div>
        </div>
      </div>
    </Section>
  )
}
