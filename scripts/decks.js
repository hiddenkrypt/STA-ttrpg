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
		if( loading ){ return }
        isDragging = true;
		dragStart = getWorldPoint({x:e.offsetX, y:e.offsetY});
    }

    function onPointerUp(e) {
		if( loading ){ return }
        isDragging = false;
        initialPinchDistance = null;
    }

    function onPointerMove(e) {
		if( loading ){ return }
		currentTransformedCursor = getWorldPoint({x:e.offsetX, y:e.offsetY});
        if (isDragging) {
			ctx.translate(currentTransformedCursor.x - dragStart.x, currentTransformedCursor.y - dragStart.y);
        }
    }

	function onWheel(e){
		if( loading ){ return }
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
		if( loading ){ return }
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
	let tickMax = 700;
	function renderFrame() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		if( loading ){
			tick++;
			ctx.font = "40px Antonio";
			ctx.fillStyle = "#fff";
			let lText= "LOADING"; 
			var starfleetX = canvas.width/2 - 26;
			var starfleetY = canvas.height/3;
			ctx.fillText(lText+"...", canvas.width/2 - ctx.measureText(lText).width/2+14, starfleetY);
			ctx.fillRect(-500+tick*3,canvas.height/2.3-(tick/2), 10, 10 );
			if( tick >= tickMax ){
				tick = 0;
			}
			ctx.lineWidth = 2;
			var circlePercent = .9;
			ctx.beginPath();
			ctx.arc(starfleetX+42, starfleetY+45, 30, 2, 2+((tick/tickMax)*2* Math.PI)); 
			ctx.strokeStyle = "#fff";
			ctx.stroke();
			ctx.closePath();

			ctx.beginPath();
			ctx.moveTo(starfleetX+14, starfleetY+94);
			ctx.bezierCurveTo(starfleetX+20, starfleetY+48, starfleetX+41, starfleetY+7 , starfleetX+41, starfleetY+7);
			ctx.bezierCurveTo(starfleetX+55, starfleetY+33, starfleetX+64, starfleetY+62, starfleetX+67, starfleetY+85);
			ctx.bezierCurveTo(starfleetX+64, starfleetY+74, starfleetX+57, starfleetY+62, starfleetX+50, starfleetY+60);
			ctx.bezierCurveTo(starfleetX+43, starfleetY+59, starfleetX+33, starfleetY+68, starfleetX+14, starfleetY+94);
			ctx.closePath();
			ctx.fillStyle = "rgba(237,192,51,1)";
			ctx.strokeStyle = "#000";
			ctx.fill();
			ctx.stroke();


			ctx.beginPath();
			ctx.moveTo(starfleetX+34, starfleetY+44);
			ctx.lineTo(starfleetX+40, starfleetY+43);
			ctx.lineTo(starfleetX+42, starfleetY+20);
			ctx.lineTo(starfleetX+44, starfleetY+43);
			ctx.lineTo(starfleetX+50, starfleetY+44);
			ctx.lineTo(starfleetX+45, starfleetY+47);
			ctx.lineTo(starfleetX+46, starfleetY+52);
			ctx.lineTo(starfleetX+42, starfleetY+47);
			ctx.lineTo(starfleetX+38, starfleetY+53);
			ctx.lineTo(starfleetX+39, starfleetY+47);
			ctx.closePath();
			ctx.fillStyle = "#000";
			ctx.strokeStyle = "#000";
			ctx.fill();
			ctx.stroke();
			requestAnimationFrame(renderFrame);
			return;
		} else {
			ctx.save();
			ctx.setTransform(1,0,0,1,0,0);
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.restore();

			ctx.drawImage( decks[currentDeck], 0, 0 );
			
			if( plottr ){ plottr.render( ctx ); }
		}
		
		
		requestAnimationFrame(renderFrame);
    }
    renderFrame();

};

