(function () {
  const S = window.Sabor;
  const links = [
    [S.url.pedidos, "Meus pedidos"],
    [S.url.favoritos, "Favoritos"],
    [S.url.cupons, "Cupons"],
    [S.url.enderecos, "Endereços"],
    [S.url.pagamentos, "Pagamentos"],
    [S.url.notificacoes, "Notificações"],
    [S.url.ajuda, "Ajuda"],
  ];

  document.addEventListener("submit", (event) => {
    if (event.target.id !== "profile-form") return;
    event.preventDefault();
    const data = new FormData(event.target);
    S.state.user.name = String(data.get("name") || "").trim() || S.state.user.name;
    S.state.user.phone = String(data.get("phone") || "").trim();
    S.persist();
    S.toast("Dados atualizados");
    S.paint();
  });

  S.start({
    page: "perfil",
    render() {
      if (!S.state.logged) return S.needLogin("Entre para ver o perfil de demonstração.");
      return `
        <section class="card">
          <div class="profile-head">
            <span class="avatar avatar--lg">${S.esc(S.firstName().slice(0, 1))}</span>
            <div><h2 style="font-family:var(--serif)">${S.esc(S.state.user.name)}</h2><p class="muted">${S.esc(S.state.user.email)}</p></div>
          </div>
          <div class="stats">
            <div class="stat"><strong>${S.state.orders.length}</strong><span>pedidos</span></div>
            <div class="stat"><strong>${S.state.favorites.length}</strong><span>favoritos</span></div>
            <div class="stat"><strong>${S.DB.coupons.length}</strong><span>cupons</span></div>
          </div>
          <form id="profile-form">
            <label class="field">Nome<input class="input" name="name" value="${S.esc(S.state.user.name)}" required></label>
            <label class="field">Telefone<input class="input" name="phone" value="${S.esc(S.state.user.phone)}" required></label>
            <button class="btn" type="submit">Salvar dados</button>
          </form>
        </section>
        <section class="card" style="margin-top:12px">
          ${links.map(([href, label]) => `<a class="link-row" href="${href}">${label}<span>›</span></a>`).join("")}
          <button class="link-row" type="button" data-action="logout">Sair<span>›</span></button>
        </section>
        <p class="footer-note">Conta fictícia, salva só neste navegador.</p>`;
    },
    actions: {
      logout() {
        S.state.modal = {
          type: "logout",
          title: "Sair da conta?",
          text: "Os pedidos de demonstração continuam salvos neste navegador.",
          ok: "Sair",
        };
        S.showModal();
      },
    },
  });
})();
