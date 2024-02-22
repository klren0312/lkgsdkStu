(function(v,L){typeof exports=="object"&&typeof module<"u"?L(exports,require("@lookingglass/webxr-polyfill/src/api/index"),require("@lookingglass/webxr-polyfill/src/api/XRSystem"),require("@lookingglass/webxr-polyfill/src/WebXRPolyfill"),require("holoplay-core"),require("@lookingglass/webxr-polyfill/src/devices/XRDevice"),require("@lookingglass/webxr-polyfill/src/api/XRSpace"),require("gl-matrix"),require("@lookingglass/webxr-polyfill/src/api/XRWebGLLayer")):typeof define=="function"&&define.amd?define(["exports","@lookingglass/webxr-polyfill/src/api/index","@lookingglass/webxr-polyfill/src/api/XRSystem","@lookingglass/webxr-polyfill/src/WebXRPolyfill","holoplay-core","@lookingglass/webxr-polyfill/src/devices/XRDevice","@lookingglass/webxr-polyfill/src/api/XRSpace","gl-matrix","@lookingglass/webxr-polyfill/src/api/XRWebGLLayer"],L):(v=typeof globalThis<"u"?globalThis:v||self,L(v["Looking Glass WebXR"]={},v["@lookingglass/webxr-polyfill/src/api/index"],v["@lookingglass/webxr-polyfill/src/api/XRSystem"],v["@lookingglass/webxr-polyfill/src/WebXRPolyfill"],v.holoPlayCore,v["@lookingglass/webxr-polyfill/src/devices/XRDevice"],v["@lookingglass/webxr-polyfill/src/api/XRSpace"],v.glMatrix,v["@lookingglass/webxr-polyfill/src/api/XRWebGLLayer"]))})(this,function(v,L,X,ne,H,ie,ae,g,$){"use strict";var Xe=Object.defineProperty;var Ge=(v,L,X)=>L in v?Xe(v,L,{enumerable:!0,configurable:!0,writable:!0,value:X}):v[L]=X;var T=(v,L,X)=>(Ge(v,typeof L!="symbol"?L+"":L,X),X);const G=n=>n&&typeof n=="object"&&"default"in n?n:{default:n};function se(n){if(n&&n.__esModule)return n;const a=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(n){for(const e in n)if(e!=="default"){const r=Object.getOwnPropertyDescriptor(n,e);Object.defineProperty(a,e,r.get?r:{enumerable:!0,get:()=>n[e]})}}return a.default=n,Object.freeze(a)}const Z=G(L),re=G(X),oe=G(ne),le=se(H),ce=G(ie),ue=G(ae),de=G($),q=1.6;var Y;(function(n){n[n.Swizzled=0]="Swizzled",n[n.Center=1]="Center",n[n.Quilt=2]="Quilt"})(Y||(Y={}));class fe extends EventTarget{constructor(e){super();T(this,"_calibration",{configVersion:"1.0",pitch:{value:45},slope:{value:-5},center:{value:-.5},viewCone:{value:40},invView:{value:1},verticalAngle:{value:0},DPI:{value:338},screenW:{value:250},screenH:{value:250},flipImageX:{value:0},flipImageY:{value:0},flipSubp:{value:0},serial:"LKG-DEFAULT-#####"});T(this,"_viewControls",{tileHeight:512,numViews:48,trackballX:0,trackballY:0,targetX:0,targetY:q,targetZ:-.5,targetDiam:2,fovy:13/180*Math.PI,depthiness:1.25,inlineView:Y.Center,capturing:!1,quiltResolution:3840,popup:null,XRSession:null,lkgCanvas:null,appCanvas:null});T(this,"LookingGlassDetected");this._viewControls={...this._viewControls,...e},this.syncCalibration()}syncCalibration(){new le.Client(e=>{if(e.devices.length<1){console.log("No Looking Glass devices found");return}e.devices.length>1&&console.log("More than one Looking Glass device found... using the first one"),this.calibration=e.devices[0].calibration})}addEventListener(e,r,t){super.addEventListener(e,r,t)}onConfigChange(){this.dispatchEvent(new Event("on-config-changed"))}get calibration(){return this._calibration}set calibration(e){this._calibration={...this._calibration,...e},this.onConfigChange()}updateViewControls(e){e!=null&&(this._viewControls={...this._viewControls,...e},this.onConfigChange())}get tileHeight(){return Math.round(this.framebufferHeight/this.quiltHeight)}get quiltResolution(){return this._viewControls.quiltResolution}set quiltResolution(e){this.updateViewControls({quiltResolution:e})}get numViews(){return this.quiltWidth*this.quiltHeight}get targetX(){return this._viewControls.targetX}set targetX(e){this.updateViewControls({targetX:e})}get targetY(){return this._viewControls.targetY}set targetY(e){this.updateViewControls({targetY:e})}get targetZ(){return this._viewControls.targetZ}set targetZ(e){this.updateViewControls({targetZ:e})}get trackballX(){return this._viewControls.trackballX}set trackballX(e){this.updateViewControls({trackballX:e})}get trackballY(){return this._viewControls.trackballY}set trackballY(e){this.updateViewControls({trackballY:e})}get targetDiam(){return this._viewControls.targetDiam}set targetDiam(e){this.updateViewControls({targetDiam:e})}get fovy(){return this._viewControls.fovy}set fovy(e){this.updateViewControls({fovy:e})}get depthiness(){return this._viewControls.depthiness}set depthiness(e){this.updateViewControls({depthiness:e})}get inlineView(){return this._viewControls.inlineView}set inlineView(e){this.updateViewControls({inlineView:e})}get capturing(){return this._viewControls.capturing}set capturing(e){this.updateViewControls({capturing:e})}get popup(){return this._viewControls.popup}set popup(e){this.updateViewControls({popup:e})}get XRSession(){return this._viewControls.XRSession}set XRSession(e){this.updateViewControls({XRSession:e})}get lkgCanvas(){return this._viewControls.lkgCanvas}set lkgCanvas(e){this.updateViewControls({lkgCanvas:e})}get appCanvas(){return this._viewControls.appCanvas}set appCanvas(e){this.updateViewControls({appCanvas:e})}get aspect(){return this._calibration.screenW.value/this._calibration.screenH.value}get tileWidth(){return Math.round(this.framebufferWidth/this.quiltWidth)}get framebufferWidth(){return this._calibration.screenW.value<7e3?this._viewControls.quiltResolution:7680}get quiltWidth(){return this.calibration.screenW.value==1536?8:this.calibration.screenW.value==3840||this.calibration.screenW.value>7e3?5:8}get quiltHeight(){return this.calibration.screenW.value==1536?6:this.calibration.screenW.value==3840||this.calibration.screenW.value>7e3?9:6}get framebufferHeight(){return this._calibration.screenW.value<7e3?this._viewControls.quiltResolution:4320}get viewCone(){return this._calibration.viewCone.value*this.depthiness/180*Math.PI}get tilt(){return this._calibration.screenH.value/(this._calibration.screenW.value*this._calibration.slope.value)*(this._calibration.flipImageX.value?-1:1)}set tilt(e){}get subp(){return 1/(this._calibration.screenW.value*3)}get pitch(){const e=this._calibration.screenW.value/this._calibration.DPI.value;return this._calibration.pitch.value*e*Math.cos(Math.atan(1/this._calibration.slope.value))}}let j=null;function P(){return j==null&&(j=new fe),j}function Q(n){const a=P();n!=null&&a.updateViewControls(n)}async function he(){const n=P();let a=2;function e(){if(n.appCanvas!=null)try{let t=n.appCanvas.toDataURL();const o=document.createElement("a");o.style.display="none",o.href=t,o.download=`hologram_qs${n.quiltWidth}x${n.quiltHeight}a${n.aspect}.png`,document.body.appendChild(o),o.click(),document.body.removeChild(o),window.URL.revokeObjectURL(t)}catch(t){console.error("Error while capturing canvas data:",t)}finally{n.inlineView=a}}const r=document.getElementById("screenshotbutton");r&&r.addEventListener("click",()=>{a=n.inlineView;const t=N.getInstance();if(!t){console.warn("LookingGlassXRDevice not initialized");return}n.inlineView=2,t.captureScreenshot=!0,setTimeout(()=>{t.screenshotCallback=e},100)})}function pe(){var a;const n=P();if(console.log(n,"for debugging purposes"),n.lkgCanvas==null)console.warn("window placement called without a valid XR Session!");else{let e=function(){let s=w.d-w.a,c=w.w-w.s;s&&c&&(s*=Math.sqrt(.5),c*=Math.sqrt(.5));const u=n.trackballX,h=n.trackballY,E=Math.cos(u)*s-Math.sin(u)*Math.cos(h)*c,F=-Math.sin(h)*c,S=-Math.sin(u)*s-Math.cos(u)*Math.cos(h)*c;n.targetX=n.targetX+E*n.targetDiam*.03,n.targetY=n.targetY+F*n.targetDiam*.03,n.targetZ=n.targetZ+S*n.targetDiam*.03,requestAnimationFrame(e)};const r=document.createElement("style");document.head.appendChild(r),(a=r.sheet)==null||a.insertRule("#LookingGlassWebXRControls * { all: revert; font-family: sans-serif }");const t=document.createElement("div");t.id="LookingGlassWebXRControls",t.style.position="fixed",t.style.zIndex="1000",t.style.padding="15px",t.style.width="320px",t.style.maxWidth="calc(100vw - 18px)",t.style.maxHeight="calc(100vh - 18px)",t.style.whiteSpace="nowrap",t.style.background="rgba(0, 0, 0, 0.6)",t.style.color="white",t.style.borderRadius="10px",t.style.right="15px",t.style.bottom="15px",t.style.flex="row";const o=document.createElement("div");t.appendChild(o),o.style.width="100%",o.style.textAlign="center",o.style.fontWeight="bold",o.style.marginBottom="8px",o.innerText="Looking Glass Controls";const l=document.createElement("button");l.style.display="block",l.style.margin="auto",l.style.width="100%",l.style.height="35px",l.style.padding="4px",l.style.marginBottom="8px",l.style.borderRadius="8px",l.id="screenshotbutton",t.appendChild(l),l.innerText="Save Hologram";const f=document.createElement("button");f.style.display="block",f.style.margin="auto",f.style.width="100%",f.style.height="35px",f.style.padding="4px",f.style.marginBottom="8px",f.style.borderRadius="8px",f.id="copybutton",t.appendChild(f),f.innerText="Copy Config",f.addEventListener("click",()=>{me(n)});const p=document.createElement("div");t.appendChild(p),p.style.width="290px",p.style.whiteSpace="normal",p.style.color="rgba(255,255,255,0.7)",p.style.fontSize="14px",p.style.margin="5px 0",p.innerHTML="Click the popup and use WASD, mouse left/right drag, and scroll.";const D=document.createElement("div");t.appendChild(D);const x=(s,c,u)=>{const h=u.stringify,E=document.createElement("div");E.style.marginBottom="8px",D.appendChild(E);const F=s,S=n[s],y=document.createElement("label");E.appendChild(y),y.innerText=u.label,y.setAttribute("for",F),y.style.width="100px",y.style.display="inline-block",y.style.textDecoration="dotted underline 1px",y.style.fontFamily='"Courier New"',y.style.fontSize="13px",y.style.fontWeight="bold",y.title=u.title;const m=document.createElement("input");E.appendChild(m),Object.assign(m,c),m.id=F,m.title=u.title,m.value=c.value!==void 0?c.value:S;const B=b=>{n[s]=b,A(b)};m.oninput=()=>{const b=c.type==="range"?parseFloat(m.value):c.type==="checkbox"?m.checked:m.value;B(b)};const M=b=>{let I=b(n[s]);u.fixRange&&(I=u.fixRange(I),m.max=Math.max(parseFloat(m.max),I).toString(),m.min=Math.min(parseFloat(m.min),I).toString()),m.value=I,B(I)};c.type==="range"&&(m.style.width="110px",m.style.height="8px",m.onwheel=b=>{M(I=>I+Math.sign(b.deltaX-b.deltaY)*c.step)});let A=b=>{};if(h){const b=document.createElement("span");b.style.fontFamily='"Courier New"',b.style.fontSize="13px",b.style.marginLeft="3px",E.appendChild(b),A=I=>{b.innerHTML=h(I)},A(S)}return M};x("fovy",{type:"range",min:1/180*Math.PI,max:120.1/180*Math.PI,step:1/180*Math.PI},{label:"fov",title:"perspective fov (degrades stereo effect)",fixRange:s=>Math.max(1/180*Math.PI,Math.min(s,120.1/180*Math.PI)),stringify:s=>{const c=s/Math.PI*180,u=Math.atan(Math.tan(s/2)*n.aspect)*2/Math.PI*180;return`${c.toFixed()}&deg;&times;${u.toFixed()}&deg;`}}),x("depthiness",{type:"range",min:0,max:2,step:.01},{label:"depthiness",title:"exaggerates depth by multiplying the width of the view cone (as reported by the firmware) - can somewhat compensate for depthiness lost using higher fov.",fixRange:s=>Math.max(0,s),stringify:s=>`${s.toFixed(2)}x`}),x("inlineView",{type:"range",min:0,max:2,step:1},{label:"inline view",title:"what to show inline on the original canvas (swizzled = no overwrite)",fixRange:s=>Math.max(0,Math.min(s,2)),stringify:s=>s===0?"swizzled":s===1?"center":s===2?"quilt":"?"}),n.lkgCanvas.oncontextmenu=s=>{s.preventDefault()},n.lkgCanvas.addEventListener("wheel",s=>{const c=n.targetDiam,u=1.1,h=Math.log(c)/Math.log(u);return n.targetDiam=Math.pow(u,h+s.deltaY*.01)}),n.lkgCanvas.addEventListener("mousemove",s=>{const c=s.movementX,u=-s.movementY;if(s.buttons&2||s.buttons&1&&(s.shiftKey||s.ctrlKey)){const h=n.trackballX,E=n.trackballY,F=-Math.cos(h)*c+Math.sin(h)*Math.sin(E)*u,S=-Math.cos(E)*u,y=Math.sin(h)*c+Math.cos(h)*Math.sin(E)*u;n.targetX=n.targetX+F*n.targetDiam*.001,n.targetY=n.targetY+S*n.targetDiam*.001,n.targetZ=n.targetZ+y*n.targetDiam*.001}else s.buttons&1&&(n.trackballX=n.trackballX-c*.01,n.trackballY=n.trackballY-u*.01)});const w={w:0,a:0,s:0,d:0};return n.lkgCanvas.addEventListener("keydown",s=>{switch(s.code){case"KeyW":w.w=1;break;case"KeyA":w.a=1;break;case"KeyS":w.s=1;break;case"KeyD":w.d=1;break}}),n.lkgCanvas.addEventListener("keyup",s=>{switch(s.code){case"KeyW":w.w=0;break;case"KeyA":w.a=0;break;case"KeyS":w.s=0;break;case"KeyD":w.d=0;break}}),requestAnimationFrame(e),setTimeout(()=>{he()},1e3),t}}function me(n){const a={targetX:n.targetX,targetY:n.targetY,targetZ:n.targetZ,fovy:`${Math.round(n.fovy/Math.PI*180)} * Math.PI / 180`,targetDiam:n.targetDiam,trackballX:n.trackballX,trackballY:n.trackballY,depthiness:n.depthiness};let e=JSON.stringify(a,null,4).replace(/"/g,"").replace(/{/g,"").replace(/}/g,"");navigator.clipboard.writeText(e)}let O;const be=(n,a)=>{const e=P();if(e.lkgCanvas==null){console.warn("window placement called without a valid XR Session!");return}else if(n==!1)we(e,O);else{O==null&&(O=pe()),e.lkgCanvas.style.position="fixed",e.lkgCanvas.style.bottom="0",e.lkgCanvas.style.left="0",e.lkgCanvas.width=e.calibration.screenW.value,e.lkgCanvas.height=e.calibration.screenH.value,document.body.appendChild(O);const r="getScreenDetails"in window;console.log(r,"Screen placement API exists"),r?ve(e.lkgCanvas,e,a):J(e,e.lkgCanvas,a)}};async function ve(n,a,e){const r=await window.getScreenDetails();console.log(r);const t=r.screens.filter(o=>o.label.includes("LKG"))[0];if(console.log(t,"monitors"),t===void 0){console.log("no Looking Glass monitor detected - manually opening popup window"),J(a,n,e);return}else{console.log("monitor ID",t.label,"serial number",a.calibration);const o=[`left=${t.left}`,`top=${t.top}`,`width=${t.width}`,`height=${t.height}`,"menubar=no","toolbar=no","location=no","status=no","resizable=yes","scrollbars=no","fullscreenEnabled=true"].join(",");a.popup=window.open("","new",o),a.popup&&(a.popup.document.body.style.background="black",a.popup.document.body.style.transform="1.0",ee(a),a.popup.document.body.appendChild(n),console.assert(e),a.popup.onbeforeunload=e)}}function J(n,a,e){n.popup=window.open("",void 0,"width=640,height=360"),n.popup&&(n.popup.document.title="Looking Glass Window (fullscreen me on Looking Glass!)",n.popup.document.body.style.background="black",n.popup.document.body.style.transform="1.0",ee(n),n.popup.document.body.appendChild(a),console.assert(e),n.popup.onbeforeunload=e)}function we(n,a){var e;(e=a.parentElement)==null||e.removeChild(a),n.popup&&(n.popup.onbeforeunload=null,n.popup.close(),n.popup=null)}function ee(n){n.popup&&n.popup.document.addEventListener("keydown",a=>{a.ctrlKey&&(a.key==="="||a.key==="-"||a.key==="+")&&a.preventDefault()})}const V=Symbol("LookingGlassXRWebGLLayer");class ye extends de.default{constructor(a,e,r){super(a,e,r);const t=P();t.appCanvas=e.canvas,t.lkgCanvas=document.createElement("canvas"),t.lkgCanvas.tabIndex=0;const o=t.lkgCanvas.getContext("2d",{alpha:!1});t.lkgCanvas.addEventListener("dblclick",function(){this.requestFullscreen()});const l=this[$.PRIVATE].config,f=e.createTexture();let p,D;const x=e.createFramebuffer(),w=e.getExtension("OES_vertex_array_object"),s=34229,c=w?w.bindVertexArrayOES.bind(w):e.bindVertexArray.bind(e);(l.depth||l.stencil)&&(l.depth&&l.stencil?D={format:e.DEPTH_STENCIL,attachment:e.DEPTH_STENCIL_ATTACHMENT}:l.depth?D={format:e.DEPTH_COMPONENT16,attachment:e.DEPTH_ATTACHMENT}:l.stencil&&(D={format:e.STENCIL_INDEX8,attachment:e.STENCIL_ATTACHMENT}),p=e.createRenderbuffer());const u=(i,_,C,d,R)=>{h(i,_,R.framebufferWidth,R.framebufferHeight),C&&E(i,C,d,R.framebufferWidth,R.framebufferHeight)},h=(i,_,C,d)=>{const R=i.getParameter(i.TEXTURE_BINDING_2D);i.bindTexture(i.TEXTURE_2D,_),i.texImage2D(i.TEXTURE_2D,0,i.RGBA,C,d,0,i.RGBA,i.UNSIGNED_BYTE,null),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.bindTexture(i.TEXTURE_2D,R)},E=(i,_,C,d,R)=>{const k=i.getParameter(i.RENDERBUFFER_BINDING);i.bindRenderbuffer(i.RENDERBUFFER,_),i.renderbufferStorage(i.RENDERBUFFER,C.format,d,R),i.bindRenderbuffer(i.RENDERBUFFER,k)},F=(i,_,C,d,R,k)=>{const K=i.getParameter(i.FRAMEBUFFER_BINDING);i.bindFramebuffer(i.FRAMEBUFFER,_),i.framebufferTexture2D(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,C,0),(k.depth||k.stencil)&&i.framebufferRenderbuffer(i.FRAMEBUFFER,d.attachment,i.RENDERBUFFER,R),i.bindFramebuffer(i.FRAMEBUFFER,K)};u(e,f,p,D,t),t.addEventListener("on-config-changed",()=>u(e,f,p,D,t)),F(e,x,f,D,p,l);const S=`
		attribute vec2 a_position;
		varying vec2 v_texcoord;
		void main() {
			// \u5F52\u4E00\u5316, \u5C06\u9876\u70B9\u5750\u6807\u4ECE [-1, 1] -> [0, 1]
		  gl_Position = vec4(a_position * 2.0 - 1.0, 0.0, 1.0);
		  v_texcoord = a_position;
		}
	  `;function y(i,_,C){const d=i.createShader(_);return i.shaderSource(d,C),i.compileShader(d),i.getShaderParameter(d,i.COMPILE_STATUS)?d:(console.warn(i.getShaderInfoLog(d)),null)}function m(i,_,C){let d=i.createProgram();const R=y(i,i.VERTEX_SHADER,_),k=y(i,i.FRAGMENT_SHADER,C);return R===null||k===null?(console.error("There was a problem with shader construction"),null):(i.attachShader(d,R),i.attachShader(d,k),i.linkProgram(d),i.getProgramParameter(d,i.LINK_STATUS)?d:(console.warn(i.getProgramInfoLog(d)),null))}let B,M,A,b;const I=(i,_,C)=>{const d=C(_);if(d===M)return;M=d;const R=y(i,i.FRAGMENT_SHADER,d);if(R===null)return;B&&i.deleteShader(B),B=R;const k=m(i,S,d);if(k===null){console.warn("There was a problem with shader construction");return}A=i.getAttribLocation(k,"a_position"),b=i.getUniformLocation(k,"u_viewType");const K=i.getUniformLocation(k,"u_texture"),Ve=i.getParameter(i.CURRENT_PROGRAM);i.useProgram(k),i.uniform1i(K,0),i.useProgram(Ve),U&&i.deleteProgram(U),U=k};console.log(H.Shader(t));let U=m(e,S,H.Shader(t));U===null&&console.warn("There was a problem with shader construction"),t.addEventListener("on-config-changed",()=>{I(e,t,H.Shader)});const te=w?w.createVertexArrayOES():e.createVertexArray(),xe=e.createBuffer(),ke=e.getParameter(e.ARRAY_BUFFER_BINDING),Le=e.getParameter(s);c(te),e.bindBuffer(e.ARRAY_BUFFER,xe),e.bufferData(e.ARRAY_BUFFER,new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]),e.STATIC_DRAW),e.enableVertexAttribArray(A),e.vertexAttribPointer(A,2,e.FLOAT,!1,0,0),c(Le),e.bindBuffer(e.ARRAY_BUFFER,ke);const Se=()=>{console.assert(this[V].LookingGlassEnabled),e.bindFramebuffer(e.FRAMEBUFFER,this.framebuffer);const i=e.getParameter(e.COLOR_CLEAR_VALUE),_=e.getParameter(e.DEPTH_CLEAR_VALUE),C=e.getParameter(e.STENCIL_CLEAR_VALUE);e.clearColor(0,0,0,0),e.clearDepth(1),e.clearStencil(0),e.clear(e.DEPTH_BUFFER_BIT|e.COLOR_BUFFER_BIT|e.STENCIL_BUFFER_BIT),e.clearColor(i[0],i[1],i[2],i[3]),e.clearDepth(_),e.clearStencil(C)};function Pe(){if(!t.appCanvas||!t.lkgCanvas)return;(t.appCanvas.width!==t.framebufferWidth||t.appCanvas.height!==t.framebufferHeight)&&(t.appCanvas.width,t.appCanvas.height,t.appCanvas.width=t.framebufferWidth,t.appCanvas.height=t.framebufferHeight);const i=Ie();Ae(),De(),Be(),Me(),Fe(i)}function Fe(i){e.activeTexture(i.activeTexture),e.bindTexture(e.TEXTURE_2D,i.textureBinding),e.useProgram(i.program),e.bindRenderbuffer(e.RENDERBUFFER,i.renderbufferBinding),e.bindFramebuffer(e.FRAMEBUFFER,i.framebufferBinding),i.scissorTest?e.enable(e.SCISSOR_TEST):e.disable(e.SCISSOR_TEST),i.stencilTest?e.enable(e.STENCIL_TEST):e.disable(e.STENCIL_TEST),i.depthTest?e.enable(e.DEPTH_TEST):e.disable(e.DEPTH_TEST),i.blend?e.enable(e.BLEND):e.disable(e.BLEND),i.cullFace?e.enable(e.CULL_FACE):e.disable(e.CULL_FACE),c(i.VAO)}function Ie(){return{VAO:e.getParameter(e.VERTEX_ARRAY_BINDING),cullFace:e.getParameter(e.CULL_FACE),blend:e.getParameter(e.BLEND),depthTest:e.getParameter(e.DEPTH_TEST),stencilTest:e.getParameter(e.STENCIL_TEST),scissorTest:e.getParameter(e.SCISSOR_TEST),viewport:e.getParameter(e.VIEWPORT),framebufferBinding:e.getParameter(e.FRAMEBUFFER_BINDING),renderbufferBinding:e.getParameter(e.RENDERBUFFER_BINDING),program:e.getParameter(e.CURRENT_PROGRAM),activeTexture:e.getParameter(e.ACTIVE_TEXTURE),textureBinding:e.getParameter(e.TEXTURE_BINDING_2D)}}function Ae(){e.bindFramebuffer(e.FRAMEBUFFER,null),e.useProgram(U),c(te),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,f),e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.STENCIL_TEST),e.viewport(0,0,e.drawingBufferWidth,e.drawingBufferHeight)}function De(){e.uniform1i(b,0),e.drawArrays(e.TRIANGLES,0,6)}function Be(){if(!t.lkgCanvas||!t.appCanvas){console.warn("Looking Glass Canvas is not defined");return}o==null||o.clearRect(0,0,t.lkgCanvas.width,t.lkgCanvas.height),o==null||o.drawImage(t.appCanvas,0,0,t.framebufferWidth,t.framebufferHeight,0,0,t.calibration.screenW.value,t.calibration.screenH.value)}function Me(){if(!t.appCanvas){console.warn("Looking Glass Canvas is not defined");return}t.inlineView!==0&&(t.capturing&&t.appCanvas.width!==t.framebufferWidth&&(t.appCanvas.width=t.framebufferWidth,t.appCanvas.height=t.framebufferHeight,e.viewport(0,0,t.framebufferHeight,t.framebufferWidth)),e.uniform1i(b,t.inlineView),e.drawArrays(e.TRIANGLES,0,6))}window.addEventListener("unload",()=>{t.popup&&t.popup.close(),t.popup=null}),this[V]={LookingGlassEnabled:!1,framebuffer:x,clearFramebuffer:Se,blitTextureToDefaultFramebufferIfNeeded:Pe,moveCanvasToWindow:be}}get framebuffer(){return this[V].LookingGlassEnabled?this[V].framebuffer:null}get framebufferWidth(){return P().framebufferWidth}get framebufferHeight(){return P().framebufferHeight}}const W=class extends ce.default{constructor(a){super(a),this.sessions=new Map,this.viewSpaces=[],this.basePoseMatrix=g.mat4.create(),this.inlineProjectionMatrix=g.mat4.create(),this.inlineInverseViewMatrix=g.mat4.create(),this.LookingGlassProjectionMatrices=[],this.LookingGlassInverseViewMatrices=[],this.captureScreenshot=!1,this.screenshotCallback=null,W.instance||(W.instance=this)}static getInstance(){return W.instance}onBaseLayerSet(a,e){const r=this.sessions.get(a);r.baseLayer=e;const t=P(),o=e[V];o.LookingGlassEnabled=r.immersive,r.immersive&&(t.XRSession=this.sessions.get(a),t.popup==null?o.moveCanvasToWindow(!0,()=>{this.endSession(a)}):console.warn("attempted to assign baselayer twice?"))}isSessionSupported(a){return a==="inline"||a==="immersive-vr"}isFeatureSupported(a){switch(a){case"viewer":return!0;case"local":return!0;case"local-floor":return!0;case"bounded-floor":return!1;case"unbounded":return!1;default:return console.warn("LookingGlassXRDevice.isFeatureSupported: feature not understood:",a),!1}}async requestSession(a,e){if(!this.isSessionSupported(a))return Promise.reject();const r=a!=="inline",t=new Ee(a,e);return this.sessions.set(t.id,t),r&&this.dispatchEvent("@@@lookingglass/webxr-polyfill/vr-present-start",t.id),Promise.resolve(t.id)}requestAnimationFrame(a){return this.global.requestAnimationFrame(a)}cancelAnimationFrame(a){this.global.cancelAnimationFrame(a)}onFrameStart(a,e){const r=this.sessions.get(a),t=P();if(r.immersive){const o=Math.tan(.5*t.fovy),l=.5*t.targetDiam/o,f=l-t.targetDiam,p=this.basePoseMatrix;g.mat4.fromTranslation(p,[t.targetX,t.targetY,t.targetZ]),g.mat4.rotate(p,p,t.trackballX,[0,1,0]),g.mat4.rotate(p,p,-t.trackballY,[1,0,0]),g.mat4.translate(p,p,[0,0,l]);for(let x=0;x<t.numViews;++x){const w=(x+.5)/t.numViews-.5,s=Math.tan(t.viewCone*w),c=l*s,u=this.LookingGlassInverseViewMatrices[x]=this.LookingGlassInverseViewMatrices[x]||g.mat4.create();g.mat4.translate(u,p,[c,0,0]),g.mat4.invert(u,u);const h=Math.max(f+e.depthNear,.01),E=f+e.depthFar,F=h*o,S=F,y=-F,m=h*-s,B=t.aspect*F,M=m+B,A=m-B,b=this.LookingGlassProjectionMatrices[x]=this.LookingGlassProjectionMatrices[x]||g.mat4.create();g.mat4.set(b,2*h/(M-A),0,0,0,0,2*h/(S-y),0,0,(M+A)/(M-A),(S+y)/(S-y),-(E+h)/(E-h),-1,0,0,-2*E*h/(E-h),0)}r.baseLayer[V].clearFramebuffer()}else{const o=r.baseLayer.context,l=o.drawingBufferWidth/o.drawingBufferHeight;g.mat4.perspective(this.inlineProjectionMatrix,e.inlineVerticalFieldOfView,l,e.depthNear,e.depthFar),g.mat4.fromTranslation(this.basePoseMatrix,[0,q,0]),g.mat4.invert(this.inlineInverseViewMatrix,this.basePoseMatrix)}}onFrameEnd(a){this.sessions.get(a).baseLayer[V].blitTextureToDefaultFramebufferIfNeeded(),this.captureScreenshot&&this.screenshotCallback&&(this.screenshotCallback(),this.captureScreenshot=!1)}async requestFrameOfReferenceTransform(a,e){const r=g.mat4.create();switch(a){case"viewer":case"local":return g.mat4.fromTranslation(r,[0,-q,0]),r;case"local-floor":return r;default:throw new Error("XRReferenceSpaceType not understood")}}endSession(a){const e=this.sessions.get(a);e.immersive&&e.baseLayer&&(e.baseLayer[V].moveCanvasToWindow(!1),this.dispatchEvent("@@@lookingglass/webxr-polyfill/vr-present-end",a)),e.ended=!0}doesSessionSupportReferenceSpace(a,e){const r=this.sessions.get(a);return r.ended?!1:r.enabledFeatures.has(e)}getViewSpaces(a){if(a==="immersive-vr"){const e=P();for(let r=this.viewSpaces.length;r<e.numViews;++r)this.viewSpaces[r]=new Ce(r);return this.viewSpaces.length=e.numViews,this.viewSpaces}}getViewport(a,e,r,t,o){if(o===void 0){const f=this.sessions.get(a).baseLayer.context;t.x=0,t.y=0,t.width=f.drawingBufferWidth,t.height=f.drawingBufferHeight}else{const l=P(),f=o%l.quiltWidth,p=Math.floor(o/l.quiltWidth);t.x=l.framebufferWidth/l.quiltWidth*f,t.y=l.framebufferHeight/l.quiltHeight*p,t.width=l.framebufferWidth/l.quiltWidth,t.height=l.framebufferHeight/l.quiltHeight}return!0}getProjectionMatrix(a,e){return e===void 0?this.inlineProjectionMatrix:this.LookingGlassProjectionMatrices[e]||g.mat4.create()}getBasePoseMatrix(){return this.basePoseMatrix}getBaseViewMatrix(){return this.inlineInverseViewMatrix}_getViewMatrixByIndex(a){return this.LookingGlassInverseViewMatrices[a]=this.LookingGlassInverseViewMatrices[a]||g.mat4.create()}getInputSources(){return[]}getInputPose(a,e,r){return null}onWindowResize(){}};let N=W;T(N,"instance",null);let ge=0;class Ee{constructor(a,e){T(this,"mode");T(this,"immersive");T(this,"id");T(this,"baseLayer");T(this,"inlineVerticalFieldOfView");T(this,"ended");T(this,"enabledFeatures");this.mode=a,this.immersive=a==="immersive-vr"||a==="immersive-ar",this.id=++ge,this.baseLayer=null,this.inlineVerticalFieldOfView=Math.PI*.5,this.ended=!1,this.enabledFeatures=e}}class Ce extends ue.default{constructor(e){super();T(this,"viewIndex");this.viewIndex=e}get eye(){return"none"}_onPoseUpdate(e){this._inverseBaseMatrix=e._getViewMatrixByIndex(this.viewIndex)}}class z extends oe.default{constructor(e){super();T(this,"vrButton");T(this,"device");T(this,"isPresenting",!1);Q(e),this.loadPolyfill()}static async init(e){new z(e)}async loadPolyfill(){this.overrideDefaultVRButton(),console.warn('Looking Glass WebXR "polyfill" overriding native WebXR API.');for(const e in Z.default)this.global[e]=Z.default[e];this.global.XRWebGLLayer=ye,this.injected=!0,this.device=new N(this.global),this.xr=new re.default(Promise.resolve(this.device)),Object.defineProperty(this.global.navigator,"xr",{value:this.xr,configurable:!0})}async overrideDefaultVRButton(){this.vrButton=await Re("VRButton"),this.vrButton&&this.device?(this.device.addEventListener("@@webxr-polyfill/vr-present-start",()=>{this.isPresenting=!0,this.updateVRButtonUI()}),this.device.addEventListener("@@webxr-polyfill/vr-present-end",()=>{this.isPresenting=!1,this.updateVRButtonUI()}),this.vrButton.addEventListener("click",e=>{console.log("button click",e),this.updateVRButtonUI()}),this.updateVRButtonUI()):console.warn("Unable to find VRButton")}async updateVRButtonUI(){if(this.vrButton){await Te(100),this.isPresenting?this.vrButton.innerHTML="EXIT LOOKING GLASS":this.vrButton.innerHTML="ENTER LOOKING GLASS";const e=220;this.vrButton.style.width=`${e}px`,this.vrButton.style.left=`calc(50% - ${e/2}px)`}}update(e){Q(e)}}async function Re(n){return new Promise(a=>{const e=new MutationObserver(function(r){r.forEach(function(t){t.addedNodes.forEach(function(o){const l=o;l.id===n&&(a(l),e.disconnect())})})});e.observe(document.body,{subtree:!1,childList:!0}),setTimeout(()=>{e.disconnect(),a(null)},5e3)})}function Te(n){return new Promise(a=>setTimeout(a,n))}const _e=P();v.LookingGlassConfig=_e,v.LookingGlassWebXRPolyfill=z,Object.defineProperties(v,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}})});
