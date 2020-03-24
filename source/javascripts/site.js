var toggles = document.querySelectorAll('.js-toggle');
var hiddens = document.querySelectorAll('.js-hide');


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