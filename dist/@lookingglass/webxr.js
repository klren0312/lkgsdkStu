var oe = Object.defineProperty;
var ce = (o, t, e) => t in o ? oe(o, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : o[t] = e;
var x = (o, t, e) => (ce(o, typeof t != "symbol" ? t + "" : t, e), e);
import z from "@lookingglass/webxr-polyfill/src/api/index";
import le from "@lookingglass/webxr-polyfill/src/api/XRSystem";
import de from "@lookingglass/webxr-polyfill/src/WebXRPolyfill";
import * as $ from "holoplay-core";
import { Shader as he } from "holoplay-core";
import ue from "@lookingglass/webxr-polyfill/src/devices/XRDevice";
import fe from "@lookingglass/webxr-polyfill/src/api/XRSpace";
import { mat4 as w } from "gl-matrix";
import me, { PRIVATE as be } from "@lookingglass/webxr-polyfill/src/api/XRWebGLLayer";
const X = 1.6;
var H;
(function(o) {
  o[o.Swizzled = 0] = "Swizzled", o[o.Center = 1] = "Center", o[o.Quilt = 2] = "Quilt";
})(H || (H = {}));
class pe extends EventTarget {
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
      targetY: X,
      targetZ: -0.5,
      targetDiam: 2,
      fovy: 13 / 180 * Math.PI,
      depthiness: 1.25,
      inlineView: H.Center
    });
    x(this, "LookingGlassDetected");
    this._viewControls = { ...this._viewControls, ...e }, this.syncCalibration();
  }
  syncCalibration() {
    new $.Client((e) => {
      if (e.devices.length < 1) {
        console.log("No Looking Glass devices found");
        return;
      }
      e.devices.length > 1 && console.log("More than one Looking Glass device found... using the first one"), this.calibration = e.devices[0].calibration;
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
let U = null;
function A() {
  return U == null && (U = new pe()), U;
}
function K(o) {
  const t = A();
  o != null && t.updateViewControls(o);
}
function ve(o) {
  var _;
  const t = A(), e = document.createElement("style");
  document.head.appendChild(e), (_ = e.sheet) == null || _.insertRule("#LookingGlassWebXRControls * { all: revert; font-family: sans-serif }");
  const n = document.createElement("div");
  n.id = "LookingGlassWebXRControls", n.style.position = "fixed", n.style.zIndex = "1000", n.style.padding = "15px", n.style.width = "320px", n.style.maxWidth = "calc(100vw - 18px)", n.style.maxHeight = "calc(100vh - 18px)", n.style.whiteSpace = "nowrap", n.style.background = "rgba(0, 0, 0, 0.6)", n.style.color = "white", n.style.borderRadius = "10px", n.style.right = "15px", n.style.bottom = "15px";
  const a = document.createElement("div");
  n.appendChild(a), a.style.width = "100%", a.style.textAlign = "center", a.style.fontWeight = "bold", a.innerText = "Looking Glass Controls ";
  const r = document.createElement("div");
  n.appendChild(r), r.style.width = "100%", r.style.whiteSpace = "normal", r.style.color = "rgba(255,255,255,0.7)", r.style.fontSize = "14px", r.style.margin = "5px 0", r.innerHTML = "Click the popup and use WASD, mouse left/right drag, and scroll.";
  const c = document.createElement("input");
  a.appendChild(c), c.type = "button", c.value = "\u2190", c.dataset.otherValue = "\u2192", c.onclick = () => {
    [n.style.right, n.style.left] = [n.style.left, n.style.right], [c.value, c.dataset.otherValue] = [c.dataset.otherValue || "", c.value];
  };
  const s = document.createElement("div");
  n.appendChild(s);
  const d = (i, h, f) => {
    const l = f.stringify, v = document.createElement("div");
    v.style.marginBottom = "8px", s.appendChild(v);
    const g = i, T = t[i], b = document.createElement("label");
    if (v.appendChild(b), b.innerText = f.label, b.setAttribute("for", g), b.style.width = "100px", b.style.display = "inline-block", b.style.textDecoration = "dotted underline 1px", b.style.fontFamily = '"Courier New"', b.style.fontSize = "13px", b.style.fontWeight = "bold", b.title = f.title, h.type !== "checkbox") {
      const m = document.createElement("input");
      v.appendChild(m), m.type = "button", m.value = "\u238C", m.alt = "reset", m.title = "Reset value to default", m.style.padding = "0 4px", m.onclick = (L) => {
        u.value = T, u.oninput(L);
      };
    }
    const u = document.createElement("input");
    v.appendChild(u), Object.assign(u, h), u.id = g, u.title = f.title, u.value = h.value !== void 0 ? h.value : T;
    const k = (m) => {
      t[i] = m, N(m);
    };
    u.oninput = () => {
      const m = h.type === "range" ? parseFloat(u.value) : h.type === "checkbox" ? u.checked : u.value;
      k(m);
    };
    const G = (m) => {
      let L = m(t[i]);
      f.fixRange && (L = f.fixRange(L), u.max = Math.max(parseFloat(u.max), L).toString(), u.min = Math.min(parseFloat(u.min), L).toString()), u.value = L, k(L);
    };
    h.type === "range" && (u.style.width = "110px", u.style.height = "8px", u.onwheel = (m) => {
      G((L) => L + Math.sign(m.deltaX - m.deltaY) * h.step);
    });
    let N = (m) => {
    };
    if (l) {
      const m = document.createElement("span");
      m.style.fontFamily = '"Courier New"', m.style.fontSize = "13px", m.style.marginLeft = "3px", v.appendChild(m), N = (L) => {
        m.innerHTML = l(L);
      }, N(T);
    }
    return G;
  };
  d("tileHeight", { type: "range", min: 160, max: 455, step: 1 }, {
    label: "resolution",
    title: "resolution of each view",
    stringify: (i) => `${(i * t.aspect).toFixed()}&times;${i.toFixed()}`
  }), d("numViews", { type: "range", min: 1, max: 145, step: 1 }, {
    label: "views",
    title: "number of different viewing angles to render",
    stringify: (i) => i.toFixed()
  });
  const B = d("trackballX", {
    type: "range",
    min: -Math.PI,
    max: 1.0001 * Math.PI,
    step: 0.5 / 180 * Math.PI
  }, {
    label: "trackball x",
    title: "camera trackball x",
    fixRange: (i) => (i + Math.PI * 3) % (Math.PI * 2) - Math.PI,
    stringify: (i) => `${(i / Math.PI * 180).toFixed()}&deg;`
  }), R = d("trackballY", {
    type: "range",
    min: -0.5 * Math.PI,
    max: 0.5001 * Math.PI,
    step: 1 / 180 * Math.PI
  }, {
    label: "trackball y",
    title: "camera trackball y",
    fixRange: (i) => Math.max(-0.5 * Math.PI, Math.min(i, 0.5 * Math.PI)),
    stringify: (i) => `${(i / Math.PI * 180).toFixed()}&deg;`
  }), P = d("targetX", { type: "range", min: -20, max: 20, step: 0.1 }, {
    label: "target x",
    title: "target position x",
    fixRange: (i) => i,
    stringify: (i) => i.toFixed(2) + " m"
  }), D = d("targetY", { type: "range", min: -20, max: 20, step: 0.1 }, {
    label: "target y",
    title: "target position y",
    fixRange: (i) => i,
    stringify: (i) => i.toFixed(2) + " m"
  }), C = d("targetZ", { type: "range", min: -20, max: 20, step: 0.1 }, {
    label: "target z",
    title: "target position z",
    fixRange: (i) => i,
    stringify: (i) => i.toFixed(2) + " m"
  });
  d("fovy", {
    type: "range",
    min: 1 / 180 * Math.PI,
    max: 120.1 / 180 * Math.PI,
    step: 1 / 180 * Math.PI
  }, {
    label: "fov",
    title: "perspective fov (degrades stereo effect)",
    fixRange: (i) => Math.max(1 / 180 * Math.PI, Math.min(i, 120.1 / 180 * Math.PI)),
    stringify: (i) => {
      const h = i / Math.PI * 180, f = Math.atan(Math.tan(i / 2) * t.aspect) * 2 / Math.PI * 180;
      return `${h.toFixed()}&deg;&times;${f.toFixed()}&deg;`;
    }
  }), d("depthiness", { type: "range", min: 0, max: 2, step: 0.01 }, {
    label: "depthiness",
    title: 'exaggerates depth by multiplying the width of the view cone (as reported by the firmware) - can somewhat compensate for depthiness lost using higher fov. 1.25 seems to be most physically accurate on Looking Glass 8.9".',
    fixRange: (i) => Math.max(0, i),
    stringify: (i) => `${i.toFixed(2)}x`
  }), d("inlineView", { type: "range", min: 0, max: 2, step: 1 }, {
    label: "inline view",
    title: "what to show inline on the original canvas (swizzled = no overwrite)",
    fixRange: (i) => Math.max(0, Math.min(i, 2)),
    stringify: (i) => i === 0 ? "swizzled" : i === 1 ? "center" : i === 2 ? "quilt" : "?"
  }), o.oncontextmenu = (i) => {
    i.preventDefault();
  }, o.addEventListener("wheel", (i) => {
    const h = t.targetDiam, f = 1.1, l = Math.log(h) / Math.log(f);
    return t.targetDiam = Math.pow(f, l + i.deltaY * 0.01);
  }), o.addEventListener("mousemove", (i) => {
    const h = i.movementX, f = -i.movementY;
    if (i.buttons & 2 || i.buttons & 1 && (i.shiftKey || i.ctrlKey)) {
      const l = t.trackballX, v = t.trackballY, g = -Math.cos(l) * h + Math.sin(l) * Math.sin(v) * f, T = -Math.cos(v) * f, b = Math.sin(l) * h + Math.cos(l) * Math.sin(v) * f;
      P((u) => u + g * t.targetDiam * 1e-3), D((u) => u + T * t.targetDiam * 1e-3), C((u) => u + b * t.targetDiam * 1e-3);
    } else
      i.buttons & 1 && (B((l) => l - h * 0.01), R((l) => l - f * 0.01));
  });
  const p = { w: 0, a: 0, s: 0, d: 0 };
  o.addEventListener("keydown", (i) => {
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
  }), o.addEventListener("keyup", (i) => {
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
    let i = p.d - p.a, h = p.w - p.s;
    i && h && (i *= Math.sqrt(0.5), h *= Math.sqrt(0.5));
    const f = t.trackballX, l = t.trackballY, v = Math.cos(f) * i - Math.sin(f) * Math.cos(l) * h, g = -Math.sin(l) * h, T = -Math.sin(f) * i - Math.cos(f) * Math.cos(l) * h;
    P((b) => b + v * t.targetDiam * 0.03), D((b) => b + g * t.targetDiam * 0.03), C((b) => b + T * t.targetDiam * 0.03), requestAnimationFrame(E);
  }
  return n;
}
const I = Symbol("LookingGlassXRWebGLLayer");
class we extends me {
  constructor(t, e, n) {
    super(t, e, n);
    const a = document.createElement("canvas");
    a.tabIndex = 0;
    const r = a.getContext("2d", { alpha: !1 });
    a.addEventListener("dblclick", function() {
      this.requestFullscreen();
    });
    const c = ve(a), s = A(), d = this[be].config, B = e.createTexture();
    let R, P;
    const D = e.createFramebuffer(), C = e.enable.bind(e), p = e.disable.bind(e), E = e.getExtension("OES_vertex_array_object"), _ = 34229, i = E ? E.bindVertexArrayOES.bind(E) : e.bindVertexArray.bind(e), h = () => {
      const y = e.getParameter(e.TEXTURE_BINDING_2D);
      if (e.bindTexture(e.TEXTURE_2D, B), e.texImage2D(e.TEXTURE_2D, 0, e.RGBA, s.framebufferWidth, s.framebufferHeight, 0, e.RGBA, e.UNSIGNED_BYTE, null), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.LINEAR), e.bindTexture(e.TEXTURE_2D, y), R) {
        const F = e.getParameter(e.RENDERBUFFER_BINDING);
        e.bindRenderbuffer(e.RENDERBUFFER, R), e.renderbufferStorage(e.RENDERBUFFER, P.format, s.framebufferWidth, s.framebufferHeight), e.bindRenderbuffer(e.RENDERBUFFER, F);
      }
    };
    (d.depth || d.stencil) && (d.depth && d.stencil ? P = {
      format: e.DEPTH_STENCIL,
      attachment: e.DEPTH_STENCIL_ATTACHMENT
    } : d.depth ? P = {
      format: e.DEPTH_COMPONENT16,
      attachment: e.DEPTH_ATTACHMENT
    } : d.stencil && (P = {
      format: e.STENCIL_INDEX8,
      attachment: e.STENCIL_ATTACHMENT
    }), R = e.createRenderbuffer()), h(), s.addEventListener("on-config-changed", h);
    const f = e.getParameter(e.FRAMEBUFFER_BINDING);
    e.bindFramebuffer(e.FRAMEBUFFER, D), e.framebufferTexture2D(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, B, 0), (d.depth || d.stencil) && e.framebufferRenderbuffer(e.FRAMEBUFFER, P.attachment, e.RENDERBUFFER, R), e.bindFramebuffer(e.FRAMEBUFFER, f);
    const l = e.createProgram(), v = e.createShader(e.VERTEX_SHADER);
    e.attachShader(l, v);
    const g = e.createShader(e.FRAGMENT_SHADER);
    e.attachShader(l, g);
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
    let T, b, u;
    const k = () => {
      const y = he(s);
      if (y === T)
        return;
      if (T = y, e.shaderSource(g, y), e.compileShader(g), !e.getShaderParameter(g, e.COMPILE_STATUS)) {
        console.warn(e.getShaderInfoLog(g));
        return;
      }
      if (e.linkProgram(l), !e.getProgramParameter(l, e.LINK_STATUS)) {
        console.warn(e.getProgramInfoLog(l));
        return;
      }
      b = e.getAttribLocation(l, "a_position"), u = e.getUniformLocation(l, "u_viewType");
      const F = e.getUniformLocation(l, "u_texture"), V = e.getParameter(e.CURRENT_PROGRAM);
      e.useProgram(l), e.uniform1i(F, 0), e.useProgram(V);
    };
    s.addEventListener("on-config-changed", k);
    const G = E ? E.createVertexArrayOES() : e.createVertexArray(), N = e.createBuffer(), m = e.getParameter(e.ARRAY_BUFFER_BINDING), L = e.getParameter(_);
    i(G), e.bindBuffer(e.ARRAY_BUFFER, N), e.bufferData(e.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), e.STATIC_DRAW), e.enableVertexAttribArray(b), e.vertexAttribPointer(b, 2, e.FLOAT, !1, 0, 0), i(L), e.bindBuffer(e.ARRAY_BUFFER, m);
    const j = () => {
      console.assert(this[I].LookingGlassEnabled), e.bindFramebuffer(e.FRAMEBUFFER, this.framebuffer);
      const y = e.getParameter(e.COLOR_CLEAR_VALUE), F = e.getParameter(e.DEPTH_CLEAR_VALUE), V = e.getParameter(e.STENCIL_CLEAR_VALUE);
      e.clearColor(0, 0, 0, 0), e.clearDepth(1), e.clearStencil(0), e.clear(e.DEPTH_BUFFER_BIT | e.COLOR_BUFFER_BIT | e.STENCIL_BUFFER_BIT), e.clearColor(y[0], y[1], y[2], y[3]), e.clearDepth(F), e.clearStencil(V);
    }, S = e.canvas;
    let O, Y;
    const Z = () => {
      if (!this[I].LookingGlassEnabled)
        return;
      (S.width !== s.calibration.screenW.value || S.height !== s.calibration.screenH.value) && (O = S.width, Y = S.height, S.width = s.calibration.screenW.value, S.height = s.calibration.screenH.value);
      const y = e.getParameter(_), F = e.getParameter(e.CULL_FACE), V = e.getParameter(e.BLEND), q = e.getParameter(e.DEPTH_TEST), J = e.getParameter(e.STENCIL_TEST), ee = e.getParameter(e.SCISSOR_TEST), te = e.getParameter(e.VIEWPORT), ie = e.getParameter(e.FRAMEBUFFER_BINDING), ne = e.getParameter(e.RENDERBUFFER_BINDING), ae = e.getParameter(e.CURRENT_PROGRAM), re = e.getParameter(e.ACTIVE_TEXTURE);
      {
        const se = e.getParameter(e.TEXTURE_BINDING_2D);
        e.bindFramebuffer(e.FRAMEBUFFER, null), e.useProgram(l), i(G), e.activeTexture(e.TEXTURE0), e.bindTexture(e.TEXTURE_2D, B), e.disable(e.BLEND), e.disable(e.CULL_FACE), e.disable(e.DEPTH_TEST), e.disable(e.STENCIL_TEST), e.viewport(0, 0, e.drawingBufferWidth, e.drawingBufferHeight), e.uniform1i(u, 0), e.drawArrays(e.TRIANGLES, 0, 6), r == null || r.clearRect(0, 0, a.width, a.height), r == null || r.drawImage(S, 0, 0), s.inlineView !== 0 && (e.uniform1i(u, s.inlineView), e.drawArrays(e.TRIANGLES, 0, 6)), e.bindTexture(e.TEXTURE_2D, se);
      }
      e.activeTexture(re), e.useProgram(ae), e.bindRenderbuffer(e.RENDERBUFFER, ne), e.bindFramebuffer(e.FRAMEBUFFER, ie), e.viewport(...te), (ee ? C : p)(e.SCISSOR_TEST), (J ? C : p)(e.STENCIL_TEST), (q ? C : p)(e.DEPTH_TEST), (V ? C : p)(e.BLEND), (F ? C : p)(e.CULL_FACE), i(y);
    };
    let M;
    window.addEventListener("unload", () => {
      M && M.close(), M = void 0;
    });
    const Q = (y, F) => {
      var V;
      !!M != y && (y ? (k(), a.style.position = "fixed", a.style.top = "0", a.style.left = "0", a.style.width = "100%", a.style.height = "100%", a.width = s.calibration.screenW.value, a.height = s.calibration.screenH.value, document.body.appendChild(c), "getScreenDetails" in window ? this.placeWindow(M, a, s) : (M = window.open("", void 0, "width=640,height=360"), M.document.title = "Looking Glass Window (fullscreen me on Looking Glass!)", M.document.body.style.background = "black", M.document.body.appendChild(a), console.assert(F), M.onbeforeunload = F)) : ((V = c.parentElement) == null || V.removeChild(c), S.width = O, S.height = Y, M.onbeforeunload = void 0, M.close(), M = void 0));
    };
    this[I] = {
      LookingGlassEnabled: !1,
      framebuffer: D,
      clearFramebuffer: j,
      blitTextureToDefaultFramebufferIfNeeded: Z,
      moveCanvasToWindow: Q
    };
  }
  async placeWindow(t, e, n) {
    const a = await window.getScreenDetails();
    console.log(a, "cached screen details");
    const r = a.screens.filter((s) => s.label.includes("LKG"))[0];
    console.log(r), console.log("monitor ID", r.label, "serial number", n._calibration.serial);
    const c = [
      `left=${r.left}`,
      `top=${r.top}`,
      `width=${r.width}`,
      `height=${r.height}`,
      "menubar=no",
      "toolbar=no",
      "location=no",
      "status=no",
      "resizable=yes",
      "scrollbars=no",
      "fullscreenEnabled=true"
    ].join(",");
    t = window.open("", "new", c), console.log(t), t.document.body.style.background = "black", t.document.body.appendChild(e), await e.requestFullscreen();
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
class Ee extends ue {
  constructor(t) {
    super(t), this.sessions = /* @__PURE__ */ new Map(), this.viewSpaces = [], this.basePoseMatrix = w.create(), this.inlineProjectionMatrix = w.create(), this.inlineInverseViewMatrix = w.create(), this.LookingGlassProjectionMatrices = [], this.LookingGlassInverseViewMatrices = [];
  }
  onBaseLayerSet(t, e) {
    const n = this.sessions.get(t);
    n.baseLayer = e;
    const a = e[I];
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
    const n = t !== "inline", a = new ge(t, e);
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
      const r = Math.tan(0.5 * a.fovy), c = 0.5 * a.targetDiam / r, s = c - a.targetDiam, d = this.basePoseMatrix;
      w.fromTranslation(d, [a.targetX, a.targetY, a.targetZ]), w.rotate(d, d, a.trackballX, [0, 1, 0]), w.rotate(d, d, -a.trackballY, [1, 0, 0]), w.translate(d, d, [0, 0, c]);
      for (let R = 0; R < a.numViews; ++R) {
        const P = (R + 0.5) / a.numViews - 0.5, D = Math.tan(a.viewCone * P), C = c * D, p = this.LookingGlassInverseViewMatrices[R] = this.LookingGlassInverseViewMatrices[R] || w.create();
        w.translate(p, d, [C, 0, 0]), w.invert(p, p);
        const E = Math.max(s + e.depthNear, 0.01), _ = s + e.depthFar, i = E * r, h = i, f = -i, l = E * -D, v = a.aspect * i, g = l + v, T = l - v, b = this.LookingGlassProjectionMatrices[R] = this.LookingGlassProjectionMatrices[R] || w.create();
        w.set(b, 2 * E / (g - T), 0, 0, 0, 0, 2 * E / (h - f), 0, 0, (g + T) / (g - T), (h + f) / (h - f), -(_ + E) / (_ - E), -1, 0, 0, -2 * _ * E / (_ - E), 0);
      }
      n.baseLayer[I].clearFramebuffer();
    } else {
      const r = n.baseLayer.context, c = r.drawingBufferWidth / r.drawingBufferHeight;
      w.perspective(this.inlineProjectionMatrix, e.inlineVerticalFieldOfView, c, e.depthNear, e.depthFar), w.fromTranslation(this.basePoseMatrix, [0, X, 0]), w.invert(this.inlineInverseViewMatrix, this.basePoseMatrix);
    }
  }
  onFrameEnd(t) {
    this.sessions.get(t).baseLayer[I].blitTextureToDefaultFramebufferIfNeeded();
  }
  async requestFrameOfReferenceTransform(t, e) {
    const n = w.create();
    switch (t) {
      case "viewer":
      case "local":
        return w.fromTranslation(n, [0, -X, 0]), n;
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
        this.viewSpaces[n] = new xe(n);
      return this.viewSpaces.length = e.numViews, this.viewSpaces;
    }
  }
  getViewport(t, e, n, a, r) {
    if (r === void 0) {
      const s = this.sessions.get(t).baseLayer.context;
      a.x = 0, a.y = 0, a.width = s.drawingBufferWidth, a.height = s.drawingBufferHeight;
    } else {
      const c = A(), s = r % c.quiltWidth, d = Math.floor(r / c.quiltWidth);
      a.x = c.tileWidth * s, a.y = c.tileHeight * d, a.width = c.tileWidth, a.height = c.tileHeight;
    }
    return !0;
  }
  getProjectionMatrix(t, e) {
    return e === void 0 ? this.inlineProjectionMatrix : this.LookingGlassProjectionMatrices[e] || w.create();
  }
  getBasePoseMatrix() {
    return this.basePoseMatrix;
  }
  getBaseViewMatrix() {
    return this.inlineInverseViewMatrix;
  }
  _getViewMatrixByIndex(t) {
    return this.LookingGlassInverseViewMatrices[t] = this.LookingGlassInverseViewMatrices[t] || w.create();
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
class ge {
  constructor(t, e) {
    x(this, "mode");
    x(this, "immersive");
    x(this, "id");
    x(this, "baseLayer");
    x(this, "inlineVerticalFieldOfView");
    x(this, "ended");
    x(this, "enabledFeatures");
    this.mode = t, this.immersive = t === "immersive-vr" || t === "immersive-ar", this.id = ++ye, this.baseLayer = null, this.inlineVerticalFieldOfView = Math.PI * 0.5, this.ended = !1, this.enabledFeatures = e;
  }
}
class xe extends fe {
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
class W extends de {
  constructor(e) {
    super();
    x(this, "vrButton");
    x(this, "device");
    x(this, "isPresenting", !1);
    K(e), this.loadPolyfill();
  }
  static async init(e) {
    await W.detectLookingGlassDevice() && new W(e);
  }
  static async detectLookingGlassDevice() {
    return new Promise((e) => {
      new $.Client(async (n) => {
        console.log(n, "message from core"), n.devices.length > 0 ? e(!0) : e(!1);
      });
    });
  }
  async loadPolyfill() {
    this.overrideDefaultVRButton(), console.warn('Looking Glass WebXR "polyfill" overriding native WebXR API.');
    for (const e in z)
      this.global[e] = z[e];
    this.global.XRWebGLLayer = we, this.injected = !0, this.device = new Ee(this.global), this.xr = new le(Promise.resolve(this.device)), Object.defineProperty(this.global.navigator, "xr", {
      value: this.xr,
      configurable: !0
    });
  }
  async overrideDefaultVRButton() {
    this.vrButton = await Re("VRButton"), this.vrButton && this.device && (this.device.addEventListener("@@webxr-polyfill/vr-present-start", () => {
      this.isPresenting = !0, this.updateVRButtonUI();
    }), this.device.addEventListener("@@webxr-polyfill/vr-present-end", () => {
      this.isPresenting = !1, this.updateVRButtonUI();
    }), this.vrButton.addEventListener("click", (e) => {
      this.updateVRButtonUI();
    }), this.updateVRButtonUI());
  }
  async updateVRButtonUI() {
    if (this.vrButton) {
      await Te(100), this.isPresenting ? this.vrButton.innerHTML = "EXIT LOOKING GLASS" : this.vrButton.innerHTML = "ENTER LOOKING GLASS";
      const e = 220;
      this.vrButton.style.width = `${e}px`, this.vrButton.style.left = `calc(50% - ${e / 2}px)`;
    }
  }
  update(e) {
    K(e);
  }
}
async function Re(o) {
  return new Promise((t, e) => {
    const n = new MutationObserver(function(a) {
      a.forEach(function(r) {
        r.addedNodes.forEach(function(c) {
          const s = c;
          s.id == o && (t(s), n.disconnect());
        });
      });
    });
    n.observe(document.body, { subtree: !1, childList: !0 }), setTimeout(() => {
      n.disconnect(), e(`id:${o} not found`);
    }, 5e3);
  });
}
function Te(o) {
  return new Promise((t) => setTimeout(t, o));
}
const De = A();
export {
  De as LookingGlassConfig,
  W as LookingGlassWebXRPolyfill
};
