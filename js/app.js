(function () {
  const KEY = "saborja-state-v1";
  const DB = window.DB;
  const STEPS = [
    { title: "Pedido confirmado", text: "A loja recebeu o seu pedido." },
    { title: "Em preparo", text: "A cozinha está montando tudo." },
    { title: "Saiu para entrega", text: "O entregador está a caminho." },
    { title: "Entregue", text: "Bom apetite." },
  ];
  const COURIERS = [
    { name: "Rafael Mota", vehicle: "Moto" },
    { name: "Lívia Nunes", vehicle: "Bicicleta" },
    { name: "Caio Pires", vehicle: "Moto" },
  ];
  const STEP_MS = 8000;

  const BASE_PAYMENTS = [
    { id: "pix", type: "pix", label: "Pix", detail: "Aprovação imediata nesta simulação" },
    { id: "vr", type: "vr", label: "Vale-refeição", detail: "Sabor Card •••• 9088" },
    { id: "cash", type: "cash", label: "Dinheiro", detail: "Pagamento na entrega" },
  ];

  function uid() {
    return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[char]));
  }

  function money(value) {
    return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function norm(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[áàãâä]/g, "a")
      .replace(/[éèêë]/g, "e")
      .replace(/[íìîï]/g, "i")
      .replace(/[óòõôö]/g, "o")
      .replace(/[úùûü]/g, "u")
      .replace(/ç/g, "c");
  }

  function rateNum(value) {
    return Number(value).toFixed(1).replace(".", ",");
  }

  function whenLabel(ts) {
    return new Date(ts).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function icon(name) {
    const common = 'class="ico" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
    const paths = {
      home: `<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z"/>`,
      search: `<circle cx="11" cy="11" r="6"/><path d="m20 20-3.5-3.5"/>`,
      orders: `<path d="M7 3h10a1 1 0 0 1 1 1v17l-2.2-1.3L13 21l-2.5-1.4L8 21l-2-1.2L4 21V4a1 1 0 0 1 1-1h2z"/><path d="M8 8h8M8 12h8M8 16h5"/>`,
      user: `<circle cx="12" cy="8" r="3"/><path d="M5 19c1.4-3 3.8-4.5 7-4.5S17.6 16 19 19"/>`,
      bag: `<path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V7a3 3 0 0 1 6 0v1"/>`,
      back: `<path d="M15 5 8 12l7 7"/>`,
      pin: `<path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2"/>`,
      heart: `<path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z"/>`,
      tag: `<path d="M20 13 11 4H4v7l9 9 7-7z"/><circle cx="7.5" cy="7.5" r=".8" fill="currentColor"/>`,
      card: `<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/>`,
      help: `<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.2 2.4c-.8.3-1.2.8-1.2 1.6V14"/><path d="M12 17h.01"/>`,
      bell: `<path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 18a2 2 0 0 0 4 0"/>`,
      grid: `<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>`,
      star: `<path d="m12 3 2.2 4.6L19 8.2l-3.5 3.4.8 4.9L12 14.8 7.7 16.5l.8-4.9L5 8.2l4.8-.6z"/>`,
    };
    return `<svg ${common}>${paths[name] || ""}</svg>`;
  }

  function heart(on) {
    return `<svg class="heart ${on ? "is-on" : ""}" viewBox="0 0 24 24" aria-hidden="true" fill="${on ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.8"><path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z"/></svg>`;
  }

  function stars(n) {
    const full = Math.round(Number(n) || 0);
    let html = "";
    for (let i = 1; i <= 5; i += 1) html += `<span class="${i <= full ? "on" : ""}">★</span>`;
    return `<span class="stars" aria-label="${full} de 5">${html}</span>`;
  }

  function route() {
    const raw = (location.hash || "#/inicio").replace(/^#\/?/, "");
    const bits = raw.split("/").filter(Boolean);
    return { name: bits[0] || "inicio", parts: bits.slice(1), key: raw || "inicio" };
  }

  let shownHash = location.hash;

  function go(hash) {
    if (location.hash === hash) {
      render();
      return;
    }
    let announced = false;
    const mark = () => {
      announced = true;
    };
    window.addEventListener("hashchange", mark);
    location.hash = hash;
    window.removeEventListener("hashchange", mark);
    if (!announced) render();
  }

  function getRestaurant(id) {
    return DB.restaurants.find((item) => item.id === id) || null;
  }

  function findItem(restaurantId, itemId) {
    const restaurant = getRestaurant(restaurantId);
    if (!restaurant) return null;
    for (const section of restaurant.menu) {
      const item = section.items.find((entry) => entry.id === itemId);
      if (item) return { restaurant, section, item };
    }
    return null;
  }

  function categoryById(id) {
    return DB.categories.find((item) => item.id === id) || null;
  }

  function feeText(restaurant) {
    return restaurant.fee === 0 ? '<span class="free">Grátis</span>' : money(restaurant.fee);
  }

  function timeNum(restaurant) {
    const match = String(restaurant.time).match(/\d+/);
    return match ? Number(match[0]) : 99;
  }

  function haystack(restaurant) {
    const dishes = restaurant.menu
      .flatMap((section) => section.items.map((item) => `${item.name} ${item.description}`))
      .join(" ");
    return norm([restaurant.name, restaurant.cuisine, restaurant.category, restaurant.keywords, dishes].join(" "));
  }

  function selectedAddress() {
    return state.addresses.find((item) => item.id === state.selectedAddressId) || state.addresses[0] || null;
  }

  function addressLine(address) {
    if (!address) return "Escolha um endereço";
    const extra = address.complement ? `, ${address.complement}` : "";
    return `${address.street}, ${address.number}${extra} — ${address.neighborhood}`;
  }

  function allPayments() {
    const cards = (state.cards || []).map((card) => ({
      id: card.id,
      type: "credit",
      label: "Crédito",
      detail: `${card.brand} •••• ${card.last4}`,
    }));
    return BASE_PAYMENTS.concat(cards);
  }

  function selectedPayment() {
    return allPayments().find((item) => item.id === state.selectedPaymentId) || allPayments()[0];
  }

  function cartCount() {
    return state.cart.items.reduce((sum, item) => sum + item.qty, 0);
  }

  function cartSubtotal() {
    return state.cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  function currentRestaurant() {
    return getRestaurant(state.cart.restaurantId);
  }

  function appliedCoupon() {
    if (!state.cart.couponCode) return null;
    return DB.coupons.find((coupon) => coupon.code === state.cart.couponCode) || null;
  }

  function totals() {
    const restaurant = currentRestaurant();
    const subtotal = cartSubtotal();
    const delivery = restaurant && subtotal > 0 ? restaurant.fee : 0;
    const coupon = appliedCoupon();
    let discount = 0;
    let couponNote = "";
    if (coupon && subtotal > 0) {
      if (subtotal < coupon.min) {
        couponNote = `Faltam ${money(coupon.min - subtotal)} para usar ${coupon.code}.`;
      } else if (coupon.type === "shipping") discount = delivery;
      else if (coupon.type === "percent") discount = Math.min(coupon.cap, subtotal * coupon.percent);
      else if (coupon.type === "fixed") discount = Math.min(coupon.amount, subtotal);
    }
    const total = Math.max(0, subtotal + delivery - discount);
    return { restaurant, subtotal, delivery, discount, total, coupon, couponNote };
  }

  function statusIndex(order) {
    const elapsed = Date.now() - order.createdAt;
    return Math.max(0, Math.min(3, Math.floor(elapsed / STEP_MS)));
  }

  function statusLabel(index) {
    return ["Confirmado", "Em preparo", "A caminho", "Entregue"][index] || "Pedido";
  }

  function courierFor(order) {
    const n = order.id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return COURIERS[n % COURIERS.length];
  }

  function eta(order) {
    const step = statusIndex(order);
    if (step >= 3) return "Pedido entregue";
    const left = [40, 28, 12][step];
    return `Previsão de ${left - 8}–${left} min`;
  }

  function seedOrder() {
    return {
      id: "SJ10482",
      restaurantId: "forno-alto",
      restaurantName: "Forno Alto",
      items: [
        {
          uid: "seed1",
          itemId: "margherita",
          name: "Margherita",
          qty: 1,
          price: 46.9,
          options: [
            { id: "tamanho:media", group: "Tamanho", name: "Média · 6 fatias", price: 0 },
            { id: "borda:tradicional", group: "Borda", name: "Tradicional", price: 0 },
          ],
          note: "",
        },
      ],
      addressText: "Rua Harmonia, 418 — Vila Madalena",
      paymentLabel: "Pix",
      subtotal: 46.9,
      delivery: 0,
      discount: 0,
      total: 46.9,
      couponCode: "",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
      rated: 5,
      instructions: "",
    };
  }

  function defaultState() {
    return {
      cart: { restaurantId: null, items: [], couponCode: "", couponDraft: "", instructions: "", change: "" },
      favorites: ["hana-sushi", "raiz-verde"],
      orders: [seedOrder()],
      addresses: [
        {
          id: "casa",
          label: "Casa",
          street: "Rua Harmonia",
          number: "418",
          complement: "ap. 12",
          neighborhood: "Vila Madalena",
          city: "São Paulo",
          reference: "Portão verde",
        },
        {
          id: "trabalho",
          label: "Trabalho",
          street: "Av. das Palmeiras",
          number: "900",
          complement: "conjunto 4",
          neighborhood: "Pinheiros",
          city: "São Paulo",
          reference: "Recepção do térreo",
        },
      ],
      selectedAddressId: "casa",
      cards: [{ id: "card-visa", brand: "Visa", last4: "4421", name: "Ana Alves" }],
      selectedPaymentId: "pix",
      notifications: { orders: true, promos: true, email: false },
      user: { name: "Ana Alves", email: "ana.alves@email.com", phone: "(11) 98821-4400" },
      logged: true,
      recentSearches: ["pizza", "açaí"],
      query: "",
      sort: "relevancia",
      onlyFree: false,
      onlyTop: false,
      onlyOpen: false,
      authMode: "login",
      menuTab: "cardapio",
      menuFor: "",
      draft: null,
      faqOpen: "",
      modal: null,
      focusSearch: false,
    };
  }

  function loadState() {
    const base = defaultState();
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "null");
      const keys = ["cart", "favorites", "orders", "addresses", "selectedAddressId", "cards", "selectedPaymentId", "notifications", "user", "logged", "recentSearches"];
      if (saved && typeof saved === "object") {
        keys.forEach((key) => {
          if (saved[key] !== undefined) base[key] = saved[key];
        });
      }
    } catch (error) {
      /* storage indisponível ou dado antigo */
    }
    if (!base.cart.items) base.cart = defaultState().cart;
    if (base.user && base.user.name === "Marina Alves") {
      base.user.name = "Ana Alves";
      if (base.user.email === "marina.alves@email.com") base.user.email = "ana.alves@email.com";
    }
    (base.cards || []).forEach((card) => {
      if (card.name === "Marina Alves") card.name = "Ana Alves";
    });
    return base;
  }

  const state = loadState();
  let lastKey = "";
  let toastTimer = 0;

  function persist() {
    const data = {
      cart: state.cart,
      favorites: state.favorites,
      orders: state.orders,
      addresses: state.addresses,
      selectedAddressId: state.selectedAddressId,
      cards: state.cards,
      selectedPaymentId: state.selectedPaymentId,
      notifications: state.notifications,
      user: state.user,
      logged: state.logged,
      recentSearches: state.recentSearches,
    };
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function toast(message) {
    const el = document.getElementById("toast");
    el.textContent = message;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.hidden = true;
    }, 2400);
  }

  function firstName() {
    return (state.user.name || "visitante").split(" ")[0];
  }

  function greet() {
    const hour = new Date().getHours();
    const hello = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
    return state.logged ? `${hello}, ${firstName()}` : hello;
  }

  function titles(name) {
    return {
      inicio: "Início",
      busca: "Busca",
      categorias: "Categorias",
      categoria: "Categoria",
      restaurante: "Loja",
      prato: "Prato",
      carrinho: "Sacola",
      checkout: "Checkout",
      acompanhar: "Acompanhar",
      pedidos: "Pedidos",
      favoritos: "Favoritos",
      cupons: "Cupons",
      enderecos: "Endereços",
      pagamentos: "Pagamentos",
      perfil: "Perfil",
      ajuda: "Ajuda",
      entrar: "Entrar",
      notificacoes: "Notificações",
    }[name] || "SaborJá";
  }

  function sectionKey() {
    const { name } = route();
    if (name === "categoria" || name === "busca") return "busca";
    if (name === "restaurante" || name === "prato" || name === "inicio") return "inicio";
    if (name === "checkout" || name === "carrinho") return "carrinho";
    if (name === "acompanhar") return "pedidos";
    if (name === "notificacoes" || name === "entrar") return "perfil";
    return name;
  }

  function tabKey() {
    const { name } = route();
    if (["enderecos", "pagamentos", "notificacoes", "perfil", "entrar"].includes(name)) return "perfil";
    if (name === "acompanhar" || name === "pedidos") return "pedidos";
    if (name === "busca" || name === "categoria") return "busca";
    if (name === "favoritos") return "favoritos";
    if (["inicio", "restaurante", "prato", "categorias"].includes(name)) return "inicio";
    return "";
  }

  function navLink(href, label, iconName, key, count) {
    const on = sectionKey() === key;
    return `<a class="nav-link ${on ? "is-active" : ""}" href="${href}" ${on ? 'aria-current="page"' : ""}>${icon(iconName)}<span>${label}</span>${count ? `<em>${count}</em>` : ""}</a>`;
  }

  function sidebarHTML() {
    const count = cartCount();
    return `
      <a class="brand" href="#/inicio">
        <span class="brand__mark">Sj</span>
        <span><strong>SaborJá</strong><small>delivery de comida</small></span>
      </a>
      <p class="nav-label">Explorar</p>
      ${navLink("#/inicio", "Início", "home", "inicio")}
      ${navLink("#/busca", "Busca", "search", "busca")}
      ${navLink("#/categorias", "Categorias", "grid", "categorias")}
      <p class="nav-label">Pedidos</p>
      ${navLink("#/carrinho", "Sacola", "bag", "carrinho", count || "")}
      ${navLink("#/pedidos", "Meus pedidos", "orders", "pedidos")}
      <p class="nav-label">Conta</p>
      ${navLink("#/favoritos", "Favoritos", "heart", "favoritos")}
      ${navLink("#/cupons", "Cupons", "tag", "cupons")}
      ${navLink("#/enderecos", "Endereços", "pin", "enderecos")}
      ${navLink("#/pagamentos", "Pagamentos", "card", "pagamentos")}
      ${navLink("#/perfil", "Perfil", "user", "perfil")}
      ${navLink("#/ajuda", "Ajuda", "help", "ajuda")}
    `;
  }

  function headerHTML() {
    const current = route();
    const simple = ["inicio", "busca", "categorias", "entrar"].includes(current.name);
    const address = selectedAddress();
    let center = `<p class="header__title">${esc(titles(current.name))}</p>`;
    if (current.name === "inicio") {
      center = `<button class="address-chip" type="button" data-action="go" data-href="#/enderecos"><small>Entregar em</small><strong>${esc(address ? address.label + " · " + address.street : "Definir endereço")}</strong></button>`;
    } else if (current.name === "restaurante") {
      const restaurant = getRestaurant(current.parts[0]);
      center = `<p class="header__title">${esc(restaurant ? restaurant.name : "Loja")}</p>`;
    } else if (current.name === "categoria") {
      const category = categoryById(current.parts[0]);
      center = `<p class="header__title">${esc(category ? category.name : "Categoria")}</p>`;
    } else if (current.name === "prato") {
      const found = findItem(current.parts[0], current.parts[1]);
      center = `<p class="header__title">${esc(found ? found.item.name : "Prato")}</p>`;
    }
    const count = cartCount();
    return `
      ${simple ? `<a class="header__brand" href="#/inicio"><i>Sj</i> SaborJá</a>` : `<button class="icon-round" type="button" data-action="back" aria-label="Voltar">${icon("back")}</button>`}
      <div class="header__center">${center}</div>
      ${state.logged ? "" : `<a class="btn-sm" href="#/entrar">Entrar</a>`}
      <a class="icon-round" href="#/carrinho" aria-label="Sacola">${icon("bag")}${count ? `<span class="bag-count">${count}</span>` : ""}</a>
    `;
  }

  function tabbarHTML() {
    const key = tabKey();
    const count = cartCount();
    const tabs = [
      ["#/inicio", "Início", "home", "inicio"],
      ["#/busca", "Busca", "search", "busca"],
      ["#/pedidos", "Pedidos", "orders", "pedidos"],
      ["#/favoritos", "Favoritos", "heart", "favoritos"],
      ["#/perfil", "Perfil", "user", "perfil"],
    ];
    return tabs
      .map(([href, label, iconName, id]) => {
        const on = key === id;
        const dot = id === "pedidos" && count && key !== "carrinho" ? "" : "";
        return `<a href="${href}" class="${on ? "is-active" : ""}" ${on ? 'aria-current="page"' : ""}>${icon(iconName)}<span>${label}</span>${dot}</a>`;
      })
      .join("");
  }

  function imgTag(src, alt, className) {
    return `<img class="${className || ""}" src="${esc(src)}" alt="${esc(alt)}" onerror="this.remove()">`;
  }

  function restaurantCard(restaurant) {
    const fav = state.favorites.includes(restaurant.id);
    return `
      <article class="rcard">
        <div class="rcard__media" style="background:${restaurant.color}">
          <a href="#/restaurante/${restaurant.id}" aria-label="${esc(restaurant.name)}">
            ${imgTag(restaurant.image, restaurant.name, "")}
          </a>
          ${restaurant.promo ? `<span class="pill">${esc(restaurant.promo)}</span>` : ""}
          ${restaurant.open ? "" : `<span class="pill pill--closed">Fechado</span>`}
          <button class="fav" type="button" data-action="fav" data-id="${restaurant.id}" aria-pressed="${fav}" aria-label="${fav ? "Remover dos favoritos" : "Salvar loja"}">${heart(fav)}</button>
        </div>
        <a class="rcard__body" href="#/restaurante/${restaurant.id}">
          <div class="rcard__title"><h3>${esc(restaurant.name)}</h3><span class="rate"><span>★</span> ${rateNum(restaurant.rating)}</span></div>
          <p class="small muted">${esc(restaurant.cuisine)} · ${esc(restaurant.distance)}</p>
          <p class="small">${esc(restaurant.time)} · ${feeText(restaurant)}${restaurant.open ? "" : " · " + esc(restaurant.closedMessage || "Fechado")}</p>
        </a>
      </article>
    `;
  }

  function filterRestaurants({ category, query, useFilters }) {
    let list = DB.restaurants.slice();
    if (category && category !== "todos") list = list.filter((item) => item.category === category);
    if (useFilters && state.onlyFree) list = list.filter((item) => item.fee === 0);
    if (useFilters && state.onlyTop) list = list.filter((item) => item.rating >= 4.7);
    if (useFilters && state.onlyOpen) list = list.filter((item) => item.open);
    if (query) {
      const q = norm(query);
      list = list.filter((item) => haystack(item).includes(q));
    }
    return list;
  }

  function sortRestaurants(list, mode) {
    const arr = list.slice();
    arr.sort((a, b) => {
      if (mode === "avaliacao") return b.rating - a.rating;
      if (mode === "tempo") return timeNum(a) - timeNum(b);
      if (mode === "taxa") return a.fee - b.fee;
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return b.rating - a.rating;
    });
    return arr;
  }

  function chipsHTML() {
    const chips = [
      ["onlyFree", "Frete grátis"],
      ["onlyTop", "Nota 4,7+"],
      ["onlyOpen", "Abertos agora"],
    ];
    return `<div class="chips">${chips
      .map(([key, label]) => `<button class="chip ${state[key] ? "is-on" : ""}" type="button" data-action="filter" data-key="${key}">${label}</button>`)
      .join("")}</div>`;
  }

  function popularDishes() {
    const list = [];
    DB.restaurants.forEach((restaurant) => {
      restaurant.menu.forEach((section) => {
        section.items.forEach((item) => {
          if (item.popular) list.push({ restaurant, item });
        });
      });
    });
    return list;
  }

  function dishCard(restaurant, item) {
    const src = item.image || restaurant.image;
    return `
      <a class="dish-card" href="#/prato/${restaurant.id}/${item.id}">
        ${imgTag(src, item.name, "")}
        <div>
          <em>${esc(restaurant.name)}</em>
          <strong>${esc(item.name)}</strong>
          <span>${money(item.price)}</span>
        </div>
      </a>
    `;
  }

  function viewHome() {
    const list = sortRestaurants(filterRestaurants({ useFilters: true }), "relevancia");
    const banners = [
      ["forno-alto", "Hoje no forno", "Frete grátis no Forno Alto", "Pizzas a partir de R$ 46,90", "photo-1513104890138-7c749659a591"],
      ["brasa-lenha", "Para dividir", "Picanha na Brasa & Lenha", "Cortes no fogo de lenha", "photo-1558030006-450675393462"],
      ["norte-acai", "Gelado agora", "Monte o copo no Norte Açaí", "Entrega rápida no bairro", "photo-1590301157890-4810ed352733"],
    ];
    return `
      <section class="greet greet--home">
        <h1>${esc(greet())}</h1>
        <p>O que vai pedir hoje?</p>
      </section>
      <a class="searchbar" href="#/busca">${icon("search")}<span>Busque por prato ou loja</span></a>
      <div class="banners">
        ${banners
          .map(
            ([id, kicker, title, text, photo]) => `
            <a class="banner" href="#/restaurante/${id}" style="background-image:url('https://images.unsplash.com/${photo}?auto=format&fit=crop&w=1200&q=70')">
              <span><small>${kicker}</small><strong>${title}</strong><em>${text}</em></span>
            </a>`
          )
          .join("")}
      </div>
      <div class="section-head"><h2>Categorias</h2><a href="#/categorias">Ver todas</a></div>
      <div class="cats">
        ${DB.categories
          .map(
            (category) => `
            <a class="cat" href="#/categoria/${category.id}">
              <span class="cat__face">${category.emoji}</span>
              <span>${esc(category.name)}</span>
            </a>`
          )
          .join("")}
      </div>
      ${chipsHTML()}
      <div class="section-head"><h2>Perto de você</h2><span class="muted small">${list.length} lojas</span></div>
      ${list.length ? `<div class="grid">${list.map(restaurantCard).join("")}</div>` : `<div class="empty card"><strong>Nenhuma loja com esse filtro</strong><p class="muted">Tire um filtro para ver o bairro de novo.</p></div>`}
      <div class="section-head"><h2>Pedidos em alta</h2></div>
      <div class="dish-rail">${popularDishes().map(({ restaurant, item }) => dishCard(restaurant, item)).join("")}</div>
      <div class="section-head"><h2>Cupons pra testar</h2><a href="#/cupons">Ver cupons</a></div>
      <div class="ticket-row">
        ${DB.coupons
          .map(
            (coupon) => `
            <article class="ticket">
              <div><strong>${esc(coupon.title)}</strong><p class="small muted">${esc(coupon.description)}</p><code>${esc(coupon.code)}</code></div>
              <button type="button" data-action="use-coupon" data-code="${coupon.code}">Usar</button>
            </article>`
          )
          .join("")}
      </div>
      <p class="footer-note">SaborJá é um projeto de interface para estudo. Não é um delivery real: nada é cobrado, preparado ou entregue.</p>
    `;
  }

  function searchDishes(query) {
    const q = norm(query || "");
    if (q.length < 2) return [];
    const out = [];
    DB.restaurants.forEach((restaurant) => {
      if (state.onlyOpen && !restaurant.open) return;
      restaurant.menu.forEach((section) => {
        section.items.forEach((item) => {
          if (norm(`${item.name} ${item.description}`).includes(q)) out.push({ restaurant, item });
        });
      });
    });
    return out.slice(0, 12);
  }

  function searchDynamicHTML(category) {
    const query = state.query.trim();
    const list = sortRestaurants(filterRestaurants({ category, query, useFilters: true }), state.sort);
    const dishes = category ? [] : searchDishes(query);
    if (!query && !category) {
      return `
        <p class="section-head"><h2>Buscas recentes</h2></p>
        <div class="chips">
          ${state.recentSearches.map((item) => `<button class="chip" type="button" data-action="quick-search" data-q="${esc(item)}">${esc(item)}</button>`).join("")}
          ${["hambúrguer", "sushi", "doce", "salada"]
            .map((item) => `<button class="chip" type="button" data-action="quick-search" data-q="${item}">${item}</button>`)
            .join("")}
        </div>
        <div class="section-head"><h2>Lojas em alta</h2></div>
        <div class="grid">${sortRestaurants(DB.restaurants.filter((item) => item.featured), "relevancia").map(restaurantCard).join("")}</div>
      `;
    }
    return `
      ${dishes.length ? `<div class="section-head"><h2>Pratos</h2></div><div class="dish-rail">${dishes.map(({ restaurant, item }) => dishCard(restaurant, item)).join("")}</div>` : ""}
      <div class="section-head"><h2>Lojas</h2><span class="muted small">${list.length}</span></div>
      ${list.length ? `<div class="grid">${list.map(restaurantCard).join("")}</div>` : `<div class="empty card"><strong>Nada encontrado</strong><p class="muted">Tente outro nome de prato ou cozinha.</p></div>`}
    `;
  }

  function viewSearch(categoryId) {
    const category = categoryId ? categoryById(categoryId) : null;
    return `
      <label class="searchbar">
        ${icon("search")}
        <input id="q" value="${esc(state.query)}" placeholder="${category ? "Buscar em " + esc(category.name) : "Busque por prato ou loja"}" autocomplete="off">
        <button type="button" id="clear-q" data-action="clear-search" ${state.query ? "" : "hidden"}>Limpar</button>
      </label>
      <div class="sortbar">
        ${chipsHTML()}
        <label class="small muted">Ordenar
          <select id="sort" aria-label="Ordenar">
            ${["relevancia", "avaliacao", "tempo", "taxa"]
              .map((item) => {
                const labels = { relevancia: "Relevância", avaliacao: "Avaliação", tempo: "Tempo", taxa: "Taxa" };
                return `<option value="${item}" ${state.sort === item ? "selected" : ""}>${labels[item]}</option>`;
              })
              .join("")}
          </select>
        </label>
      </div>
      ${category ? `<p class="muted">Mostrando a categoria ${esc(category.name)}.</p>` : ""}
      <div id="search-dynamic">${searchDynamicHTML(categoryId || "")}</div>
    `;
  }

  function viewCategories() {
    const colors = ["#8c3a2b", "#a33b32", "#1e3a40", "#c47a2c", "#6e4a3a", "#4a2c6a", "#b4532a", "#2f6b45", "#c48a4a", "#b84a2f", "#a85a78"];
    return `
      <section class="greet"><h1>Categorias</h1><p>Escolha um tipo de cozinha.</p></section>
      <div class="cat-grid">
        ${DB.categories
          .map((category, index) => {
            const count = DB.restaurants.filter((item) => item.category === category.id).length;
            return `<a class="cat-tile" style="background:${colors[index % colors.length]}" href="#/categoria/${category.id}"><span>${category.emoji}</span><span>${esc(category.name)}<small style="display:block;font-family:Outfit,sans-serif;font-size:.8rem;opacity:.85">${count} ${count === 1 ? "loja" : "lojas"}</small></span></a>`;
          })
          .join("")}
      </div>
    `;
  }

  function viewRestaurant(id) {
    const restaurant = getRestaurant(id);
    if (!restaurant) return viewMissing();
    if (state.menuFor !== id) {
      state.menuFor = id;
      state.menuTab = "cardapio";
    }
    const fav = state.favorites.includes(restaurant.id);
    const tab = state.menuTab;
    let panel = "";
    if (tab === "avaliacoes") {
      panel = restaurant.reviews
        .map(
          (review) => `
          <article class="review">
            <div class="spread"><strong>${esc(review.name)}</strong><span class="small muted">${esc(review.date)}</span></div>
            ${stars(review.stars)}
            <p>${esc(review.text)}</p>
          </article>`
        )
        .join("");
    } else if (tab === "info") {
      panel = `
        <div class="card" style="box-shadow:none">
          <h3>Sobre</h3>
          <p>${esc(restaurant.about)}</p>
          <p class="small" style="margin-top:10px"><strong>Horário.</strong> ${esc(restaurant.hours)}</p>
          <p class="small"><strong>Endereço.</strong> ${esc(restaurant.address)}</p>
          <p class="small"><strong>Pedido mínimo.</strong> ${money(restaurant.min)}</p>
          <p class="small"><strong>Telefone.</strong> ${esc(restaurant.phone)}</p>
          <button class="btn btn--ghost" style="margin-top:12px" type="button" data-action="demo-lock" data-msg="Demonstração: a ligação não sai deste navegador.">Ligar para a loja</button>
        </div>`;
    } else {
      panel = `
        <div class="menu-nav">
          ${restaurant.menu.map((section) => `<button type="button" data-action="jump" data-target="sec-${section.id}">${esc(section.name)}</button>`).join("")}
        </div>
        ${restaurant.menu
          .map(
            (section) => `
            <section class="menu-section" id="sec-${section.id}">
              <h2>${esc(section.name)}</h2>
              ${section.items
                .map((item) => {
                  const priced = (item.options || []).some((group) => group.choices.some((choice) => choice.price > 0));
                  return `
                    <a class="dish" href="#/prato/${restaurant.id}/${item.id}">
                      <div>
                        ${item.popular ? '<span class="tag">Mais pedido</span>' : ""}
                        <h3>${esc(item.name)}</h3>
                        <p>${esc(item.description)}</p>
                        <strong>${priced ? "a partir de " : ""}${money(item.price)}</strong>
                      </div>
                      ${imgTag(item.image || restaurant.image, item.name, "thumb")}
                    </a>`;
                })
                .join("")}
            </section>`
          )
          .join("")}`;
    }
    return `
      <article class="store">
        <div class="store__cover" style="background:${restaurant.color}">
          ${imgTag(restaurant.image, restaurant.name, "")}
        </div>
        <div class="store__sheet">
          <div class="spread">
            <h1>${esc(restaurant.name)}</h1>
            <button class="fav" style="position:static" type="button" data-action="fav" data-id="${restaurant.id}" aria-pressed="${fav}" aria-label="Favoritar">${heart(fav)}</button>
          </div>
          <p class="muted">${esc(restaurant.cuisine)} · <span class="rate"><span>★</span> ${rateNum(restaurant.rating)}</span> (${restaurant.reviewCount})</p>
          <div class="facts">
            <span class="fact">${esc(restaurant.time)}</span>
            <span class="fact">${restaurant.fee === 0 ? "Entrega grátis" : "Entrega " + money(restaurant.fee)}</span>
            <span class="fact">Mínimo ${money(restaurant.min)}</span>
            <span class="fact">${restaurant.open ? "Aberto" : esc(restaurant.closedMessage || "Fechado")}</span>
          </div>
          ${restaurant.open ? "" : `<div class="closed-banner">${esc(restaurant.closedMessage || "Loja fechada")}. Dá para ver o cardápio, sem montar pedido.</div>`}
          <div class="tabs" role="tablist">
            ${[
              ["cardapio", "Cardápio"],
              ["avaliacoes", "Avaliações"],
              ["info", "Informações"],
            ]
              .map(([idTab, label]) => `<button type="button" role="tab" class="${tab === idTab ? "is-on" : ""}" aria-selected="${tab === idTab}" data-action="tab" data-tab="${idTab}">${label}</button>`)
              .join("")}
          </div>
        </div>
        ${panel}
      </article>
    `;
  }

  function ensureDraft(restaurant, item) {
    const key = `${restaurant.id}/${item.id}`;
    if (!state.draft || state.draft.key !== key) {
      state.draft = { key, qty: 1, options: {}, note: "" };
    }
  }

  function draftUnit(item) {
    let extra = 0;
    (item.options || []).forEach((group) => {
      (state.draft.options[group.id] || []).forEach((choiceId) => {
        const choice = group.choices.find((entry) => entry.id === choiceId);
        if (choice) extra += choice.price || 0;
      });
    });
    return item.price + extra;
  }

  function viewItem(restaurantId, itemId) {
    const found = findItem(restaurantId, itemId);
    if (!found) return viewMissing();
    const { restaurant, item } = found;
    ensureDraft(restaurant, item);
    const closed = !restaurant.open;
    const groups = (item.options || [])
      .map((group) => {
        const picked = state.draft.options[group.id] || [];
        return `
          <fieldset class="opt">
            <legend>${esc(group.name)} <span>${group.required ? "Obrigatório" : "Opcional"}${group.max > 1 ? ` · até ${group.max}` : ""}</span></legend>
            ${group.choices
              .map((choice) => {
                const type = group.max === 1 ? "radio" : "checkbox";
                const checked = picked.includes(choice.id) ? "checked" : "";
                return `
                  <label class="choice">
                    <span><input type="${type}" name="g-${group.id}" value="${choice.id}" data-group="${group.id}" ${checked}> ${esc(choice.name)}</span>
                    <strong>${choice.price ? "+ " + money(choice.price) : ""}</strong>
                  </label>`;
              })
              .join("")}
          </fieldset>`;
      })
      .join("");
    return `
      <article class="prato">
        <div class="prato__hero" style="background:${restaurant.color}">
          ${imgTag(item.image || restaurant.image, item.name, "")}
        </div>
        <p class="small muted" style="margin-top:12px"><a href="#/restaurante/${restaurant.id}">${esc(restaurant.name)}</a> · ${esc(item.serves)}</p>
        <h1>${esc(item.name)}</h1>
        <p class="muted">${esc(item.description)}</p>
        ${closed ? `<div class="closed-banner">${esc(restaurant.name)} está fechada. ${esc(restaurant.closedMessage || "")}</div>` : ""}
        <form id="item-form">
          ${groups}
          <label class="field note">Observação
            <textarea id="item-note" maxlength="140" placeholder="Ex.: sem cebola, molho à parte">${esc(state.draft.note)}</textarea>
          </label>
        </form>
        <div class="buybar">
          <div class="stepper">
            <button type="button" data-action="qty-item" data-dir="-1" aria-label="Diminuir">−</button>
            <strong id="qty-val">${state.draft.qty}</strong>
            <button type="button" data-action="qty-item" data-dir="1" aria-label="Aumentar">+</button>
          </div>
          <button class="btn" type="button" data-action="add-item" ${closed ? "disabled" : ""}>
            ${closed ? "Loja fechada" : `Adicionar · <span id="buy-price">${money(draftUnit(item) * state.draft.qty)}</span>`}
          </button>
        </div>
      </article>
    `;
  }

  function optionText(line) {
    const names = (line.options || []).filter((option) => option.price || option.name).map((option) => option.name);
    return names.join(" · ");
  }

  function summaryHTML() {
    const bill = totals();
    if (!bill.subtotal) return `<div class="summary"><div class="total"><span>Total</span><span>${money(0)}</span></div></div>`;
    return `
      <div class="summary">
        <div><span>Subtotal</span><span>${money(bill.subtotal)}</span></div>
        <div><span>Entrega</span><span>${bill.delivery ? money(bill.delivery) : "Grátis"}</span></div>
        ${bill.discount ? `<div><span>Desconto ${esc(bill.coupon.code)}</span><span>− ${money(bill.discount)}</span></div>` : ""}
        <div class="total"><span>Total</span><span>${money(bill.total)}</span></div>
      </div>
      ${bill.couponNote ? `<p class="warn">${esc(bill.couponNote)}</p>` : ""}
    `;
  }

  function viewCart() {
    const bill = totals();
    if (!bill.restaurant || !state.cart.items.length) {
      return `<div class="empty card"><strong>Sua sacola está vazia</strong><p class="muted">Escolha uma loja e monte o pedido.</p><a class="btn" style="margin-top:14px" href="#/inicio">Ver lojas</a></div>`;
    }
    const belowMin = bill.subtotal < bill.restaurant.min;
    return `
      <div class="layout-2">
        <section class="card">
          <h2>${esc(bill.restaurant.name)}</h2>
          <p class="small muted">${bill.restaurant.open ? "Aberto agora" : "Loja fechada"} · mínimo ${money(bill.restaurant.min)}</p>
          ${state.cart.items
            .map(
              (line) => `
              <article class="line">
                <div>
                  <strong>${line.qty}× ${esc(line.name)}</strong>
                  <p class="small muted">${esc(optionText(line))}</p>
                  ${line.note ? `<p class="small">Obs.: ${esc(line.note)}</p>` : ""}
                  <div class="qty">
                    <button type="button" data-action="qty-line" data-uid="${line.uid}" data-dir="-1" aria-label="Diminuir">−</button>
                    <span>${line.qty}</span>
                    <button type="button" data-action="qty-line" data-uid="${line.uid}" data-dir="1" aria-label="Aumentar">+</button>
                    <button type="button" data-action="remove-line" data-uid="${line.uid}">Remover</button>
                  </div>
                </div>
                <strong>${money(line.price * line.qty)}</strong>
              </article>`
            )
            .join("")}
          <button class="btn btn--ghost" style="margin-top:8px" type="button" data-action="clear-cart">Esvaziar sacola</button>
        </section>
        <aside class="card summary-card">
          <h3>Resumo</h3>
          <form id="coupon-form" class="coupon-line">
            <input class="input" id="coupon-draft" value="${esc(state.cart.couponDraft || "")}" placeholder="Cupom" aria-label="Cupom">
            <button class="btn" type="submit">Aplicar</button>
          </form>
          ${state.cart.couponCode ? `<p class="oknote">Cupom ${esc(state.cart.couponCode)} na sacola. <button type="button" data-action="remove-coupon">Remover</button></p>` : ""}
          ${summaryHTML()}
          ${belowMin ? `<p class="warn">Faltam ${money(bill.restaurant.min - bill.subtotal)} para o pedido mínimo.</p>` : ""}
          <a class="btn" href="#/checkout">Continuar</a>
        </aside>
      </div>
    `;
  }

  function needLogin(text) {
    return `<div class="empty card"><strong>Entre para continuar</strong><p class="muted">${esc(text)}</p><a class="btn" style="margin-top:14px" href="#/entrar">Entrar</a></div>`;
  }

  function viewCheckout() {
    if (!state.logged) return needLogin("O checkout usa o endereço e o pagamento da sua conta de demonstração.");
    const bill = totals();
    if (!bill.restaurant || !state.cart.items.length) {
      return `<div class="empty card"><strong>Nada para finalizar</strong><p class="muted">Sua sacola está vazia.</p><a class="btn" style="margin-top:14px" href="#/inicio">Ver lojas</a></div>`;
    }
    const pay = selectedPayment();
    const belowMin = bill.subtotal < bill.restaurant.min;
    return `
      <div class="layout-2">
        <div>
          <section class="card">
            <h2>Entregar em</h2>
            ${state.addresses
              .map(
                (address) => `
                <button class="select-card ${address.id === state.selectedAddressId ? "is-on" : ""}" type="button" data-action="addr" data-id="${address.id}">
                  <span><strong>${esc(address.label)}</strong><small>${esc(addressLine(address))}</small></span>
                  <span>${address.id === state.selectedAddressId ? "Selecionado" : ""}</span>
                </button>`
              )
              .join("")}
            <a class="linkish" href="#/enderecos">Novo endereço</a>
            <label class="field" style="margin-top:12px">Instruções
              <textarea id="instructions" maxlength="140" placeholder="Ex.: interfone 12, deixar na portaria">${esc(state.cart.instructions || "")}</textarea>
            </label>
          </section>
          <section class="card" style="margin-top:12px">
            <h2>Pagamento</h2>
            ${allPayments()
              .map(
                (method) => `
                <button class="select-card ${method.id === pay.id ? "is-on" : ""}" type="button" data-action="pay" data-id="${method.id}">
                  <span><strong>${esc(method.label)}</strong><small>${esc(method.detail)}</small></span>
                </button>`
              )
              .join("")}
            ${
              pay.id === "cash"
                ? `<label class="field">Troco para quanto?
                    <input class="input" id="change-for" inputmode="decimal" placeholder="Deixe vazio se não precisar" value="${esc(state.cart.change || "")}">
                  </label>`
                : ""
            }
            <a class="linkish" href="#/pagamentos">Adicionar cartão</a>
          </section>
        </div>
        <aside class="card summary-card">
          <h3>${esc(bill.restaurant.name)}</h3>
          ${state.cart.items.map((line) => `<p class="small">${line.qty}× ${esc(line.name)}</p>`).join("")}
          ${summaryHTML()}
          ${belowMin ? `<p class="warn">Pedido mínimo de ${money(bill.restaurant.min)}.</p>` : ""}
          ${bill.restaurant.open ? "" : `<p class="warn">A loja está fechada.</p>`}
          <button class="btn" type="button" data-action="place" ${belowMin || !bill.restaurant.open ? "disabled" : ""}>Fazer pedido · ${money(bill.total)}</button>
          <p class="footer-note">Pedido simulado. Nada será cobrado ou entregue.</p>
        </aside>
      </div>
    `;
  }

  function trackLiveInner(order) {
    const step = statusIndex(order);
    const courier = courierFor(order);
    const left = 18 + step * 18;
    return `
      <p class="small muted">${eta(order)}</p>
      <div class="map" aria-hidden="true">
        <div class="map__route"></div>
        <div class="map__pin" style="left:${left}%"></div>
        <div class="map__home"></div>
      </div>
      <ol class="steps">
        ${STEPS.map((item, index) => {
          const cls = index < step ? "is-done" : index === step ? "is-current" : "";
          return `<li class="${cls}"><i></i><div><strong>${item.title}</strong><p class="small">${item.text}</p></div></li>`;
        }).join("")}
      </ol>
      ${
        step >= 2 && step < 3
          ? `<div class="courier"><span class="avatar">${esc(courier.name.slice(0, 1))}</span><div><strong>${esc(courier.name)}</strong><p class="small muted">${esc(courier.vehicle)} · entrega simulada</p></div></div>`
          : ""
      }
      ${
        step >= 3
          ? order.rated
            ? `<p class="oknote">Você avaliou com ${order.rated} ${order.rated > 1 ? "estrelas" : "estrela"}.</p>`
            : `<div><p>Como chegou o pedido?</p><div class="chips">${[1, 2, 3, 4, 5].map((n) => `<button class="chip" type="button" data-action="rate" data-order="${order.id}" data-star="${n}">${n} ★</button>`).join("")}</div></div>`
          : ""
      }
    `;
  }

  function viewTrack(id) {
    if (!state.logged) return needLogin("Os pedidos ficam na conta de demonstração.");
    const order = state.orders.find((item) => item.id === id);
    if (!order) return viewMissing();
    const restaurant = getRestaurant(order.restaurantId);
    return `
      <section class="card">
        <p class="small muted">Pedido ${esc(order.id)} · ${esc(whenLabel(order.createdAt))}</p>
        <h2 style="font-family:var(--serif);font-size:1.8rem">${esc(order.restaurantName)}</h2>
        <div id="track-live" data-status="${statusIndex(order)}">${trackLiveInner(order)}</div>
      </section>
      <section class="card" style="margin-top:12px">
        <h3>Itens</h3>
        ${order.items
          .map(
            (line) => `<div class="spread small" style="padding:6px 0"><span>${line.qty}× ${esc(line.name)}</span><span>${money(line.price * line.qty)}</span></div>`
          )
          .join("")}
        <div class="summary">
          <div><span>Entrega</span><span>${order.delivery ? money(order.delivery) : "Grátis"}</span></div>
          ${order.discount ? `<div><span>Desconto</span><span>− ${money(order.discount)}</span></div>` : ""}
          <div class="total"><span>Total</span><span>${money(order.total)}</span></div>
        </div>
        <p class="small muted">${esc(order.addressText)}</p>
        <p class="small muted">${esc(order.paymentLabel)}</p>
        <div class="row-btns" style="margin-top:12px">
          <button class="btn btn--ghost" type="button" data-action="reorder" data-id="${order.id}">Pedir de novo</button>
          ${restaurant ? `<a class="btn btn--ink" href="#/restaurante/${restaurant.id}">Ver loja</a>` : ""}
        </div>
      </section>
    `;
  }

  function viewOrders() {
    if (!state.logged) return needLogin("Entre para ver o histórico desta demonstração.");
    if (!state.orders.length) {
      return `<div class="empty card"><strong>Nenhum pedido ainda</strong><p class="muted">Quando você finalizar uma sacola, ele aparece aqui.</p></div>`;
    }
    const cards = state.orders
      .map((order) => {
        const step = statusIndex(order);
        const restaurant = getRestaurant(order.restaurantId);
        return `
          <article class="card order-card">
            <div class="order-card__top">
              ${restaurant ? imgTag(restaurant.image, "", "") : "<span></span>"}
              <div>
                <div class="spread"><strong>${esc(order.restaurantName)}</strong><span class="status ${step === 3 ? "status--done" : ""}">${statusLabel(step)}</span></div>
                <p class="small muted">${esc(whenLabel(order.createdAt))} · ${money(order.total)}</p>
                <p class="small">${order.items.map((item) => `${item.qty}× ${esc(item.name)}`).join(", ")}</p>
              </div>
            </div>
            <div class="row-btns" style="margin-top:12px">
              <a class="btn" href="#/acompanhar/${order.id}">${step < 3 ? "Acompanhar" : "Ver pedido"}</a>
              <button class="btn btn--ghost" type="button" data-action="reorder" data-id="${order.id}">Pedir de novo</button>
            </div>
          </article>`;
      })
      .join("");
    return `<section class="greet"><h1>Meus pedidos</h1><p>Os pedidos antigos ficam neste navegador.</p></section>${cards}`;
  }

  function viewFavorites() {
    const list = DB.restaurants.filter((item) => state.favorites.includes(item.id));
    if (!list.length) {
      return `<div class="empty card"><strong>Nenhuma loja salva</strong><p class="muted">Toque no coração dos restaurantes para guardar aqui.</p><a class="btn" style="margin-top:14px" href="#/inicio">Explorar</a></div>`;
    }
    return `<section class="greet"><h1>Favoritos</h1><p>${list.length} ${list.length === 1 ? "loja salva" : "lojas salvas"}.</p></section><div class="grid">${list.map(restaurantCard).join("")}</div>`;
  }

  function viewCoupons() {
    return `
      <section class="greet"><h1>Cupons</h1><p>Códigos desta demonstração. O desconto só entra se a sacola atingir o mínimo.</p></section>
      <div class="ticket-row">
        ${DB.coupons
          .map(
            (coupon) => `
            <article class="card">
              <h3>${esc(coupon.title)}</h3>
              <p class="muted">${esc(coupon.description)}</p>
              <p class="small" style="margin:8px 0">Mínimo ${money(coupon.min)}</p>
              <code>${esc(coupon.code)}</code>
              <button class="btn" style="margin-top:12px" type="button" data-action="use-coupon" data-code="${coupon.code}">Usar na sacola</button>
            </article>`
          )
          .join("")}
      </div>
    `;
  }

  function viewAddresses() {
    if (!state.logged) return needLogin("Os endereços ficam na conta de demonstração.");
    return `
      <section class="greet"><h1>Endereços</h1><p>Escolha onde a entrega simulada chega.</p></section>
      ${state.addresses
        .map(
          (address) => `
          <article class="card" style="margin-bottom:10px">
            <div class="spread">
              <h3>${esc(address.label)}</h3>
              <span class="small">${address.id === state.selectedAddressId ? "Em uso" : ""}</span>
            </div>
            <p>${esc(addressLine(address))}</p>
            <p class="small muted">${esc(address.city)}${address.reference ? " · " + esc(address.reference) : ""}</p>
            <div class="row-btns" style="margin-top:10px">
              <button class="btn" type="button" data-action="addr" data-id="${address.id}">Usar este</button>
              <button class="btn btn--ghost" type="button" data-action="remove-address" data-id="${address.id}">Excluir</button>
            </div>
          </article>`
        )
        .join("")}
      <form id="address-form" class="card form-grid">
        <h3 class="full">Novo endereço</h3>
        <label class="field">Apelido<input class="input" name="label" required placeholder="Casa, trabalho..."></label>
        <label class="field">Cidade<input class="input" name="city" value="São Paulo" required></label>
        <label class="field full">Rua<input class="input" name="street" required></label>
        <label class="field">Número<input class="input" name="number" required></label>
        <label class="field">Complemento<input class="input" name="complement"></label>
        <label class="field">Bairro<input class="input" name="neighborhood" required></label>
        <label class="field">Referência<input class="input" name="reference"></label>
        <button class="btn full" type="submit">Salvar endereço</button>
      </form>
    `;
  }

  function viewPayments() {
    if (!state.logged) return needLogin("Os cartões de demonstração ficam na sua conta local.");
    const pay = selectedPayment();
    return `
      <section class="greet"><h1>Pagamentos</h1><p>Nada é enviado para um banco. O CVV não é guardado.</p></section>
      ${allPayments()
        .map(
          (method) => `
          <article class="select-card ${method.id === pay.id ? "is-on" : ""}">
            <button type="button" data-action="pay" data-id="${method.id}" style="text-align:left">
              <strong>${esc(method.label)}</strong>
              <small style="display:block">${esc(method.detail)}</small>
            </button>
            ${method.type === "credit" ? `<button type="button" data-action="remove-card" data-id="${method.id}">Excluir</button>` : ""}
          </article>`
        )
        .join("")}
      <form id="card-form" class="card" style="margin-top:12px">
        <h3>Adicionar cartão</h3>
        <label class="field">Nome impresso<input class="input" name="name" required autocomplete="off"></label>
        <label class="field">Número<input class="input" name="number" inputmode="numeric" required placeholder="Somente para ler os 4 finais" autocomplete="off"></label>
        <label class="field">Validade<input class="input" name="expiry" placeholder="MM/AA" required autocomplete="off"></label>
        <label class="field">CVV<input class="input" name="cvv" inputmode="numeric" required autocomplete="off"></label>
        <button class="btn" type="submit">Salvar final do cartão</button>
      </form>
    `;
  }

  function viewProfile() {
    if (!state.logged) return needLogin("Entre para ver o perfil de demonstração.");
    const links = [
      ["#/pedidos", "Meus pedidos"],
      ["#/favoritos", "Favoritos"],
      ["#/cupons", "Cupons"],
      ["#/enderecos", "Endereços"],
      ["#/pagamentos", "Pagamentos"],
      ["#/notificacoes", "Notificações"],
      ["#/ajuda", "Ajuda"],
    ];
    return `
      <section class="card">
        <div class="profile-head">
          <span class="avatar avatar--lg">${esc(firstName().slice(0, 1))}</span>
          <div><h2 style="font-family:var(--serif)">${esc(state.user.name)}</h2><p class="muted">${esc(state.user.email)}</p></div>
        </div>
        <div class="stats">
          <div class="stat"><strong>${state.orders.length}</strong><span>pedidos</span></div>
          <div class="stat"><strong>${state.favorites.length}</strong><span>favoritos</span></div>
          <div class="stat"><strong>${DB.coupons.length}</strong><span>cupons</span></div>
        </div>
        <form id="profile-form">
          <label class="field">Nome<input class="input" name="name" value="${esc(state.user.name)}" required></label>
          <label class="field">Telefone<input class="input" name="phone" value="${esc(state.user.phone)}" required></label>
          <button class="btn" type="submit">Salvar dados</button>
        </form>
      </section>
      <section class="card" style="margin-top:12px">
        ${links.map(([href, label]) => `<a class="link-row" href="${href}">${label}<span>›</span></a>`).join("")}
        <button class="link-row" type="button" data-action="logout">Sair<span>›</span></button>
      </section>
      <p class="footer-note">Conta fictícia, salva só neste navegador.</p>
    `;
  }

  function viewNotifications() {
    if (!state.logged) return needLogin("As preferências ficam na conta local.");
    const rows = [
      ["orders", "Status do pedido", "Aviso quando a etapa muda nesta demonstração."],
      ["promos", "Promoções", "Cupons e frete grátis das lojas."],
      ["email", "E-mail", "Resumo que não sai deste navegador."],
    ];
    return `
      <section class="greet"><h1>Notificações</h1><p>Os interruptores ficam salvos aqui. Nenhum alerta real é enviado.</p></section>
      <section class="card">
        ${rows
          .map(
            ([key, title, text]) => `
            <label class="switch">
              <span><strong>${title}</strong><small class="muted" style="display:block">${text}</small></span>
              <input type="checkbox" data-notify="${key}" ${state.notifications[key] ? "checked" : ""}>
            </label>`
          )
          .join("")}
      </section>
    `;
  }

  function viewHelp() {
    return `
      <section class="greet"><h1>Ajuda</h1><p>Dúvidas sobre esta demonstração.</p></section>
      <section class="card">
        ${DB.faqs
          .map(
            (faq) => `
            <article class="faq-item">
              <button type="button" data-action="faq" data-id="${faq.id}" aria-expanded="${state.faqOpen === faq.id}">
                ${esc(faq.q)} <span>${state.faqOpen === faq.id ? "−" : "+"}</span>
              </button>
              ${state.faqOpen === faq.id ? `<p>${esc(faq.a)}</p>` : ""}
            </article>`
          )
          .join("")}
      </section>
      <section class="card" style="margin-top:12px">
        <h3>Falar com o suporte</h3>
        <p class="muted">Canal ilustrativo. A mensagem não é enviada.</p>
        <button class="btn" style="margin-top:10px" type="button" data-action="demo-lock" data-msg="Demonstração: nenhuma mensagem foi enviada.">Abrir conversa</button>
      </section>
    `;
  }

  function viewAuth() {
    const register = state.authMode === "register";
    return `
      <section class="auth">
        <div class="auth__story">
          <p>SaborJá</p>
          <h1>Comida boa, na sua porta.</h1>
          <p>Um trabalho de interface, com lojas, cardápio e entrega simulada.</p>
        </div>
        <form id="auth-form" class="card">
          <div class="tabs">
            <button type="button" class="${register ? "" : "is-on"}" data-action="auth-mode" data-mode="login">Entrar</button>
            <button type="button" class="${register ? "is-on" : ""}" data-action="auth-mode" data-mode="register">Criar conta</button>
          </div>
          ${register ? `<label class="field">Nome<input class="input" name="name" required placeholder="Seu nome"></label>` : ""}
          <label class="field">E-mail<input class="input" name="email" type="email" required value="${esc(state.user.email || "")}"></label>
          <label class="field">Senha<input class="input" name="password" type="password" required minlength="4" placeholder="Mínimo de 4 caracteres"></label>
          <button class="btn" type="submit">${register ? "Criar conta" : "Entrar"}</button>
          <p class="footer-note">A senha não é armazenada. Serve só para passar desta tela.</p>
        </form>
      </section>
    `;
  }

  function viewMissing() {
    return `<div class="empty card"><strong>Não encontramos essa tela</strong><p class="muted">O link pode ter ficado para trás.</p><a class="btn" style="margin-top:14px" href="#/inicio">Voltar ao início</a></div>`;
  }

  function viewHTML() {
    const current = route();
    switch (current.name) {
      case "inicio":
        return viewHome();
      case "busca":
        return viewSearch("");
      case "categorias":
        return viewCategories();
      case "categoria":
        return viewSearch(current.parts[0]);
      case "restaurante":
        return viewRestaurant(current.parts[0]);
      case "prato":
        return viewItem(current.parts[0], current.parts[1]);
      case "carrinho":
        return viewCart();
      case "checkout":
        return viewCheckout();
      case "acompanhar":
        return viewTrack(current.parts[0]);
      case "pedidos":
        return viewOrders();
      case "favoritos":
        return viewFavorites();
      case "cupons":
        return viewCoupons();
      case "enderecos":
        return viewAddresses();
      case "pagamentos":
        return viewPayments();
      case "perfil":
        return viewProfile();
      case "notificacoes":
        return viewNotifications();
      case "ajuda":
        return viewHelp();
      case "entrar":
        return viewAuth();
      default:
        return viewMissing();
    }
  }

  function bagHTML() {
    const bill = totals();
    if (!bill.restaurant || !state.cart.items.length) {
      return `<div class="bag-box"><h2>Sacola</h2><p class="muted">Escolha uma loja para começar.</p><a class="btn" style="margin-top:12px" href="#/inicio">Ver lojas</a></div>`;
    }
    return `
      <div class="bag-box">
        <h2>Sacola</h2>
        <p class="small muted">${esc(bill.restaurant.name)}</p>
        ${state.cart.items
          .map((line) => `<div class="mini-line"><span>${line.qty}× ${esc(line.name)}</span><span>${money(line.price * line.qty)}</span></div>`)
          .join("")}
        ${summaryHTML()}
        <a class="btn" href="#/carrinho">Ver sacola</a>
      </div>
    `;
  }

  function renderModal() {
    const root = document.getElementById("modal");
    if (!state.modal) {
      root.hidden = true;
      root.innerHTML = "";
      return;
    }
    const modal = state.modal;
    root.hidden = false;
    root.innerHTML = `
      <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h3 id="modal-title">${esc(modal.title)}</h3>
        <p>${esc(modal.text)}</p>
        <div class="row-btns">
          <button class="btn btn--ghost" type="button" data-action="modal-cancel">${esc(modal.cancel || "Cancelar")}</button>
          <button class="btn" type="button" data-action="modal-ok">${esc(modal.ok || "Confirmar")}</button>
        </div>
      </div>`;
  }

  function render() {
    const current = route();
    const same = lastKey === current.key;
    const y = window.scrollY;
    if (!same) state.modal = null;
    document.body.classList.toggle("is-auth", current.name === "entrar");
    const hidePanel = ["carrinho", "checkout", "entrar", "acompanhar"].includes(current.name);
    document.body.classList.toggle("no-panel", hidePanel);
    document.getElementById("sidebar").innerHTML = sidebarHTML();
    document.getElementById("header").innerHTML = headerHTML();
    document.getElementById("main").innerHTML = viewHTML();
    document.getElementById("bag").innerHTML = bagHTML();
    document.getElementById("tabbar").innerHTML = tabbarHTML();
    const bill = totals();
    const showFloat = cartCount() > 0 && !["carrinho", "checkout", "entrar", "acompanhar"].includes(current.name);
    document.body.classList.toggle("has-float", showFloat);
    const float = document.getElementById("cart-float");
    float.hidden = !showFloat;
    if (showFloat) {
      float.innerHTML = `<span>Ver sacola · ${cartCount()}</span><em>${money(bill.total)}</em>`;
    }
    document.title = `${titles(current.name)} — SaborJá`;
    shownHash = location.hash;
    renderModal();
    if (same) window.scrollTo(0, y);
    else window.scrollTo(0, 0);
    if ((!same && current.name === "busca") || state.focusSearch) {
      const input = document.getElementById("q");
      if (input) input.focus();
      state.focusSearch = false;
    }
    lastKey = current.key;
    if (!same) armReveal(document.getElementById("main"));
  }

  function paintSearch() {
    const box = document.getElementById("search-dynamic");
    if (!box) return;
    const category = route().name === "categoria" ? route().parts[0] : "";
    box.innerHTML = searchDynamicHTML(category);
  }

  function paintItemPrice() {
    const current = route();
    const found = findItem(current.parts[0], current.parts[1]);
    const price = document.getElementById("buy-price");
    if (!found || !price || !state.draft) return;
    price.textContent = money(draftUnit(found.item) * state.draft.qty);
  }

  function lineSignature(line) {
    const opts = (line.options || []).map((option) => option.id).join("|");
    return `${line.itemId}|${opts}|${line.note || ""}`;
  }

  function pushLine(line) {
    if (!state.cart.restaurantId) state.cart.restaurantId = line.restaurantId;
    const existing = state.cart.items.find((item) => lineSignature(item) === lineSignature(line));
    if (existing) existing.qty += line.qty;
    else state.cart.items.push({ ...line, uid: uid() });
    persist();
  }

  function collectOptions(item) {
    const chosen = [];
    const missing = [];
    (item.options || []).forEach((group) => {
      const ids = (state.draft && state.draft.options[group.id]) || [];
      if (group.required && ids.length < 1) missing.push(group.name);
      ids.forEach((id) => {
        const choice = group.choices.find((entry) => entry.id === id);
        if (choice) {
          chosen.push({
            id: `${group.id}:${choice.id}`,
            group: group.name,
            name: choice.name,
            price: choice.price || 0,
          });
        }
      });
    });
    return { chosen, missing };
  }

  function addCurrentItem() {
    const current = route();
    const found = findItem(current.parts[0], current.parts[1]);
    if (!found || !state.draft) return;
    if (!found.restaurant.open) return toast("Esta loja está fechada.");
    const { chosen, missing } = collectOptions(found.item);
    if (missing.length) return toast(`Escolha: ${missing.join(", ")}`);
    const line = {
      restaurantId: found.restaurant.id,
      itemId: found.item.id,
      name: found.item.name,
      qty: state.draft.qty,
      price: draftUnit(found.item),
      options: chosen,
      note: (state.draft.note || "").trim(),
    };
    if (state.cart.items.length && state.cart.restaurantId && state.cart.restaurantId !== line.restaurantId) {
      const other = getRestaurant(state.cart.restaurantId);
      state.modal = {
        type: "replace-cart",
        line,
        title: "Trocar de loja?",
        text: `Sua sacola está com itens de ${other ? other.name : "outra loja"}. Para continuar, ela será esvaziada.`,
        ok: "Esvaziar e adicionar",
      };
      renderModal();
      return;
    }
    pushLine(line);
    toast("Adicionado à sacola");
    go(`#/restaurante/${found.restaurant.id}`);
  }

  function rememberSearch(query) {
    const clean = query.trim();
    if (clean.length < 2) return;
    state.recentSearches = [clean, ...state.recentSearches.filter((item) => norm(item) !== norm(clean))].slice(0, 6);
    persist();
  }

  function placeOrder() {
    if (!state.logged) return go("#/entrar");
    const bill = totals();
    if (!bill.restaurant || !state.cart.items.length) return toast("Sacola vazia.");
    if (!bill.restaurant.open) return toast("A loja está fechada.");
    if (bill.subtotal < bill.restaurant.min) return toast("Ainda não chegou no pedido mínimo.");
    const address = selectedAddress();
    if (!address) return toast("Cadastre um endereço.");
    const payment = selectedPayment();
    let changeFor = null;
    if (payment.id === "cash" && String(state.cart.change || "").trim()) {
      const raw = String(state.cart.change).replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
      const value = Number(raw);
      if (!Number.isFinite(value)) return toast("Valor de troco inválido.");
      if (value < bill.total) return toast("O troco precisa cobrir o total.");
      changeFor = value;
    }
    const order = {
      id: `SJ${Math.floor(10000 + Math.random() * 89999)}`,
      restaurantId: bill.restaurant.id,
      restaurantName: bill.restaurant.name,
      items: state.cart.items.map((item) => ({ ...item })),
      addressText: addressLine(address),
      paymentLabel: payment.detail ? `${payment.label} · ${payment.detail}` : payment.label,
      subtotal: bill.subtotal,
      delivery: bill.delivery,
      discount: bill.discount,
      total: bill.total,
      couponCode: bill.discount ? bill.coupon.code : "",
      createdAt: Date.now(),
      rated: 0,
      instructions: state.cart.instructions || "",
      changeFor,
    };
    state.orders.unshift(order);
    state.cart = { restaurantId: null, items: [], couponCode: "", couponDraft: "", instructions: "", change: "" };
    persist();
    toast("Pedido confirmado na simulação");
    go(`#/acompanhar/${order.id}`);
  }

  function applyCoupon(code) {
    const clean = String(code || "").trim().toUpperCase();
    const coupon = DB.coupons.find((item) => item.code === clean);
    if (!coupon) return toast("Cupom não encontrado.");
    state.cart.couponCode = coupon.code;
    state.cart.couponDraft = coupon.code;
    persist();
    const subtotal = cartSubtotal();
    if (!subtotal) toast(`${coupon.code} guardado. Ele entra quando houver itens na sacola.`);
    else if (subtotal < coupon.min) toast(`Cupom guardado. Pedido mínimo de ${money(coupon.min)}.`);
    else toast("Cupom aplicado.");
    render();
  }

  const actions = {
    back() {
      if (history.length > 1) history.back();
      else go("#/inicio");
    },
    go(el) {
      go(el.dataset.href);
    },
    fav(el) {
      const id = el.dataset.id;
      const has = state.favorites.includes(id);
      state.favorites = has ? state.favorites.filter((item) => item !== id) : state.favorites.concat(id);
      persist();
      toast(has ? "Removido dos favoritos" : "Salvo nos favoritos");
      render();
    },
    filter(el) {
      const key = el.dataset.key;
      state[key] = !state[key];
      if (route().name === "busca" || route().name === "categoria") state.focusSearch = true;
      render();
    },
    "quick-search"(el) {
      state.query = el.dataset.q || "";
      state.focusSearch = true;
      rememberSearch(state.query);
      render();
    },
    "clear-search"() {
      state.query = "";
      const input = document.getElementById("q");
      if (input) input.value = "";
      const clear = document.getElementById("clear-q");
      if (clear) clear.hidden = true;
      paintSearch();
      if (input) input.focus();
    },
    jump(el) {
      const target = document.getElementById(el.dataset.target);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    tab(el) {
      state.menuTab = el.dataset.tab;
      render();
    },
    "qty-item"(el) {
      if (!state.draft) return;
      const dir = Number(el.dataset.dir);
      state.draft.qty = Math.min(20, Math.max(1, state.draft.qty + dir));
      const label = document.getElementById("qty-val");
      if (label) label.textContent = String(state.draft.qty);
      paintItemPrice();
    },
    "add-item": addCurrentItem,
    "qty-line"(el) {
      const line = state.cart.items.find((item) => item.uid === el.dataset.uid);
      if (!line) return;
      line.qty = Math.min(20, line.qty + Number(el.dataset.dir));
      if (line.qty < 1) state.cart.items = state.cart.items.filter((item) => item.uid !== line.uid);
      if (!state.cart.items.length) state.cart.restaurantId = null;
      persist();
      render();
    },
    "remove-line"(el) {
      state.cart.items = state.cart.items.filter((item) => item.uid !== el.dataset.uid);
      if (!state.cart.items.length) state.cart.restaurantId = null;
      persist();
      render();
    },
    "clear-cart"() {
      state.modal = {
        type: "clear-cart",
        title: "Esvaziar sacola?",
        text: "Os itens desta loja saem da sacola.",
        ok: "Esvaziar",
      };
      renderModal();
    },
    "remove-coupon"() {
      state.cart.couponCode = "";
      persist();
      render();
    },
    "use-coupon"(el) {
      applyCoupon(el.dataset.code);
    },
    addr(el) {
      state.selectedAddressId = el.dataset.id;
      persist();
      toast("Endereço selecionado");
      render();
    },
    pay(el) {
      state.selectedPaymentId = el.dataset.id;
      persist();
      render();
    },
    "remove-card"(el) {
      state.cards = state.cards.filter((card) => card.id !== el.dataset.id);
      if (state.selectedPaymentId === el.dataset.id) state.selectedPaymentId = "pix";
      persist();
      render();
    },
    "remove-address"(el) {
      if (state.addresses.length < 2) return toast("Deixe pelo menos um endereço.");
      state.addresses = state.addresses.filter((address) => address.id !== el.dataset.id);
      if (!state.addresses.some((address) => address.id === state.selectedAddressId)) {
        state.selectedAddressId = state.addresses[0].id;
      }
      persist();
      render();
    },
    place: placeOrder,
    reorder(el) {
      const order = state.orders.find((item) => item.id === el.dataset.id);
      const restaurant = order && getRestaurant(order.restaurantId);
      if (!order || !restaurant) return toast("Essa loja não está mais no cardápio.");
      if (!restaurant.open) return toast("A loja está fechada agora.");
      state.cart = {
        restaurantId: order.restaurantId,
        items: order.items.map((item) => ({ ...item, options: (item.options || []).map((option) => ({ ...option })), uid: uid() })),
        couponCode: "",
        couponDraft: "",
        instructions: "",
        change: "",
      };
      persist();
      toast("Itens colocados na sacola");
      go("#/carrinho");
    },
    rate(el) {
      const order = state.orders.find((item) => item.id === el.dataset.order);
      if (!order) return;
      order.rated = Number(el.dataset.star);
      persist();
      toast("Avaliação salva nesta demonstração");
      render();
    },
    faq(el) {
      state.faqOpen = state.faqOpen === el.dataset.id ? "" : el.dataset.id;
      render();
    },
    "auth-mode"(el) {
      state.authMode = el.dataset.mode;
      render();
    },
    logout() {
      state.modal = {
        type: "logout",
        title: "Sair da conta?",
        text: "Os pedidos de demonstração continuam salvos neste navegador.",
        ok: "Sair",
      };
      renderModal();
    },
    "demo-lock"(el) {
      toast(el.dataset.msg || "Indisponível nesta demonstração.");
    },
    "modal-cancel"() {
      state.modal = null;
      renderModal();
    },
    "modal-ok"() {
      const modal = state.modal;
      state.modal = null;
      if (!modal) return;
      if (modal.type === "replace-cart") {
        state.cart.items = [];
        state.cart.restaurantId = null;
        pushLine(modal.line);
        toast("Sacola atualizada");
        go(`#/restaurante/${modal.line.restaurantId}`);
        return;
      }
      if (modal.type === "clear-cart") {
        state.cart = { restaurantId: null, items: [], couponCode: "", couponDraft: "", instructions: "", change: "" };
        persist();
        toast("Sacola esvaziada");
      }
      if (modal.type === "logout") {
        state.logged = false;
        persist();
        go("#/entrar");
        return;
      }
      render();
    },
  };

  document.addEventListener("click", (event) => {
    const el = event.target.closest("[data-action]");
    if (el && !el.disabled) {
      const fn = actions[el.dataset.action];
      if (fn) {
        event.preventDefault();
        fn(el, event);
        return;
      }
    }
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest("a[href^='#/']");
    if (!link) return;
    event.preventDefault();
    go(link.getAttribute("href"));
  });

  document.addEventListener("input", (event) => {
    const target = event.target;
    if (target.id === "q") {
      state.query = target.value;
      const clear = document.getElementById("clear-q");
      if (clear) clear.hidden = !target.value;
      paintSearch();
    }
    if (target.id === "item-note" && state.draft) state.draft.note = target.value;
    if (target.id === "instructions") state.cart.instructions = target.value;
    if (target.id === "change-for") state.cart.change = target.value;
    if (target.id === "coupon-draft") state.cart.couponDraft = target.value;
  });

  document.addEventListener("change", (event) => {
    const target = event.target;
    if (target.id === "sort") {
      state.sort = target.value;
      state.focusSearch = true;
      render();
      return;
    }
    if (target.dataset.notify) {
      state.notifications[target.dataset.notify] = target.checked;
      persist();
      toast(target.checked ? "Aviso ligado" : "Aviso desligado");
      return;
    }
    if (!target.dataset.group || !state.draft) return;
    const current = route();
    const found = findItem(current.parts[0], current.parts[1]);
    if (!found) return;
    const group = (found.item.options || []).find((entry) => entry.id === target.dataset.group);
    if (!group) return;
    if (target.type === "radio") state.draft.options[group.id] = [target.value];
    if (target.type === "checkbox") {
      const selected = [...document.querySelectorAll(`input[data-group="${group.id}"]:checked`)].map((input) => input.value);
      if (group.max && selected.length > group.max) {
        target.checked = false;
        toast(`Escolha no máximo ${group.max}`);
        return;
      }
      state.draft.options[group.id] = [...document.querySelectorAll(`input[data-group="${group.id}"]:checked`)].map((input) => input.value);
    }
    paintItemPrice();
  });

  document.addEventListener("submit", (event) => {
    const form = event.target;
    if (form.id === "coupon-form") {
      event.preventDefault();
      const field = document.getElementById("coupon-draft");
      applyCoupon((field && field.value) || state.cart.couponDraft);
      return;
    }
    if (form.id === "address-form") {
      event.preventDefault();
      const data = new FormData(form);
      const address = {
        id: uid(),
        label: String(data.get("label") || "").trim(),
        street: String(data.get("street") || "").trim(),
        number: String(data.get("number") || "").trim(),
        complement: String(data.get("complement") || "").trim(),
        neighborhood: String(data.get("neighborhood") || "").trim(),
        city: String(data.get("city") || "").trim(),
        reference: String(data.get("reference") || "").trim(),
      };
      if (!address.label || !address.street || !address.number || !address.neighborhood) {
        toast("Preencha apelido, rua, número e bairro.");
        return;
      }
      state.addresses.push(address);
      state.selectedAddressId = address.id;
      persist();
      toast("Endereço salvo");
      render();
      return;
    }
    if (form.id === "card-form") {
      event.preventDefault();
      const data = new FormData(form);
      const digits = String(data.get("number") || "").replace(/\D/g, "");
      const expiry = String(data.get("expiry") || "").trim();
      const name = String(data.get("name") || "").trim();
      if (digits.length < 13 || !expiry.includes("/") || name.length < 3) {
        toast("Confira nome, número e validade.");
        return;
      }
      const brand = digits.startsWith("4") ? "Visa" : digits.startsWith("5") ? "Mastercard" : "Cartão";
      const card = { id: uid(), brand, last4: digits.slice(-4), name };
      state.cards.push(card);
      state.selectedPaymentId = card.id;
      persist();
      toast("Salvamos só os 4 finais. O CVV foi descartado.");
      render();
      return;
    }
    if (form.id === "profile-form") {
      event.preventDefault();
      const data = new FormData(form);
      state.user.name = String(data.get("name") || "").trim() || state.user.name;
      state.user.phone = String(data.get("phone") || "").trim();
      persist();
      toast("Dados atualizados");
      render();
      return;
    }
    if (form.id === "auth-form") {
      event.preventDefault();
      const data = new FormData(form);
      const email = String(data.get("email") || "").trim();
      const password = String(data.get("password") || "");
      const name = String(data.get("name") || "").trim();
      if (!email.includes("@") || password.length < 4) {
        toast("Use um e-mail válido e uma senha de 4 ou mais caracteres.");
        return;
      }
      if (state.authMode === "register" && name.length < 2) {
        toast("Informe seu nome para criar a conta.");
        return;
      }
      if (state.authMode === "register") state.user.name = name;
      state.user.email = email;
      state.logged = true;
      persist();
      toast("Você entrou");
      go("#/inicio");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.modal) {
      state.modal = null;
      renderModal();
    }
    if (event.key === "Enter" && event.target.id === "q") {
      rememberSearch(state.query);
    }
  });

  setInterval(() => {
    const live = document.getElementById("track-live");
    if (!live || route().name !== "acompanhar") return;
    const order = state.orders.find((item) => item.id === route().parts[0]);
    if (!order) return;
    const now = String(statusIndex(order));
    if (live.dataset.status === now) return;
    live.dataset.status = now;
    live.innerHTML = trackLiveInner(order);
  }, 1000);

  let introDone = false;
  let revealIO = null;
  const revealQueue = [];
  const REVEAL_SELECTOR = ".greet, .searchbar, .section-head, .chips, .footer-note, .banner, .cat, .rcard, .dish-card, .ticket, .card, .dish, .review, .opt, .select-card, .faq-item, .empty, .store__cover, .store__sheet, .prato__hero, .auth__story, .cat-tile, .link-row, .switch, .sortbar, .closed-banner";

  function motionOk() {
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function getRevealIO() {
    if (!revealIO) {
      revealIO = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          revealIO.unobserve(entry.target);
          const node = entry.target;
          const clear = (event) => {
            if (event.target !== node || event.animationName !== "float-in") return;
            node.removeEventListener("animationend", clear);
            node.classList.remove("reveal", "is-in");
          };
          node.addEventListener("animationend", clear);
        });
      }, { threshold: 0.08, rootMargin: "0px 0px -24px 0px" });
    }
    return revealIO;
  }

  function armReveal(root) {
    if (!root || !motionOk()) return;
    [...root.querySelectorAll(REVEAL_SELECTOR)].forEach((el, index) => {
      if (el.classList.contains("reveal") || el.classList.contains("is-shown")) return;
      el.classList.add("reveal");
      el.style.setProperty("--reveal-delay", `${(index % 5) * 80}ms`);
      if (introDone) getRevealIO().observe(el);
      else revealQueue.push(el);
    });
  }

  function startReveal() {
    introDone = true;
    if (!motionOk()) {
      revealQueue.length = 0;
      return;
    }
    const io = getRevealIO();
    revealQueue.splice(0).forEach((el) => {
      if (el.isConnected) io.observe(el);
    });
  }

  let loaderGone = false;
  function closeLoader() {
    if (loaderGone) return;
    loaderGone = true;
    const loader = document.getElementById("loader");
    const finish = () => {
      if (introDone) return;
      if (loader && loader.isConnected) loader.remove();
      document.body.classList.remove("is-loading");
      startReveal();
    };
    if (!loader) {
      finish();
      return;
    }
    loader.classList.add("is-out");
    loader.addEventListener("transitionend", finish, { once: true });
    setTimeout(finish, 700);
  }

  let loaderScheduled = false;
  function bootLoader() {
    if (loaderScheduled) return;
    loaderScheduled = true;
    const started = performance.now();
    const open = () => {
      const wait = Math.max(0, 1500 - (performance.now() - started));
      setTimeout(closeLoader, wait);
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(open);
    else open();
    setTimeout(open, 2200);
  }

  function onHistory() {
    if ((location.hash || "#/inicio") === shownHash) return;
    render();
  }

  window.addEventListener("hashchange", onHistory);
  window.addEventListener("popstate", onHistory);
  if (!location.hash) history.replaceState(null, "", "#/inicio");
  render();
  bootLoader();
})();
