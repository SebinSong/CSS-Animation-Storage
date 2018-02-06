(function canvassetting(){
  var canvas, canvasWrapperBox, ctx, canvasSizeinfo, w, h, circleArray,
      intervalID, requestID;

  requestID = 0, circleArray = [];


  canvas = document.querySelector("canvas#bgeffect");
  ctx = canvas.getContext("2d");

  canvasWrapperBox = canvas.parentNode;
  canvas.width = canvasWrapperBox.clientWidth*0.995;
  canvas.height = canvasWrapperBox.clientHeight*0.995;


  canvasSizeinfo = canvas.getBoundingClientRect();
  w = canvasSizeinfo.width, h = canvasSizeinfo.height;

  function randomSign() {
    return [-1,1][ Math.floor( 1.99*Math.random() ) ];
  }

  function createCircle() {
    return {

        line: {
                px: w/2 + Math.random()*(w/2)*randomSign(),
                py: h/2,
                m: randomSign() * Math.tan((45 + 30*Math.random()*randomSign()) * Math.PI / 180 ),
                getX: function(y) {
                  return (y - this.py) / this.m + this.px;
                }
              },
       cy: h/3*2 + h/3*Math.random(), cx: 0, r: w/100 + w/40 * Math.random(),
       tFirst: 0, alpha: 0.0051, reduceAlpha: false,
       v: (-0.3) + (-0.5)*Math.random(), color: "#ffff55"

    };
  }

  function drawCircle(circle, index) {
    ctx.fillStyle = ctx.shadowColor = circle.color;
    ctx.globalAlpha = circle.alpha;

    ctx.beginPath();
    ctx.moveTo(circle.cx + circle.r, circle.cy);
    ctx.arc(circle.cx, circle.cy, circle.r, 0, Math.PI*2, false);
    ctx.fill();
    ctx.closePath();

    if(circle.tFirst === 0) circle.tFirst = Date.now();
    circle.cy += circle.v;
    circle.cx = circle.line.getX(circle.cy);

    if(circle.alphaReduce){
      circle.alpha *= 0.97;
    }
    else {
      circle.alpha *= 1.04;
      if(circle.alpha>0.7) circle.alphaReduce = true;
    }

    if(circle.alpha < 0.005){
      let new_circle = createCircle();
      new_circle.cx = new_circle.line.getX(new_circle.cy);
      circleArray.splice(index,1,new_circle);
    }
  }

  for(let i=0; i<10; i++) {
    let circle = createCircle();
    circle.cx = circle.line.getX(circle.cy);
    circleArray.push(circle);
  }

  intervalID = window.setInterval(()=>{
    if(circleArray.length>80) window.clearInterval(intervalID);

    for(let i=0; i<2; i++) {
      let createdCircle = createCircle();
      createdCircle.cx = createdCircle.line.getX(createdCircle.cy);
      circleArray.push(createdCircle);
    }
  }, 300);

  function animateCircles() {

    ctx.clearRect(0,0,w,h);
    ctx.shadowOffsetX = ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 15;

    circleArray.forEach((circle, i, arr)=>{
      drawCircle(circle, i);
    });

    requestID = window.requestAnimationFrame(animateCircles);
  }

  requestID = window.requestAnimationFrame(animateCircles);
})();


