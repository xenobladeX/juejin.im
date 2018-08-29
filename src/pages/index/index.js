// sass
import './index.scss';
import '../../components/tooltip/tooltip.scss';
import '../../components/tooltip/user-tooltip/user-tooltip.scss';
import '../../components/nest-link/nest-link.scss';
import '../../../node_modules/ionicons/dist/scss/ionicons.scss';
import '../../components/modal/auth-modal.scss';

// css
import 'owl.carousel/dist/assets/owl.carousel.css';

// template
import user_tooltip_template from './user-tooltip-template.html';
import recommended_entry_list_template from './recommended-entry-list-template.html';
import category_entry_list_template from './category-entry-list-template.html';
import book_list_template from './book-list-template.html';
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
    var data = {
        recommendedEntryList: [],
        categoryEntryList: [],
        bookList: [],
        bannerList: []
    };
    var category = null;
    const userTooltipHelper = {
        position: Util.position,
    };
    const entryHelper = {
        timeago: Util.timeago,
    }

    // 模板
    // TODO: use mustache
    let recommendedEntryListTemplate = $.templates(recommended_entry_list_template);
    let categoryEntryListTemplate = $.templates(category_entry_list_template);
    let userTooltipTemplate = $.templates(user_tooltip_template);
    let bookListTemplate = $.templates(book_list_template);
    let bannerListTemplate = $.templates(banner_list_template);

    $('.nav-list .nav-item').click(function () {
        var needReload = false;
        if (!$(this).hasClass('active')) {
            needReload = true;
        }
        $('.nav-list .nav-item').removeClass('active');
        $(this).addClass('active');
        if (needReload) {

            if ($(this).index() == 0) {
                category = null;

            } else {
                category = $(this).prop("id");
            }
            // clear entry list
            $.observable(data.categoryEntryList).remove(0, data.categoryEntryList.length);
            $.observable(data.recommendedEntryList).remove(0, data.recommendedEntryList.length);

            // reload entry list
            $('#entry-list').dropload('loadDown');
        }
    });

    // 推荐 文章列表
    recommendedEntryListTemplate.link('#entry-list .recommended', data, entryHelper);
    // 分类 文章列表
    categoryEntryListTemplate.link('#entry-list .category', data, entryHelper);

    var entryListChange = (event, eventArg) => {
        if (eventArg.change === 'insert') {
            // Bind entry to user-tooltip
            $(eventArg.items).each((index, element) => {
                const instance = new Tooltip($(`#${element.objectId} .username [data-toggle="tooltip"]`), {
                    title: userTooltipTemplate.render(element.user, userTooltipHelper),
                    html: true,
                    delay: { show: 500, hide: 100 },
                    boundariesElement: document.getElementsByClassName('view')[0]
                });
            });

            $('.nest-link .nest-link-content').click(function (e) {
                e.preventDefault();
                $(this).parent().find('.nest-link-overlay')[0].click();
            });
        }
    }
    $.observe(data.recommendedEntryList, entryListChange);
    $.observe(data.categoryEntryList, entryListChange);

    // 上拉加载更多
    $('#entry-list').dropload({
        scrollAreas: [window],
        num: 0,
        down: {
            callback: function (dropload) {
                var preCategory = category;
                if (preCategory == null) { // 推荐列表
                    Api.generateSuid().then(() => {

                        return Api.getRecommendedEntry();
                    }).done((entryList) => {
                        if(preCategory === category) {
                            $.observable(data.recommendedEntryList).insert(entryList);

                            dropload.endByNum(data.recommendedEntryList.length);
                        }
                    }).fail(err => {
                        console.warn('load recommended entry list failed: ' + err);
                        if(preCategory === category) {
                            dropload.endByNum(data.recommendedEntryList.length);
                        }
                    });

                } else {    // 分类列表
                    Api.getCategoryEntry(preCategory, data.categoryEntryList.length > 0 ? data.categoryEntryList[data.categoryEntryList.length - 1].rankIndex : null).done((entryList) => {
                        if(preCategory === category) {
                            $.observable(data.categoryEntryList).insert(entryList);

                            dropload.endByNum(data.categoryEntryList.length);
                        }

                    }).fail(err => {
                        console.warn('load category entry list failed: ' + err);
                        if(preCategory === category) {
                            dropload.endByNum(data.categoryEntryList.length);
                        }
                    });
                }
            }
        },
        // up: {
        //     callback: function(dropload) {

        //     }
        // }
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

    // 小册子
    Api.getBookList().done(bookList => {
        $.observable(data.bookList).insert(bookList);

        // render
        var html = bookListTemplate.render(data);
        $('.books-section .book-list').html(html);

        // 小册子滚动广告
        var owl = $('.books-section .owl-carousel');
        owl.owlCarousel({
            items: 1,
            loop: true
        });

        // 滚动广告的控制按钮
        $('.books-section .controlers .ion-ios-arrow-back').click(function () {
            owl.trigger('prev.owl.carousel');
        });
        $('.books-section .controlers .ion-ios-arrow-forward').click(function () {
            owl.trigger('next.owl.carousel');
        });

        // 添加点击跳转
        $('.books-section .book-item').click(function () {
            var id = $(this).prop('id');
            window.location.href = `https://juejin.im/book/${id}`;
            return false;
        });
    });

    // 广告
    Api.getBanner().done(bannerList => {
        $.observable(data.bannerList).insert(bannerList);

        // render
        var html = bannerListTemplate.render(data);
        $('.banner-section').html(html);

        // close
        $('.banner-list .close-btn').click(function () {
            $(this).closest('.item').remove();
        });

    });

});
