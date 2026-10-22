(function () {
  const S = window.Sabor;
  const loja = S.q("loja");
  const itemId = S.q("item");
  const found = S.findItem(loja, itemId);

  if (found) {
    const key = `${found.restaurant.id}/${found.item.id}`;
    if (!S.state.draft || S.state.draft.key !== key) {
      S.state.draft = { key, qty: 1, options: {}, note: "" };
    }
  }

  function unit() {
    if (!found) return 0;
    let extra = 0;
    (found.item.options || []).forEach((group) => {
      (S.state.draft.options[group.id] || []).forEach((choiceId) => {
        const choice = group.choices.find((entry) => entry.id === choiceId);
        if (choice) extra += choice.price || 0;
      });
    });
    return found.item.price + extra;
  }

  function paintPrice() {
    const price = document.getElementById("buy-price");
    if (price) price.textContent = S.money(unit() * S.state.draft.qty);
  }

  function view() {
    if (!found) return S.missing("Esse prato não está no cardápio.");
    const { restaurant, item } = found;
    const closed = !restaurant.open;
    const groups = (item.options || []).map((group) => {
      const picked = S.state.draft.options[group.id] || [];
      return `
        <fieldset class="opt">
          <legend>${S.esc(group.name)} <span>${group.required ? "Obrigatório" : "Opcional"}${group.max > 1 ? ` · até ${group.max}` : ""}</span></legend>
          ${group.choices.map((choice) => {
            const type = group.max === 1 ? "radio" : "checkbox";
            const checked = picked.includes(choice.id) ? "checked" : "";
            return `<label class="choice"><span><input type="${type}" name="g-${group.id}" value="${choice.id}" data-group="${group.id}" ${checked}> ${S.esc(choice.name)}</span><strong>${choice.price ? "+ " + S.money(choice.price) : ""}</strong></label>`;
          }).join("")}
        </fieldset>`;
    }).join("");
    return `
      <article class="prato">
        <div class="prato__hero" style="background:${restaurant.color}">${S.imgTag(item.image || restaurant.image, item.name, "", true)}</div>
        <p class="small muted" style="margin-top:12px"><a href="${S.url.restaurante(restaurant.id)}">${S.esc(restaurant.name)}</a> · ${S.esc(item.serves)}</p>
        <h1>${S.esc(item.name)}</h1>
        <p class="muted">${S.esc(item.description)}</p>
        ${closed ? `<div class="closed-banner">${S.esc(restaurant.name)} está fechada. ${S.esc(restaurant.closedMessage || "")}</div>` : ""}
        <form id="item-form">
          ${groups}
          <label class="field note">Observação
            <textarea id="item-note" maxlength="140" placeholder="Ex.: sem cebola, molho à parte">${S.esc(S.state.draft.note)}</textarea>
          </label>
        </form>
        <div class="buybar">
          <div class="stepper">
            <button type="button" data-action="qty-item" data-dir="-1" aria-label="Diminuir">−</button>
            <strong id="qty-val">${S.state.draft.qty}</strong>
            <button type="button" data-action="qty-item" data-dir="1" aria-label="Aumentar">+</button>
          </div>
          <button class="btn" type="button" data-action="add-item" ${closed ? "disabled" : ""}>
            ${closed ? "Loja fechada" : `Adicionar · <span id="buy-price">${S.money(unit() * S.state.draft.qty)}</span>`}
          </button>
        </div>
      </article>`;
  }

  function collect() {
    const chosen = [];
    const missing = [];
    (found.item.options || []).forEach((group) => {
      const ids = S.state.draft.options[group.id] || [];
      if (group.required && ids.length < 1) missing.push(group.name);
      ids.forEach((choiceId) => {
        const choice = group.choices.find((entry) => entry.id === choiceId);
        if (choice) chosen.push({ id: `${group.id}:${choice.id}`, group: group.name, name: choice.name, price: choice.price || 0 });
      });
    });
    return { chosen, missing };
  }

  document.addEventListener("input", (event) => {
    if (event.target.id === "item-note" && S.state.draft) S.state.draft.note = event.target.value;
  });

  document.addEventListener("change", (event) => {
    const input = event.target;
    if (!input.dataset.group || !found || !S.state.draft) return;
    const group = (found.item.options || []).find((entry) => entry.id === input.dataset.group);
    if (!group) return;
    if (input.type === "radio") S.state.draft.options[group.id] = [input.value];
    if (input.type === "checkbox") {
      const selected = [...document.querySelectorAll(`input[data-group="${group.id}"]:checked`)].map((el) => el.value);
      if (group.max && selected.length > group.max) {
        input.checked = false;
        S.toast(`Escolha no máximo ${group.max}`);
        return;
      }
      S.state.draft.options[group.id] = [...document.querySelectorAll(`input[data-group="${group.id}"]:checked`)].map((el) => el.value);
    }
    paintPrice();
  });

  S.start({
    page: "prato",
    header: () => (found ? found.item.name : "Prato"),
    render: view,
    actions: {
      "qty-item"(el) {
        if (!S.state.draft) return;
        S.state.draft.qty = Math.min(20, Math.max(1, S.state.draft.qty + Number(el.dataset.dir)));
        const label = document.getElementById("qty-val");
        if (label) label.textContent = String(S.state.draft.qty);
        paintPrice();
      },
      "add-item"() {
        if (!found || !S.state.draft) return;
        if (!found.restaurant.open) return S.toast("Esta loja está fechada.");
        const { chosen, missing } = collect();
        if (missing.length) return S.toast(`Escolha: ${missing.join(", ")}`);
        const line = {
          restaurantId: found.restaurant.id,
          itemId: found.item.id,
          name: found.item.name,
          qty: S.state.draft.qty,
          price: unit(),
          options: chosen,
          note: (S.state.draft.note || "").trim(),
        };
        if (S.state.cart.items.length && S.state.cart.restaurantId && S.state.cart.restaurantId !== line.restaurantId) {
          const other = S.getRestaurant(S.state.cart.restaurantId);
          S.state.modal = {
            type: "replace-cart",
            line,
            title: "Trocar de loja?",
            text: `Sua sacola está com itens de ${other ? other.name : "outra loja"}. Para continuar, ela será esvaziada.`,
            ok: "Esvaziar e adicionar",
          };
          S.showModal();
          return;
        }
        S.pushLine(line);
        S.toast("Adicionado à sacola");
        S.go(S.url.restaurante(found.restaurant.id));
      },
    },
  });
})();
