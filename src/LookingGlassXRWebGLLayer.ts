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
import { Shader } from "holoplay-core" // 见根目录 shader.js
import { getLookingGlassConfig } from "./LookingGlassConfig"
import { moveCanvasToWindow } from "./LookingGlassWindow"

export const PRIVATE = Symbol("LookingGlassXRWebGLLayer")

export type Viewport = { 0 }

export default class LookingGlassXRWebGLLayer extends XRWebGLLayer {
	constructor(session: any, gl: WebGL2RenderingContext, layerInit: any) {
		super(session, gl, layerInit)
		// 获取配置信息
		const cfg = getLookingGlassConfig()

		// 主canvas
		cfg.appCanvas = gl.canvas as HTMLCanvasElement

		// 创建一个新的canvas节点, 来给预览窗口使用
		cfg.lkgCanvas = document.createElement("canvas")
		cfg.lkgCanvas.tabIndex = 0
		const lkgCtx = cfg.lkgCanvas.getContext("2d", { alpha: false })
		// 双击全屏
		cfg.lkgCanvas.addEventListener("dblclick", function () {
			this.requestFullscreen()
		})

		// 设置 framebuffer/texture.

		const config = this[XRWebGLLayer_PRIVATE].config
		// 创建贴图
		const texture = gl.createTexture()
		let depthStencil, dsConfig
		// 创建帧缓冲区
		const framebuffer = gl.createFramebuffer()

		// 使用VAO
		const OES_VAO = gl.getExtension("OES_vertex_array_object")
		const GL_VERTEX_ARRAY_BINDING = 0x85b5 // VERTEX_ARRAY_BINDING
		const glBindVertexArray = OES_VAO ? OES_VAO.bindVertexArrayOES.bind(OES_VAO) : gl.bindVertexArray.bind(gl)

		// 创建深度模板缓冲区
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

		// utility functions for allocating the framebuffer resources
		/**
		 * 分配帧缓冲附件
		 * 
		 * @param gl WebGL上下文
		 * @param texture 图像纹理
		 * @param depthStencil 深度缓冲区
		 * @param dsConfig 深度缓冲区配置
		 * @param cfg 配置信息
		 */
		const allocateFramebufferAttachments = (gl, texture, depthStencil, dsConfig, cfg) => {
			allocateTexture(gl, texture, cfg.framebufferWidth, cfg.framebufferHeight)
			if (depthStencil) {
				allocateDepthStencil(gl, depthStencil, dsConfig, cfg.framebufferWidth, cfg.framebufferHeight)
			}
		}

		// 分配fbo贴图
		const allocateTexture = (gl, texture, width, height) => {
			const oldTextureBinding = gl.getParameter(gl.TEXTURE_BINDING_2D)
			gl.bindTexture(gl.TEXTURE_2D, texture)
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
			gl.bindTexture(gl.TEXTURE_2D, oldTextureBinding)
		}

		// 分配深度缓冲
		const allocateDepthStencil = (gl, depthStencil, dsConfig, width, height) => {
			const oldRenderbufferBinding = gl.getParameter(gl.RENDERBUFFER_BINDING)
			gl.bindRenderbuffer(gl.RENDERBUFFER, depthStencil)
			gl.renderbufferStorage(gl.RENDERBUFFER, dsConfig.format, width, height)
			gl.bindRenderbuffer(gl.RENDERBUFFER, oldRenderbufferBinding)
		}

		// 初始化fbo
		const setupFramebuffer = (gl, framebuffer, texture, dsConfig, depthStencil, config) => {
			// 用于获取当前绑定到帧缓冲对象
			const oldFramebufferBinding = gl.getParameter(gl.FRAMEBUFFER_BINDING)
			gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
			if (config.depth || config.stencil) {
				gl.framebufferRenderbuffer(gl.FRAMEBUFFER, dsConfig.attachment, gl.RENDERBUFFER, depthStencil)
			}
			// 恢复之前的帧缓冲区
			gl.bindFramebuffer(gl.FRAMEBUFFER, oldFramebufferBinding)
		}

		allocateFramebufferAttachments(gl, texture, depthStencil, dsConfig, cfg)

		// 监听配置修改后 重新分配帧缓冲区
		cfg.addEventListener("on-config-changed", () => allocateFramebufferAttachments(gl, texture, depthStencil, dsConfig, cfg))

		// 初始化帧缓冲区
		setupFramebuffer(gl, framebuffer, texture, dsConfig, depthStencil, config)

		// 顶点着色器shader
		// Set up blit from texture to screen.

		const vertexShaderSource = `
		attribute vec2 a_position;
		varying vec2 v_texcoord;
		void main() {
			// 归一化, 将顶点坐标从 [-1, 1] -> [0, 1]
		  gl_Position = vec4(a_position * 2.0 - 1.0, 0.0, 1.0);
		  v_texcoord = a_position;
		}
	  `

		// 创建shader
		function createShader (gl, type, source) {
			const shader = gl.createShader(type)
			gl.shaderSource(shader, source)
			gl.compileShader(shader)

			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				console.warn(gl.getShaderInfoLog(shader))
				return null
			}

			return shader
		}

