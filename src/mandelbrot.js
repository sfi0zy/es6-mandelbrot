class Mandelbrot {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId)
        this.context = this.canvas.getContext("2d")
        this.context.canvas.width  = window.innerWidth
        this.context.canvas.height = window.innerHeight
        this.imageData = this.context.createImageData(
                this.context.canvas.width, this.context.canvas.height)

        this.colorScheme = Mandelbrot.createRandomColorScheme()

        this.camX       = Mandelbrot.getDefaults().camX
        this.camY       = Mandelbrot.getDefaults().camY
        this.zoom       = Mandelbrot.getDefaults().zoom
        this.formula    = Mandelbrot.formula
        this.iterations = Mandelbrot.getDefaults().iterations

        this.mouseX = 0.0
        this.mouseY = 0.0
        this.mouseOnDrag = false
        this.numberOfStaticFrames = 0

        this.addEventListeners()
    }


    static getDefaults() {
        return {
            camX: 0.0,
            camY: 0.0,
            zoom: 200,
            iterations: 512,
            maxCamX: 3.0,
            minCamX: -3.0,
            maxCamY: 1.7,
            minCamY: -1.7
        }
    }



    addEventListeners() {
        this.canvas.addEventListener("mousedown", (e) => { this.onMouseDown(e) }, false);
        this.canvas.addEventListener("mouseup",   ( ) => { this.onMouseUp()    }, false);
        this.canvas.addEventListener("mousemove", (e) => { this.onMouseMove(e) }, false);

        if ("onwheel" in document) {
            // "onwheel" used IE 9+ and Firefox 17+
            this.canvas.addEventListener("wheel", (e) => {
                this.onMouseWheel(e)
            }, false);
        } else if ("onmousewheel" in document) {
            // "onmousewheel" is out-of-date event
            this.canvas.addEventListener("mousewheel", (e) => {
                this.onMouseWheel(e)
            }, false);
        } else {
            // "MozMousePixelScroll" used in Firefox 3.5 - 17
            this.canvas.addEventListener("MozMousePixelScroll", (e) => {
                this.onMouseWheel(e)
            }, false);
        }

        document.addEventListener("keydown", (e) => {
            this.onKeyDown(e)
        }, false);

        this.renderTimerId = setInterval(() => {
            this.renderFrame();
        }, 1 / 60);
    }




    renderFrame() {
        this.numberOfStaticFrames++;
        
        let pixelStep = 1

        if (this.numberOfStaticFrames < 10) {
            pixelStep = 9
        } else {
            switch (this.numberOfStaticFrames) {
                case 10:
                    pixelStep = 6
                    break
                case 20:
                    pixelStep = 3
                    break
                case 30:
                    pixelStep = 1
                    break
                default:
                    return
            }
        }


        let canvasHeight = this.context.canvas.height,
            canvasWidth  = this.context.canvas.width,
            
            data         = this.imageData.data,
            colors       = this.colorScheme,
            iterations   = Mandelbrot.getDefaults().iterations,
            buffer       = new ArrayBuffer(data.length),
            buffer8      = new Uint8ClampedArray(buffer),
            data32       = new Uint32Array(buffer)

        for (let y = 0; y < canvasHeight; y += pixelStep) {
            let y0 = (((canvasHeight / 2) - y) / this.zoom) + this.camY

            for (let x = 0; x < canvasWidth; x += pixelStep) {
                let x0 = ((x - (canvasWidth / 2)) / this.zoom) + this.camX,
                    color = this.formula(x0, y0)

                while (color > iterations) {
                    color -= iterations
                }

                let yimax = y + pixelStep,
                    ximax = x + pixelStep

                for (let yi = y; yi < yimax; ++yi) {
                for (let xi = x; xi < ximax; ++xi) {
                        data32[yi * canvasWidth + xi] =
                                        (255 << 24) |
                                        ((colors[3*color]) << 16) |
                                        ((colors[3*color + 1]) << 8) |
                                        (colors[3*color + 2])
                    }
                }
            }
        }

        data.set(buffer8)
        this.context.putImageData(this.imageData, 0, 0)
    }




    setNumberOfIterations() {
        let realZoom = this.zoom / Mandelbrot.getDefaults().zoom
       
        if (Math.pow(2,32) - 1 < realZoom) {
            this.iterations = 16384
        } else if (67108864 < realZoom) { // 2^26
            this.iterations = 8192
        } else if (524288 < realZoom) {   // 2^19
            this.iterations = 4096
        } else if (262144 < realZoom) {   // 2^18
            this.iterations = 2048
        } else if (4096 < realZoom) {     // 2^12
            this.iterations = 1024
        } else {
            this.iterations = 512
        } 
    }




    onMouseDown(e = window.event) {
        this.mouseX = e.clientX
        this.mouseY = e.clientY
        this.mouseOnDrag = true
    }


    onMouseUp() {
        this.mouseOnDrag = false
    }


    onMouseMove(e = window.event) {
        if (!this.mouseOnDrag) {
            return
        }

        let mouseNewX = e.clientX,
            mouseNewY = e.clientY

        this.camX += (-mouseNewX + this.mouseX) / this.zoom
        this.camY += ( mouseNewY - this.mouseY) / this.zoom

        if (this.camX > Mandelbrot.getDefaults().maxCamX) {
            this.camX = Mandelbrot.getDefaults().maxCamX
        }

        if (this.camX < Mandelbrot.getDefaults().minCamX) {
            this.camX = Mandelbrot.getDefaults().minCamX
        }

        if (this.camY > Mandelbrot.getDefaults().maxCamY) {
            this.camY = Mandelbrot.getDefaults().maxCamY
        }

        if (this.camY < Mandelbrot.getDefaults().minCamY) {
            this.camY = Mandelbrot.getDefaults().minCamY
        }

        this.mouseX = mouseNewX
        this.mouseY = mouseNewY

        this.numberOfStaticFrames = 0
    }



    onMouseWheel(e = window.event) {
        let delta = e.deltaY || e.detail || e.wheelDelta;

        if (Math.abs(delta) < 10) {
            delta *= 10
        }

        if (delta > 0) {
            this.zoom += (delta * this.zoom) / (2 * Mandelbrot.getDefaults().zoom)
        } else {
            this.zoom += (delta * this.zoom) / (5 * Mandelbrot.getDefaults().zoom)

            if (this.zoom < Mandelbrot.getDefaults().zoom) {
                this.zoom = Mandelbrot.getDefaults().zoom
            }
        }

        this.setNumberOfIterations()
        this.numberOfStaticFrames = 0
    }



    onKeyDown(e = window.event) {
        switch (e.keyCode) {
            // Arrow keys
            case 37:
                this.turnLeft()
                break
            case 38:
                this.turnUp()
                break
            case 39:
                this.turnRight()
                break
            case 40:
                this.turnDown()
                break
            // "W" key
            case 87:
                this.zoomIn()
                break
            // "S" key
            case 83:
                this.zoomOut()
                break
            default:
                break
        }
    };



    zoomIn() {
        this.zoom *= 1.1
        this.setNumberOfIterations()
        this.numberOfStaticFrames = 0
    }


    zoomOut() {
        this.zoom /= 1.1

        if (this.zoom < Mandelbrot.getDefaults().zoom) {
            this.zoom = Mandelbrot.getDefaults().zoom
        }

        this.setNumberOfIterations()
        this.numberOfStaticFrames = 0
    }


    turnRight() {
        this.camX += 25 / this.zoom

        if (this.camX > Mandelbrot.getDefaults().maxCamX) {
            this.camX = Mandelbrot.getDefaults().maxCamX
        }

        this.numberOfStaticFrames = 0
    }


    turnLeft() {
        this.camX -= 25 / this.zoom

        if (this.camX < Mandelbrot.getDefaults().minCamX) {
            this.camX = Mandelbrot.getDefaults().minCamX
        }

        this.numberOfStaticFrames = 0
    }


    turnUp() {
        this.camY += 25 / this.zoom

        if (this.camY > Mandelbrot.getDefaults().maxCamY) {
            this.camY = Mandelbrot.getDefaults().maxCamY
        }

        this.numberOfStaticFrames = 0
    }


    turnDown() {
        this.camY -= 25 / this.zoom

        if (this.camY < Mandelbrot.getDefaults().minCamY) {
            this.camY = Mandelbrot.getDefaults().minCamY
        }

        this.numberOfStaticFrames = 0;
    }


    cameraX() {
        return this.camX
    }

    cameraY() {
        return this.camY
    }

    cameraZoom() {
        return this.zoom
    }


    static createRandomColorScheme() {
        let colors = []

        colors[0] = 8;
        colors[1] = 0;
        colors[2] = 0;
        
        let iterations = Mandelbrot.getDefaults().iterations

        for (let i = 1; i < iterations; i += 2) {
            // Randomize colors for [i + 7] element
            i += 7
            colors[3*i    ] = Math.floor(256 * Mandelbrot.rand(i-1))
            colors[3*i + 1] = Math.floor(256 * Mandelbrot.rand(i-1))
            colors[3*i + 2] = Math.floor(256 * Mandelbrot.rand(i+2))

            // Create [i + 3] element
            i-=4;
            colors[3*i    ] = (colors[3*(i-4)    ] + colors[3*(i+4)    ]) / 2
            colors[3*i + 1] = (colors[3*(i-4) + 1] + colors[3*(i+4) + 1]) / 2
            colors[3*i + 2] = (colors[3*(i-4) + 2] + colors[3*(i+4) + 2]) / 2

            // Create [i + 5] element.
            i+=2;
            colors[3*i    ] = (colors[3*(i-2)    ] + colors[3*(i+2)    ]) / 2
            colors[3*i + 1] = (colors[3*(i-2) + 1] + colors[3*(i+2) + 1]) / 2
            colors[3*i + 2] = (colors[3*(i-2) + 2] + colors[3*(i+2) + 2]) / 2

            // Create [i + 1] element.
            i-=4;
            colors[3*i    ] = (colors[3*(i-2)    ] + colors[3*(i+2)    ]) / 2
            colors[3*i + 1] = (colors[3*(i-2) + 1] + colors[3*(i+2) + 1]) / 2
            colors[3*i + 2] = (colors[3*(i-2) + 2] + colors[3*(i+2) + 2]) / 2

            // Create [i] element.
            i-=1;
            colors[3*i    ] = (colors[3*(i-1)    ] + colors[3*(i+1)    ]) / 2
            colors[3*i + 1] = (colors[3*(i-1) + 1] + colors[3*(i+1) + 1]) / 2
            colors[3*i + 2] = (colors[3*(i-1) + 2] + colors[3*(i+1) + 2]) / 2

            // Create [i + 2] element.
            i+=2;
            colors[3*i    ] = (colors[3*(i-1)    ] + colors[3*(i+1)    ]) / 2
            colors[3*i + 1] = (colors[3*(i-1) + 1] + colors[3*(i+1) + 1]) / 2
            colors[3*i + 2] = (colors[3*(i-1) + 2] + colors[3*(i+1) + 2]) / 2

            // Create [i + 4] element.
            i+=2;
            colors[3*i    ] = (colors[3*(i-1)    ] + colors[3*(i+1)    ]) / 2
            colors[3*i + 1] = (colors[3*(i-1) + 1] + colors[3*(i+1) + 1]) / 2
            colors[3*i + 2] = (colors[3*(i-1) + 2] + colors[3*(i+1) + 2]) / 2

            // Create [i + 6] element.
            i+=2;
            colors[3*i    ] = (colors[3*(i-1)    ] + colors[3*(i+1)    ]) / 2
            colors[3*i + 1] = (colors[3*(i-1) + 1] + colors[3*(i+1) + 1]) / 2
            colors[3*i + 2] = (colors[3*(i-1) + 2] + colors[3*(i+1) + 2]) / 2
        }

        return colors
    }


    static rand(srand) {
        let x = Math.sin(srand) * 10000
        return x - Math.floor(x)
    }


    static formula(x0, y0) {
        let x1 = x0
        let y1 = y0

        let iterations = this.iterations

        for (let i = 0; i < iterations; ++i) {
            let x2 = x1 * x1
            let y2 = y1 * y1

            if (4.02 < x2 + y2) {
                return i
            }

            let xNew = x2 - y2 + x0
            let yNew = 2.0 * x1 * y1 + y0

            x1 = xNew
            y1 = yNew
        }

        return 0
    }
}
