window.onload = (() => {
    try {
        let fractal    = new Mandelbrot("mandelbrot-canvas"),
            
            infoX      = document.getElementById("mandelbrot-cam-x"),
            infoY      = document.getElementById("mandelbrot-cam-y"),
            infoZoom   = document.getElementById("mandelbrot-zoom"),
            infoIter   = document.getElementById("mandelbrot-iter"),
            buttonSave = document.getElementById("mandelbrot-save")


        buttonSave.addEventListener("click", () => {
            let a = document.createElement("a")

            a.href = fractal.canvas.toDataURL("image/png")
            a.target = "_blank"
            a.download = "mandelbrot_set__(" +
                    fractal.cameraX().toFixed(8) + "," +
                    fractal.cameraY().toFixed(8) + ")_x" +
                    Math.round(fractal.cameraZoom() / Mandelbrot.getDefaults().zoom) + ".png"

            document.body.appendChild(a)
            a.click()
        }, false)


        setInterval(() => {
            infoX.innerHTML = "cam-x:" + (fractal.camX < 0 ? "" : " ") + fractal.cameraX().toFixed(8)
            infoY.innerHTML = "cam-y:" + (fractal.camY < 0 ? "" : " ") + fractal.cameraY().toFixed(8)

            infoZoom.innerHTML = "zoom: " + Math.round(fractal.cameraZoom() / Mandelbrot.getDefaults().zoom)

            infoIter.innerHTML = "iterations: " + fractal.iterations
            
            if (2147483648 > fractal.cameraZoom() / Mandelbrot.getDefaults().zoom) {
                document.getElementById("mandelbrot-zoom-message").style.display = "none"
            } else {
                document.getElementById("mandelbrot-zoom-message").style.display = "block"
            }
        }, 1 / 60)

    } catch (e) {
        let message = document.getElementById("fail-message")
        message.innerHTML = "<br>:(<br>It seems like our fractal is not responding. Try to reload the page or use another browser to run fractal generator.<br>" + e.toString()
        message.style.display = "block"
    }
})();
