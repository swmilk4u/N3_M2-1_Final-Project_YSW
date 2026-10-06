# 나도사장 브랜드 포스터
제작 방식: 내장 imagegen 이미지 생성 및 편집.
현재 문구: 나도사장 / 사업 아이디어 저장소.
자산: src/client/brand-poster.png

## 문구 편집 프롬프트
Edit the attached existing 나도사장 promotional poster. Change ONLY the Korean tagline text under the large blue brand title: replace '아이디어를 사업으로' with the exact text '사업 아이디어 저장소'. Spell it verbatim: 사업 [space] 아이디어 [space] 저장소. Keep it on one line, bold dark navy Korean sans-serif, same position and approximate visual weight; adjust font size slightly only if necessary to fit the original left text area. Preserve the blue '나도사장' title, the cute raccoon CEO's identity, face, pose, fur, blue blazer, business-plan folder, laptop, desk, plants, background growth graphic, color palette, lighting, wide 16:9 composition, and bottom three labels '아이디어' '창업 공고' '지원서'. No other added or changed text, no play icon, no watermark. Precise text replacement, final production marketing poster.

## 홈 미디어 교체
src/client/media.js의 heroMediaConfig.youtubeUrl에 유튜브 영상 주소를 입력하면 포스터 대신 영상을 표시합니다.
빈 값이면 현재 CEO 너구리 포스터를 표시합니다.
