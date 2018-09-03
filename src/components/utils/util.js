
const Util = (($) => {

    // Private TransitionEnd Helpers

    const TRANSITION_END = 'transitionend'
    const MAX_UID = 1000000
    const MILLISECONDS_MULTIPLIER = 1000

    function toType(obj) {
        return {}.toString.call(obj).match(/\s([a-z]+)/i)[1].toLowerCase();
    }

    function getSpecialTransitionEndEvent() {
        return {
            bindType: TRANSITION_END,
            delegateType: TRANSITION_END,
            handle(event) {
                if ($(event.target).is(this)) {
                    return event.handleObj.handler.apply(this, arguments) // eslint-disable-line prefer-rest-params
                }
                return undefined // eslint-disable-line no-undefined
            }
        }
    }

    function transitionEndEmulator(duration) {
        let called = false

        $(this).one(Util.TRANSITION_END, () => {
            called = true
        })

        setTimeout(() => {
            if (!called) {
                Util.triggerTransitionEnd(this)
            }
        }, duration)

        return this
    }

    function setTransitionEndSupport() {
        $.fn.emulateTransitionEnd = transitionEndEmulator
        $.event.special[Util.TRANSITION_END] = getSpecialTransitionEndEvent()
    }


    // Public Util Api

    const Util = {
        TRANSITION_END: 'xeTransitionEnd',

        getUID(prefix) {
            do {
                // eslint-disable-next-line no-bitwise
                prefix += ~~(Math.random() * MAX_UID) // "~~" acts like a faster Math.floor() here
            } while (document.getElementById(prefix))
            return prefix
        },

        getSelectorFromElement(element) {
            let selector = element.getAttribute('data-target')
            if (!selector || selector === '#') {
                selector = element.getAttribute('href') || ''
            }

            try {
                const $selector = $(document).find(selector)
                return $selector.length > 0 ? selector : null
            } catch (err) {
                return null
            }
        },

        getTransitionDurationFromElement(element) {
            if (!element) {
                return 0
            }

            // Get transition-duration of the element
            let transitionDuration = $(element).css('transition-duration')
            const floatTransitionDuration = parseFloat(transitionDuration)

            // Return 0 if element or transition duration is not found
            if (!floatTransitionDuration) {
                return 0
            }

            // If multiple durations are defined, take the first
            transitionDuration = transitionDuration.split(',')[0]

            return parseFloat(transitionDuration) * MILLISECONDS_MULTIPLIER
        },

        reflow(element) {
            return element.offsetHeight
        },

        triggerTransitionEnd(element) {
            $(element).trigger(TRANSITION_END)
        },

        // TODO: Remove in v5
        supportsTransitionEnd() {
            return Boolean(TRANSITION_END)
        },

        isElement(obj) {
            return (obj[0] || obj).nodeType
        },

        typeCheckConfig(componentName, config, configTypes) {
            for (const property in configTypes) {
                if (Object.prototype.hasOwnProperty.call(configTypes, property)) {
                    const expectedTypes = configTypes[property]
                    const value = config[property]
                    const valueType = value && Util.isElement(value)
                        ? 'element' : toType(value)

                    if (!new RegExp(expectedTypes).test(valueType)) {
                        throw new Error(
                            `${componentName.toUpperCase()}: ` +
                            `Option "${property}" provided type "${valueType}" ` +
                            `but expected type "${expectedTypes}".`)
                    }
                }
            }
        },

        isInViewport(element) {
            var elementTop = element.offset().top;
            var elementBottom = elementTop + element.outerHeight();
            var viewportTop = $(window).scrollTop();
            var viewportBottom = viewportTop + $(window).height();
            var isVisible = elementBottom > viewportTop && elementTop < viewportBottom;
            // console.log(`${isVisible ? 'visible': 'invisible'}`);
            return isVisible;
        },

        transition(element, num) {
            element.css({
                '-webkit-transition': 'all ' + num + 'ms',
                'transition': 'all ' + num + 'ms'
            });
        },

        timeago(dateTimeStamp) {   //dateTimeStamp是一个时间毫秒，注意时间戳是秒的形式，在这个毫秒的基础上除以1000，就是十位数的时间戳。13位数的都是时间毫秒。
            var minute = 60;      //把分，时，天，周，半个月，一个月用毫秒表示
            var hour = minute * 60;
            var day = hour * 24;
            var week = day * 7;
            var halfamonth = day * 15;
            var month = day * 30;
            var now = Math.round(new Date() / 1000);   //获取当前时间秒
            var diffValue = now - dateTimeStamp;//时间差

            if (diffValue < 0) {
                return "刚刚";
            }
            var result = undefined;
            var minC = diffValue / minute;  //计算时间差的分，时，天，周，月
            var hourC = diffValue / hour;
            var dayC = diffValue / day;
            var weekC = diffValue / week;
            var monthC = diffValue / month;
            if (monthC >= 1 && monthC <= 3) {
                result = " " + parseInt(monthC) + "月前"
            } else if (weekC >= 1 && weekC <= 3) {
                result = " " + parseInt(weekC) + "周前"
            } else if (dayC >= 1 && dayC <= 6) {
                result = " " + parseInt(dayC) + "天前"
            } else if (hourC >= 1 && hourC <= 23) {
                result = " " + parseInt(hourC) + "小时前"
            } else if (minC >= 1 && minC <= 59) {
                result = " " + parseInt(minC) + "分钟前"
            } else if (diffValue >= 0 && diffValue <= minute) {
                result = "刚刚"
            } else {
                var datetime = new Date();
                datetime.setTime(dateTimeStamp);
                var Nyear = datetime.getFullYear();
                var Nmonth = datetime.getMonth() + 1 < 10 ? "0" + (datetime.getMonth() + 1) : datetime.getMonth() + 1;
                var Ndate = datetime.getDate() < 10 ? "0" + datetime.getDate() : datetime.getDate();
                var Nhour = datetime.getHours() < 10 ? "0" + datetime.getHours() : datetime.getHours();
                var Nminute = datetime.getMinutes() < 10 ? "0" + datetime.getMinutes() : datetime.getMinutes();
                var Nsecond = datetime.getSeconds() < 10 ? "0" + datetime.getSeconds() : datetime.getSeconds();
                result = Nyear + "-" + Nmonth + "-" + Ndate
            }
            return result;
        },

        position(jobTitle, company) {
            if (jobTitle && jobTitle != "") {
                if (company && company != "") {
                    return jobTitle + " @ " + company;
                } else {
                    return jobTitle;
                }
            } else {
                if (jobTitle && jobTitle != "") {
                    return company;
                } else {
                    return "";
                }
            }
        },
        linkfilter(msg) {
            var url = msg;
            var urlRegExp = /^(?:(?:ht|f)tp(?:s?)\:\/\/|~\/|\/)?(?:\w+:\w+@)?((?:(?:[-\w\d{1-3}]+\.)+(?:com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|edu|co\.uk|ac\.uk|it|fr|tv|museum|asia|local|travel|[a-z]{2}))|((\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)(\.(\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)){3}))(?::[\d]{1,5})?(?:(?:(?:\/(?:[-\w~!$+|.,=]|%[a-f\d]{2})+)+|\/)+|\?|#)?(?:(?:\?(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)(?:&(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)*)*(?:#(?:[-\w~!$ |\/.,*:;=]|%[a-f\d]{2})*)?$/i;
            var newmsg = "";
            while (urlRegExp.exec(url) != null) {
                var pipeiurl = urlRegExp.exec(url);
                var newurl = "<a href=" + pipeiurl[0] + " target='_blank'>" + pipeiurl[0] + "</a>";
                var urllength = pipeiurl[0].length;
                var start = url.indexOf(pipeiurl[0]);
                newmsg += url.substring(0, start) + newurl;
                url = url.substring(start + urllength);
            }
            return msg = newmsg + url;
        },
        isOverflown(ele) {
            var element = ele[0]
            return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
        },
        parseUrl(url) {
            var a = document.createElement('a');
            a.href = url;
            return a;
        },

        convertImages(urls) {
            return urls.map((url, index) => {
                var image = { url: url };
                var parsedUrl = Util.parseUrl(url);
                var query = parsedUrl.search.substring(1);
                var vars = query.split('&');
                for (var i = 0; i < vars.length; i++) {
                    var pair = vars[i].split('=');
                    var key = decodeURIComponent(pair[0]);
                    var value = decodeURIComponent(pair[1]);
                    image[key] = value;
                }
                if (image.h / image.w > 1.5) {
                    image.long = true;
                }
                if (urls.length == 1) {
                    image.thumbWidth = image.h-image.w>0 ? 316 : 460;
                    image.thumbHeight = image.w-image.h>0 ? 316 : 460;
                } else {
                    image.thumbHeight = 260;
                    image.thumbWidth = 260;
                }
                if(image.f === 'gif') {
                    image.gif = true;
                }
                image.thumbUrl = `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}?imageView2/1/w/${image.thumbWidth}/h/${image.thumbHeight}/q/85/format/jpg/interlace/1`;
                return image;
            });

        }

    };
    setTransitionEndSupport();
    return Util;
})($);



export default Util;
