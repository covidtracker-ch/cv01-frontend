
// marks new form data entries that don't yet have a server-generated code
var REPLACE_SENTINEL = '__replace-me__';

// ---------------------------------------------------------------------------------------------
// --- form data store manipulation
// ---------------------------------------------------------------------------------------------

/**
 * Replaces keys marked 'oldCode' with 'newCode' in the form data store.
 * @param oldCode the code to replace
 * @param newCode the code with which to replace it
 */
function replaceKeyInStore(oldCode, newCode) {
  var allResponses = JSON.parse(localStorage.getItem('formData'));

  if (allResponses && allResponses[oldCode]) {
    // swap in the new code for the replacement sentinel value
    allResponses[newCode] = allResponses[oldCode];
    allResponses[newCode]['participantCode'] = newCode;
    delete allResponses[oldCode];
    localStorage.setItem('formData', JSON.stringify(allResponses));
  }
}

/**
 * Removes the key 'code' from the store
 * @param code the code to remove
 */
function deleteKeyInStore(code) {
  var allResponses = JSON.parse(localStorage.getItem('formData'));

  if (allResponses && allResponses[code]) {
    // swap in the new code for the replacement sentinel value
    delete allResponses[code];
    localStorage.setItem('formData', JSON.stringify(allResponses));
  }
}

/**
 * Sets the key at 'code' to 'payload'
 * @param code the code to update
 * @param payload the value to which to update it
 */
function updateStore(code, payload) {
  var allResponses = JSON.parse(localStorage.getItem('formData')) || {};
  allResponses[code] = payload;
  localStorage.setItem('formData', JSON.stringify(allResponses));
}

function getStoreByCode(code) {
  var allResponses = JSON.parse(localStorage.getItem('formData')) || {};
  return (code && allResponses[code]) ? allResponses[code] : null;
}


// ---------------------------------------------------------------------------------------------
// --- form persistence, reloading
// ---------------------------------------------------------------------------------------------

function excludeField(fieldName) {
  // skip unnamed elements and fields that aren't supposed to be persisted
  return (
      !fieldName ||
      fieldName === "firstTimeSurvey" ||
      fieldName === "participantCodeList" ||
      fieldName === "participantCodeManual"
  );
}

// persist form's current data to localStorage
// if a participant code is specified, associate the data with that code
// if not, associate it with REPLACE_SENTINEL, which gets replaced with a
// code if the response is successful.
// if the response is unsuccessful, the stored data for the sentinel value is cleared.
// (we may want to revisit that last point later...)
function persistForm() {
  if (form) {
    var payload = {};

    // add the current language in to the submission so the server can construct a language-aware redirect URL
    var lang = document.getElementById('lang');
    if (lang) {
      lang.value = document.body.dataset.lang;
      localStorage.setItem('languageOverwrite', lang.value); // also ensure the local lang is consistent
    }

    // first, check if they consented to saving their responses; only proceed to save this user's data
    // if they consent. if they don't consent to saving cookies, their form data is cleared.
    var saveResponses = document.querySelector('input[name="saveResponses"]:checked').value;
    if (saveResponses == 1) {
      for (var i = 0; i < form.elements.length; i++) {
        var elem = form.elements[i];

        if (excludeField(elem.name)) {
          continue;
        }

        var pageElems = document.getElementsByName(elem.name);

        if (pageElems.length > 1) {
          // if there are multiple elements with this name, figure out which one is enabled
          for (var j = 0; j < pageElems.length; j++) {
            var option = pageElems[j];

            if (option.checked) {
              payload[elem.name] = option.value;
            }
          }
        } else if (pageElems[0]) {
          // if there's only one element, we can just take its value
          payload[elem.name] = (pageElems[0].getAttribute('type') === 'checkbox')
            ? elem.checked
            : elem.value;
        }
      }
    }

    // determine the current code. we start by assuming there's no code,
    // then determine if they specified it somehow
    var code = REPLACE_SENTINEL;

    if (form.elements["firstTimeSurvey"].value == 0) {
      // it's not their first time...
      if (form.elements["participantCodeList"].value != "__none__") {
        // ...and they've selected an existing code
        code = form.elements["participantCodeList"].value
      }
      else if (form.elements["participantCodeManual"].value.trim() != "") {
        // ...and they've possibly entered a new code
        code = form.elements["participantCodeManual"].value.trim()
      }

      // we also need to update the effective participant code the gets sent to the server if
      // it's been specified by the user (otherwise it's blank and the server generates us a new code)
      var effectiveParticipantCode = document.getElementById('effectiveParticipantCode');
      effectiveParticipantCode.value = code;
    }

    // update just this subkey in formData
    updateStore(code, payload);
  }
}

