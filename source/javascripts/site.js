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
  var xhr = new XMLHttpRequest();
  var fd = new FormData(form);
  console.log(...fd);
  
  xhr.addEventListener('load', function(e) {
    console.log(e.target.responsText);
  });
  
  xhr.addEventListener('error', function(e) {
    console.log(e);
  });
  
  xhr.open('POST', form.action);
  xhr.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded' );
  xhr.send(fd);
}

if(form) {  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
  
    sendForm();
  });
  
  sickRadio.addEventListener('change', function(e) {
    formExpansion.classList.remove('hidden');
  });
  healthyRadio.addEventListener('change', function(e) {
    formExpansion.classList.add('hidden');
  });

  for(var toggle of toggles) {
    toggle.addEventListener('change', function(e) {
      if(e.target.dataset.hide) {
        document.getElementById(e.target.dataset.hide).classList.add('hidden');
      }
      if(e.target.dataset.show) {
        document.getElementById(e.target.dataset.show).classList.remove('hidden');
      }
    });
  }
}