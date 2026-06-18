# A. 수집 결과

- URL: `https://youtu.be/lkpxv0H3TG0?si=IkScu0W9PImHA2NI`
- 영상 ID: `lkpxv0H3TG0`
- 제목: `광고 없이 네이버 상위에 꽂아버리는 3가지 치트키 마지막은 진짜 대박입니다 | 바로 따라해보세요`
- 채널: `용감한용팀장 - 셀러를 위한 AI 사용법`
- 길이: 758초

## A-02 MCPTube ingest

- 결과: 부분 성공
- 저장 위치: `.mcptube/mcptube.db`, `.mcptube/wiki.db`
- 등록된 챕터: 12개
- 등록된 transcript segment: 0개
- 이슈:
  - YouTube subtitle API가 `HTTP Error 429: Too Many Requests`를 반환했다.
  - OpenAI quota 오류로 MCPTube의 auto-classification/wiki ingest가 실패했다.
  - 따라서 MCPTube는 metadata와 chapter 중심으로만 사용 가능하다.

## A-03 yt_highlights fallback

- 결과: 성공
- transcript segment: 390개
- scene: 93개
- highlight span: 12개
- frame: 24장
- 핵심 파일:
  - `yt-highlights/highlights.json`
  - `yt-highlights/transcript.json`
  - `yt-highlights/scenes.json`
  - `yt-highlights/frames/h01_f01.jpg` ~ `h12_f02.jpg`
  - `yt-highlights/lkpxv0H3TG0.mp4`
  - `yt-highlights/lkpxv0H3TG0.info.json`

## 다음 단계 메모

B 단계로 넘어가면 `yt-highlights/highlights.json`과 `transcript.json`을 기본 소스로 사용한다. MCPTube wiki는 이번 실행에서 AI ingest가 비었으므로 보조 소스로 보지 않는다.
