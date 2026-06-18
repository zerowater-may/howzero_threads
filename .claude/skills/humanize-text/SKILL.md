---
name: humanize-text
description: AI 톤(특히 한국어) 텍스트를 사람 말투로 정돈한다. lynote-ai/humanize-text(MIT)의 prompt 아이디어를 Claude 단독으로 동작하도록 한국어 맥락에 맞게 재설계. 외부 API 0개. 입력 → diff 제안까지만, 파일 자동 덮어쓰기 X (사용자 확인 후 적용). 트리거 — "humanize 해줘", "AI 맛 빼", "사람말투로 고쳐줘", "/humanize", brands/*/*.md 또는 components/*.tsx 카피 손볼 때.
---

# humanize-text — 한국어 사람 말투 정돈

## 출처

- 원본: [lynote-ai/humanize-text](https://github.com/lynote-ai/humanize-text) (MIT, 2026 Lynote.ai)
- 원본은 영어 → 중국어 → 일본어 → 핀란드어 → 영어 NMT chain + DeepSeek temp 1.3 rewrite로 AI fingerprint를 파괴한다.
- 이 스킬은 **원본의 prompt 아이디어만** 한국어용으로 추출했다. 외부 API(DeepSeek/Google/Niutrans) 호출 0. translation chain은 Claude가 내부적으로 시뮬레이션할 수 있으나 기본 모드는 **단일 rewrite**.

## 언제 발동하나

- 사용자가 "humanize", "AI 말투 빼", "사람말투", "/humanize"라고 말할 때
- `brands/*/braveyong_*/` 등 랜딩/콘텐츠 카피를 손볼 때 (자동 trigger는 안 함, reminder만)
- 텍스트 일부 또는 파일 path를 인자로 받음

## 절대 규칙

1. **파일을 자동으로 덮어쓰지 않는다.** 항상 diff/제안 형태로 사용자에게 먼저 보여주고, 사용자 확인을 받은 뒤에만 Edit/Write로 적용한다.
2. **고유명사·숫자·날짜·URL·해시태그·CTA 단어**는 절대 바꾸지 않는다.
3. **페르소나 톤 가이드가 있으면 그것이 우선.** (예: `brands/braveyong/braveyong_persona.md`, `brands/howzero/INDEX.md`) skill 기본 톤은 페르소나 톤을 깨지 않는다.
4. **사용자가 30번 다듬은 카피는 보존**한다. 명백한 AI 톤만 손대고, 사람 손길이 보이는 문장은 건드리지 않는다.
5. **결과 길이는 ±20% 안에서** 유지한다. 새 정보 추가 금지.

## 한국어 AI 톤 신호 (이걸 발견하면 손댐)

| 신호 | 예시 | 사람 말투 |
|---|---|---|
| 어미 통일 ("~할 수 있습니다" 반복) | "할 수 있습니다… 가능합니다… 합니다." | "할 수 있어요. 됩니다. 합니다." 섞기 |
| 추상명사화 ("개선이 가능합니다") | "효율성 증대" | "더 빨라져요" |
| 접속사 남발 ("특히/또한/하지만") | 매 문장 머리에 | 빼거나 분배 |
| 정답형 평행구조 ("첫째… 둘째… 셋째…") | 3개 한 세트 | 1개만 강조 |
| "여러분/우리는" 호명 반복 | 단락마다 | 한 번만 |
| 평어·존댓말 불일치 | "~합니다" + "~한다" 혼재 | 한쪽 통일 |
| 영어 직역체 ("~을 통해", "~에 대하여") | "AI를 통해 자동화" | "AI로 자동화" |
| 추상적 형용사 ("혁신적/획기적") | "혁신적인 솔루션" | 구체 동작 |
| 문장 길이 균일 | 모두 25~35자 | 짧음 + 김 섞기 (burstiness) |
| "결론적으로/요약하면" | 마무리에 의례적 | 빼기 |

## 처리 모드

### 모드 A — 단일 rewrite (기본)

가장 단순. 입력 한국어 → AI 톤 5종 점검 + 사람 말투로 정돈 → 출력.

작업 순서:
1. 페르소나 톤 가이드 로드 (있으면)
2. 입력 텍스트 분석 — 위 표 10개 신호 어디 걸렸는지 표시
3. rewrite — burstiness 강화(짧은 문장 섞기), 어미 다양화, 접속사 정리, 추상 → 구체
4. 의미 일관성 self-check — 원본 의미와 다른 부분 있으면 되돌림
5. 사용자에게 diff 형태로 제출

### 모드 B — chain 시뮬레이션 (`--chain` 또는 사용자 요청 시)

원본 도구의 핵심 트릭을 Claude 단독으로 시늉만 낸다. (외부 API 0)

```
한국어 → [Claude: 영어 의역] → [Claude: 일본어 의역] → [Claude: 한국어 재작성]
```

각 hop마다 temp 높임(상상 temp 1.3)을 의식해서 어순·구조 적극 흔든다. 단:
- **카피 의미·페르소나 손실 위험 큼**. 마케팅 카피엔 거의 권장하지 않음.
- 학술·블로그 등 긴 글 + AI detector 회피 목적일 때만 사용.

## 사용법

### CLI 같은 방식 (Claude 안에서)

```
사용자: /humanize <텍스트 또는 파일 경로> [--mode A|B] [--persona path] [--apply]

