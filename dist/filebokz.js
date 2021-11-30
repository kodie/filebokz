(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.filebokz = factory());
})(this, (function () { 'use strict';

  /*!
    filebokz v0.1.0 (https://github.com/kodie/filebokz)
    by Kodie Grantham (https://kodieg.com)
  */
  var filebokz = function filebokz(elements, applyClass) {
    if (!elements) elements = '.filebokz';
    if (typeof applyClass !== 'string') applyClass = 'filebokz';
    var imageTypes = ['apng', 'bmp', 'gif', 'x-icon', 'jpeg', 'png', 'svg+xml', 'tiff', 'webp'];
    var sizeUnits = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var div = document.createElement('div');
    var draggable = 'draggable' in div || 'ondragstart' in div && 'ondrop' in div;
    var advanced = 'FormData' in window && 'FileReader' in window;
    if (!filebokz.count) filebokz.count = 0;

    if (typeof elements === 'string') {
      elements = document.querySelectorAll(elements);
    } else if (elements instanceof HTMLElement) {
      elements = [elements];
    }

    var displayErrorMessage = function displayErrorMessage(fileBox, errorType, variable) {
      var element = fileBox.querySelector('.error-msg');
      var errorDisplayDuration = fileBox.dataset.errorDisplayDuration || 3000;
      fileBox.classList.add('error');
      var fileBoxData = fileBox.dataset;
      var message = '';

      if (errorType === 'maxFiles') {
        message = fileBoxData.maxFilesErrorMsg || 'A maximum of {variable} file{s} can be uploaded.';
        message = message.replace(/{variable}/ig, variable);
        message = message.replace(/{s}/ig, variable > 1 ? 's' : '');
      }

      if (errorType === 'maxFileSize') {
        message = fileBoxData.maxFileSizeErrorMsg || 'File size cannot exceed {variable}.';
        message = message.replace(/{variable}/ig, fileSize(variable));
      }

      if (errorType === 'maxSize') {
        message = fileBoxData.maxSizeErrorMsg || 'Total combined file size cannot exceed {variable}.';
        message = message.replace(/{variable}/ig, fileSize(variable));
      }

      if (errorType === 'allowedExtensions') {
        message = fileBoxData.allowedExtensionsErrorMsg || 'Only the following file types are allowed: {variable}.';
        message = message.replace(/{variable}/ig, variable);
      }

      if (element) {
        element.innerHTML = message;
        var errorAnimationDuration = 250;

        if (Object.prototype.hasOwnProperty.call(fileBox.dataset, 'errorAnimationDuration')) {
          errorAnimationDuration = fileBox.dataset.errorAnimationDuration;
        }

        setTimeout(function () {
          element.innerHTML = '';
        }, errorDisplayDuration + errorAnimationDuration);
      }

      setTimeout(function () {
        fileBox.classList.remove('error');
      }, errorDisplayDuration);
      filebokz.triggerEvent('error', fileBox, {
        errorMessage: message,
        errorType: errorType
      });
    };

    var fileAttribute = function fileAttribute(attributes, attrPrefix, typePrefix, typeKey) {
      if (Object.prototype.hasOwnProperty.call(attributes, attrPrefix + typeKey)) {
        return attributes[attrPrefix + typeKey];
      } else if (Object.prototype.hasOwnProperty.call(attributes, attrPrefix + typePrefix)) {
        return attributes[attrPrefix + typePrefix];
      }
    };

    var fileSize = function fileSize(bytes) {
      if (Math.abs(bytes) < 1024) return bytes + ' B';
      var u = -1;

      do {
        bytes /= 1024;
        ++u;
      } while (Math.round(Math.abs(bytes) * 10) / 10 >= 1024 && u < sizeUnits.length - 1);

      return +bytes.toFixed(1) + ' ' + sizeUnits[u];
    };

    var onBlur = function onBlur(e, fileBox) {
      fileBox.classList.remove('in-focus');
    };

    var onChange = function onChange(e, fileBox, input) {
      var files = input.files;
      var originalFiles = input.originalFiles || [];
      var removing = e.filebokzAction === 'remove';

      if (files.length) {
        var appendable = !fileBox.dataset.appendable || fileBox.dataset.appendable.toLowerCase() !== 'false';
        var multiple = input.hasAttribute('multiple') && input.getAttribute('multiple').toLowerCase() !== 'false';

        if (appendable && multiple && !removing && originalFiles.length) {
          var filesArr = Array.from(files);
          var newFilesArr = Array.from(originalFiles);

          for (var i = 0; i < filesArr.length; i++) {
            var duplicateFound = false;

            for (var k = 0; k < newFilesArr.length; k++) {
              if (filesArr[i].lastModifed === newFilesArr[k].lastModifed && filesArr[i].name === newFilesArr[k].name && filesArr[i].size === newFilesArr[k].size && filesArr[i].type === newFilesArr[k].type) duplicateFound = true;
            }

            if (!duplicateFound) newFilesArr.push(filesArr[i]);
          }

          input.files = filebokz.newFileList(newFilesArr);
          files = input.files;
        }

        if (validateFiles(files, fileBox, input)) {
          fileBox.classList.add('has-files');
        } else {
          files = [];
        }
      }

      if (!files.length && !removing) {
        input.files = filebokz.newFileList(originalFiles);
        files = input.files;
      }

      if (!files.length) {
        fileBox.classList.remove('has-files');
      }

      input.originalFiles = files;
      fileBox.dataset.fileCount = files.length;
      var fileCountElement = fileBox.querySelector('.file-count');
      if (fileCountElement) fileCountElement.innerHTML = files.length;
      var size = 0;

      for (var s = 0; s < files.length; s++) {
        size += files[s].size;
      }

      fileBox.dataset.size = size;
      var sizeElement = fileBox.querySelector('.size');
      if (sizeElement) sizeElement.innerHTML = fileSize(size);
      var filesElement = fileBox.querySelector('.files');

      if (filesElement) {
        (function () {
          var filesElementData = filesElement.dataset;
          var fileElements = filesElement.querySelectorAll('.file');

          if (fileElements) {
            for (var fe = 0; fe < fileElements.length; fe++) {
              filesElement.removeChild(fileElements[fe]);
            }
          }

          if (files.length) {
            (function () {
              var draggableFiles = !filesElementData.draggable || filesElementData.draggable.toLowerCase() !== 'false';

              for (var f = 0; f < files.length; f++) {
                (function (file, index) {
                  var typePrefix = file.type.split('/')[0];
                  var typeKey = file.type.replace(/[/+-](\w{1})/g, function (c) {
                    return c.toUpperCase();
                  }).replace(/[/+-]/g, '');
                  typePrefix = typePrefix.charAt(0).toUpperCase() + typePrefix.slice(1);
                  var element = fileAttribute(filesElementData, 'element', typePrefix, typeKey);
                  element = element || filesElementData.element || 'span';
                  var content = fileAttribute(filesElementData, 'content', typePrefix, typeKey);
                  content = content || filesElementData.content || '{name}';
                  var contentBefore = fileAttribute(filesElementData, 'contentBefore', typePrefix, typeKey);
                  contentBefore = contentBefore || filesElementData.contentBefore || '';
                  var contentAfter = fileAttribute(filesElementData, 'contentAfter', typePrefix, typeKey);
                  contentAfter = contentAfter || filesElementData.contentAfter || '';
                  var url = fileAttribute(filesElementData, 'url', typePrefix, typeKey);

                  if (!url) {
                    if (imageTypes.includes(file.type.replace('image/', ''))) {
                      url = window.URL.createObjectURL(file);
                    } else {
                      url = filesElementData.url || '';
                    }
                  }

                  content = contentBefore + content + contentAfter;
                  content = content.replace(/{name}/ig, file.name);
                  content = content.replace(/{type}/ig, file.type);
                  content = content.replace(/{size}/ig, fileSize(file.size));
                  content = content.replace(/{url}/ig, url);
                  var fileElement = document.createElement(element);
                  fileElement.className = 'file';
                  fileElement.innerHTML = content;

                  if (draggable && draggableFiles) {
                    fileElement.draggable = 'true';
                    fileElement.addEventListener('drag', function (e) {
                      onFileDrag(e, fileBox.id);
                    }, false);
                    fileElement.addEventListener('dragstart', function (e) {
                      onFileDragStart(e, fileBox.id);
                    }, false);
                  }

                  var removeElement = fileElement.querySelector('.remove');

                  if (removeElement) {
                    removeElement.addEventListener('click', function (e) {
                      onFileRemoveClick(e, input, index);
                    }, false);
                  }

                  filesElement.append(fileElement);
                })(files[f], f);
              }
            })();
          }
        })();
      }

      if (files.length > originalFiles.length) {
        filebokz.triggerEvent('file-added', fileBox);
      } else if (files.length < originalFiles.length) {
        filebokz.triggerEvent('file-removed', fileBox);
      }
    };

    var onDragEnter = function onDragEnter(e, fileBox, input) {
      e.preventDefault();
      e.stopPropagation();
      fileBox.classList.add('is-dragging');
    };

    var onDragLeave = function onDragLeave(e, fileBox) {
      e.preventDefault();
      e.stopPropagation();
      fileBox.classList.remove('is-dragging');
    };

    var onDrop = function onDrop(e, fileBox, input) {
      e.preventDefault();
      e.stopPropagation();
      fileBox.classList.remove('is-dragging');
      var files = e.dataTransfer.files;
      var oldFileBoxId = e.dataTransfer.getData('fileBoxId');

      if (oldFileBoxId) {
        var oldFileIndex = e.dataTransfer.getData('fileIndex');
        var oldFileBox = document.getElementById(oldFileBoxId);
        var oldInput = oldFileBox.querySelector('input');
        var oldFileElement = oldFileBox.querySelector('.files').children[oldFileIndex];
        oldFileBox.classList.remove('is-dragging');
        oldFileBox.classList.remove('is-removing');
        oldFileBox.classList.remove('is-transferring');
        oldFileElement.classList.remove('is-dragging');
        oldFileElement.classList.remove('is-removing');
        oldFileElement.classList.remove('is-transferring');
        if (oldFileBoxId === fileBox.id) return;
        var oldFilesArr = Array.from(oldInput.files);
        var file = oldFilesArr[oldFileIndex];
        var filesArr = Array.from(input.files);
        var multiple = input.hasAttribute('multiple') && input.getAttribute('multiple').toLowerCase() !== 'false';

        if (multiple) {
          filesArr.push(file);
        } else {
          filesArr = [file];
        }

        if (validateFiles(filesArr, fileBox, input)) {
          files = filebokz.newFileList(filesArr);
          oldFilesArr.splice(oldFileIndex, 1);
          oldInput.files = filebokz.newFileList(oldFilesArr);
          filebokz.triggerEvent('change', oldInput, {
            filebokzAction: 'remove'
          });
        }
      }

      if (files && files.length) {
        input.files = files;
        filebokz.triggerEvent('change', input);
      }
    };

    var onFileDrag = function onFileDrag(e, fileBoxId) {
      e.preventDefault();
      e.stopPropagation();
      var overElement = document.elementFromPoint(e.pageX, e.pageY);

      if (overElement) {
        var fileBox = document.getElementById(fileBoxId);
        var newFileBox = overElement.closest('[filebokz-id]');

        if (newFileBox && newFileBox.classList.contains('js-enabled')) {
          if (newFileBox.id !== fileBoxId) {
            e.target.classList.add('is-transferring');
            fileBox.classList.add('is-transferring');
          }

          e.target.classList.remove('is-removing');
          fileBox.classList.remove('is-removing');
        } else {
          e.target.classList.add('is-removing');
          fileBox.classList.add('is-removing');
          e.target.classList.remove('is-transferring');
          fileBox.classList.remove('is-transferring');
        }
      }
    };

    var onFileDragStart = function onFileDragStart(e, fileBoxId, index) {
      e.target.classList.add('is-dragging');
      var fileIndex = Array.from(e.target.parentNode.children).indexOf(e.target);
      e.dataTransfer.setData('fileBoxId', fileBoxId);
      e.dataTransfer.setData('fileIndex', fileIndex);
    };

    var onFileRemoveClick = function onFileRemoveClick(e, input, index) {
      e.preventDefault();
      e.stopPropagation();
      filebokz.removeFiles(input, index);
    };

    var onFocus = function onFocus(e, fileBox) {
      fileBox.classList.add('in-focus');
    };

    var onReset = function onReset(e, fileBox, input) {
      var error = fileBox.querySelector('.error');
      if (error) error.innerHTML = '';
      fileBox.classList.remove('error');
      filebokz.triggerEvent('change', input);
    };

    var onSubmit = function onSubmit(e, fileBox) {
      fileBox.classList.add('is-uploading');
    };

    var onWindowDragOver = function onWindowDragOver(e) {
      e.preventDefault();
    };

    var onWindowDrop = function onWindowDrop(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      var fileBoxId = e.dataTransfer.getData('fileBoxId');

      if (fileBoxId) {
        var fileBox = document.getElementById(fileBoxId);
        var input = fileBox.querySelector('input');
        var index = e.dataTransfer.getData('fileIndex');
        filebokz.removeFiles(input, index);
      }
    };

    var validateFiles = function validateFiles(fileList, fileBox, input) {
      var fileBoxData = fileBox.dataset;
      var multiple = input.hasAttribute('multiple') && input.getAttribute('multiple').toLowerCase() !== 'false';
      var maxFiles = !multiple ? 1 : Object.prototype.hasOwnProperty.call(fileBoxData, 'maxFiles') ? fileBoxData.maxFiles : null;
      var maxFileSize = fileBoxData.maxFileSize;
      var maxSize = fileBoxData.maxSize;
      var allowedExtensions = fileBoxData.allowedExtensions ? fileBoxData.allowedExtensions.split(',') : null;
      var size = 0;

      if (maxFiles && fileList.length > maxFiles) {
        displayErrorMessage(fileBox, 'maxFiles', maxFiles);
        return false;
      }

      for (var i = 0; i < fileList.length; i++) {
        var ext = fileList[i].name.split('.');

        if (ext) {
          ext = ext.pop().toLowerCase();
        } else {
          ext = '[none]';
        }

        size += fileList[i].size;

        if (maxFileSize && fileList[i].size > maxFileSize) {
          displayErrorMessage(fileBox, 'maxFileSize', maxFileSize);
          return false;
        }

        if (maxSize && size > maxSize) {
          displayErrorMessage(fileBox, 'maxSize', maxSize);
          return false;
        }

        if (allowedExtensions && !allowedExtensions.includes(ext)) {
          displayErrorMessage(fileBox, 'allowedExtensions', allowedExtensions.join(', '));
          return false;
        }
      }

      return true;
    };

    for (var i = 0; i < elements.length; i++) {
      (function (fileBox) {
        var form = fileBox.closest('form');
        var input = fileBox.querySelector('input[type="file"]');
        if (!input || fileBox.classList.contains('no-js') || Object.prototype.hasOwnProperty.call(fileBox.dataset, 'filebokzId')) return;
        filebokz.count++;
        fileBox.dataset.filebokzId = filebokz.count;
        fileBox.classList.add('js-enabled');
        if (applyClass && !fileBox.classList.contains(applyClass)) fileBox.classList.add(applyClass);
        if (advanced) fileBox.classList.add('is-advanced');
        if (draggable) fileBox.classList.add('is-draggable');
        if (!fileBox.id) fileBox.id = 'filebokz-' + filebokz.count;
        fileBox.addEventListener('dragover', function (e) {
          onDragEnter(e, fileBox);
        }, false);
        fileBox.addEventListener('dragenter', function (e) {
          onDragEnter(e, fileBox);
        }, false);
        fileBox.addEventListener('dragleave', function (e) {
          onDragLeave(e, fileBox);
        }, false);
        fileBox.addEventListener('drop', function (e) {
          onDrop(e, fileBox, input);
        }, false);
        input.addEventListener('change', function (e) {
          onChange(e, fileBox, input);
        }, false);
        input.addEventListener('focus', function (e) {
          onFocus(e, fileBox);
        }, false);
        input.addEventListener('blur', function (e) {
          onBlur(e, fileBox);
        }, false);

        if (form) {
          if (fileBox.dataset.autoSubmit && fileBox.dataset.autoSubmit.toLowerCase() !== 'false') {
            input.addEventListener('change', function (e) {
              form.submit();
            }, false);
          }

          form.addEventListener('reset', function (e) {
            onReset(e, fileBox, input);
          }, false);
          form.addEventListener('submit', function (e) {
            onSubmit(e, fileBox);
          }, false);
        }

        onChange(new Event('change'), fileBox, input);
      })(elements[i]);
    }

    window.addEventListener('dragover', function (e) {
      onWindowDragOver(e);
    }, false);
    window.addEventListener('drop', function (e) {
      onWindowDrop(e);
    }, false);
    return elements;
  };

  filebokz.addFiles = function (input, files) {
    var filesArr = Array.from(input.files);
    filesArr.concat(Array.from(files));
    input.files = filebokz.newFileList(filesArr);
    filebokz.triggerEvent('change', input);
  };

  filebokz.newFileList = function (files) {
    var dt;

    try {
      dt = new DataTransfer();
    } catch (e) {
      dt = new ClipboardEvent('');
    }

    for (var i = 0; i < files.length; i++) {
      dt.items.add(files[i]);
    }

    return dt.files;
  };

  filebokz.removeFiles = function (input, index, count) {
    var filesArr = Array.from(input.files);
    filesArr.splice(index || 0, count || 1);
    input.files = filebokz.newFileList(filesArr);
    filebokz.triggerEvent('change', input, {
      filebokzAction: 'remove'
    });
  };

  filebokz.triggerEvent = function (type, element, data, delay) {
    return setTimeout(function () {
      var e = new Event(type);

      for (var key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) e[key] = data[key];
      }

      element.dispatchEvent(e);
    }, delay || 1);
  };

  return filebokz;

}));
//# sourceMappingURL=filebokz.js.map
