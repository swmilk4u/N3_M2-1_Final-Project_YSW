# 나도사장 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 저장한 창업 아이디어로 지원사업에 대응하는 웹 MVP를 만든다.
**Architecture:** 모듈형 웹 UI와 저장 API. 로컬 파일 저장, 배포 D1 저장. 정부 공고 스냅샷과 초안 생성 로직을 분리해 후속 RAG 교체 지점을 제공한다.
**Tech Stack:** HTML/CSS/ES modules, Node HTTP server, Cloudflare Worker, D1.
**Spec:** docs/superpowers/specs/2026-10-07-nadosajang-design.md

## Global Constraints
- 화면에 시연용 표시를 넣지 않는다.
- 실제 공고는 원문 링크와 확인일을 제공한다. 금액·자격·날짜를 지어내지 않는다.
- 없는 매출·수상·경력을 초안에 생성하지 않는다.
- 새로고침 후 프로필/아이디어/초안/스크랩/지원상태가 유지된다.

## Review Focus
- 빈 아이디어: 생성 전에 입력 화면으로 안내한다.
- 다른 지역의 공고: 자격 충족으로 단정하지 않는다.
- 입력한 HTML: 문자로 출력한다.
- 저장 실패: 입력을 유지하고 재시도를 제공한다.
- 중복 생성: 기존 수정본을 덮어쓰지 않는다.

### Task 1: 데이터와 저장
**Files:** src/client/domain.js, src/client/notices.js, src/server/api.mjs, scripts/dev.mjs, db/schema.ts, tests/domain.test.mjs.
**Interfaces:** initialState(), matchNotice(notice,profile,idea), filterNotices(notices,filters,profile,idea), createDraft(notice,idea), validateState(state), handleApi(request,store).
- [x] 핵심 데이터 테스트를 작성하고 실패를 확인한다.
- [x] 공식 공고 스냅샷, 순수 도메인 함수, 로컬/배포 저장 API를 구현한다.
- [x] 단위 테스트와 저장 API 확인을 통과한다.

### Task 2: 사용자 흐름
**Files:** src/client/index.html, styles.css, app.js.
**Interfaces:** Task 1 도메인 함수와 /api/state의 GET/PUT.
- [x] 홈/공고/아이디어/지원서/지원현황 화면과 연결된 동작을 구현한다.
- [x] 수정값을 유지하는 저장 실패 처리를 구현한다.
- [x] 브라우저 핵심 흐름과 모바일 화면을 검증한다.

### Task 3: 배포와 인계
**Files:** scripts/build.mjs, src/server/worker.mjs, README.md, .openai/hosting.json.
- [x] 빌드·마이그레이션을 확인하고 소스/배포 파일을 준비한다.
- [x] 비공개 배포 결과와 소스 실행 방법을 인계한다.
