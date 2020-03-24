var form = document.getElementById('covid-form');
var toggles = document.querySelectorAll('.js-toggle');
var hiddens = document.querySelectorAll('.js-hide');
var langLinks = document.querySelectorAll('.js-setLang');

function goToLang(lang) {
  window.location.assign(window.location.origin + '/' + lang + window.location.pathname);
}
function checkLang() {
  var lang = window.navigator.language.slice(0, 2);
  console.log(window.location);
  
  if(lang == 'fr') {
    goToLang('fr');
  }else if(lang == 'it') {
    goToLang('it');
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
      console.log('lang');
    });
  }
}