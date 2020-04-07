var form = document.getElementById('covid-form');
var toggles = document.querySelectorAll('.js-toggle');
var hiddens = document.querySelectorAll('.js-hide');
var langLinks = document.querySelectorAll('.js-setLang');

function searchParams() {
  var pairs = window.location.search.substring(1).split("&"), obj = {}, pair, i;
  for (i in pairs) {
    if ( pairs[i] === "" ) { continue }
    pair = pairs[i].split("=");
    obj[ decodeURIComponent( pair[0] ) ] = decodeURIComponent( pair[1] );
  }
  return obj;
}

function checkForCode() {
  var params = searchParams();
  var lastCode;

  if (params['code']) {
    // set this code as the last-used code
    lastCode = params['code'];
    localStorage.setItem('lastCode', lastCode);

    // search through formData and replace any keys we deferred with the new code
    replaceKeyInStore(REPLACE_SENTINEL, lastCode);
  }
  else {
    lastCode = localStorage.getItem('lastCode');
  }

  // if there's an element that displays a code, fill it with the current one
  var yourCodeHere = document.getElementById('yourCodeHere');
  if (yourCodeHere) {
    yourCodeHere.innerText = lastCode;
  }
}

function checkError() {
  var params = searchParams();
  if (params['error'] === 'true') {
    document.getElementById('msg-error').classList.remove('hidden');

    // clean up the unfinished form data, since we don't have a code for it
    // FIXME: is this the right behavior, or should we just reload the form with this data?
    deleteKeyInStore(REPLACE_SENTINEL);
  }
}

function goToLang(lang) {
  var path = window.location.pathname.split("/").pop();
  if(lang == 'de') {
    window.location.assign(window.location.origin + '/' + path);
  }else{
    window.location.assign(window.location.origin + '/' + lang + '/' + path);
  }
}
function checkLang() {
  var userLang = navigator.language || navigator.userLanguage;
  userLang = userLang.slice(0,2);
  var currentLang = document.body.dataset.lang;
  var overwrittenLang = localStorage.getItem('languageOverwrite');

  if(userLang == currentLang) {
    return;
  }

  if(overwrittenLang) {
    if(overwrittenLang == currentLang) return;
    goToLang(overwrittenLang);
    return;
  }

  if(userLang == 'fr') {
    localStorage.setItem('languageOverwrite', 'fr');
    goToLang('fr');
  } else if(userLang == 'it') {
    localStorage.setItem('languageOverwrite', 'it');
    goToLang('it');
  } else if(userLang == 'en') {
    localStorage.setItem('languageOverwrite', 'en');
    goToLang('en');
  }
}

function setupForm() {
  if(form) {
    for(var i=0; i < hiddens.length; i++) {
      hiddens[i].classList.remove('js-hide');
      hiddens[i].classList.add('hidden');
    }

    for(var i=0; i < toggles.length; i++) {
      var event = toggles[i].tagName.toUpperCase() === 'A' ? 'click' : 'input';

      toggles[i].addEventListener(event, function(e) {
        if (e.type === 'click') {
          e.preventDefault();
        }

        if (e.target.dataset.hide) {
          document.getElementById(e.target.dataset.hide).classList.add('hidden');
        }
        if (e.target.dataset.show) {
          document.getElementById(e.target.dataset.show).classList.remove('hidden');
        }
      });
    }

    for(var i=0; i < langLinks.length; i++) {
      langLinks[i].addEventListener('click', function(e) {
        localStorage.setItem('languageOverwrite', e.currentTarget.dataset.lang);
      });
    }
  }
}


// ---------------------------------------------------------------------------------------------
// --- participant code handling
// ---------------------------------------------------------------------------------------------

function getLastCode() {
  var lastCode = localStorage.getItem('lastCode');

  if (!lastCode) {
    var allResponses = JSON.parse(localStorage.getItem('formData'));

    // since no code was specified, fetch the first entry in formData
    // (i'm using this silly for loop b/c Object.values() doesn't exist in IE*)
    for (var code in allResponses) {
      if (!allResponses.hasOwnProperty(code))
        continue;
      lastCode = code;
      break;
    }
  }

  return lastCode;
}

function bindParticipantsList(lastCode) {
  // populate the participant dropdown with values
  var partElem = document.getElementById('participantCodeList'), code, newOption;

  if (!partElem) {return;}

  var allResponses = JSON.parse(localStorage.getItem('formData'));

  if (allResponses) {
    for (code in allResponses) {
      if (!allResponses.hasOwnProperty(code))
        continue;

      newOption = document.createElement("option");
      newOption.innerText = code;
      newOption.setAttribute('value', code);
      partElem.appendChild(newOption);

      if (lastCode && code === lastCode) {
        newOption.selected = true;
      }
    }
  }

  // applies the participant code selection to the form's contents
  function updateDropdownBinding(code) {
    var manualCode = document.getElementById('participantCodeManualBox');

    if (code === "__none__") {
      clearForm();
      manualCode.classList.remove("hidden");
    }
    else {
      rehydrateForm(code);
      manualCode.classList.add("hidden");
    }
  }

  // and run the selection logic once to sync the form
  updateDropdownBinding(partElem.value);

  partElem.addEventListener('input', function(ev) {
    updateDropdownBinding(ev.target.value);
  });

  // make selecting the 'yes' response for the "first time?" prompt clear the form
  // make selecting the 'no' response reload the form if there's a selection

  var yesResponse = document.getElementById('firstTimeSurvey-1');
  var noResponse = document.getElementById('firstTimeSurvey-0');
  if (yesResponse && noResponse) {
    yesResponse.addEventListener('click', function() {
      clearForm();
    });
    noResponse.addEventListener('click', function() {
      updateDropdownBinding(partElem.value);
    });
  }
}

function bindConsentButtons() {
  var yesResponse = document.getElementById('consentToStudy-1');
  var noResponse = document.getElementById('consentToStudy-0');
  var submitBtn = document.getElementById('btn-send');

  function syncSubmit() {
    submitBtn.disabled = !(yesResponse.checked);
  }

  if (submitBtn && yesResponse && noResponse) {
    syncSubmit();
    yesResponse.addEventListener('click', syncSubmit);
    noResponse.addEventListener('click', syncSubmit);
  }
}

// ---------------------------------------------------------------------------------------------
// --- execute on complete DOM load
// ---------------------------------------------------------------------------------------------

function run() {
  checkError();
  checkLang();
  checkForCode();

  setupForm();

  var lastCode = getLastCode();

  // binding the participants' list will rehydrate
  // the form when it preselects the last participant
  bindParticipantsList(lastCode);
  bindConsentButtons();
}

if (document.readyState != 'loading') {
  // in case the document is already rendered
  run();
}
else if (document.addEventListener) {
  // for modern browsers
  document.addEventListener('DOMContentLoaded', run);
}
else {
  // IE <= 8
  document.attachEvent('onreadystatechange', function() {
    if (document.readyState === 'complete') {
      run();
    }
  });
}
