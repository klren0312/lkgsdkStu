var ue = Object.defineProperty;
var de = (n, i, e) => i in n ? ue(n, i, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[i] = e;
var y = (n, i, e) => (de(n, typeof i != "symbol" ? i + "" : i, e), e);
import z from "@lookingglass/webxr-polyfill/src/api/index";
import he from "@lookingglass/webxr-polyfill/src/api/XRSystem";
import fe from "@lookingglass/webxr-polyfill/src/WebXRPolyfill";
import * as pe from "holoplay-core";
import { Shader as X } from "holoplay-core";
import me from "@lookingglass/webxr-polyfill/src/devices/XRDevice";
import be from "@lookingglass/webxr-polyfill/src/api/XRSpace";
import { mat4 as _, vec3 as U } from "gl-matrix";
import ve, { PRIVATE as we } from "@lookingglass/webxr-polyfill/src/api/XRWebGLLayer";
const O = 1.6;
var Y;
(function(n) {
  n[n.Swizzled = 0] = "Swizzled", n[n.Center = 1] = "Center", n[n.Quilt = 2] = "Quilt";
})(Y || (Y = {}));
class Ee extends EventTarget {
  constructor(e) {
    super();
    y(this, "_calibration", {
      configVersion: "1.0",
      pitch: { value: 45 },
      slope: { value: -5 },
      center: { value: -0.5 },
      viewCone: { value: 40 },
      invView: { value: 1 },
      verticalAngle: { value: 0 },
      DPI: { value: 338 },
      screenW: { value: 250 },
      screenH: { value: 250 },
      flipImageX: { value: 0 },
      flipImageY: { value: 0 },
      flipSubp: { value: 0 },
      serial: "LKG-DEFAULT-#####"
    });
    y(this, "_viewControls", {
      tileHeight: 512,
      numViews: 48,
      trackballX: 0,
      trackballY: 0,
      targetX: 0,
      targetY: O,
      targetZ: -0.5,
      targetDiam: 2,
      fovy: 13 / 180 * Math.PI,
      depthiness: 1.25,
      inlineView: Y.Center,
      capturing: !1,
      quiltResolution: 3840,
      popup: null,
      XRSession: null,
      lkgCanvas: null,
      appCanvas: null
    });
    y(this, "LookingGlassDetected");
    this._viewControls = { ...this._viewControls, ...e }, this.syncCalibration();
  }
  syncCalibration() {
    new pe.Client((e) => {
      if (e.devices.length < 1) {
        console.log("No Looking Glass devices found");
        return;
      }
      e.devices.length > 1 && console.log("More than one Looking Glass device found... using the first one"), this.calibration = e.devices[0].calibration;
    });
  }
  addEventListener(e, s, t) {
    super.addEventListener(e, s, t);
  }
  onConfigChange() {
    this.dispatchEvent(new Event("on-config-changed"));
  }
  get calibration() {
    return this._calibration;
  }
  set calibration(e) {
    this._calibration = {
      ...this._calibration,
      ...e
    }, this.onConfigChange();
  }
  updateViewControls(e) {
    e != null && (this._viewControls = {
      ...this._viewControls,
      ...e
    }, this.onConfigChange());
  }
  get tileHeight() {
    return Math.round(this.framebufferHeight / this.quiltHeight);
  }
  get quiltResolution() {
    return this._viewControls.quiltResolution;
  }
  set quiltResolution(e) {
    this.updateViewControls({ quiltResolution: e });
  }
  get numViews() {
    return this.quiltWidth * this.quiltHeight;
  }
  get targetX() {
    return this._viewControls.targetX;
  }
  set targetX(e) {
    this.updateViewControls({ targetX: e });
  }
  get targetY() {
    return this._viewControls.targetY;
  }
  set targetY(e) {
    this.updateViewControls({ targetY: e });
  }
  get targetZ() {
    return this._viewControls.targetZ;
  }
  set targetZ(e) {
    this.updateViewControls({ targetZ: e });
  }
  get trackballX() {
    return this._viewControls.trackballX;
  }
  set trackballX(e) {
    this.updateViewControls({ trackballX: e });
  }
  get trackballY() {
    return this._viewControls.trackballY;
  }
  set trackballY(e) {
    this.updateViewControls({ trackballY: e });
  }
  get targetDiam() {
    return this._viewControls.targetDiam;
  }
  set targetDiam(e) {
    this.updateViewControls({ targetDiam: e });
  }
  get fovy() {
    return this._viewControls.fovy;
  }
  set fovy(e) {
    this.updateViewControls({ fovy: e });
  }
  get depthiness() {
    return this._viewControls.depthiness;
  }
  set depthiness(e) {
    this.updateViewControls({ depthiness: e });
  }
  get inlineView() {
    return this._viewControls.inlineView;
  }
  set inlineView(e) {
    this.updateViewControls({ inlineView: e });
  }
  get capturing() {
    return this._viewControls.capturing;
  }
  set capturing(e) {
    this.updateViewControls({ capturing: e });
  }
  get popup() {
    return this._viewControls.popup;
  }
  set popup(e) {
    this.updateViewControls({ popup: e });
  }
  get XRSession() {
    return this._viewControls.XRSession;
  }
  set XRSession(e) {
    this.updateViewControls({ XRSession: e });
  }
  get lkgCanvas() {
    return this._viewControls.lkgCanvas;
  }
  set lkgCanvas(e) {
    this.updateViewControls({ lkgCanvas: e });
  }
  get appCanvas() {
    return this._viewControls.appCanvas;
  }
  set appCanvas(e) {
    this.updateViewControls({ appCanvas: e });
  }
  get aspect() {
    return this._calibration.screenW.value / this._calibration.screenH.value;
  }
  get tileWidth() {
    return Math.round(this.framebufferWidth / this.quiltWidth);
  }
  get framebufferWidth() {
    return this._calibration.screenW.value < 7e3 ? this._viewControls.quiltResolution : 7680;
  }
  get quiltWidth() {
    return this.calibration.screenW.value == 1536 ? 8 : this.calibration.screenW.value == 3840 || this.calibration.screenW.value > 7e3 ? 5 : 8;
  }
  get quiltHeight() {
    return this.calibration.screenW.value == 1536 ? 6 : this.calibration.screenW.value == 3840 || this.calibration.screenW.value > 7e3 ? 9 : 6;
  }
  get framebufferHeight() {
    return this._calibration.screenW.value < 7e3 ? this._viewControls.quiltResolution : 4320;
  }
  get viewCone() {
    return this._calibration.viewCone.value * this.depthiness / 180 * Math.PI;
  }
  get tilt() {
    return this._calibration.screenH.value / (this._calibration.screenW.value * this._calibration.slope.value) * (this._calibration.flipImageX.value ? -1 : 1);
  }
  set tilt(e) {
  }
  get subp() {
    return 1 / (this._calibration.screenW.value * 3);
  }
  get pitch() {
    const e = this._calibration.screenW.value / this._calibration.DPI.value;
    return this._calibration.pitch.value * e * Math.cos(Math.atan(1 / this._calibration.slope.value));
  }
}
let H = null;
function S() {
  return H == null && (H = new Ee()), H;
}
function K(n) {
  const i = S();
  n != null && i.updateViewControls(n);
}
async function ye() {
  const n = S();
  let i = 2;
  function e() {
    if (n.appCanvas != null)
      try {
        let t = n.appCanvas.toDataURL();
        const l = document.createElement("a");
        l.style.display = "none", l.href = t, l.download = `hologram_qs${n.quiltWidth}x${n.quiltHeight}a${n.aspect}.png`, document.body.appendChild(l), l.click(), document.body.removeChild(l), window.URL.revokeObjectURL(t);
      } catch (t) {
        console.error("Error while capturing canvas data:", t);
      } finally {
        n.inlineView = i;
      }
  }
  const s = document.getElementById("screenshotbutton");
  s && s.addEventListener("click", () => {
    i = n.inlineView;
    const t = V.getInstance();
    if (!t) {
      console.warn("LookingGlassXRDevice not initialized");
      return;
    }
    n.inlineView = 2, t.captureScreenshot = !0, setTimeout(() => {
      t.screenshotCallback = e;
    }, 100);
  });
}
function ge() {
  var i;
  const n = S();
  if (console.log(n, "for debugging purposes"), n.lkgCanvas == null)
    console.warn("window placement called without a valid XR Session!");
  else {
    let e = function() {
      let r = f.d - f.a, c = f.w - f.s;
      r && c && (r *= Math.sqrt(0.5), c *= Math.sqrt(0.5));
      const d = n.trackballX, g = n.trackballY, x = Math.cos(d) * r - Math.sin(d) * Math.cos(g) * c, P = -Math.sin(g) * c, F = -Math.sin(d) * r - Math.cos(d) * Math.cos(g) * c;
      n.targetX = n.targetX + x * n.targetDiam * 0.03, n.targetY = n.targetY + P * n.targetDiam * 0.03, n.targetZ = n.targetZ + F * n.targetDiam * 0.03, requestAnimationFrame(e);
    };
    const s = document.createElement("style");
    document.head.appendChild(s), (i = s.sheet) == null || i.insertRule("#LookingGlassWebXRControls * { all: revert; font-family: sans-serif }");
    const t = document.createElement("div");
    t.id = "LookingGlassWebXRControls", t.style.position = "fixed", t.style.zIndex = "1000", t.style.padding = "15px", t.style.width = "320px", t.style.maxWidth = "calc(100vw - 18px)", t.style.maxHeight = "calc(100vh - 18px)", t.style.whiteSpace = "nowrap", t.style.background = "rgba(0, 0, 0, 0.6)", t.style.color = "white", t.style.borderRadius = "10px", t.style.right = "15px", t.style.bottom = "15px", t.style.flex = "row";
    const l = document.createElement("div");
    t.appendChild(l), l.style.width = "100%", l.style.textAlign = "center", l.style.fontWeight = "bold", l.style.marginBottom = "8px", l.innerText = "Looking Glass Controls";
    const o = document.createElement("button");
    o.style.display = "block", o.style.margin = "auto", o.style.width = "100%", o.style.height = "35px", o.style.padding = "4px", o.style.marginBottom = "8px", o.style.borderRadius = "8px", o.id = "screenshotbutton", t.appendChild(o), o.innerText = "Save Hologram";
    const u = document.createElement("button");
    u.style.display = "block", u.style.margin = "auto", u.style.width = "100%", u.style.height = "35px", u.style.padding = "4px", u.style.marginBottom = "8px", u.style.borderRadius = "8px", u.id = "copybutton", t.appendChild(u), u.innerText = "Copy Config", u.addEventListener("click", () => {
      Ce(n);
    });
    const b = document.createElement("div");
    t.appendChild(b), b.style.width = "290px", b.style.whiteSpace = "normal", b.style.color = "rgba(255,255,255,0.7)", b.style.fontSize = "14px", b.style.margin = "5px 0", b.innerHTML = "Click the popup and use WASD, mouse left/right drag, and scroll.";
    const R = document.createElement("div");
    t.appendChild(R);
    const k = (r, c, d) => {
      const g = d.stringify, x = document.createElement("div");
      x.style.marginBottom = "8px", R.appendChild(x);
      const P = r, F = n[r], v = document.createElement("label");
      x.appendChild(v), v.innerText = d.label, v.setAttribute("for", P), v.style.width = "100px", v.style.display = "inline-block", v.style.textDecoration = "dotted underline 1px", v.style.fontFamily = '"Courier New"', v.style.fontSize = "13px", v.style.fontWeight = "bold", v.title = d.title;
      const p = document.createElement("input");
      x.appendChild(p), Object.assign(p, c), p.id = P, p.title = d.title, p.value = c.value !== void 0 ? c.value : F;
      const A = (m) => {
        n[r] = m, I(m);
      };
      p.oninput = () => {
        const m = c.type === "range" ? parseFloat(p.value) : c.type === "checkbox" ? p.checked : p.value;
        A(m);
      };
      const B = (m) => {
        let L = m(n[r]);
        d.fixRange && (L = d.fixRange(L), p.max = Math.max(parseFloat(p.max), L).toString(), p.min = Math.min(parseFloat(p.min), L).toString()), p.value = L, A(L);
      };
      c.type === "range" && (p.style.width = "110px", p.style.height = "8px", p.onwheel = (m) => {
        B((L) => L + Math.sign(m.deltaX - m.deltaY) * c.step);
      });
      let I = (m) => {
      };
      if (g) {
        const m = document.createElement("span");
        m.style.fontFamily = '"Courier New"', m.style.fontSize = "13px", m.style.marginLeft = "3px", x.appendChild(m), I = (L) => {
          m.innerHTML = g(L);
        }, I(F);
      }
      return B;
    };
    k("fovy", {
      type: "range",
      min: 1 / 180 * Math.PI,
      max: 120.1 / 180 * Math.PI,
      step: 1 / 180 * Math.PI
    }, {
      label: "fov",
      title: "perspective fov (degrades stereo effect)",
      fixRange: (r) => Math.max(1 / 180 * Math.PI, Math.min(r, 120.1 / 180 * Math.PI)),
      stringify: (r) => {
        const c = r / Math.PI * 180, d = Math.atan(Math.tan(r / 2) * n.aspect) * 2 / Math.PI * 180;
        return `${c.toFixed()}&deg;&times;${d.toFixed()}&deg;`;
      }
    }), k("depthiness", { type: "range", min: 0, max: 2, step: 0.01 }, {
      label: "depthiness",
      title: "exaggerates depth by multiplying the width of the view cone (as reported by the firmware) - can somewhat compensate for depthiness lost using higher fov.",
      fixRange: (r) => Math.max(0, r),
      stringify: (r) => `${r.toFixed(2)}x`
    }), k("inlineView", { type: "range", min: 0, max: 2, step: 1 }, {
      label: "inline view",
      title: "what to show inline on the original canvas (swizzled = no overwrite)",
      fixRange: (r) => Math.max(0, Math.min(r, 2)),
      stringify: (r) => r === 0 ? "swizzled" : r === 1 ? "center" : r === 2 ? "quilt" : "?"
    }), n.lkgCanvas.oncontextmenu = (r) => {
      r.preventDefault();
    }, n.lkgCanvas.addEventListener("wheel", (r) => {
      const c = n.targetDiam, d = 1.1, g = Math.log(c) / Math.log(d);
      return n.targetDiam = Math.pow(d, g + r.deltaY * 0.01);
    }), n.lkgCanvas.addEventListener("mousemove", (r) => {
      const c = r.movementX, d = -r.movementY;
      if (r.buttons & 2 || r.buttons & 1 && (r.shiftKey || r.ctrlKey)) {
        const g = n.trackballX, x = n.trackballY, P = -Math.cos(g) * c + Math.sin(g) * Math.sin(x) * d, F = -Math.cos(x) * d, v = Math.sin(g) * c + Math.cos(g) * Math.sin(x) * d;
        n.targetX = n.targetX + P * n.targetDiam * 1e-3, n.targetY = n.targetY + F * n.targetDiam * 1e-3, n.targetZ = n.targetZ + v * n.targetDiam * 1e-3;
      } else
        r.buttons & 1 && (n.trackballX = n.trackballX - c * 0.01, n.trackballY = n.trackballY - d * 0.01);
    });
    const f = { w: 0, a: 0, s: 0, d: 0 };
    return n.lkgCanvas.addEventListener("keydown", (r) => {
      switch (r.code) {
        case "KeyW":
          f.w = 1;
          break;
        case "KeyA":
          f.a = 1;
          break;
        case "KeyS":
          f.s = 1;
          break;
        case "KeyD":
          f.d = 1;
          break;
      }
    }), n.lkgCanvas.addEventListener("keyup", (r) => {
      switch (r.code) {
        case "KeyW":
          f.w = 0;
          break;
        case "KeyA":
          f.a = 0;
          break;
        case "KeyS":
          f.s = 0;
          break;
        case "KeyD":
          f.d = 0;
          break;
      }
    }), requestAnimationFrame(e), setTimeout(() => {
      ye();
    }, 1e3), t;
  }
}
function Ce(n) {
  const i = {
    targetX: n.targetX,
    targetY: n.targetY,
    targetZ: n.targetZ,
    fovy: `${Math.round(n.fovy / Math.PI * 180)} * Math.PI / 180`,
    targetDiam: n.targetDiam,
    trackballX: n.trackballX,
    trackballY: n.trackballY,
    depthiness: n.depthiness
  };
  let e = JSON.stringify(i, null, 4).replace(/"/g, "").replace(/{/g, "").replace(/}/g, "");
  navigator.clipboard.writeText(e);
}
let G;
const Re = (n, i) => {
  const e = S();
  if (e.lkgCanvas == null) {
    console.warn("window placement called without a valid XR Session!");
    return;
  } else if (n == !1)
    xe(e, G);
  else {
    G == null && (G = ge()), e.lkgCanvas.style.position = "fixed", e.lkgCanvas.style.bottom = "0", e.lkgCanvas.style.left = "0", e.lkgCanvas.width = e.calibration.screenW.value, e.lkgCanvas.height = e.calibration.screenH.value, document.body.appendChild(G);
    const s = "getScreenDetails" in window;
    console.log(s, "Screen placement API exists"), s ? Te(e.lkgCanvas, e, i) : j(e, e.lkgCanvas, i);
  }
};
async function Te(n, i, e) {
  const s = await window.getScreenDetails();
  console.log(s);
  const t = s.screens.filter((l) => l.label.includes("LKG"))[0];
  if (console.log(t, "monitors"), t === void 0) {
    console.log("no Looking Glass monitor detected - manually opening popup window"), j(i, n, e);
    return;
  } else {
    console.log("monitor ID", t.label, "serial number", i.calibration);
    const l = [
      `left=${t.left}`,
      `top=${t.top}`,
      `width=${t.width}`,
      `height=${t.height}`,
      "menubar=no",
      "toolbar=no",
      "location=no",
      "status=no",
      "resizable=yes",
      "scrollbars=no",
      "fullscreenEnabled=true"
    ].join(",");
    i.popup = window.open("", "new", l), i.popup && (i.popup.document.body.style.background = "black", i.popup.document.body.style.transform = "1.0", $(i), i.popup.document.body.appendChild(n), console.assert(e), i.popup.onbeforeunload = e);
  }
}
function j(n, i, e) {
  n.popup = window.open("", void 0, "width=640,height=360"), n.popup && (n.popup.document.title = "Looking Glass Window (fullscreen me on Looking Glass!)", n.popup.document.body.style.background = "black", n.popup.document.body.style.transform = "1.0", $(n), n.popup.document.body.appendChild(i), console.assert(e), n.popup.onbeforeunload = e);
}
function xe(n, i) {
  var e;
  (e = i.parentElement) == null || e.removeChild(i), n.popup && (n.popup.onbeforeunload = null, n.popup.close(), n.popup = null);
}
function $(n) {
  n.popup && n.popup.document.addEventListener("keydown", (i) => {
    i.ctrlKey && (i.key === "=" || i.key === "-" || i.key === "+") && i.preventDefault();
  });
}
const M = Symbol("LookingGlassXRWebGLLayer");
class _e extends ve {
  constructor(i, e, s) {
    super(i, e, s);
    const t = S();
    t.appCanvas = e.canvas, t.lkgCanvas = document.createElement("canvas"), t.lkgCanvas.tabIndex = 0;
    const l = t.lkgCanvas.getContext("2d", { alpha: !1 });
    t.lkgCanvas.addEventListener("dblclick", function() {
      this.requestFullscreen();
    });
    const o = this[we].config, u = e.createTexture();
    let b, R;
    const k = e.createFramebuffer(), f = e.getExtension("OES_vertex_array_object"), r = 34229, c = f ? f.bindVertexArrayOES.bind(f) : e.bindVertexArray.bind(e);
    (o.depth || o.stencil) && (o.depth && o.stencil ? R = {
      format: e.DEPTH_STENCIL,
      attachment: e.DEPTH_STENCIL_ATTACHMENT
    } : o.depth ? R = {
      format: e.DEPTH_COMPONENT16,
      attachment: e.DEPTH_ATTACHMENT
    } : o.stencil && (R = {
      format: e.STENCIL_INDEX8,
      attachment: e.STENCIL_ATTACHMENT
    }), b = e.createRenderbuffer());
    const d = (a, C, w, h, E) => {
      g(a, C, E.framebufferWidth, E.framebufferHeight), w && x(a, w, h, E.framebufferWidth, E.framebufferHeight);
    }, g = (a, C, w, h) => {
      const E = a.getParameter(a.TEXTURE_BINDING_2D);
      a.bindTexture(a.TEXTURE_2D, C), a.texImage2D(a.TEXTURE_2D, 0, a.RGBA, w, h, 0, a.RGBA, a.UNSIGNED_BYTE, null), a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, a.LINEAR), a.bindTexture(a.TEXTURE_2D, E);
    }, x = (a, C, w, h, E) => {
      const T = a.getParameter(a.RENDERBUFFER_BINDING);
      a.bindRenderbuffer(a.RENDERBUFFER, C), a.renderbufferStorage(a.RENDERBUFFER, w.format, h, E), a.bindRenderbuffer(a.RENDERBUFFER, T);
    }, P = (a, C, w, h, E, T) => {
      const W = a.getParameter(a.FRAMEBUFFER_BINDING);
      a.bindFramebuffer(a.FRAMEBUFFER, C), a.framebufferTexture2D(a.FRAMEBUFFER, a.COLOR_ATTACHMENT0, a.TEXTURE_2D, w, 0), (T.depth || T.stencil) && a.framebufferRenderbuffer(a.FRAMEBUFFER, h.attachment, a.RENDERBUFFER, E), a.bindFramebuffer(a.FRAMEBUFFER, W);
    };
    d(e, u, b, R, t), t.addEventListener("on-config-changed", () => d(e, u, b, R, t)), P(e, k, u, R, b, o);
    const F = `
		attribute vec2 a_position;
		varying vec2 v_texcoord;
		void main() {
			// \u5F52\u4E00\u5316, \u5C06\u9876\u70B9\u5750\u6807\u4ECE [-1, 1] -> [0, 1]
		  gl_Position = vec4(a_position * 2.0 - 1.0, 0.0, 1.0);
		  v_texcoord = a_position;
		}
	  `;
    function v(a, C, w) {
      const h = a.createShader(C);
      return a.shaderSource(h, w), a.compileShader(h), a.getShaderParameter(h, a.COMPILE_STATUS) ? h : (console.warn(a.getShaderInfoLog(h)), null);
    }
    function p(a, C, w) {
      let h = a.createProgram();
      const E = v(a, a.VERTEX_SHADER, C), T = v(a, a.FRAGMENT_SHADER, w);
      return E === null || T === null ? (console.error("There was a problem with shader construction"), null) : (a.attachShader(h, E), a.attachShader(h, T), a.linkProgram(h), a.getProgramParameter(h, a.LINK_STATUS) ? h : (console.warn(a.getProgramInfoLog(h)), null));
    }
    let A, B, I, m;
    const L = (a, C, w) => {
      const h = w(C);
      if (h === B)
        return;
      B = h;
      const E = v(a, a.FRAGMENT_SHADER, h);
      if (E === null)
        return;
      A && a.deleteShader(A), A = E;
      const T = p(a, F, h);
      if (T === null) {
        console.warn("There was a problem with shader construction");
        return;
      }
      I = a.getAttribLocation(T, "a_position"), m = a.getUniformLocation(T, "u_viewType");
      const W = a.getUniformLocation(T, "u_texture"), ce = a.getParameter(a.CURRENT_PROGRAM);
      a.useProgram(T), a.uniform1i(W, 0), a.useProgram(ce), D && a.deleteProgram(D), D = T;
    };
    console.log(X(t));
    let D = p(e, F, X(t));
    D === null && console.warn("There was a problem with shader construction"), t.addEventListener("on-config-changed", () => {
      L(e, t, X);
    });
    const q = f ? f.createVertexArrayOES() : e.createVertexArray(), Q = e.createBuffer(), J = e.getParameter(e.ARRAY_BUFFER_BINDING), ee = e.getParameter(r);
    c(q), e.bindBuffer(e.ARRAY_BUFFER, Q), e.bufferData(e.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), e.STATIC_DRAW), e.enableVertexAttribArray(I), e.vertexAttribPointer(I, 2, e.FLOAT, !1, 0, 0), c(ee), e.bindBuffer(e.ARRAY_BUFFER, J);
    const te = () => {
      console.assert(this[M].LookingGlassEnabled), e.bindFramebuffer(e.FRAMEBUFFER, this.framebuffer);
      const a = e.getParameter(e.COLOR_CLEAR_VALUE), C = e.getParameter(e.DEPTH_CLEAR_VALUE), w = e.getParameter(e.STENCIL_CLEAR_VALUE);
      e.clearColor(0, 0, 0, 0), e.clearDepth(1), e.clearStencil(0), e.clear(e.DEPTH_BUFFER_BIT | e.COLOR_BUFFER_BIT | e.STENCIL_BUFFER_BIT), e.clearColor(a[0], a[1], a[2], a[3]), e.clearDepth(C), e.clearStencil(w);
    };
    function ne() {
      if (!t.appCanvas || !t.lkgCanvas)
        return;
      (t.appCanvas.width !== t.framebufferWidth || t.appCanvas.height !== t.framebufferHeight) && (t.appCanvas.width, t.appCanvas.height, t.appCanvas.width = t.framebufferWidth, t.appCanvas.height = t.framebufferHeight);
      const a = ae();
      re(), se(), oe(), le(), ie(a);
    }
    function ie(a) {
      e.activeTexture(a.activeTexture), e.bindTexture(e.TEXTURE_2D, a.textureBinding), e.useProgram(a.program), e.bindRenderbuffer(e.RENDERBUFFER, a.renderbufferBinding), e.bindFramebuffer(e.FRAMEBUFFER, a.framebufferBinding), a.scissorTest ? e.enable(e.SCISSOR_TEST) : e.disable(e.SCISSOR_TEST), a.stencilTest ? e.enable(e.STENCIL_TEST) : e.disable(e.STENCIL_TEST), a.depthTest ? e.enable(e.DEPTH_TEST) : e.disable(e.DEPTH_TEST), a.blend ? e.enable(e.BLEND) : e.disable(e.BLEND), a.cullFace ? e.enable(e.CULL_FACE) : e.disable(e.CULL_FACE), c(a.VAO);
    }
    function ae() {
      return {
        VAO: e.getParameter(e.VERTEX_ARRAY_BINDING),
        cullFace: e.getParameter(e.CULL_FACE),
        blend: e.getParameter(e.BLEND),
        depthTest: e.getParameter(e.DEPTH_TEST),
        stencilTest: e.getParameter(e.STENCIL_TEST),
        scissorTest: e.getParameter(e.SCISSOR_TEST),
        viewport: e.getParameter(e.VIEWPORT),
        framebufferBinding: e.getParameter(e.FRAMEBUFFER_BINDING),
        renderbufferBinding: e.getParameter(e.RENDERBUFFER_BINDING),
        program: e.getParameter(e.CURRENT_PROGRAM),
        activeTexture: e.getParameter(e.ACTIVE_TEXTURE),
        textureBinding: e.getParameter(e.TEXTURE_BINDING_2D)
      };
    }
    function re() {
      e.bindFramebuffer(e.FRAMEBUFFER, null), e.useProgram(D), c(q), e.activeTexture(e.TEXTURE0), e.bindTexture(e.TEXTURE_2D, u), e.disable(e.BLEND), e.disable(e.CULL_FACE), e.disable(e.DEPTH_TEST), e.disable(e.STENCIL_TEST), e.viewport(0, 0, e.drawingBufferWidth, e.drawingBufferHeight);
    }
    function se() {
      e.uniform1i(m, 0), e.drawArrays(e.TRIANGLES, 0, 6);
    }
    function oe() {
      if (!t.lkgCanvas || !t.appCanvas) {
        console.warn("Looking Glass Canvas is not defined");
        return;
      }
      l == null || l.clearRect(0, 0, t.lkgCanvas.width, t.lkgCanvas.height), l == null || l.drawImage(t.appCanvas, 0, 0, t.framebufferWidth, t.framebufferHeight, 0, 0, t.calibration.screenW.value, t.calibration.screenH.value);
    }
    function le() {
      if (!t.appCanvas) {
        console.warn("Looking Glass Canvas is not defined");
        return;
      }
      t.inlineView !== 0 && (t.capturing && t.appCanvas.width !== t.framebufferWidth && (t.appCanvas.width = t.framebufferWidth, t.appCanvas.height = t.framebufferHeight, e.viewport(0, 0, t.framebufferHeight, t.framebufferWidth)), e.uniform1i(m, t.inlineView), e.drawArrays(e.TRIANGLES, 0, 6));
    }
    window.addEventListener("unload", () => {
      t.popup && t.popup.close(), t.popup = null;
    }), this[M] = {
      LookingGlassEnabled: !1,
      framebuffer: k,
      clearFramebuffer: te,
      blitTextureToDefaultFramebufferIfNeeded: ne,
      moveCanvasToWindow: Re
    };
  }
  get framebuffer() {
    return this[M].LookingGlassEnabled ? this[M].framebuffer : null;
  }
  get framebufferWidth() {
    return S().framebufferWidth;
  }
  get framebufferHeight() {
    return S().framebufferHeight;
  }
}
const N = class extends me {
  constructor(i) {
    super(i), this.sessions = /* @__PURE__ */ new Map(), this.viewSpaces = [], this.basePoseMatrix = _.create(), this.inlineProjectionMatrix = _.create(), this.inlineInverseViewMatrix = _.create(), this.LookingGlassProjectionMatrices = [], this.LookingGlassInverseViewMatrices = [], this.captureScreenshot = !1, this.screenshotCallback = null, N.instance || (N.instance = this);
  }
  static getInstance() {
    return N.instance;
  }
  onBaseLayerSet(i, e) {
    const s = this.sessions.get(i);
    s.baseLayer = e;
    const t = S(), l = e[M];
    l.LookingGlassEnabled = s.immersive, s.immersive && (t.XRSession = this.sessions.get(i), t.popup == null ? l.moveCanvasToWindow(!0, () => {
      this.endSession(i);
    }) : console.warn("attempted to assign baselayer twice?"));
  }
  isSessionSupported(i) {
    return i === "inline" || i === "immersive-vr";
  }
  isFeatureSupported(i) {
    switch (i) {
      case "viewer":
        return !0;
      case "local":
        return !0;
      case "local-floor":
        return !0;
      case "bounded-floor":
        return !1;
      case "unbounded":
        return !1;
      default:
        return console.warn("LookingGlassXRDevice.isFeatureSupported: feature not understood:", i), !1;
    }
  }
  async requestSession(i, e) {
    if (!this.isSessionSupported(i))
      return Promise.reject();
    const s = i !== "inline", t = new Se(i, e);
    return this.sessions.set(t.id, t), s && this.dispatchEvent("@@@lookingglass/webxr-polyfill/vr-present-start", t.id), Promise.resolve(t.id);
  }
  requestAnimationFrame(i) {
    return this.global.requestAnimationFrame(i);
  }
  cancelAnimationFrame(i) {
    this.global.cancelAnimationFrame(i);
  }
  onFrameStart(i, e) {
    const s = this.sessions.get(i), t = S(), l = 10, o = this.getCameraDis(48, l, 52);
    if (s.immersive) {
      let u = 0;
      for (let R = 0; R < t.numViews; ++R) {
        let k = -o * 24 + u * o;
        k > o * 24 && (k = -o * 24, u = 0);
        const f = U.fromValues(k, 0, l), r = U.fromValues(k, 0, 0), c = U.fromValues(0, 1, 0), d = this.LookingGlassProjectionMatrices[R] = this.LookingGlassProjectionMatrices[R] || _.create();
        _.lookAt(d, f, r, c), _.perspective(d, t.fovy, 1536 / 2048, 1, 20);
      }
      s.baseLayer[M].clearFramebuffer();
    } else {
      const u = s.baseLayer.context, b = u.drawingBufferWidth / u.drawingBufferHeight;
      _.perspective(this.inlineProjectionMatrix, e.inlineVerticalFieldOfView, b, e.depthNear, e.depthFar), _.fromTranslation(this.basePoseMatrix, [0, O, 0]), _.invert(this.inlineInverseViewMatrix, this.basePoseMatrix);
    }
  }
  getCameraDis(i, e, s) {
    return 2 * e * Math.tan(s / 2 * Math.PI / 180) / (i - 1);
  }
  onFrameEnd(i) {
    this.sessions.get(i).baseLayer[M].blitTextureToDefaultFramebufferIfNeeded(), this.captureScreenshot && this.screenshotCallback && (this.screenshotCallback(), this.captureScreenshot = !1);
  }
  async requestFrameOfReferenceTransform(i, e) {
    const s = _.create();
    switch (i) {
      case "viewer":
      case "local":
        return _.fromTranslation(s, [0, -O, 0]), s;
      case "local-floor":
        return s;
      default:
        throw new Error("XRReferenceSpaceType not understood");
    }
  }
  endSession(i) {
    const e = this.sessions.get(i);
    e.immersive && e.baseLayer && (e.baseLayer[M].moveCanvasToWindow(!1), this.dispatchEvent("@@@lookingglass/webxr-polyfill/vr-present-end", i)), e.ended = !0;
  }
  doesSessionSupportReferenceSpace(i, e) {
    const s = this.sessions.get(i);
    return s.ended ? !1 : s.enabledFeatures.has(e);
  }
  getViewSpaces(i) {
    if (i === "immersive-vr") {
      const e = S();
      for (let s = this.viewSpaces.length; s < e.numViews; ++s)
        this.viewSpaces[s] = new ke(s);
      return this.viewSpaces.length = e.numViews, this.viewSpaces;
    }
  }
  getViewport(i, e, s, t, l) {
    if (l === void 0) {
      const u = this.sessions.get(i).baseLayer.context;
      t.x = 0, t.y = 0, t.width = u.drawingBufferWidth, t.height = u.drawingBufferHeight;
    } else {
      const o = S(), u = l % o.quiltWidth, b = Math.floor(l / o.quiltWidth);
      t.x = o.framebufferWidth / o.quiltWidth * u, t.y = o.framebufferHeight / o.quiltHeight * b, t.width = o.framebufferWidth / o.quiltWidth, t.height = o.framebufferHeight / o.quiltHeight;
    }
    return !0;
  }
  getProjectionMatrix(i, e) {
    return e === void 0 ? this.inlineProjectionMatrix : this.LookingGlassProjectionMatrices[e] || _.create();
  }
  getBasePoseMatrix() {
    return this.basePoseMatrix;
  }
  getBaseViewMatrix() {
    return this.inlineInverseViewMatrix;
  }
  _getViewMatrixByIndex(i) {
    return this.LookingGlassInverseViewMatrices[i] = this.LookingGlassInverseViewMatrices[i] || _.create();
  }
  getInputSources() {
    return [];
  }
  getInputPose(i, e, s) {
    return null;
  }
  onWindowResize() {
  }
};
let V = N;
y(V, "instance", null);
let Le = 0;
class Se {
  constructor(i, e) {
    y(this, "mode");
    y(this, "immersive");
    y(this, "id");
    y(this, "baseLayer");
    y(this, "inlineVerticalFieldOfView");
    y(this, "ended");
    y(this, "enabledFeatures");
    this.mode = i, this.immersive = i === "immersive-vr" || i === "immersive-ar", this.id = ++Le, this.baseLayer = null, this.inlineVerticalFieldOfView = Math.PI * 0.5, this.ended = !1, this.enabledFeatures = e;
  }
}
class ke extends be {
  constructor(e) {
    super();
    y(this, "viewIndex");
    this.viewIndex = e;
  }
  get eye() {
    return "none";
  }
  _onPoseUpdate(e) {
    this._inverseBaseMatrix = e._getViewMatrixByIndex(this.viewIndex);
  }
}
class Z extends fe {
  constructor(e) {
    super();
    y(this, "vrButton");
    y(this, "device");
    y(this, "isPresenting", !1);
    K(e), this.loadPolyfill();
  }
  static async init(e) {
    new Z(e);
  }
  async loadPolyfill() {
    this.overrideDefaultVRButton(), console.warn('Looking Glass WebXR "polyfill" overriding native WebXR API.');
    for (const e in z)
      this.global[e] = z[e];
    this.global.XRWebGLLayer = _e, this.injected = !0, this.device = new V(this.global), this.xr = new he(Promise.resolve(this.device)), Object.defineProperty(this.global.navigator, "xr", {
      value: this.xr,
      configurable: !0
    });
  }
  async overrideDefaultVRButton() {
    this.vrButton = await Fe("VRButton"), this.vrButton && this.device ? (this.device.addEventListener("@@webxr-polyfill/vr-present-start", () => {
      this.isPresenting = !0, this.updateVRButtonUI();
    }), this.device.addEventListener("@@webxr-polyfill/vr-present-end", () => {
      this.isPresenting = !1, this.updateVRButtonUI();
    }), this.vrButton.addEventListener("click", (e) => {
      console.log("button click", e), this.updateVRButtonUI();
    }), this.updateVRButtonUI()) : console.warn("Unable to find VRButton");
  }
  async updateVRButtonUI() {
    if (this.vrButton) {
      await Pe(100), this.isPresenting ? this.vrButton.innerHTML = "EXIT LOOKING GLASS" : this.vrButton.innerHTML = "ENTER LOOKING GLASS";
      const e = 220;
      this.vrButton.style.width = `${e}px`, this.vrButton.style.left = `calc(50% - ${e / 2}px)`;
    }
  }
  update(e) {
    K(e);
  }
}
async function Fe(n) {
  return new Promise((i) => {
    const e = new MutationObserver(function(s) {
      s.forEach(function(t) {
        t.addedNodes.forEach(function(l) {
          const o = l;
          o.id === n && (i(o), e.disconnect());
        });
      });
    });
    e.observe(document.body, { subtree: !1, childList: !0 }), setTimeout(() => {
      e.disconnect(), i(null);
    }, 5e3);
  });
}
function Pe(n) {
  return new Promise((i) => setTimeout(i, n));
}
const Xe = S();
export {
  Xe as LookingGlassConfig,
  Z as LookingGlassWebXRPolyfill
};
