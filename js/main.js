const menuBtn = document.getElementById('menuBtn');
const nav = document.getElementById('nav');

menuBtn.addEventListener('click', () => {
  nav.classList.toggle('active');
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

form.addEventListener('submit', event => {
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

const projectVideos = document.querySelectorAll('.project-video video');

const videoObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.play().catch(() => {});
      } else {
        entry.target.pause();
      }
    });
  },
  { threshold: 0.5 }
);

projectVideos.forEach(video => videoObserver.observe(video));

document.querySelectorAll('.sound-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const video = btn.closest('.project-video').querySelector('video');
    video.muted = !video.muted;

    btn.classList.toggle('is-unmuted', !video.muted);
    btn.setAttribute('aria-label', video.muted ? 'Ativar som do vídeo' : 'Silenciar vídeo');
  });
});

const projectsTrack = document.getElementById('projectsTrack');

if (projectsTrack) {
  let isDragging = false;
  let isDrag = false;
  let startX = 0;
  let startScrollLeft = 0;

  const startDrag = clientX => {
    isDragging = true;
    isDrag = false;
    startX = clientX;
    startScrollLeft = projectsTrack.scrollLeft;
    projectsTrack.classList.add('is-dragging');
  };

  const moveDrag = clientX => {
    if (!isDragging) return;

    const delta = clientX - startX;

    if (Math.abs(delta) > 5) {
      isDrag = true;
    }

    projectsTrack.scrollLeft = startScrollLeft - delta;
  };

  const endDrag = () => {
    isDragging = false;
    projectsTrack.classList.remove('is-dragging');
  };

  projectsTrack.addEventListener('mousedown', event => {
    startDrag(event.clientX);
  });

  window.addEventListener('mousemove', event => {
    moveDrag(event.clientX);
  });

  window.addEventListener('mouseup', endDrag);

  projectsTrack.addEventListener('touchstart', event => {
    startDrag(event.touches[0].clientX);
  }, { passive: true });

  projectsTrack.addEventListener('touchmove', event => {
    moveDrag(event.touches[0].clientX);
  }, { passive: true });

  projectsTrack.addEventListener('touchend', endDrag);

  projectsTrack.addEventListener('click', event => {
    if (isDrag) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  const scrollByCard = direction => {
    const card = projectsTrack.querySelector('.project-card');
    if (!card) return;

    const gap = parseFloat(getComputedStyle(projectsTrack).columnGap) || 0;
    const distance = card.getBoundingClientRect().width + gap;

    projectsTrack.scrollBy({ left: distance * direction, behavior: 'smooth' });
  };

  document.querySelector('.carousel-prev')?.addEventListener('click', () => scrollByCard(-1));
  document.querySelector('.carousel-next')?.addEventListener('click', () => scrollByCard(1));
}

document.addEventListener('click', event => {
  const clickedInsideMenu = nav.contains(event.target);
  const clickedMenuButton = menuBtn.contains(event.target);

  if (!clickedInsideMenu && !clickedMenuButton) {
    nav.classList.remove('active');
    menuBtn.setAttribute('aria-expanded', 'false');
  }
});
