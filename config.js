// 레고님이 직접 고치는 설정 파일입니다. 따옴표("") 안의 글자만 바꾸세요.

export const CONFIG = {
  // 한 달 목표 금액(원)
  goal: 1000000,

  // 금액을 읽어 오는 주소: 구글 시트 '특별당비 현황판 요약 (공개)' (docs/시트-연결-방법.md 참고)
  sheetCsvUrl: "https://docs.google.com/spreadsheets/d/1Ap-Wv_A-SduDcBwQFygw3AxA0IoVoimIVYuhYlWWjeo/gviz/tq?tqx=out:csv&sheet=%EC%9A%94%EC%95%BD&headers=1",

  // 사연 칸. {월급날} 자리에는 다가오는 월급날(예: 12월 20일)이 자동으로 들어갑니다.
  storyTitle: "앗! 당직자 월급이 부족하다!",
  story: "현재 매월 경상지출 350만 원. 당원들께서 소중한 특별당비를 70여만 원씩 모아주고 계시지만, 돌아오는 {월급날} 당직자 월급날에 당장 월급이 부족한 상황입니다. 당직자 한 명, 사무실 한 칸, 도당의 활동을 지켜주세요. (도당위원장도 지켜주시고요...)",

  // 참여 방법 1. 특별당비 일시납
  bank: "신한은행",
  account: "140-011-219011",
  holder: "정의당 경상남도당 백아형",
  depositMemo: "본인 실명",

  // 참여 방법 2. 5만 원 특당비 2년 약정 문의처
  contactPhone: "010-9387-7003",
  contactName: "사무처장 이소정",
};
