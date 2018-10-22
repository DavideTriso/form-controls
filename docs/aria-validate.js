/* MIT License

Copyright (c) 2017 Davide Trisolini

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
  var pluginName = 'ariaValidate', // the name of the plugin
    a = {
      r: 'role',
      aHi: 'aria-hidden',
      aLi: 'aria-live',
      aRe: 'aria-relevant',
      aAt: 'aria-atomic',
      aErM: 'aria-errormessage',
      aInv: 'aria-invalid',
      aOw: 'aria-owns',
      req: 'required',
      dV: 'data-ariavalidate-value',
      t: 'true',
      f: 'false'
    },
    count = 0,
    win = $(window);

  // -----------------------------------------
  //Private functions

  /*
   * set id of the element passed along
   * if the element does not have one
   * and return the id of the element
   * If no suffix is passed, then do not set it
   */
  function setId(element, idPrefix, idSuffix) {
    idSuffix = idSuffix !== undefined
      ? idSuffix
      : '';

    if (!element.is('[id]')) {
      element.attr('id', idPrefix + idSuffix);
    }
    return element.attr('id');
  }

  /*
   * Return merged settings object, if user passed valid custom settings,
   * else if settings === false, return unchanged default settings object
   */
  function makeSettings(defaultSettings, userSettings) {
    if (userSettings) {
      return $.extend({}, defaultSettings, userSettings);
    }
    return defaultSettings;
  }

  /*
   * Build strings of namespaced event
   */
  function namespaceEventString(eventsString, namesapce) {
    var events = eventsString.split(' '), //split events list array
      eventsLenght = events.length,
      namespacedEvents = '';

    for (var i = 0; i < eventsLenght; i++) {
      namespacedEvents = namespacedEvents + ' ' + events[i] + '.' + namesapce;
    }

    return String(namespacedEvents);
  }

  /*
   * Convert date from mdy format (MM/DD/YYYY), dmy format(DD/MM/YYYY) or ymd format (YYYY/MM/DD) to ISO format
   */
  function convertDateToIso(value, format, separator) {
    /*
     * Check if date is already in ISO format or is empty,
     * and return unchanged value if true.
     */
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    /*
     * Date is not in ISO format and is not empty.
     * We have to try to convert it in ISO format
     * 1 - Split in array
     * 2 - Check if array length is 3 and check the length of each entry (should be: 2,2,4 or 4,2,2).
     * 2 - Reconstruct date by repositioning day, month and year based on regioin settings and change date separator (-)
     */
    value = value.split(separator);
    if (value.length === 3) {
      if (value[0].length === 2 && value[1].length === 2 && value[2].length === 4) {
        if (format === 'dmy') {
          value = value[2] + '-' + value[1] + '-' + value[0];
        } else if (format === 'mdy') {
          value = value[2] + '-' + value[0] + '-' + value[1];
        }
        return value;
      } else if (value[0].length === 4 && value[1].length === 2 && value[2].length === 2 && format === 'ymd') {
        value = value[0] + '-' + value[1] + '-' + value[2];
        return value;
      }
    }

    // if it is not possible to convert the date, then return false.
    return false;
  }

  /*
   * Calculate date with or without offset starting from an ISO-formatted date
   * (for maxDate and minDate validation functions)
   */
  function calculateDate(param, dateFormat, dateSeparator) {
    if (param.bindToElement) {
      var offset = param.offset || 0,
        date = param.bindToElement.attr(a.dV) || param.bindToElement.val();

      date = date !== ''
        ? date
        : param.fallbackDate; // check if element is empty and if empty use fallback date as starting point to calculate offset

      date = convertDateToIso(date, dateFormat, dateSeparator);
      date = new Date(date);
      date = date.setDate(date.getDate() + offset);

      return date;
    }

    //No offset was passed, just a jquery element
    //Retrive date from element and convert to ISO
    var date = param.attr(a.dV) || param.val();
    return convertDateToIso(param, dateFormat, dateSeparator);
  }

  /*
   * Convert time to ISO format
   */
  function convertTimeToIso(value, timeFormat, timeSeparator, ampm) {
    value = value.split(timeSeparator);

    if (value.length !== 2) {
      return false;
    }

    if (timeFormat === '12') {
      if (typeof ampm === 'function') {
        ampm = ampm();
      } else if (typeof ampm === 'object') {
        ampm = ampm.attr(a.dV) || ampm.val();
      } else {
        if (value[1].length <= 5 || value[1].length >= 4) {
          ampm = value[1].slice(-2).toLowerCase();
          ampm = ampm === 'am' || ampm === 'pm'
            ? ampm
            : false;
          value[1] = value[1].slice(0, 2);
        } else {
          return false;
        }
      }
    }

    if (/^\d{2}$/.test(value[0]) === false || /^\d{2}$/.test(value[1]) === false) {
      return false;
    }

    value[0] = parseInt(value[0], 10);

    if (timeFormat === '12') {
      if (!ampm || (ampm === 'am' && value[0] === 12) || (ampm === 'pm' && value[0] === 0) || value[0] > 12) {
        return false;
      } else if (ampm === 'pm' && value[0] < 12) {
        value[0] = value[0] + 12;
      }
    }
    return value[0] + ':' + value[1];
  }

  /*
   * Calculate minLenght and maxLenght with or without offset starting from object or array
   * (for maxLength and minLength validation functions)
   */
  function calculateLength(param) {
    if (param.element) {
      var offset = param.offset || 0;
      param = param.element.attr(a.dV) !== ''
        ? param.element.attr(a.dV).length
        : param.element.val().length;
      return param + offset;
    }
    param = param.attr(a.dV).length || param.val().length
    return param;
  }

  /*
   * Calculate min and max with or without offset starting from object or array
   * (for max and min validation functions)
   */
  function calculateNumber(param) {
    if (param.element) {
      var offset = param.offset || 0;
      param = param.element.attr(a.dV) || param.element.val();

      return parseFloat(param, 10) + offset;
    }

    param = param.attr(a.dV) || param.val();
    return parseFloat(param, 10);
  }

  // -----------------------------------------
  // The actual plugin constructor
  function AriaValidate(element, userSettings) {
    var self = this;

    self.element = $(element);

    //DEFAULT SETTINGS
    self.userSettings = userSettings; //the unchanged settings object passed from user
    self.behaviour = self.userSettings.behaviour;

    //CLASSES
    self.classes = makeSettings($.fn[pluginName].defaultClasses, self.userSettings.classes); //computed html classes used to retrive elements

    //REGION SETTINGS
    self.regionSettings = makeSettings($.fn[pluginName].defaultRegionSettings, self.userSettings.regionSettings);

    //VALIDATION
    self.fieldStatus = undefined; //Describes the staus of the field: undefined -> field was never focussed and validated, true -> correct input , 'errorCode' -> incorrect input
    self.isDirty = false; // a field is considered dirty after first interaction, this means on blur or on change for some other fields
    //self.fieldValue = undefined; The value of the field
    //self.adding = undefined; On each field value update, check if user is adding or removing text from field (last value length is greater or smaller than new value length?) - true -> adding, false -> removing, undefined -> not changed or field value has no length (is radio, checkbox etc...)

    //MESSAGES
    self.errorMsgs = makeSettings($.fn[pluginName].defaultErrorMsgs, self.userSettings.errorMsgs); //computed error messages settings for this field;
    self.successMsg = self.userSettings.successMsg
      ? self.userSettings.successMsg
      : $.fn[pluginName].defaultSuccessMsg; //Success message for this field

    //REGISTERED EVENTS
    //keep track of event listeners added to field
    self.eventListeners = [];

    // -----------------------------------
    //Initialise field
    self.selectElements(); //get all the needed elements to interact with from dom
    self.initMarkup(); //add needed attributes and check markup
    self.manageDirty(); //check for first interaction with field and mark as dirty after
    self.addBehaviour(); //bind validation functions to the event listeners
    self.updateFieldValue(); // get the current field value
  };

  // Avoid Plugin.prototype conflicts
  $.extend(AriaValidate.prototype, {
    // -------------------------------------------------------------
    //Initialise field
    // -------------------------------------------------------------
    selectElements: function () {
      var self = this,
        classes = self.classes,
        element = self.element;

      /*
       * Retrive all the elements needed to buil up a field group.
       *
       * Because alert and successbox are not mandatory fields,
       * we check if the boxes are present in markup, and if not we set the variable to false.
       *
       * We also retrive the tag name of the field and, if the field is input, the value of the attribute type.
       * We need this information to bind the correct event listener to the field for validation (change / input).
       */

      self.field = element.find('.' + classes.fieldClass); //length could be > 1 in case of radio
      self.label = element.find('.' + classes.labelClass); //length could be > 1 in case of radio
      self.alertbox = element.find('.' + classes.alertboxClass).length === 1
        ? element.find('.' + classes.alertboxClass)
        : false;
      self.successbox = element.find('.' + classes.successboxClass).length === 1
        ? element.find('.' + classes.successboxClass)
        : false;
      self.fakeField = classes.fieldClassElement !== false
        ? element.find(classes.fieldClassElement)
        : false;

      /*
       * If only one field is present inside of the field group,
       * then retrive TagName, fieldType  and fieldName for the field
       */
      if (self.field.length === 1) {
        self.fieldTag = self.field.prop('tagName');
        self.fieldType = self.fieldTag === 'INPUT'
          ? self.field.attr('type')
          : false;
        self.fieldName = self.userSettings.fieldName || self.field.attr('name');
      } else if (self.field.length > 1 && self.field.first().attr('type') === 'radio') {
        //Set values for radio button
        self.fieldTag = 'INPUT';
        self.fieldType = 'radio';
        self.fieldName = self.userSettings.fieldName || $(self.field[0]).attr('name');
      } else {
        throw new Error('There is something wrong with your markup');
      }
    },
    initMarkup: function () {
      /*
       * Check the markup.
       * We have to check if:
       * 1 - input has an id (otherwise set a scripting-generated id)
       * 2 - a label is present and the id of the input is referenced in the 'for' attribute of the label (otherwise set for attribute)
       * 3 - an alertbox (wrapper for alert messages) is present and has an id. Alertbox is not mandatory.
       * 4 - a successbox (wrapper for success messages) is present and has an id. Succesbox is not mandatory.
       *
       */
      var self = this,
        elementId = setId(self.element, self.classes.controlIdPrefix, count),
        fieldId = '',
        alertboxId = self.alertbox !== false
          ? setId(self.alertbox, elementId + '__alertbox')
          : false,
        successboxId = self.successbox !== false
          ? setId(self.successbox, elementId + '__successbox')
          : false;

      if (self.fieldType !== 'radio') {
        //Not radio
        fieldId = setId(self.field, elementId + '__input');

        //check if 'for' attribute is correctly set on label
        if (!self.label.is('[for="' + fieldId + '"]')) {
          self.label.attr('for', fieldId);
        }

      } else {
        //Radio buttons
        fieldId = [];

        self.field.each(function (index) {
          var currentField = $(this);
          fieldId.push(setId(currentField, (elementId + '__input' + '-' + index)));

          //check if 'for' attribute is correctly set on label
          if (!currentField.is('[for="' + fieldId[index] + '"]')) {
            $(self.label[index]).attr('for', fieldId[index]);
          }
        });
      }

      //add accessibility attributes to fieldbox, if the element exists
      if (self.alertbox) {
        self.field.attr(a.aErM, alertboxId);

        self.alertbox.attr(a.r, 'alert').attr(a.aLi, 'assertive').attr(a.aRe, 'additions text').attr(a.aAt, a.t).attr(a.aHi, a.t);
      }

      //add accessibility attributes to successbox, if the element exists
      if (self.successbox) {
        self.field.attr(a.aOw, successboxId);

        self.successbox.attr(a.aLi, 'polite').attr(a.aRe, 'additions text').attr(a.aAt, a.t).attr(a.aHi, a.t);
      }

      //trigger custom event on window for user to listen for
      win.trigger(pluginName + '.markupInitialised', [self]);

      //increment count by one
      count = count + 1;
    },
    manageDirty: function () {
      /*
       * Set field as dirty when after value is changed once.
       * Different field type need to be treated differently:
       * color, range, select  - > set as dirty after change event is fired for the first time.
       * all other fields - > set as dirty after blur event is fired for the first time
       */
      var self = this,
        fieldType = self.fieldType,
        dirtyEvent = 'blur';

      if (self.fieldTag === 'SELECT' || fieldType === 'color' || fieldType === 'range') {
        dirtyEvent = 'change';
      }

      self.field.one(dirtyEvent + '.dirty.' + pluginName, function () {
        self.isDirty = true;
        win.trigger(pluginName + '.markedAsDirty', [self]);
      });
    },
    addBehaviour: function () {
      var self = this,
        behaviour = self.behaviour,
        behaviourLength = behaviour.length;

      for (var i = 0; i < behaviourLength; i++) {
        self.bindEventListeners(behaviour[i]);
      }

      //trigger custom event on window for user to listen for
      win.trigger(pluginName + '.behaviourAdded', [self]);
    },
    bindEventListeners: function (currentBehaviour) {
      var self = this,
        events = namespaceEventString(currentBehaviour.event, pluginName),
        validateRules = currentBehaviour.validate || false,
        main = currentBehaviour.main || false, //check if current behaviour is set as 'main behaviour'
        dirty = currentBehaviour.dirty, // check if current behaviour is flaged as dirty (perform validation rules only if field is already marked as dirty)
        eventsArray = events.trim().split(' '),
        eventsArrayLength = eventsArray.length;

      //Keep track of registered event listeners
      for (var i = 0; i < eventsArrayLength; i++) {
        self.eventListeners.push(eventsArray[i]);
      }

      //Bind event listeners to field
      self.field.on(events, function (events) {
        if (validateRules) {
          self.performValidation(validateRules, main, dirty);
        }
      });
    },
    unbindEventListeners: function (events) {
      var self = this,
        events = namespaceEventString(events, pluginName),
        eventsArray = events.trim().split(' '),
        eventsLength = eventsArray.length;

      self.field.off(events);

      //remove event entry from events array
      for (var i = 0; i < eventsLength; i++) {
        self.eventListeners.splice(self.eventListeners.indexOf(eventsArray[i]), 1);
      }
      //trigger custom event on window for user to listen for
      win.trigger(pluginName + '.eventListenersRemoved', [self]);
    },
    updateFieldValue: function () {
      var self = this;

      if (self.fieldType === 'checkbox') {
        //checkbox
        self.fieldValue = self.field.prop('checked');
      } else if (self.fieldType === 'radio') {
        //radio
        self.fieldValue = self.field.filter(':checked').length === 1
          ? self.field.filter(':checked').val()
          : false;
      } else {

        var oldLength = self.fieldValue !== undefined
          ? self.fieldLength
          : undefined; // current length of field value

        self.fieldValue = self.field.val() || ''; //new value
        self.fieldLength = self.fieldValue.length; //value length

        //determin if user is adding or removing text
        if (oldLength < self.fieldValue.length) {
          self.adding = true;
        } else {
          self.adding = false;
        }
      }
      /*
       * Save the user input in attribute data-ariavalidate-valueue.
       * Maybe useful for some external plugin
       */
      self.field.attr(a.dV, self.fieldValue);
    },
    performValidation: function (validationRules, main, dirty) {
      /*
       * Perform validation on the field:
       * Call each validation function passed from user for validation.
       * If function returns true, proceed, else throw error and exit execution.
       * If no function returns errors, then validate the field by calling self.validateControl().
       */
      var self = this;

      //retrive current field value and update self.fieldValue
      self.updateFieldValue();

      /*
       * Check value of dirty
       * If dirty is set to true, then the validation should be performed only when self.isDirty is true
       * If dirty is set to false, then the validation should be performed only when self.isDirty is false (only if field is untouched)
       * If dirty is undefined validate
       */
      if (dirty !== undefined && ((dirty && !self.isDirty) || (!dirty && self.isDirty))) {
        return;
      }

      //loop through all validation functions
      for (var key in validationRules) {
        //update field status
        var fieldStatus = $.fn[pluginName].validateFunctions[key](self.fieldValue, validationRules[key], self.regionSettings);
        /*
         * If field status is false, invalidate the field group
         * and show the error message relative to the error encountered while validationg
         * by calling invalidateControl
         */
        if (fieldStatus !== true) {
          self.fieldStatus = fieldStatus;
          self.invalidateControl();
          return;
        }
      }

      /*
       * No error occured:
       * validate field group if this is main behaviour,
       * otherwise reset field group
       */
      self.fieldStatus = true;

      if (main) {
        self.validateControl();
      } else {
        self.resetControl();
      }
    },
    invalidateControl: function () {
      var self = this,
        classes = self.classes;

      //add error classes to field group and remove valid classes
      self.element.removeClass(classes.controlValidClass).addClass(classes.controlErrorClass);

      //add error classes to field and remove valid classes
      self.field.attr(a.aInv, a.t).removeClass(classes.fieldValidClass).addClass(classes.fieldErrorClass);

      //fake field
      if (self.fakeField) {
        self.fakeField.removeClass(classes.fieldValidClass).addClass(classes.fieldErrorClass);
      }

      //add error classes to label and remove valid classes
      self.label.removeClass(classes.labelValidClass).addClass(classes.labelErrorClass);

      //hide successbox and remove the success message
      if (self.successbox) {
        self.successbox.attr(a.aHi, a.t).removeClass(classes.successboxVisibleClass);
      }

      //append error message to alertbox and show alert
      if (self.alertbox && self.fieldStatus !== true) {
        self.alertbox.html(self.errorMsgs[self.fieldStatus]).attr(a.aHi, a.f).addClass(classes.alertboxVisibleClass);
      }

      //trigger custom event on window for user to listen for
      win.trigger(pluginName + '.isInvalid', [self]);
    },
    validateControl: function () {
      var self = this,
        classes = self.classes;

      //remove error classes and add valid classes to field group
      self.element.removeClass(classes.controlErrorClass).addClass(classes.controlValidClass);

      //remove error classes and add valid classes to field
      self.field.attr(a.aInv, a.f).removeClass(classes.fieldErrorClass).addClass(classes.fieldValidClass);

      //fake field
      if (self.fakeField) {
        self.fakeField.removeClass(classes.fieldErrorClass).addClass(classes.fieldValidClass);
      }

      //remove error classes and add valid classes to label
      self.label.removeClass(classes.labelErrorClass).addClass(classes.labelValidClass);

      //remove error message from alertbox and hide alertbox
      if (self.alertbox) {
        self.alertbox.attr(a.aHi, a.t).removeClass(classes.alertboxVisibleClass);
      }

      //Append success message to succesbox and show message
      if (self.successbox && self.successMsg !== false) {
        self.successbox.html(self.successMsg).attr(a.aHi, a.f).addClass(classes.successboxVisibleClass);
      }

      //trigger custom event on window for user to listen for
      win.trigger(pluginName + '.isValid', [self]);
    },
    resetControl: function () {
      var self = this,
        classes = self.classes;

      //remove error and valid classes from element
      self.element.removeClass(classes.controlErrorClass).removeClass(classes.controlValidClass);

      //remove error and valid classes from field
      self.field.removeAttr(a.aInv).removeClass(classes.fieldErrorClass).removeClass(classes.fieldValidClass);

      //fake field
      if (self.fakeField) {
        self.fakeField.removeClass(classes.fieldErrorClass).removeClass(classes.fieldValidClass);
      }

      //remove error and valid classes from label
      self.label.removeClass(classes.labelErrorClass).removeClass(classes.labelValidClass);

      //remove error message from alertbox and hide alertbox
      if (self.alertbox) {
        self.alertbox.attr(a.aHi, a.t).removeClass(classes.alertboxVisibleClass);
      }

      //remove success message from alertbox and hide alertbox
      if (self.successbox && self.successMsg !== false) {
        self.successbox.attr(a.aHi, a.t).removeClass(classes.successboxVisibleClass);
      }

      //trigger custom event on window for user to listen for
      win.trigger(pluginName + '.resetted', [self]);
    },
    destroy: function () {
      var self = this;

      //Unbind event listeners
      self.field.off(self.eventListeners.join(' '));

      //reset control
      self.resetControl();

      //remove attributes
      self.field.removeAttr(a.aErM).removeAttr(a.aOw).removeAttr(a.dV);

      self.alertbox.removeAttr(a.r).removeAttr(a.aLi).removeAttr(a.aRe).removeAttr(a.aAt).removeAttr(a.aHi);

      if (self.successbox) {
        self.successbox.removeAttr(a.aLi).removeAttr(a.aRe).removeAttr(a.aAt).removeAttr(a.aHi);
      }

      //Remove jQuery.data
      self.element.removeData('plugin_' + pluginName);
    },
    // -------------------------------------------------------------
    //Method caller
    // -------------------------------------------------------------
    methodCaller: function (methodName, methodArg) {
      var self = this;
      //@TODO: test
      switch (methodName) {
        case 'updateFieldValue':
          self.updateFieldValue();
          break;
        case 'unbindEventListeners':
          self.unbindEventListeners(methodArg);
          break;
        case 'setDirty':
          self.isDirty = true;
          break;
        case 'destroy':
          self.destroy();
          break;
        case 'invalidateControl':
          self.invalidateControl();
          break;
        case 'validateControl':
          self.validateControl();
          break;
        case 'resetControl':
          self.resetControl();
          break;
      }
    }
  });

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
        $.data(self, 'plugin_' + pluginName, new AriaValidate(self, userSettings));
      } else if (typeof userSettings === 'string') {
        $.data(self, 'plugin_' + pluginName).methodCaller(userSettings, methodArg);
      }
    });
  };

  $.fn[pluginName].defaultClasses = {
    controlIdPrefix: 'control--',
    controlValidClass: 'control_success',
    controlErrorClass: 'control_error',
    fieldClass: 'control__field',
    fieldErrorClass: 'control__field_error',
    fieldValidClass: 'control__field_valid',
    fieldClassElement: false,
    labelClass: 'control__label',
    labelErrorClass: 'control__label_error',
    labelValidClass: 'control__label_valid',
    alertboxClass: 'control__feedback_error',
    successboxClass: 'control__feedback_valid',
    alertboxVisibleClass: 'control__feedback_visible',
    successboxVisibleClass: 'control__feedback_visible'
  };

  $.fn[pluginName].defaultRegionSettings = {
    dateFormat: 'dmy', // dmy = dd/mm/yyyy, mdy = mm/dd/yyyy, ymd = yyyy/mm/dd
    dateSeparator: '/', // / or - or .
    timeFormat: '24', //'24' or '12'
    timeSeparator: ':',
    decimalSeparator: ','
  }; // , or .

  $.fn[pluginName].defaultErrorMsgs = {
    letters: 'Digits are not allowed in this field',
    onlyLetters: 'Only letters are allowed',
    digits: 'Letters are not allowed in this field',
    onlyDigits: 'Only digits are allowed',
    int: 'Enter a whole number (e.g. 12)',
    float: 'Enter a number (e.g. 12.168 or 16)',
    bool: 'You must check this checkbox',
    date: 'Not a valid date',
    time: 'Not a valid time',
    minDate: 'The date entered is too far in the past',
    maxDate: 'The date entered is too far in the future',
    email: 'Enter a valid email address',
    password: 'Password is not secure',
    min: 'The entered number is too small',
    max: 'The entered number is too big',
    minLength: 'The length of the input is too short',
    maxLength: 'Field length exceeds the maximum number of chars allowed',
    required: 'This field is required to successfully complete the form',
    tokens: 'Please choose a value from the list',
    match: 'No match',
    customRegex: 'Regex match returned "false"',
    ajax: 'server says no!',
    ajaxError: 'Server error.'
  };

  $.fn[pluginName].defaultSuccessMsg = 'Perfect! You told us exactly what we wanted to know!';

  // ------------------------------------------------------
  //VALIDATION
  $.fn[pluginName].validateFunctions = {
    /*
     * Validation functions:
     * Arguments:
     * fieldValue -> value of the field
     * param (not every functions needs this argument) -> value for validation passed from author
     * regionSettings (not every functions needs this argument) -> the computed region settings
     *
     * Output:
     * true if valid,
     * name of error if not valid (e.g.: 'email', if e-mail is not valid)
     */

    letters: function (fieldValue) {
      //Check if value does not contain any digit (0-9)
      return /^[\D]*$/.test(fieldValue)
        ? true
        : 'letters';
    },
    onlyLetters: function (fieldValue) {
      //Check if value contains only letters (a-z, A-Z)
      return /^[a-zA-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏàáâãäåæçèéêëìíîïÐÑÒÓÔÕÖØÙÚÛÜÝÞßðñòóôõöøùúûüýþÿ]*$/.test(fieldValue)
        ? true
        : 'onlyLetters';
    },
    digits: function (fieldValue) {
      //Check if value contains any letters (a-z, A-Z)
      return /^[^a-zA-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏàáâãäåæçèéêëìíîïÐÑÒÓÔÕÖØÙÚÛÜÝÞßðñòóôõöøùúûüýþÿ]*$/.test(fieldValue)
        ? true
        : 'digits';
    },
    onlyDigits: function (fieldValue) {
      //Check if value is digit (0-9)
      return /^[\d]*$/.test(fieldValue)
        ? true
        : 'onlyDigits';
    },
    int: function (fieldValue) {
      //check if value is number and int
      if (fieldValue === '') {
        return true;
      }

      fieldValue = parseInt(fieldValue, 10);

      return Number.isInteger(fieldValue)
        ? true
        : 'int';
    },
    float: function (fieldValue, param, regionSettings) {

      if (fieldValue === '') {
        return true;
      }

      /*
       * Chek format: comma or dot as separator?
       */
      var separator = regionSettings,
        dotTest = fieldValue.split('.'),
        commaTest = fieldValue.split(',');

      if ((dotTest.length > 2 && separator === '.') || (commaTest.length > 2 && separator === ',')) {
        return 'float';
      }

      /*
       * If decimal separator is comma,
       * replace comma with dot in the string before validation,
       * otherwise the value will not parse as float
       */
      if (separator === ',') {
        fieldValue = fieldValue.replace(/,/, '.');
      }

      //chech if number is float
      return !isNaN(fieldValue - parseFloat(fieldValue))
        ? true
        : 'float';
    },
    bool: function (fieldValue) {
      //check if value is true/checked (only for checkbox and radio groups)
      return fieldValue
        ? true
        : 'bool';
    },
    date: function (fieldValue, param, regionSettings) {
      //check if date has ISO date format and is an existing date or 0
      fieldValue = convertDateToIso(fieldValue, regionSettings.dateFormat, regionSettings.dateSeparator);

      //if convertDateToIso returned false, then the date is obviously not valid, throw error
      if (fieldValue === false) {
        return 'date';
      }

      //if fieldValue is not empty ('') we can proceed and validate it
      if (fieldValue !== '') {
        var value = new Date(fieldValue);
        return !isNaN(value.getTime())
          ? true
          : 'date';
      }

      //if fieldValue is empty return true
      return true;
    },
    time: function (fieldValue, param, regionSettings) {
      if (fieldValue === '') {
        return true;
      }

      fieldValue = convertTimeToIso(fieldValue, regionSettings.timeFormat, regionSettings.timeSeparator, param);

      if (!fieldValue) {
        return 'time';
      }

      fieldValue = fieldValue.split(':');

      return fieldValue.length === 2 && parseInt(fieldValue[0], 10) < 24 && parseInt(fieldValue[1], 10) < 60
        ? true
        : 'time';
    },
    minDate: function (fieldValue, param, regionSettings) {

      if (fieldValue === '') {
        return true;
      }

      //if param is a function execute function and retrive date
      if (typeof param == 'function') {
        param = param()
      } else if (typeof param === 'object') {
        /*
         * Bind value of param to other object:
         * If param is an object, we must deduce the value from the passed field
         * by retriving the data-ariavalidate-value attribute or the value of the field
         */
        param = calculateDate(param, regionSettings.dateFormat, regionSettings.dateSeparator);
      }

      //check if date is after the min date passed (ISO format)
      fieldValue = convertDateToIso(fieldValue, regionSettings.dateFormat, regionSettings.dateSeparator);

      return new Date(fieldValue) >= new Date(param)
        ? true
        : 'minDate';
    },
    maxDate: function (fieldValue, param, regionSettings) {
      if (fieldValue === '') {
        return true;
      }
      //if param is a function execute function and retrive date
      if (typeof param === 'function') {
        param = param()
      } else if (typeof param === 'object') {
        /*
         * Bind value of param to other object:
         * If param is an object, we must deduce the value from the passed field
         * by retriving the data-ariavalidate-value attribute or the value of the field
         */
        param = calculateDate(param, regionSettings.dateFormat, regionSettings.dateSeparator);
      }

      //check if date is before the max date passed (ISO format)
      fieldValue = convertDateToIso(fieldValue, regionSettings.dateFormat, regionSettings.dateSeparator);

      return new Date(fieldValue) <= new Date(param)
        ? true
        : 'maxDate';
    },
    minTime: function (fieldValue, param, regionSettings) {
      //
    },
    maxTime: function (fieldValue, param, regionSettings) {
      //
    },
    email: function (fieldValue, param) {
      //chekc if email is valid
      return /^([\w-\.]+@([\w\-]+\.)+[\w\-]{2,4})?$/.test(fieldValue)
        ? true
        : 'email';
    },
    password: function (fieldValue) {
      //check if password is secure
      return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*\.\,\;\:\\\-\|\-\/\(\)\{\}\[\]])(?=.{8,100})/.test(fieldValue)
        ? true
        : 'password';
    },
    min: function (fieldValue, param) {
      if (fieldValue === '') {
        return true;
      }

      /*
       * Retrive value from function, if param is a function
       */
      if (typeof param === 'function') {
        param = param();
      } else if (typeof param === 'object') {
        /*
         * Bind value of param to other object:
         * If param is an object, we must deduce the value from the passed field
         * by retriving the data-ariavalidate-value attribute or the value of the field
         */
        param = calculateNumber(param);
      }

      var value = parseFloat(fieldValue, 10);
      return value >= param
        ? true
        : value === ''
          ? true
          : 'min';
    },
    max: function (fieldValue, param) {
      if (fieldValue === '') {
        return true;
      }
      /*
       * Retrive value from function, if param is a function
       */
      if (typeof param === 'function') {
        param = param();
      } else if (typeof param === 'object') {
        /*
         * Bind value of param to other object:
         * If param is an object, we must deduce the value from the passed field
         * by retriving the data-ariavalidate-value attribute or the value of the field
         */
        param = calculateNumber(param);
      }

      var value = parseFloat(fieldValue, 10);
      return value <= param
        ? true
        : value === ''
          ? true
          : 'max';
    },
    minLength: function (fieldValue, param) {
      //if param is a function, then retrive minLenght value by calling the function
      if (typeof param === 'function') {
        param = param()
      } else if (typeof param === 'object') {
        /*
         * Bind value of param to other object:
         * If param is an object, we must deduce the value from the passed field
         * by retriving the data-ariavalidate-value attribute or the value of the field
         */
        param = calculateLength(param);
      }

      //match values higher than param or 0
      var valueLength = fieldValue.length;
      return valueLength >= param
        ? true
        : valueLength === 0
          ? true
          : 'minLength';
    },
    maxLength: function (fieldValue, param) {
      //if param is a function, then retrive maxLenght value by calling the function
      if (typeof param === 'function') {
        param = param()
      } else if (typeof param === 'object') {
        /*
         * Bind value of param to other object:
         * If param is an object, we must deduce the value from the passed field
         * by retriving the data-ariavalidate-value attribute or the value of the field
         */
        param = calculateLength(param);
      }

      //match values lower than param or 0
      var valueLength = fieldValue.length;
      return valueLength <= param
        ? true
        : valueLength === 0
          ? true
          : 'maxLength';
    },
    required: function (fieldValue, param) {

      if (typeof param === 'function') {
        /*
         * Required if: if param is not undefined and is a function,
         * the field is required only if a specific condition is matched.
         * Param: a function which evaluates to true or false.
         * true: field is required, false: not required
         */
        if (param()) {
          return fieldValue.length > 0
            ? true
            : 'required';
        }
        return true;

      }
      //param is not a function (is undefined)
      return fieldValue.length > 0
        ? true
        : 'required';
    },
    tokens: function (fieldValue, param) {

      /*
       * Check if value entered corresponds to one value from a given list (token)
       * param is an array of options/possible values or a function wich returns an  object of possible options
       */
      if (typeof param === "function") {
        param = param();
      }

      var paramLength = param.length;

      for (var i = 0; i < paramLength; i++) {
        if (param[i] === fieldValue) {
          return true;
        }
      }
      return 'tokens';
    },
    matchMain: function (fieldValue, param) {
      //check if value matches other field value
      //param is the input with the value to match, or a function which returns the value to match
      // if value to match is empty, return true
      var matchValue = '';

      if (typeof param === 'function') {
        matchValue = param();
      } else {
        matchValue = param.attr(a.dV) || param.val();
      }

      if (matchValue !== '') {
        return fieldValue === matchValue
          ? true
          : 'match';
      }
      return true;
    },
    match: function (fieldValue, param) {
      //check if value matches other field value
      //param is the input with the value to match, or a function which returns the value to match

      var matchValue = '';

      if (typeof param === 'function') {
        matchValue = param();
      } else {
        matchValue = param.attr(a.dV) || param.val();
      }

      return fieldValue === matchValue
        ? true
        : 'match';
    },
    customRegex: function (fieldValue, param) {
      return param.test(fieldValue)
        ? true
        : 'customRegex';
    },
    ajax: function (fieldValue, param) {
      /* @TODO: test */
      $.ajax({
        method: 'POST',
        url: param,
        data: fieldValue
      }).done(function (data) {
        return data === true
          ? true
          : 'ajax';
      }).fail(function () {
        //trigger ajaxError on window and pass param (url of the failed request)
        win.trigger(pluginName + '.ajaxError', param);
        return 'ajaxError';
      });
    }
  };
}));
