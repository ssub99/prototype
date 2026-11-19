/* 프로토타입 지문 — 목업 왼쪽 패널(common/home-chip.js가 불러와 그린다). 내용만 여기서 고친다.
 *   intro: 첫 박스(역할/상황 설명), steps: 지문 한 줄이 박스 하나(번호는 자동).
 *   버전별로 지문이 다르다: before/ 화면은 RZ_SCENARIOS.before, after/ 화면은 RZ_SCENARIOS.after 를 쓴다. */
(function () {
  const intro = ["당신은 고등학생들을 대상으로 하는 수학학원을 운영하고 있는 학원장 입니다.", "노후된 프로그램과  ‘네이버 밴드(BAND)’ 관리하는 것이 불편하여 효율적으로 관리하기 위해 관련된 툴을 찾아보다\n‘랠리즈’를 알게되고 도입을 고려하고 있는 중에 우리 학원에 적합한지 테스트가 필요한 상황입니다.", "아래의 지령을 숙지하고 지문들을 순서대로 진행해 주세요.", "1. 원내의 반이 고등학교 학년별로 기초반/내신반/심화반 으로 총 9개의 클래스를 운영하고 있습니다.", "2. 내년에 고등학교 2학년을 대상으로 수능에 대비하여 클래스를 신설하려 합니다.", "3. 수능 대비반에 소속될 학생은 총 3명입니다.(소속되는 아래의 명단을 참고해 주세요.)"];
  window.RZ_ROSTER = { head: ["구분", "이름", "학생 휴대폰번호", "보호자 연락처", "학원 입학일", "수강료 납부일", "성별", "학교", "학년"], rows: [["1", "김배컴", "010-5341-2583", "010-3512-2573", "2026.11.20", "매달 26일", "남", "서울고등학교", "고등 2학년"], ["2", "송타요", "010-6324-2353", "010-6234-3594", "2026.11.20", "매달 20일", "여", "강남여고", "고등 2학년"], ["3", "차피치", "010-3510-2493", "010-8931-1225", "2026.11.20", "매달 1일", "남", "대치고", "고등 2학년"]] }; // 학생명단 표(Notion 사용성 테스트 시나리오 상단 표)
  window.RZ_SCENARIOS = {
    before: {
      intro,
      steps: [
        "학원셋팅을 완료해 주세요.",
        "피드를 작성해 주세요.(내용 상관없음.)",
        "등록된 학생의 출석을 진행해야 합니다. 출석관리 기능을 통해 해당 학생의 출석체크를 진행해 주세요.",
      ],
    },
    after: {
      intro,
      steps: [
        "학원셋팅을 완료해 주세요.",
        "등록된 학생의 청구서를 학생에게 발송해야 합니다. 청구서 관리 기능을 통해 청구서를 생성해 주세요.",
        "생성된 청구서를 학생에게 발송해 주세요.",
      ],
    },
  };
  // 시나리오2: 지문 문구는 시나리오1과 같다(복사본이라 따로 고칠 수 있다). 데이터·스톱워치·컨벤션 기록은 시나리오1과 완전히 따로다.
  const copy = (sc) => ({ intro: [...sc.intro], steps: [...sc.steps] });
  window.RZ_SCENARIOS_2 = { before: copy(window.RZ_SCENARIOS.before), after: copy(window.RZ_SCENARIOS.after) };
  window.RZ_SCENARIOS_2.after.steps.shift(); // 시나리오2 개선 후는 "학원셋팅"/"클래스 생성·학생 등록" 1번 지문이 없다 — 번호는 자동으로 다시 매겨진다
  window.RZ_SCENARIOS_2.before.steps[0] = "클래스와 학생을 등록/생성하여 학원 셋팅을 완료해 주세요."; // 시나리오2 개선 전 1번 지문(학원은 이미 생성돼 있다)
  // 시나리오2·3 타이틀은 시나리오1과 같다("…고등학생들에게 수학을 가르치는 학원장입니다.") — 상단 검정 박스(intro)는 세 시나리오 공통
  window.RZ_SCENARIOS_2.after.steps[0] = "신규 원생의 청구서를 발생해야 합니다. 청구서 관리 기능을 통해 청구서를 생성해 주세요."; // 시나리오2 개선 후 1번 지문
  window.RZ_SCENARIOS_2.after.steps.push("학생 1명을 추가 등록 후 해당 학생의 출석을 진행해 주세요."); // 시나리오2 개선 후만 4번 지문이 더 있다
  // 시나리오3: 시나리오2 를 복사해 1번 지문만 바꾼다(데이터·스톱워치·컨벤션 기록은 따로). 상단 검정 박스(intro)는 모두 같다.
  window.RZ_SCENARIOS_3 = { before: copy(window.RZ_SCENARIOS_2.before), after: copy(window.RZ_SCENARIOS_2.after) };
  window.RZ_SCENARIOS_3.before.steps[0] = "수능 대비반을 생성하고 소속된 학생 3명을 등록해 주세요.";
  window.RZ_SCENARIOS_3.after.steps[0] = "신규 원생 중 송타요 학생의 청구서를 발송해야 합니다. 청구서 관리 기능을 통해 청구서를 생성해 주세요.";
  const v = /\/after\//.test(location.pathname) ? "after" : "before";
  const scn = (() => { try { const k = sessionStorage.getItem("proto.scn"); return k === "2" || k === "3" ? k : "1"; } catch { return "1"; } })();
  window.RZ_SCENARIO = ({ 1: window.RZ_SCENARIOS, 2: window.RZ_SCENARIOS_2, 3: window.RZ_SCENARIOS_3 })[scn][v];
})();
