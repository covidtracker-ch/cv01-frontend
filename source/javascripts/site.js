var formBtn = document.getElementById('btn-send');
var form = document.getElementById('covid-form');
var formExpansion = document.getElementById('form-expanded');
var healthyRadio = document.getElementById('feelsHealthy-1');
var sickRadio = document.getElementById('feelsHealthy-0');

function sendForm() {
  console.log(form);
  var fd = new FormData(form);
  console.log(...fd);
}

if(form) {  
  form.addEventListener('submit', e => {
    e.preventDefault();
  
    sendForm();
  });
  
  sickRadio.addEventListener('change', e => {
    formExpansion.classList.add('visible');
  });
  healthyRadio.addEventListener('change', e => {
    formExpansion.classList.remove('visible');
  });
}