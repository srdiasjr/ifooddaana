(function () {
  const S = window.Sabor;
  S.start({
    page: "ajuda",
    render() {
      return `
        <section class="greet"><h1>Ajuda</h1><p>Dúvidas sobre esta demonstração.</p></section>
        <section class="card">
          ${S.DB.faqs.map((faq) => `
            <article class="faq-item">
              <button type="button" data-action="faq" data-id="${faq.id}" aria-expanded="${S.state.faqOpen === faq.id}">
                ${S.esc(faq.q)} <span>${S.state.faqOpen === faq.id ? "−" : "+"}</span>
              </button>
              ${S.state.faqOpen === faq.id ? `<p>${S.esc(faq.a)}</p>` : ""}
            </article>`).join("")}
        </section>
        <section class="card" style="margin-top:12px">
          <h3>Falar com o suporte</h3>
          <p class="muted">Canal ilustrativo. A mensagem não é enviada.</p>
          <button class="btn" style="margin-top:10px" type="button" data-action="demo-lock" data-msg="Demonstração: nenhuma mensagem foi enviada.">Abrir conversa</button>
        </section>`;
    },
    actions: {
      faq(el) {
        S.state.faqOpen = S.state.faqOpen === el.dataset.id ? "" : el.dataset.id;
        S.paint();
      },
    },
  });
})();
