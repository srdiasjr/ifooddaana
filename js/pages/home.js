(function () {
  const S = window.Sabor;

  function guests() {
    const found = [];
    S.DB.restaurants.forEach((restaurant) => {
      restaurant.menu.forEach((section) => {
        section.items.forEach((item) => {
          if (item.guest) found.push({ restaurant, item });
        });
      });
    });
    return found;
  }

  function popular() {
    const found = [];
    S.DB.restaurants.forEach((restaurant) => {
      restaurant.menu.forEach((section) => {
        section.items.forEach((item) => {
          if (item.popular && !item.guest) found.push({ restaurant, item });
        });
      });
    });
    return found.slice(0, 4);
  }

  function row(restaurant) {
    const fav = S.state.favorites.includes(restaurant.id);
    return `
      <article class="ledger">
        <a class="ledger__photo" href="${S.url.restaurante(restaurant.id)}" style="background:${restaurant.color}" aria-label="${S.esc(restaurant.name)}">
          ${S.imgTag(restaurant.image, restaurant.name)}
        </a>
        <a class="ledger__main" href="${S.url.restaurante(restaurant.id)}">
          <strong>${S.esc(restaurant.name)}</strong>
          <span>${S.esc(restaurant.cuisine)} · ${S.esc(restaurant.distance)}</span>
          ${restaurant.promo ? `<em>${S.esc(restaurant.promo)}</em>` : ""}
          ${restaurant.open ? "" : `<em>${S.esc(restaurant.closedMessage || "Fechado")}</em>`}
        </a>
        <span class="ledger__time">${S.esc(restaurant.time)}</span>
        <span class="ledger__fee">${restaurant.fee === 0 ? "Grátis" : S.money(restaurant.fee)}</span>
        <span class="ledger__rate rate"><span>★</span> ${S.rateNum(restaurant.rating)}</span>
        <button class="ledger__fav" type="button" data-action="fav" data-id="${restaurant.id}" aria-pressed="${fav}" aria-label="${fav ? "Remover dos favoritos" : "Salvar loja"}">${S.heart(fav)}</button>
      </article>`;
  }

  function view() {
    const list = S.sortRestaurants(S.filterRestaurants({ useFilters: true }), "relevancia");
    const feature = list.find((restaurant) => restaurant.featured && restaurant.open) || list[0];
    const rows = feature ? list.filter((restaurant) => restaurant.id !== feature.id) : list;
    const table = popular();
    return `
      <section class="mesa">
        ${feature ? `
          <a class="mesa__cover" href="${S.url.restaurante(feature.id)}" style="background:${feature.color}">
            ${S.imgTag(feature.image, feature.name, "", true)}
            <span>
              <small>A mesa de hoje</small>
              <strong>${S.esc(feature.name)}</strong>
              <em>${S.esc(feature.cuisine)} · ${S.esc(feature.time)} · ${feature.fee === 0 ? "entrega grátis" : "entrega " + S.money(feature.fee)}</em>
            </span>
          </a>` : `<div class="empty card"><strong>Nenhuma loja com esse filtro</strong><p class="muted">Tire um filtro para ver o bairro de novo.</p></div>`}
        <aside class="mesa__side">
          <p class="mesa__hello"><span>${S.esc(S.greet())}</span> O que vai para a mesa?</p>
          <a class="searchbar" href="${S.url.busca}">${S.icon("search")}<span>Busque por prato ou loja</span></a>
          <div class="mesa__dishes">
            ${table.map(({ restaurant, item }) => `
              <a class="mesa__dish" href="${S.url.prato(restaurant.id, item.id)}">
                ${S.imgTag(item.image || restaurant.image, item.name)}
                <span><small>${S.esc(restaurant.name)}</small><strong>${S.esc(item.name)}</strong></span>
                <b>${S.money(item.price)}</b>
              </a>`).join("")}
          </div>
        </aside>
      </section>
      <nav class="index-row" aria-label="Categorias">
        ${S.DB.categories.map((category) => `<a href="${S.url.categoria(category.id)}">${category.emoji} ${S.esc(category.name)}</a>`).join("")}
        <a href="${S.url.categorias}">Todas</a>
      </nav>
      ${S.chipsHTML()}
      <div class="section-head"><h2>O bairro, em linha</h2><span class="muted small">${list.length} lojas</span></div>
      ${rows.length ? `<div class="ledger-list">${rows.map(row).join("")}</div>` : ""}
      <div class="section-head"><h2>Visitas de hoje</h2><span class="muted small">pratos extras, de mentira</span></div>
      <div class="guest-row">
        ${guests().map(({ restaurant, item }) => `
          <a class="guest" href="${S.url.prato(restaurant.id, item.id)}">
            <small>${S.esc(item.guest)} passou na cozinha</small>
            <strong>${S.esc(item.name)}</strong>
            <span>${S.esc(restaurant.name)} · ${S.money(item.price)}</span>
          </a>`).join("")}
      </div>
      <div class="section-head"><h2>Cupons pra testar</h2><a href="${S.url.cupons}">Ver cupons</a></div>
      <div class="ticket-row">
        ${S.DB.coupons.map((coupon) => `
          <article class="ticket">
            <div><strong>${S.esc(coupon.title)}</strong><p class="small muted">${S.esc(coupon.description)}</p><code>${S.esc(coupon.code)}</code></div>
            <button type="button" data-action="use-coupon" data-code="${coupon.code}">Usar</button>
          </article>`).join("")}
      </div>
      <p class="footer-note">SaborJá é um projeto de interface para estudo. Não é um delivery real: nada é cobrado, preparado ou entregue. As visitas no cardápio são invenção e não têm endosso.</p>`;
  }

  S.start({
    page: "inicio",
    render: view,
    actions: {
      filter(el) {
        S.state[el.dataset.key] = !S.state[el.dataset.key];
        S.persist();
        S.paint();
      },
      "use-coupon"(el) {
        S.applyCoupon(el.dataset.code);
        S.paint();
      },
    },
  });
})();
