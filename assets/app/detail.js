const NS = "http://www.tei-c.org/ns/1.0";
var doc = {};
// Gather HTML elements
let left = {
  facsimile: document.getElementById("facsimile-left"),
  german: document.getElementById("german-left"),
  tibetan: document.getElementById("tibetan-left"),
  english: document.getElementById("english-left"),
  wylie: document.getElementById("wylie-left"),
  xml: document.getElementById("xml-left"),
  persons: document.getElementById("persons-left"),
  places: document.getElementById("places-left"),
};
let right = {
  facsimile: document.getElementById("facsimile-right"),
  german: document.getElementById("german-right"),
  tibetan: document.getElementById("tibetan-right"),
  english: document.getElementById("english-right"),
  wylie: document.getElementById("wylie-right"),
  xml: document.getElementById("xml-right"),
  persons: document.getElementById("persons-right"),
  places: document.getElementById("places-right"),
};

window.onload = function () {
  try {
    var url_string = window.location.href.toLowerCase();
    var url = new URL(url_string);
    var id = url.searchParams.get("id");
    loadText(id);
  } catch (err) {
    console.warn("Issues with Parsing URL Parameter's - " + err);
  }
};

function xmlToString(xmlData) {
  var xmlString;
  //IE
  if (window.ActiveXObject) {
    xmlString = xmlData.xml;
  }
  // code for Mozilla, Firefox, Opera, etc.
  else {
    xmlString = new XMLSerializer().serializeToString(xmlData);
  }
  return xmlString;
}

