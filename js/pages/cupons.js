(function () {
  const S = window.Sabor;
  S.start({
    page: "cupons",
    render() {
      return `
        <section class="greet"><h1>Cupons</h1><p>Códigos desta demonstração. Nada é cobrado de verdade.</p></section>
        <div class="stack">
          ${S.DB.coupons.map((coupon) => `
            <article class="ticket ticket--wide">
              <div>
                <strong>${S.esc(coupon.title)}</strong>
                <p>${S.esc(coupon.description)}</p>
                <p class="small muted">Válido em pedidos a partir de ${S.money(coupon.min)}. Código <code>${S.esc(coupon.code)}</code></p>
              </div>
              <button class="btn" type="button" data-action="use-coupon" data-code="${coupon.code}">Usar</button>
            </article>`).join("")}
        </div>`;
    },
    actions: {
      "use-coupon"(el) {
        S.applyCoupon(el.dataset.code);
        S.paint();
      },
    },
  });
})();