		// shader链接program
		function setupShaderProgram(gl, vertexShaderSource, fragmentShaderSource) {
			let program = gl.createProgram()
			const vs = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
			const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

			if (vs === null || fs === null) {
				console.error("There was a problem with shader construction")
				return null
			}

			gl.attachShader(program, vs)
			gl.attachShader(program, fs)
			gl.linkProgram(program)

			if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
				console.warn(gl.getProgramInfoLog(program))
				return null
			}

			return program
		}

		let currentFs;
		let lastGeneratedFSSource;
		let a_location;
		let u_viewType;

		// 重新编译fragmentshader
		const recompileFragmentShaderIfNeeded = (gl, cfg, shaderFn) => {
			const fsSource = shaderFn(cfg); // 通过配置生成shader代码
			if (fsSource === lastGeneratedFSSource) return;
			// 记录最后一次生成的片元着色器shader
			lastGeneratedFSSource = fsSource;
			
			const newFs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
			if (newFs === null) return;
			
			if (currentFs) {
			  gl.deleteShader(currentFs); // 删除旧的shader
			}
			currentFs = newFs;
		  
			// Create a new program with the updated fragment shader
			// 根据新的片元着色器shader 创建新的program
			const newProgram = setupShaderProgram(gl, vertexShaderSource, fsSource);
			if (newProgram === null) {
			  console.warn("There was a problem with shader construction");
			  return;
			}
		  
			// Update the attribute and uniform locations
			// 更新attribute和uniform
			a_location = gl.getAttribLocation(newProgram, "a_position");
			u_viewType = gl.getUniformLocation(newProgram, "u_viewType"); // 视图类型
			const u_texture = gl.getUniformLocation(newProgram, "u_texture"); // 多视点贴图
		  
			// 保存当前的program
			const oldProgram = gl.getParameter(gl.CURRENT_PROGRAM);
			{
				// 将多视点贴图传入新的program
			  gl.useProgram(newProgram);
			  gl.uniform1i(u_texture, 0); // Always use texture unit 0 for u_texture
			}
			// 恢复到之前的program
			gl.useProgram(oldProgram);
		  
			// Delete the old program and update the reference
			// 删除老的program, 更新成当前的program
			if (program) {
			  gl.deleteProgram(program);
			}
			program = newProgram;
		};
		console.log(Shader(cfg))
		// 根据配置生成片元着色器shader 并设置program
		let program = setupShaderProgram(gl, vertexShaderSource, Shader(cfg))
		if (program === null) {
			console.warn("There was a problem with shader construction")
		}

		// 监听, 当配置修改时, 重新编译片元着色器shader
		cfg.addEventListener("on-config-changed", () => {
			recompileFragmentShaderIfNeeded(gl, cfg, Shader);
		});

		const vao = OES_VAO ? OES_VAO.createVertexArrayOES() : gl.createVertexArray()
		const vbo = gl.createBuffer()
		const oldBufferBinding = gl.getParameter(gl.ARRAY_BUFFER_BINDING)
		const oldVAO = gl.getParameter(GL_VERTEX_ARRAY_BINDING)
		// 设置交织图平面顶点, 使用顶点插件保存到vao
		{
			glBindVertexArray(vao)
			gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), gl.STATIC_DRAW)
			gl.enableVertexAttribArray(a_location)
			gl.vertexAttribPointer(a_location, 2, gl.FLOAT, false, 0, 0)
		}

		// 恢复到之前的顶点vao
		glBindVertexArray(oldVAO)
		gl.bindBuffer(gl.ARRAY_BUFFER, oldBufferBinding)

		// 清除framebuffer
		const clearFramebuffer = () => {
			console.assert(this[PRIVATE].LookingGlassEnabled)

			// If session is not an inline session, XRWebGLLayer's composition disabled boolean
			// should be false and then framebuffer should be marked as opaque.
			// The buffers attached to an opaque framebuffer must be cleared prior to the
			// processing of each XR animation frame.
			// 如果会话不是即时渲染, XRWebGLLayer的组合禁用标志应为false, 并且帧缓冲区应该被标记为不透明
			// 绑定到不透明帧缓冲的缓冲区, 在处理每个XR动画帧之前必须被清除
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

		// 如果需要将纹理渲染到默认的帧缓冲区上
		function blitTextureToDefaultFramebufferIfNeeded() {
			if (!cfg.appCanvas || !cfg.lkgCanvas) {
				return
			}

			// 修改canvas大小
			if (cfg.appCanvas.width !== cfg.framebufferWidth || cfg.appCanvas.height !== cfg.framebufferHeight) {
				origWidth = cfg.appCanvas.width
				origHeight = cfg.appCanvas.height
				cfg.appCanvas.width = cfg.framebufferWidth
				cfg.appCanvas.height = cfg.framebufferHeight
			}

			// 保存当前WebGL状态
			const oldState = saveWebGLState()

			// 设置渲染的WebGL状态 Set up the WebGL state for rendering
			setupRenderState()

			// 交织图底图渲染
			renderSubPixelArrangement()

			// 清空预览canvas, 绘制新图片
			updateLookingGlassCanvas()

			// 在canvas上渲染多视点图或者中间视点图
			renderInlineView()

			// 恢复webGL状态
			restoreWebGLState(oldState)
		}

		// 恢复WebGL状态到之前保存的状态
		function restoreWebGLState(oldState) {
			gl.activeTexture(oldState.activeTexture)
			gl.bindTexture(gl.TEXTURE_2D, oldState.textureBinding)
			gl.useProgram(oldState.program)
			gl.bindRenderbuffer(gl.RENDERBUFFER, oldState.renderbufferBinding)
			gl.bindFramebuffer(gl.FRAMEBUFFER, oldState.framebufferBinding)
			// gl.viewport(oldViewport[0], oldViewport[1], oldViewport[2], oldViewport[3]);

			if (oldState.scissorTest) {
				gl.enable(gl.SCISSOR_TEST)
			} else {
				gl.disable(gl.SCISSOR_TEST)
			}

			if (oldState.stencilTest) {
				gl.enable(gl.STENCIL_TEST)
			} else {
				gl.disable(gl.STENCIL_TEST)
			}

			if (oldState.depthTest) {
				gl.enable(gl.DEPTH_TEST)
			} else {
				gl.disable(gl.DEPTH_TEST)
			}

			if (oldState.blend) {
				gl.enable(gl.BLEND)
			} else {
				gl.disable(gl.BLEND)
			}

			if (oldState.cullFace) {
				gl.enable(gl.CULL_FACE)
			} else {
				gl.disable(gl.CULL_FACE)
			}

			glBindVertexArray(oldState.VAO)
		}

		/**
		 * 保存当前WebGL状态
		 * @returns {Object} The current WebGL state
		 */
		function saveWebGLState() {
			return {
				VAO: gl.getParameter(gl.VERTEX_ARRAY_BINDING),
				cullFace: gl.getParameter(gl.CULL_FACE),
				blend: gl.getParameter(gl.BLEND),
				depthTest: gl.getParameter(gl.DEPTH_TEST),
				stencilTest: gl.getParameter(gl.STENCIL_TEST),
				scissorTest: gl.getParameter(gl.SCISSOR_TEST),
				viewport: gl.getParameter(gl.VIEWPORT),
				framebufferBinding: gl.getParameter(gl.FRAMEBUFFER_BINDING),
				renderbufferBinding: gl.getParameter(gl.RENDERBUFFER_BINDING),
				program: gl.getParameter(gl.CURRENT_PROGRAM),
				activeTexture: gl.getParameter(gl.ACTIVE_TEXTURE),
				textureBinding: gl.getParameter(gl.TEXTURE_BINDING_2D),
			}
		}
		/**
		 * 设置渲染的 WebGL 状态
		 */
		function setupRenderState() {
			gl.bindFramebuffer(gl.FRAMEBUFFER, null)
			gl.useProgram(program)
			glBindVertexArray(vao)
			gl.activeTexture(gl.TEXTURE0)
			gl.bindTexture(gl.TEXTURE_2D, texture)
			gl.disable(gl.BLEND)
			gl.disable(gl.CULL_FACE)
			gl.disable(gl.DEPTH_TEST)
			gl.disable(gl.STENCIL_TEST)
			// 设置视口为当前webgl渲染上下文的宽度和高度
			gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
		}

		// Utility functions to handle rendering the correct views to the Looking Glass
		// 用于在lkg上渲染正确视图的工具方法

		/**
		 * Render the subpixel arrangment to the main canvas so it can be copied to the Looking Glass Canvas
		 * 渲染交织图的底图
		 */
		function renderSubPixelArrangement() {
			gl.uniform1i(u_viewType, 0)
			gl.drawArrays(gl.TRIANGLES, 0, 6)
		}

		/**
		 * Update the Looking Glass Canvas with the current view from the application
		 * 更新预览窗口canvas
		 */
		function updateLookingGlassCanvas() {
			if (!cfg.lkgCanvas || !cfg.appCanvas) {
				console.warn("Looking Glass Canvas is not defined")
				return
			}
			lkgCtx?.clearRect(0, 0, cfg.lkgCanvas.width, cfg.lkgCanvas.height)
			// drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
			// 把当前主canvas的截图渲染到lkgcanvas上
			lkgCtx?.drawImage(
				cfg.appCanvas,
				0,
				0,
				cfg.framebufferWidth,
				cfg.framebufferHeight,
				0,
				0,
				cfg.calibration.screenW.value,
				cfg.calibration.screenH.value
			)
		}

		/**
		 * renderInlineView overrides the subpixel arrangement view in the main canvas with either the single view or quilt view
		 * 渲染到主画布上的排列视图，可以是单一视图，也可以是被子视图
		 */
		function renderInlineView() {
			if (!cfg.appCanvas) {
				console.warn("Looking Glass Canvas is not defined")
				return
			}
			if (cfg.inlineView !== 0) {
				// 不是交织图视图时, 渲染到主canvas
				if (cfg.capturing && cfg.appCanvas.width !== cfg.framebufferWidth) {
					cfg.appCanvas.width = cfg.framebufferWidth
					cfg.appCanvas.height = cfg.framebufferHeight
					gl.viewport(0, 0, cfg.framebufferHeight, cfg.framebufferWidth)
				}
				gl.uniform1i(u_viewType, cfg.inlineView)
				gl.drawArrays(gl.TRIANGLES, 0, 6)
			}
		}

		window.addEventListener("unload", () => {
			if (cfg.popup) cfg.popup.close()
			cfg.popup = null
		})

		this[PRIVATE] = {
			LookingGlassEnabled: false,
			framebuffer,
			clearFramebuffer,
			blitTextureToDefaultFramebufferIfNeeded,
			moveCanvasToWindow,
		}
	}

	get framebuffer() {
		return this[PRIVATE].LookingGlassEnabled ? this[PRIVATE].framebuffer : null
	}
	// 获取离屏渲染的宽度
	get framebufferWidth() {
		return getLookingGlassConfig().framebufferWidth
	}
	// 获取离屏渲染的高度
	get framebufferHeight() {
		return getLookingGlassConfig().framebufferHeight
	}
}
