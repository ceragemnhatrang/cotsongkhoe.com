/* site.js */
(function () {
  function inc(id, file) {
    var el = document.getElementById(id);
    if (!el) return Promise.resolve();
    return fetch(file).then(function (r) { return r.text(); })
      .then(function (t) { el.innerHTML = t; })
      .catch(function () { el.innerHTML = '<p style="padding:12px">Không tải được ' + file + '.</p>'; });
  }

  function active() {
    var cur = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav > a').forEach(function (a) {
      if (a.getAttribute('href') === cur) a.classList.add('on');
    });
  }

  function initForm() {
    var form = document.getElementById("leadForm");
    if (!form) return;

    // CẤU HÌNH NHẬN FORM — điền URL Google Apps Script của bạn.
    // Không đặt token Telegram trong file này: ai mở trang cũng đọc được.
    // Hãy để Apps Script giữ token và chuyển tiếp tin nhắn sang Telegram.
    var SCRIPT_URL = "";

    var pageUrl = document.getElementById("pageUrl");
    var pageTitle = document.getElementById("pageTitle");
    var messageEl = document.getElementById("formMessage");
    var submitBtn = document.getElementById("submitBtn");

    function fillPageInfo() {
      if (pageUrl) pageUrl.value = window.location.href;
      if (pageTitle) pageTitle.value = document.title;
    }
    fillPageInfo();

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      messageEl.className = "";
      messageEl.textContent = "";

      if (!SCRIPT_URL) {
        messageEl.className = "error";
        messageEl.textContent = "Form chưa được cấu hình nơi nhận (SCRIPT_URL trong site.js).";
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Đang gửi...";
      var data = Object.fromEntries(new FormData(form).entries());

      try {
        await fetch(SCRIPT_URL, {
          method: "POST",
          body: JSON.stringify(data),
          headers: { "Content-Type": "text/plain;charset=utf-8" }
        });
        messageEl.className = "success";
        messageEl.textContent = "Gửi thành công! Chúng tôi sẽ liên hệ sớm.";
        form.reset();
        fillPageInfo();
      } catch (err) {
        messageEl.className = "error";
        messageEl.textContent = "Chưa gửi được. Vui lòng thử lại hoặc gọi điện trực tiếp.";
      }
      submitBtn.disabled = false;
      submitBtn.textContent = "Gửi thông tin đăng ký";
    });
  }

  document.addEventListener('click', function (e) {
    var nav = document.getElementById('nav');
    if (e.target.closest('#burger') && nav) { nav.classList.toggle('open'); return; }
    var dd = e.target.closest('[data-dd]');
    if (dd) { dd.parentElement.classList.toggle('open'); return; }
    var a = e.target.closest('a');
    if (a && a.getAttribute('href') === '#') e.preventDefault();
    if (nav) nav.classList.remove('open');
    document.querySelectorAll('.dd.open').forEach(function (x) { x.classList.remove('open'); });
  });

  Promise.all([
    inc('site-header', 'header.html'),
    inc('site-footer', 'footer.html'),
    inc('form-module', 'form-module.html')
  ]).then(function () {
    active();
    initForm();
  });
})();
