(function () {
  const S = window.Sabor;

  document.addEventListener("submit", (event) => {
    if (event.target.id !== "auth-form") return;
    event.preventDefault();
    const data = new FormData(event.target);
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");
    const name = String(data.get("name") || "").trim();
    if (!email.includes("@") || password.length < 4) {
      S.toast("Use um e-mail válido e uma senha de 4 ou mais caracteres.");
      return;
    }
    if (S.state.authMode === "register" && name.length < 2) {
      S.toast("Informe seu nome para criar a conta.");
      return;
    }
    if (S.state.authMode === "register") S.state.user.name = name;
    S.state.user.email = email;
    S.state.logged = true;
    S.persist();
    S.toast("Você entrou");
    S.go(S.url.home);
  });

  S.start({
    page: "entrar",
    render() {
      const register = S.state.authMode === "register";
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
            <label class="field">E-mail<input class="input" name="email" type="email" required value="${S.esc(S.state.user.email || "")}"></label>
            <label class="field">Senha<input class="input" name="password" type="password" required minlength="4" placeholder="Mínimo de 4 caracteres"></label>
            <button class="btn" type="submit">${register ? "Criar conta" : "Entrar"}</button>
            <p class="footer-note">A senha não é armazenada. Serve só para passar desta tela.</p>
          </form>
        </section>`;
    },
    actions: {
      "auth-mode"(el) {
        S.state.authMode = el.dataset.mode;
        S.paint();
      },
    },
  });
})();
