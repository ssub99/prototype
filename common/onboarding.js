/* Shared helpers for onboarding screens. Requires ds/rallyz.browser.js (window.Rallyz). */
(function () {
  const R = window.Rallyz;

  const $ = (tag, cls, kids = [], attrs = {}) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, v);
    n.append(...[].concat(kids).filter((k) => k != null));
    return n;
  };

  /** Field header: label (+필수) and an optional trailing node (button / checkbox). */
  function head(text, { required = false, trail } = {}) {
    const label = $("p", "field__label", [text]);
    if (required) label.append($("em", "", ["필수"]));
    return $("div", "field__head", [label, trail]);
  }
  function field(text, opts = {}, body = []) {
    const f = $("section", "field", [head(text, opts)]);
    if (opts.sub) f.append($("p", "field__sub", [opts.sub]));
    f.append(...[].concat(body));
    return f;
  }

  const screenOf = (node) => node.closest(".rz-device__screen") || document.querySelector(".rz-device__screen");
  const alert = (node, opts) => R.showAlert(screenOf(node), opts);

  /** Device shell: status bar + flow header + scroll body + optional footer. */
  function shell({ title, subtitle, step, lead = "prev", onLead, body = [], footer } = {}) {
    const scroll = $("div", "scroll", body);
    const header = R.FlowHeader({ title, subtitle, lead, trailText: step, onLead: onLead || (() => history.back()) });
    const screen = $("div", "screen", [R.StatusBar(), header, scroll, footer]);
    const device = R.Device({ children: [screen] });
    document.getElementById("root").append(device);
    return { device, screen, scroll, header, deviceScreen: device.querySelector(".rz-device__screen") };
  }

  /** Footer with primary button and optional "나중에 하기" text link. */
  function footer({ label = "완료", onClick, later } = {}) {
    const f = $("div", "footer" + (later ? " footer--link" : ""), [R.Button({ label, size: 56, onClick })]);
    if (later) {
      const l = $("button", "text-link", ["나중에 하기"], { type: "button" });
      l.addEventListener("click", later);
      f.append(l);
    }
    return f;
  }

  /** Values handed between screens (session only). */
  // 화면 사이로 넘기는 임시 값도 개선 전/후가 섞이지 않게 버전별 키(rz.<버전>.<이름>)로 둔다.
  const ver = (location.pathname.split("/").slice(-2, -1)[0] === "before" ? "before" : "after") + ((() => { try { return sessionStorage.getItem("proto.scn") === "2" ? "2" : "1"; } catch { return "1"; } })() === "2" ? "-s2" : ""); // 시나리오2 는 별도 칸
  const store = {
    get(k, d = "") { try { return sessionStorage.getItem(`rz.${ver}.${k}`) ?? d; } catch { return d; } },
    set(k, v) { try { sessionStorage.setItem(`rz.${ver}.${k}`, v); } catch { /* private mode */ } },
  };

  const go = (href) => (location.href = href);

  window.Onb = { $, head, field, shell, footer, alert, store, go, screenOf };
})();