기본 동작:
- 텍스트면 직접 humanize → diff 출력
- 파일 경로면 Read → humanize → diff 출력
- --apply 명시 안 하면 자동 적용 X
- --persona path 지정 시 해당 톤 가이드 로드
```

### 인자

| 인자 | 기본값 | 의미 |
|---|---|---|
| `<input>` | (필수) | 텍스트 직접 입력 또는 파일 경로 |
| `--mode A` | A | A=단일 rewrite, B=chain 시뮬레이션 |
| `--persona <path>` | (없음) | 페르소나 톤 가이드 파일 경로 |
| `--apply` | false | diff 확인 없이 파일에 바로 적용 |
| `--max-change 0.3` | 0.3 | 원본 대비 변경 비율 상한 (0.0~1.0) |

### 예시

```bash
# 텍스트 단발
/humanize "이 강의는 효율적인 학습을 위해 설계된 혁신적인 솔루션입니다."

# 파일 + 페르소나
/humanize brands/braveyong/braveyong_landing_ai-selling-v2-portfolio/components/hero.tsx \
  --persona brands/braveyong/braveyong_persona.md

# chain 시뮬레이션 (학술 글)
/humanize docs/draft.md --mode B
```

## 출력 형식

```
## humanize 결과

### 감지된 AI 톤 (5)
- 어미 통일: "~할 수 있습니다" 4회 반복
- 추상명사화: "효율성 증대"
- ...

### diff
- 이 강의는 효율적인 학습을 위해 설계된 혁신적인 솔루션입니다.
+ 효율 학습? 이 강의가 그걸 합니다.

### 변경 비율
원본 200자 / 변경 후 180자 / 변경 비율 18%

### 적용?
- 파일에 적용하려면 `--apply` 다시 호출 또는 "적용해줘" 응답
```

## 페르소나 매핑 (자동 감지)

파일 경로에 따라 자동으로 다음 페르소나 로드:

| 경로 패턴 | 페르소나 파일 |
|---|---|
| `brands/braveyong/**` | `brands/braveyong/braveyong_persona.md` |
| `brands/howzero/**` | `docs/persona-howzero.md` |
| `brands/zipsaja/**` | `brands/zipsaja/INDEX.md` |
| `brands/mkt/**` | `brands/mkt/INDEX.md` |
| 그 외 | 페르소나 없음 (중립 한국어 사람말투) |

## 한국어 humanize core prompt (Claude가 실제로 쓰는 것)

> 다음 한국어 텍스트를 사람이 쓴 듯 자연스럽게 다시 써. 의미·정보·고유명사·숫자는 절대 바꾸지 마.
>
> 1) 같은 어미("~합니다" 등)가 3회 이상 연속이면 다른 어미로 섞어. 2) "특히/또한/하지만" 같은 접속사가 매 문장 머리에 있으면 빼거나 분배. 3) "효율성 증대" 같은 추상명사화는 동사형으로 풀어("더 빨라져요"). 4) "~을 통해/~에 대하여" 같은 영어 직역체는 자연 한국어로. 5) 모든 문장이 비슷한 길이면 짧은 토막(3~10자) 섞어 burstiness 줘. 6) 페르소나 톤 가이드가 있으면 그 톤을 따라.
>
> 출력 길이는 원본 ±20% 안. 새 정보 추가 금지. 결과만 출력.

## ⚠️ 마케팅 카피 적용 시 주의

이 스킬은 **academic/blog 글, FAQ, 일반 설명문**에는 안전하다. 단:

- **랜딩 hero 카피, CTA, 가격 박스** — 손길이 켜켜이 쌓인 결과물. 자동 적용 X. 항상 diff 보여주고 사용자 결정.
- **사람 인터뷰 인용, 페르소나 1인칭 문장** — 이미 사람말투. 손대지 말 것.
- **법적 문구, 약관, 환불 정책** — 톤 바꾸기 위험. skip.

## 가드 체크리스트 (rewrite 후 Claude 셀프 체크)

- [ ] 모든 고유명사·숫자·날짜·URL 보존?
- [ ] 의미가 원본과 같은가?
- [ ] 페르소나 톤(있다면) 깼나?
- [ ] 변경 비율이 `--max-change` 안인가?
- [ ] 새 약속·기능·가격 추가 안 했나?

하나라도 NO면 그 부분 되돌리고 사용자에게 표시.

## 모드 B(chain) 구현 가이드

Claude가 시뮬레이션할 때:

1. **한국어 → 영어** — 의역. 자연스러운 영어 마케팅 카피처럼.
2. **영어 → 일본어** — 의역. SOV 어순·조사 활용.
3. **일본어 → 한국어** — 자연스러운 한국어로. 이때 burstiness/어미/접속사 가이드 동시 적용.
4. 최종 결과만 사용자에게 보여주고, 중간 hop은 `--verbose`일 때만 노출.

⚠️ chain 모드는 의미 drift 가능성 높음. 페르소나·고유명사 가드 더 엄격히.

## 한 번에 여러 섹션 (subagent fan-out)

사용자가 "랜딩 모든 섹션 humanize"라고 하면:

1. 컴포넌트 list 출력 + 어떤 거 humanize할지 사용자 확인
2. 선택된 컴포넌트들만 병렬 subagent 호출 (Agent tool, general-purpose, multi-tool-use 한 번에)
3. 각 subagent는 이 SKILL을 따라 단일 파일 처리, diff 반환
4. 결과 통합해서 사용자에게 한 view로 제출
5. 적용은 사용자가 선택적으로 cherry-pick

**기본은 한 번에 한 파일**. 사용자가 명시적으로 fan-out 요청해야 병렬.
