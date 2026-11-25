(function () {
  window.dataLayer = window.dataLayer || [];

  function gtag() {
    window.dataLayer.push(arguments);
  }

  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", "G-RSVP17KFKM");

  var gtagScript = document.createElement("script");
  gtagScript.async = true;
  gtagScript.src =
    "https://www.googletagmanager.com/gtag/js?id=G-RSVP17KFKM";
  document.head.appendChild(gtagScript);

  window.dataLayer.push({
    "gtm.start": new Date().getTime(),
    event: "gtm.js",
  });

  var gtmScript = document.createElement("script");
  gtmScript.async = true;
  gtmScript.src =
    "https://www.googletagmanager.com/gtm.js?id=GTM-P5DJ66QV";
  document.head.appendChild(gtmScript);
})();
