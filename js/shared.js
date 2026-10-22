(function () {
  const KEY = "saborja-state-v1";
  const DB = window.DB;
  const STEP_MS = 8000;
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
  const BASE_PAYMENTS = [
    { id: "pix", type: "pix", label: "Pix", detail: "Aprovação imediata nesta simulação" },
    { id: "vr", type: "vr", label: "Vale-refeição", detail: "Sabor Card •••• 9088" },
    { id: "cash", type: "cash", label: "Dinheiro", detail: "Pagamento na entrega" },
  ];

  const url = {
    home: "index.html",
    busca: "busca.html",
    categorias: "categorias.html",
    carrinho: "carrinho.html",
    checkout: "checkout.html",
    pedidos: "pedidos.html",
    favoritos: "favoritos.html",
    cupons: "cupons.html",
    enderecos: "enderecos.html",
    pagamentos: "pagamentos.html",
    perfil: "perfil.html",
    ajuda: "ajuda.html",
    entrar: "entrar.html",
    notificacoes: "notificacoes.html",
    categoria: (id) => `busca.html?cat=${encodeURIComponent(id)}`,
    restaurante: (id) => `restaurante.html?id=${encodeURIComponent(id)}`,
    prato: (loja, item) => `prato.html?loja=${encodeURIComponent(loja)}&item=${encodeURIComponent(item)}`,
    acompanhar: (id) => `acompanhar.html?id=${encodeURIComponent(id)}`,
  };

  const qs = new URLSearchParams(location.search);
  function q(name) {
    return qs.get(name) || "";
  }

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
      grid: `<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>`,
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

  function imgTag(src, alt, className, eager) {
    return `<img class="${className || ""}" src="${esc(src)}" alt="${esc(alt)}" loading="${eager ? "eager" : "lazy"}" decoding="async" onerror="this.remove()">`;
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

  function seedOrder() {
    return {
      id: "SJ10482",
      restaurantId: "forno-alto",
      restaurantName: "Forno Alto",
      items: [{
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
      }],
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
        { id: "casa", label: "Casa", street: "Rua Harmonia", number: "418", complement: "ap. 12", neighborhood: "Vila Madalena", city: "São Paulo", reference: "Portão verde" },
        { id: "trabalho", label: "Trabalho", street: "Av. das Palmeiras", number: "900", complement: "conjunto 4", neighborhood: "Pinheiros", city: "São Paulo", reference: "Recepção do térreo" },
      ],
      selectedAddressId: "casa",
      cards: [{ id: "card-visa", brand: "Visa", last4: "4421", name: "Ana Alves" }],
      selectedPaymentId: "pix",
      notifications: { orders: true, promos: true, email: false },
      user: { name: "Ana Alves", email: "ana.alves@email.com", phone: "(11) 98821-4400" },
      logged: true,
      recentSearches: ["pizza", "açaí"],
      onlyFree: false,
      onlyTop: false,
      onlyOpen: false,
      sort: "relevancia",
      query: "",
      menuTab: "cardapio",
      draft: null,
      faqOpen: "",
      authMode: "login",
      modal: null,
    };
  }

  function loadState() {
    const base = defaultState();
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "null");
      const keys = ["cart", "favorites", "orders", "addresses", "selectedAddressId", "cards", "selectedPaymentId", "notifications", "user", "logged", "recentSearches", "onlyFree", "onlyTop", "onlyOpen", "sort"];
      if (saved && typeof saved === "object") {
        keys.forEach((key) => {
          if (saved[key] !== undefined) base[key] = saved[key];
        });
      }
    } catch (error) {
      /* armazenamento antigo ou bloqueado */
    }
    if (!base.cart || !base.cart.items) base.cart = defaultState().cart;
    if (base.user && base.user.name === "Marina Alves") {
      base.user.name = "Ana Alves";
      if (base.user.email === "marina.alves@email.com") base.user.email = "ana.alves@email.com";
    }
    (base.cards || []).forEach((card) => {
      if (card.name === "Marina Alves") card.name = "Ana Alves";
    });
    const ids = new Set(DB.restaurants.map((restaurant) => restaurant.id));
    if (!base.cart.restaurantId || !ids.has(base.cart.restaurantId)) {
      base.cart = defaultState().cart;
    }
    base.favorites = (base.favorites || []).filter((id) => ids.has(id));
    if (!base.favorites.length) base.favorites = ["hana-sushi", "raiz-verde"];
    return base;
  }

  const state = loadState();
  let page = "inicio";
  let pageRender = function () { return ""; };
  let pageActions = {};
  let toastTimer = 0;
  const TITLES = {
    inicio: "Início",
    busca: "Busca",
    categorias: "Categorias",
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
  };

  function persist() {
    localStorage.setItem(KEY, JSON.stringify({
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
      onlyFree: state.onlyFree,
      onlyTop: state.onlyTop,
      onlyOpen: state.onlyOpen,
      sort: state.sort,
    }));
  }

  function toast(message) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 2400);
  }

  function firstName() {
    return (state.user.name || "visitante").split(" ")[0];
  }

  function greet() {
    const hour = new Date().getHours();
    const hello = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
    return state.logged ? `${hello}, ${firstName()}` : hello;
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

  function appliedCoupon() {
    if (!state.cart.couponCode) return null;
    return DB.coupons.find((coupon) => coupon.code === state.cart.couponCode) || null;
  }

  function totals() {
    const restaurant = getRestaurant(state.cart.restaurantId);
    const subtotal = cartSubtotal();
    const delivery = restaurant && subtotal > 0 ? restaurant.fee : 0;
    const coupon = appliedCoupon();
    let discount = 0;
    let couponNote = "";
    if (coupon && subtotal > 0) {
      if (subtotal < coupon.min) couponNote = `Faltam ${money(coupon.min - subtotal)} para usar ${coupon.code}.`;
      else if (coupon.type === "shipping") discount = delivery;
      else if (coupon.type === "percent") discount = Math.min(coupon.cap, subtotal * coupon.percent);
      else if (coupon.type === "fixed") discount = Math.min(coupon.amount, subtotal);
    }
    const total = Math.max(0, subtotal + delivery - discount);
    return { restaurant, subtotal, delivery, discount, total, coupon, couponNote };
  }

  function statusIndex(order) {
    return Math.max(0, Math.min(3, Math.floor((Date.now() - order.createdAt) / STEP_MS)));
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

  function sectionKey() {
    if (page === "busca") return "busca";
    if (page === "restaurante" || page === "prato" || page === "inicio") return "inicio";
    if (page === "checkout" || page === "carrinho") return "carrinho";
    if (page === "acompanhar") return "pedidos";
    if (page === "notificacoes" || page === "entrar") return "perfil";
    return page;
  }

  function tabKey() {
    if (["enderecos", "pagamentos", "notificacoes", "perfil", "entrar"].includes(page)) return "perfil";
    if (page === "acompanhar" || page === "pedidos") return "pedidos";
    if (page === "busca") return "busca";
    if (page === "favoritos") return "favoritos";
    if (["inicio", "restaurante", "prato", "categorias"].includes(page)) return "inicio";
    return "";
  }

  function navLink(href, label, iconName, key, count) {
    const on = sectionKey() === key;
    return `<a class="nav-link ${on ? "is-active" : ""}" href="${href}" ${on ? 'aria-current="page"' : ""}>${icon(iconName)}<span>${label}</span>${count ? `<em>${count}</em>` : ""}</a>`;
  }

  function sidebarHTML() {
    const count = cartCount();
    return `
      <a class="brand" href="${url.home}"><span class="brand__mark">Sj</span><span><strong>SaborJá</strong><small>delivery de comida</small></span></a>
      <p class="nav-label">Explorar</p>
      ${navLink(url.home, "Início", "home", "inicio")}
      ${navLink(url.busca, "Busca", "search", "busca")}
      ${navLink(url.categorias, "Categorias", "grid", "categorias")}
      <p class="nav-label">Pedidos</p>
      ${navLink(url.carrinho, "Sacola", "bag", "carrinho", count || "")}
      ${navLink(url.pedidos, "Meus pedidos", "orders", "pedidos")}
      <p class="nav-label">Conta</p>
      ${navLink(url.favoritos, "Favoritos", "heart", "favoritos")}
      ${navLink(url.cupons, "Cupons", "tag", "cupons")}
      ${navLink(url.enderecos, "Endereços", "pin", "enderecos")}
      ${navLink(url.pagamentos, "Pagamentos", "card", "pagamentos")}
      ${navLink(url.perfil, "Perfil", "user", "perfil")}
      ${navLink(url.ajuda, "Ajuda", "help", "ajuda")}`;
  }

  function headerHTML() {
    const simple = ["inicio", "busca", "categorias", "entrar"].includes(page);
    const address = selectedAddress();
    let center = `<p class="header__title">${esc(TITLES[page] || "SaborJá")}</p>`;
    if (page === "inicio") {
      center = `<a class="address-chip" href="${url.enderecos}"><small>Entregar em</small><strong>${esc(address ? address.label + " · " + address.street : "Definir endereço")}</strong></a>`;
    } else if (typeof headerText === "function") {
      center = `<p class="header__title">${esc(headerText() || TITLES[page])}</p>`;
    }
    const count = cartCount();
    return `
      ${simple ? `<a class="header__brand" href="${url.home}"><i>Sj</i> SaborJá</a>` : `<button class="icon-round" type="button" data-action="back" aria-label="Voltar">${icon("back")}</button>`}
      <div class="header__center">${center}</div>
      ${state.logged ? "" : `<a class="btn-sm" href="${url.entrar}">Entrar</a>`}
      <a class="icon-round" href="${url.carrinho}" aria-label="Sacola">${icon("bag")}${count ? `<span class="bag-count">${count}</span>` : ""}</a>`;
  }

  let headerText = null;

  function tabbarHTML() {
    const key = tabKey();
    const tabs = [
      [url.home, "Início", "home", "inicio"],
      [url.busca, "Busca", "search", "busca"],
      [url.pedidos, "Pedidos", "orders", "pedidos"],
      [url.favoritos, "Favoritos", "heart", "favoritos"],
      [url.perfil, "Perfil", "user", "perfil"],
    ];
    return tabs.map(([href, label, iconName, id]) => {
      const on = key === id;
      return `<a href="${href}" class="${on ? "is-active" : ""}" ${on ? 'aria-current="page"' : ""}>${icon(iconName)}<span>${label}</span></a>`;
    }).join("");
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
      ${bill.couponNote ? `<p class="warn">${esc(bill.couponNote)}</p>` : ""}`;
  }

  function bagHTML() {
    const bill = totals();
    if (!bill.restaurant || !state.cart.items.length) {
      return `<div class="bag-box"><h2>Sacola</h2><p class="muted">Escolha uma loja para começar.</p><a class="btn" style="margin-top:12px" href="${url.home}">Ver lojas</a></div>`;
    }
    return `
      <div class="bag-box">
        <h2>Sacola</h2>
        <p class="small muted">${esc(bill.restaurant.name)}</p>
        ${state.cart.items.map((line) => `<div class="mini-line"><span>${line.qty}× ${esc(line.name)}</span><span>${money(line.price * line.qty)}</span></div>`).join("")}
        ${summaryHTML()}
        <a class="btn" href="${url.carrinho}">Ver sacola</a>
      </div>`;
  }

  function restaurantCard(restaurant) {
    const fav = state.favorites.includes(restaurant.id);
    return `
      <article class="rcard">
        <div class="rcard__media" style="background:${restaurant.color}">
          <a href="${url.restaurante(restaurant.id)}" aria-label="${esc(restaurant.name)}">${imgTag(restaurant.image, restaurant.name)}</a>
          ${restaurant.promo ? `<span class="pill">${esc(restaurant.promo)}</span>` : ""}
          ${restaurant.open ? "" : `<span class="pill pill--closed">Fechado</span>`}
          <button class="fav" type="button" data-action="fav" data-id="${restaurant.id}" aria-pressed="${fav}" aria-label="${fav ? "Remover dos favoritos" : "Salvar loja"}">${heart(fav)}</button>
        </div>
        <a class="rcard__body" href="${url.restaurante(restaurant.id)}">
          <div class="rcard__title"><h3>${esc(restaurant.name)}</h3><span class="rate"><span>★</span> ${rateNum(restaurant.rating)}</span></div>
          ${restaurant.celebrity ? `<p class="celeb">com ${esc(restaurant.celebrity)}</p>` : ""}
          <p class="small muted">${esc(restaurant.cuisine)} · ${esc(restaurant.distance)}</p>
          <p class="small">${esc(restaurant.time)} · ${feeText(restaurant)}${restaurant.open ? "" : " · " + esc(restaurant.closedMessage || "Fechado")}</p>
        </a>
      </article>`;
  }

  function dishCard(restaurant, item) {
    return `
      <a class="dish-card" href="${url.prato(restaurant.id, item.id)}">
        ${imgTag(item.image || restaurant.image, item.name)}
        <div><em>${esc(restaurant.celebrity || restaurant.name)}</em><strong>${esc(item.name)}</strong><span>${money(item.price)}</span></div>
      </a>`;
  }

  function chipsHTML() {
    const chips = [["onlyFree", "Frete grátis"], ["onlyTop", "Nota 4,7+"], ["onlyOpen", "Abertos agora"]];
    return `<div class="chips">${chips.map(([key, label]) => `<button class="chip ${state[key] ? "is-on" : ""}" type="button" data-action="filter" data-key="${key}">${label}</button>`).join("")}</div>`;
  }

  function timeNum(restaurant) {
    const match = String(restaurant.time).match(/\d+/);
    return match ? Number(match[0]) : 99;
  }

  function haystack(restaurant) {
    const dishes = restaurant.menu.flatMap((section) => section.items.map((item) => `${item.name} ${item.description}`)).join(" ");
    return norm([restaurant.name, restaurant.cuisine, restaurant.category, restaurant.keywords, dishes].join(" "));
  }

  function filterRestaurants({ category, query, useFilters }) {
    let list = DB.restaurants.slice();
    if (category && category !== "todos") list = list.filter((item) => item.category === category);
    if (useFilters && state.onlyFree) list = list.filter((item) => item.fee === 0);
    if (useFilters && state.onlyTop) list = list.filter((item) => item.rating >= 4.7);
    if (useFilters && state.onlyOpen) list = list.filter((item) => item.open);
    if (query) {
      const text = norm(query);
      list = list.filter((item) => haystack(item).includes(text));
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

  function missing(message) {
    return `<div class="empty card"><strong>${esc(message || "Não encontramos essa tela")}</strong><p class="muted">O link pode ter ficado para trás.</p><a class="btn" style="margin-top:14px" href="${url.home}">Voltar ao início</a></div>`;
  }

  function needLogin(text) {
    return `<div class="empty card"><strong>Entre para continuar</strong><p class="muted">${esc(text)}</p><a class="btn" style="margin-top:14px" href="${url.entrar}">Entrar</a></div>`;
  }

  function showModal() {
    const root = document.getElementById("modal");
    if (!root) return;
    if (!state.modal) {
      root.hidden = true;
      root.innerHTML = "";
      return;
    }
    const modal = state.modal;
    root.hidden = false;
    root.innerHTML = `
      <div class="dialog" role="dialog" aria-modal="true">
        <h3>${esc(modal.title)}</h3>
        <p>${esc(modal.text)}</p>
        <div class="row-btns">
          <button class="btn btn--ghost" type="button" data-action="modal-cancel">Cancelar</button>
          <button class="btn" type="button" data-action="modal-ok">${esc(modal.ok || "Confirmar")}</button>
        </div>
      </div>`;
  }

  function lineSignature(line) {
    return `${line.itemId}|${(line.options || []).map((option) => option.id).join("|")}|${line.note || ""}`;
  }

  function pushLine(line) {
    if (!state.cart.restaurantId) state.cart.restaurantId = line.restaurantId;
    const existing = state.cart.items.find((item) => lineSignature(item) === lineSignature(line));
    if (existing) existing.qty += line.qty;
    else state.cart.items.push({ ...line, uid: uid() });
    persist();
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
  }

  function go(href) {
    location.href = href;
  }

  function paint() {
    const main = document.getElementById("main");
    const focusId = document.activeElement && document.activeElement.id;
    if (main) main.innerHTML = pageRender();
    const sidebar = document.getElementById("sidebar");
    const header = document.getElementById("header");
    const tabbar = document.getElementById("tabbar");
    const bag = document.getElementById("bag");
    if (sidebar) sidebar.innerHTML = sidebarHTML();
    if (header) header.innerHTML = headerHTML();
    if (tabbar) tabbar.innerHTML = tabbarHTML();
    if (bag) bag.innerHTML = bagHTML();
    const hideBag = ["carrinho", "checkout", "acompanhar", "entrar"].includes(page);
    document.body.classList.toggle("no-panel", hideBag);
    document.body.classList.toggle("is-auth", page === "entrar");
    const bill = totals();
    const showFloat = cartCount() > 0 && !hideBag;
    document.body.classList.toggle("has-float", showFloat);
    const float = document.getElementById("cart-float");
    if (float) {
      float.hidden = !showFloat;
      float.href = url.carrinho;
      if (showFloat) float.innerHTML = `<span>Ver sacola · ${cartCount()}</span><em>${money(bill.total)}</em>`;
    }
    const heading = typeof headerText === "function" ? headerText() : "";
    document.title = `${heading || TITLES[page] || "SaborJá"} — SaborJá`;
    showModal();
    if (focusId) {
      const el = document.getElementById(focusId);
      if (el) {
        el.focus();
        if (el.setSelectionRange && el.value) {
          const end = el.value.length;
          el.setSelectionRange(end, end);
        }
      }
    }
  }

  function closeLoader() {
    const loader = document.getElementById("loader");
    if (!loader) {
      document.body.classList.remove("is-loading");
      return;
    }
    loader.classList.add("is-out");
    setTimeout(() => {
      if (loader.isConnected) loader.remove();
      document.body.classList.remove("is-loading");
    }, 400);
  }

  const builtin = {
    back() {
      if (history.length > 1) history.back();
      else go(url.home);
    },
    fav(el) {
      const id = el.dataset.id;
      const has = state.favorites.includes(id);
      state.favorites = has ? state.favorites.filter((item) => item !== id) : state.favorites.concat(id);
      persist();
      toast(has ? "Removido dos favoritos" : "Salvo nos favoritos");
      paint();
    },
    "demo-lock"(el) {
      toast(el.dataset.msg || "Indisponível nesta demonstração.");
    },
    "modal-cancel"() {
      state.modal = null;
      showModal();
    },
    "modal-ok"() {
      const modal = state.modal;
      state.modal = null;
      showModal();
      if (!modal) return;
      if (modal.type === "replace-cart") {
        state.cart.items = [];
        state.cart.restaurantId = null;
        pushLine(modal.line);
        toast("Sacola atualizada");
        go(url.restaurante(modal.line.restaurantId));
        return;
      }
      if (modal.type === "clear-cart") {
        state.cart = { restaurantId: null, items: [], couponCode: "", couponDraft: "", instructions: "", change: "" };
        persist();
        toast("Sacola esvaziada");
        paint();
      }
      if (modal.type === "logout") {
        state.logged = false;
        persist();
        go(url.entrar);
      }
    },
  };

  function start(options) {
    page = options.page;
    pageRender = options.render;
    pageActions = options.actions || {};
    headerText = options.header || null;
    paint();
    if (page === "inicio") setTimeout(closeLoader, 500);
    else closeLoader();
  }

  document.addEventListener("click", (event) => {
    const el = event.target.closest("[data-action]");
    if (!el || el.disabled) return;
    const name = el.dataset.action;
    const fn = pageActions[name] || builtin[name];
    if (!fn) return;
    event.preventDefault();
    fn(el, event);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.modal) {
      state.modal = null;
      showModal();
    }
  });

  window.Sabor = {
    DB, state, url, q, esc, money, norm, rateNum, whenLabel, icon, heart, stars, imgTag,
    getRestaurant, findItem, categoryById, feeText, greet, firstName, persist, toast, go, paint,
    selectedAddress, addressLine, allPayments, selectedPayment, totals, summaryHTML, cartCount,
    statusIndex, statusLabel, courierFor, eta, restaurantCard, dishCard, chipsHTML,
    filterRestaurants, sortRestaurants, missing, needLogin, showModal, pushLine, applyCoupon,
    lineSignature, uid, STEPS, start,
  };
})();
