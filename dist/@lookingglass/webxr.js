var ce = Object.defineProperty;
var le = (s, i, e) => i in s ? ce(s, i, { enumerable: !0, configurable: !0, writable: !0, value: e }) : s[i] = e;
var L = (s, i, e) => (le(s, typeof i != "symbol" ? i + "" : i, e), e);
import O from "@lookingglass/webxr-polyfill/src/api/index";
import de from "@lookingglass/webxr-polyfill/src/api/XRSystem";
import ue from "@lookingglass/webxr-polyfill/src/WebXRPolyfill";
import * as q from "holoplay-core";
import { Shader as he } from "holoplay-core";
import fe from "@lookingglass/webxr-polyfill/src/devices/XRDevice";
import pe from "@lookingglass/webxr-polyfill/src/api/XRSpace";
import { mat4 as y } from "gl-matrix";
import me, { PRIVATE as be } from "@lookingglass/webxr-polyfill/src/api/XRWebGLLayer";
const G = 1.6;
let k = 3840;
var U;
(function(s) {
  s[s.Swizzled = 0] = "Swizzled", s[s.Center = 1] = "Center", s[s.Quilt = 2] = "Quilt";
})(U || (U = {}));
class ve extends EventTarget {
  constructor(e) {
    super();
    L(this, "_calibration", {
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
    L(this, "_viewControls", {
      tileHeight: 512,
      numViews: 45,
      trackballX: 0,
      trackballY: 0,
      targetX: 0,
      targetY: G,
      targetZ: -0.5,
      targetDiam: 2,
      fovy: 13 / 180 * Math.PI,
      depthiness: 1.25,
      inlineView: U.Center,
      capturing: !1,
      popup: null,
      XRSession: null
    });
    L(this, "LookingGlassDetected");
    this._viewControls = { ...this._viewControls, ...e }, this.syncCalibration();
  }
  syncCalibration() {
    new q.Client((e) => {
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
    return Math.round(k / this.quiltHeight);
  }
  set tileHeight(e) {
    this.updateViewControls({ tileHeight: e });
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
  get aspect() {
    return this._calibration.screenW.value / this._calibration.screenH.value;
  }
  get tileWidth() {
    return Math.round(k / this.quiltWidth);
  }
  get framebufferWidth() {
    return this._calibration.screenW.value < 7e3 ? k : 8192;
  }
  get quiltWidth() {
    return this.calibration.screenW.value == 1536 ? 8 : this.calibration.screenW.value == 3840 || this.calibration.screenW.value == 8192 ? 5 : 8;
  }
  get quiltHeight() {
    return this.calibration.screenW.value == 1536 ? 6 : this.calibration.screenW.value == 3840 || this.calibration.screenW.value == 8192 ? 9 : 6;
  }
  get framebufferHeight() {
    return this._calibration.screenW.value < 7e3 ? k : 8192;
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
let V = null;
function P() {
  return V == null && (V = new ve()), V;
}
function Y(s) {
  const i = P();
  s != null && i.updateViewControls(s);
}
function we(s, i) {
  const e = new MediaSource();
  e.addEventListener("sourceopen", _, !1);
  let r, t, a, n;
  const f = document.getElementById("looking-glass-video"), b = document.getElementById("recordbutton"), v = document.getElementById("downloadbutton"), p = document.getElementById("screenshotbutton");
  b == null || b.addEventListener("click", d), v == null || v.addEventListener("click", w), p == null || p.addEventListener("click", R);
  function _(u) {
    console.log("MediaSource opened"), a = e.addSourceBuffer('video/webm; codecs="h264"'), console.log("Source buffer: ", a);
  }
  function S(u) {
    u.data && u.data.size > 0 && t.push(u.data);
  }
  function o(u) {
    console.log("Recorder stopped: ", u);
    const h = new Blob(t, { type: "video/webm" });
    f && (f.src = window.URL.createObjectURL(h));
  }
  function d() {
    n == null ? (n = s.captureStream(), console.log("Started stream capture from canvas element: ", n)) : (n = null, console.log("theoretically set stream to null and stop capture", n)), i.capturing === !1 ? (i.capturing = !0, i.inlineView != 2 && (i.inlineView = 2), l()) : (m(), i.capturing = !1, b && v && (b.textContent = "Record", v.disabled = !1));
  }
  function l() {
    let u = { mimeType: "video/webm" };
    t = [];
    try {
      r = new MediaRecorder(n, u);
    } catch (h) {
      console.log("Unable to create MediaRecorder with options Object: ", h);
      try {
        u = { mimeType: "video/webm,codecs=h264" }, r = new MediaRecorder(n, u);
      } catch (c) {
        console.log("Unable to create MediaRecorder with options Object: ", c);
        try {
          u = { mimeType: "video/h264" }, r = new MediaRecorder(n, u);
        } catch (T) {
          alert(`MediaRecorder is not supported by this browser.

Try Firefox 29 or later, or Chrome 47 or later, with Enable experimental Web Platform features enabled from chrome://flags.`), console.error("Exception while creating MediaRecorder:", T);
          return;
        }
      }
    }
    console.log("Created MediaRecorder", r, "with options", u), b && v && (b.textContent = "Stop Recording", v.disabled = !0), r.onstop = o, r.ondataavailable = S, r.start(100), console.log("MediaRecorder started", r);
  }
  function m() {
    r.stop(), console.log("Recorded Blobs: ", t);
  }
  function w() {
    const u = new Blob(t, { type: "video/webm" }), h = window.URL.createObjectURL(u), c = document.createElement("a");
    c.style.display = "none", c.href = h, c.download = `hologram_qs${i.quiltWidth}x${i.quiltHeight}a${i.aspect}.webm`, document.body.appendChild(c), c.click(), setTimeout(() => {
      document.body.removeChild(c), window.URL.revokeObjectURL(h);
    }, 100);
  }
  function R() {
    let u = s.toDataURL();
    const h = document.createElement("a");
    h.style.display = "none", h.href = u, h.download = `hologram_qs${i.quiltWidth}x${i.quiltHeight}a${i.aspect}.png`, document.body.appendChild(h), h.click(), document.body.removeChild(h), window.URL.revokeObjectURL(u);
  }
}
function Ee(s, i) {
  var S;
  const e = P(), r = document.createElement("style");
  document.head.appendChild(r), (S = r.sheet) == null || S.insertRule("#LookingGlassWebXRControls * { all: revert; font-family: sans-serif }");
  const t = document.createElement("div");
  t.id = "LookingGlassWebXRControls", t.style.position = "fixed", t.style.zIndex = "1000", t.style.padding = "15px", t.style.width = "320px", t.style.maxWidth = "calc(100vw - 18px)", t.style.maxHeight = "calc(100vh - 18px)", t.style.whiteSpace = "nowrap", t.style.background = "rgba(0, 0, 0, 0.6)", t.style.color = "white", t.style.borderRadius = "10px", t.style.right = "15px", t.style.bottom = "15px", t.style.flex = "row";
  const a = document.createElement("div");
  t.appendChild(a), a.style.width = "100%", a.style.textAlign = "center", a.style.fontWeight = "bold", a.style.marginBottom = "8px", a.innerText = "Looking Glass Controls";
  const n = document.createElement("button");
  n.style.display = "block", n.style.margin = "auto", n.style.width = "100%", n.style.height = "35px", n.style.padding = "4px", n.style.marginBottom = "8px", n.style.borderRadius = "8px", n.id = "screenshotbutton", t.appendChild(n), n.innerText = "Save Hologram";
  const f = document.createElement("div");
  t.appendChild(f), f.style.width = "290px", f.style.whiteSpace = "normal", f.style.color = "rgba(255,255,255,0.7)", f.style.fontSize = "14px", f.style.margin = "5px 0", f.innerHTML = "Click the popup and use WASD, mouse left/right drag, and scroll.";
  const b = document.createElement("div");
  t.appendChild(b);
  const v = (o, d, l) => {
    const m = l.stringify, w = document.createElement("div");
    w.style.marginBottom = "8px", b.appendChild(w);
    const R = o, u = e[o], h = document.createElement("label");
    w.appendChild(h), h.innerText = l.label, h.setAttribute("for", R), h.style.width = "100px", h.style.display = "inline-block", h.style.textDecoration = "dotted underline 1px", h.style.fontFamily = '"Courier New"', h.style.fontSize = "13px", h.style.fontWeight = "bold", h.title = l.title;
    const c = document.createElement("input");
    w.appendChild(c), Object.assign(c, d), c.id = R, c.title = l.title, c.value = d.value !== void 0 ? d.value : u;
    const T = (E) => {
      e[o] = E, A(E);
    };
    c.oninput = () => {
      const E = d.type === "range" ? parseFloat(c.value) : d.type === "checkbox" ? c.checked : c.value;
      T(E);
    };
    const C = (E) => {
      let x = E(e[o]);
      l.fixRange && (x = l.fixRange(x), c.max = Math.max(parseFloat(c.max), x).toString(), c.min = Math.min(parseFloat(c.min), x).toString()), c.value = x, T(x);
    };
    d.type === "range" && (c.style.width = "110px", c.style.height = "8px", c.onwheel = (E) => {
      C((x) => x + Math.sign(E.deltaX - E.deltaY) * d.step);
    });
    let A = (E) => {
    };
    if (m) {
      const E = document.createElement("span");
      E.style.fontFamily = '"Courier New"', E.style.fontSize = "13px", E.style.marginLeft = "3px", w.appendChild(E), A = (x) => {
        E.innerHTML = m(x);
      }, A(u);
    }
    return C;
  };
  v("fovy", {
    type: "range",
    min: 1 / 180 * Math.PI,
    max: 120.1 / 180 * Math.PI,
    step: 1 / 180 * Math.PI
  }, {
    label: "fov",
    title: "perspective fov (degrades stereo effect)",
    fixRange: (o) => Math.max(1 / 180 * Math.PI, Math.min(o, 120.1 / 180 * Math.PI)),
    stringify: (o) => {
      const d = o / Math.PI * 180, l = Math.atan(Math.tan(o / 2) * e.aspect) * 2 / Math.PI * 180;
      return `${d.toFixed()}&deg;&times;${l.toFixed()}&deg;`;
    }
  }), v("depthiness", { type: "range", min: 0, max: 2, step: 0.01 }, {
    label: "depthiness",
    title: 'exaggerates depth by multiplying the width of the view cone (as reported by the firmware) - can somewhat compensate for depthiness lost using higher fov. 1.25 seems to be most physically accurate on Looking Glass 8.9".',
    fixRange: (o) => Math.max(0, o),
    stringify: (o) => `${o.toFixed(2)}x`
  }), v("inlineView", { type: "range", min: 0, max: 2, step: 1 }, {
    label: "inline view",
    title: "what to show inline on the original canvas (swizzled = no overwrite)",
    fixRange: (o) => Math.max(0, Math.min(o, 2)),
    stringify: (o) => o === 0 ? "swizzled" : o === 1 ? "center" : o === 2 ? "quilt" : "?"
  }), s.oncontextmenu = (o) => {
    o.preventDefault();
  }, s.addEventListener("wheel", (o) => {
    const d = e.targetDiam, l = 1.1, m = Math.log(d) / Math.log(l);
    return e.targetDiam = Math.pow(l, m + o.deltaY * 0.01);
  }), s.addEventListener("mousemove", (o) => {
    const d = o.movementX, l = -o.movementY;
    if (o.buttons & 2 || o.buttons & 1 && (o.shiftKey || o.ctrlKey)) {
      const m = e.trackballX, w = e.trackballY, R = -Math.cos(m) * d + Math.sin(m) * Math.sin(w) * l, u = -Math.cos(w) * l, h = Math.sin(m) * d + Math.cos(m) * Math.sin(w) * l;
      e.targetX = e.targetX + R * e.targetDiam * 1e-3, e.targetY = e.targetY + u * e.targetDiam * 1e-3, e.targetZ = e.targetZ + h * e.targetDiam * 1e-3;
    } else
      o.buttons & 1 && (e.trackballX = e.trackballX - d * 0.01, e.trackballY = e.trackballY - l * 0.01);
  });
  const p = { w: 0, a: 0, s: 0, d: 0 };
  s.addEventListener("keydown", (o) => {
    switch (o.code) {
      case "KeyW":
        p.w = 1;
        break;
      case "KeyA":
        p.a = 1;
        break;
      case "KeyS":
        p.s = 1;
        break;
      case "KeyD":
        p.d = 1;
        break;
    }
  }), s.addEventListener("keyup", (o) => {
    switch (o.code) {
      case "KeyW":
        p.w = 0;
        break;
      case "KeyA":
        p.a = 0;
        break;
      case "KeyS":
        p.s = 0;
        break;
      case "KeyD":
        p.d = 0;
        break;
    }
  }), requestAnimationFrame(_);
  function _() {
    let o = p.d - p.a, d = p.w - p.s;
    o && d && (o *= Math.sqrt(0.5), d *= Math.sqrt(0.5));
    const l = e.trackballX, m = e.trackballY, w = Math.cos(l) * o - Math.sin(l) * Math.cos(m) * d, R = -Math.sin(m) * d, u = -Math.sin(l) * o - Math.cos(l) * Math.cos(m) * d;
    e.targetX = e.targetX + w * e.targetDiam * 0.03, e.targetY = e.targetY + R * e.targetDiam * 0.03, e.targetZ = e.targetZ + u * e.targetDiam * 0.03, requestAnimationFrame(_);
  }
  return setTimeout(() => {
    we(i, e);
  }, 1e3), t;
}
async function ye(s, i, e, r) {
  const t = await window.getScreenDetails();
  console.log(t);
  const a = t.screens.filter((n) => n.label.includes("LKG"))[0];
  if (console.log(a, "monitors"), a === void 0) {
    console.log("no Looking Glass monitor detected - manually opening popup window"), j(i, s, r);
    return;
  } else {
    console.log("monitor ID", a.label, "serial number", i.calibration);
    const n = [
      `left=${a.left}`,
      `top=${a.top}`,
      `width=${a.width}`,
      `height=${a.height}`,
      "menubar=no",
      "toolbar=no",
      "location=no",
      "status=no",
      "resizable=yes",
      "scrollbars=no",
      "fullscreenEnabled=true"
    ].join(",");
    i.popup = window.open("", "new", n), i.popup && (i.popup.document.body.style.background = "black", i.popup.document.body.appendChild(s), console.assert(r), i.popup.onbeforeunload = r);
  }
}
async function j(s, i, e) {
  s.popup = window.open("", void 0, "width=640,height=360"), s.popup && (s.popup.document.title = "Looking Glass Window (fullscreen me on Looking Glass!)", s.popup.document.body.style.background = "black", s.popup.document.body.appendChild(i), console.assert(e), s.popup.onbeforeunload = e);
}
const F = Symbol("LookingGlassXRWebGLLayer");
class ge extends me {
  constructor(i, e, r) {
    super(i, e, r);
    const t = P(), a = e.canvas, n = document.createElement("canvas");
    n.tabIndex = 0;
    const f = n.getContext("2d", { alpha: !1 });
    n.addEventListener("dblclick", function() {
      this.requestFullscreen();
    });
    const b = Ee(n, a), v = this[be].config, p = e.createTexture();
    let _, S;
    const o = e.createFramebuffer(), d = e.enable.bind(e), l = e.disable.bind(e), m = e.getExtension("OES_vertex_array_object"), w = 34229, R = m ? m.bindVertexArrayOES.bind(m) : e.bindVertexArray.bind(e);
    (v.depth || v.stencil) && (v.depth && v.stencil ? S = {
      format: e.DEPTH_STENCIL,
      attachment: e.DEPTH_STENCIL_ATTACHMENT
    } : v.depth ? S = {
      format: e.DEPTH_COMPONENT16,
      attachment: e.DEPTH_ATTACHMENT
    } : v.stencil && (S = {
      format: e.STENCIL_INDEX8,
      attachment: e.STENCIL_ATTACHMENT
    }), _ = e.createRenderbuffer());
    const u = () => {
      const g = e.getParameter(e.TEXTURE_BINDING_2D);
      if (e.bindTexture(e.TEXTURE_2D, p), e.texImage2D(e.TEXTURE_2D, 0, e.RGBA, t.framebufferWidth, t.framebufferHeight, 0, e.RGBA, e.UNSIGNED_BYTE, null), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.LINEAR), e.bindTexture(e.TEXTURE_2D, g), _) {
        const M = e.getParameter(e.RENDERBUFFER_BINDING);
        e.bindRenderbuffer(e.RENDERBUFFER, _), e.renderbufferStorage(e.RENDERBUFFER, S.format, t.framebufferWidth, t.framebufferHeight), e.bindRenderbuffer(e.RENDERBUFFER, M);
      }
    };
    u(), t.addEventListener("on-config-changed", u);
    const h = e.getParameter(e.FRAMEBUFFER_BINDING);
    e.bindFramebuffer(e.FRAMEBUFFER, o), e.framebufferTexture2D(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, p, 0), (v.depth || v.stencil) && e.framebufferRenderbuffer(e.FRAMEBUFFER, S.attachment, e.RENDERBUFFER, _), e.bindFramebuffer(e.FRAMEBUFFER, h);
    const c = e.createProgram(), T = e.createShader(e.VERTEX_SHADER), C = e.createShader(e.FRAGMENT_SHADER);
    if (c === null || T === null || C === null) {
      console.error("there was a problem with shader construction");
      return;
    }
    e.attachShader(c, T), e.attachShader(c, C);
    {
      const g = `
       attribute vec2 a_position;
       varying vec2 v_texcoord;
       void main() {
         gl_Position = vec4(a_position * 2.0 - 1.0, 0.0, 1.0);
         v_texcoord = a_position;
       }
     `;
      e.shaderSource(T, g), e.compileShader(T), e.getShaderParameter(T, e.COMPILE_STATUS) || console.warn(e.getShaderInfoLog(T));
    }
    let A, E, x;
    const N = () => {
      const g = he(t);
      if (g === A)
        return;
      if (A = g, e.shaderSource(C, g), e.compileShader(C), !e.getShaderParameter(C, e.COMPILE_STATUS)) {
        console.warn(e.getShaderInfoLog(C));
        return;
      }
      if (e.linkProgram(c), !e.getProgramParameter(c, e.LINK_STATUS)) {
        console.warn(e.getProgramInfoLog(c));
        return;
      }
      E = e.getAttribLocation(c, "a_position"), x = e.getUniformLocation(c, "u_viewType");
      const M = e.getUniformLocation(c, "u_texture"), B = e.getParameter(e.CURRENT_PROGRAM);
      e.useProgram(c), e.uniform1i(M, 0), e.useProgram(B);
    };
    t.addEventListener("on-config-changed", N);
    const W = m ? m.createVertexArrayOES() : e.createVertexArray(), z = e.createBuffer(), K = e.getParameter(e.ARRAY_BUFFER_BINDING), Z = e.getParameter(w);
    R(W), e.bindBuffer(e.ARRAY_BUFFER, z), e.bufferData(e.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), e.STATIC_DRAW), e.enableVertexAttribArray(E), e.vertexAttribPointer(E, 2, e.FLOAT, !1, 0, 0), R(Z), e.bindBuffer(e.ARRAY_BUFFER, K);
    const Q = () => {
      console.assert(this[F].LookingGlassEnabled), e.bindFramebuffer(e.FRAMEBUFFER, this.framebuffer);
      const g = e.getParameter(e.COLOR_CLEAR_VALUE), M = e.getParameter(e.DEPTH_CLEAR_VALUE), B = e.getParameter(e.STENCIL_CLEAR_VALUE);
      e.clearColor(0, 0, 0, 0), e.clearDepth(1), e.clearStencil(0), e.clear(e.DEPTH_BUFFER_BIT | e.COLOR_BUFFER_BIT | e.STENCIL_BUFFER_BIT), e.clearColor(g[0], g[1], g[2], g[3]), e.clearDepth(M), e.clearStencil(B);
    };
    let X, H;
    const J = () => {
      if (!this[F].LookingGlassEnabled)
        return;
      (a.width !== t.framebufferWidth || a.height !== t.framebufferHeight) && (X = a.width, H = a.height, a.width = t.framebufferWidth, a.height = t.framebufferHeight);
      const g = e.getParameter(w), M = e.getParameter(e.CULL_FACE), B = e.getParameter(e.BLEND), I = e.getParameter(e.DEPTH_TEST), te = e.getParameter(e.STENCIL_TEST), ie = e.getParameter(e.SCISSOR_TEST), D = e.getParameter(e.VIEWPORT), ne = e.getParameter(e.FRAMEBUFFER_BINDING), re = e.getParameter(e.RENDERBUFFER_BINDING), oe = e.getParameter(e.CURRENT_PROGRAM), ae = e.getParameter(e.ACTIVE_TEXTURE);
      {
        const se = e.getParameter(e.TEXTURE_BINDING_2D);
        e.bindFramebuffer(e.FRAMEBUFFER, null), e.useProgram(c), R(W), e.activeTexture(e.TEXTURE0), e.bindTexture(e.TEXTURE_2D, p), e.disable(e.BLEND), e.disable(e.CULL_FACE), e.disable(e.DEPTH_TEST), e.disable(e.STENCIL_TEST), e.viewport(0, 0, e.drawingBufferWidth, e.drawingBufferHeight), e.uniform1i(x, 0), e.drawArrays(e.TRIANGLES, 0, 6), f == null || f.clearRect(0, 0, n.width, n.height), f == null || f.drawImage(a, 0, 0, t.framebufferWidth, t.framebufferHeight, 0, 0, t.calibration.screenW.value, t.calibration.screenH.value), t.inlineView !== 0 && (t.capturing && a.width !== t.framebufferWidth && (a.width = t.framebufferWidth, a.height = t.framebufferHeight, e.viewport(0, 0, t.framebufferHeight, t.framebufferWidth)), e.uniform1i(x, t.inlineView), e.drawArrays(e.TRIANGLES, 0, 6)), e.bindTexture(e.TEXTURE_2D, se);
      }
      e.activeTexture(ae), e.useProgram(oe), e.bindRenderbuffer(e.RENDERBUFFER, re), e.bindFramebuffer(e.FRAMEBUFFER, ne), e.viewport(D[0], D[1], D[2], D[3]), (ie ? d : l)(e.SCISSOR_TEST), (te ? d : l)(e.STENCIL_TEST), (I ? d : l)(e.DEPTH_TEST), (B ? d : l)(e.BLEND), (M ? d : l)(e.CULL_FACE), R(g);
    };
    window.addEventListener("unload", () => {
      t.popup && t.popup.close(), t.popup = null;
    });
    const ee = (g, M) => {
      var B;
      if (!!t.popup != g)
        if (g) {
          N(), n.style.position = "fixed", n.style.bottom = "0", n.style.left = "0", n.width = t.calibration.screenW.value, n.height = t.calibration.screenH.value, document.body.appendChild(b);
          const I = "getScreenDetails" in window;
          console.log(I, "Screen placement API exists"), I ? ye(n, t, g, M) : j(t, n, M);
        } else
          (B = b.parentElement) == null || B.removeChild(b), a.width = X, a.height = H, t.popup && (t.popup.onbeforeunload = null, t.popup.close(), t.popup = null);
    };
    this[F] = {
      LookingGlassEnabled: !1,
      framebuffer: o,
      clearFramebuffer: Q,
      blitTextureToDefaultFramebufferIfNeeded: J,
      moveCanvasToWindow: ee
    };
  }
  get framebuffer() {
    return this[F].LookingGlassEnabled ? this[F].framebuffer : null;
  }
  get framebufferWidth() {
    return P().framebufferWidth;
  }
  get framebufferHeight() {
    return P().framebufferHeight;
  }
}
class Re extends fe {
  constructor(i) {
    super(i), this.sessions = /* @__PURE__ */ new Map(), this.viewSpaces = [], this.basePoseMatrix = y.create(), this.inlineProjectionMatrix = y.create(), this.inlineInverseViewMatrix = y.create(), this.LookingGlassProjectionMatrices = [], this.LookingGlassInverseViewMatrices = [];
  }
  onBaseLayerSet(i, e) {
    const r = this.sessions.get(i);
    r.baseLayer = e;
    const t = P(), a = e[F];
    a.LookingGlassEnabled = r.immersive, r.immersive && (t.XRSession = this.sessions.get(i), a.moveCanvasToWindow(!0, () => {
      this.endSession(i);
    }));
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
    const r = i !== "inline", t = new Le(i, e);
    return this.sessions.set(t.id, t), r && this.dispatchEvent("@@webxr-polyfill/vr-present-start", t.id), Promise.resolve(t.id);
  }
  requestAnimationFrame(i) {
    return this.global.requestAnimationFrame(i);
  }
  cancelAnimationFrame(i) {
    this.global.cancelAnimationFrame(i);
  }
  onFrameStart(i, e) {
    const r = this.sessions.get(i), t = P();
    if (r.immersive) {
      const a = Math.tan(0.5 * t.fovy), n = 0.5 * t.targetDiam / a, f = n - t.targetDiam, b = this.basePoseMatrix;
      y.fromTranslation(b, [t.targetX, t.targetY, t.targetZ]), y.rotate(b, b, t.trackballX, [0, 1, 0]), y.rotate(b, b, -t.trackballY, [1, 0, 0]), y.translate(b, b, [0, 0, n]);
      for (let p = 0; p < t.numViews; ++p) {
        const _ = (p + 0.5) / t.numViews - 0.5, S = Math.tan(t.viewCone * _), o = n * S, d = this.LookingGlassInverseViewMatrices[p] = this.LookingGlassInverseViewMatrices[p] || y.create();
        y.translate(d, b, [o, 0, 0]), y.invert(d, d);
        const l = Math.max(f + e.depthNear, 0.01), m = f + e.depthFar, w = l * a, R = w, u = -w, h = l * -S, c = t.aspect * w, T = h + c, C = h - c, A = this.LookingGlassProjectionMatrices[p] = this.LookingGlassProjectionMatrices[p] || y.create();
        y.set(A, 2 * l / (T - C), 0, 0, 0, 0, 2 * l / (R - u), 0, 0, (T + C) / (T - C), (R + u) / (R - u), -(m + l) / (m - l), -1, 0, 0, -2 * m * l / (m - l), 0);
      }
      r.baseLayer[F].clearFramebuffer();
    } else {
      const a = r.baseLayer.context, n = a.drawingBufferWidth / a.drawingBufferHeight;
      y.perspective(this.inlineProjectionMatrix, e.inlineVerticalFieldOfView, n, e.depthNear, e.depthFar), y.fromTranslation(this.basePoseMatrix, [0, G, 0]), y.invert(this.inlineInverseViewMatrix, this.basePoseMatrix);
    }
  }
  onFrameEnd(i) {
    this.sessions.get(i).baseLayer[F].blitTextureToDefaultFramebufferIfNeeded();
  }
  async requestFrameOfReferenceTransform(i, e) {
    const r = y.create();
    switch (i) {
      case "viewer":
      case "local":
        return y.fromTranslation(r, [0, -G, 0]), r;
      case "local-floor":
        return r;
      default:
        throw new Error("XRReferenceSpaceType not understood");
    }
  }
  endSession(i) {
    const e = this.sessions.get(i);
    e.immersive && e.baseLayer && (e.baseLayer[F].moveCanvasToWindow(!1), this.dispatchEvent("@@webxr-polyfill/vr-present-end", i)), e.ended = !0;
  }
  doesSessionSupportReferenceSpace(i, e) {
    const r = this.sessions.get(i);
    return r.ended ? !1 : r.enabledFeatures.has(e);
  }
  getViewSpaces(i) {
    if (i === "immersive-vr") {
      const e = P();
      for (let r = this.viewSpaces.length; r < e.numViews; ++r)
        this.viewSpaces[r] = new xe(r);
      return this.viewSpaces.length = e.numViews, this.viewSpaces;
    }
  }
  getViewport(i, e, r, t, a) {
    if (a === void 0) {
      const f = this.sessions.get(i).baseLayer.context;
      t.x = 0, t.y = 0, t.width = f.drawingBufferWidth, t.height = f.drawingBufferHeight;
    } else {
      const n = P(), f = a % n.quiltWidth, b = Math.floor(a / n.quiltWidth);
      t.x = n.tileWidth * f, t.y = n.tileHeight * b, t.width = n.tileWidth, t.height = n.tileHeight;
    }
    return !0;
  }
  getProjectionMatrix(i, e) {
    return e === void 0 ? this.inlineProjectionMatrix : this.LookingGlassProjectionMatrices[e] || y.create();
  }
  getBasePoseMatrix() {
    return this.basePoseMatrix;
  }
  getBaseViewMatrix() {
    return this.inlineInverseViewMatrix;
  }
  _getViewMatrixByIndex(i) {
    return this.LookingGlassInverseViewMatrices[i] = this.LookingGlassInverseViewMatrices[i] || y.create();
  }
  getInputSources() {
    return [];
  }
  getInputPose(i, e, r) {
    return null;
  }
  onWindowResize() {
  }
}
let Te = 0;
class Le {
  constructor(i, e) {
    L(this, "mode");
    L(this, "immersive");
    L(this, "id");
    L(this, "baseLayer");
    L(this, "inlineVerticalFieldOfView");
    L(this, "ended");
    L(this, "enabledFeatures");
    this.mode = i, this.immersive = i === "immersive-vr" || i === "immersive-ar", this.id = ++Te, this.baseLayer = null, this.inlineVerticalFieldOfView = Math.PI * 0.5, this.ended = !1, this.enabledFeatures = e;
  }
}
class xe extends pe {
  constructor(e) {
    super();
    L(this, "viewIndex");
    this.viewIndex = e;
  }
  get eye() {
    return "none";
  }
  _onPoseUpdate(e) {
    this._inverseBaseMatrix = e._getViewMatrixByIndex(this.viewIndex);
  }
}
class $ extends ue {
  constructor(e) {
    super();
    L(this, "vrButton");
    L(this, "device");
    L(this, "isPresenting", !1);
    Y(e), this.loadPolyfill();
  }
  static async init(e) {
    new $(e);
  }
  static async detectLookingGlassDevice() {
    return new Promise((e) => {
      new q.Client(async (r) => {
        console.log(r, "message from core"), r.devices.length > 0 ? e(!0) : e(!1);
      });
    });
  }
  async loadPolyfill() {
    this.overrideDefaultVRButton(), console.warn('Looking Glass WebXR "polyfill" overriding native WebXR API.');
    for (const e in O)
      this.global[e] = O[e];
    this.global.XRWebGLLayer = ge, this.injected = !0, this.device = new Re(this.global), this.xr = new de(Promise.resolve(this.device)), Object.defineProperty(this.global.navigator, "xr", {
      value: this.xr,
      configurable: !0
    });
  }
  async overrideDefaultVRButton() {
    this.vrButton = await Se("VRButton"), this.vrButton && this.device && (this.device.addEventListener("@@webxr-polyfill/vr-present-start", () => {
      this.isPresenting = !0, this.updateVRButtonUI();
    }), this.device.addEventListener("@@webxr-polyfill/vr-present-end", () => {
      this.isPresenting = !1, this.updateVRButtonUI();
    }), this.vrButton.addEventListener("click", (e) => {
      this.updateVRButtonUI();
    }), this.updateVRButtonUI());
  }
  async updateVRButtonUI() {
    if (this.vrButton) {
      await Ce(100), this.isPresenting ? this.vrButton.innerHTML = "EXIT LOOKING GLASS" : this.vrButton.innerHTML = "ENTER LOOKING GLASS";
      const e = 220;
      this.vrButton.style.width = `${e}px`, this.vrButton.style.left = `calc(50% - ${e / 2}px)`;
    }
  }
  update(e) {
    Y(e);
  }
}
async function Se(s) {
  return new Promise((i, e) => {
    const r = new MutationObserver(function(t) {
      t.forEach(function(a) {
        a.addedNodes.forEach(function(n) {
          const f = n;
          f.id == s && (i(f), r.disconnect());
        });
      });
    });
    r.observe(document.body, { subtree: !1, childList: !0 }), setTimeout(() => {
      r.disconnect(), e(`id:${s} not found`);
    }, 5e3);
  });
}
function Ce(s) {
  return new Promise((i) => setTimeout(i, s));
}
const Ve = P();
export {
  Ve as LookingGlassConfig,
  $ as LookingGlassWebXRPolyfill
};
