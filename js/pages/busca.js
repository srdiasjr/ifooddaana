(function () {
  const S = window.Sabor;
  const categoryId = S.q("cat");

  function searchDishes(query) {
    const q = S.norm(query || "");
    if (q.length < 2) return [];
    const out = [];
    S.DB.restaurants.forEach((restaurant) => {
      if (S.state.onlyOpen && !restaurant.open) return;
      restaurant.menu.forEach((section) => {
        section.items.forEach((item) => {
          if (S.norm(`${item.name} ${item.description}`).includes(q)) out.push(S.dishCard(restaurant, item));
        });
      });
    });
    return out.slice(0, 12);
  }

  function results() {
    const query = S.state.query.trim();
    const list = S.sortRestaurants(S.filterRestaurants({ category: categoryId, query, useFilters: true }), S.state.sort);
    const dishes = categoryId ? [] : searchDishes(query);
    if (!query && !categoryId) {
      return `
        <div class="section-head"><h2>Buscas recentes</h2></div>
        <div class="chips">
          ${S.state.recentSearches.map((item) => `<button class="chip" type="button" data-action="quick-search" data-q="${S.esc(item)}">${S.esc(item)}</button>`).join("")}
          ${["hambúrguer", "sushi", "doce", "salada"].map((item) => `<button class="chip" type="button" data-action="quick-search" data-q="${item}">${item}</button>`).join("")}
        </div>
        <div class="section-head"><h2>Lojas em alta</h2></div>
        <div class="grid">${S.sortRestaurants(S.DB.restaurants.filter((item) => item.featured), "relevancia").map(S.restaurantCard).join("")}</div>`;
    }
    return `
      ${dishes.length ? `<div class="section-head"><h2>Pratos</h2></div><div class="dish-rail">${dishes.join("")}</div>` : ""}
      <div class="section-head"><h2>Lojas</h2><span class="muted small">${list.length}</span></div>
      ${list.length ? `<div class="grid">${list.map(S.restaurantCard).join("")}</div>` : `<div class="empty card"><strong>Nada encontrado</strong><p class="muted">Tente outro nome de prato ou cozinha.</p></div>`}`;
  }

  function view() {
    const category = categoryId ? S.categoryById(categoryId) : null;
    return `
      <label class="searchbar">
        ${S.icon("search")}
        <input id="q" value="${S.esc(S.state.query)}" placeholder="${category ? "Buscar em " + S.esc(category.name) : "Busque por prato ou loja"}" autocomplete="off">
        <button type="button" id="clear-q" data-action="clear-search" ${S.state.query ? "" : "hidden"}>Limpar</button>
      </label>
      <div class="sortbar">
        ${S.chipsHTML()}
        <label class="small muted">Ordenar
          <select id="sort" aria-label="Ordenar">
            ${["relevancia", "avaliacao", "tempo", "taxa"].map((item) => {
              const labels = { relevancia: "Relevância", avaliacao: "Avaliação", tempo: "Tempo", taxa: "Taxa" };
              return `<option value="${item}" ${S.state.sort === item ? "selected" : ""}>${labels[item]}</option>`;
            }).join("")}
          </select>
        </label>
      </div>
      ${category ? `<p class="muted">Mostrando a categoria ${S.esc(category.name)}.</p>` : ""}
      <div id="search-dynamic">${results()}</div>`;
  }

  function paintResults() {
    const box = document.getElementById("search-dynamic");
    const clear = document.getElementById("clear-q");
    if (box) box.innerHTML = results();
    if (clear) clear.hidden = !S.state.query;
  }

  function remember(query) {
    const clean = query.trim();
    if (clean.length < 2) return;
    S.state.recentSearches = [clean, ...S.state.recentSearches.filter((item) => S.norm(item) !== S.norm(clean))].slice(0, 6);
    S.persist();
  }

  document.addEventListener("input", (event) => {
    if (event.target.id !== "q") return;
    S.state.query = event.target.value;
    paintResults();
  });

  document.addEventListener("change", (event) => {
    if (event.target.id !== "sort") return;
    S.state.sort = event.target.value;
    S.persist();
    paintResults();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && event.target.id === "q") remember(S.state.query);
  });

  S.start({
    page: "busca",
    header: () => (categoryId && S.categoryById(categoryId) ? S.categoryById(categoryId).name : "Busca"),
    render: view,
    actions: {
      filter(el) {
        S.state[el.dataset.key] = !S.state[el.dataset.key];
        S.persist();
        S.paint();
        const input = document.getElementById("q");
        if (input) input.focus();
      },
      "quick-search"(el) {
        S.state.query = el.dataset.q || "";
        remember(S.state.query);
        S.paint();
        const input = document.getElementById("q");
        if (input) input.focus();
      },
      "clear-search"() {
        S.state.query = "";
        const input = document.getElementById("q");
        if (input) {
          input.value = "";
          input.focus();
        }
        paintResults();
      },
    },
  });
})();
