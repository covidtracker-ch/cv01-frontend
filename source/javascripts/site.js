var formBtn = document.getElementById('btn-send');
var form = document.getElementById('covid-form');
var formExpansion = document.getElementById('form-expanded');
var healthyRadio = document.getElementById('feelsHealthy-1');
var sickRadio = document.getElementById('feelsHealthy-0');
var toggles = document.querySelectorAll('.js-toggle');
var hiddens = document.querySelectorAll('.js-hide');

for(var hidden of hiddens) {
  hidden.classList.remove('js-hide');
  hidden.classList.add('hidden');
}

function sendForm() {
  var fd = new FormData(form);
  console.log(...fd);
}

if(form) {  
  form.addEventListener('submit', e => {
    e.preventDefault();
  
    sendForm();
  });
  
  sickRadio.addEventListener('change', e => {
    formExpansion.classList.remove('hidden');
  });
  healthyRadio.addEventListener('change', e => {
    formExpansion.classList.add('hidden');
  });

  for(var toggle of toggles) {
    toggle.addEventListener('change', e => {
      if(e.target.dataset.hide) {
        document.getElementById(e.target.dataset.hide).classList.add('hidden');
      }
      if(e.target.dataset.show) {
        document.getElementById(e.target.dataset.show).classList.remove('hidden');
      }
    });
  }
}