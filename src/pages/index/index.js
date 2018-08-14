// sass
import './index.scss';
import '../../components/tooltip/tooltip.scss';
import '../../../node_modules/ionicons/dist/scss/ionicons.scss';

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
import store from 'store';
import 'owl.carousel';
import { request } from 'https';

$(document).ready(function () {
    var data = {
        rencommendedEntryList: [],
        categoryEntryList: [],
        bookList: [],
        bannerList: []
    };
    var suid = null;
    var isFirstLoad = true;
    var isWelcom = true;
    var entryListRequest = null;

    // 模板
    let recommendedEntryListTemplate = $.templates(recommended_entry_list_template);
    let categoryEntryListTemplate = $.templates(category_entry_list_template);
    let userTooltipTemplate = $.templates(user_tooltip_template);
    let bookListTemplate = $.templates(book_list_template);
    let bannerListTemplate = $.templates(banner_list_template);

    var generateSuid = () => {
        var deferred = $.Deferred();
        suid = store.get('suid');
        if (suid) {
            deferred.resolve(suid);
        } else {
            $.getJSON('/v1/gen_suid?src=juejin.im').then(gen_suid_response => {
                if (gen_suid_response.m !== 'ok') {
                    deferred.reject(new Error('generate suid response error: ' + gen_suid_response.m));
                } else {
                    suid = gen_suid_response.d;
                    store.set('suid', suid);
                    deferred.resolve(suid);
                }
            }, (jqXHR, textStatus, errorThrown) => {
                console.warn('request generate suid failed: ' + errorThrown);
                deferred.reject(err);
            });
        }
        return deferred;
    };

    var getRecommendedEntry = (requestCallback) => {
        var deferred = $.Deferred();
        if (suid == null) {
            deferred.reject(new Error('suid is null'));
        } else {
            var xhr = $.getJSON(`/v1/get_recommended_entry?suid=${suid}&ab=welcome_3&src=web`)
                .then((get_recommended_entry_response, textStatus, jqXHR) => {
                    if (get_recommended_entry_response.m !== 'ok') {
                        deferred.reject(new Error('get recommended entry response error: ' + get_recommended_entry_response.m));
                    } else {
                        deferred.resolve($.isEmptyObject(get_recommended_entry_response.d) ? [] : get_recommended_entry_response.d);
                    }
                }, (jqXHR, textStatus, errorThrown) => {
                    console.warn('get recommended entry failed: ' + errorThrown);
                    deferred.reject(errorThrown);
                });
                if (requestCallback) {
                    requestCallback(xhr);
                }
        }
        return deferred;
    }

    var getCategoryEntry = (id, requestCallback, count = 20) => {
        var deferred = $.Deferred();
        $.getJSON(`/v1/get_entry_by_rank?src=web&limit=${count}&category=${id}`)
            .then((get_category_entry_response, textStatus, jqXHR) => {
                if (get_category_entry_response.m !== 'ok') {
                    deferred.reject(new Error('get recommended entry response error: ' + get_category_entry_response.m));
                } else {
                    deferred.resolve($.isEmptyObject(get_category_entry_response.d) ? [] : get_category_entry_response.d);
                }
            }, (jqXHR, textStatus, errorThrown) => {
                console.warn('get category entry failed: ' + errorThrown);
                deferred.reject(errorThrown);
            });
            if (requestCallback) {
                requestCallback(xhr);
            }
        return deferred;
    }

    var getBookList = () => {
        var deferred = $.Deferred();
        $.getJSON('/v1/getListByLastTime?uid=&client_id=&token=&src=web&pageNum=1')
            .then(get_booklist_response => {
                if (get_booklist_response.m !== 'ok') {
                    deferred.reject(new Error('get book list response error: ' + get_booklist_response.m));
                } else {
                    var bookList = get_booklist_response.d;
                    var bookItemList = [];
                    bookList.forEach((item, index) => {
                        var bookListIndex = parseInt(index / 2);
                        var bookItem = bookItemList[bookListIndex];
                        if (!bookItem) {
                            bookItem = { 'bookItem': [] };
                            bookItemList.push(bookItem);
                        }
                        bookItem.bookItem.push(item);
                    });

                    deferred.resolve(bookItemList);
                }
            }, (jqXHR, textStatus, errorThrown) => {
                console.warn('get book list failed: ' + errorThrown);
                deferred.reject(errorThrown);
            });
        return deferred;
    }

    var getBanner = () => {
        var deferred = $.Deferred();
        $.getJSON('/v1/web/aanner?position=hero&platform=web&page=0&pageSize=20&src=web')
            .then(get_banner_response => {
                if (get_banner_response.m !== 'ok') {
                    deferred.reject(new Error('get banner response error: ' + get_banner_response.m));
                } else {
                    var bannerList = get_banner_response.d.banner;
                    deferred.resolve($.isEmptyObject(bannerList) ? [] : bannerList);
                }
            }, (jqXHR, textStatus, errorThrown) => {
                console.warn('get banner failed: ' + errorThrown);
                deferred.reject(errorThrown);
            });
        return deferred;
    }

    /**
     * main
     */

    $('.nav-list .nav-item').click(function () {
        var needReload = false;
        if ($(this).hasClass('active')) {
            needReload = true;
        }
        $('.nav-list .nav-item').removeClass('active');
        $(this).addClass('active');
        if (needReload) {
            // clear another entry list
            if (entryListRequest) {
                entryListRequest.abort();
            }
            if ($(this).index() == 0) {
                isWelcom = true;
                $.observable(data.categoryEntryList).remove(0, data.categoryEntryList.length);
            } else {
                isWelcom = false;
                $.observable(data.rencommendedEntryList).remove(0, data.rencommendedEntryList);
            }

            // reload entry list
            $('#entry-list').dropload('loadDown');
        }
    });

    // 推荐 文章列表
    recommendedEntryListTemplate.link('#entry-list .recommended', data);
    // 分类 文章列表
    // categoryEntryListTemplate.link('#entry-list .category', data);

    // Bind entry to user-tooltip
    $.observe(data.rencommendedEntryList, function (event, eventArg) {
        if (eventArg.change === 'insert') {
            $(eventArg.items).each((index, element) => {
                const instance = new Tooltip($(`#${element.objectId} .username [data-toggle="tooltip"]`), {
                    title: userTooltipTemplate.render(element.user),
                    html: true,
                    boundariesElement: document.getElementsByClassName('entry-list')[0]
                });
            });
        }
    });

    // 上拉加载更多
    // $('#entry-list').dropload({
    //     scrollAreas: [window],
    //     num: 0,
    //     down: {
    //         callback: function (dropload) {
    //             generateSuid().then(() => {

    //                 return getRecommendedEntry( request => {
    //                     entryListRequest = request;
    //                 });
    //             }).done((entryList) => {
    //                 $.observable(data.rencommendedEntryList).insert(entryList);

    //                 dropload.endByNum(data.rencommendedEntryList.length);
    //             }).fail(err => {
    //                 console.warn('load recommended failed: ' + err);
    //                 dropload.endByNum(data.rencommendedEntryList.length);
    //             });
    //         }
    //     },
    //     // up: {
    //     //     callback: function(dropload) {

    //     //     }
    //     // }
    // });

    // 小册子
    getBookList().done(bookList => {
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
    getBanner().done(bannerList => {
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
