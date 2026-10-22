(function () {
  const S = window.Sabor;

  document.addEventListener("submit", (event) => {
    if (event.target.id !== "card-form") return;
    event.preventDefault();
    const data = new FormData(event.target);
    const digits = String(data.get("number") || "").replace(/\D/g, "");
    const expiry = String(data.get("expiry") || "").trim();
    const name = String(data.get("name") || "").trim();
    if (digits.length < 13 || !expiry.includes("/") || name.length < 3) {
      S.toast("Confira nome, número e validade.");
      return;
    }
    const brand = digits.startsWith("4") ? "Visa" : digits.startsWith("5") ? "Mastercard" : "Cartão";
    const card = { id: S.uid(), brand, last4: digits.slice(-4), name };
    S.state.cards.push(card);
    S.state.selectedPaymentId = card.id;
    S.persist();
    S.toast("Salvamos só os 4 finais. O CVV foi descartado.");
    S.paint();
  });

  S.start({
    page: "pagamentos",
    render() {
      if (!S.state.logged) return S.needLogin("Os cartões de demonstração ficam na sua conta local.");
      const pay = S.selectedPayment();
      return `
        <section class="greet"><h1>Pagamentos</h1><p>Nada é enviado para um banco. O CVV não é guardado.</p></section>
        ${S.allPayments().map((method) => `
          <article class="select-card ${method.id === pay.id ? "is-on" : ""}">
            <button type="button" data-action="pay" data-id="${method.id}" style="text-align:left">
              <strong>${S.esc(method.label)}</strong>
              <small style="display:block">${S.esc(method.detail)}</small>
            </button>
            ${method.type === "credit" ? `<button type="button" data-action="remove-card" data-id="${method.id}">Excluir</button>` : ""}
          </article>`).join("")}
        <form id="card-form" class="card" style="margin-top:12px">
          <h3>Adicionar cartão</h3>
          <label class="field">Nome impresso<input class="input" name="name" required autocomplete="off"></label>
          <label class="field">Número<input class="input" name="number" inputmode="numeric" required placeholder="Somente para ler os 4 finais" autocomplete="off"></label>
          <label class="field">Validade<input class="input" name="expiry" placeholder="MM/AA" required autocomplete="off"></label>
          <label class="field">CVV<input class="input" name="cvv" inputmode="numeric" required autocomplete="off"></label>
          <button class="btn" type="submit">Salvar final do cartão</button>
        </form>`;
    },
    actions: {
      pay(el) {
        S.state.selectedPaymentId = el.dataset.id;
        S.persist();
        S.paint();
      },
      "remove-card"(el) {
        S.state.cards = S.state.cards.filter((card) => card.id !== el.dataset.id);
        if (S.state.selectedPaymentId === el.dataset.id) S.state.selectedPaymentId = "pix";
        S.persist();
        S.paint();
      },
    },
  });
})();
