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

document.addEventListener('click', event => {
  const clickedInsideMenu = nav.contains(event.target);
  const clickedMenuButton = menuBtn.contains(event.target);

  if (!clickedInsideMenu && !clickedMenuButton) {
    nav.classList.remove('active');
    menuBtn.setAttribute('aria-expanded', 'false');
  }
});
