(function () {
  const S = window.Sabor;
  const rows = [
    ["orders", "Status do pedido", "Aviso quando a etapa muda nesta demonstração."],
    ["promos", "Promoções", "Cupons e frete grátis das lojas."],
    ["email", "E-mail", "Resumo que não sai deste navegador."],
  ];

  document.addEventListener("change", (event) => {
    const key = event.target.dataset.notify;
    if (!key) return;
    S.state.notifications[key] = event.target.checked;
    S.persist();
    S.toast(event.target.checked ? "Aviso ligado" : "Aviso desligado");
  });

  S.start({
    page: "notificacoes",
    render() {
      if (!S.state.logged) return S.needLogin("As preferências ficam na conta local.");
      return `
        <section class="greet"><h1>Notificações</h1><p>Os interruptores ficam salvos aqui. Nenhum alerta real é enviado.</p></section>
        <section class="card">
          ${rows.map(([key, title, text]) => `
            <label class="switch">
              <span><strong>${title}</strong><small class="muted" style="display:block">${text}</small></span>
              <input type="checkbox" data-notify="${key}" ${S.state.notifications[key] ? "checked" : ""}>
            </label>`).join("")}
        </section>`;
    },
  });
})();
