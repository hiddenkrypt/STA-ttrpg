function Plottr() {
	
	let currentShape = {};
	let savedShapes = [];
	let currentDeck = 0;
	
	
	function getWorldPoint( viewportPoint, ctx ){
		const transform = ctx.getTransform();
		const inverseZoom = 1 / transform.a;

		const transformedX = inverseZoom * viewportPoint.x - inverseZoom * transform.e;
		const transformedY = inverseZoom * viewportPoint.y - inverseZoom * transform.f;
		return { x: transformedX, y: transformedY };
	}
	
	var container = document.createElement("div");
	container.style.position = "fixed";
	container.style.top = "0";
	container.style.right = "0";
	
	var circleOption = document.createElement("input");
	circleOption.type = "radio";
	circleOption.name = "shape";
	circleOption.value = "circle";
	var circleLabel = document.createElement("label");
	circleLabel.innerHTML = "Circles";
	
	var polyOption = document.createElement("input");
	polyOption.type = "radio";
	polyOption.name = "shape";
	polyOption.value = "poly";
	polyOption.checked = true;
	var polyLabel = document.createElement("label");
	polyLabel.innerHTML = "Polygon";
	
	var currentText = document.createElement("textarea");
	currentText.rows = 20;
	currentText.readOnly = true;
	
	var savedText = document.createElement("textarea");
	savedText.rows = 10;
	savedText.readOnly = true;
	
	var back = document.createElement("button");
	back.innerText = "Back";
	back.addEventListener("click", undo);
	
	var newPlot = document.createElement("button");
	newPlot.innerText = "New";
	newPlot.addEventListener("click", setupPlot);
	
	var save = document.createElement("button");
	save.innerText="Save";
	save.addEventListener("click", saveShape);
	
	var edit = document.createElement("input");
	edit.type = "button";
	edit.addEventListener("click", editToggle);
	
	var name = document.createElement("input");
	
	container.appendChild(circleOption);
	container.appendChild(circleLabel);
	container.appendChild(document.createElement("br"));
	container.appendChild(polyOption);
	container.appendChild(polyLabel);
	container.appendChild(document.createElement("br"));
	container.appendChild(back);
	container.appendChild(document.createElement("br"));
	container.appendChild(newPlot);
	container.appendChild(name);
	container.appendChild(document.createElement("br"));
	container.appendChild(currentText);
	container.appendChild(document.createElement("br"));
	container.appendChild(edit);
	container.appendChild(save);
	container.appendChild(document.createElement("br"));
	container.appendChild(savedText);
	document.body.appendChild(container);
	function setupPlot(){
		if( circleOption.checked ){
			currentShape = new Circle();
		} else if( polyOption.checked ){
			currentShape = new Polygon();
		}
		
		currentText.value = JSON.stringify( currentShape );
	}
	function undo(){
		currentShape.undo();
		currentText.value = JSON.stringify(currentShape);
	}
	function editToggle(){
		if(edit.value == "Edit"){
			console.log("edit");
			edit.value = "Lock";
			savedText.readOnly = false;
			savedText.style.backgroundColor = "#fff";
		} else {
			console.log("lock");
			edit.value = "Edit";
			savedText.readOnly = true;
			savedText.style.backgroundColor = "#aaa";
			if(savedText.value == ""){
				savedShapes = [];
			} else {
				safeParse( savedText, savedShapes );
			}
			function safeParse( textElement, storageObject){				
				try{
					storageObject = JSON.parse(textElement.value);	
				} catch (e){
					console.log(e);
					var backup = textElement.value;
					textElement.value = "JSON ERROR\n"+e;
					setTimeout(()=>{textElement.value = backup; editToggle();}, 6000);
					
				}
			}
		}
	}
	function saveShape(){
		if( !currentShape.validate() ){
			var backup = currentText.value;
			currentText.value = "Incomplete Shape!\n";
			setTimeout(()=>{currentText.value = backup; }, 6000);
			return;
		}
		currentShape.ghost = undefined;
		currentShape.style.fill = "rgba(0,127,0,.3)";
		currentShape.style.stroke = "rgba(0,127,0,.8)";
		savedShapes.push(currentShape);
		savedText.value = JSON.stringify(savedShapes);
		setupPlot();
	}
	setupPlot();
	editToggle();
	

	function Polygon(){
		this.style = {};
		this.name = name.value;
		this.deck = currentDeck;
		this.type = "poly";
		this.data = [];
		this.style.fill = "rgba(255,0,255,.6)";
		this.style.stroke = "rgba(255,0,255,.9)";
		this.rightClick = function( mousePoint ){
			this.data.push( mousePoint );
		};
		this.validate = function(){			
			if( !currentShape.data.length || currentShape.data.length <=2 ){
				return false; 
			}
			return true;
		};
		this.render = function( ctx ){
			if( this.data.length <= 0  || this.deck !== currentDeck){
				return;
			}
			ctx.beginPath();
			ctx.strokeStyle = this.style.stroke;
			ctx.fillStyle = this.style.fill;
			ctx.moveTo(this.data[0].x, this.data[0].y);
			this.data.forEach(e=>{
				ctx.fillRect(e.x-10,e.y-10,20,20 );
				ctx.lineTo(e.x,e.y);
			});
			if( this.ghost ){
				ctx.stroke();
				ctx.fill();
				ctx.lineTo( this.ghost.x, this.ghost.y );
			}
			ctx.stroke();
			ctx.fill();
			ctx.closePath();
		};
		this.undo = function(){
			this.data.pop();
		};
		
		this.within = function( point ){
			var i = 0;
			var j = this.data.length -1 ; 
			var c = false;
			for (i = 0, j = this.data.length-1; i < this.data.length; j = i++) {
			if ( ((this.data[i].y > point.y) != (this.data[j].y > point.y)) &&
			(point.x < (this.data[j].x - this.data[i].x) * (point.y - this.data[i].y) / (this.data[j].y - this.data[i].y) + this.data[i].x) )
				c = !c;
			}
			
			if( c ){
				this.style.fill = "rgba(0,255,0,.5)";
				this.style.stroke = "rgba(0,255,255,1)";
			} else {
				this.style.fill = "rgba(0,127,0,.3)";
				this.style.stroke = "rgba(0,127,0,.8)";
			}
		}
	}


	function Circle(){
		this.style = {};
		this.name = name.value;
		this.deck = currentDeck;
		this.type = "circle";
		this.data = {x:0, y:0, r2: 0, r: 0};
		this.style.fill = "rgba(255,255,0,.6)";
		this.style.stroke = "rgba(255,255,0,.9)";
		this.rightClick = function( mousePoint ){
			if( !this.data.x || !this.data.y ){
				this.data.x = mousePoint.x;
				this.data.y = mousePoint.y;
			} else {
				this.data.r2 = (this.data.x - mousePoint.x)*(this.data.x - mousePoint.x) + (this.data.y - mousePoint.y)*(this.data.y - mousePoint.y);
				this.data.r = Math.sqrt(this.data.r2);
			}
		};
		this.validate = function(){
			if( !this.data.x || !this.data.y || !this.data.r2 ){
				if( this.data.x <= 0 || this.data.y <= 0 || this.data.r2 <= 0){
					return false;
				}
			}
			return true;
		}
		this.render = function( ctx ){
			if( !this.data.x || !this.data.y || this.deck !== currentDeck ){
				return;
			}
			
			ctx.fillStyle = this.style.fill;
			ctx.strokeStyle = "#000";
			ctx.fillRect(this.data.x-10, this.data.y-10, 20, 20);
			ctx.strokeRect(this.data.x-10, this.data.y-10, 20, 20);
			ctx.strokeStyle = this.style.stroke;
			
			if( this.data.r && this.data.r > 0){
				ctx.beginPath();
				ctx.arc(this.data.x, this.data.y, this.data.r, 0, 2 * Math.PI, false);
				ctx.closePath();
				ctx.stroke();
				ctx.fill();
			}
			if( this.ghost ){
				let ghostR = Math.sqrt((this.data.x - this.ghost.x)*(this.data.x - this.ghost.x) + (this.data.y - this.ghost.y)*(this.data.y - this.ghost.y));
				ctx.beginPath();
				ctx.strokeStyle = "#ff0000";
				ctx.arc(this.data.x, this.data.y, ghostR, 0, 2 * Math.PI, false);
				ctx.closePath();
				ctx.stroke();
			}
			
		}
		this.undo = function(){
			if( this.data.r != 0 ){
				this.data.r = 0;
				this.data.r2 = 0;
			} else {
				this.data.x = 0;
				this.data.y = 0;
			}
		}
		this.within = function( point ){
			
			if( this.data.r2 >= ((point.x - this.data.x)*(point.x - this.data.x) + (point.y - this.data.y)*(point.y - this.data.y)) ){
				this.style.fill = "rgba(0,255,0,.5)";
				this.style.stroke = "rgba(0,255,255,1)";
			} else {
				this.style.fill = "rgba(0,127,0,.3)";
				this.style.stroke = "rgba(0,127,0,.8)";
			}
			
			
		}
	}
	
	this.rightClick = function( e, ctx ) {
		let mouse =  getWorldPoint( {x:e.offsetX, y:e.offsetY}, ctx );
		currentShape.rightClick( mouse );
		currentText.value = JSON.stringify(currentShape);
		e.preventDefault();
	}; 
	this.hover = function( e, ctx ){
		let mouse =  getWorldPoint( {x:e.offsetX, y:e.offsetY}, ctx );
		currentShape.ghost = mouse;
		savedShapes.forEach( e => e.within( mouse ) );
	}
	this.keyDown = function( e ){
		console.log( e.code );
		if(name === document.activeElement) {
			if(  e.code == "Enter" ){
				setupPlot();
				savedText.focus();
			}
			return;
		}
		if( e.code == "Backspace" ){
			undo();
		} else if ( e.code == "Enter" ){
			saveShape();
		} else if ( e.code == "Delete" ){
			savedShapes.pop();
			savedText.value = JSON.stringify(savedShapes);
		} else if ( e.code == "KeyC" || e.code == "KeyO" ){
			circleOption.checked = true;
			setupPlot();
		} else if ( e.code == "KeyP" ){
			polyOption.checked = true;
			setupPlot();
		} else if ( e.code == "Escape" ){
			name.focus();
			name.value = "";
		}
	}
	
	this.setDeck = function( deck ){
		currentDeck = deck;
		setupPlot();
	}
	this.render = function renderFrame(ctx) {
		currentShape.render( ctx );
		savedShapes.forEach(e=>{e.render(ctx);});
    };
}
