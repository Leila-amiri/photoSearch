var allImg = [];
var up = 10;
var down = 0;
var total = 0;
var favId;
let ComeFrom=false;
const lat = document.querySelector("#lat");
const lon = document.querySelector("#lon");
const next = document.querySelector("#forward");
const prev = document.querySelector("#behind");
const thumb = document.querySelector(".thumb");
const favContainer = document.querySelector("#favContainer");
const selectedLoc = document.querySelector("#selectLoc");
let searchLat = document.querySelector("#lat").value;
let searchLon = document.querySelector("#lon").value;
var favIcon = document.querySelector("#favIcon");


document.querySelector("#searchBtn").onclick = handleSearch;
document.querySelector("#saveBtn").onclick = handleSave;

favIcon.onclick = handleFavImage;
selectedLoc.onchange = handleLocChange;
next.onclick = handleNext;
prev.onclick = handlePrev;
window.onload = handleFirstLoad;


//handlers of buttons------------------------------------------------------------------------------------------------------------------------------------------------
document.querySelector("#addBtn").addEventListener("click", function() {
  document.querySelector("#modal").style.display = "block";
}, false); 
  

document.querySelector(".close").addEventListener("click", function() {
    document.querySelector("#modal").style.display = "none";
  },false);

document.querySelector("#closeFav").addEventListener("click", function() {
  thumb.children[0].src="";
  thumb.style.display = "none";
  favIcon.children[0].classList.add("fa-heart-o");
}, false); 


function handleLocChange() {
  var selectedLocArr = selectedLoc.value.split(",");
  lat.value = selectedLocArr[1];
  lon.value = selectedLocArr[2];
  up=10;
  down=0;
  handleSearch();
}

function handleSearch() {
  searchLat = lat.value;
  searchLon = lon.value;
  getFlickrPhotos(searchLat, searchLon);
}

function handleNext() {
  if (up > total) {
    next.disabled = true;
    next.style.backgroundColor = "#555";
    next.style.opacity = "1";
  } else {
    prev.disabled = false;
    prev.style.backgroundColor = "green";
    up += 10;
    down += 10;
    appendImg();
  }
}

function handlePrev() {
  if (down <= 0) {
    prev.disabled = true;
    prev.style.backgroundColor = "#555";
    prev.style.opacity = "1";
  } else {
    next.disabled = false;
    next.style.backgroundColor = "green";
    up -= 10;
    down -= 10;
    appendImg();
  }
}

function handleSave() {
  var loc = document.querySelector("#loc");
  var lat1 = document.querySelector("#lat1");
  var lon1 =  document.querySelector("#lon1");
  if((loc.value) && (lat1.value) && (lon1.value)) {
    var newOp = document.createElement("option");
    selectedLoc.appendChild(newOp);
    newOp.text = loc.value;
    newOp.value = loc.value + "," + lat1.value + "," + lon1.value;
    addToLocalStorageArray("Options", newOp.value);
    loc.value = "";
    lat1.value = "";
    lon1.value = "";
  }
}

function handleFavImage() {
  if (favIcon.children[0].classList.contains("fa-heart-o")) {
    favIcon.children[0].classList.remove("fa-heart-o");
    favIcon.children[0].classList.add("fa-heart");
    addImgToFav(thumb.children[0]);
  } else 
      if(ComeFrom==false){
        removeFromFav();
        favIcon.children[0].classList.remove("fa-heart");
        favIcon.children[0].classList.add("fa-heart-o");
      } else {
        var src=thumb.children[0].src.replace(".jpg", "_t.jpg");;
        for(var i=0;i<favContainer.children.length;i++)
          if(favContainer.children[i].src===src) {
            favId=favContainer.children[i];
            removeFromFav();
            favIcon.children[0].classList.remove("fa-heart");
            favIcon.children[0].classList.add("fa-heart-o");
          }
    }
}
//end of handlers of button-------------------------------------------------------------------------------------------------------------------------------------------------------------------------


function handleFirstLoad() {
  //localStorage.clear();
  getFlickrPhotos(searchLat, searchLon);
  if(localStorage.getItem("favs")=="")
    localStorage.setItem("favs",",");
  favContainer.style.display = "block";
  var existing = localStorage.getItem("Options");
  existing = existing ? existing.split(",") : [];
  for (i = 0; i < existing.length; i += 3) {
    var newOp = document.createElement("option");
    newOp.text = existing[i];
    newOp.value = existing[i] + "," + existing[i + 1] + "," + existing[i + 2];
    selectedLoc.appendChild(newOp);
  }

  existing = localStorage.getItem("favs");
  existing = existing ? existing.split(",") : [];
  for (i = 0; i < existing.length; i++) {
    if (existing[i].length) {
      var tmpImage = document.createElement("img");
      tmpImage.src = existing[i].replace(".jpg", "_t.jpg");
      tmpImage.classList.add("img");
      favContainer.appendChild(tmpImage);
      tmpImage.addEventListener("click", function(e) {
          openImg(e, true);
        },false);
    }
  }
}

