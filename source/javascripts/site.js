function searchParams() {
  var e, t, n = window.location.search.substring(1).split("&"), a = {};
  for (t in n)
      "" !== n[t] && (e = n[t].split("="),
      a[decodeURIComponent(e[0])] = decodeURIComponent(e[1]));
  return a
}
function checkForCode() {
  var e, t = searchParams();
  t.code ? (e = t.code,
  localStorage.setItem("lastCode", e),
  replaceKeyInStore(REPLACE_SENTINEL, e)) : e = localStorage.getItem("lastCode");
  var n = document.getElementById("yourCodeHere");
  n && (n.innerText = e)
}
function checkError() {
  "true" === searchParams().error && (document.getElementById("msg-error").classList.remove("hidden"),
  deleteKeyInStore(REPLACE_SENTINEL))
}
function goToLang(e) {
  //var t = window.location.pathname.split("/").pop();
  //"de" == e ? window.location.assign(window.location.origin + "/" + t) : window.location.assign(window.location.origin + "/" + e + "/" + t)
}
function checkLang() {
  var e = navigator.language || navigator.userLanguage;
  e = e.slice(0, 2);
  var t = document.body.dataset.lang
    , n = localStorage.getItem("languageOverwrite");
  if (e != t) {
      if (n) {
          if (n == t)
              return;
          return void goToLang(n)
      }
      "fr" == e ? (localStorage.setItem("languageOverwrite", "fr"),
      goToLang("fr")) : "it" == e ? (localStorage.setItem("languageOverwrite", "it"),
      goToLang("it")) : "en" == e && (localStorage.setItem("languageOverwrite", "en"),
      goToLang("en"))
  }
}
function setupForm() {
  if (form) {
      for (var e = 0; e < hiddens.length; e++)
          hiddens[e].classList.remove("js-hide"),
          hiddens[e].classList.add("hidden");
      for (var e = 0; e < toggles.length; e++) {
          var t = "A" === toggles[e].tagName.toUpperCase() ? "click" : "input";
          toggles[e].addEventListener(t, function(e) {
              "click" === e.type && e.preventDefault(),
              e.target.dataset.hide && document.getElementById(e.target.dataset.hide).classList.add("hidden"),
              e.target.dataset.show && document.getElementById(e.target.dataset.show).classList.remove("hidden")
          })
      }
      for (var e = 0; e < langLinks.length; e++)
          langLinks[e].addEventListener("click", function(e) {
              localStorage.setItem("languageOverwrite", e.currentTarget.dataset.lang)
          })
  }
}
function updateTotalSubs(e) {
  var t = new XMLHttpRequest;
  t.open("GET", "https://api.covidtracker.ch/count"),
  t.send(),
  t.onload = function() {
      var n = t.responseText;
      n = n.slice(0, 3) + "'" + n.slice(3),
      document.getElementById(e).innerHTML = n
  }
}
function randomChoice(e) {
  return e[Math.floor(Math.random() * e.length)]
}
function retrieveCatImage(e) {
  var t = randomChoice(haired_breeds)
    , n = new XMLHttpRequest;
  n.open("GET", "https://api.thecatapi.com/v1/images/search?size=thumb&breed_id=" + t),
  n.setRequestHeader("x-api-key", "9f8170a1-4a5a-4568-b120-795cd63809d5"),
  n.send(),
  n.onload = function() {
      var a = JSON.parse(n.responseText);
      document.getElementById(e).innerHTML = '<img alt="' + t + '_cat_img" src="' + a[0].url + '"  />'
  }
}
function getLastCode() {
  var e = localStorage.getItem("lastCode");
  if (!e) {
      var t = JSON.parse(localStorage.getItem("formData"));
      for (var n in t)
          if (t.hasOwnProperty(n)) {
              e = n;
              break
          }
  }
  return e
}
function bindParticipantsList(e) {
  function t(e) {
      var t = document.getElementById("participantCodeManualBox");
      "__none__" === e ? (clearForm(),
      t.classList.remove("hidden")) : (rehydrateForm(e),
      t.classList.add("hidden"))
  }
  var n, a, o = document.getElementById("participantCodeList");
  if (o) {
      var r = JSON.parse(localStorage.getItem("formData"));
      if (r)
          for (n in r)
              r.hasOwnProperty(n) && (a = document.createElement("option"),
              a.innerText = n,
              a.setAttribute("value", n),
              o.appendChild(a),
              e && n === e && (a.selected = !0));
      t(o.value),
      o.addEventListener("input", function(e) {
          t(e.target.value)
      });
      var i = document.getElementById("firstTimeSurvey-1")
        , c = document.getElementById("firstTimeSurvey-0");
      i && c && (i.addEventListener("click", function() {
          clearForm()
      }),
      c.addEventListener("click", function() {
          t(o.value)
      }))
  }
}
function bindConsentButtons() {
  function e() {
      a.disabled = !t.checked
  }
  var t = document.getElementById("consentToStudy-1")
    , n = document.getElementById("consentToStudy-0")
    , a = document.getElementById("btn-send");
  a && t && n && (e(),
  t.addEventListener("click", e),
  n.addEventListener("click", e))
}
var form = document.getElementById("covid-form")
, toggles = document.querySelectorAll(".js-toggle")
, hiddens = document.querySelectorAll(".js-hide")
, langLinks = document.querySelectorAll(".js-setLang")
, haired_breeds = ["abys", "aege", "abob", "acur", "asho", "awir", "amau", "amis", "bali", "beng", "birm", "bomb", "bslo", "bsho", "bure", "buri", "cspa", "ctif", "char", "chau", "chee", "csho", "crex", "cymr", "cypr", "drex", "lihu", "emau", "ebur", "esho", "hbro", "hima", "jbob", "java", "khao", "kora", "kuri", "lape", "mcoo", "mala", "manx", "munc", "nebe", "norw", "ocic", "orie", "pers", "pixi", "raga", "ragd", "rblu", "sava", "sfol", "srex", "siam", "sibe", "sing", "snow", "soma", "tonk", "toyg", "tang", "tvan", "ycho"];
onDOMReady(function() {
  checkError(),
  checkLang(),
  checkForCode(),
  setupForm(),
  bindParticipantsList(getLastCode()),
  bindConsentButtons()
});
