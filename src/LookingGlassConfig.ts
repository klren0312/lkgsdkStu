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

import * as HoloPlayCore from "holoplay-core"

export const DefaultEyeHeight: number = 1.6

type Value = {
	value: number
}

export type CalibrationArgs = {
	configVersion: string
	pitch: Value
	slope: Value
	center: Value
	viewCone: Value // 视锥
	invView: Value
	verticalAngle: Value
	DPI: Value
	screenW: Value // 屏幕宽度
	screenH: Value // 屏幕高度
	flipImageX: Value
	flipImageY: Value
	flipSubp: Value
	serial: string
}

export enum InlineView {
	/** 交织图 */
	Swizzled = 0,
	/** 中间视图 */
	Center = 1,
	/** 多视点图 */
	Quilt = 2,
}

export type ViewControlArgs = {
	/**
	 * @Deprecated: since 0.4.0 use `quiltResolution` instead
	 * Defines the height of the individual quilt view, the width is then set based on the aspect ratio of the connected device.
	 * 多视点视图高度, 根据设备比例来计算宽度
	 * @default 512
	 */
	tileHeight: number
	/**
	 * Defines the number of views to be rendered
	 * 视点数
	 * @default 45
	 */
	numViews: number
	/** 
	 * Defines the rotation of the camera on the X-axis 
	 * 相机延x轴旋转
	 * @default 0
	 */
	trackballX: number
	/** 
	 * Defines the rotation of the camera on the Y-axis 
	 * 相机延y轴旋转
	 * @default 0
	 */
	trackballY: number
	/** 
	 * Defines the position of the camera on the x-axis 
	 * 相机延x轴平移
	 * @default 0
	 */
	targetX: number
	/** 
	 * Defines the position of the camera on the Y-axis 
	 * 相机延y轴平移
	 * @default 1.6 (or `DefaultEyeHeight`)
	 */
	targetY: number
	/** 
	 * Defines the position of the camera on the Z-axis 
	 * 相机延z轴平移
	 * @default -0.5
	 */
	targetZ: number
	/** 
	 * Defines the size of the camera, this makes your scene bigger or smaller without changing the focus. 
	 * 定义相机大小, 不改变焦点
	 * @default 2.0
	 */
	targetDiam: number
	/** 
	 * Defines the vertical FOV of your camera (defined in radians) 
	 * 定义相机垂直视角(弧度)
	 * @default (13.0 / 180) * Math.PI
	 */
	fovy: number
	/** 
	 * Modifies to the view frustum to increase or decrease the perceived depth of the scene. 
	 * 增加/减少场景感知深度
	 * @default 1.25
	 */
	depthiness: number
	/** 
	 * Changes how the original canvas on your main web page is displayed, can show the encoded subpixel matrix, a single centered view, or a quilt view. 
	 * 设置主页面显示视图类型, 交织图, 中间视点图, 多视点图
	 * @default InlineView.Center
	 */
	inlineView: InlineView
	/**
	 * A reference to the popup window, this will only exist once the window is opened. Calling before the window is open will fail. 
	 * 弹框窗口对象
	 * @default Window
	 */
	popup: Window | null
	/**
	 * The current capture state, when capturing is set to true the device width and height is overridden for higher quality capture
	 * 是否按设备长宽高质量捕获
	 * @default false
	 */
	capturing: boolean
	/**
	 * A reference to the current XRSession, giving access to the WebXR rendering context, this should be read only unless you like living dangerously
	 */
	XRSession: any
	/**
	 * The current quilt resolution, this is a read only value that is set based on the connected device
	 * 多视点图分辨率, 根据连接设备设置
	 * @default 3840
	 * 
	 */
	quiltResolution: number
	/**
	 * The Canvas on the Looking Glass
	 * @default null
	 */
	lkgCanvas: HTMLCanvasElement | null
	/**
	 * The main webgl context
	 * @default null
	 */
	appCanvas: HTMLCanvasElement | null
}

type LookingGlassConfigEvent = "on-config-changed"

export class LookingGlassConfig extends EventTarget {
	// Calibration defaults
	// 校准默认值
	private _calibration: CalibrationArgs = {
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
	}

