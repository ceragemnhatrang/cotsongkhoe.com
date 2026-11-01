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
    var SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzYN6VEWU5djpFy9WCRgAv9EDWdCSHBKnJyCH5dzY2MqAZP0X21mKDQJ0UkOEjYrG7ebQ/exec";

    var pageUrl = document.getElementById("pageUrl");
    var pageTitle = document.getElementById("pageTitle");
    var messageEl = document.getElementById("formMessage");
    var submitBtn = document.getElementById("submitBtn");
    var submitText = submitBtn ? submitBtn.textContent : "";

    function fillPageInfo() {
      if (pageUrl) pageUrl.value = window.location.href;
      if (pageTitle) pageTitle.value = document.title;
    }
    fillPageInfo();

    // Gửi dữ liệu tới Apps Script. Trả về true nếu thành công.
    async function sendToScript(data) {
      var init = {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "text/plain;charset=utf-8" }
      };
      try {
        var res = await fetch(SCRIPT_URL, init);
        var result = await res.json();
        if (!result.ok) throw new Error(result.error || "Apps Script từ chối");
        return true;
      } catch (err) {
        // Trình duyệt chặn đọc phản hồi (CORS) -> gửi lại dạng no-cors.
        // Không đọc được kết quả nhưng dữ liệu vẫn tới Apps Script.
        if (err instanceof TypeError) {
          await fetch(SCRIPT_URL, Object.assign({}, init, { mode: "no-cors" }));
          return true;
        }
        throw err;
      }
    }

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
        await sendToScript(data);
        messageEl.className = "success";
        messageEl.textContent = "Gửi thành công! Chúng tôi sẽ liên hệ sớm.";
        form.reset();
        fillPageInfo();
      } catch (err) {
        console.error("Lỗi gửi form:", err);
        messageEl.className = "error";
        messageEl.textContent = "Chưa gửi được. Vui lòng thử lại hoặc gọi điện trực tiếp.";
      }
      submitBtn.disabled = false;
      submitBtn.textContent = submitText || "Gửi thông tin đăng ký";
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
