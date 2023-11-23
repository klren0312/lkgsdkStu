var ce = Object.defineProperty;
var ue = (n, i, e) => i in n ? ce(n, i, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[i] = e;
var E = (n, i, e) => (ue(n, typeof i != "symbol" ? i + "" : i, e), e);
import q from "@lookingglass/webxr-polyfill/src/api/index";
import de from "@lookingglass/webxr-polyfill/src/api/XRSystem";
import he from "@lookingglass/webxr-polyfill/src/WebXRPolyfill";
import * as fe from "holoplay-core";
import { Shader as X } from "holoplay-core";
import pe from "@lookingglass/webxr-polyfill/src/devices/XRDevice";
import me from "@lookingglass/webxr-polyfill/src/api/XRSpace";
import { mat4 as L } from "gl-matrix";
import be, { PRIVATE as ve } from "@lookingglass/webxr-polyfill/src/api/XRWebGLLayer";
const H = 1.6;
var O;
(function(n) {
  n[n.Swizzled = 0] = "Swizzled", n[n.Center = 1] = "Center", n[n.Quilt = 2] = "Quilt";
})(O || (O = {}));
class we extends EventTarget {
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
      numViews: 48,
      trackballX: 0,
      trackballY: 0,
      targetX: 0,
      targetY: H,
      targetZ: -0.5,
      targetDiam: 2,
      fovy: 13 / 180 * Math.PI,
      depthiness: 1.25,
      inlineView: O.Center,
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
    new fe.Client((e) => {
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
let U = null;
function _() {
  return U == null && (U = new we()), U;
}
function z(n) {
  const i = _();
  n != null && i.updateViewControls(n);
}
async function Ee() {
  const n = _();
  let i = 2;
  function e() {
    if (n.appCanvas != null)
      try {
        let t = n.appCanvas.toDataURL();
        const o = document.createElement("a");
        o.style.display = "none", o.href = t, o.download = `hologram_qs${n.quiltWidth}x${n.quiltHeight}a${n.aspect}.png`, document.body.appendChild(o), o.click(), document.body.removeChild(o), window.URL.revokeObjectURL(t);
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
function ye() {
  var i;
  const n = _();
  if (console.log(n, "for debugging purposes"), n.lkgCanvas == null)
    console.warn("window placement called without a valid XR Session!");
  else {
    let e = function() {
      let r = m.d - m.a, c = m.w - m.s;
      r && c && (r *= Math.sqrt(0.5), c *= Math.sqrt(0.5));
      const d = n.trackballX, y = n.trackballY, T = Math.cos(d) * r - Math.sin(d) * Math.cos(y) * c, F = -Math.sin(y) * c, k = -Math.sin(d) * r - Math.cos(d) * Math.cos(y) * c;
      n.targetX = n.targetX + T * n.targetDiam * 0.03, n.targetY = n.targetY + F * n.targetDiam * 0.03, n.targetZ = n.targetZ + k * n.targetDiam * 0.03, requestAnimationFrame(e);
    };
    const s = document.createElement("style");
    document.head.appendChild(s), (i = s.sheet) == null || i.insertRule("#LookingGlassWebXRControls * { all: revert; font-family: sans-serif }");
    const t = document.createElement("div");
    t.id = "LookingGlassWebXRControls", t.style.position = "fixed", t.style.zIndex = "1000", t.style.padding = "15px", t.style.width = "320px", t.style.maxWidth = "calc(100vw - 18px)", t.style.maxHeight = "calc(100vh - 18px)", t.style.whiteSpace = "nowrap", t.style.background = "rgba(0, 0, 0, 0.6)", t.style.color = "white", t.style.borderRadius = "10px", t.style.right = "15px", t.style.bottom = "15px", t.style.flex = "row";
    const o = document.createElement("div");
    t.appendChild(o), o.style.width = "100%", o.style.textAlign = "center", o.style.fontWeight = "bold", o.style.marginBottom = "8px", o.innerText = "Looking Glass Controls";
    const l = document.createElement("button");
    l.style.display = "block", l.style.margin = "auto", l.style.width = "100%", l.style.height = "35px", l.style.padding = "4px", l.style.marginBottom = "8px", l.style.borderRadius = "8px", l.id = "screenshotbutton", t.appendChild(l), l.innerText = "Save Hologram";
    const h = document.createElement("button");
    h.style.display = "block", h.style.margin = "auto", h.style.width = "100%", h.style.height = "35px", h.style.padding = "4px", h.style.marginBottom = "8px", h.style.borderRadius = "8px", h.id = "copybutton", t.appendChild(h), h.innerText = "Copy Config", h.addEventListener("click", () => {
      ge(n);
    });
    const C = document.createElement("div");
    t.appendChild(C), C.style.width = "290px", C.style.whiteSpace = "normal", C.style.color = "rgba(255,255,255,0.7)", C.style.fontSize = "14px", C.style.margin = "5px 0", C.innerHTML = "Click the popup and use WASD, mouse left/right drag, and scroll.";
    const S = document.createElement("div");
    t.appendChild(S);
    const A = (r, c, d) => {
      const y = d.stringify, T = document.createElement("div");
      T.style.marginBottom = "8px", S.appendChild(T);
      const F = r, k = n[r], b = document.createElement("label");
      T.appendChild(b), b.innerText = d.label, b.setAttribute("for", F), b.style.width = "100px", b.style.display = "inline-block", b.style.textDecoration = "dotted underline 1px", b.style.fontFamily = '"Courier New"', b.style.fontSize = "13px", b.style.fontWeight = "bold", b.title = d.title;
      const f = document.createElement("input");
      T.appendChild(f), Object.assign(f, c), f.id = F, f.title = d.title, f.value = c.value !== void 0 ? c.value : k;
      const M = (p) => {
        n[r] = p, P(p);
      };
      f.oninput = () => {
        const p = c.type === "range" ? parseFloat(f.value) : c.type === "checkbox" ? f.checked : f.value;
        M(p);
      };
      const B = (p) => {
        let x = p(n[r]);
        d.fixRange && (x = d.fixRange(x), f.max = Math.max(parseFloat(f.max), x).toString(), f.min = Math.min(parseFloat(f.min), x).toString()), f.value = x, M(x);
      };
      c.type === "range" && (f.style.width = "110px", f.style.height = "8px", f.onwheel = (p) => {
        B((x) => x + Math.sign(p.deltaX - p.deltaY) * c.step);
      });
      let P = (p) => {
      };
      if (y) {
        const p = document.createElement("span");
        p.style.fontFamily = '"Courier New"', p.style.fontSize = "13px", p.style.marginLeft = "3px", T.appendChild(p), P = (x) => {
          p.innerHTML = y(x);
        }, P(k);
      }
      return B;
    };
    A("fovy", {
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
    }), A("depthiness", { type: "range", min: 0, max: 2, step: 0.01 }, {
      label: "depthiness",
      title: "exaggerates depth by multiplying the width of the view cone (as reported by the firmware) - can somewhat compensate for depthiness lost using higher fov.",
      fixRange: (r) => Math.max(0, r),
      stringify: (r) => `${r.toFixed(2)}x`
    }), A("inlineView", { type: "range", min: 0, max: 2, step: 1 }, {
      label: "inline view",
      title: "what to show inline on the original canvas (swizzled = no overwrite)",
      fixRange: (r) => Math.max(0, Math.min(r, 2)),
      stringify: (r) => r === 0 ? "swizzled" : r === 1 ? "center" : r === 2 ? "quilt" : "?"
    }), n.lkgCanvas.oncontextmenu = (r) => {
      r.preventDefault();
    }, n.lkgCanvas.addEventListener("wheel", (r) => {
      const c = n.targetDiam, d = 1.1, y = Math.log(c) / Math.log(d);
      return n.targetDiam = Math.pow(d, y + r.deltaY * 0.01);
    }), n.lkgCanvas.addEventListener("mousemove", (r) => {
      const c = r.movementX, d = -r.movementY;
      if (r.buttons & 2 || r.buttons & 1 && (r.shiftKey || r.ctrlKey)) {
        const y = n.trackballX, T = n.trackballY, F = -Math.cos(y) * c + Math.sin(y) * Math.sin(T) * d, k = -Math.cos(T) * d, b = Math.sin(y) * c + Math.cos(y) * Math.sin(T) * d;
        n.targetX = n.targetX + F * n.targetDiam * 1e-3, n.targetY = n.targetY + k * n.targetDiam * 1e-3, n.targetZ = n.targetZ + b * n.targetDiam * 1e-3;
      } else
        r.buttons & 1 && (n.trackballX = n.trackballX - c * 0.01, n.trackballY = n.trackballY - d * 0.01);
    });
    const m = { w: 0, a: 0, s: 0, d: 0 };
    return n.lkgCanvas.addEventListener("keydown", (r) => {
      switch (r.code) {
        case "KeyW":
          m.w = 1;
          break;
        case "KeyA":
          m.a = 1;
          break;
        case "KeyS":
          m.s = 1;
          break;
        case "KeyD":
          m.d = 1;
          break;
      }
    }), n.lkgCanvas.addEventListener("keyup", (r) => {
      switch (r.code) {
        case "KeyW":
          m.w = 0;
          break;
        case "KeyA":
          m.a = 0;
          break;
        case "KeyS":
          m.s = 0;
          break;
        case "KeyD":
          m.d = 0;
          break;
      }
    }), requestAnimationFrame(e), setTimeout(() => {
      Ee();
    }, 1e3), t;
  }
}
function ge(n) {
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
let W;
const Ce = (n, i) => {
  const e = _();
  if (e.lkgCanvas == null) {
    console.warn("window placement called without a valid XR Session!");
    return;
  } else if (n == !1)
    Te(e, W);
  else {
    W == null && (W = ye()), e.lkgCanvas.style.position = "fixed", e.lkgCanvas.style.bottom = "0", e.lkgCanvas.style.left = "0", e.lkgCanvas.width = e.calibration.screenW.value, e.lkgCanvas.height = e.calibration.screenH.value, document.body.appendChild(W);
    const s = "getScreenDetails" in window;
    console.log(s, "Screen placement API exists"), s ? Re(e.lkgCanvas, e, i) : K(e, e.lkgCanvas, i);
  }
};
async function Re(n, i, e) {
  const s = await window.getScreenDetails();
  console.log(s);
  const t = s.screens.filter((o) => o.label.includes("LKG"))[0];
  if (console.log(t, "monitors"), t === void 0) {
    console.log("no Looking Glass monitor detected - manually opening popup window"), K(i, n, e);
    return;
  } else {
    console.log("monitor ID", t.label, "serial number", i.calibration);
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
    i.popup = window.open("", "new", o), i.popup && (i.popup.document.body.style.background = "black", i.popup.document.body.style.transform = "1.0", $(i), i.popup.document.body.appendChild(n), console.assert(e), i.popup.onbeforeunload = e);
  }
}
function K(n, i, e) {
  n.popup = window.open("", void 0, "width=640,height=360"), n.popup && (n.popup.document.title = "Looking Glass Window (fullscreen me on Looking Glass!)", n.popup.document.body.style.background = "black", n.popup.document.body.style.transform = "1.0", $(n), n.popup.document.body.appendChild(i), console.assert(e), n.popup.onbeforeunload = e);
}
function Te(n, i) {
  var e;
  (e = i.parentElement) == null || e.removeChild(i), n.popup && (n.popup.onbeforeunload = null, n.popup.close(), n.popup = null);
}
function $(n) {
  n.popup && n.popup.document.addEventListener("keydown", (i) => {
    i.ctrlKey && (i.key === "=" || i.key === "-" || i.key === "+") && i.preventDefault();
  });
}
const I = Symbol("LookingGlassXRWebGLLayer");
class xe extends be {
  constructor(i, e, s) {
    super(i, e, s);
    const t = _();
    t.appCanvas = e.canvas, t.lkgCanvas = document.createElement("canvas"), t.lkgCanvas.tabIndex = 0;
    const o = t.lkgCanvas.getContext("2d", { alpha: !1 });
    t.lkgCanvas.addEventListener("dblclick", function() {
      this.requestFullscreen();
    });
    const l = this[ve].config, h = e.createTexture();
    let C, S;
    const A = e.createFramebuffer(), m = e.getExtension("OES_vertex_array_object"), r = 34229, c = m ? m.bindVertexArrayOES.bind(m) : e.bindVertexArray.bind(e);
    (l.depth || l.stencil) && (l.depth && l.stencil ? S = {
      format: e.DEPTH_STENCIL,
      attachment: e.DEPTH_STENCIL_ATTACHMENT
    } : l.depth ? S = {
      format: e.DEPTH_COMPONENT16,
      attachment: e.DEPTH_ATTACHMENT
    } : l.stencil && (S = {
      format: e.STENCIL_INDEX8,
      attachment: e.STENCIL_ATTACHMENT
    }), C = e.createRenderbuffer());
    const d = (a, g, v, u, w) => {
      y(a, g, w.framebufferWidth, w.framebufferHeight), v && T(a, v, u, w.framebufferWidth, w.framebufferHeight);
    }, y = (a, g, v, u) => {
      const w = a.getParameter(a.TEXTURE_BINDING_2D);
      a.bindTexture(a.TEXTURE_2D, g), a.texImage2D(a.TEXTURE_2D, 0, a.RGBA, v, u, 0, a.RGBA, a.UNSIGNED_BYTE, null), a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, a.LINEAR), a.bindTexture(a.TEXTURE_2D, w);
    }, T = (a, g, v, u, w) => {
      const R = a.getParameter(a.RENDERBUFFER_BINDING);
      a.bindRenderbuffer(a.RENDERBUFFER, g), a.renderbufferStorage(a.RENDERBUFFER, v.format, u, w), a.bindRenderbuffer(a.RENDERBUFFER, R);
    }, F = (a, g, v, u, w, R) => {
      const G = a.getParameter(a.FRAMEBUFFER_BINDING);
      a.bindFramebuffer(a.FRAMEBUFFER, g), a.framebufferTexture2D(a.FRAMEBUFFER, a.COLOR_ATTACHMENT0, a.TEXTURE_2D, v, 0), (R.depth || R.stencil) && a.framebufferRenderbuffer(a.FRAMEBUFFER, u.attachment, a.RENDERBUFFER, w), a.bindFramebuffer(a.FRAMEBUFFER, G);
    };
    d(e, h, C, S, t), t.addEventListener("on-config-changed", () => d(e, h, C, S, t)), F(e, A, h, S, C, l);
    const k = `
		attribute vec2 a_position;
		varying vec2 v_texcoord;
		void main() {
		  gl_Position = vec4(a_position * 2.0 - 1.0, 0.0, 1.0);
		  v_texcoord = a_position;
		}
	  `;
    function b(a, g, v) {
      const u = a.createShader(g);
      return a.shaderSource(u, v), a.compileShader(u), a.getShaderParameter(u, a.COMPILE_STATUS) ? u : (console.warn(a.getShaderInfoLog(u)), null);
    }
    function f(a, g, v) {
      let u = a.createProgram();
      const w = b(a, a.VERTEX_SHADER, g), R = b(a, a.FRAGMENT_SHADER, v);
      return w === null || R === null ? (console.error("There was a problem with shader construction"), null) : (a.attachShader(u, w), a.attachShader(u, R), a.linkProgram(u), a.getProgramParameter(u, a.LINK_STATUS) ? u : (console.warn(a.getProgramInfoLog(u)), null));
    }
    let M, B, P, p;
    const x = (a, g, v) => {
      const u = v(g);
      if (u === B)
        return;
      B = u;
      const w = b(a, a.FRAGMENT_SHADER, u);
      if (w === null)
        return;
      M && a.deleteShader(M), M = w;
      const R = f(a, k, u);
      if (R === null) {
        console.warn("There was a problem with shader construction");
        return;
      }
      P = a.getAttribLocation(R, "a_position"), p = a.getUniformLocation(R, "u_viewType");
      const G = a.getUniformLocation(R, "u_texture"), le = a.getParameter(a.CURRENT_PROGRAM);
      a.useProgram(R), a.uniform1i(G, 0), a.useProgram(le), D && a.deleteProgram(D), D = R;
    };
    console.log(X(t));
    let D = f(e, k, X(t));
    D === null && console.warn("There was a problem with shader construction"), t.addEventListener("on-config-changed", () => {
      x(e, t, X);
    });
    const Y = m ? m.createVertexArrayOES() : e.createVertexArray(), Z = e.createBuffer(), Q = e.getParameter(e.ARRAY_BUFFER_BINDING), J = e.getParameter(r);
    c(Y), e.bindBuffer(e.ARRAY_BUFFER, Z), e.bufferData(e.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), e.STATIC_DRAW), e.enableVertexAttribArray(P), e.vertexAttribPointer(P, 2, e.FLOAT, !1, 0, 0), c(J), e.bindBuffer(e.ARRAY_BUFFER, Q);
    const ee = () => {
      console.assert(this[I].LookingGlassEnabled), e.bindFramebuffer(e.FRAMEBUFFER, this.framebuffer);
      const a = e.getParameter(e.COLOR_CLEAR_VALUE), g = e.getParameter(e.DEPTH_CLEAR_VALUE), v = e.getParameter(e.STENCIL_CLEAR_VALUE);
      e.clearColor(0, 0, 0, 0), e.clearDepth(1), e.clearStencil(0), e.clear(e.DEPTH_BUFFER_BIT | e.COLOR_BUFFER_BIT | e.STENCIL_BUFFER_BIT), e.clearColor(a[0], a[1], a[2], a[3]), e.clearDepth(g), e.clearStencil(v);
    };
    function te() {
      if (!t.appCanvas || !t.lkgCanvas)
        return;
      (t.appCanvas.width !== t.framebufferWidth || t.appCanvas.height !== t.framebufferHeight) && (t.appCanvas.width, t.appCanvas.height, t.appCanvas.width = t.framebufferWidth, t.appCanvas.height = t.framebufferHeight);
      const a = ie();
      ae(), re(), se(), oe(), ne(a);
    }
    function ne(a) {
      e.activeTexture(a.activeTexture), e.bindTexture(e.TEXTURE_2D, a.textureBinding), e.useProgram(a.program), e.bindRenderbuffer(e.RENDERBUFFER, a.renderbufferBinding), e.bindFramebuffer(e.FRAMEBUFFER, a.framebufferBinding), a.scissorTest ? e.enable(e.SCISSOR_TEST) : e.disable(e.SCISSOR_TEST), a.stencilTest ? e.enable(e.STENCIL_TEST) : e.disable(e.STENCIL_TEST), a.depthTest ? e.enable(e.DEPTH_TEST) : e.disable(e.DEPTH_TEST), a.blend ? e.enable(e.BLEND) : e.disable(e.BLEND), a.cullFace ? e.enable(e.CULL_FACE) : e.disable(e.CULL_FACE), c(a.VAO);
    }
    function ie() {
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
    function ae() {
      e.bindFramebuffer(e.FRAMEBUFFER, null), e.useProgram(D), c(Y), e.activeTexture(e.TEXTURE0), e.bindTexture(e.TEXTURE_2D, h), e.disable(e.BLEND), e.disable(e.CULL_FACE), e.disable(e.DEPTH_TEST), e.disable(e.STENCIL_TEST), e.viewport(0, 0, e.drawingBufferWidth, e.drawingBufferHeight);
    }
    function re() {
      e.uniform1i(p, 0), e.drawArrays(e.TRIANGLES, 0, 6);
    }
    function se() {
      if (!t.lkgCanvas || !t.appCanvas) {
        console.warn("Looking Glass Canvas is not defined");
        return;
      }
      o == null || o.clearRect(0, 0, t.lkgCanvas.width, t.lkgCanvas.height), o == null || o.drawImage(t.appCanvas, 0, 0, t.framebufferWidth, t.framebufferHeight, 0, 0, t.calibration.screenW.value, t.calibration.screenH.value);
    }
    function oe() {
      if (!t.appCanvas) {
        console.warn("Looking Glass Canvas is not defined");
        return;
      }
      t.inlineView !== 0 && (t.capturing && t.appCanvas.width !== t.framebufferWidth && (t.appCanvas.width = t.framebufferWidth, t.appCanvas.height = t.framebufferHeight, e.viewport(0, 0, t.framebufferHeight, t.framebufferWidth)), e.uniform1i(p, t.inlineView), e.drawArrays(e.TRIANGLES, 0, 6));
    }
    window.addEventListener("unload", () => {
      t.popup && t.popup.close(), t.popup = null;
    }), this[I] = {
      LookingGlassEnabled: !1,
      framebuffer: A,
      clearFramebuffer: ee,
      blitTextureToDefaultFramebufferIfNeeded: te,
      moveCanvasToWindow: Ce
    };
  }
  get framebuffer() {
    return this[I].LookingGlassEnabled ? this[I].framebuffer : null;
  }
  get framebufferWidth() {
    return _().framebufferWidth;
  }
  get framebufferHeight() {
    return _().framebufferHeight;
  }
}
const N = class extends pe {
  constructor(i) {
    super(i), this.sessions = /* @__PURE__ */ new Map(), this.viewSpaces = [], this.basePoseMatrix = L.create(), this.inlineProjectionMatrix = L.create(), this.inlineInverseViewMatrix = L.create(), this.LookingGlassProjectionMatrices = [], this.LookingGlassInverseViewMatrices = [], this.captureScreenshot = !1, this.screenshotCallback = null, N.instance || (N.instance = this);
  }
  static getInstance() {
    return N.instance;
  }
  onBaseLayerSet(i, e) {
    const s = this.sessions.get(i);
    s.baseLayer = e;
    const t = _(), o = e[I];
    o.LookingGlassEnabled = s.immersive, s.immersive && (t.XRSession = this.sessions.get(i), t.popup == null ? o.moveCanvasToWindow(!0, () => {
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
    const s = i !== "inline", t = new Le(i, e);
    return this.sessions.set(t.id, t), s && this.dispatchEvent("@@@lookingglass/webxr-polyfill/vr-present-start", t.id), Promise.resolve(t.id);
  }
  requestAnimationFrame(i) {
    return this.global.requestAnimationFrame(i);
  }
  cancelAnimationFrame(i) {
    this.global.cancelAnimationFrame(i);
  }
  onFrameStart(i, e) {
    const s = this.sessions.get(i);
    _();
    const t = s.baseLayer.context;
    console.log(s.immersive, t);
    const o = t.drawingBufferWidth / t.drawingBufferHeight;
    L.perspective(this.inlineProjectionMatrix, e.inlineVerticalFieldOfView, o, e.depthNear, e.depthFar), L.fromTranslation(this.basePoseMatrix, [0, H, 0]), L.invert(this.inlineInverseViewMatrix, this.basePoseMatrix);
  }
  onFrameEnd(i) {
    this.sessions.get(i).baseLayer[I].blitTextureToDefaultFramebufferIfNeeded(), this.captureScreenshot && this.screenshotCallback && (this.screenshotCallback(), this.captureScreenshot = !1);
  }
  async requestFrameOfReferenceTransform(i, e) {
    const s = L.create();
    switch (i) {
      case "viewer":
      case "local":
        return L.fromTranslation(s, [0, -H, 0]), s;
      case "local-floor":
        return s;
      default:
        throw new Error("XRReferenceSpaceType not understood");
    }
  }
  endSession(i) {
    const e = this.sessions.get(i);
    e.immersive && e.baseLayer && (e.baseLayer[I].moveCanvasToWindow(!1), this.dispatchEvent("@@@lookingglass/webxr-polyfill/vr-present-end", i)), e.ended = !0;
  }
  doesSessionSupportReferenceSpace(i, e) {
    const s = this.sessions.get(i);
    return s.ended ? !1 : s.enabledFeatures.has(e);
  }
  getViewSpaces(i) {
    if (i === "immersive-vr") {
      const e = _();
      for (let s = this.viewSpaces.length; s < e.numViews; ++s)
        this.viewSpaces[s] = new Se(s);
      return this.viewSpaces.length = e.numViews, this.viewSpaces;
    }
  }
  getViewport(i, e, s, t, o) {
    if (o === void 0) {
      const h = this.sessions.get(i).baseLayer.context;
      t.x = 0, t.y = 0, t.width = h.drawingBufferWidth, t.height = h.drawingBufferHeight;
    } else {
      const l = _(), h = o % l.quiltWidth, C = Math.floor(o / l.quiltWidth);
      t.x = l.framebufferWidth / l.quiltWidth * h, t.y = l.framebufferHeight / l.quiltHeight * C, t.width = l.framebufferWidth / l.quiltWidth, t.height = l.framebufferHeight / l.quiltHeight;
    }
    return !0;
  }
  getProjectionMatrix(i, e) {
    return e === void 0 ? this.inlineProjectionMatrix : this.LookingGlassProjectionMatrices[e] || L.create();
  }
  getBasePoseMatrix() {
    return this.basePoseMatrix;
  }
  getBaseViewMatrix() {
    return this.inlineInverseViewMatrix;
  }
  _getViewMatrixByIndex(i) {
    return this.LookingGlassInverseViewMatrices[i] = this.LookingGlassInverseViewMatrices[i] || L.create();
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
E(V, "instance", null);
let _e = 0;
class Le {
  constructor(i, e) {
    E(this, "mode");
    E(this, "immersive");
    E(this, "id");
    E(this, "baseLayer");
    E(this, "inlineVerticalFieldOfView");
    E(this, "ended");
    E(this, "enabledFeatures");
    this.mode = i, this.immersive = i === "immersive-vr" || i === "immersive-ar", this.id = ++_e, this.baseLayer = null, this.inlineVerticalFieldOfView = Math.PI * 0.5, this.ended = !1, this.enabledFeatures = e;
  }
}
class Se extends me {
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
class j extends he {
  constructor(e) {
    super();
    E(this, "vrButton");
    E(this, "device");
    E(this, "isPresenting", !1);
    z(e), this.loadPolyfill();
  }
  static async init(e) {
    new j(e);
  }
  async loadPolyfill() {
    this.overrideDefaultVRButton(), console.warn('Looking Glass WebXR "polyfill" overriding native WebXR API.');
    for (const e in q)
      this.global[e] = q[e];
    this.global.XRWebGLLayer = xe, this.injected = !0, this.device = new V(this.global), this.xr = new de(Promise.resolve(this.device)), Object.defineProperty(this.global.navigator, "xr", {
      value: this.xr,
      configurable: !0
    });
  }
  async overrideDefaultVRButton() {
    this.vrButton = await ke("VRButton"), this.vrButton && this.device ? (this.device.addEventListener("@@webxr-polyfill/vr-present-start", () => {
      this.isPresenting = !0, this.updateVRButtonUI();
    }), this.device.addEventListener("@@webxr-polyfill/vr-present-end", () => {
      this.isPresenting = !1, this.updateVRButtonUI();
    }), this.vrButton.addEventListener("click", (e) => {
      console.log("button click", e), this.updateVRButtonUI();
    }), this.updateVRButtonUI()) : console.warn("Unable to find VRButton");
  }
  async updateVRButtonUI() {
    if (this.vrButton) {
      await Fe(100), this.isPresenting ? this.vrButton.innerHTML = "EXIT LOOKING GLASS" : this.vrButton.innerHTML = "ENTER LOOKING GLASS";
      const e = 220;
      this.vrButton.style.width = `${e}px`, this.vrButton.style.left = `calc(50% - ${e / 2}px)`;
    }
  }
  update(e) {
    z(e);
  }
}
async function ke(n) {
  return new Promise((i) => {
    const e = new MutationObserver(function(s) {
      s.forEach(function(t) {
        t.addedNodes.forEach(function(o) {
          const l = o;
          l.id === n && (i(l), e.disconnect());
        });
      });
    });
    e.observe(document.body, { subtree: !1, childList: !0 }), setTimeout(() => {
      e.disconnect(), i(null);
    }, 5e3);
  });
}
function Fe(n) {
  return new Promise((i) => setTimeout(i, n));
}
const Ge = _();
export {
  Ge as LookingGlassConfig,
  j as LookingGlassWebXRPolyfill
};
