# Face-Aware Crop — 별도 버전 Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** 현재 `frames.py`가 중앙 크롭(`crop='min(iw,ih*3/4)':'min(ih,iw*4/3)'`)으로 1080×1440 3:4 이미지를 만드는데, 얼굴이 가장자리에 있으면 잘릴 수 있다. **얼굴 검출 결과를 반영한 대안 크롭 함수**를 추가한다. 기존 중앙 크롭은 그대로 남겨두고 선택 가능하게 한다.

**Architecture:** `scripts/yt_highlights/frames.py`에 `extract_frame_face_aware(video_path, timestamp, out_path)` 함수를 추가한다. 구현은 2단계: (1) ffmpeg으로 원본 프레임을 임시 PNG로 뽑고, (2) `mediapipe`로 얼굴 박스 감지, (3) 얼굴 중심점을 기준으로 3:4 크롭을 계산해서 다시 ffmpeg으로 최종 JPG 생성. 얼굴이 없거나 여러 개면 중앙 크롭으로 자동 폴백. CLI에 `--crop {center|face}` 플래그 추가.

**Tech Stack:**
- 기존 ffmpeg 그대로
- NEW: `mediapipe>=0.10` (PyPI, `pyproject.toml [yt]`에 추가)
- NEW: `Pillow` (이미 numpy 의존성 통해 간접)
- 테스트: 얼굴 있는/없는/여러 개인 정적 이미지 fixture 3장

**통합 금지 원칙:** 이 Plan은 **대안 크롭 알고리즘**을 추가한다. 기본값은 여전히 `center`. 사용자가 `--crop face`를 명시하면만 발동.

---

## 의사결정 포인트 (구현 시작 전 확정)

- [ ] **얼굴 엔진**: `mediapipe.FaceDetection` (기본, 가볍고 CPU 실시간) vs `insightface` (정확하지만 무거움)
- [ ] **여러 얼굴 시 규칙**: 가장 큰 얼굴 / 화면 중앙에 가장 가까운 얼굴 / 중앙 크롭 폴백
- [ ] **박스 여유(padding)**: 얼굴 박스의 몇 %를 상하좌우 여유로 둘지 (기본 안: 높이의 50%)

## Task 1: 얼굴 검출 함수 (isolated)

**Files:**
- Create: `scripts/yt_highlights/face.py`
- Create: `tests/yt_highlights/test_face.py`
- Create: `tests/yt_highlights/fixtures/face_center.jpg` (얼굴 1개 중앙)
- Create: `tests/yt_highlights/fixtures/face_offside.jpg` (얼굴 1개 좌상단)
- Create: `tests/yt_highlights/fixtures/no_face.jpg` (풍경)

TDD:
- [ ] 테스트 `test_detect_largest_face_returns_box_center_and_size` (with fixture)
- [ ] 테스트 `test_detect_returns_none_when_no_face`
- [ ] 테스트 `test_detect_picks_largest_of_multiple_faces`
- [ ] 구현 `detect_largest_face(image_path) -> Optional[FaceBox]`
  - `FaceBox = namedtuple('FaceBox', 'cx cy w h image_w image_h')`
- [ ] Commit: `"yt-highlights: mediapipe 기반 얼굴 검출 모듈"`

## Task 2: 얼굴 중심 크롭 계산

**Files:**
- Modify: `scripts/yt_highlights/frames.py`
- Modify: `tests/yt_highlights/test_frames.py`

TDD (순수 산술, mediapipe 필요 없음):
- [ ] 테스트 `test_compute_face_crop_rect_keeps_face_centered_within_3_4`
- [ ] 테스트 `test_compute_face_crop_rect_clamps_to_image_bounds` (얼굴이 가장자리여도 크롭 박스가 이미지 안에 있도록)
- [ ] 구현 `compute_face_crop_rect(face_box, target_ratio=(3,4)) -> CropRect`
  - 출력 `CropRect = (x, y, w, h)` — ffmpeg `crop=w:h:x:y`에 바로 넣을 수치
- [ ] Commit: `"yt-highlights: 얼굴 중심 3:4 크롭 사각형 계산"`

## Task 3: 얼굴 기반 프레임 추출 함수

**Files:**
- Modify: `scripts/yt_highlights/frames.py`
- Modify: `tests/yt_highlights/test_frames.py`

TDD (mediapipe는 mock):
- [ ] 테스트 `test_extract_frame_face_aware_falls_back_to_center_when_no_face` — `detect_largest_face` returns None
- [ ] 테스트 `test_extract_frame_face_aware_uses_computed_rect_when_face_found`
- [ ] 구현 `extract_frame_face_aware(video_path, timestamp, out_path) -> Path`:
  1. `extract_frame_raw(video_path, timestamp, tmp.png)` — 크롭 없는 원본 저장 (비공개 헬퍼)
  2. `detect_largest_face(tmp.png)` → FaceBox 또는 None
  3. None이면 기존 `extract_frame` 호출(중앙 크롭)로 위임
  4. 아니면 `compute_face_crop_rect` → ffmpeg `crop=W:H:X:Y` 적용해 최종 JPG
- [ ] Commit: `"yt-highlights: 얼굴 중심 크롭 extract_frame_face_aware 추가"`

## Task 4: CLI 플래그

**Files:**
- Modify: `scripts/yt_highlights/__main__.py`
- Modify: `tests/yt_highlights/test_cli.py`

TDD:
- [ ] 테스트: `--crop center`(기본) 시 기존 `extract_frames_for_span` 사용
- [ ] 테스트: `--crop face` 시 `extract_frames_for_span_face_aware` 사용
  - (extract_frames_for_span 자체를 복사/수정한 버전 or face=True 플래그를 받는 파라미터)
- [ ] 구현: argparse에 `--crop {center,face}` 추가, 분기 로직
- [ ] Commit: `"yt-highlights: --crop 플래그 추가"`

## Task 5: 실 영상 스모크 테스트

- [ ] 인물이 등장하는 한국어 유튜브 영상으로 `--crop face` 실행
- [ ] 프레임 몇 장을 눈으로 비교: 중앙 크롭 vs 얼굴 중심 크롭
- [ ] README에 비교 스크린샷 섹션 추가 후 commit

---

## Out of Scope
- 얼굴 흐림 처리 (블러/모자이크) — 방송 얼굴 노출에 대한 별도 윤리/법적 검토 필요
- 얼굴 이외 주체 (음식, 제품) 중심 크롭 — 다른 plan
- 동영상 전체에 걸친 얼굴 추적 (Tracking) — 지금은 단일 프레임 시점만
- 연예인 자동 식별

## Risks

| 리스크 | 대응 |
|---|---|
| mediapipe macOS arm64 설치 이슈 | `pyproject.toml`에 플랫폼 마커 명시. 설치 실패 시 중앙 크롭으로 폴백 |
| 뉴스 자료 화면 등 얼굴이 블러된 씬 | 얼굴 못 찾으면 중앙 크롭 (이미 반영) |
| 여러 사람 + 한 명만 발화 중 | Task 1 단계에서 "가장 큰 얼굴" 규칙. 향후 "화면 중앙 가장 가까운" 옵션 |
| 얼굴 흐림 처리 요구 | out of scope. 필요 시 별도 plan |
