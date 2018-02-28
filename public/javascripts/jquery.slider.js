/// <reference path="jquery.js"/>
/*
* jSlider
* version: 1.0.0 (06/09/2009)
* @ jQuery v1.2.*
*
* Licensed under the GPL:
*   http://gplv3.fsf.org
*
* usage as:
*     var slider = $.fn.jSlider({...});
*     slider.setSliderValue(value,callback);
* Copyright 2008, 2009 Jericho [ thisnamemeansnothing[at]gmail.com ] 
*/
(function($) {
    $.extend($.fn, {
        ///<summary>
        /// apply a slider UI
        ///</summary>
        jSlider: function(setting) {
            var ps = $.extend({
                //content holder(Object || css Selector)
                renderTo: $(document.body),
                //whether the slider can be dragged
                enable: true,
                //'max' or 'min'
                initPosition: 'max',
                //width of bar and slider
                size: { barWidth: 200, sliderWidth: 5 },
                //class name of bar
                barCssName: 'defaultbar',
                //class name of completed bar
                completedCssName: 'jquery-completed',
                //class name of slider
                sliderCssName: 'jquery-jslider',
                //class name of slider when mouse over
                sliderHover: 'jquery-jslider-hover',
                //fired when the users are dragging the slider
                onChanging: function() { },
                //fired when the users doppped the slider
                onChanged: function() { }
            }, setting);
            
            ps.renderTo = (typeof ps.renderTo == 'string' ? $(ps.renderTo) : ps.renderTo);

            /* ---------->
            html tree:
            <div> ---->sliderbar
            <div>&nbsp;</div>   ----> completed bar
            <div>&nbsp;</div>   ----> slider                  
            </div>
            <-----------*/
            var sliderbar = $('<div><div>&nbsp;</div><div>&nbsp;</div></div>')
                                .attr('class', ps.barCssName)
                                    .css('width', ps.size.barWidth)
                                        .appendTo(ps.renderTo);

            var completedbar = sliderbar.find('div:eq(0)')
                                    .attr('class', ps.completedCssName);

            var slider = sliderbar.find('div:eq(1)')
                            .attr('class', ps.sliderCssName)
                                .css('width', ps.size.sliderWidth);

            var bw = sliderbar.width(), sw = slider.width();
            //make sure that the slider was displayed in the bar(make a limited)
            ps.limited = { min: 0, max: bw - sw };

            if (typeof window.$sliderProcess == 'undefined') {
                window.$sliderProcess = new Function('obj1', 'obj2', 'left',
                                                 'obj1.css(\'left\',left);obj2.css(\'width\',left);');
            }
            $sliderProcess(slider, completedbar, eval('ps.limited.' + ps.initPosition));

            //drag and drop
            var slide = {
                drag: function(e) {
                    var d = e.data;
                    var l = Math.min(Math.max(e.pageX - d.pageX + d.left, ps.limited.min), ps.limited.max);

                    $sliderProcess(slider, completedbar, l);
                    //push two parameters: 1st:percentage, 2nd: event
                    ps.onChanging(l / ps.limited.max, e);
                },
                drop: function(e) {
                    slider.removeClass(ps.sliderHover);
                    //push two parameters: 1st:percentage, 2nd: event
                    ps.onChanged(parseInt(slider.css('left')) / ps.limited.max, e);

                    $(window).unbind('mousemove', slide.drag).unbind('mouseup', slide.drop);
                }
            };

            if (ps.enable) {
                //bind events
                slider.bind('mousedown', function(e) {
                    var d = {
                        left: parseInt(slider.css('left')),
                        pageX: e.pageX
                    };
                    $(this).addClass(ps.sliderHover);
                    $(window).bind('mousemove', d, slide.drag)
                    $(window).bind('mouseup', d, slide.drop);
                });
            }
            slider.data = { bar: sliderbar, completed: completedbar };
            return slider;
        },
        ///<summary>
        /// set slider value
        ///</summary>
        ///<param name="v">percentage, must be a Float variable between 0 and 1</param>
        ///<param name="v">callback Function</param>
        setSliderValue: function(v, callback) {
            try {
                //validate
                if (typeof v == 'undefined' || v < 0 || v > 1) {
                    throw new Error('\'v\' must be a Float variable between 0 and 1.');
                }

                var s = this;

                //validate 
                if (typeof s == 'undefined' ||
                    typeof s.data == 'undefined' ||
                        typeof s.data.bar == 'undefined') {
                    throw new Error('You bound the method to an object that is not a slider!');
                }

                $sliderProcess(s, s.data.completed, v * (s.data.bar.width()-5));

                if (typeof callback != 'undefined') { callback(v); }
            }
            catch (e) {
                alert(e.message);
            }
        }
    });
})(jQuery);
