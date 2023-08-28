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

import API from "@lookingglass/webxr-polyfill/src/api/index"
import XRSystem from "@lookingglass/webxr-polyfill/src/api/XRSystem"
import WebXRPolyfill from "@lookingglass/webxr-polyfill/src/WebXRPolyfill"
import { getLookingGlassConfig, updateLookingGlassConfig, ViewControlArgs } from "./LookingGlassConfig"
import LookingGlassXRDevice from "./LookingGlassXRDevice"
import LookingGlassXRWebGLLayer from "./LookingGlassXRWebGLLayer"

export class LookingGlassWebXRPolyfill extends WebXRPolyfill {
	private vrButton: HTMLButtonElement | null | undefined
	public device: LookingGlassXRDevice | undefined
	/** 在Looking Glass中预览时, 设置为true */
	public isPresenting: boolean = false

	constructor(cfg?: Partial<ViewControlArgs>) {
		super()
		// Init the configuration
		updateLookingGlassConfig(cfg)
		this.loadPolyfill()
	}

	static async init(cfg?: Partial<ViewControlArgs>) {
			new LookingGlassWebXRPolyfill(cfg)
	}

	/**Load  the polyfill*/
	private async loadPolyfill() {
		this.overrideDefaultVRButton()

		console.warn('Looking Glass WebXR "polyfill" overriding native WebXR API.')
		for (const className in API) {
			this.global[className] = API[className]
		}
		this.global.XRWebGLLayer = LookingGlassXRWebGLLayer

		this.injected = true

		// 加载模拟的xr设备
		this.device = new LookingGlassXRDevice(this.global)
		this.xr = new XRSystem(Promise.resolve(this.device))
		Object.defineProperty(this.global.navigator, "xr", {
			value: this.xr,
			configurable: true,
		})
	}

	/** 如果存在"Enter VR" 按钮, 则重写按钮 */
	private async overrideDefaultVRButton() {
		this.vrButton = await waitForElement<HTMLButtonElement>("VRButton")

		if (this.vrButton && this.device) {
			this.device.addEventListener("@@webxr-polyfill/vr-present-start", () => {
				this.isPresenting = true
				this.updateVRButtonUI()
			})

			this.device.addEventListener("@@webxr-polyfill/vr-present-end", () => {
				this.isPresenting = false
				this.updateVRButtonUI()
			})

			this.vrButton.addEventListener("click", (ev: MouseEvent) => {
				console.log('button click', ev)
				this.updateVRButtonUI()
			})

			this.updateVRButtonUI()
		} else {
			console.warn("Unable to find VRButton")
		}
	}

	/** 修改vrbutton样式 */
	private async updateVRButtonUI() {
		if (this.vrButton) {
			// Hack: Need to delay slightly in order to properly update
			await delay(100)
			if (this.isPresenting) {
				this.vrButton.innerHTML = "EXIT LOOKING GLASS"
			} else {
				this.vrButton.innerHTML = "ENTER LOOKING GLASS"
			}

			const width = 220
			this.vrButton.style.width = `${width}px`
			this.vrButton.style.left = `calc(50% - ${width / 2}px)`
		}
	}

	public update(cfg: Partial<ViewControlArgs>) {
		updateLookingGlassConfig(cfg)
	}
}

/** Wait for an HTMLElement with a specific id to be added to the page */
async function waitForElement<T extends HTMLElement>(id: string): Promise<T | null> {
    return new Promise<T | null>((resolve) => {
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                mutation.addedNodes.forEach(function (node) {
                    const el = node as T
                    if (el.id === id) {
                        resolve(el)
                        observer.disconnect()
                    }
                });
            });
        });

        observer.observe(document.body, { subtree: false, childList: true });

        // 如果没找到节点, 则在5秒后断开监听
        setTimeout(() => {
            observer.disconnect();
            resolve(null); // Resolve with null instead of rejecting
        }, 5000);
    });
}

function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Get the global Looking Glass Config.
 * This can be used to update any config value in realtime by setting it like follows
 * let config = LookingGlassConfig
 * config.trackballX = Math.PI / 2
 * ```
 */
export const LookingGlassConfig = getLookingGlassConfig()
