/* CONVERSÕES DO GOOGLE ADS: depende da tag base gtag.js instalada no <head> de cada página */

const trackConversion = sendTo => {
  if (typeof gtag !== 'function') return;

  gtag('event', 'conversion', {
    'send_to': sendTo,
    'value': 1.0,
    'currency': 'BRL'
  });
};

// Contato: qualquer link de WhatsApp da página, inclusive os que forem adicionados depois.
// Não segura a navegação: o link abre normalmente em nova aba/app.
document.addEventListener('click', event => {
  if (!event.target.closest('a[href*="wa.me"]')) return;

  trackConversion('AW-18515404905/Po7zCMz1k54dEOnQ6vxE');
});

// Enviar formulário de lead: o formulário não é enviado a um serviço; o main.js
// intercepta o submit e abre o WhatsApp com a simulação. O evento "submit" só chega
// aqui depois que a validação nativa (campos required) passou, e o main.js não tem
// nenhum caminho de falha depois disso, então é o momento em que o envio se conclui.
// Esse window.open não passa por um <a>, então não conta também como clique no WhatsApp.
document.getElementById('leadForm')?.addEventListener('submit', () => {
  trackConversion('AW-18515404905/506JCPPZmZ4dEOnQ6vxE');
});