	// Config defaults
	// 默认配置
	private _viewControls: ViewControlArgs = {
		tileHeight: 512,
		numViews: 48,
		trackballX: 0,
		trackballY: 0,
		targetX: 0,
		targetY: DefaultEyeHeight,
		targetZ: -0.5,
		targetDiam: 2.0,
		fovy: (13.0 / 180) * Math.PI,
		depthiness: 1.25,
		inlineView: InlineView.Center,
		capturing: false,
		quiltResolution: 3840,
		popup: null, // 预览弹窗
		XRSession: null,
		lkgCanvas: null, // 预览canvas
		appCanvas: null // 主canvas
	}
	LookingGlassDetected: any

	constructor(cfg?: Partial<ViewControlArgs>) {
		super()
		this._viewControls = { ...this._viewControls, ...cfg }
		this.syncCalibration()
	}

	// 跟设备同步校准值
	private syncCalibration() {
		const client = new HoloPlayCore.Client(
			(msg) => {
				if (msg.devices.length < 1) {
					console.log("No Looking Glass devices found")
					return
				}
				if (msg.devices.length > 1) {
					console.log("More than one Looking Glass device found... using the first one")
				}
				this.calibration = msg.devices[0].calibration
			},
		)
	}

	public addEventListener(
		type: LookingGlassConfigEvent,
		callback: EventListenerOrEventListenerObject | null,
		options?: boolean | AddEventListenerOptions | undefined
	): void {
		super.addEventListener(type, callback, options)
	}

	private onConfigChange() {
		this.dispatchEvent(new Event("on-config-changed"))
	}

	public get calibration(): CalibrationArgs {
		return this._calibration
	}

	public set calibration(value: Partial<CalibrationArgs>) {
		this._calibration = {
			...this._calibration,
			...value,
		}
		this.onConfigChange()
	}

	public updateViewControls(value: Partial<ViewControlArgs> | undefined) {
		if (value != undefined) {
			this._viewControls = {
				...this._viewControls,
				...value,
			}
			this.onConfigChange()
		}
	}

	// configurable

	/**
	 * @deprecated defines the height of the individual quilt view, the width is then set based on the aspect ratio of the connected device.
	 */
	public get tileHeight(): number {
		return Math.round(this.framebufferHeight / this.quiltHeight)
	}

	/**
	 * defines the quilt resolution, only change this at start, do not change this after an XRSession has started
	 * 定义多视点图分辨率, 只在开始时修改, 开始后不再修改
	 */

	public get quiltResolution(): number {
		return this._viewControls.quiltResolution
	}

	set quiltResolution(v: number) {
		this.updateViewControls({ quiltResolution: v })
	}

	/**
	 * defines the number of views to be rendered
	 * 被渲染的视点数
	 */
	get numViews() {
		return (this.quiltWidth * this.quiltHeight)
	}

	/**
	 * defines the position of the camera on the X-axis
	 * 相机离X距离
	 */
	get targetX() {
		return this._viewControls.targetX
	}

	set targetX(v) {
		this.updateViewControls({ targetX: v })
	}

	/**
	 * defines the position of the camera on the Y-axis
	 * 相机离y轴距离
	 */
	get targetY() {
		return this._viewControls.targetY
	}

	set targetY(v) {
		this.updateViewControls({ targetY: v })
	}

	/**
	 * defines the position of the camera on the Z-axis
	 * 相机离z轴距离
	 */
	get targetZ() {
		return this._viewControls.targetZ
	}

	set targetZ(v) {
		this.updateViewControls({ targetZ: v })
	}

	/**
	 * defines the rotation of the camera on the X-axis
	 * 相机沿x轴旋转角度
	 */
	get trackballX() {
		return this._viewControls.trackballX
	}

	set trackballX(v) {
		this.updateViewControls({ trackballX: v })
	}

	/**
	 * defines the rotation of the camera on the Y-axis
	 * 相机沿y轴旋转角度
	 */
	get trackballY() {
		return this._viewControls.trackballY
	}

	set trackballY(v) {
		this.updateViewControls({ trackballY: v })
	}

	/**
	 * defines the size of the camera, this makes your scene bigger or smaller without changing the focus.
	 * 相机大小, 改变聚焦场景大小
	 */
	get targetDiam() {
		return this._viewControls.targetDiam
	}

	set targetDiam(v) {
		this.updateViewControls({ targetDiam: v })
	}

