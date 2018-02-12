# ARIA VALIDATE

## About

Smart and flexible jQuery input validation plugin.

## Dependencies

**jQuery**

Developed and tested with jQuery 3.2.1


## Jargon

* Control: an HTML element which accepts user input (`<input/>`, `<select>`, `<textarea>`);
* Control block: the whole HTML markup used to implement a full functioning control. It consists of an HTML wrapper (normally a  `<div>`),which has following child elements: a control, a label associated to the control, an HTML element to display error messages (normally a  `<p>`) and optionally an HTML element to display success messages.


## Settings

### HTML / CSS Classes

The plugin supports the possibility to customise the classes (and the ID) used to implement a control block.

Name | Default | Type | Description
-----|---------|------|-------------
controlIdPrefix | control-- | string | The prefix used to generate IDs of control block.
controlValidClass | control_success | string | The class added by the plugin to a control group when user input is valid.
controlErrorClass | control_error | string | The class added by the plugin to a control group when user input is invalid.
fieldClass | control__field | string | The class used by the plugin to retrieve the control element (input field, select, textarea ...).
fieldErrorClass | control__field_error | string | The class added by the plugin to a control element when user input is invalid.
fieldValidClass | control__field_valid | string | The class added by the plugin to a control element when user input is valid.
fieldClassElement | false | false or string | Selector used to get a specific child element of a control. The field modifier classes will be added also to the selected element.
labelClass | control__label | string | The class used by the plugin to retrieve the label
labelErrorClass | control__label_error | string | The class added by the plugin to a label when user input is invalid.
labelValidClass | control__label_valid | string | The class added by the plugin to a label  when user input is valid.
alertboxClass | control__feedback_error | string | The class used by the plugin to retrieve the element where error messages should be injected
successboxClass | control__feedback_valid | string | The class used by the plugin to retrieve the element where success messages should be injected
alertboxVisibleClass | control__feedback_visible | string | The class added by the plugin to the alert-box when an error occurs and an error message is displayed.
successboxVisibleClass | control__feedback_visible | string | The class added by the plugin to the success-box when user input is correct and a success message is displayed.


### Region settings / localisation

Name | Default | Type | Description
-----|---------|------|-------------
dateFormat | dmy | string | Set the date format to validate dates against. Supported values: dmy -> dd/mm/yyyy, mdy -> mm/dd/yyyy, ymd -> yyyy/mm/dd
dateSeparator |  / | string | Set the character used to separate day, month and year in a date
decimalSeparator | , | string | Set the character used to separate the integer part from the fractional part of a number (float). Commonly `.` or `,`.


### Error messages and success message

Each validation function available with the plugin is associated to an error message, which is displayed when validation fails.
Error messages can be customised for each single control block.

List of default messages:

* letters: 'Digits are not allowed in this field',
* onlyLetters: 'Only letters are allowed',
* digits: 'Letters are not allowed in this field',
* onlyDigits: 'Only digits are allowed',
* int: 'Enter a whole number (e.g. 12)',
* float: 'Enter a number (e.g. 12.168 or 16)',
* bool: 'You must check this checkbox',
* date: 'Not a valid date',
* minDate: 'The date entered is too far in the past',
* maxDate: 'The date entered is too far in the future',
* email: 'Enter a valid email address',
* password: 'Password is not secure',
* min: 'The entered number is too small',
* max: 'The entered number is too big',
* minLength: 'The length of the input is too short',
* maxLength: 'Field length exceeds the maximum number of chars allowed',
* required: 'This field is required to successfully complete the form',
* tokens: 'Please choose a value from the list',
* match: 'No match',
* customRegex: 'Regex match returned "false"',
* ajax: 'server says no!',
* ajaxError: 'Server error.'

(More about validation functions in the section 'Validation').

To each control block can also be associated a success message. The default success message is: 'Perfect! You told us exactly what we wanted to know!';

### Globally overriding default settings



## Validation functions
