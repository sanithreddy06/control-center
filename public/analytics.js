/**
 * Cross-domain analytics tracking snippet.
 * Add this to saisanithreddy.online and all subdomains.
 */
(function () {
  var TRACK_URL = "https://control.saisanithreddy.online/api/analytics/track";
  var STORAGE_KEY = "cc_visitor_id";

  function getVisitorId() {
    var id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  }

  function track() {
    fetch(TRACK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        domain: window.location.hostname,
        path: window.location.pathname,
        visitorId: getVisitorId(),
      }),
      keepalive: true,
    }).catch(function () {});
  }

  if (document.readyState === "complete") {
    track();
  } else {
    window.addEventListener("load", track);
  }
})();
