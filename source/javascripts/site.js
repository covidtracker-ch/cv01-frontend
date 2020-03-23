var formBtn = document.getElementById('btn-send');
var form = document.getElementById('covid-form');

function sendForm() {
  console.log(form);
  var fd = new FormData(form);
  console.log(...fd);
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  sendForm();
});