function loadText(id) {
  const text = texts.find((text) => text.id === id);
  $.ajax({
    type: "GET",
    url: text.url,
    dataType: "xml",

    error: function (e) {
      alert("An error occurred while processing XML file");
      console.log("XML reading Failed: ", e);
    },

    success: function (response) {
      const doc = {
        pages: [],
        title: [],
        url: text.url,
        listPerson: [],
        listPlaces: [],
        xml: xmlToString(response),
      };
      // header
      $(response)
        .find("title")
        .each(function () {
          doc.title.push({
            lang: $(this).attr("xml:lang"),
            text: $(this).text(),
          });
        });
      // listPerson
      $(response)
        // .find("person")
        // TODO: change to tag persname
        .find("persName")
        .each(function () {
          // Register from body occurances
          if (!doc.listPerson.find((p) => p.name === $(this).text())) {
            let url = null;
            if (references.find((r) => r.type === $(this).attr("type"))) {
              url = `${
                references.find((r) => r.type === $(this).attr("type")).url
              }${$(this).attr("key")}`;
            }
            doc.listPerson.push({
              role: $(this).attr("role"),
              key: $(this).attr("key"),
              type: $(this).attr("type"),
              name: $(this).text(), // here the reference from the stand off is essential to have enough meta data to display anything meaning full
              url: url,
            });
          }
        });
      // listPlaces
      $(response)
        .find("placeName")
        .each(function () {
          console.log(doc.listPlaces.find((p) => p.name === $(this).text()));
          if (!doc.listPlaces.find((p) => p.name === $(this).text())) {
            let url = null;
            if (references.find((r) => r.type === $(this).attr("type"))) {
              url = `${
                references.find((r) => r.type === $(this).attr("type")).url
              }${$(this).attr("key")}`;
            }
            doc.listPlaces.push({
              role: $(this).attr("role"),
              key: $(this).attr("key"),
              type: $(this).attr("type"),
              name: $(this).text(), // here the reference from the stand off is essential to have enough meta data to display anything meaning full
              url: url,
            });
          }
        });

      // pages
      $(response)
        .find("div")
        .each(function () {
          var translations = [];
          $(this)
            .find("p")
            .each(function () {
              translations.push({
                lang: $(this).attr("xml:lang"),
                el: $(this),
                formattedHtml: $(this).html(),
                text: $(this).html().replace(/\n/g, "<br />"),
              });
            });
          var newPage = {
            translations: translations,
            facsimile: $(this).find(`pb`).attr("facs"),
            xml: $(this).html(),
            n: $(this).find(`pb`).attr("n"),
            head: $(this).find(`head`).text(),
          };
          doc.pages.push(newPage);
        });
      console.log(doc);
      showResult(doc);
    },
  });

  function showResult(doc) {
    // render on page change
    const render = (pageNumber) => {
      let page = doc.pages.find((p) => p.n === pageNumber);
      if (!page) {
        alert("Page not found");
        return;
      }
      // facs
      left.facsimile.style.backgroundImage = `url(${page.facsimile})`;
      left.facsimile.querySelector("img").src = page.facsimile;
      right.facsimile.style.backgroundImage = `url(${page.facsimile})`;
      right.facsimile.querySelector("img").src = page.facsimile;
      // translations
      trans = {};
      if (page.translations.find((t) => t.lang == "de"))
        trans.german = page.translations.find((t) => t.lang == "de").text;
      if (page.translations.find((t) => t.lang == "wylie"))
        trans.wylie = page.translations.find((t) => t.lang == "wylie").text;
      if (page.translations.find((t) => t.lang == "en"))
        trans.english = page.translations.find((t) => t.lang == "en").text;
      if (page.translations.find((t) => t.lang == "bo"))
        trans.tibetan = page.translations
          .find((t) => t.lang == "bo")
          .el.html()
          .replace(/<lb\s*\/?>/gi, "<br />")
          .replace(/<\/?unclear\s*\/?>/gi, "");
      // german
      left.german.innerHTML = trans.german;
      right.german.innerHTML = trans.german;
      // wylie
      left.wylie.innerHTML = trans.wylie;
      right.wylie.innerHTML = trans.wylie;
      // en
      left.english.innerHTML = trans.english;
      right.english.innerHTML = trans.english;
      // tibetan
      left.tibetan.innerHTML = trans.tibetan;
      right.tibetan.innerHTML = trans.tibetan;
      // xml
      left.xml.innerHTML = "<textarea>" + page.xml + `</textarea>`;
      right.xml.innerHTML = "<textarea>" + page.xml + "</textarea>";
      // persons
      let personsHTML = "";
      doc.listPerson.forEach((person) => {
        if (person.url) {
          personsHTML += `<li><a href="${person.url ? person.url : "#"}">${
            person.name
          }</a> ${person.type}</li>`;
        } else {
          personsHTML += `<li>${person.name} ${
            person.type ? person.type : ""
          }</li>`;
        }
      });
      personsHTML = `<h6>Personen Register</h6><ul>${personsHTML}</ul>`;
      left.persons.innerHTML = personsHTML;
      right.persons.innerHTML = personsHTML;
      //places
      let placesHTML = "";
      doc.listPlaces.forEach((place) => {
        placesHTML += `<li><a href="${place.idno ? place.idno : "#"}">${
          place.name
        }</a> ${place.type ? place.type : ""}</li>`;
      });
      placesHTML = `<h6>Orts Register</h6><ul>${placesHTML}</ul>`;
      left.places.innerHTML = placesHTML;
      right.places.innerHTML = placesHTML;

      // Tooltips
      // placeName
      document.querySelectorAll("placename").forEach((el) => {
        let place = doc.listPlaces.find((p) => p.id === el.innerHTML);
        // undefined display contribution link
        if (!place) {
          el.innerHTML += `<span>Nicht deklariert</span>`;
          // defined display tooltip
        } else {
          el.innerHTML = `<a target="_blank" href="${place.url}">${
            place.name
          }</a><span>${el.innerHTML} ${place.type ? place.type : ""}</span>`;
        }
      });
      // persName
      document.querySelectorAll("persname").forEach((el) => {
        let person = doc.listPerson.find((p) => p.name === el.innerHTML);
        // undefined display contribution link
        if (!person) {
          el.innerHTML += `<span>Nicht deklariert</span>`;
          // defined display tooltip
        } else {
          el.innerHTML = `<a target="_blank" href="${person.url}">${
            person.name
          }</a><span>${el.getAttribute("key")} ${person.type} ${person.role ? person.role : ""}</span>`;
        }
      });
      // date
      document.querySelectorAll("date").forEach((el) => {
        if (el.getAttribute("when")) {
          el.innerHTML += `<span>${el.getAttribute("when")}</span>`;
          
        } 
      });
    };

    const changePage = (e) => {
      render(select.value);
    };
    // Meta
    document.getElementById("title").innerHTML =
      doc.title.find((t) => t.lang === "bo").text +
      "<br />" +
      doc.title.find((t) => t.lang === "de").text;
    document.getElementById(
      "editLink"
    ).href = `https://github.com/abrugnara/TibetanTEI/tree/main/${doc.url}`;

    // Page Selector
    var select = document.getElementById("selectPage");
    document.getElementById("pageCount").innerHTML = doc.pages.length;
    for (var i = 0; i < doc.pages.length; i++) {
      var opt = doc.pages[i].n;
      var el = document.createElement("option");
      el.textContent = opt;
      el.value = opt;
      select.appendChild(el);
    }
    select.addEventListener("change", changePage);
    // First Page
    render(doc.pages[0].n);
  }
}

// Tabs
var sides = document.querySelectorAll(".tabs");
sides.forEach((side) => {
  var tabButton = side.querySelectorAll(".tab-button");
  var panes = side.querySelectorAll(".pane");
  side.onclick = (e) => {
    const id = e.target.dataset.id;
    if (id) {
      tabButton.forEach((btn) => {
        btn.classList.remove("active");
      });
      e.target.classList.add("active");

      panes.forEach((content) => {
        content.classList.remove("active");
      });
      const element = document.getElementById(id);
      element.classList.add("active");
    }
  };
});

// Zoom
function zoom(e) {
  var zoomer = e.currentTarget;
  x = (e.offsetX / zoomer.offsetWidth) * 100;
  y = (e.offsetY / zoomer.offsetHeight) * 100;
  zoomer.style.backgroundPosition = x + "% " + y + "%";
}
