const menuBtn = document.getElementById('menuBtn');
const nav = document.getElementById('nav');

menuBtn?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('active');
  menuBtn.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.nav a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('active');
  });
});

const reveals = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(
  entries => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('active');
        }, index * 120);
      }
    });
  },
  { threshold: 0.18 }
);

reveals.forEach(el => observer.observe(el));

const shapes = document.querySelectorAll('.hero-shape');

document.addEventListener('mousemove', event => {
  if (window.innerWidth < 900) return;

  const x = event.clientX / window.innerWidth - 0.5;
  const y = event.clientY / window.innerHeight - 0.5;

  shapes.forEach((shape, index) => {
    const speed = index === 0 ? 32 : -22;
    shape.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
  });
});

const form = document.getElementById('leadForm');
const feedback = document.getElementById('formFeedback');

form?.addEventListener('submit', event => {
  event.preventDefault();

  const data = Object.fromEntries(new FormData(form).entries());

  const mensagem = `
Olá, tenho interesse em uma simulação urbe+.

Nome: ${data.nome}
WhatsApp: ${data.telefone}
Renda familiar: ${data.renda || 'Não informado'}
Bairro/região: ${data.bairro || 'Não informado'}
Quartos: ${data.quartos || 'Não informado'}
Metragem: ${data.metragem || 'Não informado'} m²
Mensagem: ${data.mensagem || 'Não informado'}
  `;

  const telefoneUrbe = '5511994159261';
  const url = `https://wa.me/${telefoneUrbe}?text=${encodeURIComponent(mensagem)}`;

  feedback.textContent = 'Tudo certo! Vamos abrir o WhatsApp com sua simulação.';
  window.open(url, '_blank');

  form.reset();
});

