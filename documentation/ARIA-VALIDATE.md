# ARIA VALIDATE

## About

Smart and flexible jQuery input validation plugin.

## Dependencies

**jQuery**

Developed and tested with jQuery 3.2.1


## Jargon

* **Control**: an HTML element which accepts user input (`<input/>`, `<select>`, `<textarea>`);
* **Control block**: the whole HTML markup used to implement a full functioning control: an HTML wrapper (normally a  `<div>`),which has following child elements: a **control**, a **label** associated to the control, an **HTML element to display error messages** (normally a  `<p>`) and, optionally, an **HTML element to display success messages**.


## Settings

### HTML / CSS Classes

It is possible to customise the classes, IDs and selectors used to implement a control block.

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

The default classes can be overridden in the init statement of a control block:

```javascript
$('#my-control').ariaValidate({
  classes: {
    fieldClass: 'js--control__select',
    fieldErrorClass: 'control__select_error',
    fieldValidClass: 'control__select_valid',
    fieldClassElement: '.control__select'
  },
  //[Other settings]
});
```

### Region settings / localisation

The plugin supports the possibility to localise and customise the date format and the format of float numbers.

Name | Default | Type | Description
-----|---------|------|-------------
dateFormat | dmy | string | Set the date format to validate dates against. Supported values: dmy -> dd/mm/yyyy, mdy -> mm/dd/yyyy, ymd -> yyyy/mm/dd
dateSeparator |  / | string | Set the character used to separate day, month and year in a date
decimalSeparator | , | string | Set the character used to separate the integer part from the fractional part of a number (float). Commonly `.` or `,`.

The default region settings can be overridden in the init statement of a control block:

```javascript
$('#my-control').ariaValidate({
  regionSettings: {
    dateFormat: 'ymd'
  },
  //[Other settings]
});
```

### Error messages and success message

Each validation function available with the plugin is associated to an error message, which is displayed when validation fails. It is possible to customise error messages for each control block.

A list of the validation rules and the associated default error messages follows.

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

The default error messages can be overridden in the init statement of a control block:

```javascript
$('#my-control').ariaValidate({
  errorMsgs: {
    int: 'Please enter a number.',
    required: 'This field cannot be empty!'
  },
  //[Other settings]
});
```

Also a success message is associated to each control block. The default success message is: 'Perfect! You told us exactly what we wanted to know!';

Override the default success message in the init statement of a control block like this:

```javascript
$('#my-control').ariaValidate({
  successMsg: 'Your answer is correct!'
  //[Other settings]
});
```

### Globally overriding default settings

Customising settings for each single control block can be time consuming and error prone. For this reason the plugin offers a way to globally override default settings.

Use following code to override default settings (add before any init statement) .

```javascript
//change default classes
$.fn.ariaValidate.defaultClasses = {
  fieldClass: 'js--control__select',
  fieldErrorClass: 'control__select_error',
  fieldValidClass: 'control__select_valid',
  fieldClassElement: '.control__select'
};

//change default region settings
$.fn.ariaValidate.defaultRegionSettings = {
  dateFormat: 'mdy'
};

//change default error messages
$.fn.ariaValidate.defaultErrorMsgs = {
  int: 'Please enter a number.',
  required: 'This field cannot be empty!'
};

//change default success message
$.fn.ariaValidate.defaultSuccessMsg = 'Correct answer!';
```


## Validation functions

### ajax

### bool (only for checkbox and radio)

Validate checkbox or radio (checked or unchecked status).

```javascript
$('#my-control').ariaValidate({
  behaviour: [{
      event: 'input',
      validate: {
        bool: true
      }
    }],
});
```

### customRegex

Validate text input against a custom regex.

```javascript
$('#my-control').ariaValidate({
  behaviour: [{
    event: 'blur',
    validate: {
      customRegex: /ariaValidate/i
    }
  }],
});
```

### date

Check if date has valid format and is valid.

```javascript
$('#my-control').ariaValidate({
  behaviour: [{
    event: 'blur',
    validate: {
      date: true
    }
  }],
});
```

### digits

Check if text input contains any letter. This validation rules validates any character, except letters.

```javascript
$('#my-control').ariaValidate({
  behaviour: [{
    event: 'blur',
    validate: {
      digits: true
    }
  }],
});
```

### email

Validate email addresses.

```javascript
$('#my-control').ariaValidate({
  behaviour: [{
    event: 'blur',
    validate: {
      email: true
    }
  }],
});
```

### float

Validate float numbers

```javascript
$('#my-control').ariaValidate({
  behaviour: [{
    event: 'blur',
    validate: {
      float: true
    }
  }],
});
```

### int

Validate integers.

```javascript
$('#my-control').ariaValidate({
  behaviour: [{
    event: 'blur',
    validate: {
      float: true
    }
  }],
});
```

### letters

Check if text input contains any digit. This validation rules validates any character, except digits.

```javascript
$('#my-control').ariaValidate({
  behaviour: [{
    event: 'blur',
    validate: {
      digits: true
    }
  }],
});
```

### match

Check if field value is equal to a user defined value (string).



```javascript
$('#my-control').ariaValidate({
  behaviour: [{
    event: 'blur',
    match: $('#field-to-match')
  }],
});
```

or

```javascript
$('#my-control').ariaValidate({
  behaviour: [{
    event: 'blur',
    match: function () {
      //[...]
      return value;
    }
  }],
});
```

### matchMain

### max

### maxDate

### maxLength

### min

### minDate

### minLength

### onlyDigits

### onlyLetters

### password

### required

### token

###
