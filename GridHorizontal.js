/*
 * Grid-Horizontal v0.9.2
 * test
 */

//
// Extend jQuery
//

/*
CHANGELOG
- USE STRICT

*/
'use strict';

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

let GridH = function ($container, settings = {}) {	

	// LAYOUT SETTINGS

	// Item selector
	let itemSelector = settings.item || '.item';

	// Image selector
	let imageSelector = settings.imageClass || '.cover';

	// Gutter width
	let gutter = settings.gutter || 20;

	// Minimum container width to initiate calculation
	// If container is smaller than 'minRowWidth' value, then images spread vertically
	let minContainerWidth = settings.minWidth || 300;

	// Maximum row height
	// Script pulls next images as long as total row height gets smaller then 'maxRowHeight' value
	let maxRowHeight = settings.maxRowHeight || 320;

	// Hide overload
	// When true script won't show additional elements in the end of the list, those that are unable to form full row
	let hideOverload = settings.hideOverload || false;

	//
	// SCRIPT
	//
	
	let $items = $container.children('.item');
	let $images = $items.find('img');

	let containerWidth = $container.width();
	let currentOffsetTop = 0;
	let currentOffsetLeft = 0;
	let finalContainerHeight = 0;
	
	// Start

	// Define size and ratio of each element
	$items.each(function(i,elem) {
		let params = {};
		let $item = $(elem);
		let $currentImage = $item.find('img');

		if ($currentImage.length) {
			params.originalWidth = $currentImage[0].naturalWidth;
			params.originalHeight = $currentImage[0].naturalHeight;
		} else {
			params.originalWidth = parseInt($item.css('width'), 10);
			params.originalHeight = parseInt($item.css('height'), 10);
		}
		params.ratio = params.originalWidth/params.originalHeight;
		$item[0].GH = params;
	})

	// Prepare container for proper items display
	if(['absolute', 'fixed', 'relative'].includes($container.css('position')) === false ) {
		$container.css('position', 'relative');
	}
	
	calculateGrid($items);
	$container.css('height', finalContainerHeight);
	pushToHTML($items);

	// Destroy currents
	currentOffsetTop = 0;
	currentOffsetLeft = 0;

	// Stop

	//
	// FUNCTIONS
	//

	function calculateGrid(array) {

		let subArray;
		let currentRowHeight = 0;

		for(let i=1, countItems = array.length; i <= countItems; i++) {						
			subArray = array.slice(0,i);

			if(containerWidth < minContainerWidth) {
				let item = subArray[0];
				setGHParams(
					item, 
					containerWidth, 
					getHeightByWidth(containerWidth, item.GH.ratio), 
					currentOffsetTop, 
					0,
				);
				currentRowHeight = item.GH.height;	
			} else if((currentRowHeight=sliceHeightCalc(subArray)) < maxRowHeight) {
				let currentOffsetLeft = 0;

				for(let i=0, len = array.length; i<len; i++) {
					let item = array[i];
					setGHParams(
						item, 
						getWidthByHeight(currentRowHeight, item.GH.ratio), 
						currentRowHeight, 
						currentOffsetTop, 
						currentOffsetLeft,
					);
					currentOffsetLeft += item.GH.width + gutter;
				}
			} else {
				continue;
			}

			increaseCurrentOffsetTop(currentRowHeight + gutter);

			array = array.slice(i);			
			countItems=array.length;
			i = 0;
		}

		if(array.length > 0) {
			
			if(hideOverload == true) {
				array.each(function(i,elem) {
					$(elem).hide();
				});
			} else {
				for(let i=0, len = array.length; i<len; i++) {
					let item = array[i];
					setGHParams(
						item, 
						getWidthByHeight(maxRowHeight, item.GH.ratio), 
						maxRowHeight, 
						currentOffsetTop, 
						currentOffsetLeft,
					);
					currentOffsetLeft += item.width + gutter;
				}
				increaseCurrentOffsetTop(maxRowHeight);
			}
		}

		finalContainerHeight = currentOffsetTop;
	}

	function setGHParams(item, width, height, offTop, offLeft) {
		item.GH.width = width;
		item.GH.height = height;
		item.GH.offsetTop = offTop;
		item.GH.offsetLeft = offLeft;
	}

	function pushToHTML($items) {
		for(let i=0;i<$items.length;++i) {			
			let $itemLib = $items[i].GH;
			$($items[i]).css('position', 'absolute')
				.width($itemLib.width)
				.height($itemLib.height)
				.css('top', $itemLib.offsetTop)
				.css('left', $itemLib.offsetLeft)
		} 
	}

	function sliceHeightCalc(array) {
		let calcHeight;
		let workWidth = containerWidth - (array.length-1)*gutter;
		let sumRatio = 0;

		for (let i=0,len=array.length; i<len;i++) {
			sumRatio += array[i].GH.ratio;
		}
		calcHeight = (sumRatio > 0) ? workWidth/sumRatio : 0;

		return calcHeight;
	}

	function increaseCurrentOffsetTop(value) {
		currentOffsetTop += value;
	}

	function getWidthByHeight(dim, ratio) {
		return dim * ratio;
	}

	function getHeightByWidth(dim, ratio) {
		return dim / ratio;
	}
}
