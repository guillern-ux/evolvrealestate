(function () {
  "use strict";

  var CFG = window.EVOLV_CONFIG || {};
  var DEFAULT_DESC = "Escríbenos o solicita una visita y te daremos todos los detalles de esta propiedad.";
  var SUBJECTS = {
    contacto: "Nuevo mensaje desde la web",
    vender: "Solicitud para vender o alquilar una propiedad",
    visita: "Solicitud de visita",
    propiedad: "Interés en una propiedad"
  };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function fmtNumber(n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function priceHTML(p) {
    var s = fmtNumber(p.precio) + " €";
    return p.operacion === "alquiler" ? s + " <small>/mes</small>" : s;
  }

  function priceText(p) {
    return fmtNumber(p.precio) + " €" + (p.operacion === "alquiler" ? "/mes" : "");
  }

  function listPage(p) {
    return p.operacion === "alquiler" ? "alquilar.html" : "comprar.html";
  }

  /* ---------- Datos ---------- */
  var propsPromise = null;
  function loadProps() {
    if (!propsPromise) {
      propsPromise = fetch("data/propiedades.json").then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      });
    }
    return propsPromise;
  }

  /* ---------- Tarjetas ---------- */
  function cardHTML(p) {
    return (
      '<article class="card">' +
      '<div class="card-img"><img src="' + esc(p.imagenes[0]) + '" alt="" loading="lazy" referrerpolicy="no-referrer"></div>' +
      '<p class="card-zone">' + esc(p.zona) + "</p>" +
      '<h3><a href="propiedad.html?id=' + encodeURIComponent(p.id) + '">' + esc(p.titulo) + "</a></h3>" +
      '<dl class="card-facts">' +
      "<div><dt>Habitaciones</dt><dd>" + esc(p.habitaciones) + "</dd></div>" +
      "<div><dt>Baños</dt><dd>" + esc(p.banos) + "</dd></div>" +
      "<div><dt>m²</dt><dd>" + esc(p.m2) + "</dd></div>" +
      "</dl>" +
      '<div class="card-foot"><span class="price">' + priceHTML(p) + '</span><span class="more" aria-hidden="true">Ver más</span></div>' +
      "</article>"
    );
  }

  function renderListings(list) {
    document.querySelectorAll("[data-listing]").forEach(function (el) {
      var op = el.getAttribute("data-listing");
      var items = list.filter(function (p) { return p.operacion === op; });
      var limit = parseInt(el.getAttribute("data-limit"), 10);
      if (limit) items = items.slice(0, limit);
      el.innerHTML = items.length
        ? items.map(cardHTML).join("")
        : '<p class="listing-status">Ahora mismo no hay propiedades publicadas en esta sección.</p>';
    });
  }

  /* ---------- Selector de propiedades (página de visita) ---------- */
  function fillSelects(list) {
    var wanted = new URLSearchParams(location.search).get("propiedad");
    document.querySelectorAll("select[data-props]").forEach(function (sel) {
      list.forEach(function (p) {
        var o = document.createElement("option");
        o.value = p.titulo + ", " + p.zona + " (" + (p.operacion === "alquiler" ? "alquiler" : "venta") + ")" + (p.ref ? " - " + p.ref : "");
        o.textContent = o.value;
        if (wanted && wanted === p.id) o.selected = true;
        sel.appendChild(o);
      });
    });
  }

  /* ---------- Ficha de propiedad ---------- */
  function renderDetail(list) {
    var root = document.getElementById("detail");
    if (!root) return;
    var id = new URLSearchParams(location.search).get("id");
    var p = list.filter(function (x) { return x.id === id; })[0];

    if (!p) {
      root.innerHTML =
        '<div class="container section"><h1>No encontramos esta propiedad</h1>' +
        '<p style="margin-top:1rem">Puede que ya no esté disponible. Mira todas las viviendas ' +
        '<a href="comprar.html">en venta</a> o <a href="alquilar.html">en alquiler</a>.</p></div>';
      return;
    }

    document.title = p.titulo + ", " + p.zona + " | Evolv Real Estate";

    var same = list.filter(function (x) { return x.operacion === p.operacion; });
    var i = same.indexOf(p);
    var prev = same[(i - 1 + same.length) % same.length];
    var next = same[(i + 1) % same.length];
    var backLabel = p.operacion === "alquiler" ? "Volver a alquilar" : "Volver a comprar";

    var thumbs = "";
    if (p.imagenes.length > 1) {
      thumbs = '<div class="thumbs">' + p.imagenes.map(function (src, n) {
        return '<button type="button" data-src="' + esc(src) + '" aria-label="Ver foto ' + (n + 1) + '"' +
          (n === 0 ? ' aria-current="true"' : "") + '><img src="' + esc(src) + '" alt="" loading="lazy" referrerpolicy="no-referrer"></button>';
      }).join("") + "</div>";
    }

    var amenities = p.servicios && p.servicios.length
      ? '<div><h2>Servicios del edificio</h2><ul class="amenities">' +
        p.servicios.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul></div>"
      : "";

    root.innerHTML =
      '<div class="container">' +
      '<p class="crumbs"><a href="' + listPage(p) + '">' + backLabel + "</a></p>" +
      '<div class="detail-head"><p class="card-zone">' + esc(p.zona) + "</p><h1>" + esc(p.titulo) + "</h1></div>" +
      '<div class="detail-grid">' +
      "<div>" +
      '<div class="gallery-main"><img id="gallery-main" src="' + esc(p.imagenes[0]) + '" alt="' + esc(p.titulo + " en " + p.zona) + '" referrerpolicy="no-referrer"></div>' +
      thumbs +
      "</div>" +
      "<aside>" +
      '<dl class="facts">' +
      '<div class="facts-price"><dt>Precio</dt><dd>' + esc(priceText(p)) + "</dd></div>" +
      "<div><dt>Barrio</dt><dd>" + esc(p.zona) + "</dd></div>" +
      "<div><dt>Superficie</dt><dd>" + esc(p.m2) + " m²</dd></div>" +
      "<div><dt>Baños</dt><dd>" + esc(p.banos) + "</dd></div>" +
      "<div><dt>Habitaciones</dt><dd>" + esc(p.habitaciones) + "</dd></div>" +
      (p.ref ? "<div><dt>Referencia</dt><dd>" + esc(p.ref) + "</dd></div>" : "") +
      "</dl>" +
      '<div class="side-actions"><a class="btn btn-primary" href="visita.html?propiedad=' + encodeURIComponent(p.id) + '">Reservar visita</a></div>' +
      "</aside>" +
      "</div>" +
      '<div class="detail-body">' +
      "<div><h2>Acerca de la propiedad</h2><p>" + esc(p.descripcion || DEFAULT_DESC) + "</p></div>" +
      amenities +
      "</div>" +
      "</div>" +
      '<section class="section section-stone" style="margin-top:3rem"><div class="container">' +
      '<div class="section-head"><h2>¿Te interesa esta propiedad?</h2><p>Déjanos tus datos y te llamamos.</p></div>' +
      '<form class="form" data-form="propiedad" novalidate>' +
      '<input type="hidden" name="Propiedad" value="' + esc(p.titulo + ", " + p.zona + (p.ref ? " - " + p.ref : "")) + '">' +
      '<div class="form-row">' +
      '<div class="field"><label for="d-nombre">Nombre</label><input id="d-nombre" name="Nombre" autocomplete="given-name" required></div>' +
      '<div class="field"><label for="d-apellido">Apellido</label><input id="d-apellido" name="Apellido" autocomplete="family-name" required></div>' +
      "</div>" +
      '<div class="form-row">' +
      '<div class="field"><label for="d-email">Email</label><input id="d-email" type="email" name="email" autocomplete="email" required></div>' +
      '<div class="field"><label for="d-tel">Teléfono</label><input id="d-tel" type="tel" name="Teléfono" autocomplete="tel" required></div>' +
      "</div>" +
      '<label class="check"><input type="checkbox" name="Acepta la política de privacidad" value="Sí" required><span>He leído y acepto la <a href="privacidad.html">política de privacidad</a></span></label>' +
      '<div class="hp" aria-hidden="true"><label>No rellenar<input name="_gotcha" tabindex="-1" autocomplete="off"></label></div>' +
      '<button class="btn btn-primary" type="submit">Enviar</button>' +
      '<p class="form-status" role="status"></p>' +
      "</form>" +
      "</div></section>" +
      '<div class="container"><nav class="pager" aria-label="Otras propiedades">' +
      '<a href="propiedad.html?id=' + encodeURIComponent(prev.id) + '">Anterior: ' + esc(prev.titulo) + "</a>" +
      '<a href="propiedad.html?id=' + encodeURIComponent(next.id) + '">Siguiente: ' + esc(next.titulo) + "</a>" +
      "</nav></div>";

    var main = document.getElementById("gallery-main");
    root.querySelectorAll(".thumbs button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        main.src = btn.getAttribute("data-src");
        root.querySelectorAll(".thumbs button").forEach(function (b) { b.removeAttribute("aria-current"); });
        btn.setAttribute("aria-current", "true");
      });
    });
  }

  /* ---------- Formularios ---------- */
  function collect(form) {
    var data = {};
    new FormData(form).forEach(function (value, key) {
      if (key === "_gotcha") return;
      data[key] = data[key] ? data[key] + ", " + value : String(value);
    });
    return data;
  }

  function setStatus(form, text, kind) {
    var el = form.querySelector(".form-status");
    if (!el) return;
    el.textContent = text;
    el.className = "form-status" + (kind ? " " + kind : "");
  }

  function onSubmit(e) {
    var form = e.target.closest ? e.target.closest("form[data-form]") : null;
    if (!form) return;
    e.preventDefault();

    var trap = form.querySelector('[name="_gotcha"]');
    if (trap && trap.value) return; // un robot rellenó el campo oculto

    if (!form.checkValidity()) {
      form.reportValidity();
      setStatus(form, "Revisa los campos marcados y vuelve a enviar.", "fail");
      return;
    }

    var kind = form.getAttribute("data-form");
    var subject = "[Web Evolv] " + (SUBJECTS[kind] || "Mensaje");
    var data = collect(form);
    var btn = form.querySelector('button[type="submit"]');

    if (CFG.formEndpoint) {
      var payload = Object.assign({}, CFG.formExtra || {}, data, { subject: subject });
      if (btn) btn.disabled = true;
      setStatus(form, "Enviando…", "");
      fetch(CFG.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          form.reset();
          setStatus(form, "¡Gracias por tu mensaje! Te responderemos lo antes posible.", "ok");
        })
        .catch(function () {
          setStatus(form, "No hemos podido enviar el mensaje. Escríbenos a " + CFG.contactEmail + " o llámanos al " + CFG.contactPhone + ".", "fail");
        })
        .then(function () { if (btn) btn.disabled = false; });
      return;
    }

    // Sin servicio de formularios configurado: abrir el correo del visitante
    var body = Object.keys(data).map(function (k) { return k + ": " + data[k]; }).join("\n");
    window.location.href = "mailto:" + CFG.contactEmail + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    setStatus(form, "Se ha abierto tu correo con el mensaje listo. Pulsa enviar allí para terminar.", "ok");
  }

  /* ---------- Menú móvil ---------- */
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("site-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---------- Arranque ---------- */
  document.addEventListener("submit", onSubmit);

  document.addEventListener("DOMContentLoaded", function () {
    initNav();

    document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

    var today = new Date();
    var iso = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
    document.querySelectorAll("input[data-min-today]").forEach(function (el) { el.min = iso; });

    var needsData = document.querySelector("[data-listing], select[data-props], #detail");
    if (!needsData) return;

    loadProps()
      .then(function (list) {
        renderListings(list);
        fillSelects(list);
        renderDetail(list);
      })
      .catch(function () {
        var msg = "No se han podido cargar las propiedades ahora mismo. Inténtalo de nuevo en unos minutos.";
        document.querySelectorAll("[data-listing]").forEach(function (el) { el.innerHTML = '<p class="listing-status">' + msg + "</p>"; });
        var d = document.getElementById("detail");
        if (d) d.innerHTML = '<div class="container section"><p>' + msg + "</p></div>";
      });
  });
})();
