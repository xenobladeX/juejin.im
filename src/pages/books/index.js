// sass
import './index.scss';
import '../../components/tooltip/tooltip.scss';
import '../../components/tooltip/user-tooltip/user-tooltip.scss';
import '../../../node_modules/ionicons/dist/scss/ionicons.scss';
import '../../components/modal/auth-modal.scss';

// css
import 'owl.carousel/dist/assets/owl.carousel.css';

// template


// js
import '../../components/collapse/collapseDropdown';
import Tooltip from 'tooltip.js';
import 'jsviews';
import '../../components/dropload/dropload';
import store from 'store';
import 'owl.carousel';
import Util from '../../components/utils/util';
import '../../components/modal/modals.js';

$(document).ready(function () {

    console.log('pins load');


    // login Modal
    $('#loginModal .input-group input[type="text"]').focus(() => {
        $('#loginModal .panfish .normal').hide();
        $('#loginModal .panfish .greeting').show();
        $('#loginModal .panfish .blindfold').hide();
    });
    $('#loginModal .input-group input[type="password"]').focus(() => {
        $('#loginModal .panfish .normal').hide();
        $('#loginModal .panfish .greeting').hide();
        $('#loginModal .panfish .blindfold').show();
    });

    $('#loginModal .input-group input').blur(() => {
        $('#loginModal .panfish .normal').show();
        $('#loginModal .panfish .greeting').hide();
        $('#loginModal .panfish .blindfold').hide();
    });


});
