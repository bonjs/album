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
				left: left + 2
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

var ImageDrag = function(opt) {
	
	opt = opt || {};
	
	var me = this;
	
	this.containerSelector = opt.container;
	this.cols = opt.cols || 4;
	
	this.blocks = [];
	
	var animateTime = 200;
	
	this.initPanel();
	
	$(document).on('access', '.draggable', function() {
		var currentBlock = $(this).data('block');	// 当前block
		var nearestBlockExt = me.getNearestBlock(currentBlock);
		
		var el = nearestBlockExt.block.el;
		el.css({
			'border': '3px red dashed'
		});
		
		nearestBlockExt.block.shake();
	}).on('leave', '.draggable', function() {
		var currentBlock = $(this).data('block');	// 当前block
		var nearestBlockExt = me.getNearestBlock(currentBlock);
		
		var el = nearestBlockExt.block.el;
		el.css({
			'border': '3px white solid'
		});
		
		nearestBlockExt.block.stopShake();
	});
	
	var accessTag = false;
	$(document).on('dragMove', '.draggable', function(e, pointer, moveVector) {
		
		var currentBlock = $(this).data('block');	// 当前block
		var nearestBlockExt = me.getNearestBlock(currentBlock);
		
		currentBlock.el.css({
			'z-index': '2'
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
	}).on('dragEnd', '.draggable', function(e, pointer) {
			
		var currentBlock = $(this).data('block');	// 当前block
		
		var nearestBlockExt = me.getNearestBlock(currentBlock);	// 获取最近的block
		
		nearestBlockExt.block.stopShake();
		
		var el = nearestBlockExt.block.el;
		
		var currentIndex = currentBlock.idx;			// 当前拖动的block的idx
		var nearestIndex = nearestBlockExt.block.idx;	// 最近的block的idx
		
		if(nearestBlockExt.distance < 50) {	
		
			var smallerIndex = currentIndex < nearestIndex ? currentIndex + 1 : nearestIndex;
			var biggerIndex = currentIndex > nearestIndex ? currentIndex - 1 : nearestIndex;
			
			var nearestIdx = nearestBlockExt.block.idx;	// 记录下idx
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
					
					it.el.animate(nextPosition, animateTime, function() {
						it.el.css('z-index', 'auto');
						it.el.attr('idx', nextIndex);
						it.position = nextPosition;
						it.idx = nextIndex;
					});
				}
			});
			
			// 将index更新
			currentBlock.idx = nearestIdx;//nearestBlockExt.block.idx;
			currentBlock.el.attr('idx', currentBlock.idx);  
			
			currentBlock.position = {
				left: nearestBlockExt.block.position.left,
				top: nearestBlockExt.block.position.top
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
	}).on('pointerUp', '.draggable', function() {
		$(this).focus(); // 兼容ie8的处理
	});
};


ImageDrag.prototype = {
	
	contructor: ImageDrag,
	getContainer: function() {
		return $(this.containerSelector);
	},
	initPanel: function() {
		
		var me = this;
		
		var draggable = $('.draggable').draggabilly();
		draggable.css('position', 'absolute');	// 兼容ie8
		
		draggable.each(function(i, blockEl) {
			//blockEl.remove();
			me.addBlock(blockEl);
		});
	},
	getNewPosition: function() {
		
		var totalSize = this.blocks.length;
		var rowsIndex = this.rowsIndex = ~~(totalSize / this.cols);
		var colsIndex = this.colsIndex = totalSize % this.cols;
		
		// block间距
		// 宽度高度
		var margin = 10, width = height = 110;
		
		var left 	= colsIndex * width + (colsIndex * 2 + 1) * margin;
		var top 	= rowsIndex * height + (rowsIndex * 2 + 1) * margin;
		
		this.containerHeight = top + margin + height;
		return {
			left: left,
			top: top
		};
	},
	addBlock: function(html, movable, index) {	// movable 为true时, 添加的block不可拖动
	
		var me = this;
		
		this.blocks = this.getOrderList();	// 排序
		
		movable = movable !== false ? true : false; 
		
		var blockEl = $(html).addClass('draggable');
		
		movable || blockEl.addClass('drag-disabled');
		
		this.getContainer().append(blockEl);
		
		blockEl.draggabilly();
		
		if(blockEl.hasClass('drag-disabled')) {
			blockEl.draggabilly('disable'); //destroy
		}
		
		var block = new Block();
		
		block.el = blockEl;
		
		if(index === undefined) {	// 如果没有设置index, 则在最后
			block.idx = me.blocks.length;
			block.position = me.getNewPosition();
		} else {
			block.idx = index;
			block.position = {				// 如果设置了index, 则取index处的坐标, 
				left: me.blocks[index].position.left,
				top: me.blocks[index].position.top
			};
			
			// 原位置处及后面的后移
			for(var i = index; i < me.blocks.length; i ++) {
				var b = me.blocks[i];
				b.idx = b.idx + 1;
				
				if(i == me.blocks.length - 1) { // 最后一个
					b.position = me.getNewPosition();	
				} else {
					var next = me.blocks[i + 1];
					b.position = {
						left: next.position.left,
						top: next.position.top
					}
				}
				b.el.animate(b.position, 150, function() {});
			}
		}
		
		blockEl.css(block.position);
		blockEl.data('block', block);
		blockEl.attr('idx', block.idx);
		
		this.blocks.push(block);
		this.getContainer().height(this.containerHeight);
	},
	removeBlock: function(idx) {
		/*
			1, 从blocks数组中删除idx为idx的block
			2, 将后面的block的position更新为下一个的position
			3, 删除dom
		*/
		this.blocks = this.getOrderList();	// 重新按idx排序
		
		for(var i = this.blocks.length - 1; i >= 0; i --) {
			var b = this.blocks[i];
			if(b.idx > idx) {
				var prev = this.blocks[i - 1];
				b.idx = b.idx - 1;
				b.el.attr('idx', b.idx);
				b.position = {
					left: prev.position.left,
					top: prev.position.top,
				}
				
				b.el.animate(b.position, 150, function() {});
			}
		}
		
		var deleteIndex;
		for(var i = 0; i < this.blocks.length; i ++) {
			if(this.blocks[i].idx == idx) {
				deleteIndex = i;
				break;
			}
		}
		
		if(deleteIndex !== undefined) {
			this.blocks[deleteIndex].el.remove();	// 删除dom
			this.blocks.splice(deleteIndex, 1);	// 在blocks中删除
		}
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
			
			if(!it.el.hasClass('drag-disabled')) {	// 如果有drag-disabled样式, 则不考虑
				return {
					index: index,
					distance: distance,
					block: me.blocks[index]
				};
			} else {
				return o;
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
};
