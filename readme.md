# filebokz

[![npm package version](https://img.shields.io/npm/v/filebokz.svg?style=flat-square)](https://www.npmjs.com/package/filebokz)
[![Travis build status](https://img.shields.io/travis/com/kodie/filebokz.svg?style=flat-square)](https://travis-ci.com/kodie/filebokz)
[![npm package downloads](https://img.shields.io/npm/dt/filebokz.svg?style=flat-square)](https://www.npmjs.com/package/filebokz)
[![code style](https://img.shields.io/badge/code_style-standard-yellow.svg?style=flat-square)](https://github.com/standard/standard)
[![license](https://img.shields.io/github/license/kodie/filebokz.svg?style=flat-square)](license.md)

A tiny, dependency-free, highly customizable and configurable, easy to use file input with some pretty sweet features.


# Features

* Tiny (JS ~9kb + CSS ~1kb = ~10kb total minified [add an additional ~4kb if using the theme])
* Zero dependencies
* Use as little (or as much) HTML markup as you want
* Optional default CSS styling (which looks really cool)
* Drag-and-drop
* Append files to the input
* Remove individual files from the input
* Drag files out of the box to remove from the input
* Drag files between multiple `filebokz` elements
* Files are all managed with the `file` input, so they are submitted with your form and AJAX isn't required (however you can definitely use it if you wish)
* Preview images before they are uploaded to your server (and specify images or HTML content to display for files that aren't images)
* Specify allowed file extensions, max number of files, max individual file size, and max total file size, as well as the error messages that are displayed when those rules are broken (and specify images or HTML content to display for files that aren't images)
* Pretty much everything is configurable and flexible


## Browser Support

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari-ios/safari-ios_48x48.png" alt="iOS Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>iOS Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/samsung-internet/samsung-internet_48x48.png" alt="Samsung" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Samsung | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Opera |
| --------- | --------- | --------- | --------- | --------- | --------- | --------- |
| >=80 | >=50 | >=58 | >=11 | Yes* | Yes* | >=45

*Not really sure about which exact versions that are supported currently

Basically any browser version made after 2016 should work.


## Demo

Visit https://kodie.github.io/filebokz


## Installation


### Manual Download

[Download the latest version of filebokz](https://github.com/kodie/minitaur/archive/refs/heads/main.zip) and then place the following HTML in your page's head element:

```html
<script type="text/javascript" src="dist/filebokz.min.js"></script>
<link rel="stylesheet" href="dist/filebokz.min.css" />

<!--Optional theme-->
<link rel="stylesheet" href="dist/filebokz-theme.min.css" />
```


### CDN (Courtesy of [jsDelivr](https://jsdelivr.com))

Place the following HTML in your page's head element (check to make sure the version in the URLs are the version you want):

```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/kodie/filebokz@0.0.2/dist/filebokz.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/kodie/filebokz@0.0.2/dist/filebokz.min.css" />

<!--Optional theme-->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/kodie/filebokz@0.0.2/dist/filebokz-theme.min.css" />
```


### [NPM](https://npmjs.com)

```
npm install filebokz --save
```

```js
// ES6
import filebokz from 'filebokz'

// CommonJS
const filebokz = require('filebokz')
```


### [GPM](https://github.com/itsahappymedium/gpm)

```
gpm install kodie/filebokz --save
```


### [Bower](https://bower.io)

```
bower install kodie/filebokz --save
```


## Usage


### Basic HTML Structure

```html
<div class="filebokz">
  <input type="file" name="my-file" />
  <label for="my-file">
    <strong class="no-files">Choose a file</strong>
    <span class="no-files is-draggable">or drag it here</span>
    <span class="files"></span>
    <span class="error-msg"></span>
  </label>
</div>
```


### The `filebokz([elements], [applyClass])` Function

Initiates filebokz.


#### Parameters

* elements - The elements to target. Accepts a string to pass into `document.querySelectorAll()`, a `NodeList` instance, or an `HTMLElement` instance. (Defaults to `.filebokz`)
* applyClass - A class name to apply to all matching elements. Set to `false` to not apply any class. (Defaults to `filebokz`)


#### Examples

```js
window.addEventListener('load', function () {
  filebokz()
  filebokz('.custom-filebokz', false)
  filebokz(document.getElementById('my-filebokz'))
  filebokz(document.getElementsByClassName('file-upload'))
})
```


## Classes

Use these classes on elements inside of the `filebokz` element to customize your input.


### error

Elements with this class will be hidden unless the root `filebokz` element has this class which is added if any errors occur.


### error-msg

Elements with this class will have their contents replaced with any errors that occur.


### file

If any elements have the `files` class, elements are appended to them with this class for displaying file names and/or previews when files are added to the input.


### file-count

Elements with this class will have their contents replaced with the number of files in the input.


### files

Elements with this class will have elements appended to them with the `file` class for displaying file names and/or previews when files are added to the input.


### file-previews

If displaying file previews, apply this class to any elements with the `files` class for fancier styling (when `filebokz-theme.css` is used).


### has-files

Elements with this class will be hidden unless the root `filebokz` element has this class which is added if the input has files.


### in-focus

Elements with this class will be hidden unless the root `filebokz` element has this class which is added if the input is in focus.


### is-advanced

Elements with this class will be hidden unless the root `filebokz` element has this class which is added if the browser supports advanced features.


### is-draggable

Elements with this class will be hidden unless the root `filebokz` element has this class which is added if the browser supports drag-and-drop.


### is-dragging

Elements with this class will be hidden unless the root `filebokz` element has this class which is added if a file is being dragged over it.


### is-removing

Elements with this class will be hidden unless the root `filebokz` element has this class which is added if a file is being dragged out of the file box and being removed.


### is-transferring

Elements with this class will be hidden unless the root `filebokz` element has this class which is added if a file is being dragged out of the file box and being moved to another `filebokz` element.


### js-enabled

Elements with this class will be hidden unless the root `filebokz` element has this class which is added after the JavaScript has been ran (thus meaning the browser supports JavaScript).


### no-files

Elements with this class will be hidden if the root `filebokz` element has the class `has-files` which is added if the input has files.


### no-js

Add this class to your root `filebokz` element if you do not wish for the JavaScript to do anything with it (mainly used for demo purposes).


### not-in-focus

Elements with this class will be hidden if the root `filebokz` element has the `in-focus` class which is added if the input is in focus.


### not-advanced

Elements with this class will be hidden if the root `filebokz` element has the `is-advanced` class which is added if the browser supports advanced features.


### not-draggable

Elements with this class will be hidden if the root `filebokz` element has the `is-draggable` class which is added if the browser supports drag-and-drop.


### not-dragging

Elements with this class will be hidden if the root `filebokz` element has the `is-dragging` class which is added if a file is being dragged over it.


### not-removing

Elements with this class will be hidden if the root `filebokz` element has the `is-removing` class which is added if a file is being dragged out of the file box and being removed.


### not-transferring

Elements with this class will be hidden if the root `filebokz` element has the `is-transferring` class which is added if a file is being dragged out of the file box and being moved to another `filebokz` element.


### remove

Add this class to an element inside of the `files` element's `content`, `content-before`, or `content-after` data attributes so that when the element is clicked, it removes the file from the input.


### size

Elements with this class will have their contents replaced with the combined file size of all files in the input.


## Root Element Attributes

Apply these attributes with the `data-` prefix to your `filebokz` element to configure your input. (ex. `data-max-file-size="5120"`)


### allowed-extensions

A comma seperated (no spaces) list of allowed file extensions. Defaults to allowing any file extension. Add `[none]` to this list to allow files without extensions.


### allowed-extensions-error-msg

The error message that is displayed when a user tries to upload a file that isn't in the `allowed-extensions` list. Any instances of `{variable}` will be replaced with the list of allowed file extensions. (Defaults to `Only the following file types are allowed: {variable}.`)


### appendable

Set this to `false` to replace the files in the input when a file is selected rather than adding it. (Defaults to `true`)


### auto-submit

Set this to `true` to automatically submit the parent form when a file is uploaded. (Defaults to `false`)


### error-display-animation-duration

The number of milliseconds after the `error-display-duration` before clearing out the contents of the `error-msg` element after an error has occurred. (Defaults to `250`)


### error-display-duration

The number of milliseconds before removing the `error` class from the filebokz after an error has occurred. (Defaults to `3000`)


### max-files

The maximum number of files that are allowed to be uploaded. This is only applied if the input has the `multiple` attribute. (Defaults to `null` [no limit])


### max-files-error-msg

The error message that is displayed when a user tries to upload more files than `max-files` allows. Instances of `{variable}` are replaced with the value of `max-files` and instances of `{s}` are replaced with an "s" if that number is more than 1, otherwise it is replaced with nothing. (Defaults to `A maximum of {variable} file{s} can be uploaded.`)


### max-file-size

The maximum size of a single file that is allowed to be uploaded. (Defaults to `null` [no limit])


### max-file-size-error-msg

The error message that is displayed when a user tries to upload a file that is bigger than what `max-file-size` allows. Instances of `{variable}` are replaced with the value of `max-file-size`. (Defaults to `File size cannot exceed {variable}.`)


### max-size

The maximum size of all files combined that is allowed to be uploaded. (Defaults to `null` [no limit])


### max-size-error-msg

The error message that is displayed when a user tries to upload files whose combined file size is bigger than what `max-size` allows. (Defaults to `Total combined file size cannot exceed {variable}.`)


## Files Element Attributes

Apply these attributes with the `data-` prefix to any element with the `files` class inside of your `filebokz` element to customize how each file is displayed.

These attributes (with the exception of `draggable`) can have a MIME type appended to them with any `+` or `/` symbols swapped out for `-` to customize how a specific file type is displayed (ex. `content-before-image` or even more specifically: `content-before-image-svg-xml`).

These attributes (with the exception of `draggable` and `element`) will have the following replaced with information about each file:

* `{name}` - The file name.
* `{size}` - The file size (in a human readable format).
* `{type}` - The MIME type of the file.
* `{url}` - If the file is an image, this will be a temporary URL to the file for previewing, otherwise it will be the contents of the `data-url` attribute, and if that doesn't exist, this will be blank.


### content

The content that is placed inside of the `file` element. (Defaults to `{name}`)


### content-before

The content that is prepended to `content`. (Defaults to `null` [blank])


### content-after

The content that is appended to `content`. (Defaults to `null` [blank])


### draggable

Set this to `false` to disable the dragging of `file` elements. (Defaults to `true`)


### element

The type of HTML element that the `file` element should be. (Defaults to `span`)


### url

The URL of the file preview. This is what `{url}` is set to in the `content`, `content-before`, and `content-after` attributes. (Defaults to `null` [blank] unless the file is an image, in which case it is set to a temporary URL of the file for previewing.)


## JavaScript

The `file-added`, `file-removed`, and `error` events are fired to the containing filebokz element when described events happen.


### Examples

```js
var fileElement = document.querySelector('.filebokz')

fileElement.addEventListener('file-added', function (e) {
  console.log('A file was added')
})

fileElement.addEventListener('file-removed', function (e) {
  console.log('A file was removed')
})

fileElement.addEventListener('error', function (e) {
  console.log('An error occured', e.errorType, e.errorMessage)
})
```


## Related

 - [minitaur](https://github.com/kodie/minitaur) - The ultimate, dependency-free, easy to use, JavaScript plugin for creating and managing modals.

 - [colorfield](https://github.com/kodie/colorfield) - A tiny, dependency-free, color input field helper that utilizes the native color picker.

 - [vanishing-fields](https://github.com/kodie/vanishing-fields) - A dependency-free, easy to use, JavaScript plugin for hiding and showing fields.


## License

MIT. See the [license file](license.md) for more info.