const initGallery = gallery => {
  const galleryTrack = gallery.querySelector('.gallery-track');
  const galleryDots = gallery.querySelector('.gallery-dots');

  if (!galleryTrack || !galleryDots) return;

  const slides = Array.from(galleryTrack.querySelectorAll('.gallery-slide'));

  slides.forEach((slide, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'gallery-dot';
    dot.setAttribute('aria-label', `Ir para foto ${index + 1}`);
    dot.addEventListener('click', () => {
      galleryTrack.scrollTo({ left: index * galleryTrack.clientWidth, behavior: 'smooth' });
    });
    galleryDots.appendChild(dot);
  });

  const dots = Array.from(galleryDots.querySelectorAll('.gallery-dot'));
  dots[0]?.classList.add('is-active');

  const dotObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = slides.indexOf(entry.target);
          dots.forEach(dot => dot.classList.remove('is-active'));
          dots[index]?.classList.add('is-active');
        }
      });
    },
    { root: galleryTrack, threshold: 0.6 }
  );

  slides.forEach(slide => dotObserver.observe(slide));

  let isDragging = false;
  let isDrag = false;
  let startX = 0;
  let startScrollLeft = 0;

  const startDrag = clientX => {
    isDragging = true;
    isDrag = false;
    startX = clientX;
    startScrollLeft = galleryTrack.scrollLeft;
    galleryTrack.classList.add('is-dragging');
  };

  const moveDrag = clientX => {
    if (!isDragging) return;

    const delta = clientX - startX;

    if (Math.abs(delta) > 5) {
      isDrag = true;
    }

    galleryTrack.scrollLeft = startScrollLeft - delta;
  };

  const endDrag = () => {
    if (!isDragging) return;

    isDragging = false;
    galleryTrack.classList.remove('is-dragging');
  };

  galleryTrack.addEventListener('mousedown', event => {
    startDrag(event.clientX);
  });

  window.addEventListener('mousemove', event => {
    moveDrag(event.clientX);
  });

  window.addEventListener('mouseup', endDrag);

  galleryTrack.addEventListener('click', event => {
    if (isDrag) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  const scrollBySlide = direction => {
    galleryTrack.scrollBy({ left: galleryTrack.clientWidth * direction, behavior: 'smooth' });
  };

  gallery.querySelector('.gallery-prev')?.addEventListener('click', () => scrollBySlide(-1));
  gallery.querySelector('.gallery-next')?.addEventListener('click', () => scrollBySlide(1));
};

document.querySelectorAll('.project-gallery').forEach(initGallery);

const projectsTrack = document.getElementById('projectsTrack');
const projectsDots = document.getElementById('projectsDots');

if (projectsTrack && projectsDots) {
  const projects = Array.from(projectsTrack.querySelectorAll('.projects-slide'));

  /* O projeto atual fica em estado próprio, e não deduzido do scrollLeft: se a
     rolagem suave ainda está a caminho, o scrollLeft antigo faria o autoplay
     mirar sempre o mesmo slide e travar no primeiro projeto. */
  let activeProject = 0;

  const goToProject = index => {
    activeProject = index;
    projectsTrack.scrollTo({ left: index * projectsTrack.clientWidth, behavior: 'smooth' });
  };

  projects.forEach((project, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'projects-dot';
    dot.setAttribute('aria-label', `Ver projeto ${project.dataset.project || index + 1}`);
    dot.addEventListener('click', () => {
      goToProject(index);
      restartAutoplay();
    });
    projectsDots.appendChild(dot);
  });

  const dots = Array.from(projectsDots.querySelectorAll('.projects-dot'));
  dots[0]?.classList.add('is-active');

  const projectObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = projects.indexOf(entry.target);
          // mantém o estado alinhado quando a pessoa arrasta o carrossel na mão
          activeProject = index;
          dots.forEach(dot => dot.classList.remove('is-active'));
          dots[index]?.classList.add('is-active');
        }
      });
    },
    { root: projectsTrack, threshold: 0.6 }
  );

  projects.forEach(project => projectObserver.observe(project));

  const stepProject = direction => {
    goToProject((activeProject + direction + projects.length) % projects.length);
  };

  /* AUTOPLAY: passa de projeto em projeto sozinho, pausando quando a pessoa interage */

  const AUTOPLAY_MS = 3000;
  const carousel = projectsTrack.closest('.projects-carousel');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let autoplayId = null;

  const startAutoplay = () => {
    if (reduceMotion || autoplayId || projects.length < 2) return;

    autoplayId = setInterval(() => stepProject(1), AUTOPLAY_MS);
  };

  const stopAutoplay = () => {
    clearInterval(autoplayId);
    autoplayId = null;
  };

  // depois de navegar na mão, reinicia a contagem em vez de pular logo em seguida
  const restartAutoplay = () => {
    stopAutoplay();
    startAutoplay();
  };

  document.querySelector('.projects-prev')?.addEventListener('click', () => {
    stepProject(-1);
    restartAutoplay();
  });

  document.querySelector('.projects-next')?.addEventListener('click', () => {
    stepProject(1);
    restartAutoplay();
  });

  carousel?.addEventListener('mouseenter', stopAutoplay);
  carousel?.addEventListener('mouseleave', startAutoplay);
  carousel?.addEventListener('focusin', stopAutoplay);
  carousel?.addEventListener('focusout', startAutoplay);
  carousel?.addEventListener('touchstart', stopAutoplay, { passive: true });
  carousel?.addEventListener('touchend', restartAutoplay, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  startAutoplay();
}

document.addEventListener('click', event => {
  if (!nav || !menuBtn) return;

  const clickedInsideMenu = nav.contains(event.target);
  const clickedMenuButton = menuBtn.contains(event.target);

  if (!clickedInsideMenu && !clickedMenuButton) {
    nav.classList.remove('active');
    menuBtn.setAttribute('aria-expanded', 'false');
  }
});

// Filtros do catálogo (bairro e zona, ambos com multisseleção): lê o bairro do selo de cada
// card (texto antes do "·"), então projetos novos entram no filtro de bairro sem alterar este
// código. A zona sai do de/para abaixo; um bairro novo precisa ser incluído nele para
// aparecer no filtro de zona. Os dois filtros se combinam: o card precisa passar nos dois.
const ZONA_POR_BAIRRO = {
  'Alto da Boa Vista': 'Sul',
  'Cambuci': 'Centro',
  'Freguesia do Ó': 'Norte',
  'Giovanni Gronchi': 'Sul',
  'Granja Julieta': 'Sul',
  'Guaianases': 'Leste',
  'Interlagos': 'Sul',
  'Ipiranga': 'Sul',
  'Itaquera': 'Leste',
  'Jaçanã': 'Norte',
  'Lapa': 'Oeste',
  'Osasco': 'Oeste',
  'Sacomã': 'Sul',
  'Santa Cecília': 'Centro',
  'Santo Amaro': 'Sul',
  'Vila Carrão': 'Leste'
};

const ZONAS = ['Norte', 'Sul', 'Leste', 'Oeste', 'Centro'];

