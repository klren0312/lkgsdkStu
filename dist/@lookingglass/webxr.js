var se = Object.defineProperty;
var ce = (c, n, e) => n in c ? se(c, n, { enumerable: !0, configurable: !0, writable: !0, value: e }) : c[n] = e;
var x = (c, n, e) => (ce(c, typeof n != "symbol" ? n + "" : n, e), e);
import Y from "@lookingglass/webxr-polyfill/src/api/index";
import le from "@lookingglass/webxr-polyfill/src/api/XRSystem";
import de from "@lookingglass/webxr-polyfill/src/WebXRPolyfill";
import * as q from "holoplay-core";
import { Shader as ue } from "holoplay-core";
import he from "@lookingglass/webxr-polyfill/src/devices/XRDevice";
import fe from "@lookingglass/webxr-polyfill/src/api/XRSpace";
import { mat4 as R } from "gl-matrix";
import pe, { PRIVATE as me } from "@lookingglass/webxr-polyfill/src/api/XRWebGLLayer";
const G = 1.6;
let V = 3360;
var N;
(function(c) {
  c[c.Swizzled = 0] = "Swizzled", c[c.Center = 1] = "Center", c[c.Quilt = 2] = "Quilt";
})(N || (N = {}));
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
      numViews: 45,
      trackballX: 0,
      trackballY: 0,
      targetX: 0,
      targetY: G,
      targetZ: -0.5,
      targetDiam: 2,
      fovy: 13 / 180 * Math.PI,
      depthiness: 1.25,
      inlineView: N.Center,
      capturing: !1,
      popup: null
    });
    x(this, "LookingGlassDetected");
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
    return V / 6;
  }
  get numViews() {
    return 48;
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
  get aspect() {
    return 0.75;
  }
  get tileWidth() {
    return V / 8;
  }
  get framebufferWidth() {
    return this._calibration.screenW.value < 8e3 ? V : 8192;
  }
  get quiltWidth() {
    return 8;
  }
  get quiltHeight() {
    return 6;
  }
  get framebufferHeight() {
    return this._calibration.screenW.value < 8e3 ? V : 8192;
  }
  get viewCone() {
    return this._calibration.viewCone.value * this.depthiness / 180 * Math.PI;
  }
  get tilt() {
    return this._calibration.screenH.value / (this._calibration.screenW.value * this._calibration.slope.value) * (this._calibration.flipImageX.value ? -1 : 1);
  }
  get subp() {
    return 1 / (this._calibration.screenW.value * 3);
  }
  get pitch() {
    const e = this._calibration.screenW.value / this._calibration.DPI.value;
    return this._calibration.pitch.value * e * Math.cos(Math.atan(1 / this._calibration.slope.value));
  }
}
let U = null;
function B() {
  return U == null && (U = new be()), U;
}
function j(c) {
  const n = B();
  c != null && n.updateViewControls(c);
}
function we(c, n) {
  const e = new MediaSource();
  e.addEventListener("sourceopen", M, !1);
  let r, t, s, o;
  const f = document.getElementById("looking-glass-video"), h = document.getElementById("recordbutton"), L = document.getElementById("downloadbutton"), v = document.getElementById("screenshotbutton");
  h.onclick = S, L.onclick = u, v.onclick = l;
  function M(a) {
    console.log("MediaSource opened"), s = e.addSourceBuffer('video/webm; codecs="h264"'), console.log("Source buffer: ", s);
  }
  function C(a) {
    a.data && a.data.size > 0 && t.push(a.data);
  }
  function E(a) {
    console.log("Recorder stopped: ", a);
    const p = new Blob(t, { type: "video/webm" });
    f.src = window.URL.createObjectURL(p);
  }
  function S() {
    o == null ? (o = c.captureStream(), console.log("Started stream capture from canvas element: ", o)) : (o = null, console.log("theoretically set stream to null and stop capture", o)), h.textContent === "Record" ? (n.capturing = !0, n.inlineView != 2 && (n.inlineView = 2), y()) : (i(), n.capturing = !1, h.textContent = "Record", L.disabled = !1);
  }
  function y() {
    let a = { mimeType: "video/webm" };
    t = [];
    try {
      r = new MediaRecorder(o, a);
    } catch (p) {
      console.log("Unable to create MediaRecorder with options Object: ", p);
      try {
        a = { mimeType: "video/webm,codecs=h264" }, r = new MediaRecorder(o, a);
      } catch (d) {
        console.log("Unable to create MediaRecorder with options Object: ", d);
        try {
          a = { mimeType: "video/h264" }, r = new MediaRecorder(o, a);
        } catch (m) {
          alert(`MediaRecorder is not supported by this browser.

Try Firefox 29 or later, or Chrome 47 or later, with Enable experimental Web Platform features enabled from chrome://flags.`), console.error("Exception while creating MediaRecorder:", m);
          return;
        }
      }
    }
    console.log("Created MediaRecorder", r, "with options", a), h.textContent = "Stop Recording", L.disabled = !0, r.onstop = E, r.ondataavailable = C, r.start(100), console.log("MediaRecorder started", r);
  }
  function i() {
    r.stop(), console.log("Recorded Blobs: ", t), f.controls = !0;
  }
  function u() {
    const a = new Blob(t, { type: "video/webm" }), p = window.URL.createObjectURL(a), d = document.createElement("a");
    d.style.display = "none", d.href = p, d.download = "hologram_qs8x6a0.75.webm", document.body.appendChild(d), d.click(), setTimeout(() => {
      document.body.removeChild(d), window.URL.revokeObjectURL(p);
    }, 100);
  }
  function l() {
    n.capturing = !0;
    let a = n.inlineView;
    n.inlineView != 2 && (n.inlineView = 2), setTimeout(() => {
      c.toBlob((p) => {
        const d = window.URL.createObjectURL(p), m = document.createElement("a");
        m.style.display = "none", m.href = d, m.download = "hologram_qs8x6a0.75.png", document.body.appendChild(m), m.click(), document.body.removeChild(m), window.URL.revokeObjectURL(d);
      }, "image/png"), n.inlineView = a, n.capturing = !1;
    }, 250);
  }
}
function ve(c, n) {
  var y;
  const e = B(), r = document.createElement("style");
  document.head.appendChild(r), (y = r.sheet) == null || y.insertRule("#LookingGlassWebXRControls * { all: revert; font-family: sans-serif }");
  const t = document.createElement("div");
  t.id = "LookingGlassWebXRControls", t.style.position = "fixed", t.style.zIndex = "1000", t.style.padding = "15px", t.style.width = "320px", t.style.maxWidth = "calc(100vw - 18px)", t.style.maxHeight = "calc(100vh - 18px)", t.style.whiteSpace = "nowrap", t.style.background = "rgba(0, 0, 0, 0.6)", t.style.color = "white", t.style.borderRadius = "10px", t.style.right = "15px", t.style.bottom = "15px", t.style.flex = "row";
  const s = document.createElement("div");
  t.appendChild(s), s.style.width = "100%", s.style.textAlign = "center", s.style.fontWeight = "bold", s.innerText = "Looking Glass Controls";
  const o = document.createElement("button");
  o.innerText = "Record", t.appendChild(o), o.id = "recordbutton";
  const f = document.createElement("button");
  f.innerText = "Download Video", t.appendChild(f), f.id = "downloadbutton";
  const h = document.createElement("video");
  t.appendChild(h), h.id = "looking-glass-video", h.width = 240, h.height = 320, h.style.backgroundColor = "black", h.style.display = "none";
  const L = document.createElement("button");
  L.id = "screenshotbutton", t.appendChild(L), L.innerText = "Take Screenshot";
  const v = document.createElement("div");
  t.appendChild(v), v.style.width = "100%", v.style.whiteSpace = "normal", v.style.color = "rgba(255,255,255,0.7)", v.style.fontSize = "14px", v.style.margin = "5px 0", v.innerHTML = "Click the popup and use WASD, mouse left/right drag, and scroll.";
  const M = document.createElement("div");
  t.appendChild(M);
  const C = (i, u, l) => {
    const a = l.stringify, p = document.createElement("div");
    p.style.marginBottom = "8px", M.appendChild(p);
    const d = i, m = e[i], b = document.createElement("label");
    p.appendChild(b), b.innerText = l.label, b.setAttribute("for", d), b.style.width = "100px", b.style.display = "inline-block", b.style.textDecoration = "dotted underline 1px", b.style.fontFamily = '"Courier New"', b.style.fontSize = "13px", b.style.fontWeight = "bold", b.title = l.title;
    const w = document.createElement("input");
    p.appendChild(w), Object.assign(w, u), w.id = d, w.title = l.title, w.value = u.value !== void 0 ? u.value : m;
    const A = (g) => {
      e[i] = g, k(g);
    };
    w.oninput = () => {
      const g = u.type === "range" ? parseFloat(w.value) : u.type === "checkbox" ? w.checked : w.value;
      A(g);
    };
    const D = (g) => {
      let _ = g(e[i]);
      l.fixRange && (_ = l.fixRange(_), w.max = Math.max(parseFloat(w.max), _).toString(), w.min = Math.min(parseFloat(w.min), _).toString()), w.value = _, A(_);
    };
    u.type === "range" && (w.style.width = "110px", w.style.height = "8px", w.onwheel = (g) => {
      D((_) => _ + Math.sign(g.deltaX - g.deltaY) * u.step);
    });
    let k = (g) => {
    };
    if (a) {
      const g = document.createElement("span");
      g.style.fontFamily = '"Courier New"', g.style.fontSize = "13px", g.style.marginLeft = "3px", p.appendChild(g), k = (_) => {
        g.innerHTML = a(_);
      }, k(m);
    }
    return D;
  };
  C("fovy", {
    type: "range",
    min: 1 / 180 * Math.PI,
    max: 120.1 / 180 * Math.PI,
    step: 1 / 180 * Math.PI
  }, {
    label: "fov",
    title: "perspective fov (degrades stereo effect)",
    fixRange: (i) => Math.max(1 / 180 * Math.PI, Math.min(i, 120.1 / 180 * Math.PI)),
    stringify: (i) => {
      const u = i / Math.PI * 180, l = Math.atan(Math.tan(i / 2) * e.aspect) * 2 / Math.PI * 180;
      return `${u.toFixed()}&deg;&times;${l.toFixed()}&deg;`;
    }
  }), C("depthiness", { type: "range", min: 0, max: 2, step: 0.01 }, {
    label: "depthiness",
    title: 'exaggerates depth by multiplying the width of the view cone (as reported by the firmware) - can somewhat compensate for depthiness lost using higher fov. 1.25 seems to be most physically accurate on Looking Glass 8.9".',
    fixRange: (i) => Math.max(0, i),
    stringify: (i) => `${i.toFixed(2)}x`
  }), C("inlineView", { type: "range", min: 0, max: 2, step: 1 }, {
    label: "inline view",
    title: "what to show inline on the original canvas (swizzled = no overwrite)",
    fixRange: (i) => Math.max(0, Math.min(i, 2)),
    stringify: (i) => i === 0 ? "swizzled" : i === 1 ? "center" : i === 2 ? "quilt" : "?"
  }), c.oncontextmenu = (i) => {
    i.preventDefault();
  }, c.addEventListener("wheel", (i) => {
    const u = e.targetDiam, l = 1.1, a = Math.log(u) / Math.log(l);
    return e.targetDiam = Math.pow(l, a + i.deltaY * 0.01);
  }), c.addEventListener("mousemove", (i) => {
    const u = i.movementX, l = -i.movementY;
    if (i.buttons & 2 || i.buttons & 1 && (i.shiftKey || i.ctrlKey)) {
      const a = e.trackballX, p = e.trackballY, d = -Math.cos(a) * u + Math.sin(a) * Math.sin(p) * l, m = -Math.cos(p) * l, b = Math.sin(a) * u + Math.cos(a) * Math.sin(p) * l;
      e.targetX = e.targetX + d * e.targetDiam * 1e-3, e.targetY = e.targetY + m * e.targetDiam * 1e-3, e.targetZ = e.targetZ + b * e.targetDiam * 1e-3;
    } else
      i.buttons & 1 && (e.trackballX = e.trackballX - u * 0.01, e.trackballY = e.trackballY - l * 0.01);
  });
  const E = { w: 0, a: 0, s: 0, d: 0 };
  c.addEventListener("keydown", (i) => {
    switch (i.code) {
      case "KeyW":
        E.w = 1;
        break;
      case "KeyA":
        E.a = 1;
        break;
      case "KeyS":
        E.s = 1;
        break;
      case "KeyD":
        E.d = 1;
        break;
    }
  }), c.addEventListener("keyup", (i) => {
    switch (i.code) {
      case "KeyW":
        E.w = 0;
        break;
      case "KeyA":
        E.a = 0;
        break;
      case "KeyS":
        E.s = 0;
        break;
      case "KeyD":
        E.d = 0;
        break;
    }
  }), requestAnimationFrame(S);
  function S() {
    let i = E.d - E.a, u = E.w - E.s;
    i && u && (i *= Math.sqrt(0.5), u *= Math.sqrt(0.5));
    const l = e.trackballX, a = e.trackballY, p = Math.cos(l) * i - Math.sin(l) * Math.cos(a) * u, d = -Math.sin(a) * u, m = -Math.sin(l) * i - Math.cos(l) * Math.cos(a) * u;
    e.targetX = e.targetX + p * e.targetDiam * 0.03, e.targetY = e.targetY + d * e.targetDiam * 0.03, e.targetZ = e.targetZ + m * e.targetDiam * 0.03, requestAnimationFrame(S);
  }
  return setTimeout(() => {
    we(n, e);
  }, 1e3), t;
}
const P = Symbol("LookingGlassXRWebGLLayer");
class Ee extends pe {
  constructor(n, e, r) {
    super(n, e, r);
    const t = B(), s = e.canvas, o = document.createElement("canvas");
    o.tabIndex = 0;
    const f = o.getContext("2d", { alpha: !1 });
    o.addEventListener("dblclick", function() {
      this.requestFullscreen();
    });
    const h = ve(o, s), L = this[me].config, v = e.createTexture();
    let M, C;
    const E = e.createFramebuffer(), S = e.enable.bind(e), y = e.disable.bind(e), i = e.getExtension("OES_vertex_array_object"), u = 34229, l = i ? i.bindVertexArrayOES.bind(i) : e.bindVertexArray.bind(e);
    (L.depth || L.stencil) && (L.depth && L.stencil ? C = {
      format: e.DEPTH_STENCIL,
      attachment: e.DEPTH_STENCIL_ATTACHMENT
    } : L.depth ? C = {
      format: e.DEPTH_COMPONENT16,
      attachment: e.DEPTH_ATTACHMENT
    } : L.stencil && (C = {
      format: e.STENCIL_INDEX8,
      attachment: e.STENCIL_ATTACHMENT
    }), M = e.createRenderbuffer());
    const a = () => {
      const T = e.getParameter(e.TEXTURE_BINDING_2D);
      if (e.bindTexture(e.TEXTURE_2D, v), e.texImage2D(e.TEXTURE_2D, 0, e.RGBA, t.framebufferWidth, t.framebufferHeight, 0, e.RGBA, e.UNSIGNED_BYTE, null), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.LINEAR), e.bindTexture(e.TEXTURE_2D, T), M) {
        const F = e.getParameter(e.RENDERBUFFER_BINDING);
        e.bindRenderbuffer(e.RENDERBUFFER, M), e.renderbufferStorage(e.RENDERBUFFER, C.format, t.framebufferWidth, t.framebufferHeight), e.bindRenderbuffer(e.RENDERBUFFER, F);
      }
    };
    a(), t.addEventListener("on-config-changed", a);
    const p = e.getParameter(e.FRAMEBUFFER_BINDING);
    e.bindFramebuffer(e.FRAMEBUFFER, E), e.framebufferTexture2D(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, v, 0), (L.depth || L.stencil) && e.framebufferRenderbuffer(e.FRAMEBUFFER, C.attachment, e.RENDERBUFFER, M), e.bindFramebuffer(e.FRAMEBUFFER, p);
    const d = e.createProgram(), m = e.createShader(e.VERTEX_SHADER);
    e.attachShader(d, m);
    const b = e.createShader(e.FRAGMENT_SHADER);
    e.attachShader(d, b);
    {
      const T = `
       attribute vec2 a_position;
       varying vec2 v_texcoord;
       void main() {
         gl_Position = vec4(a_position * 2.0 - 1.0, 0.0, 1.0);
         v_texcoord = a_position;
       }
     `;
      e.shaderSource(m, T), e.compileShader(m), e.getShaderParameter(m, e.COMPILE_STATUS) || console.warn(e.getShaderInfoLog(m));
    }
    let w, A, D;
    const k = () => {
      const T = ue(t);
      if (T === w)
        return;
      if (w = T, e.shaderSource(b, T), e.compileShader(b), !e.getShaderParameter(b, e.COMPILE_STATUS)) {
        console.warn(e.getShaderInfoLog(b));
        return;
      }
      if (e.linkProgram(d), !e.getProgramParameter(d, e.LINK_STATUS)) {
        console.warn(e.getProgramInfoLog(d));
        return;
      }
      A = e.getAttribLocation(d, "a_position"), D = e.getUniformLocation(d, "u_viewType");
      const F = e.getUniformLocation(d, "u_texture"), I = e.getParameter(e.CURRENT_PROGRAM);
      e.useProgram(d), e.uniform1i(F, 0), e.useProgram(I);
    };
    t.addEventListener("on-config-changed", k);
    const g = i ? i.createVertexArrayOES() : e.createVertexArray(), _ = e.createBuffer(), z = e.getParameter(e.ARRAY_BUFFER_BINDING), K = e.getParameter(u);
    l(g), e.bindBuffer(e.ARRAY_BUFFER, _), e.bufferData(e.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), e.STATIC_DRAW), e.enableVertexAttribArray(A), e.vertexAttribPointer(A, 2, e.FLOAT, !1, 0, 0), l(K), e.bindBuffer(e.ARRAY_BUFFER, z);
    const $ = () => {
      console.assert(this[P].LookingGlassEnabled), e.bindFramebuffer(e.FRAMEBUFFER, this.framebuffer);
      const T = e.getParameter(e.COLOR_CLEAR_VALUE), F = e.getParameter(e.DEPTH_CLEAR_VALUE), I = e.getParameter(e.STENCIL_CLEAR_VALUE);
      e.clearColor(0, 0, 0, 0), e.clearDepth(1), e.clearStencil(0), e.clear(e.DEPTH_BUFFER_BIT | e.COLOR_BUFFER_BIT | e.STENCIL_BUFFER_BIT), e.clearColor(T[0], T[1], T[2], T[3]), e.clearDepth(F), e.clearStencil(I);
    };
    let W, H;
    const Z = () => {
      if (!this[P].LookingGlassEnabled)
        return;
      (s.width !== t.calibration.screenW.value || s.height !== t.calibration.screenH.value) && !t.capturing && (W = s.width, H = s.height, s.width = t.calibration.screenW.value, s.height = t.calibration.screenH.value);
      const T = e.getParameter(u), F = e.getParameter(e.CULL_FACE), I = e.getParameter(e.BLEND), O = e.getParameter(e.DEPTH_TEST), J = e.getParameter(e.STENCIL_TEST), ee = e.getParameter(e.SCISSOR_TEST), te = e.getParameter(e.VIEWPORT), ne = e.getParameter(e.FRAMEBUFFER_BINDING), ie = e.getParameter(e.RENDERBUFFER_BINDING), re = e.getParameter(e.CURRENT_PROGRAM), oe = e.getParameter(e.ACTIVE_TEXTURE);
      {
        const ae = e.getParameter(e.TEXTURE_BINDING_2D);
        e.bindFramebuffer(e.FRAMEBUFFER, null), e.useProgram(d), l(g), e.activeTexture(e.TEXTURE0), e.bindTexture(e.TEXTURE_2D, v), e.disable(e.BLEND), e.disable(e.CULL_FACE), e.disable(e.DEPTH_TEST), e.disable(e.STENCIL_TEST), e.viewport(0, 0, e.drawingBufferWidth, e.drawingBufferHeight), e.uniform1i(D, 0), e.drawArrays(e.TRIANGLES, 0, 6), f == null || f.clearRect(0, 0, o.width, o.height), t.capturing || f == null || f.drawImage(s, 0, 0, 1536, 2048, 0, 0, 1536, 2048), t.inlineView !== 0 && (t.capturing && s.width !== t.framebufferWidth && (s.width = t.framebufferWidth, s.height = t.framebufferHeight, e.viewport(0, 0, t.framebufferHeight, t.framebufferWidth)), e.uniform1i(D, t.inlineView), e.drawArrays(e.TRIANGLES, 0, 6)), e.bindTexture(e.TEXTURE_2D, ae);
      }
      e.activeTexture(oe), e.useProgram(re), e.bindRenderbuffer(e.RENDERBUFFER, ie), e.bindFramebuffer(e.FRAMEBUFFER, ne), e.viewport(...te), (ee ? S : y)(e.SCISSOR_TEST), (J ? S : y)(e.STENCIL_TEST), (O ? S : y)(e.DEPTH_TEST), (I ? S : y)(e.BLEND), (F ? S : y)(e.CULL_FACE), l(T);
    };
    window.addEventListener("unload", () => {
      t.popup && t.popup.close(), t.popup = void 0;
    });
    const Q = (T, F) => {
      var I;
      !!t.popup != T && (T ? (k(), o.style.position = "fixed", o.style.bottom = "0", o.style.left = "0", o.width = t.calibration.screenW.value, o.height = t.calibration.screenH.value, document.body.appendChild(h), "getScreenDetails" in window ? this.placeWindow(o, t, T, F) : (t.popup = window.open("", void 0, "width=640,height=360"), t.popup.document.title = "Looking Glass Window (fullscreen me on Looking Glass!)", t.popup.document.body.style.background = "black", t.popup.document.body.appendChild(o), console.assert(F), t.popup.onbeforeunload = F)) : ((I = h.parentElement) == null || I.removeChild(h), s.width = W, s.height = H, t.popup.onbeforeunload = void 0, t.popup.close(), t.popup = void 0));
    };
    this[P] = {
      LookingGlassEnabled: !1,
      framebuffer: E,
      clearFramebuffer: $,
      blitTextureToDefaultFramebufferIfNeeded: Z,
      moveCanvasToWindow: Q
    };
  }
  async placeWindow(n, e, r, t) {
    const o = (await window.getScreenDetails()).screens.filter((h) => h.label.includes("LKG"))[0];
    console.log("monitor ID", o.label, "serial number", e._calibration.serial);
    const f = [
      `left=${o.left}`,
      `top=${o.top}`,
      `width=${o.width}`,
      `height=${o.height}`,
      "menubar=no",
      "toolbar=no",
      "location=no",
      "status=no",
      "resizable=yes",
      "scrollbars=no",
      "fullscreenEnabled=true"
    ].join(",");
    e.popup = window.open("", "new", f), e.popup.document.body.style.background = "black", e.popup.document.body.appendChild(n), console.assert(t), e.popup.onbeforeunload = t;
  }
  get framebuffer() {
    return this[P].LookingGlassEnabled ? this[P].framebuffer : null;
  }
  get framebufferWidth() {
    return B().framebufferWidth;
  }
  get framebufferHeight() {
    return B().framebufferHeight;
  }
}
class ye extends he {
  constructor(n) {
    super(n), this.sessions = /* @__PURE__ */ new Map(), this.viewSpaces = [], this.basePoseMatrix = R.create(), this.inlineProjectionMatrix = R.create(), this.inlineInverseViewMatrix = R.create(), this.LookingGlassProjectionMatrices = [], this.LookingGlassInverseViewMatrices = [];
  }
  onBaseLayerSet(n, e) {
    const r = this.sessions.get(n);
    r.baseLayer = e;
    const t = e[P];
    t.LookingGlassEnabled = r.immersive, r.immersive && t.moveCanvasToWindow(!0, () => {
      this.endSession(n);
    });
  }
  isSessionSupported(n) {
    return n === "inline" || n === "immersive-vr";
  }
  isFeatureSupported(n) {
    switch (n) {
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
        return console.warn("LookingGlassXRDevice.isFeatureSupported: feature not understood:", n), !1;
    }
  }
  async requestSession(n, e) {
    if (!this.isSessionSupported(n))
      return Promise.reject();
    const r = n !== "inline", t = new Re(n, e);
    return this.sessions.set(t.id, t), r && this.dispatchEvent("@@webxr-polyfill/vr-present-start", t.id), Promise.resolve(t.id);
  }
  requestAnimationFrame(n) {
    return this.global.requestAnimationFrame(n);
  }
  cancelAnimationFrame(n) {
    this.global.cancelAnimationFrame(n);
  }
  onFrameStart(n, e) {
    const r = this.sessions.get(n), t = B();
    if (r.immersive) {
      const s = Math.tan(0.5 * t.fovy), o = 0.5 * t.targetDiam / s, f = o - t.targetDiam, h = this.basePoseMatrix;
      R.fromTranslation(h, [t.targetX, t.targetY, t.targetZ]), R.rotate(h, h, t.trackballX, [0, 1, 0]), R.rotate(h, h, -t.trackballY, [1, 0, 0]), R.translate(h, h, [0, 0, o]);
      for (let v = 0; v < t.numViews; ++v) {
        const M = (v + 0.5) / t.numViews - 0.5, C = Math.tan(t.viewCone * M), E = o * C, S = this.LookingGlassInverseViewMatrices[v] = this.LookingGlassInverseViewMatrices[v] || R.create();
        R.translate(S, h, [E, 0, 0]), R.invert(S, S);
        const y = Math.max(f + e.depthNear, 0.01), i = f + e.depthFar, u = y * s, l = u, a = -u, p = y * -C, d = t.aspect * u, m = p + d, b = p - d, w = this.LookingGlassProjectionMatrices[v] = this.LookingGlassProjectionMatrices[v] || R.create();
        R.set(w, 2 * y / (m - b), 0, 0, 0, 0, 2 * y / (l - a), 0, 0, (m + b) / (m - b), (l + a) / (l - a), -(i + y) / (i - y), -1, 0, 0, -2 * i * y / (i - y), 0);
      }
      r.baseLayer[P].clearFramebuffer();
    } else {
      const s = r.baseLayer.context, o = s.drawingBufferWidth / s.drawingBufferHeight;
      R.perspective(this.inlineProjectionMatrix, e.inlineVerticalFieldOfView, o, e.depthNear, e.depthFar), R.fromTranslation(this.basePoseMatrix, [0, G, 0]), R.invert(this.inlineInverseViewMatrix, this.basePoseMatrix);
    }
  }
  onFrameEnd(n) {
    this.sessions.get(n).baseLayer[P].blitTextureToDefaultFramebufferIfNeeded();
  }
  async requestFrameOfReferenceTransform(n, e) {
    const r = R.create();
    switch (n) {
      case "viewer":
      case "local":
        return R.fromTranslation(r, [0, -G, 0]), r;
      case "local-floor":
        return r;
      default:
        throw new Error("XRReferenceSpaceType not understood");
    }
  }
  endSession(n) {
    const e = this.sessions.get(n);
    e.immersive && e.baseLayer && (e.baseLayer[P].moveCanvasToWindow(!1), this.dispatchEvent("@@webxr-polyfill/vr-present-end", n)), e.ended = !0;
  }
  doesSessionSupportReferenceSpace(n, e) {
    const r = this.sessions.get(n);
    return r.ended ? !1 : r.enabledFeatures.has(e);
  }
  getViewSpaces(n) {
    if (n === "immersive-vr") {
      const e = B();
      for (let r = this.viewSpaces.length; r < e.numViews; ++r)
        this.viewSpaces[r] = new Te(r);
      return this.viewSpaces.length = e.numViews, this.viewSpaces;
    }
  }
  getViewport(n, e, r, t, s) {
    if (s === void 0) {
      const f = this.sessions.get(n).baseLayer.context;
      t.x = 0, t.y = 0, t.width = f.drawingBufferWidth, t.height = f.drawingBufferHeight;
    } else {
      const o = B(), f = s % o.quiltWidth, h = Math.floor(s / o.quiltWidth);
      t.x = o.tileWidth * f, t.y = o.tileHeight * h, t.width = o.tileWidth, t.height = o.tileHeight;
    }
    return !0;
  }
  getProjectionMatrix(n, e) {
    return e === void 0 ? this.inlineProjectionMatrix : this.LookingGlassProjectionMatrices[e] || R.create();
  }
  getBasePoseMatrix() {
    return this.basePoseMatrix;
  }
  getBaseViewMatrix() {
    return this.inlineInverseViewMatrix;
  }
  _getViewMatrixByIndex(n) {
    return this.LookingGlassInverseViewMatrices[n] = this.LookingGlassInverseViewMatrices[n] || R.create();
  }
  getInputSources() {
    return [];
  }
  getInputPose(n, e, r) {
    return null;
  }
  onWindowResize() {
  }
}
let ge = 0;
class Re {
  constructor(n, e) {
    x(this, "mode");
    x(this, "immersive");
    x(this, "id");
    x(this, "baseLayer");
    x(this, "inlineVerticalFieldOfView");
    x(this, "ended");
    x(this, "enabledFeatures");
    this.mode = n, this.immersive = n === "immersive-vr" || n === "immersive-ar", this.id = ++ge, this.baseLayer = null, this.inlineVerticalFieldOfView = Math.PI * 0.5, this.ended = !1, this.enabledFeatures = e;
  }
}
class Te extends fe {
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
class X extends de {
  constructor(e) {
    super();
    x(this, "vrButton");
    x(this, "device");
    x(this, "isPresenting", !1);
    j(e), this.loadPolyfill();
  }
  static async init(e) {
    await X.detectLookingGlassDevice() && new X(e);
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
    for (const e in Y)
      this.global[e] = Y[e];
    this.global.XRWebGLLayer = Ee, this.injected = !0, this.device = new ye(this.global), this.xr = new le(Promise.resolve(this.device)), Object.defineProperty(this.global.navigator, "xr", {
      value: this.xr,
      configurable: !0
    });
  }
  async overrideDefaultVRButton() {
    this.vrButton = await Le("VRButton"), this.vrButton && this.device && (this.device.addEventListener("@@webxr-polyfill/vr-present-start", () => {
      this.isPresenting = !0, this.updateVRButtonUI();
    }), this.device.addEventListener("@@webxr-polyfill/vr-present-end", () => {
      this.isPresenting = !1, this.updateVRButtonUI();
    }), this.vrButton.addEventListener("click", (e) => {
      this.updateVRButtonUI();
    }), this.updateVRButtonUI());
  }
  async updateVRButtonUI() {
    if (this.vrButton) {
      await xe(100), this.isPresenting ? this.vrButton.innerHTML = "EXIT LOOKING GLASS" : this.vrButton.innerHTML = "ENTER LOOKING GLASS";
      const e = 220;
      this.vrButton.style.width = `${e}px`, this.vrButton.style.left = `calc(50% - ${e / 2}px)`;
    }
  }
  update(e) {
    j(e);
  }
}
async function Le(c) {
  return new Promise((n, e) => {
    const r = new MutationObserver(function(t) {
      t.forEach(function(s) {
        s.addedNodes.forEach(function(o) {
          const f = o;
          f.id == c && (n(f), r.disconnect());
        });
      });
    });
    r.observe(document.body, { subtree: !1, childList: !0 }), setTimeout(() => {
      r.disconnect(), e(`id:${c} not found`);
    }, 5e3);
  });
}
function xe(c) {
  return new Promise((n) => setTimeout(n, c));
}
const De = B();
export {
  De as LookingGlassConfig,
  X as LookingGlassWebXRPolyfill
};
