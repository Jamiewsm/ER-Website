// Home promo modal — Enneagram for Parenting 4-week workshop
(function () {
  var PROMO_ID = 'parents-workshop-promo-modal';
  var STORAGE_KEY = 'er_parents_workshop_promo_dismissed_date';

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function isPromoDismissedToday() {
    try {
      return localStorage.getItem(STORAGE_KEY) === todayKey();
    } catch (_e) {
      return false;
    }
  }

  function dismissPromoForToday() {
    try {
      localStorage.setItem(STORAGE_KEY, todayKey());
    } catch (_e) {}
    closeParentsWorkshopPromo();
  }

  function closeParentsWorkshopPromo() {
    var el = document.getElementById(PROMO_ID);
    if (el) el.remove();
    document.body.classList.remove('overflow-hidden');
  }

  function onPromoKeydown(event) {
    if (event.key === 'Escape') closeParentsWorkshopPromo();
  }

  function showParentsWorkshopPromo() {
    if (document.getElementById(PROMO_ID)) return;
    if (isPromoDismissedToday()) return;
    if (/[?&]no_promo=1/.test(window.location.search || '')) return;

    var modal = document.createElement('div');
    modal.id = PROMO_ID;
    modal.className = 'fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/45 backdrop-blur-sm';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'parents-promo-title');

    modal.innerHTML = `
      <div class="relative w-full max-w-md rounded-[2rem] overflow-hidden bg-er-surface shadow-card border border-white/80 animate-fade-in-up max-h-[90dvh] overflow-y-auto" onclick="event.stopPropagation()">
        <div class="relative h-36 sm:h-40">
          <img src="/assets/parents-brochure/bg-01-cover.jpg" alt="" class="absolute inset-0 w-full h-full object-cover" style="object-position: center 30%;" />
          <div class="absolute inset-0 bg-gradient-to-t from-er-surface via-er-surface/40 to-transparent"></div>
          <button type="button" onclick="closeParentsWorkshopPromo()" class="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 text-gray-500 hover:bg-er-dark hover:text-white flex items-center justify-center shadow-sm transition-colors" aria-label="닫기">
            <i class="fas fa-times"></i>
          </button>
          <span class="absolute bottom-3 left-4 inline-flex rounded-full bg-[#c47a5a] text-white text-[10px] font-bold px-3 py-1 shadow-sm">소규모 선착순</span>
        </div>
        <div class="px-6 pb-6 pt-2">
          <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-er-primary mb-1">Enneagram for Restoration</p>
          <h2 id="parents-promo-title" class="text-xl sm:text-2xl font-extrabold text-er-dark leading-snug break-keep">
            Enneagram for Parenting
          </h2>
          <p class="mt-1 text-base font-semibold text-er-dark break-keep">4주 자녀양육 워크샵</p>
          <p class="mt-3 text-sm text-gray-600 leading-relaxed break-keep">
            양육의 변화는 부모의 자기이해에서 시작됩니다. 에니어그램 심화 과정으로 나를 돌아보고 아이를 새롭게 바라보는 시간을 함께합니다.
          </p>
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="text-[11px] font-semibold rounded-full bg-er-accentLight/80 text-er-dark px-3 py-1">4주 · 주 1회</span>
            <span class="text-[11px] font-semibold rounded-full bg-er-accentLight/80 text-er-dark px-3 py-1">6월–7월 · Zoom</span>
            <span class="text-[11px] font-semibold rounded-full bg-er-accentLight/80 text-er-dark px-3 py-1">$120</span>
          </div>
          <p class="mt-3 text-xs text-er-muted break-keep">※ 에니어그램 입문이 아닌, 유형을 어느 정도 알고 계신 부모님을 위한 심화 과정입니다.</p>
          <div class="mt-5 flex flex-col gap-2.5">
            <button type="button" onclick="parentsPromoGoDetail()" class="w-full py-3.5 rounded-full bg-er-dark text-white text-sm font-bold shadow-soft hover:bg-gray-800 transition-all hover:-translate-y-0.5">
              자세히 알아보기
            </button>
            <button type="button" onclick="parentsPromoGoApply()" class="w-full py-3.5 rounded-full border border-er-accent/50 bg-white text-er-dark text-sm font-bold hover:bg-er-accentLight/40 transition-colors">
              워크샵 바로 신청하기
            </button>
          </div>
          <div class="mt-4 flex items-center justify-between gap-3 text-xs">
            <button type="button" onclick="dismissParentsWorkshopPromoToday()" class="text-er-muted hover:text-er-dark underline underline-offset-2 break-keep">
              오늘 하루 보지 않기
            </button>
            <button type="button" onclick="closeParentsWorkshopPromo()" class="text-gray-500 hover:text-er-dark font-semibold">
              닫기
            </button>
          </div>
        </div>
      </div>
    `;

    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeParentsWorkshopPromo();
    });
    document.addEventListener('keydown', onPromoKeydown);
    modal.addEventListener('remove', function () {
      document.removeEventListener('keydown', onPromoKeydown);
    });

    document.body.appendChild(modal);
    document.body.classList.add('overflow-hidden');
    var firstBtn = modal.querySelector('button');
    if (firstBtn) setTimeout(function () { firstBtn.focus(); }, 50);
  }

  function maybeShowParentsWorkshopPromo() {
    if (window.state && window.state.currentSection !== 'home') return;
    showParentsWorkshopPromo();
  }

  function parentsPromoGoDetail() {
    closeParentsWorkshopPromo();
    window.location.href = '/parenting-workshop.html';
  }

  function parentsPromoGoApply() {
    closeParentsWorkshopPromo();
    if (typeof renderSection === 'function') {
      renderSection('apply', { track: 'paid', focus: 'parenting_workshop' });
    } else {
      window.location.href = '/#apply?track=paid&focus=parenting_workshop';
    }
  }

  window.closeParentsWorkshopPromo = closeParentsWorkshopPromo;
  window.dismissParentsWorkshopPromoToday = dismissPromoForToday;
  window.showParentsWorkshopPromo = showParentsWorkshopPromo;
  window.maybeShowParentsWorkshopPromo = maybeShowParentsWorkshopPromo;
  window.parentsPromoGoDetail = parentsPromoGoDetail;
  window.parentsPromoGoApply = parentsPromoGoApply;
})();
