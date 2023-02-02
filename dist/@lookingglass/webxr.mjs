var se = Object.defineProperty;
var oe = (a, t, e) => t in a ? se(a, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : a[t] = e;
var L = (a, t, e) => (oe(a, typeof t != "symbol" ? t + "" : t, e), e);
import Y from "@lookingglass/webxr-polyfill/src/api/index";
import ce from "@lookingglass/webxr-polyfill/src/api/XRSystem";
import le from "@lookingglass/webxr-polyfill/src/WebXRPolyfill";
import * as de from "holoplay-core";
import { Shader as z } from "holoplay-core";
import he from "@lookingglass/webxr-polyfill/src/devices/XRDevice";
import ue from "@lookingglass/webxr-polyfill/src/api/XRSpace";
import { mat4 as E } from "gl-matrix";
import fe, { PRIVATE as me } from "@lookingglass/webxr-polyfill/src/api/XRWebGLLayer";
const U = 1.6;
var W;
(function(a) {
  a[a.Swizzled = 0] = "Swizzled", a[a.Center = 1] = "Center", a[a.Quilt = 2] = "Quilt";
})(W || (W = {}));
class pe extends EventTarget {
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
      flipSubp: { value: 0 }
    });
    L(this, "_viewControls", {
      tileHeight: 512,
      numViews: 45,
      trackballX: 0,
      trackballY: 0,
      targetX: 0,
      targetY: U,
      targetZ: -0.5,
      targetDiam: 2,
      fovy: 13 / 180 * Math.PI,
      depthiness: 1.25,
      inlineView: W.Center
    });
    this._viewControls = { ...this._viewControls, ...e }, this.syncCalibration();
  }
  syncCalibration() {
    new de.Client((e) => {
      if (e.devices.length < 1) {
        console.error("No Looking Glass devices found!");
        return;
      }
      e.devices.length > 1 && console.warn("More than one Looking Glass device found... using the first one"), this.calibration = e.devices[0].calibration, this.calibration.screenH.value = 4096, this.calibration.screenW.value = 4096;
    }, (e) => {
      console.error("Error creating Looking Glass client:", e);
    });
  }
  addEventListener(e, n, r) {
    super.addEventListener(e, n, r);
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
    return this._viewControls.tileHeight;
  }
  set tileHeight(e) {
    this.updateViewControls({ tileHeight: e });
  }
  get numViews() {
    return this._viewControls.numViews;
  }
  set numViews(e) {
    this.updateViewControls({ numViews: e });
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
    return this._calibration.screenW.value / this._calibration.screenH.value;
  }
  get tileWidth() {
    return Math.round(this.tileHeight * this.aspect);
  }
  get framebufferWidth() {
    return this.tileWidth * this.tileHeight * this.numViews, 4096;
  }
  get quiltWidth() {
    return Math.floor(this.framebufferWidth / this.tileWidth);
  }
  get quiltHeight() {
    return Math.ceil(this.numViews / this.quiltWidth);
  }
  get framebufferHeight() {
    return 4096;
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
function A() {
  return X == null && (X = new pe()), X;
}
function q(a) {
  const t = A();
  a != null && t.updateViewControls(a);
}
function be(a) {
  var C;
  const t = A(), e = document.createElement("style");
  document.head.appendChild(e), (C = e.sheet) == null || C.insertRule("#LookingGlassWebXRControls * { all: revert; font-family: sans-serif }");
  const n = document.createElement("div");
  n.id = "LookingGlassWebXRControls", n.style.position = "fixed", n.style.zIndex = "1000", n.style.padding = "15px", n.style.width = "320px", n.style.maxWidth = "calc(100vw - 18px)", n.style.maxHeight = "calc(100vh - 18px)", n.style.whiteSpace = "nowrap", n.style.background = "rgba(0, 0, 0, 0.6)", n.style.color = "white", n.style.borderRadius = "10px", n.style.right = "15px", n.style.bottom = "15px";
  const r = document.createElement("div");
  n.appendChild(r), r.style.width = "100%", r.style.textAlign = "center", r.style.fontWeight = "bold", r.innerText = "Looking Glass Controls ";
  const f = document.createElement("div");
  n.appendChild(f), f.style.width = "100%", f.style.whiteSpace = "normal", f.style.color = "rgba(255,255,255,0.7)", f.style.fontSize = "14px", f.style.margin = "5px 0", f.innerHTML = "Click the popup and use WASD, mouse left/right drag, and scroll.";
  const l = document.createElement("input");
  r.appendChild(l), l.type = "button", l.value = "\u2190", l.dataset.otherValue = "\u2192", l.onclick = () => {
    [n.style.right, n.style.left] = [n.style.left, n.style.right], [l.value, l.dataset.otherValue] = [l.dataset.otherValue || "", l.value];
  };
  const o = document.createElement("div");
  n.appendChild(o);
  const c = (i, d, u) => {
    const s = u.stringify, v = document.createElement("div");
    v.style.marginBottom = "8px", o.appendChild(v);
    const g = i, x = t[i], p = document.createElement("label");
    if (v.appendChild(p), p.innerText = u.label, p.setAttribute("for", g), p.style.width = "100px", p.style.display = "inline-block", p.style.textDecoration = "dotted underline 1px", p.style.fontFamily = '"Courier New"', p.style.fontSize = "13px", p.style.fontWeight = "bold", p.title = u.title, d.type !== "checkbox") {
      const m = document.createElement("input");
      v.appendChild(m), m.type = "button", m.value = "\u238C", m.alt = "reset", m.title = "Reset value to default", m.style.padding = "0 4px", m.onclick = (T) => {
        h.value = x, h.oninput(T);
      };
    }
    const h = document.createElement("input");
    v.appendChild(h), Object.assign(h, d), h.id = g, h.title = u.title, h.value = d.value !== void 0 ? d.value : x;
    const k = (m) => {
      t[i] = m, G(m);
    };
    h.oninput = () => {
      const m = d.type === "range" ? parseFloat(h.value) : d.type === "checkbox" ? h.checked : h.value;
      k(m);
    };
    const N = (m) => {
      let T = m(t[i]);
      u.fixRange && (T = u.fixRange(T), h.max = Math.max(parseFloat(h.max), T).toString(), h.min = Math.min(parseFloat(h.min), T).toString()), h.value = T, k(T);
    };
    d.type === "range" && (h.style.width = "110px", h.style.height = "8px", h.onwheel = (m) => {
      N((T) => T + Math.sign(m.deltaX - m.deltaY) * d.step);
    });
    let G = (m) => {
    };
    if (s) {
      const m = document.createElement("span");
      m.style.fontFamily = '"Courier New"', m.style.fontSize = "13px", m.style.marginLeft = "3px", v.appendChild(m), G = (T) => {
        m.innerHTML = s(T);
      }, G(x);
    }
    return N;
  };
  c("tileHeight", { type: "range", min: 160, max: 455, step: 1 }, {
    label: "resolution",
    title: "resolution of each view",
    stringify: (i) => `${(i * t.aspect).toFixed()}&times;${i.toFixed()}`
  }), c("numViews", { type: "range", min: 1, max: 145, step: 1 }, {
    label: "views",
    title: "number of different viewing angles to render",
    stringify: (i) => i.toFixed()
  });
  const D = c("trackballX", {
    type: "range",
    min: -Math.PI,
    max: 1.0001 * Math.PI,
    step: 0.5 / 180 * Math.PI
  }, {
    label: "trackball x",
    title: "camera trackball x",
    fixRange: (i) => (i + Math.PI * 3) % (Math.PI * 2) - Math.PI,
    stringify: (i) => `${(i / Math.PI * 180).toFixed()}&deg;`
  }), R = c("trackballY", {
    type: "range",
    min: -0.5 * Math.PI,
    max: 0.5001 * Math.PI,
    step: 1 / 180 * Math.PI
  }, {
    label: "trackball y",
    title: "camera trackball y",
    fixRange: (i) => Math.max(-0.5 * Math.PI, Math.min(i, 0.5 * Math.PI)),
    stringify: (i) => `${(i / Math.PI * 180).toFixed()}&deg;`
  }), M = c("targetX", { type: "range", min: -20, max: 20, step: 0.1 }, {
    label: "target x",
    title: "target position x",
    fixRange: (i) => i,
    stringify: (i) => i.toFixed(2) + " m"
  }), V = c("targetY", { type: "range", min: -20, max: 20, step: 0.1 }, {
    label: "target y",
    title: "target position y",
    fixRange: (i) => i,
    stringify: (i) => i.toFixed(2) + " m"
  }), P = c("targetZ", { type: "range", min: -20, max: 20, step: 0.1 }, {
    label: "target z",
    title: "target position z",
    fixRange: (i) => i,
    stringify: (i) => i.toFixed(2) + " m"
  });
  c("fovy", {
    type: "range",
    min: 1 / 180 * Math.PI,
    max: 120.1 / 180 * Math.PI,
    step: 1 / 180 * Math.PI
  }, {
    label: "fov",
    title: "perspective fov (degrades stereo effect)",
    fixRange: (i) => Math.max(1 / 180 * Math.PI, Math.min(i, 120.1 / 180 * Math.PI)),
    stringify: (i) => {
      const d = i / Math.PI * 180, u = Math.atan(Math.tan(i / 2) * t.aspect) * 2 / Math.PI * 180;
      return `${d.toFixed()}&deg;&times;${u.toFixed()}&deg;`;
    }
  }), c("depthiness", { type: "range", min: 0, max: 2, step: 0.01 }, {
    label: "depthiness",
    title: 'exaggerates depth by multiplying the width of the view cone (as reported by the firmware) - can somewhat compensate for depthiness lost using higher fov. 1.25 seems to be most physically accurate on Looking Glass 8.9".',
    fixRange: (i) => Math.max(0, i),
    stringify: (i) => `${i.toFixed(2)}x`
  }), c("inlineView", { type: "range", min: 0, max: 2, step: 1 }, {
    label: "inline view",
    title: "what to show inline on the original canvas (swizzled = no overwrite)",
    fixRange: (i) => Math.max(0, Math.min(i, 2)),
    stringify: (i) => i === 0 ? "swizzled" : i === 1 ? "center" : i === 2 ? "quilt" : "?"
  }), a.oncontextmenu = (i) => {
    i.preventDefault();
  }, a.addEventListener("wheel", (i) => {
    const d = t.targetDiam, u = 1.1, s = Math.log(d) / Math.log(u);
    return t.targetDiam = Math.pow(u, s + i.deltaY * 0.01);
  }), a.addEventListener("mousemove", (i) => {
    const d = i.movementX, u = -i.movementY;
    if (i.buttons & 2 || i.buttons & 1 && (i.shiftKey || i.ctrlKey)) {
      const s = t.trackballX, v = t.trackballY, g = -Math.cos(s) * d + Math.sin(s) * Math.sin(v) * u, x = -Math.cos(v) * u, p = Math.sin(s) * d + Math.cos(s) * Math.sin(v) * u;
      M((h) => h + g * t.targetDiam * 1e-3), V((h) => h + x * t.targetDiam * 1e-3), P((h) => h + p * t.targetDiam * 1e-3);
    } else
      i.buttons & 1 && (D((s) => s - d * 0.01), R((s) => s - u * 0.01));
  });
  const b = { w: 0, a: 0, s: 0, d: 0 };
  a.addEventListener("keydown", (i) => {
    switch (i.code) {
      case "KeyW":
        b.w = 1;
        break;
      case "KeyA":
        b.a = 1;
        break;
      case "KeyS":
        b.s = 1;
        break;
      case "KeyD":
        b.d = 1;
        break;
    }
  }), a.addEventListener("keyup", (i) => {
    switch (i.code) {
      case "KeyW":
        b.w = 0;
        break;
      case "KeyA":
        b.a = 0;
        break;
      case "KeyS":
        b.s = 0;
        break;
      case "KeyD":
        b.d = 0;
        break;
    }
  }), requestAnimationFrame(y);
  function y() {
    let i = b.d - b.a, d = b.w - b.s;
    i && d && (i *= Math.sqrt(0.5), d *= Math.sqrt(0.5));
    const u = t.trackballX, s = t.trackballY, v = Math.cos(u) * i - Math.sin(u) * Math.cos(s) * d, g = -Math.sin(s) * d, x = -Math.sin(u) * i - Math.cos(u) * Math.cos(s) * d;
    M((p) => p + v * t.targetDiam * 0.03), V((p) => p + g * t.targetDiam * 0.03), P((p) => p + x * t.targetDiam * 0.03), requestAnimationFrame(y);
  }
  return n;
}
const I = Symbol("LookingGlassXRWebGLLayer");
class ve extends fe {
  constructor(t, e, n) {
    super(t, e, n);
    const r = document.createElement("canvas");
    r.tabIndex = 0;
    const f = r.getContext("2d", { alpha: !1 });
    r.addEventListener("dblclick", function() {
      this.requestFullscreen();
    });
    const l = be(r), o = A(), c = this[me].config, D = e.createTexture();
    let R, M;
    const V = e.createFramebuffer(), P = e.enable.bind(e), b = e.disable.bind(e), y = e.getExtension("OES_vertex_array_object"), C = 34229, i = y ? y.bindVertexArrayOES.bind(y) : e.bindVertexArray.bind(e);
    (c.depth || c.stencil) && (c.depth && c.stencil ? M = {
      format: e.DEPTH_STENCIL,
      attachment: e.DEPTH_STENCIL_ATTACHMENT
    } : c.depth ? M = {
      format: e.DEPTH_COMPONENT16,
      attachment: e.DEPTH_ATTACHMENT
    } : c.stencil && (M = {
      format: e.STENCIL_INDEX8,
      attachment: e.STENCIL_ATTACHMENT
    }), R = e.createRenderbuffer());
    const d = () => {
      const w = e.getParameter(e.TEXTURE_BINDING_2D);
      if (e.bindTexture(e.TEXTURE_2D, D), e.texImage2D(e.TEXTURE_2D, 0, e.RGBA, o.framebufferWidth, o.framebufferHeight, 0, e.RGBA, e.UNSIGNED_BYTE, null), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.LINEAR), e.bindTexture(e.TEXTURE_2D, w), R) {
        const F = e.getParameter(e.RENDERBUFFER_BINDING);
        e.bindRenderbuffer(e.RENDERBUFFER, R), e.renderbufferStorage(e.RENDERBUFFER, M.format, o.framebufferWidth, o.framebufferHeight), e.bindRenderbuffer(e.RENDERBUFFER, F);
      }
    };
    d(), o.addEventListener("on-config-changed", d);
    const u = e.getParameter(e.FRAMEBUFFER_BINDING);
    e.bindFramebuffer(e.FRAMEBUFFER, V), e.framebufferTexture2D(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, D, 0), (c.depth || c.stencil) && e.framebufferRenderbuffer(e.FRAMEBUFFER, M.attachment, e.RENDERBUFFER, R), e.bindFramebuffer(e.FRAMEBUFFER, u);
    const s = e.createProgram(), v = e.createShader(e.VERTEX_SHADER);
    e.attachShader(s, v);
    const g = e.createShader(e.FRAGMENT_SHADER);
    e.attachShader(s, g);
    {
      const w = `
       attribute vec2 a_position;
       varying vec2 v_texcoord;
       void main() {
         gl_Position = vec4(a_position * 2.0 - 1.0, 0.0, 1.0);
         v_texcoord = a_position;
       }
     `;
      e.shaderSource(v, w), e.compileShader(v), e.getShaderParameter(v, e.COMPILE_STATUS) || console.warn(e.getShaderInfoLog(v));
    }
    let x, p, h;
    const k = () => {
      const w = z(o);
      if (console.log(z(o), "this is the shader"), w === x)
        return;
      if (x = w, e.shaderSource(g, w), e.compileShader(g), !e.getShaderParameter(g, e.COMPILE_STATUS)) {
        console.warn(e.getShaderInfoLog(g));
        return;
      }
      if (e.linkProgram(s), !e.getProgramParameter(s, e.LINK_STATUS)) {
        console.warn(e.getProgramInfoLog(s));
        return;
      }
      p = e.getAttribLocation(s, "a_position"), h = e.getUniformLocation(s, "u_viewType");
      const F = e.getUniformLocation(s, "u_texture"), B = e.getParameter(e.CURRENT_PROGRAM);
      e.useProgram(s), e.uniform1i(F, D), e.useProgram(B);
    };
    o.addEventListener("on-config-changed", k);
    const N = y ? y.createVertexArrayOES() : e.createVertexArray(), G = e.createBuffer(), m = e.getParameter(e.ARRAY_BUFFER_BINDING), T = e.getParameter(C);
    i(N), e.bindBuffer(e.ARRAY_BUFFER, G), e.bufferData(e.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), e.STATIC_DRAW), e.enableVertexAttribArray(p), e.vertexAttribPointer(p, 2, e.FLOAT, !1, 0, 0), i(T), e.bindBuffer(e.ARRAY_BUFFER, m);
    const j = () => {
      console.assert(this[I].LookingGlassEnabled), e.bindFramebuffer(e.FRAMEBUFFER, this.framebuffer);
      const w = e.getParameter(e.COLOR_CLEAR_VALUE), F = e.getParameter(e.DEPTH_CLEAR_VALUE), B = e.getParameter(e.STENCIL_CLEAR_VALUE);
      e.clearColor(0, 0, 0, 0), e.clearDepth(1), e.clearStencil(0), e.clear(e.DEPTH_BUFFER_BIT | e.COLOR_BUFFER_BIT | e.STENCIL_BUFFER_BIT), e.clearColor(w[0], w[1], w[2], w[3]), e.clearDepth(F), e.clearStencil(B);
    }, S = e.canvas;
    let H, O;
    const K = () => {
      if (!this[I].LookingGlassEnabled)
        return;
      (S.width !== o.calibration.screenW.value || S.height !== o.calibration.screenH.value) && (H = S.width, O = S.height, S.width = o.calibration.screenW.value, S.height = o.calibration.screenH.value);
      const w = e.getParameter(C), F = e.getParameter(e.CULL_FACE), B = e.getParameter(e.BLEND), Z = e.getParameter(e.DEPTH_TEST), Q = e.getParameter(e.STENCIL_TEST), J = e.getParameter(e.SCISSOR_TEST), ee = e.getParameter(e.VIEWPORT), te = e.getParameter(e.FRAMEBUFFER_BINDING), ie = e.getParameter(e.RENDERBUFFER_BINDING), ne = e.getParameter(e.CURRENT_PROGRAM), re = e.getParameter(e.ACTIVE_TEXTURE);
      {
        const ae = e.getParameter(e.TEXTURE_BINDING_2D);
        e.bindFramebuffer(e.FRAMEBUFFER, null), e.useProgram(s), i(N), e.activeTexture(e.TEXTURE0), e.bindTexture(e.TEXTURE_2D, D), e.disable(e.BLEND), e.disable(e.CULL_FACE), e.disable(e.DEPTH_TEST), e.disable(e.STENCIL_TEST), e.viewport(0, 0, e.drawingBufferWidth, e.drawingBufferHeight), e.uniform1i(h, 0), e.drawArrays(e.TRIANGLES, 0, 6), f == null || f.clearRect(0, 0, r.width, r.height), f == null || f.drawImage(S, 0, 0), o.inlineView !== 0 && (e.uniform1i(h, o.inlineView), e.drawArrays(e.TRIANGLES, 0, 6)), e.bindTexture(e.TEXTURE_2D, ae);
      }
      e.activeTexture(re), e.useProgram(ne), e.bindRenderbuffer(e.RENDERBUFFER, ie), e.bindFramebuffer(e.FRAMEBUFFER, te), e.viewport(...ee), (J ? P : b)(e.SCISSOR_TEST), (Q ? P : b)(e.STENCIL_TEST), (Z ? P : b)(e.DEPTH_TEST), (B ? P : b)(e.BLEND), (F ? P : b)(e.CULL_FACE), i(w);
    };
    let _;
    window.addEventListener("unload", () => {
      _ && _.close(), _ = void 0;
    });
    const $ = (w, F) => {
      var B;
      !!_ != w && (w ? (k(), r.style.position = "fixed", r.style.top = "0", r.style.left = "0", r.style.width = "100%", r.style.height = "100%", r.width = o.calibration.screenW.value, r.height = o.calibration.screenH.value, document.body.appendChild(l), _ = window.open("", void 0, "width=640,height=360"), _.document.title = "Looking Glass Window (fullscreen me on Looking Glass!)", _.document.body.style.background = "black", _.document.body.appendChild(r), console.assert(F), _.onbeforeunload = F) : ((B = l.parentElement) == null || B.removeChild(l), S.width = H, S.height = O, _.onbeforeunload = void 0, _.close(), _ = void 0));
    };
    this[I] = {
      LookingGlassEnabled: !1,
      framebuffer: V,
      clearFramebuffer: j,
      blitTextureToDefaultFramebufferIfNeeded: K,
      moveCanvasToWindow: $
    };
  }
  get framebuffer() {
    return this[I].LookingGlassEnabled ? this[I].framebuffer : null;
  }
  get framebufferWidth() {
    return A().framebufferWidth;
  }
  get framebufferHeight() {
    return A().framebufferHeight;
  }
}
class Ee extends he {
  constructor(t) {
    super(t), this.sessions = /* @__PURE__ */ new Map(), this.viewSpaces = [], this.basePoseMatrix = E.create(), this.inlineProjectionMatrix = E.create(), this.inlineInverseViewMatrix = E.create(), this.LookingGlassProjectionMatrices = [], this.LookingGlassInverseViewMatrices = [];
  }
  onBaseLayerSet(t, e) {
    const n = this.sessions.get(t);
    n.baseLayer = e;
    const r = e[I];
    r.LookingGlassEnabled = n.immersive, n.immersive && r.moveCanvasToWindow(!0, () => {
      this.endSession(t);
    });
  }
  isSessionSupported(t) {
    return t === "inline" || t === "immersive-vr";
  }
  isFeatureSupported(t) {
    switch (t) {
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
        return console.warn("LookingGlassXRDevice.isFeatureSupported: feature not understood:", t), !1;
    }
  }
  async requestSession(t, e) {
    if (!this.isSessionSupported(t))
      return Promise.reject();
    const n = t !== "inline", r = new we(t, e);
    return this.sessions.set(r.id, r), n && this.dispatchEvent("@@webxr-polyfill/vr-present-start", r.id), Promise.resolve(r.id);
  }
  requestAnimationFrame(t) {
    return this.global.requestAnimationFrame(t);
  }
  cancelAnimationFrame(t) {
    this.global.cancelAnimationFrame(t);
  }
  onFrameStart(t, e) {
    const n = this.sessions.get(t), r = A();
    if (n.immersive) {
      const f = Math.tan(0.5 * r.fovy), l = 0.5 * r.targetDiam / f, o = l - r.targetDiam, c = this.basePoseMatrix;
      E.fromTranslation(c, [r.targetX, r.targetY, r.targetZ]), E.rotate(c, c, r.trackballX, [0, 1, 0]), E.rotate(c, c, -r.trackballY, [1, 0, 0]), E.translate(c, c, [0, 0, l]);
      for (let R = 0; R < r.numViews; ++R) {
        const M = (R + 0.5) / r.numViews - 0.5, V = Math.tan(r.viewCone * M), P = l * V, b = this.LookingGlassInverseViewMatrices[R] = this.LookingGlassInverseViewMatrices[R] || E.create();
        E.translate(b, c, [P, 0, 0]), E.invert(b, b);
        const y = Math.max(o + e.depthNear, 0.01), C = o + e.depthFar, i = y * f, d = i, u = -i, s = y * -V, v = r.aspect * i, g = s + v, x = s - v, p = this.LookingGlassProjectionMatrices[R] = this.LookingGlassProjectionMatrices[R] || E.create();
        E.set(p, 2 * y / (g - x), 0, 0, 0, 0, 2 * y / (d - u), 0, 0, (g + x) / (g - x), (d + u) / (d - u), -(C + y) / (C - y), -1, 0, 0, -2 * C * y / (C - y), 0);
      }
      n.baseLayer[I].clearFramebuffer();
    } else {
      const f = n.baseLayer.context, l = f.drawingBufferWidth / f.drawingBufferHeight;
      E.perspective(this.inlineProjectionMatrix, e.inlineVerticalFieldOfView, l, e.depthNear, e.depthFar), E.fromTranslation(this.basePoseMatrix, [0, U, 0]), E.invert(this.inlineInverseViewMatrix, this.basePoseMatrix);
    }
  }
  onFrameEnd(t) {
    this.sessions.get(t).baseLayer[I].blitTextureToDefaultFramebufferIfNeeded();
  }
  async requestFrameOfReferenceTransform(t, e) {
    const n = E.create();
    switch (t) {
      case "viewer":
      case "local":
        return E.fromTranslation(n, [0, -U, 0]), n;
      case "local-floor":
        return n;
      default:
        throw new Error("XRReferenceSpaceType not understood");
    }
  }
  endSession(t) {
    const e = this.sessions.get(t);
    e.immersive && e.baseLayer && (e.baseLayer[I].moveCanvasToWindow(!1), this.dispatchEvent("@@webxr-polyfill/vr-present-end", t)), e.ended = !0;
  }
  doesSessionSupportReferenceSpace(t, e) {
    const n = this.sessions.get(t);
    return n.ended ? !1 : n.enabledFeatures.has(e);
  }
  getViewSpaces(t) {
    if (t === "immersive-vr") {
      const e = A();
      for (let n = this.viewSpaces.length; n < e.numViews; ++n)
        this.viewSpaces[n] = new ge(n);
      return this.viewSpaces.length = e.numViews, this.viewSpaces;
    }
  }
  getViewport(t, e, n, r, f) {
    if (f === void 0) {
      const o = this.sessions.get(t).baseLayer.context;
      r.x = 0, r.y = 0, r.width = o.drawingBufferWidth, r.height = o.drawingBufferHeight;
    } else {
      const l = A(), o = f % l.quiltWidth, c = Math.floor(f / l.quiltWidth);
      r.x = l.tileWidth * o, r.y = l.tileHeight * c, r.width = l.tileWidth, r.height = l.tileHeight;
    }
    return !0;
  }
  getProjectionMatrix(t, e) {
    return e === void 0 ? this.inlineProjectionMatrix : this.LookingGlassProjectionMatrices[e] || E.create();
  }
  getBasePoseMatrix() {
    return this.basePoseMatrix;
  }
  getBaseViewMatrix() {
    return this.inlineInverseViewMatrix;
  }
  _getViewMatrixByIndex(t) {
    return this.LookingGlassInverseViewMatrices[t] = this.LookingGlassInverseViewMatrices[t] || E.create();
  }
  getInputSources() {
    return [];
  }
  getInputPose(t, e, n) {
    return null;
  }
  onWindowResize() {
  }
}
let ye = 0;
class we {
  constructor(t, e) {
    L(this, "mode");
    L(this, "immersive");
    L(this, "id");
    L(this, "baseLayer");
    L(this, "inlineVerticalFieldOfView");
    L(this, "ended");
    L(this, "enabledFeatures");
    this.mode = t, this.immersive = t === "immersive-vr" || t === "immersive-ar", this.id = ++ye, this.baseLayer = null, this.inlineVerticalFieldOfView = Math.PI * 0.5, this.ended = !1, this.enabledFeatures = e;
  }
}
class ge extends ue {
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
class Ae extends le {
  constructor(e) {
    super();
    L(this, "vrButton");
    L(this, "device");
    L(this, "isPresenting", !1);
    q(e), this.overrideDefaultVRButton(), console.warn('Looking Glass WebXR "polyfill" overriding native WebXR API.');
    for (const n in Y)
      this.global[n] = Y[n];
    this.global.XRWebGLLayer = ve, this.injected = !0, this.device = new Ee(this.global), this.xr = new ce(Promise.resolve(this.device)), Object.defineProperty(this.global.navigator, "xr", {
      value: this.xr,
      configurable: !0
    });
  }
  async overrideDefaultVRButton() {
    this.vrButton = await Re("VRButton"), this.vrButton && (this.device.addEventListener("@@webxr-polyfill/vr-present-start", () => {
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
async function Re(a) {
  return new Promise((t, e) => {
    const n = new MutationObserver(function(r) {
      r.forEach(function(f) {
        f.addedNodes.forEach(function(l) {
          const o = l;
          o.id == a && (t(o), n.disconnect());
        });
      });
    });
    n.observe(document.body, { subtree: !1, childList: !0 }), setTimeout(() => {
      n.disconnect(), e(`id:${a} not found`);
    }, 5e3);
  });
}
function xe(a) {
  return new Promise((t) => setTimeout(t, a));
}
const Ve = A();
export {
  Ve as LookingGlassConfig,
  Ae as LookingGlassWebXRPolyfill
};
