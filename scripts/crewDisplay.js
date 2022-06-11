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
    window.scrollTo( 0, 0 );
  }
  function populateList(){
    
    let list = document.getElementById("list");
    list.innerHTML = "";
    let groups = crewData.map(e=>e[sortMode]).filter((e,i,a)=>a.indexOf(e)===i);
    groups = groups.sort();
    if( sortMode == "rank" ){
      groups = groups.sort( (a,b) => rankOrder[a] - rankOrder[b] ); 
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
      }
      if(bucketTitle.innerHTML == ""){
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
  function setGroup(mode){
    document.getElementById("groupDropdown").style.display = "none";
    document.getElementById("listControls").style.backgroundColor = "#5588ee";
    document.getElementById("listControls").style.color = "#000";
    document.getElementById("listControls").innerHTML = "Group By " + ((mode=="pronounsShort")?"PRONOUNS":mode.toUpperCase());
    sortMode = mode;
    populateList();
  }
  setGroup( "rank" );
}

window.onload = init;s