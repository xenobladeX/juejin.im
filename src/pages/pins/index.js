// sass
import './index.scss';
import '../../components/tooltip/tooltip.scss';
import '../../components/tooltip/user-tooltip/user-tooltip.scss';
import '../../../node_modules/ionicons/dist/scss/ionicons.scss';
import '../../components/modal/auth-modal.scss';

// css
import 'owl.carousel/dist/assets/owl.carousel.css';

// template
import topic_list_template from './topic-list-template.html';
import banner_list_template from './banner-list-template.html';

// js
import '../../components/collapse/collapseDropdown';
import Tooltip from 'tooltip.js';
import 'jsviews';
import '../../components/dropload/dropload';
import 'owl.carousel';
import Util from '../../components/utils/util';
import '../../components/modal/modals.js';
import Api from '../../components/api/api';


$(document).ready(function () {

    var data  = {
        topicList: [],
        bannerList: [],
    }

    // template
    let topicListTemplate = $.templates(topic_list_template);
    let bannerListTemplate = $.templates(banner_list_template);

    Api.getTopicList(6).done(topicList => {
        $.observable(data.topicList).insert(topicList);
        // render
        var html = topicListTemplate.render(data);
        $('.topic-section >.content').html(html);
    });

    Api.getPageBanner().done(bannerList => {
        $.observable(data.bannerList).insert(bannerList);
        // render
        var html = bannerListTemplate.render(data);
        console.log(html);
        $('.slide-section').html(html);

        // 滚动页
        var owl = $('.slide-section .owl-carousel');
        owl.owlCarousel({
            items: 1,
            loop: true,
            dots: true,
        });
    })


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
