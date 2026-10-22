(function () {
  const S = window.Sabor;

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
    page: "pedidos",
    render() {
      if (!S.state.logged) return S.needLogin("Seus pedidos ficam salvos neste navegador depois do login.");
      if (!S.state.orders.length) {
        return `<div class="empty card"><strong>Nenhum pedido ainda</strong><p class="muted">Quando você simular um pedido, ele aparece aqui.</p><a class="btn" style="margin-top:14px" href="${S.url.home}">Pedir agora</a></div>`;
      }
      return `
        <section class="greet"><h1>Pedidos</h1><p>Histórico desta demonstração.</p></section>
        <div class="stack">
          ${S.state.orders.map((order) => {
            const step = S.statusIndex(order);
            return `
              <article class="order-card">
                <div class="spread"><h2>${S.esc(order.restaurantName)}</h2><span class="status status--${step}">${S.statusLabel(step)}</span></div>
                <p class="small muted">${S.esc(order.id)} · ${S.esc(S.whenLabel(order.createdAt))} · ${S.money(order.total)}</p>
                <p class="small">${S.esc(order.items.map((item) => `${item.qty}× ${item.name}`).join(", "))}</p>
                <div class="row-btns">
                  <a class="btn btn--ghost" href="${S.url.acompanhar(order.id)}">Acompanhar</a>
                  <button class="btn" type="button" data-action="reorder" data-id="${order.id}">Pedir de novo</button>
                </div>
              </article>`;
          }).join("")}
        </div>`;
    },
    actions: {
      reorder(el) {
        const order = S.state.orders.find((item) => item.id === el.dataset.id);
        if (order) reorder(order);
      },
    },
  });
})();
