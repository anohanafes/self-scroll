class Scroll {
    /**
     * 动态创建滚动条
     * @param targetP 目标元素的父元素（需添加滚动条的父元素）
     * @param target 目标元素（内容主体元素）
     * @param nowScrollPos 当前滚动条主体位置
     * @param scrollOption 滚动条配置（宽，底部颜色，主体颜色）
    */
    constructor(targetP, target, scrollOption = {}) {
        // // console.log(targetP);
        // // console.log(target);
        
        this._targetP = targetP;
        this._target = target;
        this.nowScrollPos = 0;
        this.nowDomTrans = 0;
        this.moveCount = 10;

        // // console.log(this);

        this.pNodeW = targetP.getBoundingClientRect().width;
        this.pNodeH = targetP.getBoundingClientRect().height;

        this.newScrollDomEle = null;
        this.newScrollDomCNodeEle = null;

        this.pNodeClientH = targetP.clientHeight;

        this.cNodeW = target.getBoundingClientRect().width;
        this.cNodeH = target.getBoundingClientRect().height;
        this.oldObserveHeightSize = null;
        this.oldObserveHeightSizeP = null;

        this.nowObserveHeightSize = null;
        this.nowObserveHeightSizeP = null;

        this.resultBlean = false;// 当前鼠标停留的元素是否为需要监听 出现滚动条的元素 的子孙元素

        let cNodeStyle = {};
        let pNodeStyle = {};

        // 根据传入的 scrollOption 初始化滚动条主体元素 / 滚动条背景元素样式组

        for(let item in scrollOption){
            let thisItem = item.split("_");
            if(thisItem[0] == 'p'){
                pNodeStyle[thisItem[1]] = scrollOption[item];
            }
            else if(thisItem[0] == 'c'){
                cNodeStyle[thisItem[1]] = scrollOption[item];
            }
        }

        this.cNodeStyle = cNodeStyle;// 当前 Class 类中滚动条主体元素样式组
        this.pNodeStyle = pNodeStyle;// 当前 Class 类中滚动条背景元素样式组

        this.pNodeStyle['opacity'] = 0;

        // 因为 es6 的 Class 中的方法里面的 this 指向为该方法运行时所在的环境，需要用过 bind 重新绑定 this，使其全部指向为当前 Class 类
        this.createScroll = this.createScroll.bind(this);
        this.observeScrollDiv = this.observeScrollDiv.bind(this);
        this.wheel = this.wheel.bind(this);
        this.setScrollAndDomPos = this.setScrollAndDomPos.bind(this);
        this.complateDomSize = this.complateDomSize.bind(this);
        this.init = this.init.bind(this);
        this.stopScroll = this.stopScroll.bind(this);
        this.stopGlobalScrollFn = this.stopGlobalScrollFn.bind(this);
        this.resumeGlobalScrollFn = this.resumeGlobalScrollFn.bind(this);
    }
    /***
     * 内容位移函数
    */
    contentMoveFn(moveVal, moveKey) {
        let _this = this;
        // debugger;
        let thisMainDom = _this._target;
        let thisMainBgDom = _this._targetP;
                
        // 1.获取要移动的主体内容
        let contentEle = this._target;
        // 2.根据鼠标移动距离推算出主体内容的移动距离
        // 内容总行程（子元素高度 - 父元素高度）
        // let contentTotalMoveVal = _this.cNodeH - _this.pNodeH;
        let contentTotalMoveVal = thisMainDom.offsetHeight - thisMainBgDom.offsetHeight;
        // 滚动条总行程(滚动条背景元素高度 - 滚动条主体元素高度)
        let scrollTotalMoveVal = _this.newScrollDomEle.getBoundingClientRect().height - _this.newScrollDomCNodeEle.getBoundingClientRect().height;
        // 滚动条当前的位置 ÷ 滚动条总行程 = 主体内容当前位置 ÷ 内容总行程

        _this.nowDomTrans = (_this.nowScrollPos / scrollTotalMoveVal) * contentTotalMoveVal;

        contentEle.style.transform = `translateY(-${_this.nowDomTrans}px)`;
    }
    /*
     * 创建自定义滚动条
    */
    createScroll(){
        //  //  // // console.log('created!')
        let _this = this;
        // 创建虚拟节点对象（文档碎片节点）
        const fragment = document.createDocumentFragment();
        // 创建滚动条背景元素（高为目标元素的父元素的高度）
        let newScrollDom = document.createElement("div");

        newScrollDom.style.height = this.pNodeClientH + "px";
        newScrollDom.style.position = "absolute";
        newScrollDom.style.right = 0;
        newScrollDom.style.top = 0;

        // 创建滚动条主体元素（高为目标元素 / 目标元素父元素 的比例）
        let newScrollDomCNode = document.createElement("div");

        // 根据初始化的滚动条主体元素 / 滚动条背景元素样式组 为 滚动条主体元素 / 滚动条背景元素设置样式......

        for(let cStyleItem in _this.cNodeStyle){
            newScrollDomCNode.style[cStyleItem] = _this.cNodeStyle[cStyleItem];
        }

        for(let pStyleItem in _this.pNodeStyle){
            newScrollDom.style[pStyleItem] = _this.pNodeStyle[pStyleItem];
        }

        newScrollDomCNode.style.height = (this.pNodeH / this.cNodeH).toFixed(3) * 100 + "%";
        newScrollDomCNode.classList.add('scrollC');
        newScrollDom.classList.add('scrollP');

        newScrollDomCNode.ondragstart = function (e) {// 禁止元素拖动，否则会出现拖拽效果和鼠标禁止样式
            return false;
        }

        newScrollDomCNode.onmousedown = function (eDown) {
            // 记录按下时的鼠标位置
            // let x_d = eDown.x;
            let y_d = eDown.y;
            document.onmousemove = function (eMove) {
                let thisMainDom = _this._target;
                let thisMainBgDom = _this._targetP;
                // 获取滚动条主体元素相对于视窗的位置集合
                let scrollCNode = newScrollDomCNode.getBoundingClientRect();
                // 获取滚动条背景元素相对于视窗的位置集合
                let scrollPNode = newScrollDom.getBoundingClientRect();
                
                
                // 获取滚动条背景元素内容高度（不含 padding 和 border
                let pNodeClientHeight = newScrollDom.clientHeight;

                // 记录按下后鼠标移动的鼠标位置
                let y_m = eMove.y;

                _this.nowScrollPos = _this.nowScrollPos + (y_m - y_d);// 位移值 = 上次的位移值 + 每次鼠标移动的距离

                // 如果当前位移值 < 0,则判定为触顶,将位移值置为 0
                if (_this.nowScrollPos <= 0) {
                    _this.nowScrollPos = 0;
                    _this.nowDomTrans = 0;
                }

                /** 1.滚动条主体元素距离滚动条背景元素底部距离（当前位移值 + 滚动条主体元素高度） 应该小于 滚动条背景元素内容高度 ，否则判定为触底
                    2.若已触底，则位移值 = 滚动条背景元素高度 - 滚动条主体元素高度 **/

                if (_this.nowScrollPos + scrollCNode.height >= pNodeClientHeight) {
                    _this.nowScrollPos = scrollPNode.height - scrollCNode.height;
                    // _this.nowDomTrans = _this.cNodeH - _this.pNodeH;
                    _this.nowDomTrans = thisMainDom.offsetHeight - thisMainBgDom.offsetHeight;

                }

                // 设置当前滚动条位移距离
                newScrollDomCNode.style.transform = `translateY(${_this.nowScrollPos}px)`;
                _this.contentMoveFn(y_m - y_d)// 主体内容位移距离
                // 将上一次鼠标纵向位置置为当前鼠标纵向位置
                y_d = eMove.y;

                // console.log("172 ---》 ", _this.nowDomTrans)
                // console.log("173 ---》 ", _this.nowScrollPos)
            }
        }

        // 当鼠标抬起时，取消监听鼠标按下和鼠标移动事件
        document.onmouseup = function () {
            document.onmousedown = null;
            document.onmousemove = null;
        };

        _this.newScrollDomEle = newScrollDom;
        _this.newScrollDomCNodeEle = newScrollDomCNode;


        newScrollDom.appendChild(newScrollDomCNode);
        fragment.appendChild(newScrollDom);

        return fragment;
    }
    checkIsAddScroll() {
        let pNodeH = this._targetP.getBoundingClientRect().height;
        let cNodeH = this._target.getBoundingClientRect().height;

        // 如果 目标元素高度 > 父元素的高度，添加滚动条
        return cNodeH > pNodeH;
    }
    findScrollPNode(pDomList,ruleFind){
        let resultDom = [];
        // debugger;
        for(let item of pDomList){
            if(ruleFind(item)){
                resultDom.push(item)
            }
        }

        return resultDom;
    }
    /*
     * 监听元素尺寸变化 
    */
    observeScrollDiv(resDom,oldSizeKey) {
        let _this = this;

        // 创建 Observe 监听器
        let _observe = new ResizeObserver(entries => {
            // 当前真实高度（包含边框和内边距）
            let realOffsetHeight = 0;
                realOffsetHeight = entries[0].target.offsetHeight;

            // 因为目前同时监听了需滚动元素和其外层元素,根据传入的值分别设置当前变化后元素的高度
            if(oldSizeKey == 'oldObserveHeightSizeP'){
                _this.nowObserveHeightSizeP = realOffsetHeight;
            }
            else if(oldSizeKey == 'oldObserveHeightSize'){
                _this.nowObserveHeightSize = realOffsetHeight;
            }

            // 如果当前已置顶（主体元素位置和滚动条主体元素位置为 0，则判定已置顶），则只需要改变滚动条的尺寸，不需要改变滚动条目前位置
            let isChangePos = _this.nowDomTrans == 0 && _this.nowScrollPos == 0;

            _this.complateDomSize({isNotChangePos:isChangePos});
            
            // 是否需出现滚动条
            let canCreateScroll = _this.checkIsAddScroll();

            // 查找当前类中的滚动条背景元素
            let isRightDomList = _this.findScrollPNode(_this._targetP.children,(res) => {return res.classList.contains('scrollP')});

            if(!canCreateScroll && isRightDomList.length == 0){
                return;
            }

            // 如果当前不需要出现滚动条且当前有滚动条时，则置顶，且移除当前滚动条元素，取消监听滚动事件
            if(!canCreateScroll && isRightDomList.length != 0){
                // //  //  // // console.log('348 ---> ','置顶！')
                _this.nowDomTrans = 0;
                _this.nowScrollPos = 0;

                _this.setScrollAndDomPos();

                for(let items of isRightDomList){
                    items.remove();
                }

                window.removeEventListener('DOMMouseScroll',_this.wheel);
                _this._targetP.onmouseenter = null;
                // document.onmousewheel = null;
                document.onwheel = null;

                return;
            }
            // 否则如果当前需要出现滚动条且当前无滚动条，添加滚动条，并监听鼠标滚动事件
            else if(canCreateScroll && isRightDomList.length == 0){
                _this.nowDomTrans = 0;
                _this.nowScrollPos = 0;

                _this.setScrollAndDomPos();
                _this._targetP.style.overflowY = 'hidden';
                _this._targetP.style.position = 'relative';
                _this._targetP.appendChild(_this.createScroll());

                // 添加滚轮滚动事件...
                if (window.addEventListener)
                    // window.addEventListener('DOMMouseScroll', _this.wheel, false);// 监听页面滚动事件（火狐）
                    window.addEventListener('DOMMouseScroll', _this.wheel);// 监听页面滚动事件（火狐）
                    // document.onmousewheel = _this.wheel;// 监听页面滚动事件（IE）
                    // document.onwheel = _this.wheel;// 监听页面滚动事件（IE）

                    // 因为 document.onwheel 事件只能被绑定一次且在回调的时候触发，如果多次绑定只会以最后一次绑定的事件为准，所以要通过鼠标移入某个需要出滚动条的区域动态绑定
                    // document.onmousewheel = _this.wheel;// 监听页面滚动事件（IE）
                    
                    _this._targetP.onmouseenter = function(){
                        // 阻止浏览器滚动条滚动行为
                        _this.stopGlobalScrollFn();

                        _this.pNodeStyle['opacity'] = 1;
                        _this.newScrollDomEle.style['opacity'] = 1;
    
                        _this.pNodeStyle['transition'] = '200ms linear';
                        _this.newScrollDomEle.style['transition'] = '200ms linear';

                        document.onwheel = function(event){
                            _this.wheel(event,_this._targetP);// 监听页面滚动事件（IE）
                        }
                    }

                    _this._targetP.onmouseleave = function(){
                        _this.pNodeStyle['opacity'] = 0;
                        _this.newScrollDomEle.style['opacity'] = 0;
                        
                        // 恢复浏览器滚动条滚动行为
                        _this.resumeGlobalScrollFn();
                    }

                    // _this.stopScroll();
            }

            // // // console.log('409',"12345678910")
            _this[oldSizeKey] = realOffsetHeight;
            return;
        })

        _observe.observe(resDom);
    }
    stopWheel(e){
        e.preventDefault();
    }
    stopGlobalScrollFn(){
        let _this = this;
        window.addEventListener('wheel',_this.stopWheel,{passive:false});
    }
    resumeGlobalScrollFn(){
        let _this = this;
        window.removeEventListener('wheel',_this.stopWheel);
    }
    stopScroll(){
        // 禁止最外层滚动条滚动
        this._targetP.onmousewheel = function scrollWheel(e) {
            var sl;
            e = e || window.event;
            if (navigator.userAgent.toLowerCase().indexOf('msie') >= 0) {
                event.returnValue = false;
            } else {
                e.preventDefault();
            };
        };

        if (navigator.userAgent.toLowerCase().indexOf('firefox') >= 0) {
            //firefox支持onmousewheel
            this._targetP.addEventListener('DOMMouseScroll',
                function(e) {
                    var obj = e.target;
                    var onmousewheel;
                    while (obj) {
                        onmousewheel = obj.getAttribute('onmousewheel') || obj.onmousewheel;
                        if (onmousewheel) break;
                        if (obj.tagName == 'BODY') break;
                        obj = obj.parentNode;
                    };
                    if (onmousewheel) {
                        if (e.preventDefault) e.preventDefault();
                            e.returnValue = false; //禁止页面滚动
                            if (typeof obj.onmousewheel != 'function') {
                            //将onmousewheel转换成function
                            eval('window._tmpFun = function(event){' + onmousewheel + '}');
                            obj.onmousewheel = window._tmpFun;
                            window._tmpFun = null;
                        };
                        // 不直接执行是因为若onmousewheel(e)运行时间较长的话，会导致锁定滚动失效，使用setTimeout可避免
                        setTimeout(function() {
                            obj.onmousewheel(e);
                        },1);
                    };
                },
            false);
        };
    }
    complateScrollMove(){
        let _this = this;
        let thisMainDom = _this._target;
        let thisMainBgDom = _this._targetP;
        let thisScrollDom = _this.newScrollDomCNodeEle;
        let thisScrollBgDom = _this.newScrollDomEle;

        // 滚动条位移距离 = （主体内容单次位移距离 / 主体内容可滚动的距离）* 滚动条可滚动的最大距离
        // 主体DOM可位移的总行程
        let mainDomTransVal = thisMainDom.offsetHeight - thisMainBgDom.offsetHeight;
        // 滚动条的可位移的总行程
        let scrollDomTransVal = thisScrollBgDom.offsetHeight - thisScrollDom.offsetHeight;
        // 滚动条位移距离
        let scrollMoveCount = (_this.moveCount / mainDomTransVal) * scrollDomTransVal;

        return scrollMoveCount;
    }
    /**
     * 计算当前需滚动的主体内容位置及滚动条当前位置
    */
    complateDomSize(option){
        // debugger;
        let _this = this;
        let {isNotChangePos} = option;

        let thisMainDom = this._target;// 当前需滚动元素
        let thisMainBgDom = this._targetP;// 当前需滚动元素的外层元素
        let thisScrollDom = this.newScrollDomCNodeEle;// 滚动条主体元素
        let thisScrollBgDom = this.newScrollDomEle;// 滚动条背景元素

        if(thisScrollDom != null){// 如果当前有滚动条时
            // 修改当前滚动条高度
            thisScrollDom.style.height = (thisMainBgDom.offsetHeight / thisMainDom.offsetHeight).toFixed(3) * 100 + "%";
            // 修改滚动条背景高度
            thisScrollBgDom.style.height = thisMainBgDom.offsetHeight + "px";
        }

        if(isNotChangePos){
            return;
        }

        /**
         * 主体DOM位置 = 当前主体DOM位置 + DOM变化的位差(因为目前同时监听了需滚动元素和其外层元素，所以如果两个都变化的话，以需滚动元素变化值为准)
         * 滚动条主体DOM位置 = (主体DOM位置 / 主体DOM可位移的总行程) * 滚动条的可位移的总行程
        */

        let diffPNode = _this.nowObserveHeightSizeP - _this.oldObserveHeightSizeP;
        let diffCNode = _this.nowObserveHeightSize - _this.oldObserveHeightSize;
        let formatDiff = diffPNode == 0?diffCNode:diffPNode; // 因为目前同时监听了需滚动元素和其外层元素，所以如果两个都变化的话，以需滚动元素变化值为准

        if(diffCNode !== 0 && diffPNode !== 0){
            formatDiff = diffCNode;
        }
       
        // 主体DOM位置
        _this.nowDomTrans = _this.nowDomTrans + formatDiff;
       
        // 主体DOM可位移的总行程
        let mainDomTransVal = thisMainDom.offsetHeight - thisMainBgDom.offsetHeight;
        // 滚动条的可位移的总行程
        let scrollDomTransVal = thisScrollBgDom.offsetHeight - thisScrollDom.offsetHeight;
        // 滚动条主体DOM位置
        _this.nowScrollPos = (_this.nowDomTrans / mainDomTransVal) * scrollDomTransVal;

        // 如果当前位移值 < 0,则判定为触顶,将位移值置为 0
        if (_this.nowScrollPos <= 0) {
            _this.nowScrollPos = 0;
            _this.nowDomTrans = 0;
        }

        /** 1.滚动条主体元素距离滚动条背景元素底部距离（当前位移值 + 滚动条主体元素高度） 应该小于 滚动条背景元素内容高度 ，否则判定为触底
            2.若已触底，则位移值 = 滚动条背景元素高度 - 滚动条主体元素高度 **/

        if (_this.nowScrollPos + thisScrollDom.offsetHeight >= thisScrollBgDom.offsetHeight){
            _this.nowScrollPos = thisScrollBgDom.offsetHeight - thisScrollDom.offsetHeight;
            _this.nowDomTrans = thisMainDom.offsetHeight - thisMainBgDom.offsetHeight;
        }

        thisMainDom.style.transform = `translateY(-${_this.nowDomTrans}px)`;
        thisScrollDom.style.transform = `translateY(${_this.nowScrollPos}px)`;
    }
    /**
     * 滚轮滚动事件
    */
    wheel(event,resTargetP) {
        let _this = this;

        // // // console.log(event.target);
        // // console.log(resTargetP);
        

        // 查找指定元素的父元素是否为当前需出现滚动条的元素
        this.findOrderPNode(event.target,_this._targetP);
        

        if(!this.resultBlean){
            return;
        }

        

        /**
         * @param event 事件对象
         * 可以根据 window Event对象中的 wheelDelta(IE、chrome浏览器) / detail(FF浏览器) 可以来判断滚轮向上 / 向下
         */

        let delta;// 根据值来判断目前向上还是向下

        // chorm，IE，360:使用 window.event 中 wheelDelta 属性（负数 为 向下，正数 为 向上）
        // FF:使用 window.event 中 detail 属性（正数 为 向下，负数 为 向上）

        // 根据是否有 window.event.wheelDelta 属性 判断是否为FF浏览器（FF中 无 wheelDelta 属性）
        // 为了所有浏览器的统一，格式化方向属性

        if (window.event.wheelDelta) {
            delta = window.event.wheelDelta < 0 ? 'Down' : 'Up';
        }
        else {
            delta = window.event.detail < 0 ? 'Up' : 'Down';
        }

        this.setMoveCountByDir(delta);
    }
    moveDown() {
        let _this = this;

        let thisMainDom = _this._target;
        let thisMainBgDom = _this._targetP;
        let thisScrollDom = _this.newScrollDomCNodeEle;
        let thisScrollBgDom = _this.newScrollDomEle;

        let scrollPNode = _this.newScrollDomEle.getBoundingClientRect();
        let scrollCNode = _this.newScrollDomCNodeEle.getBoundingClientRect();

        _this.nowDomTrans += _this.moveCount;
        
        let scrollMoveCount = _this.complateScrollMove();// 目前滚轮滚动单次的位移量
        _this.nowScrollPos += scrollMoveCount;
       /** 1.滚动条主体元素距离滚动条背景元素底部距离（当前位移值 + 滚动条主体元素高度） 应该小于 滚动条背景元素内容高度 ，否则判定为触底
            2.若已触底，则位移值 = 滚动条背景元素高度 - 滚动条主体元素高度 **/

        if (_this.nowScrollPos + thisScrollDom.offsetHeight >= thisScrollBgDom.offsetHeight){
            _this.nowScrollPos = thisScrollBgDom.offsetHeight - thisScrollDom.offsetHeight;
            _this.nowDomTrans = thisMainDom.offsetHeight - thisMainBgDom.offsetHeight;
        }

        _this.setScrollAndDomPos();
    }
    moveUp() {
        let _this = this;
        _this.nowDomTrans -= _this.moveCount;
        let scrollMoveCount = _this.complateScrollMove();// 目前滚轮滚动单次的位移量
        _this.nowScrollPos -= scrollMoveCount;

        // 如果当前位移值 < 0,则判定为触顶,将位移值置为 0
        if(_this.nowScrollPos <= 0){
            _this.nowScrollPos = 0;
            _this.nowDomTrans = 0;
        }

        _this.setScrollAndDomPos();
    }
    // 重绘滚动条当前位置及滚动元素当前位置
    setScrollAndDomPos(){
        let _this = this;
        _this._target.style.transform = `translateY(-${_this.nowDomTrans}px)`;
        if(_this.newScrollDomCNodeEle != null){
            _this.newScrollDomCNodeEle.style.transform = `translateY(${_this.nowScrollPos}px)`;
        }
    }
    setMoveCountByDir(dir) {
        // moveUp moveDown
        // // console.log('512 ---> ',this);
        this['move' + dir]();
    }
    /**
         * @param resDom 当前检测元素
         * @param orderDom 需出现滚动条的元素
         * 查找指定元素的父元素是否为当前需出现滚动条的元素
    */
    findOrderPNode(resDom,orderDom){
        // 当前元素无父元素，return...
        if(resDom.parentElement == null){
            this.resultBlean = false;
            return false;
        }

        // 找到
        if(resDom.parentElement == orderDom){
            this.resultBlean = true;
        }
        // 未找到，递归自身查找父元素是否满足......
        else{
            this.findOrderPNode(resDom.parentElement,orderDom);
        }
    }
    init() {
        let _this = this;
        let canCreateScroll = this.checkIsAddScroll();

        if (canCreateScroll) {
            this._targetP.style.overflowY = 'hidden';
            this._targetP.style.position = 'relative';
            this._targetP.appendChild(this.createScroll());

            // 添加滚轮滚动事件...
            if (window.addEventListener)
                // window.addEventListener('DOMMouseScroll', _this.wheel, false);// 监听页面滚动事件（火狐）
                window.addEventListener('DOMMouseScroll', _this.wheel);// 监听页面滚动事件（火狐）
                
                // 因为 document.onwheel 事件只能被绑定一次且在回调的时候触发，如果多次绑定只会以最后一次绑定的事件为准，所以要通过鼠标移入某个需要出滚动条的区域动态绑定
                // document.onmousewheel = _this.wheel;// 监听页面滚动事件（IE）
                
                _this._targetP.onmouseenter = function(){
                    _this.pNodeStyle['opacity'] = 1;
                    _this.newScrollDomEle.style['opacity'] = 1;

                    _this.pNodeStyle['transition'] = '200ms linear';
                    _this.newScrollDomEle.style['transition'] = '200ms linear';

                    document.onwheel = function(event){
                        _this.wheel(event,_this._targetP);// 监听页面滚动事件（IE）
                    }
                }

                _this._targetP.onmouseleave = function(){
                    _this.pNodeStyle['opacity'] = 0;
                    _this.newScrollDomEle.style['opacity'] = 0;
                }

                _this.stopScroll();

                // // 禁止最外层滚动条滚动
                // this._targetP.onmousewheel = function scrollWheel(e) {
                //     var sl;
                //     e = e || window.event;
                //     if (navigator.userAgent.toLowerCase().indexOf('msie') >= 0) {
                //         event.returnValue = false;
                //     } else {
                //         e.preventDefault();
                //     };
                // };

                // if (navigator.userAgent.toLowerCase().indexOf('firefox') >= 0) {
                //     //firefox支持onmousewheel
                //     this._targetP.addEventListener('DOMMouseScroll',
                //         function(e) {
                //             var obj = e.target;
                //             var onmousewheel;
                //             while (obj) {
                //                 onmousewheel = obj.getAttribute('onmousewheel') || obj.onmousewheel;
                //                 if (onmousewheel) break;
                //                 if (obj.tagName == 'BODY') break;
                //                 obj = obj.parentNode;
                //             };
                //             if (onmousewheel) {
                //                 if (e.preventDefault) e.preventDefault();
                //                     e.returnValue = false; //禁止页面滚动
                //                     if (typeof obj.onmousewheel != 'function') {
                //                     //将onmousewheel转换成function
                //                     eval('window._tmpFun = function(event){' + onmousewheel + '}');
                //                     obj.onmousewheel = window._tmpFun;
                //                     window._tmpFun = null;
                //                 };
                //                 // 不直接执行是因为若onmousewheel(e)运行时间较长的话，会导致锁定滚动失效，使用setTimeout可避免
                //                 setTimeout(function() {
                //                     obj.onmousewheel(e);
                //                 },1);
                //             };
                //         },
                //     false);
                // };
        }

        this.oldObserveHeightSize = this._target.offsetHeight;
        this.oldObserveHeightSizeP = this._targetP.offsetHeight;
        
        this.nowObserveHeightSize = this._target.offsetHeight;
        this.nowObserveHeightSizeP = this._targetP.offsetHeight;

        // // // console.log('652 ---',this._target)
        // // // console.log('653 ---',this._targetP)


        // 注册监听元素尺寸变化事件
        this.observeScrollDiv(_this._target,'oldObserveHeightSize');
        this.observeScrollDiv(_this._targetP,'oldObserveHeightSizeP');
    };
}