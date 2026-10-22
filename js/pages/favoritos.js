(function () {
  const S = window.Sabor;
  S.start({
    page: "favoritos",
    render() {
      const list = S.DB.restaurants.filter((item) => S.state.favorites.includes(item.id));
      if (!list.length) {
        return `<div class="empty card"><strong>Nenhuma loja salva</strong><p class="muted">Toque no coração de uma loja para guardar aqui.</p><a class="btn" style="margin-top:14px" href="${S.url.home}">Explorar</a></div>`;
      }
      return `
        <section class="greet"><h1>Favoritos</h1><p>${list.length} ${list.length === 1 ? "loja salva" : "lojas salvas"} neste navegador.</p></section>
        <div class="grid">${list.map(S.restaurantCard).join("")}</div>`;
    },
  });
})();
