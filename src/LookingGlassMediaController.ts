import { LookingGlassConfig } from './LookingGlassConfig';

export function LookingGlassMediaController(appCanvas: HTMLCanvasElement, cfg: LookingGlassConfig) {
	const mediaSource = new MediaSource()
	mediaSource.addEventListener("sourceopen", handleSourceOpen, false)
	let mediaRecorder
	let recordedBlobs
	let sourceBuffer
	let stream

	const video = document.getElementById("looking-glass-video") as HTMLVideoElement | null
	const recordButton = document.getElementById("recordbutton") as HTMLButtonElement | null
	const downloadButton = document.getElementById("downloadbutton") as HTMLButtonElement | null
	const screenshotbutton = document.getElementById("screenshotbutton") as HTMLButtonElement | null
	recordButton?.addEventListener("click", toggleRecording)
	downloadButton?.addEventListener("click", downloadVideo)
	screenshotbutton?.addEventListener("click", downloadImage)

	function handleSourceOpen(event) {
		console.log("MediaSource opened")
		sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="h264"')
		console.log("Source buffer: ", sourceBuffer)
	}

	function handleDataAvailable(event) {
		if (event.data && event.data.size > 0) {
			recordedBlobs.push(event.data)
		}
	}

	function handleStop(event) {
		console.log("Recorder stopped: ", event)
		const superBuffer = new Blob(recordedBlobs, { type: "video/webm" })
		if (video) {
			video.src = window.URL.createObjectURL(superBuffer)
		}
	}

	function toggleRecording() {
		if (stream == null) {
			stream = appCanvas.captureStream() // frames per second
			console.log("Started stream capture from canvas element: ", stream)
		}
		// if stream exists, stop it
		else {
			stream = null // frames per second
			console.log("theoretically set stream to null and stop capture", stream)
		}

		if (cfg.capturing === false) {
			// set capturing to true before recording starts
			cfg.capturing = true
			// in order to record a quilt video the inline view must be set to quilt
			if (cfg.inlineView != 2) {
				cfg.inlineView = 2
			}
			startRecording()
		} else {
			stopRecording()
			cfg.capturing = false
			if (recordButton && downloadButton) {
				recordButton.textContent = "Record"
				downloadButton.disabled = false
			}
		}
	}

	// The nested try blocks will be simplified when Chrome 47 moves to Stable
	function startRecording() {
		let options = { mimeType: "video/webm" }
		recordedBlobs = []
		try {
			mediaRecorder = new MediaRecorder(stream, options)
		} catch (e0) {
			console.log("Unable to create MediaRecorder with options Object: ", e0)
			try {
				options = { mimeType: "video/webm,codecs=h264" }
				mediaRecorder = new MediaRecorder(stream, options)
			} catch (e1) {
				console.log("Unable to create MediaRecorder with options Object: ", e1)
				try {
					options = { mimeType: "video/h264" } // Chrome 47
					mediaRecorder = new MediaRecorder(stream, options)
				} catch (e2) {
					alert(
						"MediaRecorder is not supported by this browser.\n\n" +
							"Try Firefox 29 or later, or Chrome 47 or later, " +
							"with Enable experimental Web Platform features enabled from chrome://flags."
					)
					console.error("Exception while creating MediaRecorder:", e2)
					return
				}
			}
		}
		console.log("Created MediaRecorder", mediaRecorder, "with options", options)
		if (recordButton && downloadButton) {
			recordButton.textContent = "Stop Recording"
			downloadButton.disabled = true
		}
		mediaRecorder.onstop = handleStop
		mediaRecorder.ondataavailable = handleDataAvailable
		mediaRecorder.start(100) // collect 100ms of data
		console.log("MediaRecorder started", mediaRecorder)
	}

	function stopRecording() {
		mediaRecorder.stop()
		console.log("Recorded Blobs: ", recordedBlobs)
	}

	function downloadVideo() {
		const blob = new Blob(recordedBlobs, { type: "video/webm" })
		const url = window.URL.createObjectURL(blob)
		const a = document.createElement("a")
		a.style.display = "none"
		a.href = url
		a.download = `hologram_qs${cfg.quiltWidth}x${cfg.quiltHeight}a${cfg.aspect}.webm`
		document.body.appendChild(a)
		a.click()
		setTimeout(() => {
			document.body.removeChild(a)
			window.URL.revokeObjectURL(url)
		}, 100)
	}

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

// create an image from a webGL texture and download it

