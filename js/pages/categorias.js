(function () {
  const S = window.Sabor;
  const colors = ["#8c3a2b", "#a33b32", "#1e3a40", "#c47a2c", "#6e4a3a", "#4a2c6a", "#b4532a", "#2f6b45", "#c48a4a", "#b84a2f", "#a85a78"];
  S.start({
    page: "categorias",
    render() {
      return `
        <section class="greet"><h1>Categorias</h1><p>Escolha um tipo de cozinha.</p></section>
        <div class="cat-grid">
          ${S.DB.categories.map((category, index) => {
            const count = S.DB.restaurants.filter((item) => item.category === category.id).length;
            return `<a class="cat-tile" style="background:${colors[index % colors.length]}" href="${S.url.categoria(category.id)}"><span>${category.emoji}</span><span>${S.esc(category.name)}<small style="display:block;font-family:Nunito,sans-serif;font-size:.8rem;opacity:.85">${count} ${count === 1 ? "loja" : "lojas"}</small></span></a>`;
          }).join("")}
        </div>`;
    },
  });
})();
