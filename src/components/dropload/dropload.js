import './dropload.scss';

import Util from '../utils/util';

const Dropload = ($ => {

    const NAME = 'dropload';
    const DATA_KEY = 'xe.dropload';
    const EVENT_KEY = `.${DATA_KEY}`;
    const JQUERY_NO_CONFLICT = $.fn[NAME];

    const Selector = {};

    const Event = {};

    const ClassName = {};

    const Default = {
        scrollAreas: [window],
        num: 0,
        up: {
            dom: {                                                            // 上方DOM
                class: 'dropload-up',
                refresh: '<div class="dropload-refresh">↓下拉刷新</div>',
                update: '<div class="dropload-update">↑释放更新</div>',
                load: '<div class="dropload-load"><span class="loading"></span>加载中...</div>',
                noData: '<div class="dropload-noData">暂无数据</div>'
            },
            distance: 50,                                                       // 拉动距离
            callback: '',                                                       // 上方function
        },
        down: {
            dom: {                                                          // 下方DOM
                class: 'dropload-down',
                refresh: '<div class="dropload-refresh">↑上拉加载更多</div>',
                load: '<div class="dropload-load"><span class="loading"></span>加载中...</div>',
                noData: '<div class="dropload-noData">暂无数据</div>'
            },
            distance: 50,                                                       // 拉动距离
            threshold: '',                                                      // 提前加载距离
            callback: ''                                                      // 下方function
        },
    };

    class Dropload {
        constructor(element, config) {
            this._element = element;
            this._config = this._getConfig(config);

            // 上方是否插入DOM
            this._upInsertDOM = false;
            // loading状态
            this._isLoading = false;

            this._newNum = this._config.num;
            // 是否锁定
            this._isLockUp = false;
            this._isLockDown = false;

            // 如果加载下方，事先在下方插入DOM
            if (this._config.down.callback != '') {
                this._downEnable = true;
                $(this._element).append(`<div class="${this._config.down.dom.class}">${this._config.down.dom.refresh}</div>`);
                this._domDown = $('.' + this._config.down.dom.class);
            } else {
                this._downEnable = false;
            }
            if (this._config.up.callback != '') {
                this._upEnable = true;
            } else {
                this._upEnable = false;
            }

            // 计算提前加载距离
            if (!!this._domDown && this._config.threshold === '') {
                // 默认滑到加载区2/3处时加载
                this._threshold = Math.floor(this._domDown.height() * 1 / 3);
            } else {
                this._threshold = this._config.threshold;
            }

            // 判断滚动区域
            this._scrollAreas = [...this._config.scrollAreas];
            if (!this._scrollAreas.indexOf(window)) {
                this._scrollAreas.push(window);
            }

            this._autoLoad();

            this._addEventListeners();
        }

        static get Default() {
            return Default
        }

        // public

        loadDown() {
            this._direction = 'up';
            this._domDown.html(this._config.down.dom.load);
            this._isLoading = true;
            this._config.down.callback(this);
        }

        lock(direction) {
            // 如果不指定方向
            if (direction === undefined) {
                // 如果操作方向向上
                if (this._direction == 'up') {
                    this._isLockDown = true;
                    // 如果操作方向向下
                } else if (this._direction == 'down') {
                    this._isLockUp = true;
                } else {
                    this._isLockUp = true;
                    this._isLockDown = true;
                }
                // 如果指定锁上方
            } else if (direction == 'up') {
                this._isLockUp = true;
                // 如果指定锁下方
            } else if (direction == 'down') {
                this._isLockDown = true;
                // 为了解决DEMO5中tab效果bug，因为滑动到下面，再滑上去点tab，direction=down，所以有bug
                // this._direction = 'up';
            }
        }

        unlock(direction) {
            // 如果不指定方向
            if (direction === undefined) {
                // 如果操作方向向上
                if (this._direction == 'up') {
                    this._isLockDown = false;
                    // 如果操作方向向下
                } else if (this._direction == 'down') {
                    this._isLockUp = false;
                } else {
                    this._isLockUp = false;
                    this._isLockDown = false;
                }
                // 如果指定锁上方
            } else if (direction == 'up') {
                this._isLockUp = false;
                // 如果指定锁下方
            } else if (direction == 'down') {
                this._isLockDown = false;
            }
            // 为了解决DEMO5中tab效果bug，因为滑动到下面，再滑上去点tab，direction=down，所以有bug
            // this._direction = 'up';
        }


        endByNum(num) {
            let dorpload = this;
            this._oldNum = this._newNum;
            this._newNum = num;
            if (this._direction == 'down' && this._upInsertDOM) {
                this._domUp.css({ 'height': '0' }).on('webkitTransitionEnd mozTransitionEnd transitionend', function () {
                    dorpload._isLoading = false;
                    dorpload._upInsertDOM = false;
                    $(this).remove();

                    dorpload._autoLoad();
                });
            } else if (this._direction == 'up') {
                if (this._newNum == 0 || this._newNum == this._oldNum) {   // 数据为空 || 没有新数据
                    this._domDown.html(this._config.down.dom.noData);
                } else {    // 有新的数据
                    // 加载区修改样式
                    this._domDown.html(this._config.down.dom.refresh);
                    this._autoLoad();
                }
                this._isLoading = false;
            }

        }


        /**
         * Private
         */

        _getConfig(config) {
            config = $.extend(true, {}, this.constructor.Default, $(this._element).data(), config);
            return config
        }

        _isInRange() {
            //TODO: 增加_threshold的判断
            return Util.isInViewport(this._domDown);
        }

        _addEventListeners() {
            let dropload = this;
            // 窗口调整
            $(window).on('resize', function () {
                clearTimeout(dropload._timer);
                dropload._timer = setTimeout(function () {
                    if (!dropload._isLoading) {
                        dropload._autoLoad();
                    }
                }, 150);
            });

            // 绑定触摸
            this._element.on('touchstart', function (e) {
                if (!dropload._isLoading) {
                    dropload._touches(e);
                    dropload._touchStart(e);
                }
            });
            this._element.on('touchmove', function (e) {
                if (!dropload._isLoading) {
                    dropload._touches(e);
                    dropload._touchMove(e);
                }
            });
            this._element.on('touchend', function (e) {
                if (!dropload._isLoading) {
                    dropload._touches(e);
                    dropload._touchEnd(e);
                }
            });

            // 加载下方
            this._scrollAreas.forEach((element) => {
                $(element).on('scroll', function () {
                    if (!dropload._isLoading) {
                        dropload._autoLoad();
                    }
                });
            });

        }

        _autoLoad() {
            if (this._downEnable && !this._isLockDown) {
                if (this._oldNum != this._newNum) {
                    if (this._isInRange()) {
                        this.loadDown();
                    }
                }

            }
        }

        _touches(e) {
            if (!e.touches) {
                e.touches = e.originalEvent.touches;
            }
        }

        _touchStart(e) {
            console.log(this);
            this._startY = e.touches[0].pageY;
            // 记住触摸时的scrolltop值
            this._touchScrollTop = $(this._scrollAreas[0]).scrollTop();
        }

        _touchMove(e) {
            this._curY = e.touches[0].pageY;
            this._moveY = this._curY - this._startY;

            if (this._moveY > 0) {
                this._direction = 'down';
            } else if (this._moveY < 0) {
                this._direction = 'up';
            }

            var _absMoveY = Math.abs(this._moveY);

            // 加载上方
            if (this._upEnable && this._touchScrollTop <= 0 && this._direction == 'down' && !this._isLockUp) {
                e.preventDefault();

                this._domUp = $('.' + this._config.up.dom.class);
                // 如果加载区没有DOM
                if (!this._upInsertDOM) {
                    this._element.prepend('<div class="' + this._config.up.dom.class + '"></div>');
                    this._upInsertDOM = true;
                }

                Util.transition(this._domUp, 0);

                // 下拉
                if (_absMoveY <= this._config.up.distance) {
                    this._offsetY = _absMoveY;
                    // todo：move时会不断清空、增加dom，有可能影响性能，下同
                    this._domUp.html(this._config.up.dom.refresh);
                    // 指定距离 < 下拉距离 < 指定距离*2
                } else if (_absMoveY > this._config.up.distance && _absMoveY <= this._config.up.distance * 2) {
                    this._offsetY = this._config.up.distance + (_absMoveY - this._config.up.distance) * 0.5;
                    this._domUp.html(this._config.up.dom.update);
                    // 下拉距离 > 指定距离*2
                } else {
                    this._offsetY = this._config.up.distance + this._config.up.distance * 0.5 + (_absMoveY - this._config.up.distance * 2) * 0.2;
                }

                this._domUp.css({ 'height': this._offsetY });
            }

        }

        _touchEnd(e) {
            var _absMoveY = Math.abs(this._moveY);
            if (this._upEnable && this._touchScrollTop <= 0 && this._direction == 'down' && !this._isLockUp) {
                Util.transition(this._domUp, 300);

                if (_absMoveY > this._config.up.distance) {
                    this._domUp.css({ 'height': this._domUp.children().height() });
                    this._domUp.html(this._config.up.dom.load);
                    this._isLoading = true;
                    this._config.up.callback(this);
                } else {
                    let dropload = this;
                    this._domUp.css({ 'height': '0' }).on('webkitTransitionEnd mozTransitionEnd transitionend', function () {
                        dropload._upInsertDOM = false;
                        $(this).remove();
                    });
                }
                this._moveY = 0;
            }
        }


        /**
         * Static
         */

        static _jQueryInterface(config) {
            return this.each(function () {
                let data = $(this).data(DATA_KEY);
                const _config = typeof config === 'object' ? config : null;

                if (!data) {
                    data = new Dropload($(this), _config);
                    $(this).data(DATA_KEY, data);
                }

                if (typeof config === 'string') {
                    if (typeof data[config] === 'undefined') {
                        throw new TypeError(`No method named "${config}"`);
                    }
                    data[config]();
                }
            })
        }



    }


    /**
      * ------------------------------------------------------------------------
      * jQuery
      * ------------------------------------------------------------------------
      */
    $.fn[NAME] = Dropload._jQueryInterface;
    $.fn[NAME].Constructor = Dropload;
    $.fn[NAME].noConflict = function () {
        $.fn[NAME] = JQUERY_NO_CONFLICT;
        return Dropload._jQueryInterface;
    }

    return Dropload;

})(window.Zepto || window.jQuery);

export default Dropload;
