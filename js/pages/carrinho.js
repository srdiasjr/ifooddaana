(function () {
  const S = window.Sabor;

  function view() {
    const bill = S.totals();
    if (!bill.restaurant || !S.state.cart.items.length) {
      return `<div class="empty card"><strong>Sua sacola está vazia</strong><p class="muted">Escolha uma loja e monte o pedido.</p><a class="btn" style="margin-top:14px" href="${S.url.home}">Ver lojas</a></div>`;
    }
    return `
      <section class="greet"><h1>Sacola</h1><p>${S.esc(bill.restaurant.name)}</p></section>
      <div class="lines">
        ${S.state.cart.items.map((line) => `
          <article class="line">
            <div class="stepper">
              <button type="button" data-action="qty-line" data-uid="${line.uid}" data-dir="-1" aria-label="Diminuir">−</button>
              <strong>${line.qty}</strong>
              <button type="button" data-action="qty-line" data-uid="${line.uid}" data-dir="1" aria-label="Aumentar">+</button>
            </div>
            <div>
              <h3>${S.esc(line.name)}</h3>
              ${(line.options || []).length ? `<p class="small muted">${S.esc(line.options.map((option) => option.name).join(" · "))}</p>` : ""}
              ${line.note ? `<p class="small">Obs.: ${S.esc(line.note)}</p>` : ""}
              <button class="linkish" type="button" data-action="remove-line" data-uid="${line.uid}">Remover</button>
            </div>
            <strong>${S.money(line.price * line.qty)}</strong>
          </article>`).join("")}
      </div>
      <form class="coupon-box" id="coupon-form">
        <input id="coupon-draft" value="${S.esc(S.state.cart.couponDraft || "")}" placeholder="Código do cupom" aria-label="Código do cupom">
        <button class="btn btn--ghost" type="submit">Aplicar</button>
      </form>
      ${S.state.cart.couponCode ? `<p class="small">Cupom <strong>${S.esc(S.state.cart.couponCode)}</strong> <button class="linkish" type="button" data-action="remove-coupon">remover</button></p>` : ""}
      <label class="field note">Observação para a loja
        <textarea id="order-note" maxlength="180" placeholder="Ex.: interfone 12, sem talher">${S.esc(S.state.cart.instructions || "")}</textarea>
      </label>
      ${S.summaryHTML()}
      <div class="row-btns">
        <button class="btn btn--ghost" type="button" data-action="clear-cart">Esvaziar</button>
        <a class="btn" href="${S.url.checkout}">Continuar</a>
      </div>`;
  }

  document.addEventListener("input", (event) => {
    if (event.target.id === "coupon-draft") S.state.cart.couponDraft = event.target.value;
    if (event.target.id === "order-note") {
      S.state.cart.instructions = event.target.value;
      S.persist();
    }
  });

  document.addEventListener("submit", (event) => {
    if (event.target.id !== "coupon-form") return;
    event.preventDefault();
    const input = document.getElementById("coupon-draft");
    S.applyCoupon(input ? input.value : S.state.cart.couponDraft);
    S.paint();
  });

  S.start({
    page: "carrinho",
    render: view,
    actions: {
      "qty-line"(el) {
        const line = S.state.cart.items.find((item) => item.uid === el.dataset.uid);
        if (!line) return;
        line.qty = Math.min(20, line.qty + Number(el.dataset.dir));
        if (line.qty < 1) S.state.cart.items = S.state.cart.items.filter((item) => item.uid !== line.uid);
        if (!S.state.cart.items.length) S.state.cart.restaurantId = null;
        S.persist();
        S.paint();
      },
      "remove-line"(el) {
        S.state.cart.items = S.state.cart.items.filter((item) => item.uid !== el.dataset.uid);
        if (!S.state.cart.items.length) S.state.cart.restaurantId = null;
        S.persist();
        S.paint();
      },
      "clear-cart"() {
        S.state.modal = { type: "clear-cart", title: "Esvaziar sacola?", text: "Os itens e o cupom desta sacola serão removidos.", ok: "Esvaziar" };
        S.showModal();
      },
      "remove-coupon"() {
        S.state.cart.couponCode = "";
        S.state.cart.couponDraft = "";
        S.persist();
        S.paint();
      },
    },
  });
})();
