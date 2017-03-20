

var Block = function() {
	// this.currentPosition	// 当前位置
	// this.position	// 原来的位置（格子）
	
}

Block.prototype = {
	shake: function() {	// 振动
	
		this.interval = setInterval(function() {
			var left = this.position.left;
			var top = this.position.top;
			this.el.animate({
				left: left + 2,
			}, 100);
			this.el.animate({
				left: left - 2 
			}, 100);
		}.bind(this));
	},
	stopShake: function() {
		this.el.stop(true);
		$(this.el).animate(this.position, 150, function() {
			$(this).css('z-index', 'auto');
		});	
		clearInterval(this.interval);
	}
}


var Main = function() {
	var me = this;
	
	var offset 	= $('.draggable').offset().left;	// 图标外边界
	var width 	= $('.draggable').width();			// 图标边长

	var draggable = $('.draggable').draggabilly();
	
	this.blocks = [];
	
	var animateTime = 500;
	
	
	draggable.css('position', 'absolute');	// 兼容ie8
	
	draggable.each(function(i, blockEl) {
		var block = new Block();
		block.position = $(blockEl).position();
		
		block.currentPosition = $(blockEl).position();
		
		block.el = $(blockEl);
		$(blockEl).data('block', block);
		
		me.blocks.push(block);
		
		$(blockEl).css(block.position);	// 兼容ie8
	});
	
	
	var nearestBlockExt;
	draggable.on('dragMove', function(e, pointer, moveVector ) {
		
		var currentBlock = $(this).data('block');	// 当前block
		currentBlock.currentPosition = $(this).position();
		
		nearestBlockExt = me.getNearestBlock(currentBlock);
		nearestBlockExt.block.currentPosition = $(this).position();	// 同步当前位置
		
		var currentIndex = currentBlock.el.index('.draggable');
		var nearestIndex = nearestBlockExt.block.el.index('.draggable');
		
		var smallerIndex = currentIndex < nearestIndex ? currentIndex + 1 : nearestIndex;
		var biggerIndex = currentIndex > nearestIndex ? currentIndex - 1 : nearestIndex;
		
		$(this).css('z-index', '3');
		var el = nearestBlockExt.block.el;
		if (nearestBlockExt.distance > 50) { // 如果距离大于50, 则回到原来位置
			el.css({
				'z-index': 'auto',
				'border': '2px white solid'
			});
			
			/*
			me.blocks.forEach(function(it, i) {
				
				if(i >= smallerIndex && i <= biggerIndex) {
					
					$(it.el).animate(it.position, animateTime, function() {
						$(this).css('z-index', 'auto');
					});
					it.currentPosition = {
						left: it.position.left,
						top: it.position.top
					}
				}
			});
			*/
			
		} else {
			el.css({
				'z-index': '2',
				'border': '2px #36ab7a dashed'
			});
			
			
			me.blocks.forEach(function(it, i) {
				
				if(i >= smallerIndex && i <= biggerIndex) {
					
					if(currentIndex > nearestIndex) {
						var nextPosition = me.blocks[i + 1].position;
					} else {
						var nextPosition = me.blocks[i - 1].position;
					}
					$(it.el).animate(nextPosition, animateTime, function() {
						$(this).css('z-index', 'auto');
					});
					it.currentPosition = {
						left: nextPosition.left,
						top: nextPosition.top
					}
				}
			});
		}
		
	}).on('dragEnd', function(e, pointer) {
		
		var currentBlock = $(this).data('block');	// 当前block
		console.log(nearestBlockExt.distance);
		if(nearestBlockExt.distance > 50) {	// 如果距离大于30, 则回到原来位置
			$(this).animate(currentBlock.position, animateTime, function() {
				$(this).css('z-index', 'auto');
			});
			
		} else {
			currentBlock.position = {
				left: nearestBlockExt.block.position.left,
				top: nearestBlockExt.block.position.top,
			}
			$(this).animate(currentBlock.position, animateTime, function() {
				$(this).css('z-index', 'auto');
			});			
		}
		nearestBlockExt.block.el.css('border', '2px white solid');
		
	}).on('pointerUp', function() {
		$(this).focus(); // 兼容ie8的处理
	});
}


Main.prototype = {

	getNearestBlock : function(block) {
		var me = this;
		var currentPosition = block.currentPosition;
		
		return this.blocks.reduce(function(o, it, i) {
			var distance = o.distance;
			var index = o.index;
			
			var dis = me.getDistance(currentPosition, it.position);	// 当前block和目标block的位置距离
			if(block != it && distance > dis) {
				distance = dis;
				index = i;
			}
			return {
				index: index,
				distance: distance,
				block: me.blocks[index]
			}
		}, {
			index: -1,
			distance: Number.MAX_VALUE
		});
	},
	getDistance : function(p1, p2) {
		return Math.sqrt(Math.pow(p2.left - p1.left, 2) + Math.pow(p2.top - p1.top, 2));
	},
	movoTo: function(position, time) {
		
	}
}

new Main();