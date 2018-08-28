import './modal.scss';

import Modal from './modal.js';
import Util from '../utils/util';

const Modals = (($) => {

    /**
     * ------------------------------------------------------------------------
     * Constants
     * ------------------------------------------------------------------------
     */

    const NAME = 'modals';
    const DATA_KEY = 'xe.modals';
    const EVENT_KEY = `.${DATA_KEY}`;
    const DATA_API_KEY = '.data-api';
    const JQUERY_NO_CONFLICT = $.fn[NAME];
    // const ESCAPE_KEYCODE = 27 // KeyboardEvent.which value for Escape (Esc) key

    const Config = {
        backdrop: true,
        // keyboard: true,
        focus: true,
        mode: 'normal',
    };

    const Event = {
        HIDE: `hide${EVENT_KEY}`,
        HIDDEN: `hidden${EVENT_KEY}`,
        SHOW: `show${EVENT_KEY}`,
        SHOWN: `shown${EVENT_KEY}`,
        FOCUSIN: `focusin${EVENT_KEY}`,
        RESIZE: `resize${EVENT_KEY}`,
        CLICK_DISMISS: `click.dismiss${EVENT_KEY}`,
        KEYDOWN_DISMISS: `keydown.dismiss${EVENT_KEY}`,
        MOUSEUP_DISMISS: `mouseup.dismiss${EVENT_KEY}`,
        MOUSEDOWN_DISMISS: `mousedown.dismiss${EVENT_KEY}`,
        CLICK_DATA_API: `click${EVENT_KEY}${DATA_API_KEY}`
    };

    const ClassName = {
        SCROLLBAR_MEASURER: 'modal-scrollbar-measure',
        BACKDROP: 'modal-backdrop',
        OPEN: 'modal-open',
        FADE: 'fade',
        SHOW: 'show'
    };

    const Selector = {
        DIALOG: '.modal-dialog',
        DATA_TOGGLE: '[data-toggle="modal"]',
        DATA_DISMISS: '[data-dismiss="modal"]',
        FIXED_CONTENT: '.fixed-top, .fixed-bottom, .is-fixed, .sticky-top',
        STICKY_CONTENT: '.sticky-top',
        NAVBAR_TOGGLER: '.navbar-toggler'
    };

    var instance = null;

    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */
    class Modals {
        constructor() {
            this._config = Config;
            this._backdrop = null;
            this._isShown = false;
            this._isBodyOverflowing = false;
            this._ignoreBackdropClick = false;
            this._scrollbarWidth = 0;
            this._modalStack = [];
        }

        static Config() {
            return Config;
        }

        // Public

        toggle(relatedTarget) {
            return this._isShown ? this.hide() : this.show(relatedTarget)
        }

        show(modal, relatedTarget) {

            if (this._isEmpty()) {
                // show modal
                this._push(modal);
                // backdrop
                this._checkScrollbar();
                this._setScrollbar();

                $(document.body).addClass(ClassName.OPEN);

                this._showBackdrop(() => modal.show(relatedTarget));

            } else {
                // hide pre modal dialog
                var preModal = this._current();
                preModal.hide();
                this._pop();

                // show current modal dialog
                this._push(modal);
                modal.show(relatedTarget);
            }
        }

        hide(event) {
            if (event) {
                event.preventDefault();
            }

            const modal = this._current();

            if (this._isEmpty()) {
                return;
            } else if (this._modalStack.length == 1) {
                // hide modal

                $(document).off(Event.FOCUSIN);

                modal.hide((event) => {
                    this._pop();
                    this._hideModal()
                });
            } else {
                modal.hide((event) => {
                    this._pop();
                });
            }
        }

        dispose() {
            $(window, document, this._backdrop).off(EVENT_KEY);

            this._config = null;
            this._backdrop = null;
            this._isBodyOverflowing = null;
            this._ignoreBackdropClick = null;
            this._scrollbarWidth = null;

            instance = null;
        }

        handleUpdate() {
            this._adjustDialog();
        }

        // Private

        _hideModal(event) {

            this._hideBackdrop(() => {
                $(document.body).removeClass(ClassName.OPEN);
                this._resetScrollbar();
            });
        }

        _removeBackdrop() {
            if (this._backdrop) {
                $(this._backdrop).remove();
                this._backdrop = null;
            }
        }

        _showBackdrop(callback) {

            if (this._config.backdrop) {
                this._backdrop = document.createElement('div');
                this._backdrop.className = ClassName.BACKDROP;

                $(this._backdrop).addClass(ClassName.FADE);

                $(this._backdrop).appendTo(document.body);

                $(this._backdrop).addClass(ClassName.SHOW)

                if (!callback) {
                    return;
                }

                const backdropTransitionDuration = Util.getTransitionDurationFromElement(this._backdrop);

                $(this._backdrop).one(Util.TRANSITION_END, callback).emulateTransitionEnd(backdropTransitionDuration);

            } else if (callback) {
                callback();
            }
        }

        _hideBackdrop(callback) {
            if (this._backdrop) {
                $(this._backdrop).removeClass(ClassName.SHOW);

                const callbackRemove = () => {
                    this._removeBackdrop();
                    if (callback) {
                        callback();
                    }
                }

                const backdropTransitionDuration = Util.getTransitionDurationFromElement(this._backdrop)

                $(this._backdrop).one(Util.TRANSITION_END, callbackRemove).emulateTransitionEnd(backdropTransitionDuration);
            } else if (callback) {
                callback();
            }

        }

        // ----------------------------------------------------------------------
        // the following methods are used to handle overflowing modals
        // todo (fat): these should probably be refactored out of modal.js
        // ----------------------------------------------------------------------

        _checkScrollbar() {
            const rect = document.body.getBoundingClientRect();
            this._isBodyOverflowing = rect.left + rect.right < window.innerWidth;
            this._scrollbarWidth = this._getScrollbarWidth();
        }

        _setScrollbar() {
            if (this._isBodyOverflowing) {
                // Note: DOMNode.style.paddingRight returns the actual value or '' if not set
                //   while $(DOMNode).css('padding-right') returns the calculated value or 0 if not set

                // Adjust fixed content padding
                $(Selector.FIXED_CONTENT).each((index, element) => {
                    const actualPadding = $(element)[0].style.paddingRight
                    const calculatedPadding = $(element).css('padding-right')
                    $(element).data('padding-right', actualPadding).css('padding-right', `${parseFloat(calculatedPadding) + this._scrollbarWidth}px`)
                })

                // Adjust sticky content margin
                $(Selector.STICKY_CONTENT).each((index, element) => {
                    const actualMargin = $(element)[0].style.marginRight
                    const calculatedMargin = $(element).css('margin-right')
                    $(element).data('margin-right', actualMargin).css('margin-right', `${parseFloat(calculatedMargin) - this._scrollbarWidth}px`)
                })

                // Adjust navbar-toggler margin
                $(Selector.NAVBAR_TOGGLER).each((index, element) => {
                    const actualMargin = $(element)[0].style.marginRight
                    const calculatedMargin = $(element).css('margin-right')
                    $(element).data('margin-right', actualMargin).css('margin-right', `${parseFloat(calculatedMargin) + this._scrollbarWidth}px`)
                })

                // Adjust body padding
                const actualPadding = document.body.style.paddingRight
                const calculatedPadding = $(document.body).css('padding-right')
                $(document.body).data('padding-right', actualPadding).css('padding-right', `${parseFloat(calculatedPadding) + this._scrollbarWidth}px`)
            }
        }

        _resetScrollbar() {
            // Restore fixed content padding
            $(Selector.FIXED_CONTENT).each((index, element) => {
                const padding = $(element).data('padding-right')
                if (typeof padding !== 'undefined') {
                    $(element).css('padding-right', padding).removeData('padding-right')
                }
            })

            // Restore sticky content and navbar-toggler margin
            $(`${Selector.STICKY_CONTENT}, ${Selector.NAVBAR_TOGGLER}`).each((index, element) => {
                const margin = $(element).data('margin-right')
                if (typeof margin !== 'undefined') {
                    $(element).css('margin-right', margin).removeData('margin-right')
                }
            })

            // Restore body padding
            const padding = $(document.body).data('padding-right')
            if (typeof padding !== 'undefined') {
                $(document.body).css('padding-right', padding).removeData('padding-right')
            }
        }

        _getScrollbarWidth() { // thx d.walsh
            const scrollDiv = document.createElement('div')
            scrollDiv.className = ClassName.SCROLLBAR_MEASURER
            document.body.appendChild(scrollDiv)
            const scrollbarWidth = scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth
            document.body.removeChild(scrollDiv)
            return scrollbarWidth
        }

        // Stack
        _pop() {
            if (Config.mode === 'normal') {
                return this._modalStack.shift();
            } else {
                return this._modalStack.pop();
            }
        }

        _push(modal) {
            if (Config.mode === 'normal') {
                this._modalStack.push(modal);
            } else {

            }
        }

        _current() {
            if (Config.mode === 'normal') {
                return this._modalStack[this._modalStack.length - 1];
            } else {
                return this._modalStack[0];
            }
        }

        _isEmpty() {
            return this._modalStack.length == 0;
        }

        // Static

        static instance() {
            if (instance == null) {
                instance = new Modals();
            }
            return instance;
        }

        static _jQueryInterface(config, relatedTarget) {
            return this.each(function () {
                let data = $(this).data(DATA_KEY)
                const _config = {
                    ...$(this).data(),
                    ...typeof config === 'object' && config ? config : {}
                }

                if (!data) {
                    data = new Modal(this, _config)
                    $(this).data(DATA_KEY, data)
                }

                if (typeof config === 'string') {
                    if (typeof data[config] === 'undefined') {
                        throw new TypeError(`No method named "${config}"`)
                    }
                    data[config](relatedTarget)
                } else {
                    Modals.instance().show(data, relatedTarget)
                }
            })
        }
    }

    /**
     * ------------------------------------------------------------------------
     * Data Api implementation
     * ------------------------------------------------------------------------
     */
    $(document).on(Event.CLICK_DATA_API, Selector.DATA_TOGGLE, function (event) {
        let target;
        const selector = Util.getSelectorFromElement(this);

        if (selector) {
            target = $(selector)[0];
        }

        const config = {
                ...$(target).data(),
                ...$(this).data()
            };

        if (this.tagName === 'A' || this.tagName === 'AREA') {
            event.preventDefault();
        }

        const $target = $(target).one(Event.SHOW, (showEvent) => {
            if (showEvent.isDefaultPrevented()) {
                // Only register focus restorer if modal will actually get shown
                return;
            }

            $target.one(Event.HIDDEN, () => {
                if ($(this).is(':visible')) {
                    this.focus();
                }
            });
        });

        Modals._jQueryInterface.call($(target), config, this);

    });

    /**
     * ------------------------------------------------------------------------
     * jQuery
     * ------------------------------------------------------------------------
     */

    $.fn[NAME] = Modals._jQueryInterface
    $.fn[NAME].Constructor = Modals
    $.fn[NAME].noConflict = function () {
        $.fn[NAME] = JQUERY_NO_CONFLICT
        return Modals._jQueryInterface
    }

    return Modals;

})($);


export default Modals;
