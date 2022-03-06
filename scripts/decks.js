//decks.js
window.onload = function () {
	let plottr = false;
	if( typeof Plottr === "function" ){
		plottr = new Plottr();
	}
    let header = document.getElementById("header");
    let footer = document.getElementById("bottom");
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext('2d');
	ctx.imageSmoothingEnabled = false;


    let isDragging = false
	let currentTransformedCursor = {x:0,y:0};
    let dragStart = {x:0,y:0};
	
	let loading = false;
	let loadedFiles = 0;
	let fileCount = 0;
	
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
			ctx.scale(.1,.1);
		}
	}
	
	setTimeout( checkLoading, 100);

	function getWorldPoint( viewportPoint ){
		const transform = ctx.getTransform();
		const inverseZoom = 1 / transform.a;

		const transformedX = inverseZoom * viewportPoint.x - inverseZoom * transform.e;
		const transformedY = inverseZoom * viewportPoint.y - inverseZoom * transform.f;
		return { x: transformedX, y: transformedY };
	}
	
    function onPointerDown(e) {
        isDragging = true;
		dragStart = getWorldPoint({x:e.offsetX, y:e.offsetY});
    }

    function onPointerUp(e) {
        isDragging = false;
        initialPinchDistance = null;
    }

    function onPointerMove(e) {
		currentTransformedCursor = getWorldPoint({x:e.offsetX, y:e.offsetY});
        if (isDragging) {
			ctx.translate(currentTransformedCursor.x - dragStart.x, currentTransformedCursor.y - dragStart.y);
        }
    }

	function onWheel(e){
		const zoom = e.deltaY < 0 ? 1.1 : 0.9;
		ctx.translate(currentTransformedCursor.x, currentTransformedCursor.y);
		ctx.scale(zoom, zoom);
		ctx.translate(-currentTransformedCursor.x, -currentTransformedCursor.y);
		e.preventDefault();
	}
	
    canvas.addEventListener('mousedown', onPointerDown);
    canvas.addEventListener('mouseup', onPointerUp);
    canvas.addEventListener('mousemove', onPointerMove);
    canvas.addEventListener('wheel', onWheel);
	if( plottr ){
		canvas.addEventListener( 'mousemove', e=> plottr.hover( e, ctx ) );
		canvas.addEventListener( 'contextmenu', e=> plottr.rightClick( e, ctx ) );
		document.addEventListener( 'keydown', e=>plottr.keyDown ( e ) );
	}
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
		if( plottr ){ plottr.setDeck( currentDeck ); }
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
	
	
	let tick = 0;
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
		ctx.setTransform(1,0,0,1,0,0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.restore();

		ctx.drawImage( decks[currentDeck], 0, 0 );
		
		if( plottr ){ plottr.render( ctx ); }
	
		
		requestAnimationFrame(renderFrame);
    }
    renderFrame();

};

