var oe = Object.defineProperty;
var le = (n, a, e) => a in n ? oe(n, a, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[a] = e;
var x = (n, a, e) => (le(n, typeof a != "symbol" ? a + "" : a, e), e);
import H from "@lookingglass/webxr-polyfill/src/api/index";
import ce from "@lookingglass/webxr-polyfill/src/api/XRSystem";
import ue from "@lookingglass/webxr-polyfill/src/WebXRPolyfill";
import * as de from "holoplay-core";
import { Shader as O } from "holoplay-core";
import he from "@lookingglass/webxr-polyfill/src/devices/XRDevice";
import fe from "@lookingglass/webxr-polyfill/src/api/XRSpace";
import { mat4 as E } from "gl-matrix";
import pe, { PRIVATE as me } from "@lookingglass/webxr-polyfill/src/api/XRWebGLLayer";
const X = 1.6;
var W;
(function(n) {
  n[n.Swizzled = 0] = "Swizzled", n[n.Center = 1] = "Center", n[n.Quilt = 2] = "Quilt";
})(W || (W = {}));
class be extends EventTarget {
  constructor(e) {
    super();
    x(this, "_calibration", {
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
    x(this, "_viewControls", {
      tileHeight: 512,
      numViews: 48,
      trackballX: 0,
      trackballY: 0,
      targetX: 0,
      targetY: X,
      targetZ: -0.5,
      targetDiam: 2,
      fovy: 13 / 180 * Math.PI,
      depthiness: 1.25,
      inlineView: W.Center,
      capturing: !1,
      quiltResolution: 3840,
      popup: null,
      XRSession: null,
      lkgCanvas: null,
      appCanvas: null
    });
    x(this, "LookingGlassDetected");
    this._viewControls = { ...this._viewControls, ...e }, this.syncCalibration();
  }
  syncCalibration() {
    new de.Client((e) => {
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
let N = null;
function P() {
  return N == null && (N = new be()), N;
}
function Y(n) {
  const a = P();
  n != null && a.updateViewControls(n);
}
async function ve() {
  const n = P();
  if (n.appCanvas == null) {
    console.warn("Media Capture initialized while canvas is null!");
    return;
  } else {
    let a = function() {
      if (n.appCanvas != null) {
        let t = n.appCanvas.toDataURL();
        const o = document.createElement("a");
        o.style.display = "none", o.href = t, o.download = `hologram_qs${n.quiltWidth}x${n.quiltHeight}a${n.aspect}.png`, document.body.appendChild(o), o.click(), document.body.removeChild(o), window.URL.revokeObjectURL(t);
      }
    };
    const e = document.getElementById("screenshotbutton");
    e == null || e.addEventListener("click", s);
    async function s() {
      await ge.promise(50).finally(a);
    }
  }
}
const we = { timeout: 500 }, q = window.requestIdleCallback || window.requestAnimationFrame, Ee = window.cancelIdleCallback || window.cancelAnimationFrame, ge = {
  request: q,
  cancel: Ee,
  promise: (n) => new Promise((a) => q(a, Object.assign({}, we, n)))
};
function ye() {
  var a;
  const n = P();
  if (console.log(n, "for debugging purposes"), n.lkgCanvas == null)
    console.warn("window placement called without a valid XR Session!");
  else {
    let e = function() {
      let r = v.d - v.a, u = v.w - v.s;
      r && u && (r *= Math.sqrt(0.5), u *= Math.sqrt(0.5));
      const d = n.trackballX, p = n.trackballY, g = Math.cos(d) * r - Math.sin(d) * Math.cos(p) * u, S = -Math.sin(p) * u, _ = -Math.sin(d) * r - Math.cos(d) * Math.cos(p) * u;
      n.targetX = n.targetX + g * n.targetDiam * 0.03, n.targetY = n.targetY + S * n.targetDiam * 0.03, n.targetZ = n.targetZ + _ * n.targetDiam * 0.03, requestAnimationFrame(e);
    };
    const s = document.createElement("style");
    document.head.appendChild(s), (a = s.sheet) == null || a.insertRule("#LookingGlassWebXRControls * { all: revert; font-family: sans-serif }");
    const t = document.createElement("div");
    t.id = "LookingGlassWebXRControls", t.style.position = "fixed", t.style.zIndex = "1000", t.style.padding = "15px", t.style.width = "320px", t.style.maxWidth = "calc(100vw - 18px)", t.style.maxHeight = "calc(100vh - 18px)", t.style.whiteSpace = "nowrap", t.style.background = "rgba(0, 0, 0, 0.6)", t.style.color = "white", t.style.borderRadius = "10px", t.style.right = "15px", t.style.bottom = "15px", t.style.flex = "row";
    const o = document.createElement("div");
    t.appendChild(o), o.style.width = "100%", o.style.textAlign = "center", o.style.fontWeight = "bold", o.style.marginBottom = "8px", o.innerText = "Looking Glass Controls";
    const l = document.createElement("button");
    l.style.display = "block", l.style.margin = "auto", l.style.width = "100%", l.style.height = "35px", l.style.padding = "4px", l.style.marginBottom = "8px", l.style.borderRadius = "8px", l.id = "screenshotbutton", t.appendChild(l), l.innerText = "Save Hologram";
    const c = document.createElement("button");
    c.style.display = "block", c.style.margin = "auto", c.style.width = "100%", c.style.height = "35px", c.style.padding = "4px", c.style.marginBottom = "8px", c.style.borderRadius = "8px", c.id = "copybutton", t.appendChild(c), c.innerText = "Copy Config", c.addEventListener("click", () => {
      Ce(n);
    });
    const h = document.createElement("div");
    t.appendChild(h), h.style.width = "290px", h.style.whiteSpace = "normal", h.style.color = "rgba(255,255,255,0.7)", h.style.fontSize = "14px", h.style.margin = "5px 0", h.innerHTML = "Click the popup and use WASD, mouse left/right drag, and scroll.";
    const k = document.createElement("div");
    t.appendChild(k);
    const y = (r, u, d) => {
      const p = d.stringify, g = document.createElement("div");
      g.style.marginBottom = "8px", k.appendChild(g);
      const S = r, _ = n[r], w = document.createElement("label");
      g.appendChild(w), w.innerText = d.label, w.setAttribute("for", S), w.style.width = "100px", w.style.display = "inline-block", w.style.textDecoration = "dotted underline 1px", w.style.fontFamily = '"Courier New"', w.style.fontSize = "13px", w.style.fontWeight = "bold", w.title = d.title;
      const m = document.createElement("input");
      g.appendChild(m), Object.assign(m, u), m.id = S, m.title = d.title, m.value = u.value !== void 0 ? u.value : _;
      const A = (b) => {
        n[r] = b, M(b);
      };
      m.oninput = () => {
        const b = u.type === "range" ? parseFloat(m.value) : u.type === "checkbox" ? m.checked : m.value;
        A(b);
      };
      const I = (b) => {
        let F = b(n[r]);
        d.fixRange && (F = d.fixRange(F), m.max = Math.max(parseFloat(m.max), F).toString(), m.min = Math.min(parseFloat(m.min), F).toString()), m.value = F, A(F);
      };
      u.type === "range" && (m.style.width = "110px", m.style.height = "8px", m.onwheel = (b) => {
        I((F) => F + Math.sign(b.deltaX - b.deltaY) * u.step);
      });
      let M = (b) => {
      };
      if (p) {
        const b = document.createElement("span");
        b.style.fontFamily = '"Courier New"', b.style.fontSize = "13px", b.style.marginLeft = "3px", g.appendChild(b), M = (F) => {
          b.innerHTML = p(F);
        }, M(_);
      }
      return I;
    };
    y("fovy", {
      type: "range",
      min: 1 / 180 * Math.PI,
      max: 120.1 / 180 * Math.PI,
      step: 1 / 180 * Math.PI
    }, {
      label: "fov",
      title: "perspective fov (degrades stereo effect)",
      fixRange: (r) => Math.max(1 / 180 * Math.PI, Math.min(r, 120.1 / 180 * Math.PI)),
      stringify: (r) => {
        const u = r / Math.PI * 180, d = Math.atan(Math.tan(r / 2) * n.aspect) * 2 / Math.PI * 180;
        return `${u.toFixed()}&deg;&times;${d.toFixed()}&deg;`;
      }
    }), y("depthiness", { type: "range", min: 0, max: 2, step: 0.01 }, {
      label: "depthiness",
      title: 'exaggerates depth by multiplying the width of the view cone (as reported by the firmware) - can somewhat compensate for depthiness lost using higher fov. 1.25 seems to be most physically accurate on Looking Glass 8.9".',
      fixRange: (r) => Math.max(0, r),
      stringify: (r) => `${r.toFixed(2)}x`
    }), y("inlineView", { type: "range", min: 0, max: 2, step: 1 }, {
      label: "inline view",
      title: "what to show inline on the original canvas (swizzled = no overwrite)",
      fixRange: (r) => Math.max(0, Math.min(r, 2)),
      stringify: (r) => r === 0 ? "swizzled" : r === 1 ? "center" : r === 2 ? "quilt" : "?"
    }), n.lkgCanvas.oncontextmenu = (r) => {
      r.preventDefault();
    }, n.lkgCanvas.addEventListener("wheel", (r) => {
      const u = n.targetDiam, d = 1.1, p = Math.log(u) / Math.log(d);
      return n.targetDiam = Math.pow(d, p + r.deltaY * 0.01);
    }), n.lkgCanvas.addEventListener("mousemove", (r) => {
      const u = r.movementX, d = -r.movementY;
      if (r.buttons & 2 || r.buttons & 1 && (r.shiftKey || r.ctrlKey)) {
        const p = n.trackballX, g = n.trackballY, S = -Math.cos(p) * u + Math.sin(p) * Math.sin(g) * d, _ = -Math.cos(g) * d, w = Math.sin(p) * u + Math.cos(p) * Math.sin(g) * d;
        n.targetX = n.targetX + S * n.targetDiam * 1e-3, n.targetY = n.targetY + _ * n.targetDiam * 1e-3, n.targetZ = n.targetZ + w * n.targetDiam * 1e-3;
      } else
        r.buttons & 1 && (n.trackballX = n.trackballX - u * 0.01, n.trackballY = n.trackballY - d * 0.01);
    });
    const v = { w: 0, a: 0, s: 0, d: 0 };
    return n.lkgCanvas.addEventListener("keydown", (r) => {
      switch (r.code) {
        case "KeyW":
          v.w = 1;
          break;
        case "KeyA":
          v.a = 1;
          break;
        case "KeyS":
          v.s = 1;
          break;
        case "KeyD":
          v.d = 1;
          break;
      }
    }), n.lkgCanvas.addEventListener("keyup", (r) => {
      switch (r.code) {
        case "KeyW":
          v.w = 0;
          break;
        case "KeyA":
          v.a = 0;
          break;
        case "KeyS":
          v.s = 0;
          break;
        case "KeyD":
          v.d = 0;
          break;
      }
    }), requestAnimationFrame(e), setTimeout(() => {
      ve();
    }, 1e3), t;
  }
}
function Ce(n) {
  let a = n.targetX, e = n.targetY, s = n.targetZ, t = `${Math.round(n.fovy / Math.PI * 180)} * Math.PI / 180`, o = n.targetDiam, l = n.trackballX, c = n.trackballY, h = n.depthiness;
  const k = {
    targetX: a,
    targetY: e,
    targetZ: s,
    fovy: t,
    targetDiam: o,
    trackballX: l,
    trackballY: c,
    depthiness: h
  };
  let y = JSON.stringify(k, null, 4);
  navigator.clipboard.writeText(y);
}
let V;
const Re = (n, a) => {
  const e = P();
  if (e.lkgCanvas == null) {
    console.warn("window placement called without a valid XR Session!");
    return;
  } else if (n == !1)
    xe(e, V);
  else {
    V == null && (V = ye()), e.lkgCanvas.style.position = "fixed", e.lkgCanvas.style.bottom = "0", e.lkgCanvas.style.left = "0", e.lkgCanvas.width = e.calibration.screenW.value, e.lkgCanvas.height = e.calibration.screenH.value, document.body.appendChild(V);
    const s = "getScreenDetails" in window;
    console.log(s, "Screen placement API exists"), s ? Te(e.lkgCanvas, e, a) : j(e, e.lkgCanvas, a);
  }
};
async function Te(n, a, e) {
  const s = await window.getScreenDetails();
  console.log(s);
  const t = s.screens.filter((o) => o.label.includes("LKG"))[0];
  if (console.log(t, "monitors"), t === void 0) {
    console.log("no Looking Glass monitor detected - manually opening popup window"), j(a, n, e);
    return;
  } else {
    console.log("monitor ID", t.label, "serial number", a.calibration);
    const o = [
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
    a.popup = window.open("", "new", o), a.popup && (a.popup.document.body.style.background = "black", a.popup.document.body.appendChild(n), console.assert(e), a.popup.onbeforeunload = e);
  }
}
function j(n, a, e) {
  n.popup = window.open("", void 0, "width=640,height=360"), n.popup && (n.popup.document.title = "Looking Glass Window (fullscreen me on Looking Glass!)", n.popup.document.body.style.background = "black", n.popup.document.body.appendChild(a), console.assert(e), n.popup.onbeforeunload = e);
}
function xe(n, a) {
  var e;
  (e = a.parentElement) == null || e.removeChild(a), n.popup && (n.popup.onbeforeunload = null, n.popup.close(), n.popup = null);
}
const D = Symbol("LookingGlassXRWebGLLayer");
class Le extends pe {
  constructor(a, e, s) {
    super(a, e, s);
    const t = P();
    t.appCanvas = e.canvas, t.lkgCanvas = document.createElement("canvas"), t.lkgCanvas.tabIndex = 0;
    const o = t.lkgCanvas.getContext("2d", { alpha: !1 });
    t.lkgCanvas.addEventListener("dblclick", function() {
      this.requestFullscreen();
    });
    const l = this[me].config, c = e.createTexture();
    let h, k;
    const y = e.createFramebuffer(), v = e.getExtension("OES_vertex_array_object"), r = 34229, u = v ? v.bindVertexArrayOES.bind(v) : e.bindVertexArray.bind(e);
    (l.depth || l.stencil) && (l.depth && l.stencil ? k = {
      format: e.DEPTH_STENCIL,
      attachment: e.DEPTH_STENCIL_ATTACHMENT
    } : l.depth ? k = {
      format: e.DEPTH_COMPONENT16,
      attachment: e.DEPTH_ATTACHMENT
    } : l.stencil && (k = {
      format: e.STENCIL_INDEX8,
      attachment: e.STENCIL_ATTACHMENT
    }), h = e.createRenderbuffer());
    const d = (i, T, C, f, R) => {
      p(i, T, R.framebufferWidth, R.framebufferHeight), C && g(i, C, f, R.framebufferWidth, R.framebufferHeight);
    }, p = (i, T, C, f) => {
      const R = i.getParameter(i.TEXTURE_BINDING_2D);
      i.bindTexture(i.TEXTURE_2D, T), i.texImage2D(i.TEXTURE_2D, 0, i.RGBA, C, f, 0, i.RGBA, i.UNSIGNED_BYTE, null), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MIN_FILTER, i.LINEAR), i.bindTexture(i.TEXTURE_2D, R);
    }, g = (i, T, C, f, R) => {
      const L = i.getParameter(i.RENDERBUFFER_BINDING);
      i.bindRenderbuffer(i.RENDERBUFFER, T), i.renderbufferStorage(i.RENDERBUFFER, C.format, f, R), i.bindRenderbuffer(i.RENDERBUFFER, L);
    }, S = (i, T, C, f, R, L) => {
      const G = i.getParameter(i.FRAMEBUFFER_BINDING);
      i.bindFramebuffer(i.FRAMEBUFFER, T), i.framebufferTexture2D(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0, i.TEXTURE_2D, C, 0), (L.depth || L.stencil) && i.framebufferRenderbuffer(i.FRAMEBUFFER, f.attachment, i.RENDERBUFFER, R), i.bindFramebuffer(i.FRAMEBUFFER, G);
    };
    d(e, c, h, k, t), t.addEventListener("on-config-changed", () => d(e, c, h, k, t)), S(e, y, c, k, h, l);
    const _ = `
		attribute vec2 a_position;
		varying vec2 v_texcoord;
		void main() {
		  gl_Position = vec4(a_position * 2.0 - 1.0, 0.0, 1.0);
		  v_texcoord = a_position;
		}
	  `;
    function w(i, T, C) {
      const f = i.createShader(T);
      return i.shaderSource(f, C), i.compileShader(f), i.getShaderParameter(f, i.COMPILE_STATUS) ? f : (console.warn(i.getShaderInfoLog(f)), null);
    }
    function m(i, T, C) {
      let f = i.createProgram();
      const R = w(i, i.VERTEX_SHADER, T), L = w(i, i.FRAGMENT_SHADER, C);
      return R === null || L === null ? (console.error("There was a problem with shader construction"), null) : (i.attachShader(f, R), i.attachShader(f, L), i.linkProgram(f), i.getProgramParameter(f, i.LINK_STATUS) ? f : (console.warn(i.getProgramInfoLog(f)), null));
    }
    let A, I, M, b;
    const F = (i, T, C) => {
      const f = C(T);
      if (f === I)
        return;
      I = f;
      const R = w(i, i.FRAGMENT_SHADER, f);
      if (R === null)
        return;
      A && i.deleteShader(A), A = R;
      const L = m(i, _, f);
      if (L === null) {
        console.warn("There was a problem with shader construction");
        return;
      }
      M = i.getAttribLocation(L, "a_position"), b = i.getUniformLocation(L, "u_viewType");
      const G = i.getUniformLocation(L, "u_texture"), se = i.getParameter(i.CURRENT_PROGRAM);
      i.useProgram(L), i.uniform1i(G, 0), i.useProgram(se), B && i.deleteProgram(B), B = L;
    };
    let B = m(e, _, O(t));
    B === null && console.warn("There was a problem with shader construction"), t.addEventListener("on-config-changed", () => {
      F(e, t, O);
    });
    const U = v ? v.createVertexArrayOES() : e.createVertexArray(), K = e.createBuffer(), $ = e.getParameter(e.ARRAY_BUFFER_BINDING), Z = e.getParameter(r);
    u(U), e.bindBuffer(e.ARRAY_BUFFER, K), e.bufferData(e.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), e.STATIC_DRAW), e.enableVertexAttribArray(M), e.vertexAttribPointer(M, 2, e.FLOAT, !1, 0, 0), u(Z), e.bindBuffer(e.ARRAY_BUFFER, $);
    const Q = () => {
      console.assert(this[D].LookingGlassEnabled), e.bindFramebuffer(e.FRAMEBUFFER, this.framebuffer);
      const i = e.getParameter(e.COLOR_CLEAR_VALUE), T = e.getParameter(e.DEPTH_CLEAR_VALUE), C = e.getParameter(e.STENCIL_CLEAR_VALUE);
      e.clearColor(0, 0, 0, 0), e.clearDepth(1), e.clearStencil(0), e.clear(e.DEPTH_BUFFER_BIT | e.COLOR_BUFFER_BIT | e.STENCIL_BUFFER_BIT), e.clearColor(i[0], i[1], i[2], i[3]), e.clearDepth(T), e.clearStencil(C);
    };
    function J() {
      if (!t.appCanvas || !t.lkgCanvas)
        return;
      (t.appCanvas.width !== t.framebufferWidth || t.appCanvas.height !== t.framebufferHeight) && (t.appCanvas.width, t.appCanvas.height, t.appCanvas.width = t.framebufferWidth, t.appCanvas.height = t.framebufferHeight);
      const i = te();
      ne(), ie(), ae(), re(), ee(i);
    }
    function ee(i) {
      e.activeTexture(i.activeTexture), e.bindTexture(e.TEXTURE_2D, i.textureBinding), e.useProgram(i.program), e.bindRenderbuffer(e.RENDERBUFFER, i.renderbufferBinding), e.bindFramebuffer(e.FRAMEBUFFER, i.framebufferBinding), i.scissorTest ? e.enable(e.SCISSOR_TEST) : e.disable(e.SCISSOR_TEST), i.stencilTest ? e.enable(e.STENCIL_TEST) : e.disable(e.STENCIL_TEST), i.depthTest ? e.enable(e.DEPTH_TEST) : e.disable(e.DEPTH_TEST), i.blend ? e.enable(e.BLEND) : e.disable(e.BLEND), i.cullFace ? e.enable(e.CULL_FACE) : e.disable(e.CULL_FACE), u(i.VAO);
    }
    function te() {
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
    function ne() {
      e.bindFramebuffer(e.FRAMEBUFFER, null), e.useProgram(B), u(U), e.activeTexture(e.TEXTURE0), e.bindTexture(e.TEXTURE_2D, c), e.disable(e.BLEND), e.disable(e.CULL_FACE), e.disable(e.DEPTH_TEST), e.disable(e.STENCIL_TEST), e.viewport(0, 0, e.drawingBufferWidth, e.drawingBufferHeight);
    }
    function ie() {
      e.uniform1i(b, 0), e.drawArrays(e.TRIANGLES, 0, 6);
    }
    function ae() {
      if (!t.lkgCanvas || !t.appCanvas) {
        console.warn("Looking Glass Canvas is not defined");
        return;
      }
      o == null || o.clearRect(0, 0, t.lkgCanvas.width, t.lkgCanvas.height), o == null || o.drawImage(t.appCanvas, 0, 0, t.framebufferWidth, t.framebufferHeight, 0, 0, t.calibration.screenW.value, t.calibration.screenH.value);
    }
    function re() {
      if (!t.appCanvas) {
        console.warn("Looking Glass Canvas is not defined");
        return;
      }
      t.inlineView !== 0 && (t.capturing && t.appCanvas.width !== t.framebufferWidth && (t.appCanvas.width = t.framebufferWidth, t.appCanvas.height = t.framebufferHeight, e.viewport(0, 0, t.framebufferHeight, t.framebufferWidth)), e.uniform1i(b, t.inlineView), e.drawArrays(e.TRIANGLES, 0, 6));
    }
    window.addEventListener("unload", () => {
      t.popup && t.popup.close(), t.popup = null;
    }), this[D] = {
      LookingGlassEnabled: !1,
      framebuffer: y,
      clearFramebuffer: Q,
      blitTextureToDefaultFramebufferIfNeeded: J,
      moveCanvasToWindow: Re
    };
  }
  get framebuffer() {
    return this[D].LookingGlassEnabled ? this[D].framebuffer : null;
  }
  get framebufferWidth() {
    return P().framebufferWidth;
  }
  get framebufferHeight() {
    return P().framebufferHeight;
  }
}
class _e extends he {
  constructor(a) {
    super(a), this.sessions = /* @__PURE__ */ new Map(), this.viewSpaces = [], this.basePoseMatrix = E.create(), this.inlineProjectionMatrix = E.create(), this.inlineInverseViewMatrix = E.create(), this.LookingGlassProjectionMatrices = [], this.LookingGlassInverseViewMatrices = [];
  }
  onBaseLayerSet(a, e) {
    const s = this.sessions.get(a);
    s.baseLayer = e;
    const t = P(), o = e[D];
    o.LookingGlassEnabled = s.immersive, s.immersive && (t.XRSession = this.sessions.get(a), t.popup == null ? o.moveCanvasToWindow(!0, () => {
      this.endSession(a);
    }) : console.warn("attempted to assign baselayer twice?"));
  }
  isSessionSupported(a) {
    return a === "inline" || a === "immersive-vr";
  }
  isFeatureSupported(a) {
    switch (a) {
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
        return console.warn("LookingGlassXRDevice.isFeatureSupported: feature not understood:", a), !1;
    }
  }
  async requestSession(a, e) {
    if (!this.isSessionSupported(a))
      return Promise.reject();
    const s = a !== "inline", t = new Se(a, e);
    return this.sessions.set(t.id, t), s && this.dispatchEvent("@@webxr-polyfill/vr-present-start", t.id), Promise.resolve(t.id);
  }
  requestAnimationFrame(a) {
    return this.global.requestAnimationFrame(a);
  }
  cancelAnimationFrame(a) {
    this.global.cancelAnimationFrame(a);
  }
  onFrameStart(a, e) {
    const s = this.sessions.get(a), t = P();
    if (s.immersive) {
      const o = Math.tan(0.5 * t.fovy), l = 0.5 * t.targetDiam / o, c = l - t.targetDiam, h = this.basePoseMatrix;
      E.fromTranslation(h, [t.targetX, t.targetY, t.targetZ]), E.rotate(h, h, t.trackballX, [0, 1, 0]), E.rotate(h, h, -t.trackballY, [1, 0, 0]), E.translate(h, h, [0, 0, l]);
      for (let y = 0; y < t.numViews; ++y) {
        const v = (y + 0.5) / t.numViews - 0.5, r = Math.tan(t.viewCone * v), u = l * r, d = this.LookingGlassInverseViewMatrices[y] = this.LookingGlassInverseViewMatrices[y] || E.create();
        E.translate(d, h, [u, 0, 0]), E.invert(d, d);
        const p = Math.max(c + e.depthNear, 0.01), g = c + e.depthFar, S = p * o, _ = S, w = -S, m = p * -r, A = t.aspect * S, I = m + A, M = m - A, b = this.LookingGlassProjectionMatrices[y] = this.LookingGlassProjectionMatrices[y] || E.create();
        E.set(b, 2 * p / (I - M), 0, 0, 0, 0, 2 * p / (_ - w), 0, 0, (I + M) / (I - M), (_ + w) / (_ - w), -(g + p) / (g - p), -1, 0, 0, -2 * g * p / (g - p), 0);
      }
      s.baseLayer[D].clearFramebuffer();
    } else {
      const o = s.baseLayer.context, l = o.drawingBufferWidth / o.drawingBufferHeight;
      E.perspective(this.inlineProjectionMatrix, e.inlineVerticalFieldOfView, l, e.depthNear, e.depthFar), E.fromTranslation(this.basePoseMatrix, [0, X, 0]), E.invert(this.inlineInverseViewMatrix, this.basePoseMatrix);
    }
  }
  onFrameEnd(a) {
    this.sessions.get(a).baseLayer[D].blitTextureToDefaultFramebufferIfNeeded();
  }
  async requestFrameOfReferenceTransform(a, e) {
    const s = E.create();
    switch (a) {
      case "viewer":
      case "local":
        return E.fromTranslation(s, [0, -X, 0]), s;
      case "local-floor":
        return s;
      default:
        throw new Error("XRReferenceSpaceType not understood");
    }
  }
  endSession(a) {
    const e = this.sessions.get(a);
    e.immersive && e.baseLayer && (e.baseLayer[D].moveCanvasToWindow(!1), this.dispatchEvent("@@webxr-polyfill/vr-present-end", a)), e.ended = !0;
  }
  doesSessionSupportReferenceSpace(a, e) {
    const s = this.sessions.get(a);
    return s.ended ? !1 : s.enabledFeatures.has(e);
  }
  getViewSpaces(a) {
    if (a === "immersive-vr") {
      const e = P();
      for (let s = this.viewSpaces.length; s < e.numViews; ++s)
        this.viewSpaces[s] = new Fe(s);
      return this.viewSpaces.length = e.numViews, this.viewSpaces;
    }
  }
  getViewport(a, e, s, t, o) {
    if (o === void 0) {
      const c = this.sessions.get(a).baseLayer.context;
      t.x = 0, t.y = 0, t.width = c.drawingBufferWidth, t.height = c.drawingBufferHeight;
    } else {
      const l = P(), c = o % l.quiltWidth, h = Math.floor(o / l.quiltWidth);
      t.x = l.framebufferWidth / l.quiltWidth * c, t.y = l.framebufferHeight / l.quiltHeight * h, t.width = l.framebufferWidth / l.quiltWidth, t.height = l.framebufferHeight / l.quiltHeight;
    }
    return !0;
  }
  getProjectionMatrix(a, e) {
    return e === void 0 ? this.inlineProjectionMatrix : this.LookingGlassProjectionMatrices[e] || E.create();
  }
  getBasePoseMatrix() {
    return this.basePoseMatrix;
  }
  getBaseViewMatrix() {
    return this.inlineInverseViewMatrix;
  }
  _getViewMatrixByIndex(a) {
    return this.LookingGlassInverseViewMatrices[a] = this.LookingGlassInverseViewMatrices[a] || E.create();
  }
  getInputSources() {
    return [];
  }
  getInputPose(a, e, s) {
    return null;
  }
  onWindowResize() {
  }
}
let ke = 0;
class Se {
  constructor(a, e) {
    x(this, "mode");
    x(this, "immersive");
    x(this, "id");
    x(this, "baseLayer");
    x(this, "inlineVerticalFieldOfView");
    x(this, "ended");
    x(this, "enabledFeatures");
    this.mode = a, this.immersive = a === "immersive-vr" || a === "immersive-ar", this.id = ++ke, this.baseLayer = null, this.inlineVerticalFieldOfView = Math.PI * 0.5, this.ended = !1, this.enabledFeatures = e;
  }
}
class Fe extends fe {
  constructor(e) {
    super();
    x(this, "viewIndex");
    this.viewIndex = e;
  }
  get eye() {
    return "none";
  }
  _onPoseUpdate(e) {
    this._inverseBaseMatrix = e._getViewMatrixByIndex(this.viewIndex);
  }
}
class z extends ue {
  constructor(e) {
    super();
    x(this, "vrButton");
    x(this, "device");
    x(this, "isPresenting", !1);
    Y(e), this.loadPolyfill();
  }
  static async init(e) {
    new z(e);
  }
  async loadPolyfill() {
    this.overrideDefaultVRButton(), console.warn('Looking Glass WebXR "polyfill" overriding native WebXR API.');
    for (const e in H)
      this.global[e] = H[e];
    this.global.XRWebGLLayer = Le, this.injected = !0, this.device = new _e(this.global), this.xr = new ce(Promise.resolve(this.device)), Object.defineProperty(this.global.navigator, "xr", {
      value: this.xr,
      configurable: !0
    });
  }
  async overrideDefaultVRButton() {
    this.vrButton = await Pe("VRButton"), this.vrButton && this.device && (this.device.addEventListener("@@webxr-polyfill/vr-present-start", () => {
      this.isPresenting = !0, this.updateVRButtonUI();
    }), this.device.addEventListener("@@webxr-polyfill/vr-present-end", () => {
      this.isPresenting = !1, this.updateVRButtonUI();
    }), this.vrButton.addEventListener("click", (e) => {
      this.updateVRButtonUI();
    }), this.updateVRButtonUI());
  }
  async updateVRButtonUI() {
    if (this.vrButton) {
      await Me(100), this.isPresenting ? this.vrButton.innerHTML = "EXIT LOOKING GLASS" : this.vrButton.innerHTML = "ENTER LOOKING GLASS";
      const e = 220;
      this.vrButton.style.width = `${e}px`, this.vrButton.style.left = `calc(50% - ${e / 2}px)`;
    }
  }
  update(e) {
    Y(e);
  }
}
async function Pe(n) {
  return new Promise((a, e) => {
    const s = new MutationObserver(function(t) {
      t.forEach(function(o) {
        o.addedNodes.forEach(function(l) {
          const c = l;
          c.id == n && (a(c), s.disconnect());
        });
      });
    });
    s.observe(document.body, { subtree: !1, childList: !0 }), setTimeout(() => {
      s.disconnect(), e(`id:${n} not found`);
    }, 5e3);
  });
}
function Me(n) {
  return new Promise((a) => setTimeout(a, n));
}
const Ue = P();
export {
  Ue as LookingGlassConfig,
  z as LookingGlassWebXRPolyfill
};
