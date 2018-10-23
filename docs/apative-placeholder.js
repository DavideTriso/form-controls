/* MIT License

Copyright (c) 2018 Davide Trisolini

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
 
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. */

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory); //AMD 
    } else if (typeof exports === 'object') {
        module.exports = factory(require('jquery')); //CommonJS
    } else {
        factory(jQuery, window);
    }
}(function ($, window) {
    'use strict';
    var pluginName = 'adaptivePlaceholder'; // the name of the plugin

    // -----------------------------------------
    // The actual plugin constructor
    function AdaptivePlaceholder(element, userSettings) {
        var self = this;
        self.settings = $.extend({}, $.fn[pluginName].defaultSettings, userSettings);
        self.element = $(element);
        self.label = self.element.find('.' + self.settings.labelClass);
        self.field = self.element.find('.' + self.settings.controlFieldClass);


        self.field.on('focus.' + pluginName, function () {
            self.label.addClass(self.settings.labelActiveClass);
        });

        self.field.on('blur.' + pluginName, function () {
            if (!self.field.val()) {
                self.label.removeClass(self.settings.labelActiveClass);
            }
        });
    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function (userSettings, methodArg) {
        return this.each(function () {
            var self = this;
            /*
             * If following conditions matches, then the plugin must be initialsied:
             * Check if the plugin is instantiated for the first time
             * Check if the argument passed is an object or undefined (no arguments)
             */
            if (!$.data(self, 'plugin_' + pluginName) && (typeof userSettings === 'object' || typeof userSettings === 'undefined')) {
                $.data(self, 'plugin_' + pluginName, new AdaptivePlaceholder(self, userSettings));
            }
        });
    };

    $.fn[pluginName].defaultSettings = {
        labelClass: 'control__label',
        labelActiveClass: 'control__label_active',
        controlFieldClass: 'control__field'
    };
}));