	/**
	 * defines the vertical FOV of your camera (defined in radians)
	 * 定义相机垂直视角(弧度值)
	 */
	get fovy() {
		return this._viewControls.fovy
	}

	set fovy(v) {
		this.updateViewControls({ fovy: v })
	}

	/**
	 * modifies to the view frustum to increase or decrease the perceived depth of the scene.
	 * 增加或减少场景深度
	 */
	get depthiness() {
		return this._viewControls.depthiness
	}

	set depthiness(v) {
		this.updateViewControls({ depthiness: v })
	}

	/**
	 * changes how the original canvas on your main web page is displayed, can show the encoded subpixel matrix, a single centered view, or a quilt view.
	 * 视图类型
	 */
	get inlineView() {
		return this._viewControls.inlineView
	}

	set inlineView(v) {
		this.updateViewControls({ inlineView: v })
	}

	get capturing() {
		return this._viewControls.capturing
	}

	set capturing(v : boolean) {
		this.updateViewControls({ capturing: v })
	}

	get popup() {
		return this._viewControls.popup
	}

	set popup(v : Window | null) {
		this.updateViewControls({ popup: v })
	}

	get XRSession() {
		return this._viewControls.XRSession
	}

	set XRSession(v) {
		this.updateViewControls({XRSession: v})
	}

	get lkgCanvas() {
		return this._viewControls.lkgCanvas
	}

	set lkgCanvas(v) {
		this.updateViewControls({lkgCanvas: v})
	}

	get appCanvas() {
		return this._viewControls.appCanvas
	}

	set appCanvas(v) {
		this.updateViewControls({appCanvas: v})
	}

	// Computed

	public get aspect() {
		return (this._calibration.screenW.value / this._calibration.screenH.value)
	}

	public get tileWidth() {
		return Math.round(this.framebufferWidth / this.quiltWidth)
	}

	public get framebufferWidth() {
		if (this._calibration.screenW.value < 7000) return this._viewControls.quiltResolution
		else return 7680
	}

	// number of columns
	// 列数
	public get quiltWidth() {
		if (this.calibration.screenW.value == 1536) { // 2048 x 1536 2K
			return 8
		}
		else if (this.calibration.screenW.value == 3840) { // 3840 x 2160 4K
			return 5

		}
		else if (this.calibration.screenW.value > 7000) {
			return 5
		}
		else {
			return 8
		}
	}

	// 行数
	public get quiltHeight() {
		if (this.calibration.screenW.value == 1536) {
			return 6
		}
		else if (this.calibration.screenW.value == 3840) {
			return 9

		}
		else if (this.calibration.screenW.value > 7000) {
			return 9
		}
		else {
			return 6
		}
	}

	public get framebufferHeight() {
		if (this._calibration.screenW.value < 7000) return this._viewControls.quiltResolution
		else return 4320
	}

	/**
	 * 视角
	 */
	public get viewCone() {
		// 初始角度乘景深 得到视锥体相对初始角度的缩放比例
		return ((this._calibration.viewCone.value * this.depthiness) / 180) * Math.PI
	}

	public get tilt() {
		return (
			(this._calibration.screenH.value / (this._calibration.screenW.value * this._calibration.slope.value)) *
			(this._calibration.flipImageX.value ? -1 : 1)
		)
	}

	public set tilt(windowHeight) {
		windowHeight
	}

	public get subp() {
		return 1 / (this._calibration.screenW.value * 3)
	}

	public get pitch() {
		const screenInches = this._calibration.screenW.value / this._calibration.DPI.value
		return this._calibration.pitch.value * screenInches * Math.cos(Math.atan(1.0 / this._calibration.slope.value))
	}
}

let globalLkgConfig: LookingGlassConfig | null = null

/** The global LookingGlassConfig */
export function getLookingGlassConfig() {
	if (globalLkgConfig == null) {
		globalLkgConfig = new LookingGlassConfig()
	}
	return globalLkgConfig
}

/** Update the global LookingGlassConfig's viewControls */
export function updateLookingGlassConfig(viewControls: Partial<ViewControlArgs> | undefined) {
	const lkgConfig = getLookingGlassConfig()
	if (viewControls != undefined) {
		lkgConfig.updateViewControls(viewControls)
	}
}
