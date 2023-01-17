const NS = "http://www.tei-c.org/ns/1.0";
var doc = {};
window.onload = function () {
  try {
    var url_string = window.location.href.toLowerCase();
    var url = new URL(url_string);
    var id = url.searchParams.get("id");

    loadText(id);
  } catch (err) {
    // alert("document not found");
    console.log("Issues with Parsing URL Parameter's - " + err);
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
      //header
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
        .find("person")
        .each(function () {
          doc.listPerson.push({
            id: $(this).attr("xml:id"),
            name: $(this).find("persName").text(),
            idno: $(this).find("idno").text(),
          });
        });
      // listPlaces
      $(response)
        .find("place")
        .each(function () {
          doc.listPlaces.push({
            id: $(this).attr("xml:id"),
            name: $(this).find("placeName").text(),
            idno: $(this).find("idno").text(),
          });
        });

      //pages
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
                // .find("w")
                // .each(function () {
                //   $(this).replaceWith(function () {
                //     console.log($(this).html())
                //     return $("<b />", { html: $(this).html() });
                //   });
                // })
                // .html(),
                text: $(this).html().replace(/\n/g, "<br />"),
              });
            });
          var newPage = {
            translations: translations,
            facsimile: $(this).find(`pb`).attr("facs"),
            n: $(this).find(`pb`).attr("n"),
            head: $(this).find(`head`).text(),
          };

          doc.pages.push(newPage);
        });
      showResult(doc);
      console.log(doc);
    },
  });

  function showResult(doc) {
    // Render (on Page Change)
    const render = (pageNumber) => {
      // LEFT AND RIGHT
      let left = {
        facsimile: document.getElementById("facsimile-left"),
      };
      let right = {
        facsimile: document.getElementById("facsimile-right"),
      };
      let page = doc.pages.find((p) => p.n === pageNumber);
      if (!page) {
        alert("Page not found");
        return;
      }
      left.facsimile.style.backgroundImage = `url(${page.facsimile})`;
      left.facsimile.querySelector("img").src = page.facsimile;
      right.facsimile.style.backgroundImage = `url(${page.facsimile})`;
      right.facsimile.querySelector("img").src = page.facsimile;

      document.getElementById("german-left").innerHTML = page.translations.find(
        (t) => t.lang == "de"
      ).text;
      document.getElementById("german-right").innerHTML =
        page.translations.find((t) => t.lang == "de").text;
      document.getElementById("tibetian-left").innerHTML = $(
        page.translations.find((t) => t.lang == "bo").el
      )
        .html()
        .replace(/\n/g, "<br />");
      document.getElementById("tibetian-right").innerHTML = $(
        page.translations.find((t) => t.lang == "bo").el
      )
        .html()
        .replace(/\n/g, "<br />");

      // document.getElementById("xml-left").innerHTML = "<pre>" + Prism.highlight(doc.xml,Prism.languages.markup, 'html') + "</pre>";
      // document.getElementById("xml-right").innerHTML = "<pre>" + Prism.highlight(doc.xml,Prism.languages.markup, 'html')+ "</pre>";
      document.getElementById("xml-left").innerHTML =
        "<textarea>" + doc.xml + `</textarea>`;
      document.getElementById("xml-right").innerHTML =
        "<textarea>" + doc.xml + "</textarea>";
    };

    const changePage = (e) => {
      console.log(select.value);
      render(select.value);
    };
    // Meta
    document.getElementById("title").innerHTML =
      doc.title.find((t) => t.lang === "bo").text +
      "<br />" +
      doc.title.find((t) => t.lang === "de").text;
    document.getElementById(
      "editLink"
    ).href = `https://github.com/abrugnara/TibetianTEI/tree/main/${doc.url}`;

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
