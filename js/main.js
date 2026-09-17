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
