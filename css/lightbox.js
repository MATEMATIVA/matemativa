// -----------------------------------------------------------------------------------
//
//	Lightbox v2.03
//	by Lokesh Dhakar - http://www.huddletogether.com
//	4/9/06
//
//	For more information on this script, visit:
//	http://huddletogether.com/projects/lightbox2/
//
//	Licensed under the Creative Commons Attribution 2.5 License - http://creativecommons.org/licenses/by/2.5/
//	
//	Credit also due to those who have helped, inspired, and made their code available to the public.
//	Including: Scott Upton(uptonic.com), Peter-Paul Koch(quirksmode.org), Thomas Fuchs(mir.aculo.us), and others.
//
//	Lightbox v2.03a
//	by Dynamicdrive.com- http://www.dynamicdrive.com
//	Nov 29th, 2007
//	Added ability for the caption ("title" attr of link) to be optionally hyperlinked, by throwing in a "rev" attr containing the desired link
// -----------------------------------------------------------------------------------
/*

	Table of Contents
	-----------------
	Configuration
	Global Variables

	Extending Built-in Objects	
	- Object.extend(Element)
	- Array.prototype.removeDuplicates()
	- Array.prototype.empty()

	Lightbox Class Declaration
	- initialize()
	- start()
	- changeImage()
	- resizeImageContainer()
	- showImage()
	- updateDetails()
	- updateNav()
	- enableKeyboardNav()
	- disableKeyboardNav()
	- keyboardAction()
	- preloadNeighborImages()
	- end()
	
	Miscellaneous Functions
	- getPageScroll()
	- getPageSize()
	- getKey()
	- listenKey()
	- showSelectBoxes()
	- hideSelectBoxes()
	- showFlash()
	- hideFlash()
	- pause()
	- initLightbox()
	
	Function Calls
	- addLoadEvent(initLightbox)
	
*/
// -----------------------------------------------------------------------------------

//
//	Configuration
//
var fileLoadingImage = "../../../imagens/loading.gif";		
var fileBottomNavCloseImage = "../../../imagens/closelabel.png";

var animate = true;	// toggles resizing animations
var resizeSpeed = 8;	// controls the speed of the image resizing animations (1=slowest and 10=fastest)

var borderSize = 10;	//if you adjust the padding in the CSS, you will need to update this variable

// -----------------------------------------------------------------------------------

//
//	Global Variables
//
var imageArray = new Array;
var activeImage;

if(animate == true){
	overlayDuration = 0.2;	// shadow fade in/out duration
	if(resizeSpeed > 10){ resizeSpeed = 10;}
	if(resizeSpeed < 1){ resizeSpeed = 1;}
	resizeDuration = (11 - resizeSpeed) * 0.15;
} else { 
	overlayDuration = 0;
	resizeDuration = 0;
}

// -----------------------------------------------------------------------------------

//
//	Additional methods for Element added by SU, Couloir
//	- further additions by Lokesh Dhakar (huddletogether.com)
//
Object.extend(Element, {
	getWidth: function(element) {
	   	element = $(element);
	   	return element.offsetWidth; 
	},
	setWidth: function(element,w) {
	   	element = $(element);
    	element.style.width = w +"px";
	},
	setHeight: function(element,h) {
   		element = $(element);
    	element.style.height = h +"px";
	},
	setTop: function(element,t) {
	   	element = $(element);
    	element.style.top = t +"px";
	},
	setSrc: function(element,src) {
    	element = $(element);
    	element.src = src; 
	},
	setHref: function(element,href) {
    	element = $(element);
    	element.href = href; 
	},
	setInnerHTML: function(element,content) {
		element = $(element);
		element.innerHTML = content;
	}
});

// -----------------------------------------------------------------------------------

//
//	Extending built-in Array object
//	- array.removeDuplicates()
//	- array.empty()
//
Array.prototype.removeDuplicates = function () {
    for(i = 0; i < this.length; i++){
        for(j = this.length-1; j>i; j--){        
            if(this[i][0] == this[j][0]){
                this.splice(j,1);
            }
        }
    }
}

// -----------------------------------------------------------------------------------