// fetch data from flicker API
function getFlickrPhotos( searchLat, searchLon) {
  var FLICKR_API_KEY = "a64506982a8d49ab6fec2cdf533ca2c8";
  var searchUrl ="https://www.flickr.com/services/rest/?method=flickr.photos.search&";

  var searchReqParams = {
    api_key: FLICKR_API_KEY,
    has_geo: true,
    lat: searchLat,
    lon: searchLon,
    accuracy: 11,
    format: "json",
    safe_search: 1,
    privacy_filter: 1,
    per_page: 200
  };

  $.ajax({
    type: "GET",
    url: searchUrl,
    dataType: "jsonp",
    cache: true,
    crossDomain: true,
    jsonp: false,
    jsonpCallback: "jsonFlickrApi",
    data: searchReqParams,
    success: function(data) {
      if (data.photos.total > 0) {
        apiResult(data.photos);
       console.log('more than 10')
      } else {
        console.log(data.photos);
      }
    }
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.log("req failed");
    console.log("textStatus: ", textStatus, " code: ", jqXHR.status);
  });


//handle the response of ajax call
function apiResult(photos) {
  total = photos.photo.length;
  for (var i = 0; i < total && i < 200; i++) {
    var farmId = photos.photo[i].farm;
    var serverId =photos.photo[i].server;
    var id = photos.photo[i].id;
    var secret = photos.photo[i].secret;
    var imgSrc = "https://farm" + farmId + ".staticflickr.com/" + serverId +  "/" + id + "_" + secret + "_t.jpg";
    allImg[i] = imgSrc;
  }
    prev.disabled = false;
    prev.style.backgroundColor = "green";
    next.disabled = false;
    next.style.backgroundColor = "green";
    appendImg();
  }
}

//append the result(images) of ajax call to the dom 
function appendImg() {
  var imgContainer = document.querySelector("#imgContainer");
  while (imgContainer.firstChild) {
    imgContainer.removeChild(imgContainer.firstChild);
  }

  for (var i = down; i < up && allImg[i].length; i++) {
    var image = document.createElement("img");
    image.src = allImg[i];
    image.classList.add("img");
    imgContainer.appendChild(image);
    imgContainer.children[i%10].addEventListener("click", function(e) {
        openImg(e,false);
      }, false);
  }
}


function openImg(e,state) {
  thumb.children[0].src = e.target.src.replace("_t", "");
  if(!state){
    ComeFrom=true;
    var strlclFavs = localStorage.getItem("favs");
    if ((strlclFavs) && (strlclFavs.search(thumb.children[0].src) > -1)) {
      favIcon.children[0].classList.remove("fa-heart-o");
      favIcon.children[0].classList.add("fa-heart");
    }
    else{
      favIcon.children[0].classList.remove("fa-heart");
      favIcon.children[0].classList.add("fa-heart-o");
    }
  }
  else
  {
      ComeFrom=false;
      favIcon.children[0].classList.remove("fa-heart-o");
      favIcon.children[0].classList.add("fa-heart");
      favId=e.target;
  }
  window.scrollTo({ top: 5  });
  thumb.style.display = "block";
}


function addImgToFav(image) {
  var strlclFavs = localStorage.getItem("favs");
  if (strlclFavs === null || strlclFavs.indexOf(image.src) === -1) {
    var tmpImage = image.cloneNode(true);
    tmpImage.src = tmpImage.src.replace(".jpg", "_t.jpg");
    tmpImage.classList.add("img");
    favContainer.appendChild(tmpImage);
    tmpImage.addEventListener("click", function(e) {
        openImg(e,true);
      },false);
    favId = tmpImage;
    addToLocalStorageArray("favs", image.src);
  }
}

function removeFromFav() {
    var strlclFavs = localStorage.getItem("favs");
    var strTemp = favId.src.replace("_t", "");
    if (strlclFavs.indexOf(strTemp) > -1) {
      localStorage.setItem("favs", strlclFavs.replace(strTemp, ""));
      favId.remove();
    }
}

function addToLocalStorageArray(name, value)  {
  var existing = localStorage.getItem(name);
  existing = existing ? existing.split(",") : [];
  existing.push(value);
  localStorage.setItem(name, existing.toString());
};











