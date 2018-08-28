import './modal.scss';

import Modals from './modals.js';

import Util from '../utils/util';


const Modal = (($) => {

    /**
     * ------------------------------------------------------------------------
     * Constants
     * ------------------------------------------------------------------------
     */

    const NAME = 'modal';
    const DATA_KEY = 'xe.modal';
    const EVENT_KEY = `.${DATA_KEY}`;
    const DATA_API_KEY = '.data-api';
    const JQUERY_NO_CONFLICT = $.fn[NAME];
    const ESCAPE_KEYCODE = 27 // KeyboardEvent.which value for Escape (Esc) key

    const Default = {
        backdrop: true,
        keyboard: true,
        focus: true,
        show: true,
    };

    const DefaultType = {
        backdrop: '(boolean|string)',
        keyboard: 'boolean',
        focus: 'boolean',
        show: 'boolean',
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

    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */
    class Modal {
        constructor(element, config) {
            this._config = this._getConfig(config);
            this._element = element;
            this._dialog = $(element).find(Selector.DIALOG)[0];
            this._isShown = false;
            this._isBodyOverflowing = false;
            this._ignoreBackdropClick = false;
        }


        static get Default() {
            return Default
        }

        // Public

        show(relatedTarget) {
            if (this._isTransitioning || this._isShown) {
                return;
            }

            if ($(this._element).hasClass(ClassName.FADE)) {
                this._isTransitioning = true;
            }

            const showEvent = $.Event(Event.SHOW, {
                relatedTarget
            });

            $(this._element).trigger(showEvent);

            if (this._isShown || showEvent.isDefaultPrevented()) {
                return;
            }

            this._isShown = true;

            this._checkScrollbar();

            this._adjustDialog();

            this._setEscapeEvent();
            this._setResizeEvent();

            $(this._element).on(Event.CLICK_DISMISS,
                Selector.DATA_DISMISS,
                (event) => Modals.instance().hide(event));

            $(this._dialog).on(Event.MOUSEDOWN_DISMISS, () => {
                $(this._element).one(Event.MOUSEUP_DISMISS, (event) => {
                    if ($(event.target).is(this._element)) {
                        this._ignoreBackdropClick = true;
                    }
                })
            });

            $(this._element).on(Event.CLICK_DISMISS, (event) => {
                if (this._ignoreBackdropClick) {
                    this._ignoreBackdropClick = false;
                    return;
                }
                if (event.target !== event.currentTarget) {
                    return;
                }
                if (this._config.backdrop === 'static') {
                    this._element.focus();
                } else {
                    Modals.instance().hide();
                }
            });

            this._showElement(relatedTarget);
        }

        hide(callback) {
            if (this._isTransitioning || !this._isShown) {
                return;
            }

            const hideEvent = $.Event(Event.HIDE);

            $(this._element).trigger(hideEvent);

            if (!this._isShown || hideEvent.isDefaultPrevented()) {
                return;
            }

            this._isShown = false;
            const transition = $(this._element).hasClass(ClassName.FADE);

            if (transition) {
                this._isTransitioning = true;
            }

            this._setEscapeEvent();
            this._setResizeEvent();

            $(document).off(Event.FOCUSIN);

            $(this._element).removeClass(ClassName.SHOW);

            $(this._element).off(Event.CLICK_DISMISS);
            $(this._element).off(Event.MOUSEDOWN_DISMISS);

            const hideComplete = (event) => {
                this._element.style.display = 'none';
                this._element.setAttribute('aria-hidden', true);
                this._isTransitioning = false;
                $(this._element).trigger(Event.HIDDEN);
                this._resetAdustments();
                if (callback) {
                    callback(event);
                }
            }

            if (transition) {
                const transitionDuration = Util.getTransitionDurationFromElement(this._element);

                $(this._element).one(Util.TRANSITION_END, (event) => hideComplete(event))
                    .emulateTransitionEnd(transitionDuration);
            } else {
                hideComplete();
            }
        }

        dispose() {
            $.removeData(this._element, DATA_KEY);

            $(window, document, this._element, this._backdrop).off(EVENT_KEY);

            this._config = null;
            this._element = null;
            this._dialog = null;
            this._isShown = null;
            this._isBodyOverflowing = null;
            this._ignoreBackdropClick = null;
        }

        handleUpdate() {
            this._adjustDialog();
        }

        // Private

        _getConfig(config) {
            config = {
                ...Default,
                ...config
            }
            Util.typeCheckConfig(NAME, config, DefaultType);
            return config;
        }

        _showElement(relatedTarget) {
            const transition = $(this._element).hasClass(ClassName.FADE);

            if (!this._element.parendNode || this._element.parentNode.nodeType !== Node.ELEMENT_NODE) {
                document.body.appendChild(this._element);
            }

            this._element.style.display = 'block';
            this._element.removeAttribute('aria-hidden');
            this._element.scrollTop = 0;

            if (transition) {
                Util.reflow(this._element);
            }

            $(this._element).addClass(ClassName.SHOW);

            if (this._config.focus) {
                this._enforceFocus();
            }

            const showEvent = $.Event(Event.SHOWN, {
                relatedTarget
            });

            const transitionComplete = () => {
                if (this._config.focus) {
                    this._element.focus();
                }
                this._isTransitioning = false;
                $(this._element).trigger(showEvent);
            };

            if (transition) {
                const transitionDuration = Util.getTransitionDurationFromElement(this._element);

                $(this._dialog).on(Util.TRANSITION_END, transitionComplete)
                    .emulateTransitionEnd(transitionDuration);
            } else {
                transitionComplete();
            }
        }

        _enforceFocus() {
            $(document).off(Event.FOCUSIN).on(Event.FOCUSIN, (event) => {
                if (document !== event.target &&
                    this._element !== event.target &&
                    $(this._element).has(event.target).length === 0) {
                    this._element.focus();
                }
            });
        }

        _setEscapeEvent() {
            if (this._isShown && this._config.keyboard) {
                $(this._element).on(Event.KEYDOWN_DISMISS, (event) => {
                    if (event.which === ESCAPE_KEYCODE) {
                        event.preventDefault();
                        Modals.instance().hide();
                    }
                });
            } else if (!this._isShown) {
                $(this._element).off(Event.KEYDOWN_DISMISS);
            }
        }

        _setResizeEvent() {
            if (this._isShown) {
                $(window).on(Event.RESIZE, (event) => this.handleUpdate());
            } else {
                $(window).off(Event.RESIZE);
            }
        }

        // ----------------------------------------------------------------------
        // the following methods are used to handle overflowing modals
        // todo (fat): these should probably be refactored out of modal.js
        // ----------------------------------------------------------------------


        _adjustDialog() {
            const isModalOverflowing =
                this._element.scrollHeight > document.documentElement.clientHeight;

            if (!this._isBodyOverflowing && isModalOverflowing) {
                this._element.style.paddingLeft = `${this._scrollbarWidth}px`;
            }

            if (this._isBodyOverflowing && !isModalOverflowing) {
                this._element.style.paddingRight = `${this._scrollbarWidth}px`;
            }
        }

        _resetAdustments() {
            this._element.style.paddingLeft = '';
            this._element.style.paddingRight = '';
        }

        _checkScrollbar() {
            const rect = document.body.getBoundingClientRect();
            this._isBodyOverflowing = rect.left + rect.right < window.innerWidth;
        }

        // Static

    }

    return Modal;

})($);

export default Modal;
