    
/* MIT License
Copyright (c) 2019 Davide Trisolini
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
    var pluginName = 'formValidate', // the name of the plugin
        a = {
            r: 'role',
            aHi: 'aria-hidden',
            aLi: 'aria-live',
            aRe: 'aria-relevant',
            aAt: 'aria-atomic',
            t: 'true',
            f: 'false'
        };
    //HELPERS FUNCTIONS ==================================================================================================
    /**
     * triggerControlsArrayValidation: triggers aria-validate validation on each form-control in an array
     * @param {array} array: an array of form controls objects.
     */
    function triggerControlsArrayValidation(array, eventName) {
        var arrayLength = array.length;
        //trigger custom validation event on each control to perform validation.
        //Triggering validation will ensure all the fields are valid when submitting the form
        //and if there are erros, the control's error messages will become visible
        for (var i = 0; i < arrayLength; i++) {
            array[i].data('plugin_ariaValidate').field.trigger(eventName);
        }

        //check if each control is valid
        for (var i = 0; i < arrayLength; i++) {
            if (array[i].data('plugin_ariaValidate').fieldStatus !== true) {
                return false;
            }
        }
        return true;
    }

    /**
     *initErrorMessageMarkup: adds the needed accessibility attributes to error messages.
     * @param {object} errorMessage: the jQuery DOM node object
     */
    function initErrorMessageMarkup(errorMessage) {
        errorMessage
            .attr(a.r, 'alert')
            .attr(a.aLi, 'assertive')
            .attr(a.aRe, 'additions text')
            .attr(a.aAt, a.t)
            .attr(a.aHi, a.t);
    }

    /**
     * showHideMessage:show or hide a form's error or success message
     * @param {object} message: the jQuery DOM node object
     * @param {string} visibleClass: the CSS class which toggles the message visibility
     * @param {bool} show: true shows the massges, false hides the message
     */
    function showHideMessage(message, visibleClass, show) {
        if (show) {
            message.addClass(visibleClass).attr(a.aH, a.f);
            return;
        }
        message.removeClass(visibleClass).attr(a.aH, a.f);
    }


    /**
     * printServerResponse: prints the server response in a given dom node (error message dom node)
     * if the response is of type application/json, the response property of the object is printed in the message
     * @param {object} data 
     * @param {object} messageNode 
     */
    function printServerResponse(data, messageNode) {
        if (data.getResponseHeader('Content-Type') === 'text\html'
            && typeof data.responseText === 'string'
            && data.responseText.length > 1) {
            messageNode.html(data.responseText);
        } else if (data.getResponseHeader('Content-Type') === 'application/json') {
            messageNode.html(data.responseJSON.response);
        }
    }


    //END HELPERS FUNCTIONS ==================================================================================================


    /**
     * FormValidate: The actual plugin constructor
     * @param {object} element: the form DOM node object 
     * @param {object} userSettings
     */
    function FormValidate(element, userSettings) {
        var self = this;
        self.settings = $.extend({}, $.fn[pluginName].defaultSettings, userSettings); // merge user settings with default settings
        self.element = $(element); // the form DOM node
        self.formStatus = false; //true if all form controls are valid, false otherwise.
        self.wizardMode = Array.isArray(self.settings.controls[0]); //if the controls array contains arrays, then we are in wizard mode (the form is splitted in steps)
        self.submitBtn = self.element.find('button[type="submit"]').first(); // the form submit button
        self.errorMessage = self.element.find('.' + self.settings.errorMessageClass).first(); // the messages to show if the form validation fails
        self.successMessage = self.element.find('.' + self.settings.successMessageClass).first(); // the message to show if form usbmission was successfull
        self.serverErrorMessage = self.element.find('.' + self.settings.serverErrorMessageClass).first(); // the message to show if the server does not return the expected response

        //init plugin
        self.init();
    }


    // Avoid Plugin.prototype conflicts
    $.extend(FormValidate.prototype, {
        /**
         *init: initilise the plugin; add needed HTML attributes and attach event handlers
         */
        init: function () {
            var self = this,
                settings = self.settings,
                controls = settings.controls;
            //add attribute novalidate to form, to avoid HTML5 browser validation
            self.element.prop('novalidate', true);
            //add accessibility attributes to form error and success messages
            try {
                initErrorMessageMarkup(self.errorMessage);
            } catch (exception) {
                throw new Exception(exception);
            }

            if (self.serverErrorMessage !== null) {
                initErrorMessageMarkup(self.serverErrorMessage);
            }

            if (self.successMessage !== null) {
                self.successMessage
                    .attr(a.aLi, 'polite')
                    .attr(a.aRe, 'additions text')
                    .attr(a.aAt, a.t)
                    .attr(a.aHi, a.t);
            }

            //Bind behaviour to submit button
            //handle async form submission logic
            if (self.settings.ajaxSubmit && typeof self.settings.submitUrl === 'string') {
                self.submitBtn.on('click.' + pluginName, function (event) {
                    self.asyncSubmit(event);
                });
            }

            //enable submit button when the form is fully initialised
            self.enableSubmitBtn();
        },
        disableSubmitBtn: function () {
            this.submitBtn
                .addClass(this.settings.submitBtnBusyClass)
                .prop('disabled', true);
        },
        enableSubmitBtn: function () {
            var self = this;
            self.submitBtn
                .removeClass(self.settings.submitBtnBusyClass)
                .prop('disabled', false);
        },
        showErrorMessage: function () {
            var self = this,
                messageVisibleClass = self.settings.messageVisibleClass;
            showHideMessage(self.serverErrorMessage, messageVisibleClass, false);
            showHideMessage(self.successMessage, messageVisibleClass, false);
            showHideMessage(self.errorMessage, messageVisibleClass, true);
        },
        hideErrorMessage: function () {
            showHideMessage(this.errorMessage, this.settings.messageVisibleClass, false);
        },
        showSuccessMessage: function () {
            var self = this,
                messageVisibleClass = self.settings.messageVisibleClass;
            showHideMessage(self.serverErrorMessage, messageVisibleClass, false);
            showHideMessage(self.errorMessage, messageVisibleClass, false);
            showHideMessage(self.successMessage, self.settings.messageVisibleClass, true);
        },
        hideSuccessMessage: function () {
            showHideMessage(this.successMessage, this.settings.messageVisibleClass, false);
        },
        showServerErrorMessage: function () {
            var self = this,
                messageVisibleClass = self.settings.messageVisibleClass;
            showHideMessage(self.successMessage, messageVisibleClass, false);
            showHideMessage(self.errorMessage, messageVisibleClass, false);
            showHideMessage(self.serverErrorMessage, self.settings.messageVisibleClass, true);
        },
        hideServerErrorMessage: function () {
            showHideMessage(this.serverErrorMessage, this.settings.messageVisibleClass, false);
        },
        hideAllMessages: function () {
            var self = this;
            self.hideErrorMessage();
            self.hideSuccessMessage();
            self.hideServerErrorMessage();
        },
        /**
         * validate: validate all the form's controls by triggering the custom aria-validate event 
         * on each control and set the formStatus prop to true if the form validates 
         * or to false if the form does not validate
         */
        validate: function () {
            var self = this,
                controls = self.settings.controls,
                arrLength;

            //the array entry is a control if wizard mode is not enabled
            if (!self.wizardMode) {
                if (!triggerControlsArrayValidation(controls, self.settings.formValidateEvent)) {
                    self.formStatus = false;
                    if (typeof self.settings.onError === 'function') {
                        self.settings.onError(self);
                    }
                    return;
                }
            } else {
                arrLength = controls.length;
                for (var i = 0; i < arrLength; i++) {
                    if (!triggerControlsArrayValidation(controls[i], self.settings.formValidateEvent)) {
                        self.formStatus = false;
                        if (typeof self.settings.onError === 'function') {
                            self.settings.onError(self);
                        }
                        return;
                    }
                }
            }
            self.formStatus = true;
        },
        /**
         *validateWizardStep: validate a wizard step (nested array of controls). The method is triggered only if the form is in wizard mode.
         * @param {int} stepIndex: the index of the array entry which represents the wizard step to validate
         * @return {bool|null}: true if the step validates, false if the step does not validate, 
         *                       null if the index is lower than 0 or greater than the length of the array,
         *                       null if the form is not in wizard moded (settings.controls is not an array of arrays of controls)
         */
        validateWizardStep: function (stepIndex) {
            if (self.wizardMode) {
                var self = this,
                    wizardSteps = self.settings.controls,
                    wizardStepsLength = wizardSteps.length,
                    wizardStep,
                    wizardLength;
                if (stepIndex > 0 && stepIndex < wizardStepsLength) {
                    wizardStep = wizardSteps[stepIndex];
                    wizardStepLength = wizardStep.length;
                    return triggerControlsArrayValidation(wizardStep, self.settings.formValidateEvent);
                }
            }
            return null;
        },
        handleFormError: function () {
            var self = this;

            //disable submit button and hide all messages
            self.disableSubmitBtn();
            self.hideAllMessages();
            //if the form is not valid,
            //show error message
            //and exit
            if (!self.formStatus) {
                //re-enable submit button after the given timeout
                //in order to show the user some actions have been performed
                setTimeout(function () {
                    self.enableSubmitBtn();
                    self.showErrorMessage();
                }, self.settings.submitBtnReEnableTimeout);
            }
        },

        /**
         * asyncSubmit: asyncronously submit form data to server with ajax
         * @param {object} event: the submit's button click event's object. 
         *                        The event is used to call preventDefault() and stop syncronous submission
         */
        asyncSubmit: function (event) {
            var self = this;

            //prevent syncronous form submission
            if (typeof event !== 'undefined' && event.target) {
                event.preventDefault();
            }


            //validate form
            //(the method will update the value of this.formStatus)
            self.validate();

            //show error messages if the form si not valid
            self.handleFormError();

            //break execution if the form is not valid
            if (!self.formStatus) {
                return;
            }

            //call before submit hook
            if (typeof self.settings.beforeSubmit === 'function') {
                self.settings.beforeSubmit(self);
            }

            //if the form is valid
            //submit with ajax:
            $.ajax({
                method: 'POST',
                cache: false,
                data: self.element.serializeArray(), //serialize the form data 
                url: self.settings.submitUrl
            }).done(function (data) {
                //Form successfully submitted: status 200
                self.showSuccessMessage();
                //Call submit success hook, if defined
                if (typeof self.settings.submitSuccess === 'function') {
                    self.settings.submitSuccess(self);
                }
            }).fail(function (data) {
                var status = data.status;
                if (status === 400) {
                    //Bad request - form data not valid
                    printServerResponse(data, self.errorMessage);
                    self.showErrorMessage();
                } else {
                    //Other server error: 500 or 404
                    printServerResponse(data, self.serverErrorMessage);
                    self.showServerErrorMessage();
                }
                //Call submit error hook, if defined
                if (typeof self.settings.submitError === 'function') {
                    self.settings.submitError(self);
                }
            }).always(function (data) {
                //re-enable submit button after submission
                setTimeout(function () {
                    self.enableSubmitBtn();

                }, self.settings.submitBtnReEnableTimeout);

                //Call submit always hook, if defined
                if (typeof self.settings.submitAlways === 'function') {
                    self.settings.submitAlways(self);
                }
            });
        },
        methodCaller: function (methodArg, arg) {
            var self = this;
            switch (methodArg) {
                case 'validateWizardStep':
                    self.validateWizardStep(arg);
                    break;
                case 'validateForm':
                    self.validate();
                    self.handleFormError();
                    break;
                case 'submit':
                    self.asyncSubmit();
                    break;
                case 'resetMessages':
                    self.hideAllMessages();
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
                $.data(self, 'plugin_' + pluginName, new FormValidate(self, userSettings));
            } else if (typeof userSettings === 'string') {
                $.data(self, 'plugin_' + pluginName).methodCaller(userSettings, methodArg);
            }
        });
    };
    $.fn[pluginName].defaultSettings = {
        successMessageClass: 'js--form__feedback_success',
        errorMessageClass: 'js--form__feedback_error',
        serverErrorMessageClass: 'js--form__feedback_servererror',
        messageVisibleClass: 'form__feedback_visible',
        submitBtnBusyClass: 'btn_busy',
        submitBtnReEnableTimeout: 300,
        formValidateEvent: 'formValidate',
        controls: [],
        ajaxSubmit: false,
        submitUrl: false,
        onError: false,
        beforeSubmit: false,
        submitSuccess: false,
        submitError: false,
        submitAlways: false
    };
}));
