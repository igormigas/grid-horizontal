/*
 * Grid-Horizontal v0.1.0
 * test
 */

//
// Extend jQuery
//
(function($) {
	$.fn.extend( {
	    GridHorizontal: function(object={}) {
	    	GridH(this, object);
	    	return this;
	    }
	});
})(jQuery);

//
// Grid-Horizontal
//

let GridH = function (container, settings = {}) {	

	// LAYOUT SETTINGS

	// Item selector
	let itemSelector = settings.item || '.item';

	// Gutter width
	let gutter = settings.gutter || 20;

	// Minimum container width to initiate calculation
	// If container is smaller than 'minRowWidth' value, then images spread vertically
	let minContainerWidth = settings.minWidth || 300;

	// Maximum row height
	// Script pulls next images as long as total row height gets smaller then 'maxRowHeight' value
	let maxRowHeight = settings.maxRowHeight || 320;

	//
	// SCRIPT
	//

	let containerWidth = container.width();
	let $items = container.children('.item');
	let $images = $items.find('img');
	
	let currentOffsetTop = 0;
	let currentOffsetLeft = 0;
	let finalContainerHeight = 0;

	// Start

	if(['absolute', 'fixed', 'relative'].includes(container.css('position')) === false ) {
		container.css('position', 'relative');
	}

	let imagesModified = minimizeImagesInfo($images);
	let rows = createRows(imagesModified);
	$(container).css('height', finalContainerHeight);
	
	pushToHTML($items, $images, imagesModified);

	// Destroy currents
	currentOffsetTop = 0;
	currentOffsetLeft = 0;

	// Stop

	//
	// FUNCTIONS
	//

	function pushToHTML(jqueryItems, jqueryImages, images) {

		for(let i=0;i<jqueryImages.length;++i) {
			if(jqueryImages[i].src != images[i].src) continue;

			$(jqueryItems[i]).css('position', 'absolute')
				.width(images[i].width)
				.height(images[i].height)
				//.offset({top: images[i].offsetTop, left: images[i].offsetLeft});
				.css('top', images[i].offsetTop)
				.css('left', images[i].offsetLeft)

			$(jqueryImages[i]).width(images[i].width)
				.height(images[i].height);
		} 
	}

	function minimizeImagesInfo(images)	{

		let array = [];
		for(let i=0;i<images.length;++i) {
			array[i] = {
				naturalWidth: images[i].naturalWidth,
				naturalHeight: images[i].naturalHeight,
				src: images[i].src,
				ratio: images[i].naturalWidth/images[i].naturalHeight,
			};
		}

		return array;
	}

	function increaseCurrentOffsetTop(value) {

		currentOffsetTop += value;
	}

	function createRows(array) {

		let rows = [];
		let currentRowHeight = 0;

		for(let i = 1, countItems = array.length; i <= countItems; i++) {			
			
			subArray = array.slice(0,i);
			
			if(containerWidth < minContainerWidth) {
				pushDimensionsByWidth(subArray, containerWidth, currentOffsetTop);
				currentRowHeight = getHeightByWidth(subArray[0], containerWidth);	
			} else if((currentRowHeight=sliceHeightCalc(subArray)) < maxRowHeight) {
				pushDimensionsByHeight(subArray, currentRowHeight, currentOffsetTop);				
			} else {
				continue;
			}

			increaseCurrentOffsetTop(currentRowHeight + gutter);

			array = array.slice(i);			
			countItems=array.length;
			i = 0;
		}

		if(array.length > 0) {
			pushDimensionsByHeight(array, maxRowHeight, currentOffsetTop);
			increaseCurrentOffsetTop(maxRowHeight);
		}

		finalContainerHeight = currentOffsetTop;

		return rows;
	}

	function sliceHeightCalc(array) {

		let calcHeight;
		let iGutter = array.length-1;
		let workWidth = containerWidth - iGutter*gutter;
		let sumRatio = 0;

		for (i=0,len=array.length; i<len;i++) {
			sumRatio += array[i].ratio;
		}
		calcHeight = (sumRatio > 0) ? workWidth/sumRatio : 0;

		return calcHeight;
	}

	function pushDimensionsByHeight(array, height, offset) {

		let currentOffsetLeft = 0;

		for(let i=0, len = array.length; i<len; i++) {
			item = array[i];

			item.width = height * item.ratio;
			item.height = height;
			item.offsetTop = offset;
			item.offsetLeft = currentOffsetLeft;

			currentOffsetLeft += item.width + gutter;
		}
	}

	function pushDimensionsByWidth(array, width, offset) {

		let item = array[0];

		item.width = width;
		item.height = getHeightByWidth(item, width);
		item.offsetTop = offset;
		item.offsetLeft = 0;
	}

	function getWidthByHeight(object, dimension) {
		return dimension * object.ratio;
	}

	function getHeightByWidth(object, dimension) {
		return dimension / object.ratio;
	}
}