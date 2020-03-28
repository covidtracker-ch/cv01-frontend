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
  console.log('userLang',userLang)
  var currentLang = document.body.dataset.lang;
  console.log('current lang', currentLang)
  var overwrittenLang = localStorage.getItem('languageOverwrite');
  console.log(overwrittenLang)
  
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