// load existing form data from localStorage if present
function rehydrateForm(fromCode) {
  if (!form) {
    return;
  }

  var allResponses = JSON.parse(localStorage.getItem('formData'));

  if (!allResponses) {
    return;
  }

  // either load the form data, or at least form data w/the most recent code if that's all we have
  // (if lastCode is null, this is effectively the same as loading an empty form)
  var payload = (fromCode && allResponses[fromCode])
      ? allResponses[fromCode]
      : { participantCode: fromCode };

  // merge form elems with loaded data
  for (var i = 0; i < form.elements.length; i++) {
    var elem = form.elements[i];

    if (excludeField(elem.name)) {
      continue;
    }

    var pageElems = document.getElementsByName(elem.name);

    // if there are multiple elements, it's a radio button or checkbox list
    if (pageElems.length > 1) {
      for (var j = 0; j < pageElems.length; j++) {
        var option = pageElems[j];

        if (option.getAttribute('type') === 'checkbox') {
          if (payload[elem.name] && payload[elem.name].includes(option.value)) {
            option.checked = true
          }
        }
        else {
          if ((payload[elem.name] === option.value)) {
            // click the element to get change handlers to fire
            option.click();
          }
        }
      }
    }
    else if (pageElems[0]) {
      // it's a simple value
      if (pageElems[0].getAttribute('type') === 'checkbox' && payload[elem.name]) {
          pageElems[0].checked = true;
      }
      else if (pageElems[0].tagName.toUpperCase() === 'SELECT') {
        // iterate through the options to find a match
        var opts = pageElems[0].options;
        for (var idx = 0; idx < opts.length; idx++) {
          if (opts[idx].value === payload[elem.name]) {
            opts[idx].selected = true;
            break;
          }
        }
      }
      else {
        pageElems[0].value = payload[elem.name] ? payload[elem.name].trim()  : '';
      }
    }
  }

  // select 'no' for 'first time filling out form' prompt if there's a code
  if (fromCode) {
    document.getElementById('firstTimeSurvey-0').click();
  }
}

function clearForm() {
  for (var i = 0; i < form.elements.length; i++) {
    var elem = form.elements[i];

    if (excludeField(elem.name)) {
      continue;
    }

    var pageElems = document.getElementsByName(elem.name);

    if (pageElems.length > 1) {
      for (var j = 0; j < pageElems.length; j++) {
          pageElems[j].checked = false;
      }
    }
    else if (pageElems[0]) {
      if (pageElems[0].getAttribute('type') === 'checkbox') {
        pageElems[0].checked = false;
      }
      else if (elem.tagName.toUpperCase() === 'SELECT') {
        elem.value = elem.options[0].value;
      }
      else {
        pageElems[0].value = '';
      }
    }
  }
}

// ---------------------------------------------------------------------------------------------
// --- achievement store
// ---------------------------------------------------------------------------------------------

/**
 * Sets the key in the actions store at 'code' to 'payload'
 * @param code the code to update
 * @param payload the value to which to update it
 */
function updateActions(code, payload) {
  var allResponses = JSON.parse(localStorage.getItem('actions')) || {};
  allResponses[code] = payload;
  localStorage.setItem('actions', JSON.stringify(allResponses));
}

/**
 * Retrieves the actions stored for code
 * @param {*} code the code of the user
 */
function getActions(code) {
  var allActions = JSON.parse(localStorage.getItem('actions')) || {};
  return allActions[code] || {};
}

/**
 * Records the action 'action' as occurring now
 * @param code the code that performed the action, or falsey to look up the current user
 * @param action the action that was performed
 */
function registerAction(action, code) {
  if (!code) {
    // try to figure out the code of the current user
    code = localStorage.getItem('lastCode');
    if (!code) {
      // we tried twice, no dice...
      // abort b/c we can't track actions for someone who doesn't have a code
      return; 
    }
  }

  // if they don't have real saved form data, they've opted out of tracking, so bail
  var formData = getStoreByCode(code);
  if (!formData || !formData['consentToStudy']) {
    return;
  }

  var myActions = getActions(code);

  // either retrieve or create the list of timestamps for this action
  var curActions = myActions[action] || [];

  // push the current time into this actions' event queue
  curActions.push(new Date().getTime());
  // and keep a queue of max 365 entries per action
  curActions = curActions.slice(-365);

  myActions[action] = curActions;
  updateActions(code, myActions);
}
