var ae = Object.defineProperty;
var se = (c, n, e) => n in c ? ae(c, n, { enumerable: !0, configurable: !0, writable: !0, value: e }) : c[n] = e;
var S = (c, n, e) => (se(c, typeof n != "symbol" ? n + "" : n, e), e);
import j from "@lookingglass/webxr-polyfill/src/api/index";
import ce from "@lookingglass/webxr-polyfill/src/api/XRSystem";
import le from "@lookingglass/webxr-polyfill/src/WebXRPolyfill";
import * as de from "holoplay-core";
import { Shader as ue } from "holoplay-core";
import he from "@lookingglass/webxr-polyfill/src/devices/XRDevice";
import fe from "@lookingglass/webxr-polyfill/src/api/XRSpace";
import { mat4 as E } from "gl-matrix";
import me, { PRIVATE as be } from "@lookingglass/webxr-polyfill/src/api/XRWebGLLayer";
const W = 1.6;
let G = 3360;
var H;
(function(c) {
  c[c.Swizzled = 0] = "Swizzled", c[c.Center = 1] = "Center", c[c.Quilt = 2] = "Quilt";
})(H || (H = {}));
class pe extends EventTarget {
  constructor(e) {
    super();
    S(this, "_calibration", {
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
      flipSubp: { value: 0 }
    });
    S(this, "_viewControls", {
      tileHeight: 512,
      numViews: 45,
      trackballX: 0,
      trackballY: 0,
      targetX: 0,
      targetY: W,
      targetZ: -0.5,
      targetDiam: 2,
      fovy: 13 / 180 * Math.PI,
      depthiness: 1.25,
      inlineView: H.Center
    });
    this._viewControls = { ...this._viewControls, ...e }, this.syncCalibration();
  }
  syncCalibration() {
    new de.Client((e) => {
      if (e.devices.length < 1) {
        console.error("No Looking Glass devices found!");
        return;
      }
      e.devices.length > 1 && console.warn("More than one Looking Glass device found... using the first one"), this.calibration = e.devices[0].calibration, this.calibration.screenH.value = 3360, this.calibration.screenW.value = 3360;
    }, (e) => {
      console.error("Error creating Looking Glass client:", e);
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
    return G / 6;
  }
  set tileHeight(e) {
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
  get aspect() {
    return 0.75;
  }
  get tileWidth() {
    return G / 8;
  }
  get framebufferWidth() {
    return this._calibration.screenW.value < 8e3 ? G : 8192;
  }
  get quiltWidth() {
    return 8;
  }
  get quiltHeight() {
    return 6;
  }
  get framebufferHeight() {
    return this._calibration.screenW.value < 8e3 ? G : 8192;
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
let X = null;
function k() {
  return X == null && (X = new pe()), X;
}
function q(c) {
  const n = k();
  c != null && n.updateViewControls(c);
}
function ve(c) {
  const n = new MediaSource();
  n.addEventListener("sourceopen", y, !1);
  let e, r, t, o;
  const d = document.getElementById("video"), f = document.getElementById("recordbutton"), l = document.getElementById("playbutton"), p = document.getElementById("downloadbutton");
  f.onclick = A, l.onclick = x, p.onclick = F;
  function y(i) {
    console.log("MediaSource opened"), t = n.addSourceBuffer('video/webm; codecs="h264"'), console.log("Source buffer: ", t);
  }
  function R(i) {
    i.data && i.data.size > 0 && r.push(i.data);
  }
  function v(i) {
    console.log("Recorder stopped: ", i);
    const s = new Blob(r, { type: "video/webm" });
    d.src = window.URL.createObjectURL(s);
  }
  function A() {
    o = c.captureStream(), console.log("Started stream capture from canvas element: ", o), f.textContent === "Record" ? C() : (u(), f.textContent = "Record", l.disabled = !1, p.disabled = !1);
  }
  function C() {
    let i = { mimeType: "video/webm" };
    r = [];
    try {
      e = new MediaRecorder(o, i);
    } catch (s) {
      console.log("Unable to create MediaRecorder with options Object: ", s);
      try {
        i = { mimeType: "video/webm,codecs=h264" }, e = new MediaRecorder(o, i);
      } catch (a) {
        console.log("Unable to create MediaRecorder with options Object: ", a);
        try {
          i = { mimeType: "video/h264" }, e = new MediaRecorder(o, i);
        } catch (h) {
          alert(`MediaRecorder is not supported by this browser.

Try Firefox 29 or later, or Chrome 47 or later, with Enable experimental Web Platform features enabled from chrome://flags.`), console.error("Exception while creating MediaRecorder:", h);
          return;
        }
      }
    }
    console.log("Created MediaRecorder", e, "with options", i), f.textContent = "Stop Recording", l.disabled = !0, p.disabled = !0, e.onstop = v, e.ondataavailable = R, e.start(100), console.log("MediaRecorder started", e);
  }
  function u() {
    e.stop(), console.log("Recorded Blobs: ", r), d.controls = !0;
  }
  function x() {
    d.play();
  }
  function F() {
    const i = new Blob(r, { type: "video/webm" }), s = window.URL.createObjectURL(i), a = document.createElement("a");
    a.style.display = "none", a.href = s, a.download = "hologram_qs8x6a0.75.webm", document.body.appendChild(a), a.click(), setTimeout(() => {
      document.body.removeChild(a), window.URL.revokeObjectURL(s);
    }, 100);
  }
}
function Ee(c, n) {
  var F;
  const e = k(), r = document.createElement("style");
  document.head.appendChild(r), (F = r.sheet) == null || F.insertRule("#LookingGlassWebXRControls * { all: revert; font-family: sans-serif }");
  const t = document.createElement("div");
  t.id = "LookingGlassWebXRControls", t.style.position = "fixed", t.style.zIndex = "1000", t.style.padding = "15px", t.style.width = "320px", t.style.maxWidth = "calc(100vw - 18px)", t.style.maxHeight = "calc(100vh - 18px)", t.style.whiteSpace = "nowrap", t.style.background = "rgba(0, 0, 0, 0.6)", t.style.color = "white", t.style.borderRadius = "10px", t.style.right = "15px", t.style.bottom = "15px", t.style.flex = "row";
  const o = document.createElement("div");
  t.appendChild(o), o.style.width = "100%", o.style.textAlign = "center", o.style.fontWeight = "bold", o.innerText = "Looking Glass Controls";
  const d = document.createElement("button");
  d.innerText = "Record", t.appendChild(d), d.id = "recordbutton";
  const f = document.createElement("button");
  f.innerText = "Play", t.appendChild(f), f.id = "playbutton";
  const l = document.createElement("button");
  l.innerText = "Download Video", t.appendChild(l), l.id = "downloadbutton";
  const p = document.createElement("video");
  t.appendChild(p), p.id = "video", p.width = 240, p.height = 320, p.style.backgroundColor = "black", p.style.display = "none";
  const y = document.createElement("button");
  t.appendChild(y), y.innerText = "Take Screenshot", y.onclick = () => {
    const s = document.getElementById("renderCanvas").toDataURL("image/png");
    let a = document.createElement("a");
    a.download = "screenshot.png", a.href = s, t.appendChild(a), a.click(), t.removeChild(a);
  };
  const R = document.createElement("div");
  t.appendChild(R), R.style.width = "100%", R.style.whiteSpace = "normal", R.style.color = "rgba(255,255,255,0.7)", R.style.fontSize = "14px", R.style.margin = "5px 0", R.innerHTML = "Click the popup and use WASD, mouse left/right drag, and scroll.";
  const v = document.createElement("input");
  o.appendChild(v), v.type = "button", v.value = "\u2190", v.dataset.otherValue = "\u2192", v.onclick = () => {
    [t.style.right, t.style.left] = [t.style.left, t.style.right], [v.value, v.dataset.otherValue] = [v.dataset.otherValue || "", v.value];
  };
  const A = document.createElement("div");
  t.appendChild(A);
  const C = (i, s, a) => {
    const h = a.stringify, m = document.createElement("div");
    m.style.marginBottom = "8px", A.appendChild(m);
    const T = i, P = e[i], L = document.createElement("label");
    m.appendChild(L), L.innerText = a.label, L.setAttribute("for", T), L.style.width = "100px", L.style.display = "inline-block", L.style.textDecoration = "dotted underline 1px", L.style.fontFamily = '"Courier New"', L.style.fontSize = "13px", L.style.fontWeight = "bold", L.title = a.title;
    const b = document.createElement("input");
    m.appendChild(b), Object.assign(b, s), b.id = T, b.title = a.title, b.value = s.value !== void 0 ? s.value : P;
    const V = (w) => {
      e[i] = w, U(w);
    };
    b.oninput = () => {
      const w = s.type === "range" ? parseFloat(b.value) : s.type === "checkbox" ? b.checked : b.value;
      V(w);
    };
    const N = (w) => {
      let _ = w(e[i]);
      a.fixRange && (_ = a.fixRange(_), b.max = Math.max(parseFloat(b.max), _).toString(), b.min = Math.min(parseFloat(b.min), _).toString()), b.value = _, V(_);
    };
    s.type === "range" && (b.style.width = "110px", b.style.height = "8px", b.onwheel = (w) => {
      N((_) => _ + Math.sign(w.deltaX - w.deltaY) * s.step);
    });
    let U = (w) => {
    };
    if (h) {
      const w = document.createElement("span");
      w.style.fontFamily = '"Courier New"', w.style.fontSize = "13px", w.style.marginLeft = "3px", m.appendChild(w), U = (_) => {
        w.innerHTML = h(_);
      }, U(P);
    }
    return N;
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
      const s = i / Math.PI * 180, a = Math.atan(Math.tan(i / 2) * e.aspect) * 2 / Math.PI * 180;
      return `${s.toFixed()}&deg;&times;${a.toFixed()}&deg;`;
    }
  }), C("depthiness", { type: "range", min: 0, max: 2, step: 0.01 }, {
    label: "depthiness",
    title: 'exaggerates depth by multiplying the width of the view cone (as reported by the firmware) - can somewhat compensate for depthiness lost using higher fov. 1.25 seems to be most physically accurate on Looking Glass 8.9".',
    fixRange: (i) => Math.max(0, i),
    stringify: (i) => `${i.toFixed(2)}x`
  }), c.oncontextmenu = (i) => {
    i.preventDefault();
  }, c.addEventListener("wheel", (i) => {
    const s = e.targetDiam, a = 1.1, h = Math.log(s) / Math.log(a);
    return e.targetDiam = Math.pow(a, h + i.deltaY * 0.01);
  }), c.addEventListener("mousemove", (i) => {
    const s = i.movementX, a = -i.movementY;
    if (i.buttons & 2 || i.buttons & 1 && (i.shiftKey || i.ctrlKey)) {
      const h = e.trackballX, m = e.trackballY, T = -Math.cos(h) * s + Math.sin(h) * Math.sin(m) * a, P = -Math.cos(m) * a, L = Math.sin(h) * s + Math.cos(h) * Math.sin(m) * a;
      e.targetX = e.targetX + T * e.targetDiam * 1e-3, e.targetY = e.targetY + P * e.targetDiam * 1e-3, e.targetZ = e.targetZ + L * e.targetDiam * 1e-3;
    } else
      i.buttons & 1 && (e.trackballX = e.trackballX - s * 0.01, e.trackballY = e.trackballY - a * 0.01);
  });
  const u = { w: 0, a: 0, s: 0, d: 0 };
  c.addEventListener("keydown", (i) => {
    switch (i.code) {
      case "KeyW":
        u.w = 1;
        break;
      case "KeyA":
        u.a = 1;
        break;
      case "KeyS":
        u.s = 1;
        break;
      case "KeyD":
        u.d = 1;
        break;
    }
  }), c.addEventListener("keyup", (i) => {
    switch (i.code) {
      case "KeyW":
        u.w = 0;
        break;
      case "KeyA":
        u.a = 0;
        break;
      case "KeyS":
        u.s = 0;
        break;
      case "KeyD":
        u.d = 0;
        break;
    }
  }), requestAnimationFrame(x);
  function x() {
    let i = u.d - u.a, s = u.w - u.s;
    i && s && (i *= Math.sqrt(0.5), s *= Math.sqrt(0.5));
    const a = e.trackballX, h = e.trackballY, m = Math.cos(a) * i - Math.sin(a) * Math.cos(h) * s, T = -Math.sin(h) * s, P = -Math.sin(a) * i - Math.cos(a) * Math.cos(h) * s;
    e.targetX = e.targetX + m * e.targetDiam * 0.03, e.targetY = e.targetY + T * e.targetDiam * 0.03, e.targetZ = e.targetZ + P * e.targetDiam * 0.03, requestAnimationFrame(x);
  }
  return setTimeout(() => {
    ve(n);
  }, 1e3), t;
}
const I = Symbol("LookingGlassXRWebGLLayer");
class we extends me {
  constructor(n, e, r) {
    super(n, e, r);
    const t = e.canvas, o = document.createElement("canvas");
    o.tabIndex = 0;
    const d = o.getContext("2d", { alpha: !1 });
    o.addEventListener("dblclick", function() {
      o.width = 1536, o.height = 2048, this.requestFullscreen();
    });
    const f = Ee(o, t), l = k(), p = this[be].config, y = e.createTexture();
    let R, v;
    const A = e.createFramebuffer(), C = e.enable.bind(e), u = e.disable.bind(e), x = e.getExtension("OES_vertex_array_object"), F = 34229, i = x ? x.bindVertexArrayOES.bind(x) : e.bindVertexArray.bind(e);
    (p.depth || p.stencil) && (p.depth && p.stencil ? v = {
      format: e.DEPTH_STENCIL,
      attachment: e.DEPTH_STENCIL_ATTACHMENT
    } : p.depth ? v = {
      format: e.DEPTH_COMPONENT16,
      attachment: e.DEPTH_ATTACHMENT
    } : p.stencil && (v = {
      format: e.STENCIL_INDEX8,
      attachment: e.STENCIL_ATTACHMENT
    }), R = e.createRenderbuffer());
    const s = () => {
      const g = e.getParameter(e.TEXTURE_BINDING_2D);
      if (e.bindTexture(e.TEXTURE_2D, y), e.texImage2D(e.TEXTURE_2D, 0, e.RGBA, l.framebufferWidth, l.framebufferHeight, 0, e.RGBA, e.UNSIGNED_BYTE, null), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.LINEAR), e.bindTexture(e.TEXTURE_2D, g), R) {
        const B = e.getParameter(e.RENDERBUFFER_BINDING);
        e.bindRenderbuffer(e.RENDERBUFFER, R), e.renderbufferStorage(e.RENDERBUFFER, v.format, l.framebufferWidth, l.framebufferHeight), e.bindRenderbuffer(e.RENDERBUFFER, B);
      }
    };
    s(), l.addEventListener("on-config-changed", s);
    const a = e.getParameter(e.FRAMEBUFFER_BINDING);
    e.bindFramebuffer(e.FRAMEBUFFER, A), e.framebufferTexture2D(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, y, 0), (p.depth || p.stencil) && e.framebufferRenderbuffer(e.FRAMEBUFFER, v.attachment, e.RENDERBUFFER, R), e.bindFramebuffer(e.FRAMEBUFFER, a);
    const h = e.createProgram(), m = e.createShader(e.VERTEX_SHADER);
    e.attachShader(h, m);
    const T = e.createShader(e.FRAGMENT_SHADER);
    e.attachShader(h, T);
    {
      const g = `
       attribute vec2 a_position;
       varying vec2 v_texcoord;
       void main() {
         gl_Position = vec4(a_position * 2.0 - 1.0, 0.0, 1.0);
         v_texcoord = a_position;
       }
     `;
      e.shaderSource(m, g), e.compileShader(m), e.getShaderParameter(m, e.COMPILE_STATUS) || console.warn(e.getShaderInfoLog(m));
    }
    let P, L, b;
    const V = () => {
      const g = ue(l);
      if (g === P)
        return;
      if (P = g, e.shaderSource(T, g), e.compileShader(T), !e.getShaderParameter(T, e.COMPILE_STATUS)) {
        console.warn(e.getShaderInfoLog(T));
        return;
      }
      if (e.linkProgram(h), !e.getProgramParameter(h, e.LINK_STATUS)) {
        console.warn(e.getProgramInfoLog(h));
        return;
      }
      L = e.getAttribLocation(h, "a_position"), b = e.getUniformLocation(h, "u_viewType");
      const B = e.getUniformLocation(h, "u_texture"), D = e.getParameter(e.CURRENT_PROGRAM);
      e.useProgram(h), e.uniform1i(B, 0), e.useProgram(D);
    };
    l.addEventListener("on-config-changed", V);
    const N = x ? x.createVertexArrayOES() : e.createVertexArray(), U = e.createBuffer(), w = e.getParameter(e.ARRAY_BUFFER_BINDING), _ = e.getParameter(F);
    i(N), e.bindBuffer(e.ARRAY_BUFFER, U), e.bufferData(e.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), e.STATIC_DRAW), e.enableVertexAttribArray(L), e.vertexAttribPointer(L, 2, e.FLOAT, !1, 0, 0), i(_), e.bindBuffer(e.ARRAY_BUFFER, w);
    const z = () => {
      console.assert(this[I].LookingGlassEnabled), e.bindFramebuffer(e.FRAMEBUFFER, this.framebuffer);
      const g = e.getParameter(e.COLOR_CLEAR_VALUE), B = e.getParameter(e.DEPTH_CLEAR_VALUE), D = e.getParameter(e.STENCIL_CLEAR_VALUE);
      e.clearColor(0, 0, 0, 0), e.clearDepth(1), e.clearStencil(0), e.clear(e.DEPTH_BUFFER_BIT | e.COLOR_BUFFER_BIT | e.STENCIL_BUFFER_BIT), e.clearColor(g[0], g[1], g[2], g[3]), e.clearDepth(B), e.clearStencil(D);
    };
    let O, Y;
    const K = () => {
      if (!this[I].LookingGlassEnabled)
        return;
      (t.width !== l.calibration.screenW.value || t.height !== l.calibration.screenH.value) && (console.log("warning, the canvas is not the correct size!"), console.log("app", t.width, "width", t.height, "height"), console.log("looking glass", o.width, "width", o.height, "height"), O = t.width, Y = t.height, t.width = l.calibration.screenW.value, t.height = l.calibration.screenH.value, console.log("new width and height", t.width, "width", t.height, "height"));
      const g = e.getParameter(F), B = e.getParameter(e.CULL_FACE), D = e.getParameter(e.BLEND), $ = e.getParameter(e.DEPTH_TEST), Q = e.getParameter(e.STENCIL_TEST), J = e.getParameter(e.SCISSOR_TEST), ee = e.getParameter(e.VIEWPORT), te = e.getParameter(e.FRAMEBUFFER_BINDING), ne = e.getParameter(e.RENDERBUFFER_BINDING), ie = e.getParameter(e.CURRENT_PROGRAM), re = e.getParameter(e.ACTIVE_TEXTURE);
      {
        const oe = e.getParameter(e.TEXTURE_BINDING_2D);
        e.bindFramebuffer(e.FRAMEBUFFER, null), e.useProgram(h), i(N), e.activeTexture(e.TEXTURE0), e.bindTexture(e.TEXTURE_2D, y), e.disable(e.BLEND), e.disable(e.CULL_FACE), e.disable(e.DEPTH_TEST), e.disable(e.STENCIL_TEST), e.viewport(0, 0, e.drawingBufferWidth, e.drawingBufferHeight), e.uniform1i(b, 0), e.drawArrays(e.TRIANGLES, 0, 6), d == null || d.clearRect(0, 0, o.width, o.height), d == null || d.drawImage(t, 0, 0), l.inlineView !== 0 && (e.uniform1i(b, l.inlineView), e.drawArrays(e.TRIANGLES, 0, 6)), e.bindTexture(e.TEXTURE_2D, oe);
      }
      e.activeTexture(re), e.useProgram(ie), e.bindRenderbuffer(e.RENDERBUFFER, ne), e.bindFramebuffer(e.FRAMEBUFFER, te), e.viewport(...ee), (J ? C : u)(e.SCISSOR_TEST), (Q ? C : u)(e.STENCIL_TEST), ($ ? C : u)(e.DEPTH_TEST), (D ? C : u)(e.BLEND), (B ? C : u)(e.CULL_FACE), i(g);
    };
    let M;
    window.addEventListener("unload", () => {
      M && M.close(), M = void 0;
    });
    const Z = (g, B) => {
      var D;
      !!M != g && (g ? (V(), o.style.position = "fixed", o.style.bottom = "0", o.style.left = "0", o.style.width = "1536", o.style.height = "2048", o.width = l.calibration.screenW.value, o.height = l.calibration.screenH.value, document.body.appendChild(f), M = window.open("", void 0, "width=640,height=360"), M.document.title = "Looking Glass Window (fullscreen me on Looking Glass!)", M.document.body.style.background = "black", M.document.body.appendChild(o), console.assert(B), M.onbeforeunload = B) : ((D = f.parentElement) == null || D.removeChild(f), t.width = O, t.height = Y, M.onbeforeunload = void 0, M.close(), M = void 0));
    };
    this[I] = {
      LookingGlassEnabled: !1,
      framebuffer: A,
      clearFramebuffer: z,
      blitTextureToDefaultFramebufferIfNeeded: K,
      moveCanvasToWindow: Z
    };
  }
  get framebuffer() {
    return this[I].LookingGlassEnabled ? this[I].framebuffer : null;
  }
  get framebufferWidth() {
    return k().framebufferWidth;
  }
  get framebufferHeight() {
    return k().framebufferHeight;
  }
}
class ye extends he {
  constructor(n) {
    super(n), this.sessions = /* @__PURE__ */ new Map(), this.viewSpaces = [], this.basePoseMatrix = E.create(), this.inlineProjectionMatrix = E.create(), this.inlineInverseViewMatrix = E.create(), this.LookingGlassProjectionMatrices = [], this.LookingGlassInverseViewMatrices = [];
  }
  onBaseLayerSet(n, e) {
    const r = this.sessions.get(n);
    r.baseLayer = e;
    const t = e[I];
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
    const r = this.sessions.get(n), t = k();
    if (r.immersive) {
      const o = Math.tan(0.5 * t.fovy), d = 0.5 * t.targetDiam / o, f = d - t.targetDiam, l = this.basePoseMatrix;
      E.fromTranslation(l, [t.targetX, t.targetY, t.targetZ]), E.rotate(l, l, t.trackballX, [0, 1, 0]), E.rotate(l, l, -t.trackballY, [1, 0, 0]), E.translate(l, l, [0, 0, d]);
      for (let y = 0; y < t.numViews; ++y) {
        const R = (y + 0.5) / t.numViews - 0.5, v = Math.tan(t.viewCone * R), A = d * v, C = this.LookingGlassInverseViewMatrices[y] = this.LookingGlassInverseViewMatrices[y] || E.create();
        E.translate(C, l, [A, 0, 0]), E.invert(C, C);
        const u = Math.max(f + e.depthNear, 0.01), x = f + e.depthFar, F = u * o, i = F, s = -F, a = u * -v, h = t.aspect * F, m = a + h, T = a - h, P = this.LookingGlassProjectionMatrices[y] = this.LookingGlassProjectionMatrices[y] || E.create();
        E.set(P, 2 * u / (m - T), 0, 0, 0, 0, 2 * u / (i - s), 0, 0, (m + T) / (m - T), (i + s) / (i - s), -(x + u) / (x - u), -1, 0, 0, -2 * x * u / (x - u), 0);
      }
      r.baseLayer[I].clearFramebuffer();
    } else {
      const o = r.baseLayer.context, d = o.drawingBufferWidth / o.drawingBufferHeight;
      E.perspective(this.inlineProjectionMatrix, e.inlineVerticalFieldOfView, d, e.depthNear, e.depthFar), E.fromTranslation(this.basePoseMatrix, [0, W, 0]), E.invert(this.inlineInverseViewMatrix, this.basePoseMatrix);
    }
  }
  onFrameEnd(n) {
    this.sessions.get(n).baseLayer[I].blitTextureToDefaultFramebufferIfNeeded();
  }
  async requestFrameOfReferenceTransform(n, e) {
    const r = E.create();
    switch (n) {
      case "viewer":
      case "local":
        return E.fromTranslation(r, [0, -W, 0]), r;
      case "local-floor":
        return r;
      default:
        throw new Error("XRReferenceSpaceType not understood");
    }
  }
  endSession(n) {
    const e = this.sessions.get(n);
    e.immersive && e.baseLayer && (e.baseLayer[I].moveCanvasToWindow(!1), this.dispatchEvent("@@webxr-polyfill/vr-present-end", n)), e.ended = !0;
  }
  doesSessionSupportReferenceSpace(n, e) {
    const r = this.sessions.get(n);
    return r.ended ? !1 : r.enabledFeatures.has(e);
  }
  getViewSpaces(n) {
    if (n === "immersive-vr") {
      const e = k();
      for (let r = this.viewSpaces.length; r < e.numViews; ++r)
        this.viewSpaces[r] = new Te(r);
      return this.viewSpaces.length = e.numViews, this.viewSpaces;
    }
  }
  getViewport(n, e, r, t, o) {
    if (o === void 0) {
      const f = this.sessions.get(n).baseLayer.context;
      t.x = 0, t.y = 0, t.width = f.drawingBufferWidth, t.height = f.drawingBufferHeight;
    } else {
      const d = k(), f = o % d.quiltWidth, l = Math.floor(o / d.quiltWidth);
      t.x = d.tileWidth * f, t.y = d.tileHeight * l, t.width = d.tileWidth, t.height = d.tileHeight;
    }
    return !0;
  }
  getProjectionMatrix(n, e) {
    return e === void 0 ? this.inlineProjectionMatrix : this.LookingGlassProjectionMatrices[e] || E.create();
  }
  getBasePoseMatrix() {
    return this.basePoseMatrix;
  }
  getBaseViewMatrix() {
    return this.inlineInverseViewMatrix;
  }
  _getViewMatrixByIndex(n) {
    return this.LookingGlassInverseViewMatrices[n] = this.LookingGlassInverseViewMatrices[n] || E.create();
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
    S(this, "mode");
    S(this, "immersive");
    S(this, "id");
    S(this, "baseLayer");
    S(this, "inlineVerticalFieldOfView");
    S(this, "ended");
    S(this, "enabledFeatures");
    this.mode = n, this.immersive = n === "immersive-vr" || n === "immersive-ar", this.id = ++ge, this.baseLayer = null, this.inlineVerticalFieldOfView = Math.PI * 0.5, this.ended = !1, this.enabledFeatures = e;
  }
}
class Te extends fe {
  constructor(e) {
    super();
    S(this, "viewIndex");
    this.viewIndex = e;
  }
  get eye() {
    return "none";
  }
  _onPoseUpdate(e) {
    this._inverseBaseMatrix = e._getViewMatrixByIndex(this.viewIndex);
  }
}
class ke extends le {
  constructor(e) {
    super();
    S(this, "vrButton");
    S(this, "device");
    S(this, "isPresenting", !1);
    q(e), this.overrideDefaultVRButton(), console.warn('Looking Glass WebXR "polyfill" overriding native WebXR API.');
    for (const r in j)
      this.global[r] = j[r];
    this.global.XRWebGLLayer = we, this.injected = !0, this.device = new ye(this.global), this.xr = new ce(Promise.resolve(this.device)), Object.defineProperty(this.global.navigator, "xr", {
      value: this.xr,
      configurable: !0
    });
  }
  async overrideDefaultVRButton() {
    this.vrButton = await Le("VRButton"), this.vrButton && (this.device.addEventListener("@@webxr-polyfill/vr-present-start", () => {
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
    q(e);
  }
}
async function Le(c) {
  return new Promise((n, e) => {
    const r = new MutationObserver(function(t) {
      t.forEach(function(o) {
        o.addedNodes.forEach(function(d) {
          const f = d;
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
const De = k();
export {
  De as LookingGlassConfig,
  ke as LookingGlassWebXRPolyfill
};
