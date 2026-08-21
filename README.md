# 三生佳約 · JSCAFE 기준본

사용자가 직접 수정한 최신 GitHub ZIP을 기준으로 정리한 버전입니다.

## 행사 일정
- 2027년 12월 18일
- 2027년 12월 19일
- 총 2일 운영

## D-DAY
- 시작일: 2027-12-18
- 종료일: 2027-12-19
- 행사 전: D-N
- 12월 18일: D-DAY
- 12월 19일: DAY 2
- 행사 종료 후: CLOSED
- 화면 표시: `2027.12.18 — 12.19`

Pages CMS의 사이트 설정에서 시작일과 종료일을 각각 직접 수정할 수 있습니다.

## 눈 효과
기존 `magic-snowflakes` 눈 내리기 효과는 그대로 유지합니다.
별도의 ON/OFF 버튼은 추가하지 않았습니다.

## 정리한 내용
- 12월 17일로 남아 있던 공지/게시물/기본값을 12월 18~19일 기준으로 통일
- 일정에 12월 18일과 19일 두 운영일을 모두 추가
- fallback-data.js를 data 폴더의 최신 내용과 다시 동기화
- D-DAY 위젯을 이틀 행사기간형으로 변경
- index.html의 중복 구분선 제거
- 루트에 중복되어 있던 예전 JSON 5개와 header.png 제거
- 실제 데이터는 `data/*.json`, 헤더 이미지는 `assets/uploads/header.png`만 사용

## GitHub에서 한 번 삭제하면 좋은 예전 루트 파일
현재 저장소 루트에 아래 파일이 남아 있다면 삭제해도 됩니다.
사이트에서는 사용하지 않습니다.

- faq.json
- members.json
- posts.json
- schedule.json
- site.json
- header.png
