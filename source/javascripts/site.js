var form = document.getElementById('covid-form');
var toggles = document.querySelectorAll('.js-toggle');
var hiddens = document.querySelectorAll('.js-hide');

function checkLang() {
  var lang = window.navigator.language.slice(0, 2);

  if(lang == 'fr') {
    window.location.assign(window.location.hostname + '/fr' + window.location.pathname);
  }else if(lang == 'it') {
    window.location.assign(window.location.hostname + '/it' + window.location.pathname);
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
}