
import store from 'store';

const Api = (($) => {
    var suid = null;

    const Api = {
        generateSuid(){
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
        },
        getRecommendedEntry() {
            var deferred = $.Deferred();
            if (suid == null) {
                deferred.reject(new Error('suid is null'));
            } else {

                $.getJSON(`/v1/get_recommended_entry?suid=${suid}&ab=welcome_3&src=web`).then((get_recommended_entry_response, textStatus, jqXHR) => {
                        if (get_recommended_entry_response.m !== 'ok') {
                            deferred.reject(new Error('get recommended entry response error: ' + get_recommended_entry_response.m));
                        } else {
                            deferred.resolve($.isEmptyObject(get_recommended_entry_response.d) ? [] : get_recommended_entry_response.d);
                        }
                    }, (jqXHR, textStatus, errorThrown) => {
                        if (errorThrown === 'abort') {
                            // deferred.resolve([]);
                        } else {
                            console.warn('get recommended entry failed: ' + errorThrown);
                            deferred.reject(errorThrown);
                        }

                    });
            }
            return deferred;
        },
        getCategoryEntry (id, before, count = 20){
            var deferred = $.Deferred();
            $.getJSON(`/v1/get_entry_by_rank?src=web${before ? '&before=' + before : ''}&limit=${count}&category=${id}`).then((get_category_entry_response, textStatus, jqXHR) => {
                if (get_category_entry_response.m !== 'ok') {
                    deferred.reject(new Error('get category entry response error: ' + get_category_entry_response.m));
                } else {
                    deferred.resolve($.isEmptyObject(get_category_entry_response.d.entrylist) ? [] : get_category_entry_response.d.entrylist);
                }
            }, (jqXHR, textStatus, errorThrown) => {
                if (errorThrown === 'abort') {
                    // deferred.resolve([]);
                } else {
                    console.warn('get category entry failed: ' + errorThrown);
                    deferred.reject(errorThrown);
                }

            })
            return deferred;
        },
        getCategories() {
            var deferred = $.Deferred();
            $.getJSON('/v1/categories').then((get_categories_response, textStatus, jqXHR) => {
                if (get_categories_response.m !== 'ok') {
                    deferred.reject(new Error('get categories response error: ' + get_categories_response.m));
                } else {
                    deferred.resolve($.isEmptyObject(get_categories_response.d.categoryList) ? [] : get_categories_response.d.categoryList);
                }
            }, (jqXHR, textStatus, errorThrown) => {
                console.warn('get categories failed: ' + errorThrown);
                deferred.reject(errorThrown);
            });
            return deferred;
        },
        getBookList() {
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
        },
        getBanner() {
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
        },
        getTopicList() {
            var deferred = $.Deferred();
            $.getJSON('/v1/topicList/recommend?uid=&device_id=&token=&src=web')
            .then(get_topicList_response => {
                if(get_topicList_response.m !== 'success') {
                    deferred.reject(new Error('get topic list error: ' + get_topicList_response.m))
                } else {
                    var topicList = get_topicList_response.d.list;
                    deferred.resolve($.isEmptyObject(topicList) ? [] : topicList);
                }
            }, (jqXHR, textStatus, errorThrown) => {
                console.warn('get topic lsit failed: ' + errorThrown);
                deferred.reject(errorThrown);
            });
            return deferred;
        },
        getPageBanner() {
            var deferred = $.Deferred();
            $.getJSON('/v1/web/page/aanner?position=topic-banner&platform=web&page=0&pageSize=20&src=web')
            .then(get_banner_response => {
                if(get_banner_response.m !== 'success') {
                    deferred.reject(new Error('get page banner error: ' + get_banner_response.m))
                } else {
                    var banners = get_banner_response.d.banner;
                    deferred.resolve($.isEmptyObject(banners) ? [] : banners);
                }
            }, (jqXHR, textStatus, errorThrown) => {
                console.warn('get page banner failed: ' + errorThrown);
                deferred.reject(errorThrown);
            });
            return deferred;
        },
        getPinList(before, count = 30) {
            var deferred = $.Deferred();
            $.getJSON(`/v1/pinList/recommend?uid=&device_id=&token=&src=web&before=${before}&limit=${count}`)
            .then(get_pinList_response => {
                if(get_pinList_response.m !== 'success') {
                    deferred.reject(new Error('get pin list error: ' + get_pinList_response.m))
                } else {
                    var pinList = get_pinList_response.d.banner;
                    deferred.resolve($.isEmptyObject(pinList) ? [] : pinList);
                }
            }, (jqXHR, textStatus, errorThrown) => {
                console.warn('get pin list failed: ' + errorThrown);
                deferred.reject(errorThrown);
            });
            return deffer
        },
    }

    return Api;
})($);

export default Api;
