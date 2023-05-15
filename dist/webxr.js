var le = Object.defineProperty;
var ce = (n, a, e) => a in n ? le(n, a, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[a] = e;
var T = (n, a, e) => (ce(n, typeof a != "symbol" ? a + "" : a, e), e);
import Y from "@lookingglass/webxr-polyfill/src/api/index";
import ue from "@lookingglass/webxr-polyfill/src/api/XRSystem";
import de from "@lookingglass/webxr-polyfill/src/WebXRPolyfill";
import * as he from "holoplay-core";
import { Shader as q } from "holoplay-core";
import fe from "@lookingglass/webxr-polyfill/src/devices/XRDevice";
import pe from "@lookingglass/webxr-polyfill/src/api/XRSpace";
import { mat4 as E } from "gl-matrix";
import me, { PRIVATE as be } from "@lookingglass/webxr-polyfill/src/api/XRWebGLLayer";
const U = 1.6;
var H;
(function(n) {
  n[n.Swizzled = 0] = "Swizzled", n[n.Center = 1] = "Center", n[n.Quilt = 2] = "Quilt";
})(H || (H = {}));
class ve extends EventTarget {
  constructor(e) {
    super();
    T(this, "_calibration", {
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
    T(this, "_viewControls", {
      tileHeight: 512,
      numViews: 48,
      trackballX: 0,
      trackballY: 0,
      targetX: 0,
      targetY: U,
      targetZ: -0.5,
      targetDiam: 2,
      fovy: 13 / 180 * Math.PI,
      depthiness: 1.25,
      inlineView: H.Center,
      capturing: !1,
      quiltResolution: 3840,
      popup: null,
      XRSession: null,
      lkgCanvas: null,
      appCanvas: null
    });
    T(this, "LookingGlassDetected");
    this._viewControls = { ...this._viewControls, ...e }, this.syncCalibration();
  }
  syncCalibration() {
    new he.Client((e) => {
      if (e.devices.length < 1) {
        console.log("No Looking Glass devices found");
        return;
      }
      e.devices.length > 1 && console.log("More than one Looking Glass device found... using the first one"), this.calibration = e.devices[0].calibration;
    });
  }
  addEventListener(e, r, t) {
    super.addEventListener(e, r, t);
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
let W = null;
function P() {
  return W == null && (W = new ve()), W;
}
function z(n) {
  const a = P();
  n != null && a.updateViewControls(n);
}
async function we() {
  const n = P();
  function a() {
    if (n.appCanvas != null)
      try {
        let r = n.appCanvas.toDataURL();
        const t = document.createElement("a");
        t.style.display = "none", t.href = r, t.download = `hologram_qs${n.quiltWidth}x${n.quiltHeight}a${n.aspect}.png`, document.body.appendChild(t), t.click(), document.body.removeChild(t), window.URL.revokeObjectURL(r);
      } catch (r) {
        console.error("Error while capturing canvas data:", r);
      }
  }
  const e = document.getElementById("screenshotbutton");
  e && e.addEventListener("click", () => {
    const r = V.getInstance();
    if (!r) {
      console.warn("LookingGlassXRDevice not initialized");
      return;
    }
    r.captureScreenshot = !0, r.screenshotCallback = a;
  });
}
function Ee() {
  var a;
  const n = P();
  if (console.log(n, "for debugging purposes"), n.lkgCanvas == null)
    console.warn("window placement called without a valid XR Session!");
  else {
    let e = function() {
      let s = v.d - v.a, c = v.w - v.s;
      s && c && (s *= Math.sqrt(0.5), c *= Math.sqrt(0.5));
      const u = n.trackballX, p = n.trackballY, g = Math.cos(u) * s - Math.sin(u) * Math.cos(p) * c, k = -Math.sin(p) * c, _ = -Math.sin(u) * s - Math.cos(u) * Math.cos(p) * c;
      n.targetX = n.targetX + g * n.targetDiam * 0.03, n.targetY = n.targetY + k * n.targetDiam * 0.03, n.targetZ = n.targetZ + _ * n.targetDiam * 0.03, requestAnimationFrame(e);
    };
    const r = document.createElement("style");
    document.head.appendChild(r), (a = r.sheet) == null || a.insertRule("#LookingGlassWebXRControls * { all: revert; font-family: sans-serif }");
    const t = document.createElement("div");
    t.id = "LookingGlassWebXRControls", t.style.position = "fixed", t.style.zIndex = "1000", t.style.padding = "15px", t.style.width = "320px", t.style.maxWidth = "calc(100vw - 18px)", t.style.maxHeight = "calc(100vh - 18px)", t.style.whiteSpace = "nowrap", t.style.background = "rgba(0, 0, 0, 0.6)", t.style.color = "white", t.style.borderRadius = "10px", t.style.right = "15px", t.style.bottom = "15px", t.style.flex = "row";
    const l = document.createElement("div");
    t.appendChild(l), l.style.width = "100%", l.style.textAlign = "center", l.style.fontWeight = "bold", l.style.marginBottom = "8px", l.innerText = "Looking Glass Controls";
    const o = document.createElement("button");
    o.style.display = "block", o.style.margin = "auto", o.style.width = "100%", o.style.height = "35px", o.style.padding = "4px", o.style.marginBottom = "8px", o.style.borderRadius = "8px", o.id = "screenshotbutton", t.appendChild(o), o.innerText = "Save Hologram";
    const d = document.createElement("button");
    d.style.display = "block", d.style.margin = "auto", d.style.width = "100%", d.style.height = "35px", d.style.padding = "4px", d.style.marginBottom = "8px", d.style.borderRadius = "8px", d.id = "copybutton", t.appendChild(d), d.innerText = "Copy Config", d.addEventListener("click", () => {
      ge(n);
    });
    const h = document.createElement("div");
    t.appendChild(h), h.style.width = "290px", h.style.whiteSpace = "normal", h.style.color = "rgba(255,255,255,0.7)", h.style.fontSize = "14px", h.style.margin = "5px 0", h.innerHTML = "Click the popup and use WASD, mouse left/right drag, and scroll.";
    const S = document.createElement("div");
    t.appendChild(S);
    const y = (s, c, u) => {
      const p = u.stringify, g = document.createElement("div");
      g.style.marginBottom = "8px", S.appendChild(g);
      const k = s, _ = n[s], w = document.createElement("label");
      g.appendChild(w), w.innerText = u.label, w.setAttribute("for", k), w.style.width = "100px", w.style.display = "inline-block", w.style.textDecoration = "dotted underline 1px", w.style.fontFamily = '"Courier New"', w.style.fontSize = "13px", w.style.fontWeight = "bold", w.title = u.title;
      const m = document.createElement("input");
      g.appendChild(m), Object.assign(m, c), m.id = k, m.title = u.title, m.value = c.value !== void 0 ? c.value : _;
      const A = (b) => {
        n[s] = b, M(b);
      };
      m.oninput = () => {
        const b = c.type === "range" ? parseFloat(m.value) : c.type === "checkbox" ? m.checked : m.value;
        A(b);
      };
      const I = (b) => {
        let F = b(n[s]);
        u.fixRange && (F = u.fixRange(F), m.max = Math.max(parseFloat(m.max), F).toString(), m.min = Math.min(parseFloat(m.min), F).toString()), m.value = F, A(F);
      };
      c.type === "range" && (m.style.width = "110px", m.style.height = "8px", m.onwheel = (b) => {
        I((F) => F + Math.sign(b.deltaX - b.deltaY) * c.step);
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
      fixRange: (s) => Math.max(1 / 180 * Math.PI, Math.min(s, 120.1 / 180 * Math.PI)),
      stringify: (s) => {
        const c = s / Math.PI * 180, u = Math.atan(Math.tan(s / 2) * n.aspect) * 2 / Math.PI * 180;
        return `${c.toFixed()}&deg;&times;${u.toFixed()}&deg;`;
      }
    }), y("depthiness", { type: "range", min: 0, max: 2, step: 0.01 }, {
      label: "depthiness",
      title: 'exaggerates depth by multiplying the width of the view cone (as reported by the firmware) - can somewhat compensate for depthiness lost using higher fov. 1.25 seems to be most physically accurate on Looking Glass 8.9".',
      fixRange: (s) => Math.max(0, s),
      stringify: (s) => `${s.toFixed(2)}x`
    }), y("inlineView", { type: "range", min: 0, max: 2, step: 1 }, {
      label: "inline view",
      title: "what to show inline on the original canvas (swizzled = no overwrite)",
      fixRange: (s) => Math.max(0, Math.min(s, 2)),
      stringify: (s) => s === 0 ? "swizzled" : s === 1 ? "center" : s === 2 ? "quilt" : "?"
    }), n.lkgCanvas.oncontextmenu = (s) => {
      s.preventDefault();
    }, n.lkgCanvas.addEventListener("wheel", (s) => {
      const c = n.targetDiam, u = 1.1, p = Math.log(c) / Math.log(u);
      return n.targetDiam = Math.pow(u, p + s.deltaY * 0.01);
    }), n.lkgCanvas.addEventListener("mousemove", (s) => {
      const c = s.movementX, u = -s.movementY;
      if (s.buttons & 2 || s.buttons & 1 && (s.shiftKey || s.ctrlKey)) {
        const p = n.trackballX, g = n.trackballY, k = -Math.cos(p) * c + Math.sin(p) * Math.sin(g) * u, _ = -Math.cos(g) * u, w = Math.sin(p) * c + Math.cos(p) * Math.sin(g) * u;
        n.targetX = n.targetX + k * n.targetDiam * 1e-3, n.targetY = n.targetY + _ * n.targetDiam * 1e-3, n.targetZ = n.targetZ + w * n.targetDiam * 1e-3;
      } else
        s.buttons & 1 && (n.trackballX = n.trackballX - c * 0.01, n.trackballY = n.trackballY - u * 0.01);
    });
    const v = { w: 0, a: 0, s: 0, d: 0 };
    return n.lkgCanvas.addEventListener("keydown", (s) => {
      switch (s.code) {
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
    }), n.lkgCanvas.addEventListener("keyup", (s) => {
      switch (s.code) {
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
      we();
    }, 1e3), t;
  }
}
function ge(n) {
  let a = n.targetX, e = n.targetY, r = n.targetZ, t = `${Math.round(n.fovy / Math.PI * 180)} * Math.PI / 180`, l = n.targetDiam, o = n.trackballX, d = n.trackballY, h = n.depthiness;
  const S = {
    targetX: a,
    targetY: e,
    targetZ: r,
    fovy: t,
    targetDiam: l,
    trackballX: o,
    trackballY: d,
    depthiness: h
  };
  let y = JSON.stringify(S, null, 4);
  navigator.clipboard.writeText(y);
}
let G;
const ye = (n, a) => {
  const e = P();
  if (e.lkgCanvas == null) {
    console.warn("window placement called without a valid XR Session!");
    return;
  } else if (n == !1)
    Re(e, G);
  else {
    G == null && (G = Ee()), e.lkgCanvas.style.position = "fixed", e.lkgCanvas.style.bottom = "0", e.lkgCanvas.style.left = "0", e.lkgCanvas.width = e.calibration.screenW.value, e.lkgCanvas.height = e.calibration.screenH.value, document.body.appendChild(G);
    const r = "getScreenDetails" in window;
    console.log(r, "Screen placement API exists"), r ? Ce(e.lkgCanvas, e, a) : j(e, e.lkgCanvas, a);
  }
};
async function Ce(n, a, e) {
  const r = await window.getScreenDetails();
  console.log(r);
  const t = r.screens.filter((l) => l.label.includes("LKG"))[0];
  if (console.log(t, "monitors"), t === void 0) {
    console.log("no Looking Glass monitor detected - manually opening popup window"), j(a, n, e);
    return;
  } else {
    console.log("monitor ID", t.label, "serial number", a.calibration);
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
    a.popup = window.open("", "new", l), a.popup && (a.popup.document.body.style.background = "black", a.popup.document.body.appendChild(n), console.assert(e), a.popup.onbeforeunload = e);
  }
}
function j(n, a, e) {
  n.popup = window.open("", void 0, "width=640,height=360"), n.popup && (n.popup.document.title = "Looking Glass Window (fullscreen me on Looking Glass!)", n.popup.document.body.style.background = "black", n.popup.document.body.appendChild(a), console.assert(e), n.popup.onbeforeunload = e);
}
function Re(n, a) {
  var e;
  (e = a.parentElement) == null || e.removeChild(a), n.popup && (n.popup.onbeforeunload = null, n.popup.close(), n.popup = null);
}
const B = Symbol("LookingGlassXRWebGLLayer");
class Te extends me {
  constructor(a, e, r) {
    super(a, e, r);
    const t = P();
    t.appCanvas = e.canvas, t.lkgCanvas = document.createElement("canvas"), t.lkgCanvas.tabIndex = 0;
    const l = t.lkgCanvas.getContext("2d", { alpha: !1 });
    t.lkgCanvas.addEventListener("dblclick", function() {
      this.requestFullscreen();
    });
    const o = this[be].config, d = e.createTexture();
    let h, S;
    const y = e.createFramebuffer(), v = e.getExtension("OES_vertex_array_object"), s = 34229, c = v ? v.bindVertexArrayOES.bind(v) : e.bindVertexArray.bind(e);
    (o.depth || o.stencil) && (o.depth && o.stencil ? S = {
      format: e.DEPTH_STENCIL,
      attachment: e.DEPTH_STENCIL_ATTACHMENT
    } : o.depth ? S = {
      format: e.DEPTH_COMPONENT16,
      attachment: e.DEPTH_ATTACHMENT
    } : o.stencil && (S = {
      format: e.STENCIL_INDEX8,
      attachment: e.STENCIL_ATTACHMENT
    }), h = e.createRenderbuffer());
    const u = (i, x, C, f, R) => {
      p(i, x, R.framebufferWidth, R.framebufferHeight), C && g(i, C, f, R.framebufferWidth, R.framebufferHeight);
    }, p = (i, x, C, f) => {
      const R = i.getParameter(i.TEXTURE_BINDING_2D);
      i.bindTexture(i.TEXTURE_2D, x), i.texImage2D(i.TEXTURE_2D, 0, i.RGBA, C, f, 0, i.RGBA, i.UNSIGNED_BYTE, null), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MIN_FILTER, i.LINEAR), i.bindTexture(i.TEXTURE_2D, R);
    }, g = (i, x, C, f, R) => {
      const L = i.getParameter(i.RENDERBUFFER_BINDING);
      i.bindRenderbuffer(i.RENDERBUFFER, x), i.renderbufferStorage(i.RENDERBUFFER, C.format, f, R), i.bindRenderbuffer(i.RENDERBUFFER, L);
    }, k = (i, x, C, f, R, L) => {
      const X = i.getParameter(i.FRAMEBUFFER_BINDING);
      i.bindFramebuffer(i.FRAMEBUFFER, x), i.framebufferTexture2D(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0, i.TEXTURE_2D, C, 0), (L.depth || L.stencil) && i.framebufferRenderbuffer(i.FRAMEBUFFER, f.attachment, i.RENDERBUFFER, R), i.bindFramebuffer(i.FRAMEBUFFER, X);
    };
    u(e, d, h, S, t), t.addEventListener("on-config-changed", () => u(e, d, h, S, t)), k(e, y, d, S, h, o);
    const _ = `
		attribute vec2 a_position;
		varying vec2 v_texcoord;
		void main() {
		  gl_Position = vec4(a_position * 2.0 - 1.0, 0.0, 1.0);
		  v_texcoord = a_position;
		}
	  `;
    function w(i, x, C) {
      const f = i.createShader(x);
      return i.shaderSource(f, C), i.compileShader(f), i.getShaderParameter(f, i.COMPILE_STATUS) ? f : (console.warn(i.getShaderInfoLog(f)), null);
    }
    function m(i, x, C) {
      let f = i.createProgram();
      const R = w(i, i.VERTEX_SHADER, x), L = w(i, i.FRAGMENT_SHADER, C);
      return R === null || L === null ? (console.error("There was a problem with shader construction"), null) : (i.attachShader(f, R), i.attachShader(f, L), i.linkProgram(f), i.getProgramParameter(f, i.LINK_STATUS) ? f : (console.warn(i.getProgramInfoLog(f)), null));
    }
    let A, I, M, b;
    const F = (i, x, C) => {
      const f = C(x);
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
      const X = i.getUniformLocation(L, "u_texture"), oe = i.getParameter(i.CURRENT_PROGRAM);
      i.useProgram(L), i.uniform1i(X, 0), i.useProgram(oe), D && i.deleteProgram(D), D = L;
    };
    let D = m(e, _, q(t));
    D === null && console.warn("There was a problem with shader construction"), t.addEventListener("on-config-changed", () => {
      F(e, t, q);
    });
    const O = v ? v.createVertexArrayOES() : e.createVertexArray(), $ = e.createBuffer(), Z = e.getParameter(e.ARRAY_BUFFER_BINDING), Q = e.getParameter(s);
    c(O), e.bindBuffer(e.ARRAY_BUFFER, $), e.bufferData(e.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), e.STATIC_DRAW), e.enableVertexAttribArray(M), e.vertexAttribPointer(M, 2, e.FLOAT, !1, 0, 0), c(Q), e.bindBuffer(e.ARRAY_BUFFER, Z);
    const J = () => {
      console.assert(this[B].LookingGlassEnabled), e.bindFramebuffer(e.FRAMEBUFFER, this.framebuffer);
      const i = e.getParameter(e.COLOR_CLEAR_VALUE), x = e.getParameter(e.DEPTH_CLEAR_VALUE), C = e.getParameter(e.STENCIL_CLEAR_VALUE);
      e.clearColor(0, 0, 0, 0), e.clearDepth(1), e.clearStencil(0), e.clear(e.DEPTH_BUFFER_BIT | e.COLOR_BUFFER_BIT | e.STENCIL_BUFFER_BIT), e.clearColor(i[0], i[1], i[2], i[3]), e.clearDepth(x), e.clearStencil(C);
    };
    function ee() {
      if (!t.appCanvas || !t.lkgCanvas)
        return;
      (t.appCanvas.width !== t.framebufferWidth || t.appCanvas.height !== t.framebufferHeight) && (t.appCanvas.width, t.appCanvas.height, t.appCanvas.width = t.framebufferWidth, t.appCanvas.height = t.framebufferHeight);
      const i = ne();
      ie(), ae(), re(), se(), te(i);
    }
    function te(i) {
      e.activeTexture(i.activeTexture), e.bindTexture(e.TEXTURE_2D, i.textureBinding), e.useProgram(i.program), e.bindRenderbuffer(e.RENDERBUFFER, i.renderbufferBinding), e.bindFramebuffer(e.FRAMEBUFFER, i.framebufferBinding), i.scissorTest ? e.enable(e.SCISSOR_TEST) : e.disable(e.SCISSOR_TEST), i.stencilTest ? e.enable(e.STENCIL_TEST) : e.disable(e.STENCIL_TEST), i.depthTest ? e.enable(e.DEPTH_TEST) : e.disable(e.DEPTH_TEST), i.blend ? e.enable(e.BLEND) : e.disable(e.BLEND), i.cullFace ? e.enable(e.CULL_FACE) : e.disable(e.CULL_FACE), c(i.VAO);
    }
    function ne() {
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
    function ie() {
      e.bindFramebuffer(e.FRAMEBUFFER, null), e.useProgram(D), c(O), e.activeTexture(e.TEXTURE0), e.bindTexture(e.TEXTURE_2D, d), e.disable(e.BLEND), e.disable(e.CULL_FACE), e.disable(e.DEPTH_TEST), e.disable(e.STENCIL_TEST), e.viewport(0, 0, e.drawingBufferWidth, e.drawingBufferHeight);
    }
    function ae() {
      e.uniform1i(b, 0), e.drawArrays(e.TRIANGLES, 0, 6);
    }
    function re() {
      if (!t.lkgCanvas || !t.appCanvas) {
        console.warn("Looking Glass Canvas is not defined");
        return;
      }
      l == null || l.clearRect(0, 0, t.lkgCanvas.width, t.lkgCanvas.height), l == null || l.drawImage(t.appCanvas, 0, 0, t.framebufferWidth, t.framebufferHeight, 0, 0, t.calibration.screenW.value, t.calibration.screenH.value);
    }
    function se() {
      if (!t.appCanvas) {
        console.warn("Looking Glass Canvas is not defined");
        return;
      }
      t.inlineView !== 0 && (t.capturing && t.appCanvas.width !== t.framebufferWidth && (t.appCanvas.width = t.framebufferWidth, t.appCanvas.height = t.framebufferHeight, e.viewport(0, 0, t.framebufferHeight, t.framebufferWidth)), e.uniform1i(b, t.inlineView), e.drawArrays(e.TRIANGLES, 0, 6));
    }
    window.addEventListener("unload", () => {
      t.popup && t.popup.close(), t.popup = null;
    }), this[B] = {
      LookingGlassEnabled: !1,
      framebuffer: y,
      clearFramebuffer: J,
      blitTextureToDefaultFramebufferIfNeeded: ee,
      moveCanvasToWindow: ye
    };
  }
  get framebuffer() {
    return this[B].LookingGlassEnabled ? this[B].framebuffer : null;
  }
  get framebufferWidth() {
    return P().framebufferWidth;
  }
  get framebufferHeight() {
    return P().framebufferHeight;
  }
}
const N = class extends fe {
  constructor(a) {
    super(a), this.sessions = /* @__PURE__ */ new Map(), this.viewSpaces = [], this.basePoseMatrix = E.create(), this.inlineProjectionMatrix = E.create(), this.inlineInverseViewMatrix = E.create(), this.LookingGlassProjectionMatrices = [], this.LookingGlassInverseViewMatrices = [], this.captureScreenshot = !1, this.screenshotCallback = null, N.instance || (N.instance = this);
  }
  static getInstance() {
    return N.instance;
  }
  onBaseLayerSet(a, e) {
    const r = this.sessions.get(a);
    r.baseLayer = e;
    const t = P(), l = e[B];
    l.LookingGlassEnabled = r.immersive, r.immersive && (t.XRSession = this.sessions.get(a), t.popup == null ? l.moveCanvasToWindow(!0, () => {
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
    const r = a !== "inline", t = new Le(a, e);
    return this.sessions.set(t.id, t), r && this.dispatchEvent("@@webxr-polyfill/vr-present-start", t.id), Promise.resolve(t.id);
  }
  requestAnimationFrame(a) {
    return this.global.requestAnimationFrame(a);
  }
  cancelAnimationFrame(a) {
    this.global.cancelAnimationFrame(a);
  }
  onFrameStart(a, e) {
    const r = this.sessions.get(a), t = P();
    if (r.immersive) {
      const l = Math.tan(0.5 * t.fovy), o = 0.5 * t.targetDiam / l, d = o - t.targetDiam, h = this.basePoseMatrix;
      E.fromTranslation(h, [t.targetX, t.targetY, t.targetZ]), E.rotate(h, h, t.trackballX, [0, 1, 0]), E.rotate(h, h, -t.trackballY, [1, 0, 0]), E.translate(h, h, [0, 0, o]);
      for (let y = 0; y < t.numViews; ++y) {
        const v = (y + 0.5) / t.numViews - 0.5, s = Math.tan(t.viewCone * v), c = o * s, u = this.LookingGlassInverseViewMatrices[y] = this.LookingGlassInverseViewMatrices[y] || E.create();
        E.translate(u, h, [c, 0, 0]), E.invert(u, u);
        const p = Math.max(d + e.depthNear, 0.01), g = d + e.depthFar, k = p * l, _ = k, w = -k, m = p * -s, A = t.aspect * k, I = m + A, M = m - A, b = this.LookingGlassProjectionMatrices[y] = this.LookingGlassProjectionMatrices[y] || E.create();
        E.set(b, 2 * p / (I - M), 0, 0, 0, 0, 2 * p / (_ - w), 0, 0, (I + M) / (I - M), (_ + w) / (_ - w), -(g + p) / (g - p), -1, 0, 0, -2 * g * p / (g - p), 0);
      }
      r.baseLayer[B].clearFramebuffer();
    } else {
      const l = r.baseLayer.context, o = l.drawingBufferWidth / l.drawingBufferHeight;
      E.perspective(this.inlineProjectionMatrix, e.inlineVerticalFieldOfView, o, e.depthNear, e.depthFar), E.fromTranslation(this.basePoseMatrix, [0, U, 0]), E.invert(this.inlineInverseViewMatrix, this.basePoseMatrix);
    }
  }
  onFrameEnd(a) {
    this.sessions.get(a).baseLayer[B].blitTextureToDefaultFramebufferIfNeeded(), this.captureScreenshot && this.screenshotCallback && (this.screenshotCallback(), this.captureScreenshot = !1);
  }
  async requestFrameOfReferenceTransform(a, e) {
    const r = E.create();
    switch (a) {
      case "viewer":
      case "local":
        return E.fromTranslation(r, [0, -U, 0]), r;
      case "local-floor":
        return r;
      default:
        throw new Error("XRReferenceSpaceType not understood");
    }
  }
  endSession(a) {
    const e = this.sessions.get(a);
    e.immersive && e.baseLayer && (e.baseLayer[B].moveCanvasToWindow(!1), this.dispatchEvent("@@webxr-polyfill/vr-present-end", a)), e.ended = !0;
  }
  doesSessionSupportReferenceSpace(a, e) {
    const r = this.sessions.get(a);
    return r.ended ? !1 : r.enabledFeatures.has(e);
  }
  getViewSpaces(a) {
    if (a === "immersive-vr") {
      const e = P();
      for (let r = this.viewSpaces.length; r < e.numViews; ++r)
        this.viewSpaces[r] = new _e(r);
      return this.viewSpaces.length = e.numViews, this.viewSpaces;
    }
  }
  getViewport(a, e, r, t, l) {
    if (l === void 0) {
      const d = this.sessions.get(a).baseLayer.context;
      t.x = 0, t.y = 0, t.width = d.drawingBufferWidth, t.height = d.drawingBufferHeight;
    } else {
      const o = P(), d = l % o.quiltWidth, h = Math.floor(l / o.quiltWidth);
      t.x = o.framebufferWidth / o.quiltWidth * d, t.y = o.framebufferHeight / o.quiltHeight * h, t.width = o.framebufferWidth / o.quiltWidth, t.height = o.framebufferHeight / o.quiltHeight;
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
  getInputPose(a, e, r) {
    return null;
  }
  onWindowResize() {
  }
};
let V = N;
T(V, "instance", null);
let xe = 0;
class Le {
  constructor(a, e) {
    T(this, "mode");
    T(this, "immersive");
    T(this, "id");
    T(this, "baseLayer");
    T(this, "inlineVerticalFieldOfView");
    T(this, "ended");
    T(this, "enabledFeatures");
    this.mode = a, this.immersive = a === "immersive-vr" || a === "immersive-ar", this.id = ++xe, this.baseLayer = null, this.inlineVerticalFieldOfView = Math.PI * 0.5, this.ended = !1, this.enabledFeatures = e;
  }
}
class _e extends pe {
  constructor(e) {
    super();
    T(this, "viewIndex");
    this.viewIndex = e;
  }
  get eye() {
    return "none";
  }
  _onPoseUpdate(e) {
    this._inverseBaseMatrix = e._getViewMatrixByIndex(this.viewIndex);
  }
}
class K extends de {
  constructor(e) {
    super();
    T(this, "vrButton");
    T(this, "device");
    T(this, "isPresenting", !1);
    z(e), this.loadPolyfill();
  }
  static async init(e) {
    new K(e);
  }
  async loadPolyfill() {
    this.overrideDefaultVRButton(), console.warn('Looking Glass WebXR "polyfill" overriding native WebXR API.');
    for (const e in Y)
      this.global[e] = Y[e];
    this.global.XRWebGLLayer = Te, this.injected = !0, this.device = new V(this.global), this.xr = new ue(Promise.resolve(this.device)), Object.defineProperty(this.global.navigator, "xr", {
      value: this.xr,
      configurable: !0
    });
  }
  async overrideDefaultVRButton() {
    this.vrButton = await Se("VRButton"), this.vrButton && this.device ? (this.device.addEventListener("@@webxr-polyfill/vr-present-start", () => {
      this.isPresenting = !0, this.updateVRButtonUI();
    }), this.device.addEventListener("@@webxr-polyfill/vr-present-end", () => {
      this.isPresenting = !1, this.updateVRButtonUI();
    }), this.vrButton.addEventListener("click", (e) => {
      this.updateVRButtonUI();
    }), this.updateVRButtonUI()) : console.warn("Unable to find VRButton");
  }
  async updateVRButtonUI() {
    if (this.vrButton) {
      await ke(100), this.isPresenting ? this.vrButton.innerHTML = "EXIT LOOKING GLASS" : this.vrButton.innerHTML = "ENTER LOOKING GLASS";
      const e = 220;
      this.vrButton.style.width = `${e}px`, this.vrButton.style.left = `calc(50% - ${e / 2}px)`;
    }
  }
  update(e) {
    z(e);
  }
}
async function Se(n) {
  return new Promise((a) => {
    const e = new MutationObserver(function(r) {
      r.forEach(function(t) {
        t.addedNodes.forEach(function(l) {
          const o = l;
          o.id === n && (a(o), e.disconnect());
        });
      });
    });
    e.observe(document.body, { subtree: !1, childList: !0 }), setTimeout(() => {
      e.disconnect(), a(null);
    }, 5e3);
  });
}
function ke(n) {
  return new Promise((a) => setTimeout(a, n));
}
const Ge = P();
export {
  Ge as LookingGlassConfig,
  K as LookingGlassWebXRPolyfill
};
