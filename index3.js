/**
 * author: spq
 * date:二○一七年三月二十一日
 */

var Block = function() {
	
};

Block.prototype = {
	constructor: Block,
	currentPosition: function() {
		return this.el.position();
	},
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
		/*
		this.el.animate(this.position, 150, function() {
			$(this).css('z-index', 'auto');
		});
		*/
		clearInterval(this.interval);
	},
	getXY: function() {
		
	}
};


var ImageDrag = function() {
	
	
	var me = this;
	
	this.initPanel();
	
	
	
	var width 	= $('.draggable').width();			// 图标边长

	var draggable = $('.draggable').draggabilly();
	
	this.blocks = [];
	
	var animateTime = 200;
	
	draggable.css('position', 'absolute');	// 兼容ie8
	
	draggable.each(function(i, blockEl) {
		var block = new Block();
		
		block.el = $(blockEl);
		$(blockEl).data('block', block);
		
		block.position = $(blockEl).position();
		
		block.idx = i;
		$(blockEl).attr('idx', i);
		
		me.blocks.push(block);
		
		$(blockEl).css(block.position);	// 兼容ie8
	});
	
	
	draggable.on({
		access: function(e) {
			console.log('in');
			var currentBlock = $(this).data('block');	// 当前block
			
			var nearestBlockExt = me.getNearestBlock(currentBlock);
			
			var el = nearestBlockExt.block.el;
			el.css({
				'border': '3px red dashed'
			});
			
			nearestBlockExt.block.shake();
		},
		leave: function(e) {
			var currentBlock = $(this).data('block');	// 当前block
			
			var nearestBlockExt = me.getNearestBlock(currentBlock);
			
			var el = nearestBlockExt.block.el;
			
			el.css({
				'border': '3px white solid'
			});
			
			nearestBlockExt.block.stopShake();
		}
	});
	
	
	var accessTag = false;
	draggable.on({
		dragMove: function(e, pointer, moveVector ) {
			
			var currentBlock = $(this).data('block');	// 当前block
			
			var nearestBlockExt = me.getNearestBlock(currentBlock);
			
			currentBlock.el.css({
				'z-index': '2',
			});
			
			if (nearestBlockExt.distance < 50) {
				if(!accessTag) {
					$(this).trigger('access');
					accessTag = !accessTag;
				}
			} else {				// 如果距离大于50, 则回到原来位置
				if(accessTag) {
					$(this).trigger('leave');
					accessTag = !accessTag;
				}
			}
		},
		dragEnd: function(e, pointer) {
			
			var currentBlock = $(this).data('block');	// 当前block
			
			var nearestBlockExt = me.getNearestBlock(currentBlock);	// 获取最近的block
			
			nearestBlockExt.block.stopShake();
			
			var el = nearestBlockExt.block.el;
			
			var currentIndex = currentBlock.idx;			// 当前拖动的block的idx
			var nearestIndex = nearestBlockExt.block.idx;	// 最近的block的idx
			
			if(nearestBlockExt.distance < 50) {	
			
				var smallerIndex = currentIndex < nearestIndex ? currentIndex + 1 : nearestIndex;
				var biggerIndex = currentIndex > nearestIndex ? currentIndex - 1 : nearestIndex;
				me.blocks.forEach(function(it) {
					
					if(it.idx >= smallerIndex && it.idx <= biggerIndex) {
						// it为需要移动的block
						
						if(currentIndex > nearestIndex) {
							var nextIndex = it.idx + 1;
						} else {
							var nextIndex = it.idx - 1;
						}
					
						var nextBlock = me.getBlockByIndex(nextIndex);
						var nextPosition = nextBlock.position;	// 获取下一个block位置
						
						$(it.el).animate(nextPosition, animateTime, function() {
							$(this).css('z-index', 'auto');
							it.idx = nextIndex;
							it.el.attr('index', nextIndex);
							
							it.position = nextPosition;
						});
					}
				});
				
				// 将index更新
				currentBlock.idx = nearestBlockExt.block.idx;
				currentBlock.el.attr('idx', currentBlock.idx);  
				
				currentBlock.position = {
					left: nearestBlockExt.block.position.left,
					top: nearestBlockExt.block.position.top,
				};
			}
			$(this).animate(currentBlock.position, animateTime, function() {
				
			});
			
			currentBlock.el.css({
				'z-index': 'auto'
			});
			nearestBlockExt.block.el.css({
				'border': '2px white solid'
			});
		},
		pointerUp: function() {
			$(this).focus(); // 兼容ie8的处理
		}
	});
};


ImageDrag.getInstance = function() {
	var instance;
	return function() {
		if(instance == undefined) {
			instance = new ImageDrag();
			return instance;
		}
	};
}();

ImageDrag.prototype = {
	contructor: ImageDrag,
	initPanel: function() {
		console.log('initPanel');
		
		
	},
	addBlock: function() {
		var block = new Block();
		
		var blockEl = $('<div class="draggable">0</div>')
		
		block.el = blockEl;
		$(blockEl).data('block', block);
		
		block.position = this.getNewPosition();
		
		block.idx = i;
		$(blockEl).attr('idx', i);
		
		me.blocks.push(block);
		
		$(blockEl).css(block.position);	// 兼容ie8
	},
	getNewPosition: function() {
		var list = this.getOrderList();
		var lastBlock = list[list.length - 1];
		return listBlock
	},
	getOrderList: function() {
		return this.blocks.sort(function(a, b) {
			return a.idx - b.idx;
		});
	},
	getBlockByIndex: function(idx) {
		for(var i = 0, len = this.blocks.length; i < len; i ++) {
			if(this.blocks[i].idx == idx) {
				return this.blocks[i];
			}
		}
	},

	getNearestBlock : function(block) {
		var me = this;
		var currentPosition = block.currentPosition();
		
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
			};
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
};


var m = ImageDrag.getInstance();