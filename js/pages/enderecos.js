(function () {
  const S = window.Sabor;

  document.addEventListener("submit", (event) => {
    if (event.target.id !== "address-form") return;
    event.preventDefault();
    const data = new FormData(event.target);
    const address = {
      id: S.uid(),
      label: String(data.get("label") || "").trim(),
      street: String(data.get("street") || "").trim(),
      number: String(data.get("number") || "").trim(),
      complement: String(data.get("complement") || "").trim(),
      neighborhood: String(data.get("neighborhood") || "").trim(),
      city: String(data.get("city") || "").trim(),
      reference: String(data.get("reference") || "").trim(),
    };
    if (!address.label || !address.street || !address.number || !address.neighborhood) {
      S.toast("Preencha apelido, rua, número e bairro.");
      return;
    }
    S.state.addresses.push(address);
    S.state.selectedAddressId = address.id;
    S.persist();
    S.toast("Endereço salvo");
    S.paint();
  });

  S.start({
    page: "enderecos",
    render() {
      if (!S.state.logged) return S.needLogin("Os endereços ficam na conta de demonstração.");
      return `
        <section class="greet"><h1>Endereços</h1><p>Escolha onde a entrega simulada chega.</p></section>
        ${S.state.addresses.map((address) => `
          <article class="card" style="margin-bottom:10px">
            <div class="spread">
              <h3>${S.esc(address.label)}</h3>
              <span class="small">${address.id === S.state.selectedAddressId ? "Em uso" : ""}</span>
            </div>
            <p>${S.esc(S.addressLine(address))}</p>
            <p class="small muted">${S.esc(address.city)}${address.reference ? " · " + S.esc(address.reference) : ""}</p>
            <div class="row-btns" style="margin-top:10px">
              <button class="btn" type="button" data-action="addr" data-id="${address.id}">Usar este</button>
              <button class="btn btn--ghost" type="button" data-action="remove-address" data-id="${address.id}">Excluir</button>
            </div>
          </article>`).join("")}
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
        </form>`;
    },
    actions: {
      addr(el) {
        S.state.selectedAddressId = el.dataset.id;
        S.persist();
        S.toast("Endereço selecionado");
        S.paint();
      },
      "remove-address"(el) {
        if (S.state.addresses.length < 2) return S.toast("Deixe pelo menos um endereço.");
        S.state.addresses = S.state.addresses.filter((address) => address.id !== el.dataset.id);
        if (!S.state.addresses.some((address) => address.id === S.state.selectedAddressId)) {
          S.state.selectedAddressId = S.state.addresses[0].id;
        }
        S.persist();
        S.paint();
      },
    },
  });
})();
