import { getLookingGlassConfig } from "./LookingGlassConfig"
import LookingGlassXRDevice from "./LookingGlassXRDevice"

export async function LookingGlassMediaController() {
	const cfg = getLookingGlassConfig()

	// the function to download the image from the canvas
	function downloadImage() {
		if (cfg.appCanvas != null) {
			try {
				let url = cfg.appCanvas.toDataURL()
				const a = document.createElement("a")
				a.style.display = "none"
				a.href = url
				a.download = `hologram_qs${cfg.quiltWidth}x${cfg.quiltHeight}a${cfg.aspect}.png`
				document.body.appendChild(a)
				a.click()
				document.body.removeChild(a)
				window.URL.revokeObjectURL(url)
			} catch (error) {
				console.error("Error while capturing canvas data:", error)
			}
		}
	}

	const screenshotButton = document.getElementById("screenshotbutton") as HTMLButtonElement | null
	// add screenshot button listener, this calls the downloadImage function only at the end of the frame loop
	if (screenshotButton) {
		screenshotButton.addEventListener("click", () => {
			const xrDevice = LookingGlassXRDevice.getInstance()
			if (!xrDevice) {
				console.warn("LookingGlassXRDevice not initialized")
				return
			}
			xrDevice.captureScreenshot = true
			xrDevice.screenshotCallback = downloadImage
		})
	}
}

// make request and cancel generic to support most browsers
const idleOptions = { timeout: 1000 }
const request = window.requestIdleCallback || window.requestAnimationFrame
const cancel = window.cancelIdleCallback || window.cancelAnimationFrame

// controllable promise
const resolveWhenIdle = {
	request: request,
	cancel: cancel,
	promise: (num) => new Promise((resolve) => request(resolve, Object.assign({}, idleOptions, num))),
}

export { resolveWhenIdle }
