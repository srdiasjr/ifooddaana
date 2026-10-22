(function () {
  const S = window.Sabor;
  const id = S.q("id");
  let timer = 0;

  function view() {
    const order = S.state.orders.find((item) => item.id === id);
    if (!order) return S.missing("Pedido não encontrado.");
    const step = S.statusIndex(order);
    const courier = S.courierFor(order);
    const restaurant = S.getRestaurant(order.restaurantId);
    return `
      <section class="greet"><h1>${S.esc(order.restaurantName)}</h1><p>Pedido ${S.esc(order.id)} · ${S.esc(S.whenLabel(order.createdAt))}</p></section>
      <div class="track">
        <div class="track__steps">
          ${S.STEPS.map((item, index) => `<div class="step ${index < step ? "is-done" : ""} ${index === step ? "is-now" : ""}"><i></i><div><strong>${item.title}</strong><span>${index === step ? item.text : ""}</span></div></div>`).join("")}
        </div>
        <p class="eta">${S.esc(S.eta(order))}</p>
        ${step < 3 ? `<div class="courier"><strong>${S.esc(courier.name)}</strong><span class="small muted">${S.esc(courier.vehicle)} · entrega simulada</span></div>` : ""}
        <div class="card block">
          <h2>Entrega</h2>
          <p>${S.esc(order.addressText)}</p>
          <p class="small muted">Pagamento: ${S.esc(order.paymentLabel)}${order.change ? ` · troco para ${S.money(order.change)}` : ""}</p>
          ${order.instructions ? `<p class="small">Obs.: ${S.esc(order.instructions)}</p>` : ""}
        </div>
        <div class="card block">
          <h2>Itens</h2>
          ${order.items.map((line) => `<div class="mini-line"><span>${line.qty}× ${S.esc(line.name)}</span><span>${S.money(line.price * line.qty)}</span></div>`).join("")}
          <div class="total"><span>Total</span><span>${S.money(order.total)}</span></div>
        </div>
        ${step >= 3 ? `
          <div class="card block">
            <h2>Como foi?</h2>
            ${order.rated ? `<p>Você deu ${order.rated} estrela${order.rated > 1 ? "s" : ""}.</p>${S.stars(order.rated)}` : `
              <div class="rate-row">
                ${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-action="rate" data-n="${n}" aria-label="${n} estrelas">★</button>`).join("")}
              </div>`}
          </div>` : ""}
        <div class="row-btns">
          ${restaurant ? `<a class="btn btn--ghost" href="${S.url.restaurante(restaurant.id)}">Ver loja</a>` : ""}
          <button class="btn" type="button" data-action="reorder" data-id="${order.id}">Pedir de novo</button>
        </div>
      </div>`;
  }

  function reorder(order) {
    const restaurant = S.getRestaurant(order.restaurantId);
    if (!restaurant) return S.toast("Essa loja saiu da demonstração.");
    if (!restaurant.open) return S.toast("A loja está fechada agora.");
    S.state.cart = {
      restaurantId: order.restaurantId,
      items: order.items.map((item) => ({ ...item, uid: S.uid(), options: (item.options || []).slice() })),
      couponCode: "",
      couponDraft: "",
      instructions: order.instructions || "",
      change: "",
    };
    S.persist();
    S.toast("Itens colocados na sacola");
    S.go(S.url.carrinho);
  }

  S.start({
    page: "acompanhar",
    header: () => `Pedido ${id || ""}`.trim(),
    render: view,
    actions: {
      rate(el) {
        const order = S.state.orders.find((item) => item.id === id);
        if (!order) return;
        order.rated = Number(el.dataset.n);
        S.persist();
        S.toast("Obrigado pela avaliação");
        S.paint();
      },
      reorder(el) {
        const order = S.state.orders.find((item) => item.id === el.dataset.id);
        if (order) reorder(order);
      },
    },
  });

  const current = S.state.orders.find((item) => item.id === id);
  let shown = current ? S.statusIndex(current) : 3;
  timer = setInterval(() => {
    const order = S.state.orders.find((item) => item.id === id);
    if (!order) return;
    const step = S.statusIndex(order);
    if (step === shown) return;
    shown = step;
    S.paint();
    if (step >= 3) clearInterval(timer);
  }, 1000);
})();
