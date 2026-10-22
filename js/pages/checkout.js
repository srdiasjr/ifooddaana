(function () {
  const S = window.Sabor;

  function view() {
    if (!S.state.logged) return S.needLogin("O checkout desta demonstração fica na sua conta.");
    const bill = S.totals();
    if (!bill.restaurant || !bill.subtotal) {
      return `<div class="empty card"><strong>Nada para pagar</strong><p class="muted">Volte e escolha um prato.</p><a class="btn" style="margin-top:14px" href="${S.url.home}">Ver lojas</a></div>`;
    }
    const address = S.selectedAddress();
    const payment = S.selectedPayment();
    if (bill.subtotal < bill.restaurant.min) {
      return `<div class="empty card"><strong>Pedido mínimo de ${S.money(bill.restaurant.min)}</strong><p class="muted">Faltam ${S.money(bill.restaurant.min - bill.subtotal)} em ${S.esc(bill.restaurant.name)}.</p><a class="btn" style="margin-top:14px" href="${S.url.restaurante(bill.restaurant.id)}">Completar pedido</a></div>`;
    }
    return `
      <section class="greet"><h1>Checkout</h1><p>Revise antes de simular o pedido.</p></section>
      <section class="card block">
        <div class="spread"><h2>Entrega</h2><a href="${S.url.enderecos}">Trocar</a></div>
        ${address ? `<p><strong>${S.esc(address.label)}</strong></p><p class="muted">${S.esc(S.addressLine(address))}</p><p class="small muted">${S.esc(address.city)}${address.reference ? " · " + S.esc(address.reference) : ""}</p>` : `<p class="muted">Cadastre um endereço.</p>`}
      </section>
      <section class="card block">
        <div class="spread"><h2>Pagamento</h2><a href="${S.url.pagamentos}">Trocar</a></div>
        <p><strong>${S.esc(payment.label)}</strong></p>
        <p class="muted">${S.esc(payment.detail)}</p>
        ${payment.type === "cash" ? `<label class="field">Troco para<input id="cash-change" inputmode="decimal" placeholder="Ex.: 50,00" value="${S.esc(S.state.cart.change || "")}"></label>` : ""}
      </section>
      <section class="card block">
        <h2>Resumo · ${S.esc(bill.restaurant.name)}</h2>
        ${S.state.cart.items.map((line) => `<div class="mini-line"><span>${line.qty}× ${S.esc(line.name)}</span><span>${S.money(line.price * line.qty)}</span></div>`).join("")}
        ${S.summaryHTML()}
        <p class="tiny">Ao confirmar, o pedido é só uma simulação neste navegador. Nenhum valor é cobrado.</p>
      </section>
      <button class="btn btn--block" type="button" data-action="place" ${address ? "" : "disabled"}>Fazer pedido · ${S.money(bill.total)}</button>`;
  }

  document.addEventListener("input", (event) => {
    if (event.target.id === "cash-change") S.state.cart.change = event.target.value;
  });

  S.start({
    page: "checkout",
    render: view,
    actions: {
      place() {
        const bill = S.totals();
        const address = S.selectedAddress();
        const payment = S.selectedPayment();
        if (!bill.restaurant || !address || !payment) return;
        if (bill.subtotal < bill.restaurant.min) return S.toast("Pedido abaixo do mínimo.");
        if (bill.coupon && bill.subtotal < bill.coupon.min) return S.toast("Cupom abaixo do pedido mínimo.");
        let change = 0;
        if (payment.type === "cash" && S.state.cart.change) {
          change = Number(String(S.state.cart.change).replace(/\./g, "").replace(",", "."));
          if (!change || change < bill.total) return S.toast("Informe um valor de troco maior que o total.");
        }
        const order = {
          id: `SJ${Math.floor(10000 + Math.random() * 90000)}`,
          restaurantId: bill.restaurant.id,
          restaurantName: bill.restaurant.name,
          items: S.state.cart.items.map((item) => ({ ...item, options: (item.options || []).slice() })),
          addressText: S.addressLine(address),
          paymentLabel: payment.detail && payment.type === "credit" ? payment.detail : payment.label,
          subtotal: bill.subtotal,
          delivery: bill.delivery,
          discount: bill.discount,
          total: bill.total,
          couponCode: bill.coupon && bill.discount ? bill.coupon.code : "",
          change: change || 0,
          instructions: S.state.cart.instructions || "",
          createdAt: Date.now(),
          rated: 0,
        };
        S.state.orders.unshift(order);
        S.state.cart = { restaurantId: null, items: [], couponCode: "", couponDraft: "", instructions: "", change: "" };
        S.persist();
        S.go(S.url.acompanhar(order.id));
      },
    },
  });
})();
