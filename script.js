(() => {
  'use strict';
  const cfg = window.LIVRO_CONFIG || {};
  const $ = (sel) => document.querySelector(sel);
  const escape = (text) => String(text ?? '').replace(/[&<>"']/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const nl2br = (text) => escape(text).replace(/\n/g, '<br>');
  const name = () => escape(cfg.nomeDela || 'Minha princesa');
  const byline = () => escape(cfg.seuNome || 'Seu príncipe');

  const ornaments = `<span class="page-ornament" aria-hidden="true">✧ &nbsp; ♡ &nbsp; ✧</span>`;
  const header = (chapter, title) => `<div class="page-heading"><span class="page-kicker">${chapter}</span><h3>${title}</h3>${ornaments}</div>`;
  const footer = (num) => `<span class="folio" aria-hidden="true">✦ &nbsp; ${String(num).padStart(2, '0')} &nbsp; ✦</span>`;
  const page = (type, content, num) => `<article class="storybook-page page-${type}"><div class="page-border"><div class="page-surface">${content}</div>${footer(num)}</div></article>`;
  const photo = (source, index) => {
    const label = ((cfg.legendasFotos || [])[index] || ['Nossa lembrança favorita', 'Um instante especial', 'Um pedacinho de nós'][index] || 'Nossa foto').slice(0, 80);
    if (typeof source === 'string' && source.trim()) {
      return `<div class="polaroid" style="--angle:${[-5,4,-2][index]}deg"><div class="polaroid-image"><img src="${escape(source.trim())}" alt="${escape(label)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.hidden=false;"><span class="photo-fallback" hidden>♡<small>Adicione uma foto</small></span></div><span>${escape(label)} ♡</span></div>`;
    }
    return `<div class="polaroid" style="--angle:${[-5,4,-2][index]}deg"><div class="polaroid-image photo-empty"><span aria-hidden="true">${['♡','✧','❦'][index]}</span><small>Sua foto aqui</small></div><span>${escape(label)} ♡</span></div>`;
  };

  function counterMarkup() {
    if (!cfg.dataInicio) {
      return `<div class="time-number" aria-label="Nossa história é infinita">∞</div><div class="time-unit">momentos para guardar</div><p class="body-copy">Tem coisa que nem precisa de calendário: a vontade de dividir meus dias com você é uma delas. E que ainda venham muitos momentos para contar.</p>`;
    }
    const parsed = new Date(`${cfg.dataInicio}T12:00:00`);
    if (Number.isNaN(parsed.getTime())) return `<p class="body-copy">Cada segundo ao seu lado é um presente. ♡</p>`;
    const now = new Date();
    const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const start = Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    const days = Math.max(0, Math.round((today - start) / 86400000));
    return `<div class="time-number">${days.toLocaleString('pt-BR')}</div><div class="time-unit">${days === 1 ? 'dia' : 'dias'} escrevendo nosso conto</div><p class="body-copy">Não são apenas números. São dias de conversa, risadas, saudade, reencontros e mais motivos para te escolher.</p>`;
  }

  function makePages() { return [
    page('dedication', `<div class="small-crown">♕</div>${header('UMA DEDICATÓRIA', `Para ${name()}`)}<p class="body-copy centered">${escape(cfg.dedicatória)}</p><img class="castle-art" src="assets/castelo.webp" alt="Castelo encantado ao entardecer"><p class="page-signoff">Com todo o meu amor, ${byline()}</p>`, 1),
    page('opening', `${header('O PREFÁCIO', 'Antes de tudo...')}<div class="dropcap-copy">${escape(cfg.primeiraPagina)}</div><div class="quote-ornament">❝</div><blockquote class="book-quote">A melhor parte de te conhecer foi descobrir que os dias comuns também podiam ser extraordinários.</blockquote><div class="soft-stars" aria-hidden="true">✧　✦　✧</div>`, 2),
    page('chapter', `${header('CAPÍTULO I', 'Quando tudo começou')}<div class="chapter-medallion" aria-hidden="true">✦<span>♡</span>✦</div><p class="body-copy centered">${escape(cfg.capituloUm)}</p><p class="handwritten">A gente nem sabia quantas coisas boas ainda viriam...</p>`, 3),
    page('details', `${header('CADA DETALHE', 'O meu feitiço favorito')}<p class="body-copy">${escape(cfg.textoEspecial)}</p><div class="heart-list"><span>♡</span> Seu sorriso que muda o meu dia.<br><span>♡</span> Nossas piadas que só a gente entende.<br><span>♡</span> A paz de ter você por perto.</div><p class="handwritten">E eu sou fã até dos seus detalhes. ♡</p>`, 4),
    page('memories-intro', `${header('CAPÍTULO II', 'Nossas lembranças')}<div class="memory-frame"><div class="memory-frame-inner"><span>✧</span><strong>Se a felicidade tivesse álbum, muitas páginas seriam nossas.</strong><span>♡</span></div></div><p class="body-copy centered">${escape(cfg.capituloDois)}</p>`, 5),
    page('gallery', `${header('UM ÁLBUM ENCANTADO', 'Momentos de nós dois')}<p class="gallery-intro">${escape(cfg.textoMemorias)}</p><div class="photo-gallery">${Array.from({length:3}, (_,i) => photo((cfg.fotos || [])[i],i)).join('')}</div><p class="handwritten gallery-bottom">Cada fotografia, um motivo para sorrir de novo.</p>`, 6),
    page('time', `${header('CADA SEGUNDO IMPORTA', 'Nossa história em dias')}<div class="time-container"><div class="time-rose" aria-hidden="true">❦</div>${counterMarkup()}</div><div class="bottom-vine" aria-hidden="true">✧　♡　✧</div>`, 7),
    page('promises', `${header('CAPÍTULO III', 'Minhas promessas')}<p class="body-copy centered">Não sei prever o futuro nem fazer mágica. Mas sei como quero caminhar por ele: com você.</p><div class="promise-list"><div><span>✧</span><p>${escape(cfg.promessaUm)}</p></div><div><span>♡</span><p>${escape(cfg.promessaDois)}</p></div><div><span>✦</span><p>${escape(cfg.promessaTres)}</p></div></div>`, 8),
    page('secret', `${header('UMA PÁGINA SECRETA', 'Uma carta para você')}<p class="body-copy centered">Tem palavras que eu queria te dizer olhando nos seus olhos. Como nem sempre consigo, guardei algumas aqui, só para você.</p><button class="letter-button" type="button" aria-label="Abrir a carta de amor"><span class="envelope" aria-hidden="true"><span class="envelope-heart">♥</span></span><span class="letter-cta">Toque para abrir sua cartinha</span></button><div class="letter-content" hidden><p>${nl2br(cfg.carta)}</p><span>Com amor, ${byline()} ♡</span></div>`, 9),
    page('ending', `${header('CONTINUA...', 'Nosso para sempre')}<div class="ending-illustration"><img src="assets/ilustracao-capa.webp" alt="Um casal apaixonado em um conto de fadas"></div><p class="body-copy centered ending-message">${escape(cfg.ultimoRecado)}</p><p class="end-note">E decidiram viver todos os próximos capítulos...<br><strong>juntos.</strong> ♡</p><button class="restart-button" type="button">Recomeçar nossa história ↶</button>`, 10)
  ]; }
  let pages = makePages();

  const totalSheets = pages.length / 2;
  let turns = 0;
  let mobileIndex = 0;
  let animating = false;
  let lastMobile = window.matchMedia('(max-width: 760px)').matches;
  const cover = $('#cover-screen');
  const reader = $('#reading-screen');
  const sheets = $('#sheets-container');
  const mobilePage = $('#mobile-page');
  const mobileFlip = $('#mobile-flip');
  const prev = $('#prev-page');
  const next = $('#next-page');
  const progressText = $('#progress-text');
  const progressDots = $('#progress-dots');

  $('#cover-to').textContent = `Uma história dedicada a ${cfg.nomeDela || 'você'}`;
  document.title = `Nosso Conto de Fadas ♡ ${cfg.nomeDela || 'Para você'}`;

  function makeSheets() {
    sheets.innerHTML = pages.reduce((html, item, i) => {
      if (i % 2) return html;
      const index = i / 2;
      return html + `<div class="sheet" data-index="${index}" style="z-index:${totalSheets-index}"><div class="sheet-front">${pages[i]}</div><div class="sheet-back">${pages[i+1]}</div></div>`;
    }, '');
    progressDots.innerHTML = "";
    for (let i = 0; i <= totalSheets; i++) {
      progressDots.insertAdjacentHTML('beforeend', '<span class="progress-dot"></span>');
    }
  }
  makeSheets();

  function getMobile() { return window.matchMedia('(max-width: 760px)').matches; }
  function getVisibleNumber() { return getMobile() ? mobileIndex+1 : Math.min(pages.length, 1 + turns*2); }
  function updateProgress() {
    const isMobile = getMobile();
    const atStart = isMobile ? mobileIndex === 0 : turns === 0;
    const atEnd = isMobile ? mobileIndex === pages.length-1 : turns === totalSheets;
    prev.disabled = atStart || animating;
    next.disabled = atEnd || animating;
    progressText.textContent = isMobile ? `Página ${mobileIndex+1} de ${pages.length}` : turns === totalSheets ? 'Fim do livro ♡' : `Capítulo ${turns+1} de ${totalSheets}`;
    [...progressDots.children].forEach((dot, i) => {dot.classList.toggle('active', i === turns);});
    next.querySelector('span').textContent = atEnd ? 'Fim' : 'Próxima';
  }
  function syncSheets() {
    [...sheets.children].forEach((sheet, idx) => {
      const flipped = idx < turns;
      sheet.classList.toggle('is-flipped', flipped);
      sheet.style.zIndex = flipped ? String(idx + 1) : String(totalSheets - idx);
    });
    updateProgress();
  }
  function setMobilePage() {
    mobilePage.innerHTML = pages[mobileIndex];
    mobilePage.querySelectorAll('.letter-content').forEach(x=>x.hidden=true);
    updateProgress();
  }

  function releaseAnimation() {
    animating = false;
    syncSheets();
    updateProgress();
  }
  function desktopTurn(direction) {
    if (animating) return;
    if (direction > 0 && turns >= totalSheets || direction < 0 && turns <= 0) return;
    animating = true;
    updateProgress();
    const index = direction > 0 ? turns : turns - 1;
    const sheet = sheets.children[index];
    sheet.style.zIndex = '100';
    // Force reflow so browsers animate the paper and not the whole page.
    void sheet.offsetWidth;
    sheet.classList.toggle('is-flipped', direction > 0);
    turns += direction;
    window.setTimeout(releaseAnimation, 850);
  }
  function mobileTurn(direction) {
    if (animating) return;
    const target = mobileIndex + direction;
    if (target < 0 || target >= pages.length) return;
    animating = true;
    updateProgress();
    mobileFlip.innerHTML = mobilePage.innerHTML;
    mobileFlip.className = `mobile-flip ${direction > 0 ? 'turn-forward' : 'turn-backward'}`;
    mobileFlip.style.display = 'block';
    mobileIndex = target;
    setMobilePage();
    mobilePage.classList.add('mobile-page-reveal');
    window.setTimeout(() => {
      mobileFlip.style.display = 'none';
      mobileFlip.className = 'mobile-flip';
      mobilePage.classList.remove('mobile-page-reveal');
      animating = false;
      updateProgress();
    }, 610);
  }
  function navigate(direction) { getMobile() ? mobileTurn(direction) : desktopTurn(direction); }

  function goToCover() {
    if (animating) return;
    reader.hidden = true;
    cover.hidden = false;
    $('.closed-book').classList.remove('is-opening');
    window.scrollTo({top:0, behavior:'smooth'});
  }
  function openBook() {
    if (animating) return;
    animating = true;
    $('.closed-book').classList.add('is-opening');
    window.setTimeout(() => {
      cover.hidden = true;
      reader.hidden = false;
      animating = false;
      syncSheets();
      setMobilePage();
      window.scrollTo({top:0, behavior:'smooth'});
    }, 560);
  }

  function burstHearts(target) {
    const burst = $('#heart-burst');
    const rect = target.getBoundingClientRect();
    for (let i=0;i<14;i++) {
      const heart = document.createElement('span');
      heart.className = 'floating-heart';
      heart.textContent = i%3 ? '♥' : '✦';
      heart.style.left = `${rect.left + rect.width/2 + (Math.random()-.5)*85}px`;
      heart.style.top = `${rect.top + rect.height/2}px`;
      heart.style.setProperty('--floatX', `${(Math.random()-.5)*210}px`);
      heart.style.setProperty('--floatY', `${-85-Math.random()*140}px`);
      heart.style.animationDelay = `${Math.random()*.18}s`;
      burst.appendChild(heart);
      window.setTimeout(()=> heart.remove(), 1800);
    }
  }

  document.addEventListener('click', (event) => {
    const letter = event.target.closest('.letter-button');
    if (letter) {
      const parent = letter.closest('.storybook-page');
      const content = parent.querySelector('.letter-content');
      if (content) {
        const isOpening = content.hidden;
        content.hidden = !isOpening;
        letter.classList.toggle('letter-open', isOpening);
        letter.querySelector('.letter-cta').textContent = isOpening ? 'Fechar cartinha ♡' : 'Toque para abrir sua cartinha';
        if (isOpening) burstHearts(letter);
      }
    }
    if (event.target.closest('.restart-button')) {
      mobileIndex = 0;
      turns = 0;
      syncSheets();
      setMobilePage();
      goToCover();
    }
  });

  $('#open-book').addEventListener('click', openBook);
  $('#closed-book').addEventListener('click', (event) => { if (!event.target.closest('#open-book')) openBook(); });
  prev.addEventListener('click', () => navigate(-1));
  next.addEventListener('click', () => navigate(1));
  $('#back-to-cover').addEventListener('click', goToCover);
  document.addEventListener('keydown', (event) => {
    if (reader.hidden || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target instanceof HTMLElement && event.target.matches('input,textarea')) return;
    if (event.key === 'ArrowRight') {event.preventDefault();navigate(1);}
    if (event.key === 'ArrowLeft') {event.preventDefault();navigate(-1);}
    if (event.key === 'Escape') goToCover();
  });

  let touchStartX = 0;
  let touchStartY = 0;
  mobilePage.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].screenX;
    touchStartY = event.changedTouches[0].screenY;
  }, {passive:true});
  mobilePage.addEventListener('touchend', (event) => {
    const distanceX = event.changedTouches[0].screenX - touchStartX;
    const distanceY = event.changedTouches[0].screenY - touchStartY;
    if (Math.abs(distanceX) > 60 && Math.abs(distanceX) > 1.3 * Math.abs(distanceY)) navigate(distanceX < 0 ? 1 : -1);
  }, {passive:true});
  window.addEventListener('resize', () => {
    const isMobile = getMobile();
    if (isMobile !== lastMobile && !reader.hidden) {
      if (isMobile) { mobileIndex = Math.min(pages.length - 1, turns * 2); setMobilePage(); }
      else { turns = Math.min(totalSheets, Math.ceil(mobileIndex / 2)); syncSheets(); }
      lastMobile = isMobile;
    }
  });

  // O site mostra o conteúdo padrão até as publicações do Firestore carregarem.
  // A tela de edição fica numa página separada e nunca é exposta no livro.
  window.LIVRO_ATUALIZAR = function (conteudo, imagens) {
    if (conteudo && typeof conteudo === 'object') {
      for (const chave of Object.keys(window.LIVRO_CONFIG || {})) {
        if (chave === 'fotos' || chave === 'legendasFotos') continue;
        if (typeof conteudo[chave] === 'string') cfg[chave] = conteudo[chave].slice(0, 5500);
      }
    }
    if (imagens && typeof imagens === 'object') {
      let capa = '';
      const fotos = [...(cfg.fotos || ['', '', ''])];
      const legendas = [...(cfg.legendasFotos || ['','',''])];
      for (const [i, id] of ['capa','foto-1','foto-2','foto-3'].entries()) {
        const item = imagens[id];
        if (!item || typeof item !== 'object') continue;
        if (typeof item.dataUrl === 'string' && /^data:image\/(webp|jpeg|png);base64,/.test(item.dataUrl)) {
          if (i === 0) capa = item.dataUrl;
          else fotos[i - 1] = item.dataUrl;
        }
        if (i > 0 && typeof item.legenda === 'string') legendas[i - 1] = item.legenda.slice(0, 60);
      }
      cfg.fotos = fotos;
      cfg.legendasFotos = legendas;
      if (capa) {
        $('#cover-main-image').src = capa;
        $('#cover-main-image').alt = 'Nossa fotografia especial na capa do livro';
      }
    }
    $('#cover-to').textContent = `Uma história dedicada a ${cfg.nomeDela || 'você'}`;
    document.title = `Nosso Conto de Fadas ♡ ${cfg.nomeDela || 'Para você'}`;
    pages = makePages();
    turns = 0;
    mobileIndex = 0;
    makeSheets();
    syncSheets();
    setMobilePage();
  };

  window.dispatchEvent(new Event('livro:ready'));

  // Decorative stars. Seeded deterministic positions keep the sky stable.
  let seed = 42;
  const random = () => {seed = (seed*16807)%2147483647;return (seed-1)/2147483646;};
  const starLayer = $('#sky-stars');
  for (let i = 0; i < 62; i++) {
    const star = document.createElement('span');
    star.className = 'sky-star';
    star.style.left = `${random()*100}%`;
    star.style.top = `${random()*100}%`;
    star.style.width = star.style.height = `${1+random()*2.4}px`;
    star.style.animationDelay = `${random()*5}s`;
    star.style.animationDuration = `${2.5+random()*4}s`;
    starLayer.appendChild(star);
  }
  updateProgress();
})();
