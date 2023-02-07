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

let quiltResolution = 3840

type Value = {
	value: number
}

export type CalibrationArgs = {
	configVersion: string
	pitch: Value
	slope: Value
	center: Value
	viewCone: Value
	invView: Value
	verticalAngle: Value
	DPI: Value
	screenW: Value
	screenH: Value
	flipImageX: Value
	flipImageY: Value
	flipSubp: Value
	serial: string
}

export enum InlineView {
	/** Show the encoded subpixel matrix */
	Swizzled = 0,
	/** A single centered view */
	Center = 1,
	/** The quilt view */
	Quilt = 2,
}

export type ViewControlArgs = {
	/**
	 * Defines the height of the individual quilt view, the width is then set based on the aspect ratio of the connected device.
	 * @default 512
	 */
	tileHeight: number
	/**
	 * Defines the number of views to be rendered
	 * @default 45
	 */
	numViews: number
	/** 
	 * Defines the rotation of the camera on the X-axis 
	 * @default 0
	 */
	trackballX: number
	/** 
	 * Defines the rotation of the camera on the Y-axis 
	 * @default 0
	 */
	trackballY: number
	/** 
	 * Defines the position of the camera on the x-axis 
	 * @default 0
	 */
	targetX: number
	/** 
	 * Defines the position of the camera on the Y-axis 
	 * @default 1.6 (or `DefaultEyeHeight`)
	 */
	targetY: number
	/** 
	 * Defines the position of the camera on the Z-axis 
	 * @default -0.5
	 */
	targetZ: number
	/** 
	 * Defines the size of the camera, this makes your scene bigger or smaller without changing the focus. 
	 * @default 2.0
	 */
	targetDiam: number
	/** 
	 * Defines the vertical FOV of your camera (defined in radians) 
	 * @default (13.0 / 180) * Math.PI
	 */
	fovy: number
	/** 
	 * Modifies to the view frustum to increase or decrease the perceived depth of the scene. 
	 * @default 1.25
	 */
	depthiness: number
	/** 
	 * Changes how the original canvas on your main web page is displayed, can show the encoded subpixel matrix, a single centered view, or a quilt view. 
	 * @default InlineView.Center
	 */
	inlineView: InlineView
	/**
	 * A reference to the popup window, this will only exist once the window is opened. Calling before the window is open will fail. 
	 * @default null
	 */
	popup: typeof Window | null
	/**
	 * The current capture state, when capturing is set to true the device width and height is overridden for higher quality capture
	 * @default false
	 */
	capturing: boolean
	/**
	 * A reference to the current XRSession, giving access to the WebXR rendering context, this should be read only
	 */
	XRSession: any
}

type LookingGlassConfigEvent = "on-config-changed"

export class LookingGlassConfig extends EventTarget {
	// Calibration defaults
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
	private _viewControls: ViewControlArgs = {
		tileHeight: 512,
		numViews: 45,
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
		popup: null, 
		XRSession: null
	}
	LookingGlassDetected: any

	constructor(cfg?: Partial<ViewControlArgs>) {
		super()
		this._viewControls = { ...this._viewControls, ...cfg }
		this.syncCalibration()
	}

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
	 * defines the height of the individual quilt view, the width is then set based on the aspect ratio of the connected device.
	 */
	public get tileHeight(): number {
		return Math.round(quiltResolution / this.quiltHeight)
	}

	set tileHeight(v: number) {
		this.updateViewControls({ tileHeight: v })
	}

	/**
	 * defines the number of views to be rendered
	 */
	get numViews() {
		return (this.quiltWidth * this.quiltHeight)
	}

	/**
	 * defines the position of the camera on the X-axis
	 */
	get targetX() {
		return this._viewControls.targetX
	}

	set targetX(v) {
		this.updateViewControls({ targetX: v })
	}

	/**
	 * defines the position of the camera on the Y-axis
	 */
	get targetY() {
		return this._viewControls.targetY
	}

	set targetY(v) {
		this.updateViewControls({ targetY: v })
	}

	/**
	 * defines the position of the camera on the X-axis
	 */
	get targetZ() {
		return this._viewControls.targetZ
	}

	set targetZ(v) {
		this.updateViewControls({ targetZ: v })
	}

	/**
	 * defines the rotation of the camera on the X-axis
	 */
	get trackballX() {
		return this._viewControls.trackballX
	}

	set trackballX(v) {
		this.updateViewControls({ trackballX: v })
	}

	/**
	 * defines the rotation of the camera on the Y-axis
	 */
	get trackballY() {
		return this._viewControls.trackballY
	}

	set trackballY(v) {
		this.updateViewControls({ trackballY: v })
	}

	/**
	 * defines the size of the camera, this makes your scene bigger or smaller without changing the focus.
	 */
	get targetDiam() {
		return this._viewControls.targetDiam
	}

	set targetDiam(v) {
		this.updateViewControls({ targetDiam: v })
	}

	/**
	 * defines the vertical FOV of your camera (defined in radians)
	 */
	get fovy() {
		return this._viewControls.fovy
	}

	set fovy(v) {
		this.updateViewControls({ fovy: v })
	}

	/**
	 * modifies to the view frustum to increase or decrease the perceived depth of the scene.
	 */
	get depthiness() {
		return this._viewControls.depthiness
	}

	set depthiness(v) {
		this.updateViewControls({ depthiness: v })
	}

	/**
	 * changes how the original canvas on your main web page is displayed, can show the encoded subpixel matrix, a single centered view, or a quilt view.
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

	set popup(v : typeof window) {
		this.updateViewControls({ popup: v })
	}

	get XRSession() {
		return this._viewControls.XRSession
	}

	set XRSession(v) {
		this.updateViewControls({XRSession: v})
	}
	// Computed

	public get aspect() {
		return (this._calibration.screenW.value / this._calibration.screenH.value)
	}

	public get tileWidth() {
		return Math.round(quiltResolution / this.quiltWidth)
	}

	public get framebufferWidth() {
		if (this._calibration.screenW.value < 8000) return quiltResolution
		else return 8192
	}

	// number of columns
	public get quiltWidth() {
		if (this.calibration.screenW.value == 1536) {
			return 8
		}
		else if (this.calibration.screenW.value == 3840) {
			return 5

		}
		else if (this.calibration.screenW.value == 8192) {
			return 5
		}
		else {
			return 1
		}
	}

	public get quiltHeight() {
		if (this.calibration.screenW.value == 1536) {
			return 6
		}
		else if (this.calibration.screenW.value == 3840) {
			return 9

		}
		else if (this.calibration.screenW.value == 8192) {
			return 9
		}
		else {
			return 1
		}
	}

	public get framebufferHeight() {
		if (this._calibration.screenW.value < 8000) return quiltResolution
		else return 8192
	}

	public get viewCone() {
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
