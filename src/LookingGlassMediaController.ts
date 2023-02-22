import { LookingGlassConfig } from './LookingGlassConfig';

export function LookingGlassMediaController(appCanvas: HTMLCanvasElement, cfg: LookingGlassConfig) {

	const screenshotbutton = document.getElementById("screenshotbutton") as HTMLButtonElement | null
	screenshotbutton?.addEventListener("click", downloadImage)

	function downloadImage() {
		// capturing must be set to true before downloading an image in order to capture a high quality quilt. TODO: manually grab XRsession framebuffer instead
			let url = appCanvas.toDataURL()
			const a = document.createElement("a")
			a.style.display = "none"
			a.href = url
			  a.download = `hologram_qs${cfg.quiltWidth}x${cfg.quiltHeight}a${cfg.aspect}.png`;
			document.body.appendChild(a)
			a.click()
			document.body.removeChild(a)
			window.URL.revokeObjectURL(url)
		}
}

