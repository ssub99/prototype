/* 프로토타입 지문 — 목업 왼쪽 패널(common/home-chip.js가 불러와 그린다). 내용만 여기서 고친다.
 *   intro: 첫 박스(역할/상황 설명), steps: 지문 한 줄이 박스 하나(번호는 자동).
 *   버전별로 지문이 다르다: before/ 화면은 RZ_SCENARIOS.before, after/ 화면은 RZ_SCENARIOS.after 를 쓴다. */
(function () {
  const intro = ["당신은 중·고등학생들에게 수학을 가르치는 학원장입니다.", "아래의 지령에 따라 순서대로 진행해 주세요.", "진행하면서 서비스 이용에 필요한 내용들은", "서비스내의 안내사항에 따라 진행하시면 됩니다."];
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
  ["before", "after"].forEach((k) => { window.RZ_SCENARIOS_2[k].intro[0] = "당신은 중·고등학생들에게 주요 과목을 가르치는 학원장입니다."; }); // 시나리오2 타이틀
  window.RZ_SCENARIOS_2.after.steps[0] = "신규 원생의 청구서를 발생해야 합니다. 청구서 관리 기능을 통해 청구서를 생성해 주세요."; // 시나리오2 개선 후 1번 지문
  window.RZ_SCENARIOS_2.after.steps.push("학생 1명을 추가 등록 후 해당 학생의 출석을 진행해 주세요."); // 시나리오2 개선 후만 4번 지문이 더 있다
  const v = /\/after\//.test(location.pathname) ? "after" : "before";
  const scn = (() => { try { return sessionStorage.getItem("proto.scn") === "2" ? "2" : "1"; } catch { return "1"; } })();
  window.RZ_SCENARIO = (scn === "2" ? window.RZ_SCENARIOS_2 : window.RZ_SCENARIOS)[v];
})();