Array.prototype.empty = function () {
	for(i = 0; i <= this.length; i++){
		this.shift();
	}
}

// -----------------------------------------------------------------------------------

//
//	Lightbox Class Declaration
//	- initialize()
//	- start()
//	- changeImage()
//	- resizeImageContainer()
//	- showImage()
//	- updateDetails()
//	- updateNav()
//	- enableKeyboardNav()
//	- disableKeyboardNav()
//	- keyboardNavAction()
//	- preloadNeighborImages()
//	- end()
//
//	Structuring of code inspired by Scott Upton (http://www.uptonic.com/)
//
var Lightbox = Class.create();

Lightbox.prototype = {
	
	// initialize()
	// Constructor runs on completion of the DOM loading. Loops through anchor tags looking for 
	// 'lightbox' references and applies onclick events to appropriate links. The 2nd section of
	// the function inserts html at the bottom of the page which is used to display the shadow 
	// overlay and the image container.
	//
	initialize: function() {	
		if (!document.getElementsByTagName){ return; }
		var anchors = document.getElementsByTagName('a');
		var areas = document.getElementsByTagName('area');

		// loop through all anchor tags
		for (var i=0; i<anchors.length; i++){
			var anchor = anchors[i];
			
			var relAttribute = String(anchor.getAttribute('rel'));
			
			// use the string.match() method to catch 'lightbox' references in the rel attribute
			if (anchor.getAttribute('href') && (relAttribute.toLowerCase().match('lightbox'))){
				anchor.onclick = function () {myLightbox.start(this); return false;}
			}
		}

		// loop through all area tags
		// todo: combine anchor & area tag loops
		for (var i=0; i< areas.length; i++){
			var area = areas[i];
			
			var relAttribute = String(area.getAttribute('rel'));
			
			// use the string.match() method to catch 'lightbox' references in the rel attribute
			if (area.getAttribute('href') && (relAttribute.toLowerCase().match('lightbox'))){
				area.onclick = function () {myLightbox.start(this); return false;}
			}
		}

		// The rest of this code inserts html at the bottom of the page that looks similar to this:
		//
		//	<div id="overlay"></div>
		//	<div id="lightbox">
		//		<div id="outerImageContainer">
		//			<div id="imageContainer">
		//				<img id="lightboxImage">
		//				<div style="" id="hoverNav">
		//					<a href="#" id="prevLink"></a>
		//					<a href="#" id="nextLink"></a>
		//				</div>
		//				<div id="loading">
		//					<a href="#" id="loadingLink">
		//						<img src="../imagens/loading.gif">
		//					</a>
		//				</div>
		//			</div>
		//		</div>
		//		<div id="imageDataContainer">
		//			<div id="imageData">
		//				<div id="imageDetails">
		//					<span id="caption"></span>
		//					<span id="numberDisplay"></span>
		//				</div>
		//				<div id="bottomNav">
		//					<a href="#" id="bottomNavClose">
		//						<img src="../imagens/closelabel.gif">
		//					</a>
		//				</div>
		//			</div>
		//		</div>
		//	</div>


		var objBody = document.getElementsByTagName("body").item(0);
		
		var objOverlay = document.createElement("div");
		objOverlay.setAttribute('id','overlay');
		objOverlay.style.display = 'none';
		objOverlay.onclick = function() { myLightbox.end(); }
		objBody.appendChild(objOverlay);
		
		var objLightbox = document.createElement("div");
		objLightbox.setAttribute('id','lightbox');
		objLightbox.style.display = 'none';
		objLightbox.onclick = function(e) {	// close Lightbox is user clicks shadow overlay
			if (!e) var e = window.event;
			var clickObj = Event.element(e).id;
			if ( clickObj == 'lightbox') {
				myLightbox.end();
			}
		};
		objBody.appendChild(objLightbox);
			
		var objOuterImageContainer = document.createElement("div");
		objOuterImageContainer.setAttribute('id','outerImageContainer');
		objLightbox.appendChild(objOuterImageContainer);

		// When Lightbox starts it will resize itself from 250 by 250 to the current image dimension.
		// If animations are turned off, it will be hidden as to prevent a flicker of a
		// white 250 by 250 box.
		if(animate){
			Element.setWidth('outerImageContainer', 250);
			Element.setHeight('outerImageContainer', 250);			
		} else {
			Element.setWidth('outerImageContainer', 1);
			Element.setHeight('outerImageContainer', 1);			
		}

		var objImageContainer = document.createElement("div");
		objImageContainer.setAttribute('id','imageContainer');
		objOuterImageContainer.appendChild(objImageContainer);
	
		var objLightboxImage = document.createElement("img");
		objLightboxImage.setAttribute('id','lightboxImage');
		objImageContainer.appendChild(objLightboxImage);
	
		var objHoverNav = document.createElement("div");
		objHoverNav.setAttribute('id','hoverNav');
		objImageContainer.appendChild(objHoverNav);
	
		var objPrevLink = document.createElement("a");
		objPrevLink.setAttribute('id','prevLink');
		objPrevLink.setAttribute('href','#');
		objHoverNav.appendChild(objPrevLink);
		
		var objNextLink = document.createElement("a");
		objNextLink.setAttribute('id','nextLink');
		objNextLink.setAttribute('href','#');
		objHoverNav.appendChild(objNextLink);
	
		var objLoading = document.createElement("div");
		objLoading.setAttribute('id','loading');
		objImageContainer.appendChild(objLoading);
	
		var objLoadingLink = document.createElement("a");
		objLoadingLink.setAttribute('id','loadingLink');
		objLoadingLink.setAttribute('href','#');
		objLoadingLink.onclick = function() { myLightbox.end(); return false; }
		objLoading.appendChild(objLoadingLink);
	
		var objLoadingImage = document.createElement("img");
		objLoadingImage.setAttribute('src', fileLoadingImage);
		objLoadingLink.appendChild(objLoadingImage);

		var objImageDataContainer = document.createElement("div");
		objImageDataContainer.setAttribute('id','imageDataContainer');
		objImageDataContainer.className = 'clearfix';
		objLightbox.appendChild(objImageDataContainer);

		var objImageData = document.createElement("div");
		objImageData.setAttribute('id','imageData');
		objImageDataContainer.appendChild(objImageData);
	
		var objImageDetails = document.createElement("div");
		objImageDetails.setAttribute('id','imageDetails');
		objImageData.appendChild(objImageDetails);
	
		var objCaption = document.createElement("span");
		objCaption.setAttribute('id','caption');
		objImageDetails.appendChild(objCaption);
	
		var objNumberDisplay = document.createElement("span");
		objNumberDisplay.setAttribute('id','numberDisplay');
		objImageDetails.appendChild(objNumberDisplay);
		
		var objBottomNav = document.createElement("div");
		objBottomNav.setAttribute('id','bottomNav');
		objImageData.appendChild(objBottomNav);
	
		var objBottomNavCloseLink = document.createElement("a");
		objBottomNavCloseLink.setAttribute('id','bottomNavClose');
		objBottomNavCloseLink.setAttribute('href','#');
		objBottomNavCloseLink.onclick = function() { myLightbox.end(); return false; }
		objBottomNav.appendChild(objBottomNavCloseLink);
	
		var objBottomNavCloseImage = document.createElement("img");
		objBottomNavCloseImage.setAttribute('src', fileBottomNavCloseImage);
		objBottomNavCloseLink.appendChild(objBottomNavCloseImage);
	},
	
	//
	//	start()
	//	Display overlay and lightbox. If image is part of a set, add siblings to imageArray.
	//
	start: function(imageLink) {	

		function getImageTitle(anchor){ //DynamicDrive.com added function that allows the caption("title") to be linked ("rev").
			var ddimageTitle=anchor.getAttribute('title')
			var ddimageTitleURL=(ddimageTitle!=null && ddimageTitle!="")? anchor.getAttribute('rev') : null
			return ddimageTitleFinal=(ddimageTitleURL!=null && ddimageTitleURL!="")? '<a href="'+ddimageTitleURL+'" class="ddcaptionurl">'+ddimageTitle+'</a>' : ddimageTitle
		};

		hideSelectBoxes();
		hideFlash();

		// stretch overlay to fill page and fade in
		var arrayPageSize = getPageSize();
		Element.setHeight('overlay', arrayPageSize[1]);

		new Effect.Appear('overlay', { duration: overlayDuration, from: 0.0, to: 0.8 });

		imageArray = [];
		imageNum = 0;		

		if (!document.getElementsByTagName){ return; }
		var anchors = document.getElementsByTagName('a');

		// if image is NOT part of a set..
		if((imageLink.getAttribute('rel') == 'lightbox')){
			// add single image to imageArray
			imageArray.push(new Array(imageLink.getAttribute('href'), getImageTitle(imageLink)));			
		} else {
		// if image is part of a set..

			// loop through anchors, find other images in set, and add them to imageArray
			for (var i=0; i<anchors.length; i++){
				var anchor = anchors[i];
				if (anchor.getAttribute('href') && (anchor.getAttribute('rel') == imageLink.getAttribute('rel'))){
					imageArray.push(new Array(anchor.getAttribute('href'), getImageTitle(anchor)));
				}
			}
			imageArray.removeDuplicates();
			while(imageArray[imageNum][0] != imageLink.getAttribute('href')) { imageNum++;}
		}

		// calculate top offset for the lightbox and display 
		var arrayPageScroll = getPageScroll();
		var lightboxTop = arrayPageScroll[1] + (arrayPageSize[3] / 10);

		Element.setTop('lightbox', lightboxTop);
		Element.show('lightbox');
		
		this.changeImage(imageNum);
	},

	//
	//	changeImage()
	//	Hide most elements and preload image in preparation for resizing image container.
	//
	changeImage: function(imageNum) {	
		
		activeImage = imageNum;	// update global var

		// hide elements during transition
		if(animate){ Element.show('loading');}
		Element.hide('lightboxImage');
		Element.hide('hoverNav');
		Element.hide('prevLink');
		Element.hide('nextLink');
		Element.hide('imageDataContainer');
		Element.hide('numberDisplay');		
		
		imgPreloader = new Image();
		
		// once image is preloaded, resize image container
		imgPreloader.onload=function(){
			Element.setSrc('lightboxImage', imageArray[activeImage][0]);
			myLightbox.resizeImageContainer(imgPreloader.width, imgPreloader.height);
		}
		imgPreloader.src = imageArray[activeImage][0];
	},

	//
	//	resizeImageContainer()
	//
	resizeImageContainer: function( imgWidth, imgHeight) {

		// get curren width and height
		this.widthCurrent = Element.getWidth('outerImageContainer');
		this.heightCurrent = Element.getHeight('outerImageContainer');

		// get new width and height
		var widthNew = (imgWidth  + (borderSize * 2));
		var heightNew = (imgHeight  + (borderSize * 2));

		// scalars based on change from old to new
		this.xScale = ( widthNew / this.widthCurrent) * 100;
		this.yScale = ( heightNew / this.heightCurrent) * 100;

		// calculate size difference between new and old image, and resize if necessary
		wDiff = this.widthCurrent - widthNew;
		hDiff = this.heightCurrent - heightNew;

		if(!( hDiff == 0)){ new Effect.Scale('outerImageContainer', this.yScale, {scaleX: false, duration: resizeDuration, queue: 'front'}); }
		if(!( wDiff == 0)){ new Effect.Scale('outerImageContainer', this.xScale, {scaleY: false, delay: resizeDuration, duration: resizeDuration}); }

		// if new and old image are same size and no scaling transition is necessary, 
		// do a quick pause to prevent image flicker.
		if((hDiff == 0) && (wDiff == 0)){
			if (navigator.appVersion.indexOf("MSIE")!=-1){ pause(250); } else { pause(100);} 
		}

		Element.setHeight('prevLink', imgHeight);
		Element.setHeight('nextLink', imgHeight);
		Element.setWidth( 'imageDataContainer', widthNew);

		this.showImage();
	},
	
	//
	//	showImage()
	//	Display image and begin preloading neighbors.
	//
	showImage: function(){
		Element.hide('loading');
		new Effect.Appear('lightboxImage', { duration: resizeDuration, queue: 'end', afterFinish: function(){	myLightbox.updateDetails(); } });
		this.preloadNeighborImages();
	},

	//
	//	updateDetails()
	//	Display caption, image number, and bottom nav.
	//
	updateDetails: function() {
	
		Element.show('caption');
		Element.setInnerHTML( 'caption', imageArray[activeImage][1]);
		
		// if image is part of set display 'Image x of x' 
		if(imageArray.length > 1){
			Element.show('numberDisplay');
			Element.setInnerHTML( 'numberDisplay', "Imagem " + eval(activeImage + 1) + " de " + imageArray.length);
		}

		new Effect.Parallel(
			[ new Effect.SlideDown( 'imageDataContainer', { sync: true, duration: resizeDuration, from: 0.0, to: 1.0 }), 
			  new Effect.Appear('imageDataContainer', { sync: true, duration: resizeDuration }) ], 
			{ duration: resizeDuration, afterFinish: function() {
				// update overlay size and update nav
				var arrayPageSize = getPageSize();
				Element.setHeight('overlay', arrayPageSize[1]);
				myLightbox.updateNav();
				}
			} 
		);
	},

	//
	//	updateNav()
	//	Display appropriate previous and next hover navigation.
	//
	updateNav: function() {

		Element.show('hoverNav');				

		// if not first image in set, display prev image button
		if(activeImage != 0){
			Element.show('prevLink');
			document.getElementById('prevLink').onclick = function() {
				myLightbox.changeImage(activeImage - 1); return false;
			}
		}

		// if not last image in set, display next image button
		if(activeImage != (imageArray.length - 1)){
			Element.show('nextLink');
			document.getElementById('nextLink').onclick = function() {
				myLightbox.changeImage(activeImage + 1); return false;
			}
		}
		
		this.enableKeyboardNav();
	},

	//
	//	enableKeyboardNav()
	//
	enableKeyboardNav: function() {
		document.onkeydown = this.keyboardAction; 
	},

	//
	//	disableKeyboardNav()
	//
	disableKeyboardNav: function() {
		document.onkeydown = '';
	},

	//
	//	keyboardAction()
	//
	keyboardAction: function(e) {
		if (e == null) { // ie
			keycode = event.keyCode;
			escapeKey = 27;
		} else { // mozilla
			keycode = e.keyCode;
			escapeKey = e.DOM_VK_ESCAPE;
		}

		key = String.fromCharCode(keycode).toLowerCase();
		
		if((key == 'x') || (key == 'o') || (key == 'c') || (keycode == escapeKey)){	// close lightbox
			myLightbox.end();
		} else if((key == 'p') || (keycode == 37)){	// display previous image
			if(activeImage != 0){
				myLightbox.disableKeyboardNav();
				myLightbox.changeImage(activeImage - 1);
			}
		} else if((key == 'n') || (keycode == 39)){	// display next image
			if(activeImage != (imageArray.length - 1)){
				myLightbox.disableKeyboardNav();
				myLightbox.changeImage(activeImage + 1);
			}
		}

	},

	//
	//	preloadNeighborImages()
	//	Preload previous and next images.
	//
	preloadNeighborImages: function(){

		if((imageArray.length - 1) > activeImage){
			preloadNextImage = new Image();
			preloadNextImage.src = imageArray[activeImage + 1][0];
		}
		if(activeImage > 0){
			preloadPrevImage = new Image();
			preloadPrevImage.src = imageArray[activeImage - 1][0];
		}
	
	},

	//
	//	end()
	//
	end: function() {
		this.disableKeyboardNav();
		Element.hide('lightbox');
		new Effect.Fade('overlay', { duration: overlayDuration});
		showSelectBoxes();
		showFlash();
	}
}

