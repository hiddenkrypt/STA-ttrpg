//decks.js
window.onload = function () {

    let header = document.getElementById("header");
    let footer = document.getElementById("bottom");
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext('2d');

    let cameraZoom = 1;
    let MAX_ZOOM = 5;
    let MIN_ZOOM = 0.1;
    let SCROLL_SENSITIVITY = 0.0005;
    let isDragging = false
    let initialPinchDistance = null;
    let lastZoom = cameraZoom;
	let loading = false;
	let tick = 0;
	let loadedFiles = 0;
	let fileCount = 0;
    let dragStart = {
        x: 0,
        y: 0
    };
    let cameraOffset = {
        x: -9167 / 2,
        y: -3000
    };
    function sizeCanvas() {
        canvas.height = window.innerHeight - (header.clientHeight * 1.25) - (footer.clientHeight * 1.25);
        canvas.width = (canvas.clientHeight / 9) * 16;
        if (window.innerWidth * 0.90 < canvas.width) {
            canvas.width = window.innerWidth * .80;
            canvas.height = (canvas.width /16) * 9;
        }
		MIN_ZOOM = Math.min( canvas.width / 9167, canvas.height / 6627 ) ;
		cameraZoom = MIN_ZOOM;
    }
    sizeCanvas();
    window.addEventListener('resize', sizeCanvas);

	function loaded(file){
		console.log("loaded: "+file);
		loadedFiles++;
	}
	function setupImageLoad(file){
		fileCount++;
		let i = new Image();
		i.onload = e=>loaded(file);
		i.src = file;
		i.adaLoaded = false;
		decks.push(i);
	}
	let decks = [];
	setupImageLoad("decks/ship00.png");
	setupImageLoad("decks/ship01.png");
	setupImageLoad("decks/ship02.png");
	setupImageLoad("decks/ship03.png");
	setupImageLoad("decks/ship04.png");
	setupImageLoad("decks/ship05.png");
	setupImageLoad("decks/ship06.png");
	setupImageLoad("decks/ship07.png");
	setupImageLoad("decks/ship08.png");
	setupImageLoad("decks/ship09.png");
	setupImageLoad("decks/ship10.png");
	setupImageLoad("decks/ship11.png");
    function checkLoading(){
		loading = loadedFiles != fileCount;
		if( loading ){
			setTimeout( checkLoading, 100);
		} else {
			console.log("loading complete");
		}
	}
	
	setTimeout( checkLoading, 100);
	
    // Gets the relevant location from a mouse or single touch event
    function getEventLocation(e) {
		let rect = canvas.getBoundingClientRect();
        if (e.touches && e.touches.length == 1) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        } else if (e.clientX && e.clientY) {
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }
    }

    function onPointerDown(e) {
        isDragging = true;
        dragStart.x = getEventLocation(e).x / cameraZoom - cameraOffset.x;
        dragStart.y = getEventLocation(e).y / cameraZoom - cameraOffset.y;
		console.log(cameraOffset.x +" : "+cameraOffset.y);
    }

    function onPointerUp(e) {
        isDragging = false;
        initialPinchDistance = null;
        lastZoom = cameraZoom;
    }

    function onPointerMove(e) {
        if (isDragging) {
            cameraOffset.x = getEventLocation(e).x / cameraZoom - dragStart.x;
            cameraOffset.y = getEventLocation(e).y / cameraZoom - dragStart.y;
        }
    }

    function handleTouch(e, singleTouchHandler) {
        if (e.touches.length == 1) {
            singleTouchHandler(e);
        } else if (e.type == "touchmove" && e.touches.length == 2) {
            isDragging = false;
            e.preventDefault();
            let touch1 = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
            let touch2 = {
                x: e.touches[1].clientX,
                y: e.touches[1].clientY
            };
            let currentDistance = (touch1.x - touch2.x) ** 2 + (touch1.y - touch2.y) ** 2;

            if (initialPinchDistance == null) {
                initialPinchDistance = currentDistance;
            } else {
                adjustZoom(null, currentDistance / initialPinchDistance);
            }
        }
    }

    function adjustZoom(zoomAmount, zoomFactor) {
        if (!isDragging) {
            if (zoomAmount) {
                cameraZoom += zoomAmount;
            } else if (zoomFactor) {
               // console.log(zoomFactor);
                cameraZoom = zoomFactor * lastZoom;
            }
            cameraZoom = Math.min(cameraZoom, MAX_ZOOM)
            cameraZoom = Math.max(cameraZoom, MIN_ZOOM);
        }
		console.log(cameraZoom);
    }

    document.addEventListener("touchstart", function () {}, false);
    canvas.addEventListener('mousedown', onPointerDown);
    canvas.addEventListener('touchstart', (e) => handleTouch(e, onPointerDown));
    canvas.addEventListener('mouseup', onPointerUp);
    canvas.addEventListener('touchend', (e) => handleTouch(e, onPointerUp));
    canvas.addEventListener('mousemove', onPointerMove);
    canvas.addEventListener('touchmove', (e) => handleTouch(e, onPointerMove));
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        adjustZoom(-e.deltaY * SCROLL_SENSITIVITY);
    });
	
    let deckDisplay = document.getElementById("deckDisplay");
    let deckUp = document.getElementById("deckUp");
    let deckDown = document.getElementById("deckDown");
	deckUp.addEventListener("click", ()=>{
		if(currentDeck > 0){
			currentDeck--;
		}
		setDeck();
	});
	deckDown.addEventListener("click", ()=>{
		if(currentDeck < 11){
			currentDeck++;
		}
		setDeck();
	});
	function setDeck(){
		deckDisplay.innerText = "DECK " + (currentDeck < 10? "0":"") + currentDeck;
		if( currentDeck == 0 ){
			deckUp.style.backgroundColor = "#aaa";
		} else {
			deckUp.style.backgroundColor = "#8ff";
		}
		if( currentDeck == 11 ){
			deckDown.style.backgroundColor = "#aaa";
		} else {
			deckDown.style.backgroundColor = "#8ff";
		}
	}
	var currentDeck = 0;
	setDeck();
	function renderFrame() {
		if( loading ){
			tick++;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.font = "40px Antonio";
			ctx.fillStyle = "#fff";
			let lText= "LOADING..."; 
			ctx.fillText(lText, canvas.width/2 - ctx.measureText(lText).width/2, canvas.height/3);
			ctx.fillRect(0+tick,canvas.height/3-20, 10, 10 );
			if( tick >= canvas.width ){
				tick = 0;
			}
			
			requestAnimationFrame(renderFrame);
			return;
		}
		ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Translate to the canvas centre before zooming - so you'll always zoom on what you're looking directly at
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(cameraZoom, cameraZoom);
		
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        ctx.translate(cameraOffset.x, cameraOffset.y);

		ctx.drawImage( decks[currentDeck], 0, 0 );

		ctx.restore();
        requestAnimationFrame(renderFrame);
    }
    renderFrame();
};


