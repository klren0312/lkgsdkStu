var ae = Object.defineProperty;
var re = (b, t, e) => t in b ? ae(b, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : b[t] = e;
var C = (b, t, e) => (re(b, typeof t != "symbol" ? t + "" : t, e), e);
import se from "@lookingglass/webxr-polyfill/src/WebXRPolyfill";
import oe from "@lookingglass/webxr-polyfill/src/api/XRSystem";
import O from "@lookingglass/webxr-polyfill/src/api/index";
import ce from "@lookingglass/webxr-polyfill/src/devices/XRDevice";
import le from "@lookingglass/webxr-polyfill/src/api/XRSpace";
import { mat4 as g } from "gl-matrix";
import he, { PRIVATE as de } from "@lookingglass/webxr-polyfill/src/api/XRWebGLLayer";
import * as ue from "holoplay-core";
import { Shader as fe } from "holoplay-core";
const U = 1.6;
class me extends EventTarget {
  constructor(e) {
    super();
    C(this, "_calibration", {
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
    C(this, "_viewControls", {
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
      inlineView: 1
    });
    this._viewControls = { ...this._viewControls, ...e }, this.syncCalibration();
  }
  syncCalibration() {
    new ue.Client((e) => {
      if (e.devices.length < 1) {
        console.error("No Looking Glass devices found!");
        return;
      }
      e.devices.length > 1 && console.warn("More than one Looking Glass device found... using the first one"), this.calibration = e.devices[0].calibration;
    }, (e) => {
      console.error("Error creating Looking Glass client:", e);
    });
  }
  addEventListener(e, n, a) {
    super.addEventListener(e, n, a);
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
    this._viewControls.tileHeight = e, this.onConfigChange();
  }
  get numViews() {
    return this._viewControls.numViews;
  }
  set numViews(e) {
    this._viewControls.numViews = e, this.onConfigChange();
  }
  get targetX() {
    return this._viewControls.targetX;
  }
  set targetX(e) {
    this._viewControls.targetX = e, this.onConfigChange();
  }
  get targetY() {
    return this._viewControls.targetY;
  }
  set targetY(e) {
    this._viewControls.targetY = e, this.onConfigChange();
  }
  get targetZ() {
    return this._viewControls.targetZ;
  }
  set targetZ(e) {
    this._viewControls.targetZ = e, this.onConfigChange();
  }
  get trackballX() {
    return this._viewControls.trackballX;
  }
  set trackballX(e) {
    this._viewControls.trackballX = e, this.onConfigChange();
  }
  get trackballY() {
    return this._viewControls.trackballY;
  }
  set trackballY(e) {
    this._viewControls.trackballY = e, this.onConfigChange();
  }
  get targetDiam() {
    return this._viewControls.targetDiam;
  }
  set targetDiam(e) {
    this._viewControls.targetDiam = e, this.onConfigChange();
  }
  get fovy() {
    return this._viewControls.fovy;
  }
  set fovy(e) {
    this._viewControls.fovy = e, this.onConfigChange();
  }
  get depthiness() {
    return this._viewControls.depthiness;
  }
  set depthiness(e) {
    this._viewControls.depthiness = e, this.onConfigChange();
  }
  get inlineView() {
    return this._viewControls.inlineView;
  }
  set inlineView(e) {
    this._viewControls.inlineView = e, this.onConfigChange();
  }
  get aspect() {
    return this._calibration.screenW.value / this._calibration.screenH.value;
  }
  get tileWidth() {
    return Math.round(this.tileHeight * this.aspect);
  }
  get framebufferWidth() {
    const e = this.tileWidth * this.tileHeight * this.numViews;
    return 2 ** Math.ceil(Math.log2(Math.max(Math.sqrt(e), this.tileWidth)));
  }
  get quiltWidth() {
    return Math.floor(this.framebufferWidth / this.tileWidth);
  }
  get quiltHeight() {
    return Math.ceil(this.numViews / this.quiltWidth);
  }
  get framebufferHeight() {
    return 2 ** Math.ceil(Math.log2(this.quiltHeight * this.tileHeight));
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
  return X == null && (X = new me()), X;
}
function Y(b) {
  const t = A();
  b != null && t.updateViewControls(b);
}
function be(b) {
  var P;
  const t = A(), e = document.createElement("style");
  document.head.appendChild(e), (P = e.sheet) == null || P.insertRule("#LookingGlassWebXRControls * { all: revert; font-family: sans-serif }");
  const n = document.createElement("div");
  n.id = "LookingGlassWebXRControls", n.style.position = "fixed", n.style.zIndex = "1000", n.style.padding = "15px", n.style.width = "320px", n.style.maxWidth = "calc(100vw - 18px)", n.style.maxHeight = "calc(100vh - 18px)", n.style.whiteSpace = "nowrap", n.style.background = "rgba(0, 0, 0, 0.6)", n.style.color = "white", n.style.borderRadius = "10px", n.style.right = "15px", n.style.bottom = "15px";
  const a = document.createElement("div");
  n.appendChild(a), a.style.width = "100%", a.style.textAlign = "center", a.style.fontWeight = "bold", a.innerText = "Looking Glass Controls ";
  const u = document.createElement("div");
  n.appendChild(u), u.style.width = "100%", u.style.whiteSpace = "normal", u.style.color = "rgba(255,255,255,0.7)", u.style.fontSize = "14px", u.style.margin = "5px 0", u.innerHTML = "Click the popup and use WASD, mouse left/right drag, and scroll.";
  const o = document.createElement("input");
  a.appendChild(o), o.type = "button", o.value = "\u2190", o.dataset.otherValue = "\u2192", o.onclick = () => {
    [n.style.right, n.style.left] = [n.style.left, n.style.right], [o.value, o.dataset.otherValue] = [o.dataset.otherValue || "", o.value];
  };
  const c = document.createElement("div");
  n.appendChild(c);
  const s = (i, l, d) => {
    const r = d.stringify, v = document.createElement("div");
    v.style.marginBottom = "8px", c.appendChild(v);
    const w = i, R = t[i], m = document.createElement("label");
    if (v.appendChild(m), m.innerText = d.label, m.setAttribute("for", w), m.style.width = "100px", m.style.display = "inline-block", m.style.textDecoration = "dotted underline 1px", m.style.fontFamily = '"Courier New"', m.style.fontSize = "13px", m.style.fontWeight = "bold", m.title = d.title, l.type !== "checkbox") {
      const f = document.createElement("input");
      v.appendChild(f), f.type = "button", f.value = "\u238C", f.alt = "reset", f.title = "Reset value to default", f.style.padding = "0 4px", f.onclick = (T) => {
        h.value = R, h.oninput(T);
      };
    }
    const h = document.createElement("input");
    v.appendChild(h), Object.assign(h, l), h.id = w, h.title = d.title, h.value = l.value !== void 0 ? l.value : R;
    const V = (f) => {
      t[i] = f, G(f);
    };
    h.oninput = () => {
      const f = l.type === "range" ? parseFloat(h.value) : l.type === "checkbox" ? h.checked : h.value;
      V(f);
    };
    const N = (f) => {
      let T = f(t[i]);
      d.fixRange && (T = d.fixRange(T), h.max = Math.max(parseFloat(h.max), T).toString(), h.min = Math.min(parseFloat(h.min), T).toString()), h.value = T, V(T);
    };
    l.type === "range" && (h.style.width = "110px", h.style.height = "8px", h.onwheel = (f) => {
      N((T) => T + Math.sign(f.deltaX - f.deltaY) * l.step);
    });
    let G = (f) => {
    };
    if (r) {
      const f = document.createElement("span");
      f.style.fontFamily = '"Courier New"', f.style.fontSize = "13px", f.style.marginLeft = "3px", v.appendChild(f), G = (T) => {
        f.innerHTML = r(T);
      }, G(R);
    }
    return N;
  };
  s("tileHeight", { type: "range", min: 160, max: 455, step: 1 }, {
    label: "resolution",
    title: "resolution of each view",
    stringify: (i) => `${(i * t.aspect).toFixed()}&times;${i.toFixed()}`
  }), s("numViews", { type: "range", min: 1, max: 145, step: 1 }, {
    label: "views",
    title: "number of different viewing angles to render",
    stringify: (i) => i.toFixed()
  });
  const k = s("trackballX", {
    type: "range",
    min: -Math.PI,
    max: 1.0001 * Math.PI,
    step: 0.5 / 180 * Math.PI
  }, {
    label: "trackball x",
    title: "camera trackball x",
    fixRange: (i) => (i + Math.PI * 3) % (Math.PI * 2) - Math.PI,
    stringify: (i) => `${(i / Math.PI * 180).toFixed()}&deg;`
  }), x = s("trackballY", {
    type: "range",
    min: -0.5 * Math.PI,
    max: 0.5001 * Math.PI,
    step: 1 / 180 * Math.PI
  }, {
    label: "trackball y",
    title: "camera trackball y",
    fixRange: (i) => Math.max(-0.5 * Math.PI, Math.min(i, 0.5 * Math.PI)),
    stringify: (i) => `${(i / Math.PI * 180).toFixed()}&deg;`
  }), L = s("targetX", { type: "range", min: -20, max: 20, step: 0.1 }, {
    label: "target x",
    title: "target position x",
    fixRange: (i) => i,
    stringify: (i) => i.toFixed(2) + " m"
  }), B = s("targetY", { type: "range", min: -20, max: 20, step: 0.1 }, {
    label: "target y",
    title: "target position y",
    fixRange: (i) => i,
    stringify: (i) => i.toFixed(2) + " m"
  }), M = s("targetZ", { type: "range", min: -20, max: 20, step: 0.1 }, {
    label: "target z",
    title: "target position z",
    fixRange: (i) => i,
    stringify: (i) => i.toFixed(2) + " m"
  });
  s("fovy", {
    type: "range",
    min: 1 / 180 * Math.PI,
    max: 120.1 / 180 * Math.PI,
    step: 1 / 180 * Math.PI
  }, {
    label: "fov",
    title: "perspective fov (degrades stereo effect)",
    fixRange: (i) => Math.max(1 / 180 * Math.PI, Math.min(i, 120.1 / 180 * Math.PI)),
    stringify: (i) => {
      const l = i / Math.PI * 180, d = Math.atan(Math.tan(i / 2) * t.aspect) * 2 / Math.PI * 180;
      return `${l.toFixed()}&deg;&times;${d.toFixed()}&deg;`;
    }
  }), s("depthiness", { type: "range", min: 0, max: 2, step: 0.01 }, {
    label: "depthiness",
    title: 'exaggerates depth by multiplying the width of the view cone (as reported by the firmware) - can somewhat compensate for depthiness lost using higher fov. 1.25 seems to be most physically accurate on Looking Glass 8.9".',
    fixRange: (i) => Math.max(0, i),
    stringify: (i) => `${i.toFixed(2)}x`
  }), s("inlineView", { type: "range", min: 0, max: 2, step: 1 }, {
    label: "inline view",
    title: "what to show inline on the original canvas (swizzled = no overwrite)",
    fixRange: (i) => Math.max(0, Math.min(i, 2)),
    stringify: (i) => i === 0 ? "swizzled" : i === 1 ? "center" : i === 2 ? "quilt" : "?"
  }), b.oncontextmenu = (i) => {
    i.preventDefault();
  }, b.addEventListener("wheel", (i) => {
    const l = t.targetDiam, d = 1.1, r = Math.log(l) / Math.log(d);
    return t.targetDiam = Math.pow(d, r + i.deltaY * 0.01);
  }), b.addEventListener("mousemove", (i) => {
    const l = i.movementX, d = -i.movementY;
    if (i.buttons & 2 || i.buttons & 1 && (i.shiftKey || i.ctrlKey)) {
      const r = t.trackballX, v = t.trackballY, w = -Math.cos(r) * l + Math.sin(r) * Math.sin(v) * d, R = -Math.cos(v) * d, m = Math.sin(r) * l + Math.cos(r) * Math.sin(v) * d;
      L((h) => h + w * t.targetDiam * 1e-3), B((h) => h + R * t.targetDiam * 1e-3), M((h) => h + m * t.targetDiam * 1e-3);
    } else
      i.buttons & 1 && (k((r) => r - l * 0.01), x((r) => r - d * 0.01));
  });
  const p = { w: 0, a: 0, s: 0, d: 0 };
  b.addEventListener("keydown", (i) => {
    switch (i.code) {
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
  }), b.addEventListener("keyup", (i) => {
    switch (i.code) {
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
  }), requestAnimationFrame(E);
  function E() {
    let i = p.d - p.a, l = p.w - p.s;
    i && l && (i *= Math.sqrt(0.5), l *= Math.sqrt(0.5));
    const d = t.trackballX, r = t.trackballY, v = Math.cos(d) * i - Math.sin(d) * Math.cos(r) * l, w = -Math.sin(r) * l, R = -Math.sin(d) * i - Math.cos(d) * Math.cos(r) * l;
    L((m) => m + v * t.targetDiam * 0.03), B((m) => m + w * t.targetDiam * 0.03), M((m) => m + R * t.targetDiam * 0.03), requestAnimationFrame(E);
  }
  return n;
}
const S = Symbol("LookingGlassXRWebGLLayer");
class pe extends he {
  constructor(t, e, n) {
    super(t, e, n);
    const a = document.createElement("canvas");
    a.tabIndex = 0;
    const u = a.getContext("2d", { alpha: !1 });
    a.addEventListener("dblclick", function() {
      this.requestFullscreen();
    });
    const o = be(a), c = A(), s = this[de].config, k = e.createTexture();
    let x, L;
    const B = e.createFramebuffer(), M = e.enable.bind(e), p = e.disable.bind(e), E = e.getExtension("OES_vertex_array_object"), P = 34229, i = E ? E.bindVertexArrayOES.bind(E) : e.bindVertexArray.bind(e), l = () => {
      const y = e.getParameter(e.TEXTURE_BINDING_2D);
      if (e.bindTexture(e.TEXTURE_2D, k), e.texImage2D(e.TEXTURE_2D, 0, e.RGBA, c.framebufferWidth, c.framebufferHeight, 0, e.RGBA, e.UNSIGNED_BYTE, null), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.LINEAR), e.bindTexture(e.TEXTURE_2D, y), x) {
        const F = e.getParameter(e.RENDERBUFFER_BINDING);
        e.bindRenderbuffer(e.RENDERBUFFER, x), e.renderbufferStorage(e.RENDERBUFFER, L.format, c.framebufferWidth, c.framebufferHeight), e.bindRenderbuffer(e.RENDERBUFFER, F);
      }
    };
    (s.depth || s.stencil) && (s.depth && s.stencil ? L = {
      format: e.DEPTH_STENCIL,
      attachment: e.DEPTH_STENCIL_ATTACHMENT
    } : s.depth ? L = {
      format: e.DEPTH_COMPONENT16,
      attachment: e.DEPTH_ATTACHMENT
    } : s.stencil && (L = {
      format: e.STENCIL_INDEX8,
      attachment: e.STENCIL_ATTACHMENT
    }), x = e.createRenderbuffer()), l(), c.addEventListener("on-config-changed", l);
    const d = e.getParameter(e.FRAMEBUFFER_BINDING);
    e.bindFramebuffer(e.FRAMEBUFFER, B), e.framebufferTexture2D(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, k, 0), (s.depth || s.stencil) && e.framebufferRenderbuffer(e.FRAMEBUFFER, L.attachment, e.RENDERBUFFER, x), e.bindFramebuffer(e.FRAMEBUFFER, d);
    const r = e.createProgram(), v = e.createShader(e.VERTEX_SHADER);
    e.attachShader(r, v);
    const w = e.createShader(e.FRAGMENT_SHADER);
    e.attachShader(r, w);
    {
      const y = `
       attribute vec2 a_position;
       varying vec2 v_texcoord;
       void main() {
         gl_Position = vec4(a_position * 2.0 - 1.0, 0.0, 1.0);
         v_texcoord = a_position;
       }
     `;
      e.shaderSource(v, y), e.compileShader(v), e.getShaderParameter(v, e.COMPILE_STATUS) || console.warn(e.getShaderInfoLog(v));
    }
    let R, m, h;
    const V = () => {
      const y = fe(c);
      if (y === R)
        return;
      if (R = y, e.shaderSource(w, y), e.compileShader(w), !e.getShaderParameter(w, e.COMPILE_STATUS)) {
        console.warn(e.getShaderInfoLog(w));
        return;
      }
      if (e.linkProgram(r), !e.getProgramParameter(r, e.LINK_STATUS)) {
        console.warn(e.getProgramInfoLog(r));
        return;
      }
      m = e.getAttribLocation(r, "a_position"), h = e.getUniformLocation(r, "u_viewType");
      const F = e.getUniformLocation(r, "u_texture"), D = e.getParameter(e.CURRENT_PROGRAM);
      e.useProgram(r), e.uniform1i(F, 0), e.useProgram(D);
    };
    c.addEventListener("on-config-changed", V);
    const N = E ? E.createVertexArrayOES() : e.createVertexArray(), G = e.createBuffer(), f = e.getParameter(e.ARRAY_BUFFER_BINDING), T = e.getParameter(P);
    i(N), e.bindBuffer(e.ARRAY_BUFFER, G), e.bufferData(e.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), e.STATIC_DRAW), e.enableVertexAttribArray(m), e.vertexAttribPointer(m, 2, e.FLOAT, !1, 0, 0), i(T), e.bindBuffer(e.ARRAY_BUFFER, f);
    const q = () => {
      console.assert(this[S].LookingGlassEnabled), e.bindFramebuffer(e.FRAMEBUFFER, this.framebuffer);
      const y = e.getParameter(e.COLOR_CLEAR_VALUE), F = e.getParameter(e.DEPTH_CLEAR_VALUE), D = e.getParameter(e.STENCIL_CLEAR_VALUE);
      e.clearColor(0, 0, 0, 0), e.clearDepth(1), e.clearStencil(0), e.clear(e.DEPTH_BUFFER_BIT | e.COLOR_BUFFER_BIT | e.STENCIL_BUFFER_BIT), e.clearColor(y[0], y[1], y[2], y[3]), e.clearDepth(F), e.clearStencil(D);
    }, I = e.canvas;
    let H, W;
    const j = () => {
      if (!this[S].LookingGlassEnabled)
        return;
      (I.width !== c.calibration.screenW.value || I.height !== c.calibration.screenH.value) && (H = I.width, W = I.height, I.width = c.calibration.screenW.value, I.height = c.calibration.screenH.value);
      const y = e.getParameter(P), F = e.getParameter(e.CULL_FACE), D = e.getParameter(e.BLEND), K = e.getParameter(e.DEPTH_TEST), $ = e.getParameter(e.STENCIL_TEST), Z = e.getParameter(e.SCISSOR_TEST), J = e.getParameter(e.VIEWPORT), Q = e.getParameter(e.FRAMEBUFFER_BINDING), ee = e.getParameter(e.RENDERBUFFER_BINDING), te = e.getParameter(e.CURRENT_PROGRAM), ie = e.getParameter(e.ACTIVE_TEXTURE);
      {
        const ne = e.getParameter(e.TEXTURE_BINDING_2D);
        e.bindFramebuffer(e.FRAMEBUFFER, null), e.useProgram(r), i(N), e.activeTexture(e.TEXTURE0), e.bindTexture(e.TEXTURE_2D, k), e.disable(e.BLEND), e.disable(e.CULL_FACE), e.disable(e.DEPTH_TEST), e.disable(e.STENCIL_TEST), e.viewport(0, 0, e.drawingBufferWidth, e.drawingBufferHeight), e.uniform1i(h, 0), e.drawArrays(e.TRIANGLES, 0, 6), u == null || u.clearRect(0, 0, a.width, a.height), u == null || u.drawImage(I, 0, 0), c.inlineView !== 0 && (e.uniform1i(h, c.inlineView), e.drawArrays(e.TRIANGLES, 0, 6)), e.bindTexture(e.TEXTURE_2D, ne);
      }
      e.activeTexture(ie), e.useProgram(te), e.bindRenderbuffer(e.RENDERBUFFER, ee), e.bindFramebuffer(e.FRAMEBUFFER, Q), e.viewport(...J), (Z ? M : p)(e.SCISSOR_TEST), ($ ? M : p)(e.STENCIL_TEST), (K ? M : p)(e.DEPTH_TEST), (D ? M : p)(e.BLEND), (F ? M : p)(e.CULL_FACE), i(y);
    };
    let _;
    window.addEventListener("unload", () => {
      _ && _.close(), _ = void 0;
    });
    const z = (y, F) => {
      var D;
      !!_ != y && (y ? (V(), a.style.position = "fixed", a.style.top = "0", a.style.left = "0", a.style.width = "100%", a.style.height = "100%", a.width = c.calibration.screenW.value, a.height = c.calibration.screenH.value, document.body.appendChild(o), _ = window.open("", void 0, "width=640,height=360"), _.document.title = "Looking Glass Window (fullscreen me on Looking Glass!)", _.document.body.style.background = "black", _.document.body.appendChild(a), console.assert(F), _.onbeforeunload = F) : ((D = o.parentElement) == null || D.removeChild(o), I.width = H, I.height = W, _.onbeforeunload = void 0, _.close(), _ = void 0));
    };
    this[S] = {
      LookingGlassEnabled: !1,
      framebuffer: B,
      clearFramebuffer: q,
      blitTextureToDefaultFramebufferIfNeeded: j,
      moveCanvasToWindow: z
    };
  }
  get framebuffer() {
    return this[S].LookingGlassEnabled ? this[S].framebuffer : null;
  }
  get framebufferWidth() {
    return A().framebufferWidth;
  }
  get framebufferHeight() {
    return A().framebufferHeight;
  }
}
class ve extends ce {
  constructor(t) {
    super(t), this.sessions = /* @__PURE__ */ new Map(), this.viewSpaces = [], this.basePoseMatrix = g.create(), this.inlineProjectionMatrix = g.create(), this.inlineInverseViewMatrix = g.create(), this.LookingGlassProjectionMatrices = [], this.LookingGlassInverseViewMatrices = [];
  }
  onBaseLayerSet(t, e) {
    const n = this.sessions.get(t);
    n.baseLayer = e;
    const a = e[S];
    a.LookingGlassEnabled = n.immersive, n.immersive && a.moveCanvasToWindow(!0, () => {
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
    const n = t !== "inline", a = new Ee(t, e);
    return this.sessions.set(a.id, a), n && this.dispatchEvent("@@webxr-polyfill/vr-present-start", a.id), Promise.resolve(a.id);
  }
  requestAnimationFrame(t) {
    return this.global.requestAnimationFrame(t);
  }
  cancelAnimationFrame(t) {
    this.global.cancelAnimationFrame(t);
  }
  onFrameStart(t, e) {
    const n = this.sessions.get(t), a = A();
    if (n.immersive) {
      const u = Math.tan(0.5 * a.fovy), o = 0.5 * a.targetDiam / u, c = o - a.targetDiam, s = this.basePoseMatrix;
      g.fromTranslation(s, [a.targetX, a.targetY, a.targetZ]), g.rotate(s, s, a.trackballX, [0, 1, 0]), g.rotate(s, s, -a.trackballY, [1, 0, 0]), g.translate(s, s, [0, 0, o]);
      for (let x = 0; x < a.numViews; ++x) {
        const L = (x + 0.5) / a.numViews - 0.5, B = Math.tan(a.viewCone * L), M = o * B, p = this.LookingGlassInverseViewMatrices[x] = this.LookingGlassInverseViewMatrices[x] || g.create();
        g.translate(p, s, [M, 0, 0]), g.invert(p, p);
        const E = Math.max(c + e.depthNear, 0.01), P = c + e.depthFar, i = E * u, l = i, d = -i, r = E * -B, v = a.aspect * i, w = r + v, R = r - v, m = this.LookingGlassProjectionMatrices[x] = this.LookingGlassProjectionMatrices[x] || g.create();
        g.set(m, 2 * E / (w - R), 0, 0, 0, 0, 2 * E / (l - d), 0, 0, (w + R) / (w - R), (l + d) / (l - d), -(P + E) / (P - E), -1, 0, 0, -2 * P * E / (P - E), 0);
      }
      n.baseLayer[S].clearFramebuffer();
    } else {
      const u = n.baseLayer.context, o = u.drawingBufferWidth / u.drawingBufferHeight;
      g.perspective(this.inlineProjectionMatrix, e.inlineVerticalFieldOfView, o, e.depthNear, e.depthFar), g.fromTranslation(this.basePoseMatrix, [0, U, 0]), g.invert(this.inlineInverseViewMatrix, this.basePoseMatrix);
    }
  }
  onFrameEnd(t) {
    this.sessions.get(t).baseLayer[S].blitTextureToDefaultFramebufferIfNeeded();
  }
  async requestFrameOfReferenceTransform(t, e) {
    const n = g.create();
    switch (t) {
      case "viewer":
      case "local":
        return g.fromTranslation(n, [0, -U, 0]), n;
      case "local-floor":
        return n;
      default:
        throw new Error("XRReferenceSpaceType not understood");
    }
  }
  endSession(t) {
    const e = this.sessions.get(t);
    e.immersive && e.baseLayer && (e.baseLayer[S].moveCanvasToWindow(!1), this.dispatchEvent("@@webxr-polyfill/vr-present-end", t)), e.ended = !0;
  }
  doesSessionSupportReferenceSpace(t, e) {
    const n = this.sessions.get(t);
    return n.ended ? !1 : n.enabledFeatures.has(e);
  }
  getViewSpaces(t) {
    if (t === "immersive-vr") {
      const e = A();
      for (let n = this.viewSpaces.length; n < e.numViews; ++n)
        this.viewSpaces[n] = new ye(n);
      return this.viewSpaces.length = e.numViews, this.viewSpaces;
    }
  }
  getViewport(t, e, n, a, u) {
    if (u === void 0) {
      const c = this.sessions.get(t).baseLayer.context;
      a.x = 0, a.y = 0, a.width = c.drawingBufferWidth, a.height = c.drawingBufferHeight;
    } else {
      const o = A(), c = u % o.quiltWidth, s = Math.floor(u / o.quiltWidth);
      a.x = o.tileWidth * c, a.y = o.tileHeight * s, a.width = o.tileWidth, a.height = o.tileHeight;
    }
    return !0;
  }
  getProjectionMatrix(t, e) {
    return e === void 0 ? this.inlineProjectionMatrix : this.LookingGlassProjectionMatrices[e] || g.create();
  }
  getBasePoseMatrix() {
    return this.basePoseMatrix;
  }
  getBaseViewMatrix() {
    return this.inlineInverseViewMatrix;
  }
  _getViewMatrixByIndex(t) {
    return this.LookingGlassInverseViewMatrices[t] = this.LookingGlassInverseViewMatrices[t] || g.create();
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
let ge = 0;
class Ee {
  constructor(t, e) {
    C(this, "mode");
    C(this, "immersive");
    C(this, "id");
    C(this, "baseLayer");
    C(this, "inlineVerticalFieldOfView");
    C(this, "ended");
    C(this, "enabledFeatures");
    this.mode = t, this.immersive = t === "immersive-vr" || t === "immersive-ar", this.id = ++ge, this.baseLayer = null, this.inlineVerticalFieldOfView = Math.PI * 0.5, this.ended = !1, this.enabledFeatures = e;
  }
}
class ye extends le {
  constructor(e) {
    super();
    C(this, "viewIndex");
    this.viewIndex = e;
  }
  get eye() {
    return "none";
  }
  _onPoseUpdate(e) {
    this._inverseBaseMatrix = e._getViewMatrixByIndex(this.viewIndex);
  }
}
class Ie extends se {
  constructor(e) {
    super();
    C(this, "vrButton");
    C(this, "device");
    C(this, "isPresenting", !1);
    Y(e), this.overrideDefaultVRButton(), console.warn('Looking Glass WebXR "polyfill" overriding native WebXR API.');
    for (const n in O)
      this.global[n] = O[n];
    this.global.XRWebGLLayer = pe, this.injected = !0, this.device = new ve(this.global), this.xr = new oe(Promise.resolve(this.device)), Object.defineProperty(this.global.navigator, "xr", {
      value: this.xr,
      configurable: !0
    });
  }
  async overrideDefaultVRButton() {
    this.vrButton = await we("VRButton"), this.vrButton && (this.device.addEventListener("@@webxr-polyfill/vr-present-start", () => {
      this.isPresenting = !0, this.updateVRButtonUI();
    }), this.device.addEventListener("@@webxr-polyfill/vr-present-end", () => {
      this.isPresenting = !1, this.updateVRButtonUI();
    }), this.vrButton.addEventListener("click", (e) => {
      this.updateVRButtonUI();
    }), this.updateVRButtonUI());
  }
  updateVRButtonUI() {
    if (this.vrButton) {
      this.isPresenting ? this.vrButton.innerHTML = "EXIT LOOKING GLASS" : this.vrButton.innerHTML = "ENTER LOOKING GLASS";
      const e = 220;
      this.vrButton.style.width = `${e}px`, this.vrButton.style.left = `calc(50% - ${e / 2}px)`;
    }
  }
  update(e) {
    Y(e);
  }
}
async function we(b) {
  return new Promise((t, e) => {
    const n = new MutationObserver(function(a) {
      a.forEach(function(u) {
        u.addedNodes.forEach(function(o) {
          const c = o;
          c.id == b && (t(c), n.disconnect());
        });
      });
    });
    n.observe(document.body, { subtree: !1, childList: !0 }), setTimeout(() => {
      n.disconnect(), e(`id:${b} not found`);
    }, 5e3);
  });
}
const Se = A();
export {
  Se as LookingGlassConfig,
  Ie as LookingGlassWebXRPolyfill
};
