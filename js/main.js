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

const galleryTrack = document.getElementById('galleryTrack');
const galleryDots = document.getElementById('galleryDots');

if (galleryTrack && galleryDots) {
  const slides = Array.from(galleryTrack.querySelectorAll('.gallery-slide'));

  slides.forEach((slide, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'gallery-dot';
    dot.setAttribute('aria-label', `Ir para foto ${index + 1}`);
    dot.addEventListener('click', () => {
      slide.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
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

  document.querySelector('.gallery-prev')?.addEventListener('click', () => scrollBySlide(-1));
  document.querySelector('.gallery-next')?.addEventListener('click', () => scrollBySlide(1));
}

document.addEventListener('click', event => {
  const clickedInsideMenu = nav.contains(event.target);
  const clickedMenuButton = menuBtn.contains(event.target);

  if (!clickedInsideMenu && !clickedMenuButton) {
    nav.classList.remove('active');
    menuBtn.setAttribute('aria-expanded', 'false');
  }
});
