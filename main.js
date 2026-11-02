// Header: mark the section in view, close the compact menu after a choice.
(function () {
  var links = Array.prototype.slice.call(document.querySelectorAll(".top-nav a[href^='#']"));
  var menu = document.querySelector(".menu");
  if (menu) {
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) menu.removeAttribute("open"); });
    document.addEventListener("click", function (e) { if (!menu.contains(e.target)) menu.removeAttribute("open"); });
  }
  if (!links.length || !window.IntersectionObserver) return;
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
  var order = ["lesson", "curriculum", "pricing", "faq"];
  var visible = {};
  function update() {
    var current = null;
    order.forEach(function (id) { if (visible[id]) current = id; });
    links.forEach(function (a) {
      if (a === byId[current]) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting; });
    update();
  }, { rootMargin: "-40% 0px -55% 0px" });
  order.forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
})();

// Invite form: post in the background and confirm in place. Falls back to a normal
// submit (and a redirect back here with ?invited=1) if fetch is unavailable or fails.
(function () {
  var form = document.querySelector(".signup");
  var note = document.querySelector(".signup-note");
  if (!form || !note) return;

  function confirmed(email) {
    form.hidden = true;
    note.textContent = "You're on the list" + (email ? " as " + email : "") + ". We'll send a TestFlight invite as beta seats open, and tell you the day it reaches the App Store.";
  }

  if (/[?&]invited=1/.test(window.location.search)) confirmed("");

  form.addEventListener("submit", function (e) {
    if (!window.fetch || !window.FormData) return;
    e.preventDefault();
    var button = form.querySelector("button");
    var email = form.querySelector("#email").value;
    button.disabled = true;
    button.textContent = "Sending";
    fetch(form.action.replace("formsubmit.co/", "formsubmit.co/ajax/"), {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(form)
    }).then(function (r) {
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    }).then(function (data) {
      if (!data || String(data.success) !== "true") throw new Error("refused");
      confirmed(email);
    }).catch(function () {
      button.disabled = false;
      button.textContent = "Request an invite";
      note.textContent = "That didn't go through. Try again, or email patrickodonohuev@icloud.com and we'll add you by hand.";
    });
  });
})();
