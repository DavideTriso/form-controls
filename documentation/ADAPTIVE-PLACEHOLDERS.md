# ARIA VALIDATE

## About

Extremly simple Query plugin for adaptive placeholders. Check the [demo](https://davidetriso.github.io/form-controls/control-types.html).

## Dependencies

**jQuery**

Developed and tested with jQuery 3.2.1


## Settings

Name | Default | Type | Description
-----|---------|------|-------------
labelClass | 'control__label' | string | the class used from the plugin to get the label of a control field
controlFieldClass | 'control__field'| string | the class used from the plugin to get the field of a control
labelActiveClass | 'control__label_active' | string | the class the plugin adds to the label when the input field is focussed


## Usage

### HTML

Use the html markup suggested by this package to implement a control with adaptive placeholder.

```html
<div class="control">
    <label class="control__label control__label_adaptive" for="#1">My adaptive placeholder</label>
    <div class="control__box">
        <input type="text" name="#1" id="#1" class="control__field">
    </div>
</div>
```

### JS

Initialise the plugin:

```javascript
$('.myControls').adaptivePlaceholder({
  //[ settings]
});
```

