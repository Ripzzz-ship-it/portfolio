/* ============================================================
   RAIN EFFECT — Straight vertical rain, no wind
   ============================================================ */
(function () {
  const canvas = document.getElementById('rain-canvas');
  const ctx    = canvas.getContext('2d');

  /* ---------- tuneable knobs ---------- */
  const isSmallScreen = window.innerWidth <= 768;
  const DROP_COUNT = isSmallScreen ? 120 : 280; // jumlah tetes (lebih ringan di HP)
  const BASE_SPEED = 2.2;                        // kecepatan jatuh
  /* ------------------------------------ */

  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* Create a raindrop */
  function makeDrop() {
    return {
      x:     Math.random() * W,
      y:     Math.random() * H - H,
      len:   8 + Math.random() * 14,
      speed: BASE_SPEED * (0.6 + Math.random() * 0.8),
      alpha: 0.2 + Math.random() * 0.45,
      width: 0.6 + Math.random() * 0.7,
    };
  }

  const drops = Array.from({ length: DROP_COUNT }, makeDrop);

  /* Splash pool */
  const splashes = [];

  function addSplash(x, y) {
    splashes.push({ x, y, r: 0, alpha: 0.5 });
  }

  function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, W, H);

    /* Draw + update drops */
    drops.forEach(d => {
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x, d.y + d.len);
      ctx.strokeStyle = `rgba(180, 200, 220, ${d.alpha})`;
      ctx.lineWidth   = d.width;
      ctx.lineCap     = 'round';
      ctx.stroke();

      d.y += d.speed;

      if (d.y > H + d.len) {
        addSplash(d.x, H - 2);
        Object.assign(d, makeDrop(), { y: -d.len });
      }
    });

    /* Draw + fade splashes */
    for (let i = splashes.length - 1; i >= 0; i--) {
      const s = splashes[i];
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(180, 200, 220, ${s.alpha})`;
      ctx.lineWidth   = 0.6;
      ctx.stroke();
      s.r     += 0.25;
      s.alpha -= 0.03;
      if (s.alpha <= 0) splashes.splice(i, 1);
    }
  }

  animate();
})();

/* ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inisialisasi ikon Lucide
  if (window.lucide) {
    lucide.createIcons();
  }

  // 2. Animasi Stagger Entrance saat halaman dimuat
  const cards = document.querySelectorAll('.slide-card');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.55s ease, transform 0.35s ease, border-color 0.3s ease, box-shadow 0.3s ease';

    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 90 * index);
  });

  const isMobileTouch =
    window.matchMedia('(max-width: 768px)').matches ||
    ('ontouchstart' in window && window.innerWidth <= 768);

  // 3. Efek 3D Tilt & Cursor Spotlight (aktif di layar non-HP agar scroll HP tetap ringan & halus)
  const interactiveCards = document.querySelectorAll('.interactive-card');
  if (!isMobileTouch) {
    interactiveCards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Update posisi cahaya spotlight
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);

        // Efek tilt 3D halus
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -2.2;
        const rotateY = ((x - centerX) / centerX) * 2.2;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });
  }

  // 4. Interaksi Hover/Click/Tap pada My Skills
  const skillItems = document.querySelectorAll('.skill-item');
  const skillHint = document.getElementById('skill-detail-label');
  const defaultHintText = isMobileTouch
    ? 'Ketuk keahlian untuk melihat detail'
    : 'Arahkan kursor atau klik keahlian untuk melihat detail';
  let activeSelectedSkill = null;

  if (skillHint) {
    skillHint.textContent = defaultHintText;
  }

  skillItems.forEach((item) => {
    const info = item.getAttribute('data-skill');

    item.addEventListener('mouseenter', () => {
      skillHint.textContent = info;
      skillHint.classList.add('active');
    });

    item.addEventListener('mouseleave', () => {
      if (activeSelectedSkill) {
        skillHint.textContent = activeSelectedSkill.getAttribute('data-skill');
        skillHint.classList.add('active');
      } else {
        skillHint.textContent = defaultHintText;
        skillHint.classList.remove('active');
      }
    });

    item.addEventListener('click', () => {
      if (activeSelectedSkill === item) {
        item.classList.remove('active-skill');
        activeSelectedSkill = null;
        skillHint.textContent = defaultHintText;
        skillHint.classList.remove('active');
        return;
      }

      skillItems.forEach(i => i.classList.remove('active-skill'));
      item.classList.add('active-skill');
      activeSelectedSkill = item;
      skillHint.textContent = info;
      skillHint.classList.add('active');
    });
  });

  // 5. Lightbox Modal Preview untuk My Projects
  const modal = document.getElementById('project-modal');
  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const closeModalBtn = document.getElementById('close-modal');

  document.querySelectorAll('.project-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      modalImg.src = btn.getAttribute('data-img');
      modalTitle.textContent = btn.getAttribute('data-title');
      modalDesc.textContent = btn.getAttribute('data-desc');
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
    });
  });

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  closeModalBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });

  // 6. One-Click Copy Email dengan Toast Notification (dengan fallback aman di HP)
  const toast = document.getElementById('toast');
  let toastTimeout;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  function copyTextFallback(text) {
    const helper = document.createElement('textarea');
    helper.value = text;
    helper.setAttribute('readonly', '');
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.appendChild(helper);
    helper.select();
    document.execCommand('copy');
    document.body.removeChild(helper);
  }

  document.querySelectorAll('.copy-email-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const email = btn.getAttribute('data-email');
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email)
          .then(() => showToast(`Disalin: ${email}`))
          .catch(() => {
            copyTextFallback(email);
            showToast(`Disalin: ${email}`);
          });
      } else {
        copyTextFallback(email);
        showToast(`Disalin: ${email}`);
      }
    });
  });
});