// -----------------------------------------------------------------------------------

//
// getPageScroll()
// Returns array with x,y page scroll values.
// Core code from - quirksmode.org
//
function getPageScroll(){

	var yScroll;

	if (self.pageYOffset) {
		yScroll = self.pageYOffset;
	} else if (document.documentElement && document.documentElement.scrollTop){	 // Explorer 6 Strict
		yScroll = document.documentElement.scrollTop;
	} else if (document.body) {// all other Explorers
		yScroll = document.body.scrollTop;
	}

	arrayPageScroll = new Array('',yScroll) 
	return arrayPageScroll;
}

// -----------------------------------------------------------------------------------

//
// getPageSize()
// Returns array with page width, height and window width, height
// Core code from - quirksmode.org
// Edit for Firefox by pHaez
//
function getPageSize(){
	
	var xScroll, yScroll;
	
	if (window.innerHeight && window.scrollMaxY) {	
		xScroll = document.body.scrollWidth;
		yScroll = window.innerHeight + window.scrollMaxY;
	} else if (document.body.scrollHeight > document.body.offsetHeight){ // all but Explorer Mac
		xScroll = document.body.scrollWidth;
		yScroll = document.body.scrollHeight;
	} else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
		xScroll = document.body.offsetWidth;
		yScroll = document.body.offsetHeight;
	}
	
	var windowWidth, windowHeight;
	if (self.innerHeight) {	// all except Explorer
		windowWidth = self.innerWidth;
		windowHeight = self.innerHeight;
	} else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
		windowWidth = document.documentElement.clientWidth;
		windowHeight = document.documentElement.clientHeight;
	} else if (document.body) { // other Explorers
		windowWidth = document.body.clientWidth;
		windowHeight = document.body.clientHeight;
	}	
	
	// for small pages with total height less then height of the viewport
	if(yScroll < windowHeight){
		pageHeight = windowHeight;
	} else { 
		pageHeight = yScroll;
	}

	// for small pages with total width less then width of the viewport
	if(xScroll < windowWidth){	
		pageWidth = windowWidth;
	} else {
		pageWidth = xScroll;
	}

	arrayPageSize = new Array(pageWidth,pageHeight,windowWidth,windowHeight) 
	return arrayPageSize;
}

