var te = Object.defineProperty;
var ie = (i, n, e) => n in i ? te(i, n, { enumerable: !0, configurable: !0, writable: !0, value: e }) : i[n] = e;
var E = (i, n, e) => (ie(i, typeof n != "symbol" ? n + "" : n, e), e);
import G from "@lookingglass/webxr-polyfill/src/api/index";
import ne from "@lookingglass/webxr-polyfill/src/api/XRSystem";
import ae from "@lookingglass/webxr-polyfill/src/WebXRPolyfill";
import * as se from "holoplay-core";
import { Shader as re } from "holoplay-core";
import oe from "@lookingglass/webxr-polyfill/src/devices/XRDevice";
import le from "@lookingglass/webxr-polyfill/src/api/XRSpace";
import { mat4 as b } from "gl-matrix";
import ce, { PRIVATE as ue } from "@lookingglass/webxr-polyfill/src/api/XRWebGLLayer";
const D = 1.6;
var B;
(function(i) {
  i[i.Swizzled = 0] = "Swizzled", i[i.Center = 1] = "Center", i[i.Quilt = 2] = "Quilt";
})(B || (B = {}));
class de extends EventTarget {
  constructor(e) {
    super();
    E(this, "_calibration", {
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
    E(this, "_viewControls", {
      tileHeight: 512,
      numViews: 45,
      trackballX: 0,
      trackballY: 0,
      targetX: 0,
      targetY: D,
      targetZ: -0.5,
      targetDiam: 2,
      fovy: 13 / 180 * Math.PI,
      depthiness: 1.25,
      inlineView: B.Center,
      capturing: !1,
      quiltResolution: 3840,
      popup: null,
      XRSession: null,
      lkgCanvas: null,
      appCanvas: null
    });
    E(this, "LookingGlassDetected");
    this._viewControls = { ...this._viewControls, ...e }, this.syncCalibration();
  }
  syncCalibration() {
    new se.Client((e) => {
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
    return Math.round(this._viewControls.quiltResolution / this.quiltHeight);
  }
  set tileHeight(e) {
    Math.round(this._viewControls.quiltResolution / this.quiltHeight);
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
    return Math.round(this._viewControls.quiltResolution / this.quiltWidth);
  }
  get framebufferWidth() {
    return this._calibration.screenW.value < 7e3 ? this._viewControls.quiltResolution : 8192;
  }
  get quiltWidth() {
    return this.calibration.screenW.value == 1536 ? 8 : this.calibration.screenW.value == 3840 || this.calibration.screenW.value == 8192 ? 5 : 8;
  }
  get quiltHeight() {
    return this.calibration.screenW.value == 1536 ? 6 : this.calibration.screenW.value == 3840 || this.calibration.screenW.value == 8192 ? 9 : 6;
  }
  get framebufferHeight() {
    return this._calibration.screenW.value < 7e3 ? this._viewControls.quiltResolution : 8192;
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
let I = null;
function x() {
  return I == null && (I = new de()), I;
}
function N(i) {
  const n = x();
  i != null && n.updateViewControls(i);
}
function he() {
  const i = x();
  if (i.appCanvas == null) {
    console.warn("Media Capture initialized while canvas is null!");
    return;
  } else {
    let n = function() {
      if (i.appCanvas != null) {
        let s = i.appCanvas.toDataURL();
        const t = document.createElement("a");
        t.style.display = "none", t.href = s, t.download = `hologram_qs${i.quiltWidth}x${i.quiltHeight}a${i.aspect}.png`, document.body.appendChild(t), t.click(), document.body.removeChild(t), window.URL.revokeObjectURL(s);
      }
    };
    const e = document.getElementById("screenshotbutton");
    e == null || e.addEventListener("click", n);
  }
}
function fe() {
  var n;
  const i = x();
  if (i.lkgCanvas == null)
    console.warn("window placement called without a valid XR Session!");
  else {
    let e = function() {
      let a = p.d - p.a, l = p.w - p.s;
      a && l && (a *= Math.sqrt(0.5), l *= Math.sqrt(0.5));
      const c = i.trackballX, v = i.trackballY, h = Math.cos(c) * a - Math.sin(c) * Math.cos(v) * l, C = -Math.sin(v) * l, R = -Math.sin(c) * a - Math.cos(c) * Math.cos(v) * l;
      i.targetX = i.targetX + h * i.targetDiam * 0.03, i.targetY = i.targetY + C * i.targetDiam * 0.03, i.targetZ = i.targetZ + R * i.targetDiam * 0.03, requestAnimationFrame(e);
    };
    const s = document.createElement("style");
    document.head.appendChild(s), (n = s.sheet) == null || n.insertRule("#LookingGlassWebXRControls * { all: revert; font-family: sans-serif }");
    const t = document.createElement("div");
    t.id = "LookingGlassWebXRControls", t.style.position = "fixed", t.style.zIndex = "1000", t.style.padding = "15px", t.style.width = "320px", t.style.maxWidth = "calc(100vw - 18px)", t.style.maxHeight = "calc(100vh - 18px)", t.style.whiteSpace = "nowrap", t.style.background = "rgba(0, 0, 0, 0.6)", t.style.color = "white", t.style.borderRadius = "10px", t.style.right = "15px", t.style.bottom = "15px", t.style.flex = "row";
    const o = document.createElement("div");
    t.appendChild(o), o.style.width = "100%", o.style.textAlign = "center", o.style.fontWeight = "bold", o.style.marginBottom = "8px", o.innerText = "Looking Glass Controls";
    const r = document.createElement("button");
    r.style.display = "block", r.style.margin = "auto", r.style.width = "100%", r.style.height = "35px", r.style.padding = "4px", r.style.marginBottom = "8px", r.style.borderRadius = "8px", r.id = "screenshotbutton", t.appendChild(r), r.innerText = "Save Hologram";
    const m = document.createElement("div");
    t.appendChild(m), m.style.width = "290px", m.style.whiteSpace = "normal", m.style.color = "rgba(255,255,255,0.7)", m.style.fontSize = "14px", m.style.margin = "5px 0", m.innerHTML = "Click the popup and use WASD, mouse left/right drag, and scroll.";
    const w = document.createElement("div");
    t.appendChild(w);
    const _ = (a, l, c) => {
      const v = c.stringify, h = document.createElement("div");
      h.style.marginBottom = "8px", w.appendChild(h);
      const C = a, R = i[a], u = document.createElement("label");
      h.appendChild(u), u.innerText = c.label, u.setAttribute("for", C), u.style.width = "100px", u.style.display = "inline-block", u.style.textDecoration = "dotted underline 1px", u.style.fontFamily = '"Courier New"', u.style.fontSize = "13px", u.style.fontWeight = "bold", u.title = c.title;
      const d = document.createElement("input");
      h.appendChild(d), Object.assign(d, l), d.id = C, d.title = c.title, d.value = l.value !== void 0 ? l.value : R;
      const T = (f) => {
        i[a] = f, L(f);
      };
      d.oninput = () => {
        const f = l.type === "range" ? parseFloat(d.value) : l.type === "checkbox" ? d.checked : d.value;
        T(f);
      };
      const k = (f) => {
        let g = f(i[a]);
        c.fixRange && (g = c.fixRange(g), d.max = Math.max(parseFloat(d.max), g).toString(), d.min = Math.min(parseFloat(d.min), g).toString()), d.value = g, T(g);
      };
      l.type === "range" && (d.style.width = "110px", d.style.height = "8px", d.onwheel = (f) => {
        k((g) => g + Math.sign(f.deltaX - f.deltaY) * l.step);
      });
      let L = (f) => {
      };
      if (v) {
        const f = document.createElement("span");
        f.style.fontFamily = '"Courier New"', f.style.fontSize = "13px", f.style.marginLeft = "3px", h.appendChild(f), L = (g) => {
          f.innerHTML = v(g);
        }, L(R);
      }
      return k;
    };
    _("fovy", {
      type: "range",
      min: 1 / 180 * Math.PI,
      max: 120.1 / 180 * Math.PI,
      step: 1 / 180 * Math.PI
    }, {
      label: "fov",
      title: "perspective fov (degrades stereo effect)",
      fixRange: (a) => Math.max(1 / 180 * Math.PI, Math.min(a, 120.1 / 180 * Math.PI)),
      stringify: (a) => {
        const l = a / Math.PI * 180, c = Math.atan(Math.tan(a / 2) * i.aspect) * 2 / Math.PI * 180;
        return `${l.toFixed()}&deg;&times;${c.toFixed()}&deg;`;
      }
    }), _("depthiness", { type: "range", min: 0, max: 2, step: 0.01 }, {
      label: "depthiness",
      title: 'exaggerates depth by multiplying the width of the view cone (as reported by the firmware) - can somewhat compensate for depthiness lost using higher fov. 1.25 seems to be most physically accurate on Looking Glass 8.9".',
      fixRange: (a) => Math.max(0, a),
      stringify: (a) => `${a.toFixed(2)}x`
    }), _("inlineView", { type: "range", min: 0, max: 2, step: 1 }, {
      label: "inline view",
      title: "what to show inline on the original canvas (swizzled = no overwrite)",
      fixRange: (a) => Math.max(0, Math.min(a, 2)),
      stringify: (a) => a === 0 ? "swizzled" : a === 1 ? "center" : a === 2 ? "quilt" : "?"
    }), i.lkgCanvas.oncontextmenu = (a) => {
      a.preventDefault();
    }, i.lkgCanvas.addEventListener("wheel", (a) => {
      const l = i.targetDiam, c = 1.1, v = Math.log(l) / Math.log(c);
      return i.targetDiam = Math.pow(c, v + a.deltaY * 0.01);
    }), i.lkgCanvas.addEventListener("mousemove", (a) => {
      const l = a.movementX, c = -a.movementY;
      if (a.buttons & 2 || a.buttons & 1 && (a.shiftKey || a.ctrlKey)) {
        const v = i.trackballX, h = i.trackballY, C = -Math.cos(v) * l + Math.sin(v) * Math.sin(h) * c, R = -Math.cos(h) * c, u = Math.sin(v) * l + Math.cos(v) * Math.sin(h) * c;
        i.targetX = i.targetX + C * i.targetDiam * 1e-3, i.targetY = i.targetY + R * i.targetDiam * 1e-3, i.targetZ = i.targetZ + u * i.targetDiam * 1e-3;
      } else
        a.buttons & 1 && (i.trackballX = i.trackballX - l * 0.01, i.trackballY = i.trackballY - c * 0.01);
    });
    const p = { w: 0, a: 0, s: 0, d: 0 };
    return i.lkgCanvas.addEventListener("keydown", (a) => {
      switch (a.code) {
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
    }), i.lkgCanvas.addEventListener("keyup", (a) => {
      switch (a.code) {
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
    }), requestAnimationFrame(e), setTimeout(() => {
      he();
    }, 1e3), t;
  }
}
let A;
const pe = (i, n) => {
  const e = x();
  if (e.lkgCanvas == null) {
    console.warn("window placement called without a valid XR Session!");
    return;
  } else if (i == !1)
    ve(e, A);
  else {
    A == null && (A = fe()), e.lkgCanvas.style.position = "fixed", e.lkgCanvas.style.bottom = "0", e.lkgCanvas.style.left = "0", e.lkgCanvas.width = e.calibration.screenW.value, e.lkgCanvas.height = e.calibration.screenH.value, document.body.appendChild(A);
    const s = "getScreenDetails" in window;
    console.log(s, "Screen placement API exists"), s ? me(e.lkgCanvas, e, n) : X(e, e.lkgCanvas, n);
  }
};
async function me(i, n, e) {
  const s = await window.getScreenDetails();
  console.log(s);
  const t = s.screens.filter((o) => o.label.includes("LKG"))[0];
  if (console.log(t, "monitors"), t === void 0) {
    console.log("no Looking Glass monitor detected - manually opening popup window"), X(n, i, e);
    return;
  } else {
    console.log("monitor ID", t.label, "serial number", n.calibration);
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
    n.popup = window.open("", "new", o), n.popup && (n.popup.document.body.style.background = "black", n.popup.document.body.appendChild(i), console.assert(e), n.popup.onbeforeunload = e);
  }
}
function X(i, n, e) {
  i.popup = window.open("", void 0, "width=640,height=360"), i.popup && (i.popup.document.title = "Looking Glass Window (fullscreen me on Looking Glass!)", i.popup.document.body.style.background = "black", i.popup.document.body.appendChild(n), console.assert(e), i.popup.onbeforeunload = e);
}
function ve(i, n) {
  var e;
  (e = n.parentElement) == null || e.removeChild(n), i.popup && (i.popup.onbeforeunload = null, i.popup.close(), i.popup = null);
}
const S = Symbol("LookingGlassXRWebGLLayer");
class be extends ce {
  constructor(n, e, s) {
    super(n, e, s);
    const t = x();
    t.appCanvas = e.canvas, t.lkgCanvas = document.createElement("canvas"), t.lkgCanvas.tabIndex = 0;
    const o = t.lkgCanvas.getContext("2d", { alpha: !1 });
    t.lkgCanvas.addEventListener("dblclick", function() {
      this.requestFullscreen();
    });
    const r = this[ue].config, m = e.createTexture();
    let w, _;
    const p = e.createFramebuffer(), a = e.enable.bind(e), l = e.disable.bind(e), c = e.getExtension("OES_vertex_array_object"), v = 34229, h = c ? c.bindVertexArrayOES.bind(c) : e.bindVertexArray.bind(e);
    (r.depth || r.stencil) && (r.depth && r.stencil ? _ = {
      format: e.DEPTH_STENCIL,
      attachment: e.DEPTH_STENCIL_ATTACHMENT
    } : r.depth ? _ = {
      format: e.DEPTH_COMPONENT16,
      attachment: e.DEPTH_ATTACHMENT
    } : r.stencil && (_ = {
      format: e.STENCIL_INDEX8,
      attachment: e.STENCIL_ATTACHMENT
    }), w = e.createRenderbuffer());
    const C = () => {
      const y = e.getParameter(e.TEXTURE_BINDING_2D);
      if (e.bindTexture(e.TEXTURE_2D, m), e.texImage2D(e.TEXTURE_2D, 0, e.RGBA, t.framebufferWidth, t.framebufferHeight, 0, e.RGBA, e.UNSIGNED_BYTE, null), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.LINEAR), e.bindTexture(e.TEXTURE_2D, y), w) {
        const P = e.getParameter(e.RENDERBUFFER_BINDING);
        e.bindRenderbuffer(e.RENDERBUFFER, w), e.renderbufferStorage(e.RENDERBUFFER, _.format, t.framebufferWidth, t.framebufferHeight), e.bindRenderbuffer(e.RENDERBUFFER, P);
      }
    };
    C(), t.addEventListener("on-config-changed", C);
    const R = e.getParameter(e.FRAMEBUFFER_BINDING);
    e.bindFramebuffer(e.FRAMEBUFFER, p), e.framebufferTexture2D(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, m, 0), (r.depth || r.stencil) && e.framebufferRenderbuffer(e.FRAMEBUFFER, _.attachment, e.RENDERBUFFER, w), e.bindFramebuffer(e.FRAMEBUFFER, R);
    const u = e.createProgram(), d = e.createShader(e.VERTEX_SHADER), T = e.createShader(e.FRAGMENT_SHADER);
    if (u === null || d === null || T === null) {
      console.error("there was a problem with shader construction");
      return;
    }
    e.attachShader(u, d), e.attachShader(u, T);
    {
      const y = `
       attribute vec2 a_position;
       varying vec2 v_texcoord;
       void main() {
         gl_Position = vec4(a_position * 2.0 - 1.0, 0.0, 1.0);
         v_texcoord = a_position;
       }
     `;
      e.shaderSource(d, y), e.compileShader(d), e.getShaderParameter(d, e.COMPILE_STATUS) || console.warn(e.getShaderInfoLog(d));
    }
    let k, L, f;
    const g = () => {
      const y = re(t);
      if (y === k)
        return;
      if (k = y, e.shaderSource(T, y), e.compileShader(T), !e.getShaderParameter(T, e.COMPILE_STATUS)) {
        console.warn(e.getShaderInfoLog(T));
        return;
      }
      if (e.linkProgram(u), !e.getProgramParameter(u, e.LINK_STATUS)) {
        console.warn(e.getProgramInfoLog(u));
        return;
      }
      L = e.getAttribLocation(u, "a_position"), f = e.getUniformLocation(u, "u_viewType");
      const P = e.getUniformLocation(u, "u_texture"), F = e.getParameter(e.CURRENT_PROGRAM);
      e.useProgram(u), e.uniform1i(P, 0), e.useProgram(F);
    };
    t.addEventListener("on-config-changed", g);
    const V = c ? c.createVertexArrayOES() : e.createVertexArray(), U = e.createBuffer(), H = e.getParameter(e.ARRAY_BUFFER_BINDING), O = e.getParameter(v);
    h(V), e.bindBuffer(e.ARRAY_BUFFER, U), e.bufferData(e.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), e.STATIC_DRAW), e.enableVertexAttribArray(L), e.vertexAttribPointer(L, 2, e.FLOAT, !1, 0, 0), h(O), e.bindBuffer(e.ARRAY_BUFFER, H);
    const q = () => {
      console.assert(this[S].LookingGlassEnabled), e.bindFramebuffer(e.FRAMEBUFFER, this.framebuffer);
      const y = e.getParameter(e.COLOR_CLEAR_VALUE), P = e.getParameter(e.DEPTH_CLEAR_VALUE), F = e.getParameter(e.STENCIL_CLEAR_VALUE);
      e.clearColor(0, 0, 0, 0), e.clearDepth(1), e.clearStencil(0), e.clear(e.DEPTH_BUFFER_BIT | e.COLOR_BUFFER_BIT | e.STENCIL_BUFFER_BIT), e.clearColor(y[0], y[1], y[2], y[3]), e.clearDepth(P), e.clearStencil(F);
    }, Y = () => {
      if (!this[S].LookingGlassEnabled || t.appCanvas == null || t.lkgCanvas == null)
        return;
      (t.appCanvas.width !== t.framebufferWidth || t.appCanvas.height !== t.framebufferHeight) && (t.appCanvas.width, t.appCanvas.height, t.appCanvas.width = t.framebufferWidth, t.appCanvas.height = t.framebufferHeight);
      const y = e.getParameter(v), P = e.getParameter(e.CULL_FACE), F = e.getParameter(e.BLEND), z = e.getParameter(e.DEPTH_TEST), j = e.getParameter(e.STENCIL_TEST), K = e.getParameter(e.SCISSOR_TEST), M = e.getParameter(e.VIEWPORT), $ = e.getParameter(e.FRAMEBUFFER_BINDING), Z = e.getParameter(e.RENDERBUFFER_BINDING), Q = e.getParameter(e.CURRENT_PROGRAM), J = e.getParameter(e.ACTIVE_TEXTURE);
      {
        const ee = e.getParameter(e.TEXTURE_BINDING_2D);
        e.bindFramebuffer(e.FRAMEBUFFER, null), e.useProgram(u), h(V), e.activeTexture(e.TEXTURE0), e.bindTexture(e.TEXTURE_2D, m), e.disable(e.BLEND), e.disable(e.CULL_FACE), e.disable(e.DEPTH_TEST), e.disable(e.STENCIL_TEST), e.viewport(0, 0, e.drawingBufferWidth, e.drawingBufferHeight), e.uniform1i(f, 0), e.drawArrays(e.TRIANGLES, 0, 6), o == null || o.clearRect(0, 0, t.lkgCanvas.width, t.lkgCanvas.height), o == null || o.drawImage(t.appCanvas, 0, 0, t.framebufferWidth, t.framebufferHeight, 0, 0, t.calibration.screenW.value, t.calibration.screenH.value), t.inlineView !== 0 && (t.capturing && t.appCanvas.width !== t.framebufferWidth && (t.appCanvas.width = t.framebufferWidth, t.appCanvas.height = t.framebufferHeight, e.viewport(0, 0, t.framebufferHeight, t.framebufferWidth)), e.uniform1i(f, t.inlineView), e.drawArrays(e.TRIANGLES, 0, 6)), e.bindTexture(e.TEXTURE_2D, ee);
      }
      e.activeTexture(J), e.useProgram(Q), e.bindRenderbuffer(e.RENDERBUFFER, Z), e.bindFramebuffer(e.FRAMEBUFFER, $), e.viewport(M[0], M[1], M[2], M[3]), (K ? a : l)(e.SCISSOR_TEST), (j ? a : l)(e.STENCIL_TEST), (z ? a : l)(e.DEPTH_TEST), (F ? a : l)(e.BLEND), (P ? a : l)(e.CULL_FACE), h(y);
    };
    window.addEventListener("unload", () => {
      t.popup && t.popup.close(), t.popup = null;
    }), g(), this[S] = {
      LookingGlassEnabled: !1,
      framebuffer: p,
      clearFramebuffer: q,
      blitTextureToDefaultFramebufferIfNeeded: Y,
      moveCanvasToWindow: pe
    };
  }
  get framebuffer() {
    return this[S].LookingGlassEnabled ? this[S].framebuffer : null;
  }
  get framebufferWidth() {
    return x().framebufferWidth;
  }
  get framebufferHeight() {
    return x().framebufferHeight;
  }
}
class we extends oe {
  constructor(n) {
    super(n), this.sessions = /* @__PURE__ */ new Map(), this.viewSpaces = [], this.basePoseMatrix = b.create(), this.inlineProjectionMatrix = b.create(), this.inlineInverseViewMatrix = b.create(), this.LookingGlassProjectionMatrices = [], this.LookingGlassInverseViewMatrices = [];
  }
  onBaseLayerSet(n, e) {
    const s = this.sessions.get(n);
    s.baseLayer = e;
    const t = x(), o = e[S];
    o.LookingGlassEnabled = s.immersive, s.immersive && (t.XRSession = this.sessions.get(n), t.popup == null ? o.moveCanvasToWindow(!0, () => {
      this.endSession(n);
    }) : console.warn("attempted to assign baselayer twice?"));
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
    const s = n !== "inline", t = new Ee(n, e);
    return this.sessions.set(t.id, t), s && this.dispatchEvent("@@webxr-polyfill/vr-present-start", t.id), Promise.resolve(t.id);
  }
  requestAnimationFrame(n) {
    return this.global.requestAnimationFrame(n);
  }
  cancelAnimationFrame(n) {
    this.global.cancelAnimationFrame(n);
  }
  onFrameStart(n, e) {
    const s = this.sessions.get(n), t = x();
    if (s.immersive) {
      const o = Math.tan(0.5 * t.fovy), r = 0.5 * t.targetDiam / o, m = r - t.targetDiam, w = this.basePoseMatrix;
      b.fromTranslation(w, [t.targetX, t.targetY, t.targetZ]), b.rotate(w, w, t.trackballX, [0, 1, 0]), b.rotate(w, w, -t.trackballY, [1, 0, 0]), b.translate(w, w, [0, 0, r]);
      for (let p = 0; p < t.numViews; ++p) {
        const a = (p + 0.5) / t.numViews - 0.5, l = Math.tan(t.viewCone * a), c = r * l, v = this.LookingGlassInverseViewMatrices[p] = this.LookingGlassInverseViewMatrices[p] || b.create();
        b.translate(v, w, [c, 0, 0]), b.invert(v, v);
        const h = Math.max(m + e.depthNear, 0.01), C = m + e.depthFar, R = h * o, u = R, d = -R, T = h * -l, k = t.aspect * R, L = T + k, f = T - k, g = this.LookingGlassProjectionMatrices[p] = this.LookingGlassProjectionMatrices[p] || b.create();
        b.set(g, 2 * h / (L - f), 0, 0, 0, 0, 2 * h / (u - d), 0, 0, (L + f) / (L - f), (u + d) / (u - d), -(C + h) / (C - h), -1, 0, 0, -2 * C * h / (C - h), 0);
      }
      s.baseLayer[S].clearFramebuffer();
    } else {
      const o = s.baseLayer.context, r = o.drawingBufferWidth / o.drawingBufferHeight;
      b.perspective(this.inlineProjectionMatrix, e.inlineVerticalFieldOfView, r, e.depthNear, e.depthFar), b.fromTranslation(this.basePoseMatrix, [0, D, 0]), b.invert(this.inlineInverseViewMatrix, this.basePoseMatrix);
    }
  }
  onFrameEnd(n) {
    this.sessions.get(n).baseLayer[S].blitTextureToDefaultFramebufferIfNeeded();
  }
  async requestFrameOfReferenceTransform(n, e) {
    const s = b.create();
    switch (n) {
      case "viewer":
      case "local":
        return b.fromTranslation(s, [0, -D, 0]), s;
      case "local-floor":
        return s;
      default:
        throw new Error("XRReferenceSpaceType not understood");
    }
  }
  endSession(n) {
    const e = this.sessions.get(n);
    e.immersive && e.baseLayer && (e.baseLayer[S].moveCanvasToWindow(!1), this.dispatchEvent("@@webxr-polyfill/vr-present-end", n)), e.ended = !0;
  }
  doesSessionSupportReferenceSpace(n, e) {
    const s = this.sessions.get(n);
    return s.ended ? !1 : s.enabledFeatures.has(e);
  }
  getViewSpaces(n) {
    if (n === "immersive-vr") {
      const e = x();
      for (let s = this.viewSpaces.length; s < e.numViews; ++s)
        this.viewSpaces[s] = new Ce(s);
      return this.viewSpaces.length = e.numViews, this.viewSpaces;
    }
  }
  getViewport(n, e, s, t, o) {
    if (o === void 0) {
      const m = this.sessions.get(n).baseLayer.context;
      t.x = 0, t.y = 0, t.width = m.drawingBufferWidth, t.height = m.drawingBufferHeight;
    } else {
      const r = x(), m = o % r.quiltWidth, w = Math.floor(o / r.quiltWidth);
      t.x = r.tileWidth * m, t.y = r.tileHeight * w, t.width = r.tileWidth, t.height = r.tileHeight;
    }
    return !0;
  }
  getProjectionMatrix(n, e) {
    return e === void 0 ? this.inlineProjectionMatrix : this.LookingGlassProjectionMatrices[e] || b.create();
  }
  getBasePoseMatrix() {
    return this.basePoseMatrix;
  }
  getBaseViewMatrix() {
    return this.inlineInverseViewMatrix;
  }
  _getViewMatrixByIndex(n) {
    return this.LookingGlassInverseViewMatrices[n] = this.LookingGlassInverseViewMatrices[n] || b.create();
  }
  getInputSources() {
    return [];
  }
  getInputPose(n, e, s) {
    return null;
  }
  onWindowResize() {
  }
}
let ge = 0;
class Ee {
  constructor(n, e) {
    E(this, "mode");
    E(this, "immersive");
    E(this, "id");
    E(this, "baseLayer");
    E(this, "inlineVerticalFieldOfView");
    E(this, "ended");
    E(this, "enabledFeatures");
    this.mode = n, this.immersive = n === "immersive-vr" || n === "immersive-ar", this.id = ++ge, this.baseLayer = null, this.inlineVerticalFieldOfView = Math.PI * 0.5, this.ended = !1, this.enabledFeatures = e;
  }
}
class Ce extends le {
  constructor(e) {
    super();
    E(this, "viewIndex");
    this.viewIndex = e;
  }
  get eye() {
    return "none";
  }
  _onPoseUpdate(e) {
    this._inverseBaseMatrix = e._getViewMatrixByIndex(this.viewIndex);
  }
}
class W extends ae {
  constructor(e) {
    super();
    E(this, "vrButton");
    E(this, "device");
    E(this, "isPresenting", !1);
    N(e), this.loadPolyfill();
  }
  static async init(e) {
    new W(e);
  }
  async loadPolyfill() {
    this.overrideDefaultVRButton(), console.warn('Looking Glass WebXR "polyfill" overriding native WebXR API.');
    for (const e in G)
      this.global[e] = G[e];
    this.global.XRWebGLLayer = be, this.injected = !0, this.device = new we(this.global), this.xr = new ne(Promise.resolve(this.device)), Object.defineProperty(this.global.navigator, "xr", {
      value: this.xr,
      configurable: !0
    });
  }
  async overrideDefaultVRButton() {
    this.vrButton = await ye("VRButton"), this.vrButton && this.device && (this.device.addEventListener("@@webxr-polyfill/vr-present-start", () => {
      this.isPresenting = !0, this.updateVRButtonUI();
    }), this.device.addEventListener("@@webxr-polyfill/vr-present-end", () => {
      this.isPresenting = !1, this.updateVRButtonUI();
    }), this.vrButton.addEventListener("click", (e) => {
      this.updateVRButtonUI();
    }), this.updateVRButtonUI());
  }
  async updateVRButtonUI() {
    if (this.vrButton) {
      await Re(100), this.isPresenting ? this.vrButton.innerHTML = "EXIT LOOKING GLASS" : this.vrButton.innerHTML = "ENTER LOOKING GLASS";
      const e = 220;
      this.vrButton.style.width = `${e}px`, this.vrButton.style.left = `calc(50% - ${e / 2}px)`;
    }
  }
  update(e) {
    N(e);
  }
}
async function ye(i) {
  return new Promise((n, e) => {
    const s = new MutationObserver(function(t) {
      t.forEach(function(o) {
        o.addedNodes.forEach(function(r) {
          const m = r;
          m.id == i && (n(m), s.disconnect());
        });
      });
    });
    s.observe(document.body, { subtree: !1, childList: !0 }), setTimeout(() => {
      s.disconnect(), e(`id:${i} not found`);
    }, 5e3);
  });
}
function Re(i) {
  return new Promise((n) => setTimeout(n, i));
}
const Ae = x();
export {
  Ae as LookingGlassConfig,
  W as LookingGlassWebXRPolyfill
};