const catalogFilter = document.getElementById('catalogFilter');
const catalogCards = document.querySelectorAll('.catalog-card');

if (catalogFilter && catalogCards.length) {
  const bairroCounts = new Map();
  const zonaCounts = new Map();

  catalogCards.forEach(card => {
    const badge = card.querySelector('.catalog-badge');
    const bairro = badge ? badge.textContent.split('·')[0].trim() : '';
    const zona = ZONA_POR_BAIRRO[bairro] || '';
    card.dataset.bairro = bairro;
    card.dataset.zona = zona;
    if (bairro) bairroCounts.set(bairro, (bairroCounts.get(bairro) || 0) + 1);
    if (zona) zonaCounts.set(zona, (zonaCounts.get(zona) || 0) + 1);
  });

  const filters = [
    {
      id: 'bairro',
      key: 'bairro',
      title: 'Filtrar por bairro',
      short: 'Bairros',
      options: [...bairroCounts].sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'))
    },
    {
      id: 'zona',
      key: 'zona',
      title: 'Filtrar por zona',
      short: 'Zonas',
      options: ZONAS.filter(z => zonaCounts.has(z)).map(z => [z, zonaCounts.get(z)])
    }
  ];

  const chevron = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>';

  catalogFilter.innerHTML =
    '<div class="filter-bar">' +
      filters.map(f =>
        '<button type="button" class="filter-toggle" id="' + f.id + 'Toggle" aria-expanded="false" aria-controls="' + f.id + 'Panel">' +
          '<span id="' + f.id + 'Label">' + f.title + '</span>' + chevron +
        '</button>'
      ).join('') +
      '<span class="filter-status" id="filterStatus" aria-live="polite"></span>' +
    '</div>' +
    filters.map(f =>
      '<div class="filter-panel" id="' + f.id + 'Panel" hidden>' +
        '<div class="filter-options">' +
          f.options.map(([value, n]) =>
            '<label class="filter-option"><input type="checkbox" value="' + value + '"><span>' + value + ' <small>(' + n + ')</small></span></label>'
          ).join('') +
        '</div>' +
        '<div class="filter-actions">' +
          '<button type="button" class="filter-clear" id="' + f.id + 'Clear">Limpar</button>' +
          '<button type="button" class="filter-confirm" id="' + f.id + 'Confirm">Ver projetos</button>' +
        '</div>' +
      '</div>'
    ).join('');

  const status = document.getElementById('filterStatus');

  filters.forEach(f => {
    f.toggle = document.getElementById(f.id + 'Toggle');
    f.label = document.getElementById(f.id + 'Label');
    f.panel = document.getElementById(f.id + 'Panel');
    f.clear = document.getElementById(f.id + 'Clear');
    f.confirm = document.getElementById(f.id + 'Confirm');
    f.boxes = f.panel.querySelectorAll('input');
  });

  const selectedOf = f => [...f.boxes].filter(box => box.checked).map(box => box.value);

  const apply = () => {
    const selections = filters.map(f => ({ f, selected: selectedOf(f) }));
    let shown = 0;

    catalogCards.forEach(card => {
      card.hidden = selections.some(({ f, selected }) =>
        selected.length > 0 && !selected.includes(card.dataset[f.key])
      );
      if (!card.hidden) shown++;
    });

    const active = selections.some(({ selected }) => selected.length > 0);

    selections.forEach(({ f, selected }) => {
      f.label.textContent = selected.length ? f.short + ' (' + selected.length + ')' : f.title;
      f.toggle.classList.toggle('has-selection', selected.length > 0);
      f.confirm.textContent = active ? 'Ver ' + shown + (shown === 1 ? ' projeto' : ' projetos') : 'Ver projetos';
    });

    status.textContent = active ? shown + ' de ' + catalogCards.length + ' projetos' : '';
  };

  const setOpen = (target, open) => {
    filters.forEach(f => {
      const isOpen = f === target && open;
      f.panel.hidden = !isOpen;
      f.toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  };

  filters.forEach(f => {
    f.toggle.addEventListener('click', () => setOpen(f, f.panel.hidden));
    f.panel.addEventListener('change', apply);
    f.clear.addEventListener('click', () => {
      f.boxes.forEach(box => { box.checked = false; });
      apply();
    });
    f.confirm.addEventListener('click', () => {
      setOpen(f, false);
      catalogFilter.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  document.addEventListener('click', event => {
    if (!catalogFilter.contains(event.target)) setOpen(null, false);
  });
}
