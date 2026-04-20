# Whisper Transcript Fallback — 별도 버전 Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development 또는 superpowers:executing-plans. 체크박스(`- [ ]`) 문법 사용.

**Goal:** YouTube에 자막이 없는 영상(라이브 전용 자막만 있거나 자막이 아예 꺼진 경우)에서도 `scripts/yt_highlights`가 동작하도록, 오디오를 Whisper로 자체 전사해서 `transcript.json`을 만드는 **독립 버전**을 추가한다. 기존 `youtube-transcript-api` 경로는 그대로 두고 **선택 가능한 대안**으로 병존시킨다.

**Architecture:** `scripts/yt_highlights/transcript.py`에 `fetch_transcript_whisper(video_path) -> list[TranscriptSegment]` 함수를 추가하고, `__main__.py`에 `--transcript-source {auto|api|whisper}` 플래그를 추가한다. `auto`(기본) = API 먼저, 실패 시 Whisper. `api` = API만. `whisper` = Whisper만. 모델은 로컬 `whisper.cpp` 또는 `openai-whisper` PyPI 중 사용자 환경에 따라 택 1. 기본은 `whisper.cpp` (CPU 실용적, 한국어 `ggml-large-v3-turbo.bin` 권장).

**Tech Stack:**
- 기존 파이프라인 그대로
- NEW: `whisper.cpp` CLI (`brew install whisper-cpp`) 또는 `openai-whisper` PyPI
- NEW: `ffmpeg`으로 `.mp4` → 16 kHz WAV 변환 (이미 의존성에 있음)
- 테스트: 1초 무음 WAV fixture로 모킹

**통합 금지 원칙:** 이 Plan은 **별도 선택지**를 추가한다. 기본 API 경로가 여전히 `auto` 기본 동작. 사용자가 `--transcript-source whisper`로 명시적으로 선택하거나, API가 실패했을 때만 발동.

---

## 의사결정 포인트 (구현 시작 전 확정)

- [ ] **엔진 선택**: `whisper.cpp` (기본 추천, 외부 바이너리) vs `openai-whisper` (pip 설치, GPU 가속)
- [ ] **모델 크기**: `turbo`(빠름, 한국어 양호) vs `large-v3`(정확도 최상, 10배 느림)
- [ ] **비용/속도 가드**: 10분 영상 기준 transcript 추출 최대 몇 분까지 허용할지

## Task 1: WAV 추출 함수 (ffmpeg 래퍼)

**Files:**
- Modify: `scripts/yt_highlights/transcript.py` (함수 추가)
- Modify: `tests/yt_highlights/test_transcript.py` (테스트 추가)

TDD:
- [ ] 테스트 `test_extract_audio_invokes_ffmpeg_with_16khz_mono_pcm` — 명령 인자 검증 (subprocess mocked)
- [ ] 구현 `extract_audio_wav(video_path, out_path) -> Path`
- [ ] 통과 확인 후 commit: `"yt-highlights: whisper용 16kHz WAV 추출 함수 추가"`

## Task 2: whisper.cpp CLI 래퍼

**Files:**
- Modify: `scripts/yt_highlights/transcript.py`
- Modify: `tests/yt_highlights/test_transcript.py`

TDD:
- [ ] 테스트: subprocess mock으로 whisper-cpp JSON 출력 stub → `TranscriptSegment` 리스트 변환 검증
- [ ] 테스트: whisper-cpp 바이너리 없을 때 `WhisperNotInstalledError` raise
- [ ] 구현 `fetch_transcript_whisper(video_path, model="turbo", language="ko") -> list[TranscriptSegment]`
  - 내부: `extract_audio_wav` 호출 → `whisper-cli -m models/ggml-<model>.bin -l ko -oj <audio.wav>` → JSON 파싱
- [ ] Commit: `"yt-highlights: whisper.cpp 기반 자체 전사 함수 추가"`

## Task 3: CLI 플래그 통합

**Files:**
- Modify: `scripts/yt_highlights/__main__.py`
- Modify: `tests/yt_highlights/test_cli.py`

TDD:
- [ ] 테스트: `--transcript-source api` 지정 시 whisper 호출 안 됨
- [ ] 테스트: `--transcript-source whisper` 지정 시 API 호출 안 됨
- [ ] 테스트: `auto`(기본) 시 API 실패 → whisper 호출됨
- [ ] 구현: argparse에 `--transcript-source` 추가, 디스패치 로직
- [ ] Commit: `"yt-highlights: --transcript-source 플래그 추가"`

## Task 4: 한국어 영상 스모크 테스트 (수동)

- [ ] 자막 비활성화된 유튜브 영상 하나 선택
- [ ] `python3 -m scripts.yt_highlights "<URL>" --out /tmp/whisper-smoke --transcript-source whisper` 실행
- [ ] 전사 품질 육안 체크 (50개 이상 segment, 한국어 글자 깨지지 않음)
- [ ] README에 스모크 결과 추가 후 commit

---

## Out of Scope
- 영어 외 다국어 fallback
- Whisper 정확도 튜닝 (초기에는 `turbo` 한 가지로 시작)
- 실시간 스트리밍 (YouTube 라이브)
- 오디오 정규화/잡음 제거 — 필요해지면 다음 plan

## Risks

| 리스크 | 대응 |
|---|---|
| whisper.cpp 미설치 | 명확한 에러 메시지 + README 설치 가이드 |
| 모델 파일(.bin) 없음 | 첫 실행 시 `whisper-cli --help`로 자동 체크 + 다운로드 안내 |
| 10분 영상 전사 3분+ 소요 | `--max-duration` 플래그로 가드, 초과 시 샘플링 경고 |
| WAV 파일 누적 | `out_dir/audio.wav` 재사용 + 선택적 `--cleanup-audio` |
