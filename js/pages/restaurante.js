(function () {
  const S = window.Sabor;
  const id = S.q("id");

  function view() {
    const restaurant = S.getRestaurant(id);
    if (!restaurant) return S.missing("Essa loja não está no cardápio.");
    const fav = S.state.favorites.includes(restaurant.id);
    const tab = S.state.menuTab || "cardapio";
    let panel = "";
    if (tab === "avaliacoes") {
      panel = restaurant.reviews.map((review) => `
        <article class="review">
          <div class="spread"><strong>${S.esc(review.name)}</strong><span class="small muted">${S.esc(review.date)}</span></div>
          ${S.stars(review.stars)}
          <p>${S.esc(review.text)}</p>
        </article>`).join("");
    } else if (tab === "info") {
      panel = `
        <div class="card" style="box-shadow:none">
          <h3>Sobre</h3>
          <p>${S.esc(restaurant.about)}</p>
          <p class="small" style="margin-top:10px"><strong>Horário.</strong> ${S.esc(restaurant.hours)}</p>
          <p class="small"><strong>Endereço.</strong> ${S.esc(restaurant.address)}</p>
          <p class="small"><strong>Pedido mínimo.</strong> ${S.money(restaurant.min)}</p>
          <p class="small"><strong>Telefone.</strong> ${S.esc(restaurant.phone)}</p>
          <button class="btn btn--ghost" style="margin-top:12px" type="button" data-action="demo-lock" data-msg="Demonstração: a ligação não sai deste navegador.">Ligar para a loja</button>
        </div>`;
    } else {
      panel = `
        <div class="menu-nav">
          ${restaurant.menu.map((section) => `<button type="button" data-action="jump" data-target="sec-${section.id}">${S.esc(section.name)}</button>`).join("")}
        </div>
        ${restaurant.menu.map((section) => `
          <section class="menu-section" id="sec-${section.id}">
            <h2>${S.esc(section.name)}</h2>
            ${section.items.map((item) => {
              const priced = (item.options || []).some((group) => group.choices.some((choice) => choice.price > 0));
              return `
                <a class="dish" href="${S.url.prato(restaurant.id, item.id)}">
                  <div>
                    ${item.guest ? `<span class="tag">Visita · ${S.esc(item.guest)}</span>` : item.popular ? '<span class="tag">Mais pedido</span>' : ""}
                    <h3>${S.esc(item.name)}</h3>
                    <p>${S.esc(item.description)}</p>
                    <strong>${priced ? "a partir de " : ""}${S.money(item.price)}</strong>
                  </div>
                  ${S.imgTag(item.image || restaurant.image, item.name, "thumb")}
                </a>`;
            }).join("")}
          </section>`).join("")}`;
    }
    return `
      <article class="store">
        <div class="store__cover" style="background:${restaurant.color}">${S.imgTag(restaurant.image, restaurant.name, "", true)}</div>
        <div class="store__sheet">
          <div class="spread">
            <h1>${S.esc(restaurant.name)}</h1>
            <button class="fav" style="position:static" type="button" data-action="fav" data-id="${restaurant.id}" aria-pressed="${fav}" aria-label="Favoritar">${S.heart(fav)}</button>
          </div>
          <p class="muted">${S.esc(restaurant.cuisine)} · <span class="rate"><span>★</span> ${S.rateNum(restaurant.rating)}</span> (${restaurant.reviewCount})</p>
          <div class="facts">
            <span class="fact">${S.esc(restaurant.time)}</span>
            <span class="fact">${restaurant.fee === 0 ? "Entrega grátis" : "Entrega " + S.money(restaurant.fee)}</span>
            <span class="fact">Mínimo ${S.money(restaurant.min)}</span>
            <span class="fact">${restaurant.open ? "Aberto" : S.esc(restaurant.closedMessage || "Fechado")}</span>
          </div>
          ${restaurant.open ? "" : `<div class="closed-banner">${S.esc(restaurant.closedMessage || "Loja fechada")}. Dá para ver o cardápio, sem montar pedido.</div>`}
          <div class="tabs" role="tablist">
            ${[["cardapio", "Cardápio"], ["avaliacoes", "Avaliações"], ["info", "Informações"]].map(([idTab, label]) => `<button type="button" role="tab" class="${tab === idTab ? "is-on" : ""}" data-action="tab" data-tab="${idTab}">${label}</button>`).join("")}
          </div>
        </div>
        ${panel}
      </article>`;
  }

  S.start({
    page: "restaurante",
    header: () => {
      const restaurant = S.getRestaurant(id);
      return restaurant ? restaurant.name : "Loja";
    },
    render: view,
    actions: {
      tab(el) {
        S.state.menuTab = el.dataset.tab;
        S.paint();
      },
      jump(el) {
        const target = document.getElementById(el.dataset.target);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      },
    },
  });
})();
