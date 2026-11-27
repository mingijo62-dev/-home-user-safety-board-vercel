# 자체안전점검 시정조치 현황판 (Vercel)

13개 파트의 자체안전점검 시정요구사항을 등록·조치·완료까지 한 화면에서 모니터링하는 웹앱입니다.
점검 양식 PPT(.pptx)를 올리면 슬라이드별 시정요구가 자동 등록됩니다.

- 화면: `public/index.html` (프레임워크 없음)
- API: `api/*.js` (Vercel Functions)
  - `GET/POST/PATCH/DELETE /api/items` 시정요구
  - `GET/PUT /api/parts` 파트 목록
  - `POST /api/upload` 사진 업로드
- 데이터: Neon Postgres (Vercel Storage) — 첫 요청 때 테이블이 자동으로 만들어집니다
- 사진: Vercel Blob (공개 URL)

## 배포 순서

1. **Vercel에서 저장소 가져오기**
   vercel.com → Add New → Project → 이 GitHub 저장소 Import → Framework Preset은 **Other** 그대로 → Deploy

2. **DB 연결 (Neon Postgres)**
   프로젝트 → Storage → Create Database → **Neon** (Serverless Postgres) → 프로젝트에 Connect
   → `DATABASE_URL` 환경변수가 자동으로 추가됩니다.

3. **사진 저장소 연결 (Blob)**
   프로젝트 → Storage → Create → **Blob** → 프로젝트에 Connect
   → `BLOB_READ_WRITE_TOKEN` 환경변수가 자동으로 추가됩니다.

4. **다시 배포**
   Deployments → 최신 배포의 ⋯ → Redeploy (환경변수는 재배포해야 반영됩니다)

5. 배포 주소(`https://<프로젝트명>.vercel.app`)를 열면 파트 10개가 들어간 빈 현황판이 나옵니다.

이후 `main` 브랜치에 커밋하면 자동으로 다시 배포됩니다.

## 참고

- 접근 제한이 없습니다. 주소를 아는 사람은 누구나 보고, 등록·수정·삭제할 수 있습니다.
  검색엔진 노출은 `noindex`로 막아 두었습니다. 제한이 필요해지면 Vercel의 Deployment Protection(비밀번호 보호, Pro 요금제)을 켜거나 로그인 기능을 추가하세요.
- 사진은 Blob 공개 URL로 저장되어 URL을 아는 사람은 볼 수 있습니다.
- 파트 목록 기본값은 `api/_lib.js`의 `DEFAULT_PARTS`입니다(처음 한 번만 적용). 이후에는 화면의 ‘파트 설정’에서 바꿉니다.
- 화면은 15초마다 자동으로 새로 고쳐져 다른 파트가 입력한 내용이 반영됩니다.
