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
  var pluginName = 'numberSpinner', // the name of the plugin
    a = {
      aCs: 'aria-controls',
      t: 'true',
      f: 'false'
    },
    count = 0,
    win = $(window);


  //-----------------------------------------
  //Private functions

  /*
   * set id of the element passed along
   * if the element does not have one
   * and return the id of the element
   */
  function setId(element, idPrefix, idSuffix) {
    if (!element.is('[id]')) {
      element.attr('id', idPrefix + idSuffix);
    }
    return element.attr('id');
  }


  //-----------------------------------------
  // The actual plugin constructor
  function NumberSpinner(element, userSettings) {
    var self = this;
    self.settings = $.extend({}, $.fn[pluginName].defaultSettings, userSettings);
    self.element = $(element); //the  element
    self.subtractBtn = self.element.find('.' + self.settings.subtractBtnClass) || null;
    self.sumBtn = self.element.find('.' + self.settings.sumBtnClass) || null;
    self.inputField = self.element.find('.' + self.settings.inputFieldClass);
    self.inputFieldVal = parseInt(self.inputField.val()) || 0;

    //call init
    self.init();
  }

  // Avoid Plugin.prototype conflicts
  $.extend(NumberSpinner.prototype, {
    init: function () {
      var self = this,
        settings = self.settings,
        inputFieldId = setId(self.inputField, self.inputFieldIdPrefix, count);//set id on input

      self.calculateMinAndMax();

      //bind event listeners
      if (self.subtractBtn !== null) {
        self.subtractBtn.attr(a.aCs, inputFieldId);

        self.subtractBtn.on('click.' + pluginName, function (event) {
          self.subtract(event);
        });
      }
      if (self.sumBtn !== null) {
        self.sumBtn.attr(a.aCs, inputFieldId);

        self.sumBtn.on('click.' + pluginName, function (event) {
          self.sum(event);
        });
      }
      self.inputField.on('change.' + pluginName, function (event) {
        var prevValue = self.inputFieldVal,
          currentValue = parseInt(self.inputField.val()) || 0,
          evName = "sum";

        if (currentValue < settings.min) {
          self.inputFieldVal = settings.min;
          self.element.trigger('corrected.' + pluginName);
        } else if (currentValue > settings.max) {
          self.inputFieldVal = settings.max;
          self.element.trigger('corrected.' + pluginName);
        } else {
          self.inputFieldVal = currentValue;
        }

        if (prevValue > self.inputFieldVal) {
          evName = "subtract";
        }

        self.inputField.val(self.inputFieldVal);
        self.element.trigger('changed.' + pluginName, [evName, self.inputFieldVal - prevValue]);
      });
    },
    calculateMinAndMax: function () {
      if (typeof this.settings.min === 'function') {
        var min = parseInt(this.settings.min(this.element), 10) || 0;
        this.settings.min = min;
      }

      if (typeof this.settings.max === 'function') {
        var max = parseInt(this.settings.max(this.element), 10) || 9999;
        this.settings.max = max;
      }
    },
    updateRange: function (minAndMax) {
      var self = this;
      if (typeof minAndMax === 'object') {
        if (typeof minAndMax.min === 'number') {
          self.settings.min = minAndMax.min;
          self.inputField.attr('min', minAndMax.min);
        }
        if (typeof minAndMax.max === 'number') {
          self.settings.max = minAndMax.max;
          self.inputField.attr('max', minAndMax.max);
        }
      }
    },
    subtract: function (event) {
      var self = this,
        settings = self.settings,
        offset = event.shiftKey ? settings.bigOffset : settings.defaultOffset,
        updatedFieldValue = self.inputFieldVal - offset;


      if (updatedFieldValue < settings.min) {
        self.inputField.val(settings.min);
        self.inputFieldVal = settings.min;
        offset = 0;
        self.element.trigger('corrected.' + pluginName);
      } else if (updatedFieldValue > settings.max) {
        self.inputField.val(settings.max);
        self.inputFieldVal = settings.max;
        offset = 0;
        self.element.trigger('corrected.' + pluginName);
      } else {
        self.inputField.val(updatedFieldValue);
        self.inputFieldVal = updatedFieldValue;
      }
      self.element.trigger('changed.' + pluginName, ["subtract", -offset]);
    },
    sum: function (event) {
      var self = this,
        settings = self.settings,
        offset = event.shiftKey ? settings.bigOffset : settings.defaultOffset,
        updatedFieldValue = self.inputFieldVal + offset;


      if (updatedFieldValue > settings.max) {
        self.inputField.val(settings.max);
        self.inputFieldVal = settings.max;
        offset = 0;
        self.element.trigger('corrected.' + pluginName);
      } else if (updatedFieldValue < settings.min) {
        self.inputField.val(settings.min);
        self.inputFieldVal = settings.min;
        offset = 0;
        self.element.trigger('corrected.' + pluginName);
      } else {
        self.inputField.val(updatedFieldValue);
        self.inputFieldVal = updatedFieldValue;
      }
      self.element.trigger('changed.' + pluginName, ["sum", offset]);

    },
    set: function (val) {
      var self = this,
        settings = self.settings;
      if (val >= settings.min && val <= settings.max) {
        self.inputFieldVal = val;
        self.inputField.val(self.inputFieldVal);
        self.element.trigger('set.' + pluginName);
      } else {
        throw new Error('The value is out of the allowed range.');
      }
    },
    reset: function () {
      var self = this;
      self.inputFieldVal = self.settings.min;
      self.inputField.val(self.inputFieldVal);
      self.element.trigger('reset.' + pluginName);
    },
    disableOrEnable: function (value) {
      if (typeof value === "boolean") {
        var self = this,
          actionType = !value ? 'enabled' : 'disabled';

        self.inputField.prop('disabled', value);
        if (self.sumBtn !== null) {
          self.sumBtn.prop('disabled', value);
        }
        if (self.subtractBtn !== null) {
          self.subtractBtn.prop('disabled', value);
        }
        self.element.trigger(actionType + '.' + pluginName);
      }
    },
    methodCaller: function (methodName, arg) {
      var self = this;
      switch (methodName) {
        case 'reset':
          self.reset();
          break;
        case 'set':
          self.set(arg);
          break;
        case 'updateRange':
          self.updateRange(arg);
          break;
        case 'disable':
          self.disableOrEnable(true);
          break;
        case 'enable':
          self.disableOrEnable(false);
          break;
      }
    }
  });


  // A really lightweight plugin wrapper around the constructor,
  // preventing against multiple instantiations
  $.fn[pluginName] = function (userSettings, arg) {
    return this.each(function () {
      var self = this;
      /*
       * If following conditions matches, then the plugin must be initialsied:
       * Check if the plugin is instantiated for the first time
       * Check if the argument passed is an object or undefined (no arguments)
       */
      if (!$.data(self, 'plugin_' + pluginName) && (typeof userSettings === 'object' || typeof userSettings === 'undefined')) {
        $.data(self, 'plugin_' + pluginName, new NumberSpinner(self, userSettings));
      } else if (typeof userSettings === 'string') {
        $.data(self, 'plugin_' + pluginName).methodCaller(userSettings, arg);
      }
    });
  };

  //Define default settings
  $.fn[pluginName].defaultSettings = {
    subtractBtnClass: 'js--numberSpinner__subtract',
    sumBtnClass: 'js--numberSpinner__sum',
    inputFieldClass: 'js--numberSpinner__input',
    inputFieldIdPrefix: 'inputSpinner',
    defaultOffset: 1,
    bigOffset: 10,
    min: 0,
    max: 100
  };
}));