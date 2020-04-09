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


// ---------------------------------------------------------------------------------------------
// --- language selection and routing
// ---------------------------------------------------------------------------------------------

function goToLang(lang) {
  // afaict the intention is to get the first element of the path
  // if we're in de, paths are used directly; if not, we need to add the language prefix to the path
  var normPath = window.location.pathname[0] === '/' ? window.location.pathname.slice(1) : window.location.pathname;

  var path = normPath.split("/").pop();
  if (lang === 'de') {
    window.location.assign(window.location.origin + '/' + path);
  }
  else {
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
    if (overwrittenLang == currentLang)
      return;
    goToLang(overwrittenLang);
    return;
  }

  if(userLang == 'fr' || userLang == 'it' || userLang == 'en') {
    localStorage.setItem('languageOverwrite', userLang);
    goToLang(userLang);
  }
}

function setupLangSelectors() {
  for(var i=0; i < langLinks.length; i++) {
    langLinks[i].addEventListener('click', function(e) {
      localStorage.setItem('languageOverwrite', e.currentTarget.dataset.lang);
    });
  }
}


// ---------------------------------------------------------------------------------------------
// --- form visibility handlers
// ---------------------------------------------------------------------------------------------

function setupForm() {
  if(form) {
    for(var i=0; i < hiddens.length; i++) {
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

          // reset all controls in hidden panels
          var elems = document.querySelectorAll("#" + e.target.dataset.hide + " *");
          for (var j = 0; j < elems.length; j++) {
            var elem = elems[j];

            // clear input elements
            if (elem.tagName === 'INPUT') {
              elem.value = elem.defaultValue;
              elem.checked = undefined;
            }

            // hide any elements that are by default hidden
            if (elem.classList.contains("js-hide")) {
              elem.classList.add("hidden");
            }
          }
        }
        if (e.target.dataset.show) {
          document.getElementById(e.target.dataset.show).classList.remove('hidden');
        }
      });
    }
  }
}


// ---------------------------------------------------------------------------------------------
// --- API calls
// ---------------------------------------------------------------------------------------------

function updateTotalSubs(targetID) {
  var http = new XMLHttpRequest();
  http.open("GET", "https://api.covidtracker.ch/count");
  http.send();
  http.onload = function() {
    var s = http.responseText;
    s = s.slice(0, 3) + "'" + s.slice(3);
    document.getElementById(targetID).innerHTML = s;
  }
}

// cat API data + methods
var haired_breeds = [
  "abys", "aege", "abob", "acur", "asho", "awir", "amau", "amis",
  "bali", "beng", "birm", "bomb", "bslo", "bsho", "bure", "buri",
  "cspa", "ctif", "char", "chau", "chee", "csho", "crex", "cymr",
  "cypr", "drex", "lihu", "emau", "ebur", "esho", "hbro", "hima",
  "jbob", "java", "khao", "kora", "kuri", "lape", "mcoo", "mala",
  "manx", "munc", "nebe", "norw", "ocic", "orie", "pers", "pixi",
  "raga", "ragd", "rblu", "sava", "sfol", "srex", "siam", "sibe",
  "sing", "snow", "soma", "tonk", "toyg", "tang", "tvan", "ycho"
];

function randomChoice(samples) {
  var idx = Math.floor(Math.random() * samples.length);
  return samples[idx];
}

function retrieveCatImage(targetID) {
  var cat_breed = randomChoice(haired_breeds);
  var http = new XMLHttpRequest();
  http.open("GET", "https://api.thecatapi.com/v1/images/search?size=thumb&breed_id=" + cat_breed);
  http.setRequestHeader('x-api-key', '9f8170a1-4a5a-4568-b120-795cd63809d5');
  http.send();
  http.onload = function() {
    var data = JSON.parse(http.responseText);
    document.getElementById(targetID).innerHTML = "<img alt=\"" + cat_breed + "_cat_img\" src=\"" + data[0].url +"\" />"
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

function checkForMigrationCode() {
  var params = searchParams();

  // if there's a migration code and we're on the homepage, prefill it
  // (yes, i'm aware that this is less than attractive...)
  var firstTime_No = document.getElementById('firstTimeSurvey-0');
  var participantCodeList = document.getElementById('participantCodeList');
  var participantCodeManualBox = document.getElementById('participantCodeManualBox');
  var participantCodeManual = document.getElementById('participantCodeManual');

  if (params['migration_code'] && firstTime_No && participantCodeList && participantCodeManual) {
    firstTime_No.checked = true;
    participantCodeList.value = '__none__';
    document.getElementById(firstTime_No.dataset.show).classList.remove('hidden');
    participantCodeManualBox.classList.remove('hidden');
    participantCodeManual.value = params['migration_code'];
    clearForm();
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

onDOMReady(function() {
  setupLangSelectors();
  checkError();
  checkLang();
  checkForCode();
  setupForm();

  // binding the participants' list will rehydrate
  // the form when it preselects the last participant
  bindParticipantsList(getLastCode());
  bindConsentButtons();

  // finally, overwrites the existing selection with the querystring param 'migration_code', if provided
  // (this is to support users with existing participant codes from other sites who have been redirected here)
  checkForMigrationCode();
});