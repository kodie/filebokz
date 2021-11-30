/*!
  filebokz v0.1.1 (https://github.com/kodie/filebokz)
  by Kodie Grantham (https://kodieg.com)
*/

const filebokz = (elements, applyClass) => {
  if (!elements) elements = '.filebokz'
  if (typeof applyClass !== 'string') applyClass = 'filebokz'

  const imageTypes = ['apng', 'bmp', 'gif', 'x-icon', 'jpeg', 'png', 'svg+xml', 'tiff', 'webp']
  const sizeUnits = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const div = document.createElement('div')
  const draggable = ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)
  const advanced = ('FormData' in window && 'FileReader' in window)

  if (!filebokz.count) filebokz.count = 0

  if (typeof elements === 'string') {
    elements = document.querySelectorAll(elements)
  } else if (elements instanceof HTMLElement) {
    elements = [elements]
  }

  const displayErrorMessage = (fileBox, errorType, variable) => {
    const element = fileBox.querySelector('.error-msg')
    const errorDisplayDuration = fileBox.dataset.errorDisplayDuration || 3000

    fileBox.classList.add('error')

    const fileBoxData = fileBox.dataset
    let message = ''

    if (errorType === 'maxFiles') {
      message = fileBoxData.maxFilesErrorMsg || 'A maximum of {variable} file{s} can be uploaded.'
      message = message.replace(/{variable}/ig, variable)
      message = message.replace(/{s}/ig, (variable > 1) ? 's' : '')
    }

    if (errorType === 'maxFileSize') {
      message = fileBoxData.maxFileSizeErrorMsg || 'File size cannot exceed {variable}.'
      message = message.replace(/{variable}/ig, fileSize(variable))
    }

    if (errorType === 'maxSize') {
      message = fileBoxData.maxSizeErrorMsg || 'Total combined file size cannot exceed {variable}.'
      message = message.replace(/{variable}/ig, fileSize(variable))
    }

    if (errorType === 'allowedExtensions') {
      message = fileBoxData.allowedExtensionsErrorMsg || 'Only the following file types are allowed: {variable}.'
      message = message.replace(/{variable}/ig, variable)
    }

    if (element) {
      element.innerHTML = message

      let errorAnimationDuration = 250
      if (Object.prototype.hasOwnProperty.call(fileBox.dataset, 'errorAnimationDuration')) {
        errorAnimationDuration = fileBox.dataset.errorAnimationDuration
      }

      setTimeout(function () {
        element.innerHTML = ''
      }, errorDisplayDuration + errorAnimationDuration)
    }

    setTimeout(function () {
      fileBox.classList.remove('error')
    }, errorDisplayDuration)

    filebokz.triggerEvent('error', fileBox, {
      errorMessage: message,
      errorType: errorType
    })
  }

  const fileAttribute = (attributes, attrPrefix, typePrefix, typeKey) => {
    if (Object.prototype.hasOwnProperty.call(attributes, attrPrefix + typeKey)) {
      return attributes[attrPrefix + typeKey]
    } else if (Object.prototype.hasOwnProperty.call(attributes, attrPrefix + typePrefix)) {
      return attributes[attrPrefix + typePrefix]
    }
  }

  const fileSize = (bytes) => {
    if (Math.abs(bytes) < 1024) return bytes + ' B'

    let u = -1

    do {
      bytes /= 1024
      ++u
    } while (Math.round(Math.abs(bytes) * 10) / 10 >= 1024 && u < sizeUnits.length - 1)

    return +bytes.toFixed(1) + ' ' + sizeUnits[u]
  }

  const onBlur = (e, fileBox) => {
    fileBox.classList.remove('in-focus')
  }

  const onChange = (e, fileBox, input) => {
    let files = input.files
    const originalFiles = input.originalFiles || []
    const removing = e.filebokzAction === 'remove'

    if (files.length) {
      const appendable = !fileBox.dataset.appendable || fileBox.dataset.appendable.toLowerCase() !== 'false'
      const multiple = input.hasAttribute('multiple') && input.getAttribute('multiple').toLowerCase() !== 'false'

      if (appendable && multiple && !removing && originalFiles.length) {
        const filesArr = Array.from(files)
        const newFilesArr = Array.from(originalFiles)

        for (let i = 0; i < filesArr.length; i++) {
          let duplicateFound = false

          for (let k = 0; k < newFilesArr.length; k++) {
            if (
              filesArr[i].lastModifed === newFilesArr[k].lastModifed &&
              filesArr[i].name === newFilesArr[k].name &&
              filesArr[i].size === newFilesArr[k].size &&
              filesArr[i].type === newFilesArr[k].type
            ) duplicateFound = true
          }

          if (!duplicateFound) newFilesArr.push(filesArr[i])
        }

        input.files = filebokz.newFileList(newFilesArr)
        files = input.files
      }

      if (validateFiles(files, fileBox, input)) {
        fileBox.classList.add('has-files')
      } else {
        files = []
      }
    }

    if (!files.length && !removing) {
      input.files = filebokz.newFileList(originalFiles)
      files = input.files
    }

    if (!files.length) {
      fileBox.classList.remove('has-files')
    }

    input.originalFiles = files
    fileBox.dataset.fileCount = files.length

    const fileCountElement = fileBox.querySelector('.file-count')
    if (fileCountElement) fileCountElement.innerHTML = files.length

    let size = 0
    for (let s = 0; s < files.length; s++) {
      size += files[s].size
    }

    fileBox.dataset.size = size

    const sizeElement = fileBox.querySelector('.size')
    if (sizeElement) sizeElement.innerHTML = fileSize(size)

    const filesElement = fileBox.querySelector('.files')
    if (filesElement) {
      const filesElementData = filesElement.dataset

      const fileElements = filesElement.querySelectorAll('.file')
      if (fileElements) {
        for (let fe = 0; fe < fileElements.length; fe++) {
          filesElement.removeChild(fileElements[fe])
        }
      }

      if (files.length) {
        const draggableFiles = !filesElementData.draggable || filesElementData.draggable.toLowerCase() !== 'false'

        for (let f = 0; f < files.length; f++) {
          (function (file, index) {
            let typePrefix = file.type.split('/')[0]
            const typeKey = file.type
              .replace(/[/+-](\w{1})/g, function (c) { return c.toUpperCase() })
              .replace(/[/+-]/g, '')

            typePrefix = typePrefix.charAt(0).toUpperCase() + typePrefix.slice(1)

            let element = fileAttribute(filesElementData, 'element', typePrefix, typeKey)
            element = element || filesElementData.element || 'span'

            let content = fileAttribute(filesElementData, 'content', typePrefix, typeKey)
            content = content || filesElementData.content || '{name}'

            let contentBefore = fileAttribute(filesElementData, 'contentBefore', typePrefix, typeKey)
            contentBefore = contentBefore || filesElementData.contentBefore || ''

            let contentAfter = fileAttribute(filesElementData, 'contentAfter', typePrefix, typeKey)
            contentAfter = contentAfter || filesElementData.contentAfter || ''

            let url = fileAttribute(filesElementData, 'url', typePrefix, typeKey)

            if (!url) {
              if (imageTypes.includes(file.type.replace('image/', ''))) {
                url = window.URL.createObjectURL(file)
              } else {
                url = filesElementData.url || ''
              }
            }

            content = contentBefore + content + contentAfter
            content = content.replace(/{name}/ig, file.name)
            content = content.replace(/{type}/ig, file.type)
            content = content.replace(/{size}/ig, fileSize(file.size))
            content = content.replace(/{url}/ig, url)

            const fileElement = document.createElement(element)

            fileElement.className = 'file'
            fileElement.innerHTML = content

            if (draggable && draggableFiles) {
              fileElement.draggable = 'true'
              fileElement.addEventListener('drag', function (e) { onFileDrag(e, fileBox.id) }, false)
              fileElement.addEventListener('dragstart', function (e) { onFileDragStart(e, fileBox.id) }, false)
            }

            const removeElement = fileElement.querySelector('.remove')
            if (removeElement) {
              removeElement.addEventListener('click', function (e) { onFileRemoveClick(e, input, index) }, false)
            }

            filesElement.append(fileElement)
          })(files[f], f)
        }
      }
    }

    if (files.length > originalFiles.length) {
      filebokz.triggerEvent('file-added', fileBox)
    } else if (files.length < originalFiles.length) {
      filebokz.triggerEvent('file-removed', fileBox)
    }
  }

  const onDragEnter = (e, fileBox, input) => {
    e.preventDefault()
    e.stopPropagation()
    fileBox.classList.add('is-dragging')
  }

  const onDragLeave = (e, fileBox) => {
    e.preventDefault()
    e.stopPropagation()
    fileBox.classList.remove('is-dragging')
  }

  const onDrop = (e, fileBox, input) => {
    e.preventDefault()
    e.stopPropagation()

    fileBox.classList.remove('is-dragging')

    let files = e.dataTransfer.files
    const oldFileBoxId = e.dataTransfer.getData('fileBoxId')

    if (oldFileBoxId) {
      const oldFileIndex = e.dataTransfer.getData('fileIndex')
      const oldFileBox = document.getElementById(oldFileBoxId)
      const oldInput = oldFileBox.querySelector('input')
      const oldFileElement = oldFileBox.querySelector('.files').children[oldFileIndex]

      oldFileBox.classList.remove('is-dragging')
      oldFileBox.classList.remove('is-removing')
      oldFileBox.classList.remove('is-transferring')
      oldFileElement.classList.remove('is-dragging')
      oldFileElement.classList.remove('is-removing')
      oldFileElement.classList.remove('is-transferring')

      if (oldFileBoxId === fileBox.id) return

      const oldFilesArr = Array.from(oldInput.files)
      const file = oldFilesArr[oldFileIndex]
      let filesArr = Array.from(input.files)
      const multiple = input.hasAttribute('multiple') && input.getAttribute('multiple').toLowerCase() !== 'false'

      if (multiple) {
        filesArr.push(file)
      } else {
        filesArr = [file]
      }

      if (validateFiles(filesArr, fileBox, input)) {
        files = filebokz.newFileList(filesArr)

        oldFilesArr.splice(oldFileIndex, 1)
        oldInput.files = filebokz.newFileList(oldFilesArr)

        filebokz.triggerEvent('change', oldInput, { filebokzAction: 'remove' })
      }
    }

    if (files && files.length) {
      input.files = files
      filebokz.triggerEvent('change', input)
    }
  }

  const onFileDrag = (e, fileBoxId) => {
    e.preventDefault()
    e.stopPropagation()

    const overElement = document.elementFromPoint(e.pageX, e.pageY)

    if (overElement) {
      const fileBox = document.getElementById(fileBoxId)
      const newFileBox = overElement.closest('[filebokz-id]')

      if (newFileBox && newFileBox.classList.contains('js-enabled')) {
        if (newFileBox.id !== fileBoxId) {
          e.target.classList.add('is-transferring')
          fileBox.classList.add('is-transferring')
        }

        e.target.classList.remove('is-removing')
        fileBox.classList.remove('is-removing')
      } else {
        e.target.classList.add('is-removing')
        fileBox.classList.add('is-removing')
        e.target.classList.remove('is-transferring')
        fileBox.classList.remove('is-transferring')
      }
    }
  }

  const onFileDragStart = (e, fileBoxId, index) => {
    e.target.classList.add('is-dragging')

    const fileIndex = Array.from(e.target.parentNode.children).indexOf(e.target)

    e.dataTransfer.setData('fileBoxId', fileBoxId)
    e.dataTransfer.setData('fileIndex', fileIndex)
  }

  const onFileRemoveClick = (e, input, index) => {
    e.preventDefault()
    e.stopPropagation()
    filebokz.removeFiles(input, index)
  }

  const onFocus = (e, fileBox) => {
    fileBox.classList.add('in-focus')
  }

  const onReset = (e, fileBox, input) => {
    const error = fileBox.querySelector('.error')
    if (error) error.innerHTML = ''

    fileBox.classList.remove('error')

    filebokz.triggerEvent('change', input)
  }

  const onSubmit = (e, fileBox) => {
    fileBox.classList.add('is-uploading')
  }

  const onWindowDragOver = (e) => {
    e.preventDefault()
  }

  const onWindowDrop = (e) => {
    e.preventDefault()
    e.stopImmediatePropagation()

    const fileBoxId = e.dataTransfer.getData('fileBoxId')

    if (fileBoxId) {
      const fileBox = document.getElementById(fileBoxId)
      const input = fileBox.querySelector('input')
      const index = e.dataTransfer.getData('fileIndex')

      filebokz.removeFiles(input, index)
    }
  }

  const validateFiles = (fileList, fileBox, input) => {
    const fileBoxData = fileBox.dataset
    const multiple = input.hasAttribute('multiple') && input.getAttribute('multiple').toLowerCase() !== 'false'
    const maxFiles = !multiple ? 1 : Object.prototype.hasOwnProperty.call(fileBoxData, 'maxFiles') ? fileBoxData.maxFiles : null
    const maxFileSize = fileBoxData.maxFileSize
    const maxSize = fileBoxData.maxSize
    const allowedExtensions = fileBoxData.allowedExtensions ? fileBoxData.allowedExtensions.split(',') : null
    let size = 0

    if (maxFiles && fileList.length > maxFiles) {
      displayErrorMessage(fileBox, 'maxFiles', maxFiles)
      return false
    }

    for (let i = 0; i < fileList.length; i++) {
      let ext = fileList[i].name.split('.')

      if (ext) {
        ext = ext.pop().toLowerCase()
      } else {
        ext = '[none]'
      }

      size += fileList[i].size

      if (maxFileSize && fileList[i].size > maxFileSize) {
        displayErrorMessage(fileBox, 'maxFileSize', maxFileSize)
        return false
      }

      if (maxSize && size > maxSize) {
        displayErrorMessage(fileBox, 'maxSize', maxSize)
        return false
      }

      if (allowedExtensions && !allowedExtensions.includes(ext)) {
        displayErrorMessage(fileBox, 'allowedExtensions', allowedExtensions.join(', '))
        return false
      }
    }

    return true
  }

  for (let i = 0; i < elements.length; i++) {
    (function (fileBox) {
      const form = fileBox.closest('form')
      const input = fileBox.querySelector('input[type="file"]')

      if (!input || fileBox.classList.contains('no-js') || Object.prototype.hasOwnProperty.call(fileBox.dataset, 'filebokzId')) return

      filebokz.count++

      fileBox.dataset.filebokzId = filebokz.count
      fileBox.classList.add('js-enabled')

      if (applyClass && !fileBox.classList.contains(applyClass)) fileBox.classList.add(applyClass)
      if (advanced) fileBox.classList.add('is-advanced')
      if (draggable) fileBox.classList.add('is-draggable')
      if (!fileBox.id) fileBox.id = 'filebokz-' + filebokz.count

      fileBox.addEventListener('dragover', function (e) { onDragEnter(e, fileBox, input) }, false)
      fileBox.addEventListener('dragenter', function (e) { onDragEnter(e, fileBox, input) }, false)
      fileBox.addEventListener('dragleave', function (e) { onDragLeave(e, fileBox, input) }, false)
      fileBox.addEventListener('drop', function (e) { onDrop(e, fileBox, input) }, false)

      input.addEventListener('change', function (e) { onChange(e, fileBox, input) }, false)
      input.addEventListener('focus', function (e) { onFocus(e, fileBox) }, false)
      input.addEventListener('blur', function (e) { onBlur(e, fileBox) }, false)

      if (form) {
        if (fileBox.dataset.autoSubmit && fileBox.dataset.autoSubmit.toLowerCase() !== 'false') {
          input.addEventListener('change', function (e) { form.submit() }, false)
        }

        form.addEventListener('reset', function (e) { onReset(e, fileBox, input) }, false)
        form.addEventListener('submit', function (e) { onSubmit(e, fileBox) }, false)
      }

      onChange(new Event('change'), fileBox, input)
    })(elements[i])
  }

  window.addEventListener('dragover', function (e) { onWindowDragOver(e) }, false)
  window.addEventListener('drop', function (e) { onWindowDrop(e) }, false)

  return elements
}

filebokz.addFiles = (input, files) => {
  const filesArr = Array.from(input.files)

  filesArr.concat(Array.from(files))
  input.files = filebokz.newFileList(filesArr)

  filebokz.triggerEvent('change', input)
}

filebokz.newFileList = (files) => {
  let dt

  try {
    dt = new DataTransfer()
  } catch (e) {
    dt = new ClipboardEvent('')
  }

  for (let i = 0; i < files.length; i++) {
    dt.items.add(files[i])
  }

  return dt.files
}

filebokz.removeFiles = (input, index, count) => {
  const filesArr = Array.from(input.files)

  filesArr.splice(index || 0, count || 1)
  input.files = filebokz.newFileList(filesArr)

  filebokz.triggerEvent('change', input, { filebokzAction: 'remove' })
}

filebokz.triggerEvent = (type, element, data, delay) => {
  return setTimeout(function () {
    const e = new Event(type)

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) e[key] = data[key]
    }

    element.dispatchEvent(e)
  }, delay || 1)
}

export default filebokz