(function gridSetting(){
  var grid = { roomsArray: null, itemsArray: null };
  var assets = {
    all: null, weather: null, loading: null
  };
  var pagefocus = true;
  var ani = {
    icons_active: null, icons_waiting: null,
    griditems_occupied: null, griditems_empty: null
  };

  grid.roomsArray = [].slice.call(document.querySelectorAll(".grid_room"));
  grid.itemsArray = [].slice.call(document.querySelectorAll(".grid_item"));

  assets.all = [].slice.call(document.querySelectorAll("div.asset > div"));
  assets.weather = [].slice.call(document.querySelectorAll("div.asset.weather > div"));
  assets.loading = [].slice.call(document.querySelectorAll("div.asset.loading > div"));

  grid.roomsArray.forEach((room, i)=>{
    let left, top, item;
    left = room.offsetLeft, top = room.offsetTop;
    item = grid.itemsArray[i];

    item.style.left = left + "px", item.style.top = top + "px"
  });

  function copyAndPasteIcon(cloneTo, toBeCloned) {
    let newNode = toBeCloned.cloneNode(true);
    let front = cloneTo.querySelector("div.front");
    front.appendChild(newNode);
  }

  function removeContentAndFlip(griditem) {
    let animation = griditem.querySelector("div.front > div");
    animation.remove();
    griditem.style.transform = "rotateY(180deg)";
  }

  function putAnimationIntoItems() {
    let itemN, pickedIconsArr = [], assetAll;
    let griditems_tobeused = [], griditems_all;

    itemN = 9;
    assetAll = (assets.all).slice();
    griditems_all = (grid.itemsArray).slice();


    for(let i=0; i<itemN; i++) {

      let randomIndex, assetPicked, griditemPicked;

      randomIndex = Math.floor(assetAll.length * Math.random());
      assetPicked = assetAll[randomIndex];
      pickedIconsArr.push(assetPicked);
      assetAll.splice(randomIndex, 1);

      randomIndex = Math.floor(griditems_all.length * Math.random());
      griditemPicked = griditems_all[randomIndex];
      griditems_tobeused.push(griditemPicked);
      griditems_all.splice(randomIndex, 1);

    }

    ani.icons_active = pickedIconsArr.slice();
    ani.icons_waiting = assetAll.slice();
    ani.griditems_occupied = griditems_tobeused.slice();
    ani.griditems_empty = griditems_all.slice();


    ani.griditems_empty.forEach(function(element){
      element.style.transform = "rotateY(180deg)";
    });

    for(let j=0; j<itemN; j++) {
      copyAndPasteIcon(griditems_tobeused[j], pickedIconsArr[j]);
    }

  }

  function gridItemSwapAnimation() {
    let itemsArr_copied = grid.itemsArray.slice(), pickedItems = [];
    let newPositions = [], itemN = 3;

    for(let i=0; i<itemN; i++) {
      let randomIndex, item;
      randomIndex = Math.floor(itemsArr_copied.length * Math.random());
      item = itemsArr_copied[randomIndex];
      pickedItems.push(item);
      itemsArr_copied.splice(randomIndex, 1);
    }

    getPositionInfo(pickedItems[0], 2);
    getPositionInfo(pickedItems[1], 0);
    getPositionInfo(pickedItems[2], 1);


    for(let j=0; j<itemN; j++) {
      pickedItems[j].style.top = newPositions[j].toTop + "px";
      pickedItems[j].style.left = newPositions[j].toLeft + "px";
    }

    function getPositionInfo(item, index) {
      newPositions[index] = {
        toTop : item.offsetTop, toLeft: item.offsetLeft
      };
    }
  }

  function flipAndAddAnimation() {

    let randomIndex, picked_icon, picked_griditem, icon_removed, griditem_removed;

    randomIndex =  Math.floor( (ani.icons_waiting.length) * Math.random() );
    picked_icon = ani.icons_waiting[randomIndex];
    ani.icons_waiting.splice(randomIndex, 1);

    randomIndex = Math.floor( (ani.griditems_empty.length) * Math.random() );
    picked_griditem = ani.griditems_empty[randomIndex];
    ani.griditems_empty.splice(randomIndex, 1);

    randomIndex = Math.floor( ani.griditems_occupied.length * Math.random() );
    icon_removed = ani.icons_active[randomIndex];
    griditem_removed = ani.griditems_occupied[randomIndex];
    ani.icons_active.splice(randomIndex, 1);
    ani.griditems_occupied.splice(randomIndex, 1);
    ani.icons_active.push(picked_icon);
    ani.griditems_occupied.push(picked_griditem);
    ani.icons_waiting.push(icon_removed);
    ani.griditems_empty.push(griditem_removed);

    removeContentAndFlip(griditem_removed);
    copyAndPasteIcon(picked_griditem, picked_icon);
    picked_griditem.style.transform = "rotateY(0deg)";
  }

  window.onfocus = function(){ pagefocus = true; };
  window.onblur = function(){ pagefocus = false; };

  putAnimationIntoItems();

  window.setTimeout(()=>{

    window.setInterval(()=>{
      if(pagefocus) flipAndAddAnimation();
      else return;
    }, 3000);

  },1500);

  window.setInterval(()=>{
    if(pagefocus) gridItemSwapAnimation();
    else return;
  }, 3000);

})();


