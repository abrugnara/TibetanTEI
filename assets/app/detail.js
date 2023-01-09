const NS = "http://www.tei-c.org/ns/1.0";
      var doc = {};
      window.onload = function () {
        try {
          var url_string = window.location.href.toLowerCase();
          var url = new URL(url_string);
          var id = url.searchParams.get("id");

          loadText(id);
        } catch (err) {
          alert("document not found");
          console.log("Issues with Parsing URL Parameter's - " + err);
        }
      };

      /* Helper */
      const getNodes = (path, xml) =>
        xml.evaluate(
          path,
          xml,
          function (prefix) {
            if (prefix === "TEI") {
              return NS;
            } else {
              return null;
            }
          },
          XPathResult.ANY_TYPE,
          null
        );

      //Filters the given array to those which when passed into matcher return true
      Array.prototype.where = function (matcher) {
        var result = [];
        for (var i = 0; i < this.length; i++) {
          if (matcher(this[i])) {
            result.push(this[i]);
          }
        }
        return result;
      };

      function getElementsByAttribute(tag, attr, attrValue, nodes) {
        //Get elements and convert to array
        var elems = Array.prototype.slice.call(
          nodes.getElementsByTagName(tag),
          0
        );

        //Matches an element by its attribute and attribute value
        var matcher = function (el) {
          return el.getAttribute(attr) == attrValue;
        };

        return elems.where(matcher);
      }

      function loadText(id) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 200) {
            showResult(xhttp.responseXML);
          }
        };
        const text = texts.find((text) => text.id === id);
        xhttp.open("GET", text.url, true);
        xhttp.send();

        function showResult(xml) {
          // Title
          var txt = "";
          path = "//TEI:title";
          var nodes = getNodes(path, xml);
          var result = nodes.iterateNext();
          while (result) {
            txt += result.childNodes[0].nodeValue + "<br>";
            result = nodes.iterateNext();
          }
          doc.title = txt;

          // Pages
          var txt = "";
          path = "//TEI:pb";
          var nodes = getNodes(path, xml);
          var result = nodes.iterateNext();
          var trans;
          var pages = [];
          console.log(nodes);
          while (result) {
            // console.log(result.childNodes)
            // // transBo = getElementsByAttribute("trans","xml:lang","bo",result.childNodes[0].nodeValue);
            // trans = result.childNodes
            // // transDE = getElementsByAttribute("trans","xml:lang","de",result.childNodes[0])
            const pageNumber = result.getAttribute("n");
            if (pageNumber) {
              pages.push({
                facsimile: result.getAttribute("facs"),
                n: parseInt(pageNumber),
              });
            }
            result = nodes.iterateNext();
          }
          doc.pages = pages;

          // Body
          var txt = "";
          path = "//TEI:body";
          var nodes = getNodes(path, xml);
          var body = nodes.iterateNext();
          doc.body = body;

          // Translations
          var img = "";
          var transBo = "";
          var transDE = "";
          path = "//TEI:trans";
          var nodes = getNodes(path, xml);
          var result = nodes.iterateNext();
          while (result) {
            txt += result.childNodes[0].nodeValue + "<br>";
            result = nodes.iterateNext();
          }
          doc.translations = { unsorted: txt };

          console.log(doc);

          // Render (on Page Change)
          const render = (pageNumber) => {
            console.log(doc.pages, pageNumber);
            document.getElementById("facsimile").src = doc.pages.find(
              (p) => p.n === pageNumber
            ).facsimile;

            document.getElementById("translations").innerHTML =
              doc.translations.unsorted;
          };

          const changePage = (e) => {
            console.log(select.value);
            render(parseInt(select.value));
          };
          // Meta
          document.getElementById("title").innerHTML = doc.title;
          // First Page
          render(1);

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
        }
      }

      // Tabs

      var tabs = document.querySelector(".reader");
      var tabButton = document.querySelectorAll(".tab-button");
      var panes = document.querySelectorAll(".pane");
      tabs.onclick = (e) => {
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