/**
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import XRWebGLLayer, { PRIVATE as XRWebGLLayer_PRIVATE } from "@lookingglass/webxr-polyfill/src/api/XRWebGLLayer"
import { Shader } from "holoplay-core"
import { getLookingGlassConfig } from "./LookingGlassConfig"
import { initLookingGlassControlGUI } from "./LookingGlassControls"

export const PRIVATE = Symbol("LookingGlassXRWebGLLayer")

export default class LookingGlassXRWebGLLayer extends XRWebGLLayer {
	constructor(session: any, gl: WebGL2RenderingContext, layerInit: any) {
		super(session, gl, layerInit)
		// call the Looking Glass config class
		const cfg = getLookingGlassConfig()
		// create a reference to the existing canvas
		const appCanvas = gl.canvas as HTMLCanvasElement
		// create a new canvas element to be used later when we open the Looking Glass window
		const lkgCanvas = document.createElement("canvas")
		lkgCanvas.tabIndex = 0
		const lkgCtx = lkgCanvas.getContext("2d", { alpha: false })
		lkgCanvas.addEventListener("dblclick", function () {
			this.requestFullscreen()
		})

		const controls = initLookingGlassControlGUI(lkgCanvas, appCanvas)

		// Set up framebuffer/texture.

		const config = this[XRWebGLLayer_PRIVATE].config
		const texture = gl.createTexture()
		let depthStencil, dsConfig
		// define a pointer to a framebuffer
		const framebuffer = gl.createFramebuffer()
		const glEnable = gl.enable.bind(gl)
		const glDisable = gl.disable.bind(gl)

		const OES_VAO = gl.getExtension("OES_vertex_array_object")
		const GL_VERTEX_ARRAY_BINDING = 0x85b5
		const glBindVertexArray = OES_VAO ? OES_VAO.bindVertexArrayOES.bind(OES_VAO) : gl.bindVertexArray.bind(gl)

		// create the definition for the depth stencil buffer
		if (config.depth || config.stencil) {
			if (config.depth && config.stencil) {
				dsConfig = {
					format: gl.DEPTH_STENCIL,
					attachment: gl.DEPTH_STENCIL_ATTACHMENT,
				}
			} else if (config.depth) {
				dsConfig = {
					format: gl.DEPTH_COMPONENT16,
					attachment: gl.DEPTH_ATTACHMENT,
				}
			} else if (config.stencil) {
				dsConfig = {
					format: gl.STENCIL_INDEX8,
					attachment: gl.STENCIL_ATTACHMENT,
				}
			}
			depthStencil = gl.createRenderbuffer()
		}

		// sets up the texture based on the quilt height and width
		const allocateFramebufferAttachments = () => {
			// create variable to store the current texture binding
			const oldTextureBinding = gl.getParameter(gl.TEXTURE_BINDING_2D)
			{
				// bind the current working texture to the `texture` variable 
				gl.bindTexture(gl.TEXTURE_2D, texture)
				// initialize the texture with the current framebuffer width and height
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, cfg.framebufferWidth, cfg.framebufferHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
				// set the filtering to linear
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
			}
			// returns the current texture binding
			gl.bindTexture(gl.TEXTURE_2D, oldTextureBinding)
			
			// do the same thing as above, but for the depth and stencil buffers. 
			if (depthStencil) {
				const oldRenderbufferBinding = gl.getParameter(gl.RENDERBUFFER_BINDING)
				{
					gl.bindRenderbuffer(gl.RENDERBUFFER, depthStencil)
					gl.renderbufferStorage(gl.RENDERBUFFER, dsConfig.format, cfg.framebufferWidth, cfg.framebufferHeight)
				}
				gl.bindRenderbuffer(gl.RENDERBUFFER, oldRenderbufferBinding)
			}
		}
		allocateFramebufferAttachments()
		cfg.addEventListener("on-config-changed", allocateFramebufferAttachments)

		// gets the current framebuffer, sets the current framebuffer, then copies from the texture to the frame buffer, then write the depth/stencil if exist, then return the framebuffer to the original one
		const oldFramebufferBinding = gl.getParameter(gl.FRAMEBUFFER_BINDING)
		{
			//set currently used framebuffer to the one we just created
			gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
			//selects the current frame buffer, then write the texture to the framebuffer
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
			//if depth or stencil pass exist, do it again for those passes
			if (config.depth || config.stencil) {
				gl.framebufferRenderbuffer(gl.FRAMEBUFFER, dsConfig.attachment, gl.RENDERBUFFER, depthStencil)
			}
		}
		gl.bindFramebuffer(gl.FRAMEBUFFER, oldFramebufferBinding)

		// Set up blit from texture to screen.

		const program = gl.createProgram()
		const vs = gl.createShader(gl.VERTEX_SHADER)
		gl.attachShader(program, vs)
		const fs = gl.createShader(gl.FRAGMENT_SHADER)
		gl.attachShader(program, fs)

		{
			const vsSource = `
       attribute vec2 a_position;
       varying vec2 v_texcoord;
       void main() {
         gl_Position = vec4(a_position * 2.0 - 1.0, 0.0, 1.0);
         v_texcoord = a_position;
       }
     `
			gl.shaderSource(vs, vsSource)
			gl.compileShader(vs)
			if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(vs))
		}

		let lastGeneratedFSSource
		let a_location
		let u_viewType

		// recompile the fragment shader if the config changes
		const recompileProgram = () => {
			// use shader from holoplay-core.js
			const fsSource = Shader(cfg)
			if (fsSource === lastGeneratedFSSource) return
			lastGeneratedFSSource = fsSource

			gl.shaderSource(fs, fsSource)
			gl.compileShader(fs)
			if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
				console.warn(gl.getShaderInfoLog(fs))
				return
			}

			gl.linkProgram(program)
			if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
				console.warn(gl.getProgramInfoLog(program))
				return
			}

			a_location = gl.getAttribLocation(program, "a_position")
			u_viewType = gl.getUniformLocation(program, "u_viewType")
			const u_texture = gl.getUniformLocation(program, "u_texture")

			const oldProgram = gl.getParameter(gl.CURRENT_PROGRAM)
			{
				gl.useProgram(program)
				gl.uniform1i(u_texture, 0) // Always use texture unit 0 for u_texture // todo: why
			}
			gl.useProgram(oldProgram)
		}

		cfg.addEventListener("on-config-changed", recompileProgram)

		const vao = OES_VAO ? OES_VAO.createVertexArrayOES() : gl.createVertexArray()
		const vbo = gl.createBuffer()
		const oldBufferBinding = gl.getParameter(gl.ARRAY_BUFFER_BINDING)
		const oldVAO = gl.getParameter(GL_VERTEX_ARRAY_BINDING)
		{
			glBindVertexArray(vao)
			gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), gl.STATIC_DRAW)
			gl.enableVertexAttribArray(a_location)
			gl.vertexAttribPointer(a_location, 2, gl.FLOAT, false, 0, 0)
		}
		glBindVertexArray(oldVAO)
		gl.bindBuffer(gl.ARRAY_BUFFER, oldBufferBinding)

		const clearFramebuffer = () => {
			console.assert(this[PRIVATE].LookingGlassEnabled)

			// If session is not an inline session, XRWebGLLayer's composition disabled boolean
			// should be false and then framebuffer should be marked as opaque.
			// The buffers attached to an opaque framebuffer must be cleared prior to the
			// processing of each XR animation frame.
			gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer)
			const currentClearColor = gl.getParameter(gl.COLOR_CLEAR_VALUE)
			const currentClearDepth = gl.getParameter(gl.DEPTH_CLEAR_VALUE)
			const currentClearStencil = gl.getParameter(gl.STENCIL_CLEAR_VALUE)
			gl.clearColor(0.0, 0.0, 0.0, 0.0)
			gl.clearDepth(1.0)
			gl.clearStencil(0)
			gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT)
			gl.clearColor(currentClearColor[0], currentClearColor[1], currentClearColor[2], currentClearColor[3])
			gl.clearDepth(currentClearDepth)
			gl.clearStencil(currentClearStencil)
		}

		let origWidth, origHeight

		const blitTextureToDefaultFramebufferIfNeeded = () => {
			if (!this[PRIVATE].LookingGlassEnabled) return
			// Make sure the default framebuffer has the correct size (undo any resizing
			// the host page did, and updating for the latest calibration value).
			// But store off any resizing the host page DID do, so we can restore it on exit.

			// check the dimensions of the canvas and ensure that we're not capturing
			if ((appCanvas.width !== cfg.calibration.screenW.value || appCanvas.height !== cfg.calibration.screenH.value) && !cfg.capturing) {
				console.log('resizing canvas')
				console.log('app',appCanvas.width, 'width',appCanvas.height, 'height')
				console.log('looking glass', lkgCanvas.width,'width', lkgCanvas.height,'height')
				origWidth = appCanvas.width
				origHeight = appCanvas.height
				appCanvas.width = cfg.calibration.screenW.value
				appCanvas.height = cfg.calibration.screenH.value
				console.log('new width and height',appCanvas.width, 'width',appCanvas.height, 'height')
			}

			const oldVAO = gl.getParameter(GL_VERTEX_ARRAY_BINDING)
			const oldCullFace = gl.getParameter(gl.CULL_FACE)
			const oldBlend = gl.getParameter(gl.BLEND)
			const oldDepthTest = gl.getParameter(gl.DEPTH_TEST)
			const oldStencilTest = gl.getParameter(gl.STENCIL_TEST)
			const oldScissorTest = gl.getParameter(gl.SCISSOR_TEST)
			const oldViewport = gl.getParameter(gl.VIEWPORT)
			const oldFramebufferBinding = gl.getParameter(gl.FRAMEBUFFER_BINDING)
			const oldRenderbufferBinding = gl.getParameter(gl.RENDERBUFFER_BINDING)
			const oldProgram = gl.getParameter(gl.CURRENT_PROGRAM)
			const oldActiveTexture = gl.getParameter(gl.ACTIVE_TEXTURE)
			{
				const oldTextureBinding = gl.getParameter(gl.TEXTURE_BINDING_2D)
				{
					gl.bindFramebuffer(gl.FRAMEBUFFER, null)
					gl.useProgram(program)

					glBindVertexArray(vao)

					gl.activeTexture(gl.TEXTURE0)
					gl.bindTexture(gl.TEXTURE_2D, texture)

					gl.disable(gl.BLEND)
					gl.disable(gl.CULL_FACE)
					gl.disable(gl.DEPTH_TEST)
					gl.disable(gl.STENCIL_TEST)
					gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)

					// Render the swizzled view for the display
					gl.uniform1i(u_viewType, 0)
					gl.drawArrays(gl.TRIANGLES, 0, 6)

					// Copy it into the canvas that's actually on the display
					lkgCtx?.clearRect(0, 0, lkgCanvas.width, lkgCanvas.height)
					// if we're not capturing, copy the quilt to the Looking Glass
					if (!cfg.capturing) {
					// draw the image from the source canvas which is the framebuffer width and height, to the device canvas which is the device width and height
					lkgCtx?.drawImage(appCanvas, 0, 0, 1536, 2048, 0,0, 1536, 2048)
					}
					// Render the quilt or centered inline view to the canvas
					if (cfg.inlineView !== 0) {
						// If we're capturing, resize the canvas to the framebuffer size
						if (cfg.capturing && appCanvas.width !== cfg.framebufferWidth) {
							appCanvas.width = cfg.framebufferWidth
							appCanvas.height = cfg.framebufferHeight
							gl.viewport(0,0,cfg.framebufferHeight, cfg.framebufferWidth)
						}
						gl.uniform1i(u_viewType, cfg.inlineView)
						gl.drawArrays(gl.TRIANGLES, 0, 6)
					
					}
				}
				gl.bindTexture(gl.TEXTURE_2D, oldTextureBinding)
			}
			gl.activeTexture(oldActiveTexture)
			gl.useProgram(oldProgram)
			gl.bindRenderbuffer(gl.RENDERBUFFER, oldRenderbufferBinding)
			gl.bindFramebuffer(gl.FRAMEBUFFER, oldFramebufferBinding)
			gl.viewport(...oldViewport)
			;(oldScissorTest ? glEnable : glDisable)(gl.SCISSOR_TEST)
			;(oldStencilTest ? glEnable : glDisable)(gl.STENCIL_TEST)
			;(oldDepthTest ? glEnable : glDisable)(gl.DEPTH_TEST)
			;(oldBlend ? glEnable : glDisable)(gl.BLEND)
			;(oldCullFace ? glEnable : glDisable)(gl.CULL_FACE)
			glBindVertexArray(oldVAO)
		}

		let popup
		window.addEventListener("unload", () => {
			if (popup) popup.close()
			popup = undefined
		})
		const moveCanvasToWindow = (enabled, onbeforeunload) => {
			if (!!popup == enabled) return

			if (enabled) {
				recompileProgram()

				lkgCanvas.style.position = "fixed"
				lkgCanvas.style.bottom = "0"
				lkgCanvas.style.left = "0"

				lkgCanvas.width = 1536
				lkgCanvas.height = 2048

				document.body.appendChild(controls)
				const screenPlacement = "getScreenDetails" in window
				try {
				} catch {
					console.log("user did not allow window placement, using normal popup instead")
				}
				if (screenPlacement) {
					// use chrome's screen placement to automatically position the window.
					// seems to have issues with full screen on MacOS
					this.placeWindow(popup, lkgCanvas, cfg)
				} else {
					// open a normal pop up window, user will need to move it to the Looking Glass
					popup = window.open("", undefined, "width=640,height=360")
					popup.document.title = "Looking Glass Window (fullscreen me on Looking Glass!)"
					popup.document.body.style.background = "black"
					popup.document.body.appendChild(lkgCanvas)
					console.assert(onbeforeunload)
					popup.onbeforeunload = onbeforeunload
				}
				// destroy the window
			} else {
				controls.parentElement?.removeChild(controls)

				appCanvas.width = origWidth
				appCanvas.height = origHeight

				popup.onbeforeunload = undefined
				popup.close()
				popup = undefined
			}
		}

		this[PRIVATE] = {
			LookingGlassEnabled: false,
			framebuffer,
			clearFramebuffer,
			blitTextureToDefaultFramebufferIfNeeded,
			moveCanvasToWindow,
		}
	}
	// if chromium, use the Screen Placement API to automatically place the window in the correct location, compensate for address bar
	private async placeWindow(popup, lkgCanvas: HTMLCanvasElement, config: any) {
		const screenDetails = await window.getScreenDetails()
		console.log(screenDetails, "cached screen details")
		//temporary, grab the first monitor ID with "LKG" Todo: make more robust
		const LKG = screenDetails.screens.filter((screen) => screen.label.includes("LKG"))[0]
		console.log(LKG)
		console.log("monitor ID", LKG.label, "serial number", config._calibration.serial)
		const features = [
			`left=${LKG.left}`,
			`top=${LKG.top}`,
			`width=${LKG.width}`,
			`height=${LKG.height}`,
			`menubar=no`,
			`toolbar=no`,
			`location=no`,
			`status=no`,
			`resizable=yes`,
			`scrollbars=no`,
			`fullscreenEnabled=true`,
		].join(",")
		console.log(config.calibration.slope.value, 'raw slope')
		console.log(config.tilt, 'adjusted slope')
		popup = window.open("", "new", features)
		console.log(popup)
		popup.document.body.style.background = "black"
		popup.document.body.appendChild(lkgCanvas)
		await lkgCanvas.requestFullscreen()
	}

	get framebuffer() {
		return this[PRIVATE].LookingGlassEnabled ? this[PRIVATE].framebuffer : null
	}
	get framebufferWidth() {
		return getLookingGlassConfig().framebufferWidth
	}
	get framebufferHeight() {
		return getLookingGlassConfig().framebufferHeight
	}
}
