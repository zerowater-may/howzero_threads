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
          6주가 끝나면 강의는 끝나도, 같이 가는 사람들은 그때부터입니다.<br />
          매월 한 번 강남에서 만나서, 정책이 바뀌고 네이버 로직이 바뀌고 시장이 바뀌어도{" "}
          <span className="text-foreground">혼자 다시 막히지 않게 같이 업데이트</span>합니다.
        </p>
        <p className="font-memo mt-4 text-base leading-relaxed text-foreground/75 sm:text-lg">
          강의의 <span className="marker">진짜 가치는 졸업 후</span>에 있습니다.<br />
          한 번 듣고 끝나는 시장이 아니니까요.
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
            비용·일정·장소는 1기 졸업 시점에 개별 안내드립니다.
          </p>
          <hr className="my-4 border-foreground/10" />
          <ul className="space-y-2.5">
            <li className="flex items-start gap-2.5 text-sm">
              <Check className="mt-0.5 h-4 w-4 flex-none" />
              본강의 졸업자 한정
            </li>
            <li className="flex items-start gap-2.5 text-sm">
              <Check className="mt-0.5 h-4 w-4 flex-none" />
              매월 1회 오프라인 정기 모임
            </li>
            <li className="flex items-start gap-2.5 text-sm">
              <Check className="mt-0.5 h-4 w-4 flex-none" />
              상세 비용·일정은 졸업 시점에 안내
            </li>
          </ul>
          <div className="mt-4 border border-[var(--warm-border)] bg-[var(--warm)] p-4 text-sm font-bold">
            1기 수강생은 졸업 후 스터디 우선 참여권을 드립니다.
          </div>
        </div>
      </div>
    </Section>
  )
}
