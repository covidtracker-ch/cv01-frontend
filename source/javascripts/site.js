var form = document.getElementById('covid-form');
var toggles = document.querySelectorAll('.js-toggle');
var hiddens = document.querySelectorAll('.js-hide');
var langLinks = document.querySelectorAll('.js-setLang');

function checkError() {
  var param = window.location.search.substr(1);
  if(param == 'error=true') {
    document.getElementById('msg-error').classList.remove('hidden');
  }
}
checkError();

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
checkLang();

if(form) {    
  for(var i=0; i < hiddens.length; i++) {
    hiddens[i].classList.remove('js-hide');
    hiddens[i].classList.add('hidden');
  }
  
  for(var i=0; i < toggles.length; i++) {
    toggles[i].addEventListener('change', function(e) {
      if(e.target.dataset.hide) {
        document.getElementById(e.target.dataset.hide).classList.add('hidden');
      }
      if(e.target.dataset.show) {
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

// persist form's current data to localStorage
function persistForm() {
  if (form) {
    var payload = {};

    // first, check if they consented to saving their responses; bail on saving if not
    var saveResponses = document.querySelector('input[name="saveResponses"]:checked').value;
    if (saveResponses != 1) {
      console.warn("Not saving responses due to lack of consent");
      localStorage.removeItem('formData');
      return;
    }

    for (var i = 0; i < form.elements.length; i++) {
      var elem = form.elements[i];

      if (!elem.name) {
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
      }
      else if (pageElems[0]) {
        // if there's only one element, we can just take its value
        payload[elem.name] = elem.value;
      }
    }

    localStorage.setItem('formData', JSON.stringify(payload));
  }
}

// load existing form data from localStorage if present
function rehydrateForm() {
  var payload = JSON.parse(localStorage.getItem('formData'));

  if (form && payload) {
    for (var i = 0; i < form.elements.length; i++) {
      var elem = form.elements[i];

      if (!elem.name) {
        continue;
      }

      var pageElems = document.getElementsByName(elem.name);

      // if there are multiple elements, it's probably a radio button
      if (pageElems.length > 1) {
        for (var j = 0; j < pageElems.length; j++) {
          var option = pageElems[j];

          // ensure that only the matched radio button is set and all others are unset
          // option.checked = (payload[elem.name] === option.value) || undefined;

          // actually, we have to trigger an actual click to get the handlers to fire...
          if ((payload[elem.name] === option.value)) {
            option.click();
          }
        }
      }
      else if (pageElems[0]) {
        // it's a simple value
        pageElems[0].setAttribute('value', payload[elem.name]);
      }
    }
  }
}


// ---------------------------------------------------------------------------------------------
// --- execute on complete DOM load
// ---------------------------------------------------------------------------------------------

function run() {
  rehydrateForm();
}

if (document.readyState !== 'loading') {
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