(function onebyoneSetting(){

  let _weather = {
    icons: null, names: [],
    container: document.querySelector("div#onebyone > div.weather > div.container"),
    text: document.querySelector("div#onebyone > div.weather > div.container > p.text"),
    btn_previous: document.querySelector("div#onebyone > div.weather a.btn.previous"),
    btn_next: document.querySelector("div#onebyone > div.weather a.btn.next"),
    activeIcon: null, currentIndex: 0
  };
  let _loading = {
    icons: null,
    container: document.querySelector("div#onebyone > div.loading > div.container"),
    text: document.querySelector("div#onebyone > div.loading > div.container > p.text"),
    btn_previous: document.querySelector("div#onebyone > div.loading a.btn.previous"),
    btn_next: document.querySelector("div#onebyone > div.loading a.btn.next"),
    activeIcon: null, currentIndex: 0
  };

  _weather.icons = [].slice.call(document.querySelectorAll("div.asset.weather > div"));
  _weather.icons.forEach((icon, i)=>{
    let name = icon.getAttribute("name");
    _weather.names.push(name);
  });

  _loading.icons = [].slice.call(document.querySelectorAll("div.asset.loading > div"));

  function addIcon(icon, elementTo) {
    let copy = icon.cloneNode(true);

    elementTo.activeIcon = elementTo.container.appendChild(copy);
  }
  function removeIcon(elementTo) {
    let iconToBeRemoved = elementTo.activeIcon;

    iconToBeRemoved.classList.add("remove");
    window.setTimeout(()=>{
      iconToBeRemoved.remove();
    }, 500);
  }

  addIcon(_weather.icons[_weather.currentIndex], _weather);
  _weather.text.textContent = _weather.names[_weather.currentIndex];
  addIcon(_loading.icons[_weather.currentIndex], _loading);

  _weather.btn_previous.addEventListener("click", click_weather_previous);
  _weather.btn_next.addEventListener("click", click_weather_next);
  _loading.btn_previous.addEventListener("click", click_loading_previous);
  _loading.btn_next.addEventListener("click", click_loading_next);

  function click_weather_previous(event) {
    let i = _weather.currentIndex;

    event.preventDefault();
    removeIcon(_weather);

    _weather.currentIndex = (i == 0)?
      (_weather.icons.length - 1) : (i - 1);

    addIcon(_weather.icons[_weather.currentIndex], _weather);
    _weather.text.textContent = _weather.names[_weather.currentIndex];
    _weather.activeIcon.classList.add("from_left");
    window.setTimeout(()=>{
      _weather.activeIcon.style.left = "30px";
    }, 0);

  }

  function click_weather_next(event) {
    let i = _weather.currentIndex;

    event.preventDefault();
    removeIcon(_weather);

    _weather.currentIndex = (i == (_weather.icons.length - 1))?
      0 : (i + 1);

    addIcon(_weather.icons[_weather.currentIndex], _weather);
    _weather.text.textContent = _weather.names[_weather.currentIndex];
    _weather.activeIcon.classList.add("from_right");
    window.setTimeout(()=>{
      _weather.activeIcon.style.left = "30px";
    }, 0);
  }

  function click_loading_previous(event) {
    let i = _loading.currentIndex;

    event.preventDefault();
    removeIcon(_loading);

    _loading.currentIndex = (i == 0)?
      (_loading.icons.length - 1) : (i - 1);

    addIcon(_loading.icons[_loading.currentIndex], _loading);

    _loading.activeIcon.classList.add("from_left");
    window.setTimeout(()=>{
      _loading.activeIcon.style.left = "30px";
    }, 0);

  }

  function click_loading_next(event) {
    let i = _loading.currentIndex;

    event.preventDefault();
    removeIcon(_loading);

    _loading.currentIndex = (i == (_loading.icons.length - 1))? 0 : (i + 1);

    addIcon(_loading.icons[_loading.currentIndex], _loading);

    _loading.activeIcon.classList.add("from_right");
    window.setTimeout(()=>{
      _loading.activeIcon.style.left = "30px";
    }, 0);
  }

})();

(function extraSetting(){

  let btn_all, btn_onebyone, div_all, div_onebyone;

  btn_all = document.querySelector("section#section-1 a.all");
  btn_onebyone = document.querySelector("section#section-1 a.onebyone");
  div_all = document.querySelector("section#section-2 div#all");
  div_onebyone = document.querySelector("section#section-2 div#onebyone");

  btn_all.addEventListener("click", (event)=>{
    event.preventDefault();

    div_all.style.visibility = "visible";
    div_all.style.left = "50%";
    div_onebyone.style.left = "150%";
    window.setTimeout(()=>{
      div_onebyone.style.visibility = "hidden";
    }, 500);
  });

  btn_onebyone.addEventListener("click", (event)=>{
    event.preventDefault();

    div_onebyone.style.visibility = "visible";
    div_onebyone.style.left = "50%";
    div_all.style.left = "-50%";
    window.setTimeout(()=>{
      div_all.style.visibility = "hidden";
    }, 500);
  });

})();
