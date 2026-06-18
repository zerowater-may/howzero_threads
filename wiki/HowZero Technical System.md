# HowZero Technical System

## 전체 구성

하우제로 기술 시스템은 Python 자동화, Next.js 대시보드, 콘텐츠 생성 스크립트, 서버 배포/worker로 나뉜다.

## Python 레이어

`pyproject.toml` 기준 프로젝트명은 `howzero-threads`다.

주요 역할:

- Threads API 자동화.
- 댓글 수집.
- 자동 포스팅.
- 이메일 발송.
- 콘텐츠 리퍼포징.
- YouTube transcript/highlight 추출.
- zipsaja 데이터 수집.
- 콘텐츠 렌더링/첨부자료/캡션 생성.

주요 패키지:

- `requests`, `httpx`
- `python-dotenv`
- `apscheduler`
- `pydantic-settings`
- 선택 의존성: `playwright`, `psycopg2-binary`, `paramiko`, `sshtunnel`, `jinja2`, `openpyxl`, `anthropic`, `openai`

## Next.js 레이어

`howzero-web/`는 Next.js 기반 웹/대시보드다.

주요 스크립트:

- `npm run dev`: `next dev --port 3100`
- `npm run worker`: BullMQ worker 실행
- `npm run build`: production build
- `npm run lint`: ESLint

주요 의존성:

- Next.js 16, React 19.
- BullMQ, ioredis.
- postgres.
- jose, bcryptjs.
- React Query, React Hook Form, Zod.
- lucide-react, Radix UI, Tailwind.

## 운영 서비스

서버 표준 위치는 환경 변수 기반이다.

- 콘텐츠 서버 repo: `$HOWZERO_SERVER_REPO_DIR`
- 서버 env: `$HOWZERO_SERVER_ENV_FILE`
- 웹 서비스: `$HOWZERO_WEB_SERVICE`
- worker 서비스: `$HOWZERO_WORKER_SERVICE`
- dashboard 서비스: `$HOWAAA_DASHBOARD_SERVICE`

서버에서 콘텐츠 생성 시 로컬 렌더를 쓰지 않고 `/opt/howzero` 기준 스크립트를 실행하는 것이 표준이다.

## 주요 명령

```bash
scripts/run_server_auto_pipeline.sh zipsaja
scripts/run_server_pipeline.sh zipsaja "주제"
python3 -m scripts.pipeline howzero "주제"
python3 -m scripts.zernio_publish <bundle> --platform instagram --instagram-media reel --now
```

## 관련 페이지

- [[HowZero Content Pipeline]]
- [[HowZero Product Lineup]]
- [[HowZero Source Map]]

## Sources

- `pyproject.toml`
- `howzero-web/package.json`
- `AGENTS.md`
- `src/`
- `scripts/`
- `howzero-web/`
