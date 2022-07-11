//crewDisplay.js

  console.log("load");

function init(){
  console.log("loaded");
  let URLParams = {};
  window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
    URLParams[key] = value;
  });
  let listContainer = document.getElementById("crewListContainer");
  let memberContainer = document.getElementById("crewMemberContainer");
  let sortMode = "division";
  const rankOrder = {
    "Captain": 0, 
    "Commander": 1, 
    "Lieutenant Commander": 2,
    "Lieutenant": 3,
    "Lieutenant Junior Grade": 4,
    "Ensign": 5, 
    "Chief Petty Officer":10 
  };
  function displayList(){
    memberContainer.style.display = "none";
    listContainer.style.display = "block";
  }
  function displayMember(){
    listContainer.style.display = "none";
    memberContainer.style.display = "block";
    document.getElementById("topbar").scrollIntoView( true );
  }
  function populateList(){
    
    document.getElementById("crewImg").style.visibility = "hidden";
    let list = document.getElementById("list");
    list.innerHTML = "";
    let groups = crewData.map(e=>e[sortMode]).filter((e,i,a)=>a.indexOf(e)===i);
    groups = groups.sort();
    if( sortMode == "rank" ){
      groups = groups.sort( (a,b) => rankOrder[a] - rankOrder[b] ); 
    }
	if( sortMode == "player" ){
      groups = groups.sort( (a,b) => {
		if( b == "NPC" ){ return -1; }
		if( a == "NPC" ){ return  1; }
		return a - b; 
	  }); 	
	}
    let buckets = new Array(groups.length).fill(0).map(e=>new Array(0));
    if (sortMode == "name" ){
       buckets = [crewData.sort((a,b) => (a.name > b.name)?1:-1) ];
    } else {
      crewData.forEach( e=> {
        buckets[ groups.indexOf( e[sortMode] ) ].push( e ) 
      });
    }
    buckets.forEach( bucket =>{
      let bucketContainer = document.createElement("div");
      let bucketTitle = document.createElement("div");
      bucketTitle.classList.add("bucketTitle");
      bucketTitle.innerHTML = bucket[0][sortMode];
      if(sortMode=="name"){
        bucketTitle.innerHTML = "Alphabetical";  
      } else if ( sortMode == "rank" ) {
		appendPips( bucketTitle );
	  }
      if ( bucketTitle.innerHTML == "" ) {
        bucketTitle.innerHTML = "[DATA MISSING]";
      }
      bucketContainer.appendChild(bucketTitle);
      list.appendChild(bucketContainer);
      let bucketList = document.createElement("ul");
      bucketList.classList.add("bucketList");
      bucketContainer.appendChild( bucketList );
      bucket.forEach( item =>{        
        let bucketItem = document.createElement("li");
        bucketItem.classList.add("bucketItem");
        bucketList.appendChild( bucketItem );
        bucketItem.innerHTML = item.title;
        bucketItem.addEventListener("click", e=> populateCrewMember(item.title));
      });
    
    });
    displayList();
  }
  function populateCrewMember( title ){
    let record = crewData.find(c=>c.title === title );
    document.getElementById("crewTitle").innerHTML = record.title;
    document.getElementById("crewImg").style.visibility = "visible";
    document.getElementById("crewImg").src = record.profileImg;
    document.getElementById("crewName").innerHTML = record.name;
    document.getElementById("crewPronounsShort").innerHTML = record.pronounsShort;
    document.getElementById("crewRank").innerHTML = record.rank;
    document.getElementById("crewSerial").innerHTML = record.serial;
    document.getElementById("crewDivision").innerHTML = record.division;
    document.getElementById("crewAssignment").innerHTML = record.assignment;
    document.getElementById("crewSpecies").innerHTML = record.species;
    document.getElementById("crewDob").innerHTML = record.dob;
    document.getElementById("crewPob").innerHTML = record.pob;
    document.getElementById("crewPronouns").innerHTML = record.pronouns;
    document.getElementById("crewPriorHistory").innerHTML = record.priorHistory;
    document.getElementById("crewServiceRecord").innerHTML = record.serviceRecord;
    displayMember();
  }
  document.getElementById("crewListButton").addEventListener("click", e=>{populateList();});
  document.getElementById("listControls").addEventListener("click",e=>{
    document.getElementById("groupDropdown").style.display = "flex";
    document.getElementById("listControls").style.backgroundColor = "#223366";
    document.getElementById("listControls").style.color = "#223366";
  });
  document.getElementById("groupByRank").addEventListener("click",e=>{setGroup("rank")});
  document.getElementById("groupByName").addEventListener("click",e=>{setGroup("name")});
  document.getElementById("groupByPronouns").addEventListener("click",e=>setGroup("pronounsShort"));
  document.getElementById("groupByDivision").addEventListener("click",e=>setGroup("division"));
  document.getElementById("groupBySpecies").addEventListener("click",e=>setGroup("species"));
  document.getElementById("groupByPlayer").addEventListener("click",e=>setGroup("player"));
  function setGroup(mode){
    document.getElementById("groupDropdown").style.display = "none";
    document.getElementById("listControls").style.backgroundColor = "#7799cc";
    document.getElementById("listControls").style.color = "#000";
    document.getElementById("listControls").innerHTML = "Group By " + ((mode=="pronounsShort")?"PRONOUNS":mode.toUpperCase());
    sortMode = mode;
    populateList();
  }
  setGroup( "rank" );
  function appendPips( rankTitle ){
	  
	let spacer = document.createElement("span");
	spacer.classList.add("spacer");
	rankTitle.appendChild(spacer);
	let rankpips = {
      "Captain": {full:4, half:0},
      "Commander": {full:3, half:0},
      "Lieutenant Commander": {full:2, half:1},
      "Lieutenant": {full:2, half:0},
      "Lieutenant Junior Grade": {full:1, half:1},
       "Ensign": {full:1, half:0},
	   "Chief Petty Officer":  {full:0, half:3},
	};
	let pips = rankpips[rankTitle.innerText] || {full:0,half:0};
	for( let i = 0; i < pips.full; i++ ) {
	  let img= document.createElement("img");
	  img.src = "crew/rankPip.png";
	  img.classList.add("pip");
	  rankTitle.appendChild(img);
	}
	for( let i = 0; i < pips.half; i++ ) {
	  let img= document.createElement("img");
	  img.src = "crew/rankPip-hollow.png";
	  img.classList.add("pip");
	  rankTitle.appendChild(img);
	}
  }
}

window.onload = init;