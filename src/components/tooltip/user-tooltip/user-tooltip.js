
import user_tooltip_template from './user-tooltip-template.html';
import './user-tooltip.scss';

import Tooltip from 'tooltip.js';
import Util from '../utils/util';

const userTooltip = ($ => {

    const NAME = 'userTooltip';
    const DATA_KEY = 'xe.userTooltip';
    const EVENT_KEY = `.${DATA_KEY}`;
    const JQUERY_NO_CONFLICT = $.fn[NAME];

    const Selector = {};

    const Event = {};

    const ClassName = {};

    const Default = {};

    class UserTooltip {

        constructor(element, config) {
            this._element = element;
            this._config = this._getConfig(config);







        }




        /**
         * Pulbic
         */





        /**
         * Private
         */
        _getConfig(config) {
            config = {...Default, ...config};
            return config
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
     $.fn[NAME] = UserTooltip._jQueryInterface;
     $.fn[NAME].Constructor = UserTooltip;
     $.fn[NAME].noConflict = function () {
         $.fn[NAME] = JQUERY_NO_CONFLICT;
         return UserTooltip._jQueryInterface;
     }

     return UserTooltip;

})($, Tooltip);

export default userTooltip;