// -----------------------------------------------------------------------------------

//
// getKey(key)
// Gets keycode. If 'x' is pressed then it hides the lightbox.
//
function getKey(e){
	if (e == null) { // ie
		keycode = event.keyCode;
	} else { // mozilla
		keycode = e.which;
	}
	key = String.fromCharCode(keycode).toLowerCase();
	
	if(key == 'x'){
	}
}

// -----------------------------------------------------------------------------------

//
// listenKey()
//
function listenKey () {	document.onkeypress = getKey; }
	
// ---------------------------------------------------

function showSelectBoxes(){
	var selects = document.getElementsByTagName("select");
	for (i = 0; i != selects.length; i++) {
		selects[i].style.visibility = "visible";
	}
}

// ---------------------------------------------------

function hideSelectBoxes(){
	var selects = document.getElementsByTagName("select");
	for (i = 0; i != selects.length; i++) {
		selects[i].style.visibility = "hidden";
	}
}

// ---------------------------------------------------

function showFlash(){
	var flashObjects = document.getElementsByTagName("object");
	for (i = 0; i != flashObjects.length; i++) {
		flashObjects[i].style.visibility = "visible";
	}

	var flashEmbeds = document.getElementsByTagName("embeds");
	for (i = 0; i != flashEmbeds.length; i++) {
		flashEmbeds[i].style.visibility = "visible";
	}
}

// ---------------------------------------------------

function hideFlash(){
	var flashObjects = document.getElementsByTagName("object");
	for (i = 0; i != flashObjects.length; i++) {
		flashObjects[i].style.visibility = "hidden";
	}

	var flashEmbeds = document.getElementsByTagName("embeds");
	for (i = 0; i != flashEmbeds.length; i++) {
		flashEmbeds[i].style.visibility = "hidden";
	}

}


// ---------------------------------------------------

//
// pause(numberMillis)
// Pauses code execution for specified time. Uses busy code, not good.
// Help from Ran Bar-On [ran2103@gmail.com]
//

function pause(ms){
	var date = new Date();
	curDate = null;
	do{var curDate = new Date();}
	while( curDate - date < ms);
}
/*
function pause(numberMillis) {
	var curently = new Date().getTime() + sender;
	while (new Date().getTime();	
}
*/
// ---------------------------------------------------



function initLightbox() { myLightbox = new Lightbox(); }
Event.observe(window, 'load', initLightbox, false);