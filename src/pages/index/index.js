// sass
import './index.scss';
import '../../components/tooltip/tooltip.scss';
import '../../../node_modules/ionicons/dist/scss/ionicons.scss';


// template
import user_tooltip_template from './user-tooltip-template.html';
import entry_list_template from './entry-list-template.html';

// js
import '../../components/collapse/collapseDropdown';
// import '../../components/tooltip/tooltip';
import Tooltip from 'tooltip.js';
import 'jsviews';
import '../../components/dropload/dropload';
import store from 'store';

$(document).ready(function () {
    var recommendedData = {
        d: []
    };
    var suid = null;
    var isFirstLoad = true;

    // 模板
    let entryListTemplate = $.templates(entry_list_template);
    let userTooltipTemplate = $.templates(user_tooltip_template);

    var generateSuid = () => {
        var deferred = $.Deferred();
        $.getJSON('/v1/gen_suid?src=juejin.im').then(gen_suid_response => {
            if (gen_suid_response.m !== 'ok') {
                deferred.reject(new Error('generate suid response error: ' + gen_suid_response.m));
            } else {
                suid = gen_suid_response.d;
                store.set('suid', suid);
                deferred.resolve(suid);
            }
        }, err => {
            console.warn('request generate suid failed: ' + err);
            deferred.reject(err);
        });
        return deferred;
    };

    var getRecommendedEntry = () => {
        var deferred = $.Deferred();
        if (suid == null) {
            deferred.reject(new Error('suid is null'));
        } else {
            $.getJSON(`/v1/get_recommended_entry?suid=${suid}&ab=welcome_3&src=web`)
                .then(get_recommended_entry_response => {
                    if (get_recommended_entry_response.m !== 'ok') {
                        deferred.reject(new Error('get recommended entry response error: ' + get_recommended_entry_response.m));
                    } else {
                        deferred.resolve($.isEmptyObject(get_recommended_entry_response.d) ? [] : get_recommended_entry_response.d);
                    }
                }, err => {
                    console.warn('get recommended entry failed: ' + err);
                    deferred.reject(err);
                });
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
                    deferred.resolve(get_booklist_response.d);
                }
            }, err => {
                console.warn('get book list failed: ' + err);
                deferred.reject(err);
            });
        return deferred;
    }

    /******************************************main */

    // 绑定模板
    entryListTemplate.link('#template-container', recommendedData);
    // add array observer, bind insert to user-tooltip
    $.observe(recommendedData.d, function (event, eventArg) {
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
    $('#entry-list').dropload({
        scrollArea: window,
        loadDownFn: function (me) {
            if (isFirstLoad) {
                suid = store.get('suid');
                if (!suid) {
                    generateSuid().then(() => {
                        return getRecommendedEntry();
                    }).done((entryList) => {
                        isFirstLoad = false;
                        if (entryList.length === 0) {
                            me.noData();
                        } else {
                            $.observable(recommendedData.d).insert(entryList);
                            me.resetload();
                        }
                    }).fail(err => {
                        console.warn('load recommended failed: ' + err);
                        me.resetload();
                    });
                } else {
                    getRecommendedEntry().done((entryList) => {
                        isFirstLoad = false;
                        if (entryList.length === 0) {
                            me.noData();
                        } else {
                            $.observable(recommendedData.d).insert(entryList);
                        }
                        me.resetload();
                    }).fail(err => {
                        console.warn('load recommended failed: ' + err);
                        me.resetload();
                    });
                }
            } else {
                getRecommendedEntry().done((newEntryList) => {
                    $.observable(recommendedData.d).insert(newEntryList);
                    me.resetload();
                }).fail(err => {
                    console.warn('refresh recommended failed: ' + err);
                    me.resetload();
                });
            }
        }
    });
});
