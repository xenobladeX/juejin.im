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
import pin_list_template from './pin-list-template.html';

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

    var data = {
        pinList: [],
        topicList: [],
        bannerList: [],
    };

    const entryHelper = {
        timeago: Util.timeago,
        position: Util.position,
        imageCol: function(count) {
            if(count >= 4) {
                return 'col-' + 4;
            } else {
                return 'col-' + count;
            }
        },
        parseUrl: Util.parseUrl,
        convertImages: Util.convertImages,
        textHandle: function(text) {
            var newText = text.replace(/[\n\r]/g, '<br/>');






            return newText;
        }
    }

    var showtextLimit = (contentBoxs) => {
        $(contentBoxs).each((index, contentBox) => {
            var $contentBox = $(contentBox);
            var limitBox = $contentBox.find('.limit-ctl-box');
            var content = $contentBox.find('.content');
            if(Util.isOverflown(content)) {
                limitBox.show();

            } else {
                limitBox.hide();
            }
        });
    }

    // template
    let topicListTemplate = $.templates(topic_list_template);
    let bannerListTemplate = $.templates(banner_list_template);
    let pinListTemplate = $.templates(pin_list_template);

    pinListTemplate.link('.pin-content', data, entryHelper);

    $.observe(data.pinList, (event, eventArg) => {
        if (eventArg.change === 'insert') {
            $(eventArg.items).each((index, element) => {
                // extend button
                var contentBox = $(`#${element.objectId} .pin-content-row`);
                showtextLimit(contentBox);
                var limitButton = contentBox.find('.limit-btn');
                var content = contentBox.find('.content');
                limitButton.click(() => {
                    content.toggleClass('clamp');
                    if(content.hasClass('clamp')) {
                        limitButton.text('展开');
                    } else {
                        limitButton.text('收起');
                    }
                });

                // picture gallery


                // picture modal

            });
        }
    });

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
        $('.slide-section').html(html);

        // 滚动页
        var owl = $('.slide-section .owl-carousel');
        owl.owlCarousel({
            items: 1,
            loop: true,
            dots: true,
        });
    });

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

    // dropload
    $('.pin-content').dropload({
        scrollAreas: [window],
        num: 0,
        down: {
            callback: function (dropload) {
                var before = data.pinList.length > 0 ? data.pinList[data.pinList.length - 1].createdAt : '';
                Api.getPinList(before).done(pinList => {
                    $.observable(data.pinList).insert(pinList);
                    dropload.endByNum(data.pinList.length);
                }).fail(err => {

                    dropload.endByNum(data.pinList.length);
                });
            }
        }
    });

    $( window ).resize((e) => {
        showtextLimit($('.pin-content-row'));
    });

});
