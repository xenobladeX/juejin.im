import '../../components/modal/modal.scss';

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
        show: true
    };

    const DefaultType = {
        backdrop: '(boolean|string)',
        keyboard: 'boolean',
        focus: 'boolean',
        show: 'boolean'
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








        // Static

        static _jQueryInterface(config, relatedTarget) {
            return this.each(function () {
                let data = $(this).data(DATA_KEY)
                const _config = {
                    ...Default,
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
                } else if (_config.show) {
                    data.show(relatedTarget)
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

        const config = $(target).data(DATA_KEY)
            ? 'toggle' : {
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
            })
        })

        Modal._jQueryInterface.call($(target), config, this);

    });

    /**
     * ------------------------------------------------------------------------
     * jQuery
     * ------------------------------------------------------------------------
     */

    $.fn[NAME] = Modal._jQueryInterface
    $.fn[NAME].Constructor = Modal
    $.fn[NAME].noConflict = function () {
        $.fn[NAME] = JQUERY_NO_CONFLICT
        return Modal._jQueryInterface
    }

    return Modal;

})($);


export default Modal;
