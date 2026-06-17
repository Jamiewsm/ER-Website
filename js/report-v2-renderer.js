(function () {
  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function clampPercent(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return 0;
    return Math.max(0, Math.min(100, number));
  }

  function getPages(model) {
    const data = window.ERReportV2Data || {};
    const samples = data.samples || {};
    const sample = samples[model && model.chemistryKey] || samples.sx_7_w8;
    return sample && Array.isArray(sample.pages) ? sample.pages : [];
  }

  function normalizeResultCode(model, page) {
    if (page && page.resultCode) return page.resultCode;
    const final = model && model.display && model.display.final ? model.display.final : 'SX 7w8';
    return final.replace(/^sx\b/i, 'SX').replace(/^sp\b/i, 'SP').replace(/^so\b/i, 'SO');
  }

  function renderList(items, className) {
    if (!items || !items.length) return '';
    return `<ul class="${className || 'er-v2-list'}">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  }

  function renderHeader(page) {
    return `
      <div class="er-v2-page-header">
        <span>${escapeHtml(page.eyebrow || 'Premium Report')}</span>
        <strong>${String(page.pageNumber).padStart(2, '0')}</strong>
      </div>
    `;
  }

  function renderFooter(page) {
    return `
      <div class="er-v2-page-footer">
        <span>ER Enneagram for Restoration</span>
        <span>${escapeHtml(page.pageNumber)} / 20</span>
      </div>
    `;
  }

  function pageShell(page, body, className) {
    const coverClass = page.layout === 'cover' ? ' is-cover' : '';
    return `
      <section class="er-v2-page er-v2-layout-${escapeHtml(page.layout || 'standard')}${coverClass} ${className || ''}" data-page-id="${escapeHtml(page.id)}">
        ${page.layout === 'cover' ? '' : renderHeader(page)}
        <div class="er-v2-page-body">${body}</div>
        ${renderFooter(page)}
      </section>
    `;
  }

  function renderPageTitle(page) {
    return `
      <div class="er-v2-title-block">
        <p>${escapeHtml(page.eyebrow || '')}</p>
        <h2>${escapeHtml(page.title || '')}</h2>
        ${page.deck ? `<div class="er-v2-deck">${escapeHtml(page.deck)}</div>` : ''}
      </div>
    `;
  }

  function renderDetailGrid(items) {
    if (!items || !items.length) return '';
    return `
      <div class="er-v2-detail-grid">
        ${items.map((item) => `
          <div>
            <span>${escapeHtml(item.label)}</span>
            <strong>${escapeHtml(item.value)}</strong>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderCover(page, model) {
    const details = [
      { label: 'Core Type', value: (model && model.display && model.display.core) || '7번' },
      { label: 'Dominant Instinct', value: (model && model.display && model.display.subtype) || '성적 본능 SX' },
      { label: 'Wing', value: (model && model.display && model.display.wing) || '8번 날개' },
      { label: 'Confidence', value: (model && model.display && model.display.confidence) || '높음' },
    ];
    return pageShell(page, `
      <div class="er-v2-cover-mark">ER</div>
      <div class="er-v2-cover-center">
        <p class="er-v2-cover-eyebrow">${escapeHtml(page.eyebrow)}</p>
        <h1>${escapeHtml(page.title)}</h1>
        <p class="er-v2-cover-subtitle">${escapeHtml(page.subtitle)}</p>
        <div class="er-v2-result-code">${escapeHtml(normalizeResultCode(model, page))}</div>
        <p class="er-v2-cover-identity">${escapeHtml((model && model.chemistry && model.chemistry.identity_sentence) || page.identity)}</p>
        ${renderDetailGrid(details)}
      </div>
      <p class="er-v2-cover-note">${escapeHtml(page.closing)}</p>
    `);
  }

  function renderDashboard(page) {
    return pageShell(page, `
      ${renderPageTitle(page)}
      <div class="er-v2-dashboard-grid">
        ${(page.metrics || []).map((item) => `
          <article>
            <span>${escapeHtml(item.label)}</span>
            <strong>${escapeHtml(item.value)}</strong>
          </article>
        `).join('')}
      </div>
      <blockquote>${escapeHtml(page.quote)}</blockquote>
    `);
  }

  function renderCards(cards, className) {
    if (!cards || !cards.length) return '';
    return `
      <div class="${className || 'er-v2-card-grid'}">
        ${cards.map((card) => `
          <article>
            <h3>${escapeHtml(card.title)}</h3>
            <p>${escapeHtml(card.text)}</p>
          </article>
        `).join('')}
      </div>
    `;
  }

  function renderEditorial(page) {
    return pageShell(page, `
      ${renderPageTitle(page)}
      <blockquote class="er-v2-editorial-quote">${escapeHtml(page.quote)}</blockquote>
      <div class="er-v2-copy">${(page.body || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</div>
      ${renderCards(page.cards)}
    `);
  }

  function renderQuadrants(page) {
    return pageShell(page, `
      ${renderPageTitle(page)}
      <div class="er-v2-quadrants">
        ${(page.sections || []).map((section) => `
          <article>
            <h3>${escapeHtml(section.title)}</h3>
            ${renderList(section.items)}
          </article>
        `).join('')}
      </div>
      <div class="er-v2-question-strip">
        ${(page.coachingQuestions || []).map((question) => `<p>${escapeHtml(question)}</p>`).join('')}
      </div>
    `);
  }

  function renderMetricRows(rows, tone) {
    if (!rows || !rows.length) return '';
    return `
      <div class="er-v2-metric-list">
        ${rows.map((row) => {
          const percent = clampPercent(row.percent);
          return `
            <div class="er-v2-metric${row.active ? ' is-active' : ''}">
              <div><span>${escapeHtml(row.label)}</span><strong>${percent.toFixed(0)}%</strong></div>
              <i><b class="${tone || ''}" style="width:${percent}%"></b></i>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderTopTypes(model) {
    const top3 = (model && model.top3) || [];
    const total = Number(model && model.top3Total) || 0;
    if (!top3.length || !total) return '';
    return `
      <div class="er-v2-toptypes">
        ${top3.map((item, index) => {
          const percent = clampPercent((Number(item.score) / total) * 100);
          return `
            <div class="er-v2-toptype">
              <span>${index + 1}순위</span>
              <strong>${escapeHtml(item.type)}번</strong>
              <em>${percent.toFixed(1)}%</em>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderScoreboard(page, model) {
    return pageShell(page, `
      ${renderPageTitle(page)}
      <div class="er-v2-score-layout">
        <section>
          <h3>Instinct Flow</h3>
          ${renderMetricRows(model && model.instinctRows, 'is-gold')}
        </section>
        <section>
          <h3>Wing Pull</h3>
          ${renderMetricRows(model && model.wingRows, 'is-green')}
        </section>
      </div>
      <div class="er-v2-panel-grid">
        ${(page.panels || []).map((panel) => `
          <article>
            <span>${escapeHtml(panel.title)}</span>
            <strong>${escapeHtml(panel.value)}</strong>
            <p>${escapeHtml(panel.note)}</p>
          </article>
        `).join('')}
      </div>
      ${renderTopTypes(model)}
    `);
  }

  function renderTimeline(page) {
    return pageShell(page, `
      ${renderPageTitle(page)}
      <div class="er-v2-timeline">
        ${(page.steps || []).map((step) => `
          <article>
            <span>${escapeHtml(step.label)}</span>
            <div><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.text)}</p></div>
          </article>
        `).join('')}
      </div>
      <div class="er-v2-two-note">
        <p>${escapeHtml(page.formation)}</p>
        <strong>${escapeHtml(page.restorationPreview)}</strong>
      </div>
    `);
  }

  function renderApplications(page) {
    return pageShell(page, `
      ${renderPageTitle(page)}
      <div class="er-v2-application-grid">
        ${(page.sections || []).map((section) => `
          <article>
            <h3>${escapeHtml(section.title)}</h3>
            <p><strong>강점</strong>${escapeHtml(section.strength)}</p>
            <p><strong>주의</strong>${escapeHtml(section.watch)}</p>
            <p><strong>실천</strong>${escapeHtml(section.practice)}</p>
          </article>
        `).join('')}
      </div>
      <div class="er-v2-signal-strip">
        ${(page.signals || []).map((signal) => `<p><span>${escapeHtml(signal.label)}</span>${escapeHtml(signal.text)}</p>`).join('')}
      </div>
    `);
  }

  function renderTwoColumn(page) {
    return pageShell(page, `
      ${renderPageTitle(page)}
      <div class="er-v2-two-col">
        ${(page.columns || []).map((column) => `
          <article>
            <h3>${escapeHtml(column.title)}</h3>
            <p>${escapeHtml(column.text)}</p>
            ${renderList(column.bullets)}
          </article>
        `).join('')}
      </div>
      <blockquote class="er-v2-balance">${escapeHtml(page.balance)}</blockquote>
    `);
  }

  function renderKeys(page) {
    return pageShell(page, `
      ${renderPageTitle(page)}
      ${renderCards(page.resources, 'er-v2-resource-grid')}
      <ol class="er-v2-sequence">
        ${(page.sequence || []).map((item) => `<li><span></span><p>${escapeHtml(item)}</p></li>`).join('')}
      </ol>
      <p class="er-v2-closing-line">${escapeHtml(page.closing)}</p>
    `);
  }

  function renderJourney(page) {
    return pageShell(page, `
      ${renderPageTitle(page)}
      ${renderCards(page.principles, 'er-v2-principle-grid')}
      <div class="er-v2-journey-note">${escapeHtml(page.journeyNote)}</div>
      ${renderCards(page.nextCards, 'er-v2-next-grid')}
    `);
  }

  function renderProfile(page) {
    return pageShell(page, `
      ${renderPageTitle(page)}
      <div class="er-v2-copy">${(page.body || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</div>
      <div class="er-v2-attribute-grid">
        ${(page.attributes || []).map((item) => `<article><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong></article>`).join('')}
      </div>
    `);
  }

  function renderStack(page) {
    return pageShell(page, `
      ${renderPageTitle(page)}
      <p class="er-v2-lead">${escapeHtml(page.body)}</p>
      <div class="er-v2-stack">
        ${(page.stack || []).map((item) => `
          <article>
            <span>${escapeHtml(item.code)}</span>
            <h3>${escapeHtml(item.label)}</h3>
            <p>${escapeHtml(item.text)}</p>
          </article>
        `).join('')}
      </div>
      ${renderList(page.application, 'er-v2-list is-wide')}
    `);
  }

  function renderComparison(page) {
    return pageShell(page, `
      ${renderPageTitle(page)}
      <p class="er-v2-lead">${escapeHtml(page.body)}</p>
      ${renderCards(page.comparisons, 'er-v2-comparison-grid')}
    `);
  }

  function renderCareer(page) {
    return pageShell(page, `
      ${renderPageTitle(page)}
      <div class="er-v2-two-col">
        ${(page.sections || []).map((section) => `
          <article>
            <h3>${escapeHtml(section.title)}</h3>
            ${renderList(section.items)}
          </article>
        `).join('')}
      </div>
      <div class="er-v2-question-strip">${(page.questions || []).map((question) => `<p>${escapeHtml(question)}</p>`).join('')}</div>
    `);
  }

  function renderRelationship(page) {
    return pageShell(page, `
      ${renderPageTitle(page)}
      <div class="er-v2-copy">${(page.body || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</div>
      <div class="er-v2-prompt-box">
        ${(page.prompts || []).map((prompt) => `<p>${escapeHtml(prompt)}</p>`).join('')}
      </div>
    `);
  }

  function renderRepair(page) {
    return pageShell(page, `
      ${renderPageTitle(page)}
      <div class="er-v2-repair-grid">
        ${(page.sections || []).map((section) => `
          <article>
            <h3>${escapeHtml(section.title)}</h3>
            <p>${escapeHtml(section.text)}</p>
          </article>
        `).join('')}
      </div>
      ${renderList(page.practices, 'er-v2-list is-wide')}
    `);
  }

  function renderPlan(page) {
    return pageShell(page, `
      ${renderPageTitle(page)}
      <div class="er-v2-signal-cards">
        ${(page.signals || []).map((signal) => `<article><span>${escapeHtml(signal.label)}</span><p>${escapeHtml(signal.text)}</p></article>`).join('')}
      </div>
      <ol class="er-v2-reset-list">
        ${(page.reset || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
      </ol>
      <blockquote>${escapeHtml(page.reflection)}</blockquote>
    `);
  }

  function renderFaith(page) {
    return pageShell(page, `
      ${renderPageTitle(page)}
      <p class="er-v2-lead">${escapeHtml(page.body)}</p>
      <div class="er-v2-faith-grid">
        ${(page.movements || []).map((item) => `
          <article>
            <span>${escapeHtml(item.label)}</span>
            <p>${escapeHtml(item.text)}</p>
          </article>
        `).join('')}
      </div>
    `);
  }

  function renderSummary(page) {
    return pageShell(page, `
      ${renderPageTitle(page)}
      ${renderList(page.remember, 'er-v2-summary-list')}
      ${renderCards(page.nextSteps, 'er-v2-next-step-grid')}
      <p class="er-v2-disclaimer">${escapeHtml(page.disclaimer)}</p>
    `);
  }

  function renderPage(page, model) {
    switch (page.layout) {
      case 'cover': return renderCover(page, model);
      case 'dashboard': return renderDashboard(page);
      case 'editorial': return renderEditorial(page);
      case 'quadrants': return renderQuadrants(page);
      case 'scoreboard': return renderScoreboard(page, model);
      case 'timeline': return renderTimeline(page);
      case 'applications': return renderApplications(page);
      case 'two-column': return renderTwoColumn(page);
      case 'keys': return renderKeys(page);
      case 'journey': return renderJourney(page);
      case 'profile': return renderProfile(page);
      case 'stack': return renderStack(page);
      case 'comparison': return renderComparison(page);
      case 'career': return renderCareer(page);
      case 'team': return pageShell(page, `${renderPageTitle(page)}${renderCards(page.cards, 'er-v2-team-grid')}<p class="er-v2-closing-line">${escapeHtml(page.repair)}</p>`);
      case 'relationship': return renderRelationship(page);
      case 'repair': return renderRepair(page);
      case 'plan': return renderPlan(page);
      case 'faith': return renderFaith(page);
      case 'summary': return renderSummary(page);
      default: return pageShell(page, renderPageTitle(page));
    }
  }

  window.ERRenderPremiumReportV2 = function renderPremiumReportV2(model) {
    const host = document.getElementById('result-view');
    if (!host) return null;
    const pages = getPages(model);
    const reportHtml = pages.map((page) => renderPage(page, model)).join('');

    host.innerHTML = `
      <article class="er-report-v2" data-report-version="v2" aria-label="ER Enneagram Premium Report V2">
        <div class="er-v2-screen-actions">
          <button id="download-pdf-btn" type="button">결과 PDF 다운로드</button>
        </div>
        ${reportHtml}
      </article>
    `;
    return host.querySelector('.er-report-v2');
  };
})();
