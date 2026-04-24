# 프로덕션 보안 체크리스트

Paperclip B2B SaaS MVP 배포 전 필수 보안 항목.

---

## 1. 에이전트 권한 제어

- [ ] `dangerouslySkipPermissions: false` — `init-paperclip.sh`에 반영 완료
- [ ] 에이전트별 `adapterConfig`에서 `dangerouslySkipPermissions: false` 확인
- [ ] 고객사 에이전트는 필요한 도구만 화이트리스트 방식으로 허용
- [ ] 에이전트 `maxTurnsPerRun` 제한값 설정 (기본 300 이하)

```bash
# 에이전트 권한 확인 명령
npx paperclipai agent list --instance production --format json | \
  jq '.[] | {name, dangerouslySkipPermissions: .adapterConfig.dangerouslySkipPermissions}'
```

## 2. 인증 및 접근 제어

- [ ] `disableSignUp: true` — `init-paperclip.sh`에 반영 완료
- [ ] `deploymentMode: cloud` + `exposure: authenticated` 설정 완료
- [ ] 초기 관리자 계정을 CLI로 생성 (웹 회원가입 차단)
- [ ] MFA 도입 — Paperclip 지원 시 즉시 활성화, 미지원 시 nginx 레벨 IP 제한으로 대체

```bash
# 관리자 계정 생성
npx paperclipai user create --instance production --email admin@howzero.co --role admin

# nginx IP 제한 (MFA 대체)
# paperclip.conf 의 /api/auth/ 블록에 추가:
#   allow 고정_IP;
#   deny all;
```

## 3. 고객사별 Docker 컨테이너 격리

- [ ] `docker-compose.customer.yml` 템플릿으로 고객사별 독립 컨테이너 실행
- [ ] 컨테이너 리소스 제한 (CPU 2코어, 메모리 4GB)
- [ ] 불필요한 커널 기능 제거 (`cap_drop: ALL`)
- [ ] 고객사 간 네트워크 격리 (독립 서브넷)

```bash
# 고객사 A 컨테이너 실행 예시
CUSTOMER_ID=customer-a \
CUSTOMER_WORKSPACE=/opt/paperclip/workspaces/customer-a \
CUSTOMER_SUBNET=1 \
docker compose -f docker-compose.customer.yml up -d
```

## 4. PostgreSQL 보안

- [ ] 별도 PostgreSQL 프로세스 (Docker 컨테이너)
- [ ] 로컬 바인딩만 허용 (`127.0.0.1:5432`)
- [ ] 강력한 비밀번호 설정 (`openssl rand -base64 32`)
- [ ] 고객사별 스키마 분리 (Paperclip 멀티컴퍼니 기본 지원)

## 5. nginx HTTPS + 보안 헤더

- [ ] Let's Encrypt SSL 인증서 발급
- [ ] TLS 1.2+ 강제 (1.0/1.1 차단)
- [ ] HSTS 헤더 (1년, includeSubDomains, preload)
- [ ] X-Frame-Options, X-Content-Type-Options, X-XSS-Protection 헤더
- [ ] API rate limiting (30r/s) + 로그인 rate limiting (5r/m)
- [ ] fail2ban nginx-limit-req jail 활성화

## 6. 백업 및 복구

- [ ] 일간 자동 백업 (`backup-db.sh` + systemd timer 매일 03:00)
- [ ] 보존 정책: 일간 7일 / 주간 4주 / 월간 3개월
- [ ] 백업 복원 테스트 (분기 1회)

```bash
# 백업 복원 테스트
gunzip -c /opt/paperclip/instances/production/data/backups/daily/latest.sql.gz | \
  psql -h 127.0.0.1 -U paperclip -d paperclip_test
```

## 7. 서비스 안정성

- [ ] systemd 자동 재시작 (`Restart=always`, `RestartSec=5`)
- [ ] 시작 실패 보호 (`StartLimitBurst=5`, `StartLimitIntervalSec=60`)
- [ ] systemd 보안 강화 (`NoNewPrivileges`, `ProtectSystem=strict`, `PrivateTmp`)

## 8. 모니터링 및 알림

- [ ] 5분 간격 헬스체크 (`healthcheck.sh` + systemd timer)
- [ ] HTTP, PostgreSQL, Redis, 디스크, systemd 서비스 상태 확인
- [ ] Telegram 또는 Slack 알림 연동
- [ ] 장애/복구 상태 전환 시에만 알림 (알림 폭주 방지)

## 9. 서버 기본 보안

- [ ] UFW 방화벽 (SSH + 80 + 443만 허용)
- [ ] fail2ban SSH 보호 (5회 실패 → 1시간 차단)
- [ ] SSH 키 인증만 허용 (비밀번호 인증 비활성화)

---

## 배포 순서

```
1. setup-server.sh 실행 (시스템 + Docker + 방화벽 + fail2ban)
2. .env 파일 생성 (비밀번호 + 알림 토큰)
3. docker compose up -d (PostgreSQL + Redis)
4. init-paperclip.sh 실행 (Paperclip 프로덕션 설정)
5. systemctl enable --now paperclip (서비스 등록)
6. certbot 실행 (SSL 인증서)
7. nginx 설정 복사 + reload
8. systemctl enable --now paperclip-backup.timer (백업 타이머)
9. systemctl enable --now paperclip-healthcheck.timer (헬스체크 타이머)
10. 관리자 계정 생성 + 에이전트 권한 확인
```
