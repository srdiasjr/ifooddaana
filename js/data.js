(function () {
  const photo = (id) =>
    `https://images.unsplash.com/${id}?auto=format&fit=crop&w=720&q=60`;

  const choice = (id, name, price) => ({ id, name, price: price || 0 });

  const group = (id, name, required, max, choices) => ({
    id,
    name,
    required: !!required,
    min: required ? 1 : 0,
    max,
    choices,
  });

  const item = (id, name, description, price, extra) =>
    Object.assign({ id, name, description, price, popular: false, serves: "1 pessoa" }, extra || {});

  const categories = [
    { id: "brasileira", name: "Brasileira", emoji: "🥩" },
    { id: "pizza", name: "Pizza", emoji: "🍕" },
    { id: "japonesa", name: "Japonesa", emoji: "🍣" },
    { id: "lanches", name: "Lanches", emoji: "🍔" },
    { id: "italiana", name: "Italiana", emoji: "🍝" },
    { id: "acai", name: "Açaí", emoji: "🫐" },
    { id: "asiatica", name: "Asiática", emoji: "🍜" },
    { id: "saudavel", name: "Saudável", emoji: "🥗" },
    { id: "padaria", name: "Padaria", emoji: "🥐" },
    { id: "mexicana", name: "Mexicana", emoji: "🌮" },
    { id: "doces", name: "Doces", emoji: "🍰" },
  ];

  const restaurants = [
    {
      id: "brasa-lenha",
      name: "Brasa & Lenha",
      category: "brasileira",
      cuisine: "Churrasco",
      keywords: "picanha costela espeto carne churrasco brasileira",
      rating: 4.8,
      reviewCount: 1284,
      time: "35–50 min",
      fee: 6.49,
      min: 30,
      distance: "1,2 km",
      promo: "Combo em alta",
      featured: true,
      open: true,
      hours: "Ter a domingo · 11h–23h",
      phone: "(11) 3340-2210",
      address: "Rua das Acácias, 120 — Vila Madalena",
      about: "Fogo de lenha, cortes do dia e acompanhamentos de fazenda. A casa assa em pequenas fornadas para a carne chegar ainda no ponto.",
      color: "#8c3a2b",
      image: photo("photo-1558030006-450675393462"),
      menu: [
        {
          id: "carnes",
          name: "Carnes",
          items: [
            item("picanha", "Picanha fatiada", "Fatias seladas na brasa, sal grosso e alho. Acompanha pão de alho.", 67.9, {
              popular: true,
              serves: "2 pessoas",
              image: photo("photo-1558030006-450675393462"),
              options: [
                group("ponto", "Ponto da carne", true, 1, [
                  choice("mal", "Mal passada"),
                  choice("ponto", "Ao ponto"),
                  choice("bem", "Bem passada"),
                ]),
                group("lado", "Acompanhamentos", false, 3, [
                  choice("arroz", "Arroz branco"),
                  choice("tropeiro", "Feijão tropeiro", 6),
                  choice("farofa", "Farofa da casa"),
                  choice("vinagrete", "Vinagrete"),
                  choice("mandioca", "Mandioca frita", 6),
                ]),
              ],
            }),
            item("costela", "Costela de panela", "Cozida por horas no caldo de cebola e depois finalizada na brasa.", 59.9, {
              serves: "2 pessoas",
              image: photo("photo-1544025162-d76694265947"),
            }),
            item("espeto", "Espeto misto", "Carne, linguiça artesanal e queijo coalho no espeto.", 36, {
              image: photo("photo-1529193591184-b1d58069ecdd"),
            }),
          ],
        },
        {
          id: "acompanha",
          name: "Acompanhamentos",
          items: [
            item("farofa", "Farofa da casa", "Farinha, manteiga de garrafa e cebolinha.", 14),
            item("vinagrete", "Vinagrete", "Tomate, cebola roxa e cheiro-verde.", 9),
            item("mandioca", "Mandioca frita", "Palitos crocantes com flor de sal.", 16, {
              image: photo("photo-1630384060421-cb20d0e0649d"),
            }),
          ],
        },
        {
          id: "bebidas-brasa",
          name: "Bebidas",
          items: [
            item("refri-brasa", "Refrigerante lata", "Cola, guaraná ou limão.", 8, { image: photo("photo-1629203851122-3726ecdf080e") }),
            item("suco-laranja", "Suco de laranja", "Feito na hora, 400 ml.", 12, { image: photo("photo-1600271886742-f049cd451bba") }),
          ],
        },
      ],
    },
    {
      id: "forno-alto",
      name: "Forno Alto",
      category: "pizza",
      cuisine: "Pizzaria",
      keywords: "pizza margherita calabresa forno massa",
      rating: 4.7,
      reviewCount: 2104,
      time: "30–45 min",
      fee: 0,
      min: 25,
      distance: "900 m",
      promo: "Frete grátis",
      featured: true,
      open: true,
      hours: "Todos os dias · 18h–23h30",
      phone: "(11) 3092-1188",
      address: "Rua Harmonia, 88 — Vila Madalena",
      about: "Massa de longa fermentação e forno a 430 graus. As pizzas saem com a borda alta e o centro enxuto.",
      color: "#a33b32",
      image: photo("photo-1513104890138-7c749659a591"),
      menu: [
        {
          id: "pizzas",
          name: "Pizzas",
          items: [
            item("margherita", "Margherita", "Molho de tomate pelati, mussarela de búfala e manjericão.", 46.9, {
              popular: true,
              serves: "2 pessoas",
              image: photo("photo-1574071318508-1cdbab80d002"),
              options: [
                group("tamanho", "Tamanho", true, 1, [
                  choice("media", "Média · 6 fatias"),
                  choice("grande", "Grande · 8 fatias", 18),
                ]),
                group("borda", "Borda", true, 1, [
                  choice("tradicional", "Tradicional"),
                  choice("catupiry", "Catupiry", 9),
                  choice("cheddar", "Cheddar", 9),
                ]),
              ],
            }),
            item("calabresa", "Calabresa", "Calabresa laminada, cebola e azeitona preta.", 49.9, {
              serves: "2 pessoas",
              options: [
                group("tamanho", "Tamanho", true, 1, [
                  choice("media", "Média · 6 fatias"),
                  choice("grande", "Grande · 8 fatias", 18),
                ]),
                group("borda", "Borda", true, 1, [
                  choice("tradicional", "Tradicional"),
                  choice("catupiry", "Catupiry", 9),
                ]),
              ],
            }),
            item("quatro-queijos", "Quatro queijos", "Mussarela, gorgonzola, parmesão e catupiry.", 54.9, { serves: "2 pessoas" }),
            item("portuguesa", "Portuguesa", "Presunto, ovo, cebola, azeitona e ervilha.", 52, { serves: "2 pessoas" }),
            item("holofote", "Pizza de Holofote", "Mussarela, tomate e uma borda rosa. Visita inventada: a Anitta não assinou esta pizza e não endossa a casa.", 48, {
              guest: "Anitta",
              serves: "2 pessoas",
              image: photo("photo-1565299624946-b28f40a0ae38"),
            }),
          ],
        },
        {
          id: "bebidas-forno",
          name: "Bebidas",
          items: [
            item("refri-2l", "Refrigerante 2 litros", "Para dividir com a pizza.", 14),
            item("suco-uva", "Suco de uva integral", "Jarra de 500 ml.", 16),
          ],
        },
      ],
    },
    {
      id: "hana-sushi",
      name: "Hana Sushi",
      category: "japonesa",
      cuisine: "Japonesa",
      keywords: "sushi temaki salmao combinado japonês",
      rating: 4.9,
      reviewCount: 980,
      time: "40–55 min",
      fee: 7.9,
      min: 40,
      distance: "2,1 km",
      promo: null,
      featured: true,
      open: true,
      hours: "Ter a domingo · 12h–23h",
      phone: "(11) 3815-4400",
      address: "Rua dos Pinheiros, 512 — Pinheiros",
      about: "Peixe do dia, arroz temperado na casa e combinados montados na hora do pedido.",
      color: "#1e3a40",
      image: photo("photo-1579871494447-9811cf80d66c"),
      menu: [
        {
          id: "combinados",
          name: "Combinados",
          items: [
            item("combinado-16", "Combinado 16 peças", "Salmão, atum, pepino e duas peças empanadas.", 62, {
              popular: true,
              serves: "2 pessoas",
              image: photo("photo-1579871494447-9811cf80d66c"),
            }),
            item("temaki-salmao", "Temaki de salmão", "Cone de alga, arroz e salmão fresco. Wasabi à parte.", 24, {
              popular: true,
              image: photo("photo-1617196034796-73dfa7b1fd56"),
            }),
            item("uramaki", "Uramaki filadélfia", "Oito peças com cream cheese e gergelim.", 32),
          ],
        },
        {
          id: "bebidas-hana",
          name: "Bebidas",
          items: [item("cha-verde", "Chá verde gelado", "Jarra de 400 ml.", 10)],
        },
      ],
    },
    {
      id: "vila-burger",
      name: "Vila Burger",
      category: "lanches",
      cuisine: "Hambúrguer",
      keywords: "hamburguer smash batata cheddar lanche",
      rating: 4.6,
      reviewCount: 1640,
      time: "25–40 min",
      fee: 5.49,
      min: 22,
      distance: "700 m",
      promo: null,
      featured: false,
      open: true,
      hours: "Todos os dias · 12h–00h",
      phone: "(11) 3032-7711",
      address: "Rua Aspicuelta, 240 — Vila Madalena",
      about: "Smash na chapa, pão brioche e molhos da casa. A batata sai na hora do pedido.",
      color: "#c47a2c",
      image: photo("photo-1568901346375-23c9450c58cd"),
      menu: [
        {
          id: "burgers",
          name: "Hambúrgueres",
          items: [
            item("vila-classico", "Vila clássico", "Blend 160 g, queijo, picles e molho da casa.", 32.9, {
              popular: true,
              image: photo("photo-1568901346375-23c9450c58cd"),
              options: [
                group("ponto-burger", "Ponto", true, 1, [
                  choice("mal", "Mal passado"),
                  choice("ponto", "Ao ponto"),
                ]),
                group("extra-burger", "Extra", false, 2, [
                  choice("cheddar", "Cheddar", 4),
                  choice("bacon", "Bacon", 6),
                ]),
              ],
            }),
            item("smash-meia-lua", "Smash da Meia-Lua", "Dois smash, queijo e um picles dourado. Visita inventada: o Neymar Jr. não tem lanche nesta casa.", 36, {
              guest: "Neymar Jr.",
              image: photo("photo-1550547660-d9450f859349"),
            }),
            item("batata-vila", "Batata da vila", "Porção média, crocante, com flor de sal.", 16.9, {
              popular: true,
              image: photo("photo-1573080496219-bb080dd4f877"),
            }),
          ],
        },
      ],
    },
    {
      id: "nonna-clara",
      name: "Nonna Clara",
      category: "italiana",
      cuisine: "Italiana",
      keywords: "lasanha risoto massa italiana tiramisu",
      rating: 4.8,
      reviewCount: 870,
      time: "35–50 min",
      fee: 6.99,
      min: 32,
      distance: "1,8 km",
      promo: null,
      featured: true,
      open: true,
      hours: "Qua a domingo · 12h–22h30",
      phone: "(11) 3081-2290",
      address: "Rua Harmonia, 610 — Vila Madalena",
      about: "Molho curto, massa fresca e forno baixo. A lasanha sai em porções que aguentam a viagem.",
      color: "#6e4a3a",
      image: photo("photo-1621996346565-e3dbc646d9a9"),
      menu: [
        {
          id: "massas",
          name: "Massas",
          items: [
            item("lasanha", "Lasanha bolonhesa", "Camadas de massa, ragú e bechamel. Molho curto, sem caldo.", 42, {
              popular: true,
              image: photo("photo-1574894709920-11b28e7367e3"),
            }),
            item("risoto", "Risoto de funghi", "Arroz arbóreo, funghi e parmesão.", 46),
            item("tiramisu", "Tiramisù", "Fatia gelada, café e cacau.", 22),
          ],
        },
      ],
    },
    {
      id: "norte-acai",
      name: "Norte Açaí",
      category: "acai",
      cuisine: "Açaí",
      keywords: "acai tigela granola banana copo",
      rating: 4.7,
      reviewCount: 2410,
      time: "15–30 min",
      fee: 0,
      min: 18,
      distance: "500 m",
      promo: "Entrega rápida",
      featured: true,
      open: true,
      hours: "Todos os dias · 10h–22h",
      phone: "(11) 3862-1010",
      address: "Rua Wizard, 75 — Vila Madalena",
      about: "Açaí grosso, batido na hora. O copo de 500 ml é o tamanho da casa.",
      color: "#4a2c6a",
      image: photo("photo-1590301157890-4810ed352733"),
      menu: [
        {
          id: "copos",
          name: "Copos",
          items: [
            item("acai-tradicional", "Açaí tradicional", "500 ml, banana e granola.", 18, {
              popular: true,
              image: photo("photo-1590301157890-4810ed352733"),
              options: [
                group("tamanho-acai", "Tamanho", true, 1, [
                  choice("300", "300 ml", -4),
                  choice("500", "500 ml"),
                  choice("700", "700 ml", 8),
                ]),
              ],
            }),
            item("tigela-casa", "Tigela da casa", "Açaí, morango, leite em pó e paçoca.", 26, { popular: true }),
            item("copo-nave", "Copo da Nave", "Açaí, morango e um chantilly rosa. Visita inventada: a Xuxa não opera esta tigela.", 24, {
              guest: "Xuxa",
            }),
          ],
        },
      ],
    },
    {
      id: "lotus-thai",
      name: "Lótus Thai",
      category: "asiatica",
      cuisine: "Tailandesa",
      keywords: "pad thai curry camarão amendoim tailandesa",
      rating: 4.6,
      reviewCount: 640,
      time: "35–50 min",
      fee: 7.49,
      min: 34,
      distance: "2,6 km",
      promo: null,
      featured: false,
      open: true,
      hours: "Ter a domingo · 12h–22h30",
      phone: "(11) 3819-3344",
      address: "Rua dos Pinheiros, 900 — Pinheiros",
      about: "Pad thai no wok e curry de panela. A picância vem marcada no pedido.",
      color: "#b4532a",
      image: photo("photo-1559314809-0d155014e29e"),
      menu: [
        {
          id: "wok",
          name: "Wok",
          items: [
            item("pad-thai", "Pad thai", "Macarrão de arroz, camarão, amendoim e limão.", 44, {
              popular: true,
              image: photo("photo-1559314809-0d155014e29e"),
              options: [
                group("picancia", "Picância", true, 1, [
                  choice("suave", "Suave"),
                  choice("media", "Média"),
                  choice("forte", "Forte"),
                ]),
              ],
            }),
            item("curry-verde", "Curry verde", "Leite de coco, manjericão tailandês e legumes.", 42),
          ],
        },
      ],
    },
    {
      id: "raiz-verde",
      name: "Raiz Verde",
      category: "saudavel",
      cuisine: "Saudável",
      keywords: "salada bowl quinoa tahine folhas",
      rating: 4.8,
      reviewCount: 720,
      time: "20–35 min",
      fee: 4.99,
      min: 24,
      distance: "1,1 km",
      promo: null,
      featured: true,
      open: true,
      hours: "Seg a sáb · 11h–20h",
      phone: "(11) 3034-8080",
      address: "Rua Mourato Coelho, 300 — Pinheiros",
      about: "Bowls montados na hora, tahine da casa e folhas que aguentam a entrega.",
      color: "#2f6b45",
      image: photo("photo-1512621776951-a57141f2eefd"),
      menu: [
        {
          id: "bowls",
          name: "Bowls",
          items: [
            item("bowl-quinoa", "Bowl de quinoa", "Quinoa, grão-de-bico, folhas e tahine.", 36, {
              popular: true,
              image: photo("photo-1512621776951-a57141f2eefd"),
            }),
            item("salada-raiz", "Salada da raiz", "Folhas firmes, manga e sementes.", 28),
          ],
        },
      ],
    },
    {
      id: "sol-pao",
      name: "Sol & Pão",
      category: "padaria",
      cuisine: "Padaria",
      keywords: "pao croissant cafe padaria chapa",
      rating: 4.5,
      reviewCount: 540,
      time: "20–35 min",
      fee: 3.99,
      min: 16,
      distance: "800 m",
      promo: null,
      featured: false,
      open: true,
      hours: "Todos os dias · 7h–19h",
      phone: "(11) 3812-0909",
      address: "Rua Wisard, 140 — Vila Madalena",
      about: "Forno de bairro. O croissant sai amanteigado e o café segue no copo térmico.",
      color: "#c48a4a",
      image: photo("photo-1509440159596-0249088772ff"),
      menu: [
        {
          id: "forno",
          name: "Forno",
          items: [
            item("croissant", "Croissant amanteigado", "Massa folhada, manteiga e um pouco de sal.", 12, {
              popular: true,
              image: photo("photo-1555507036-ab1f4038808a"),
            }),
            item("pao-chapa", "Pão na chapa", "Pão francês, manteiga e queijo.", 14),
            item("cafe-curto", "Café curto", "50 ml, moído na casa.", 7),
          ],
        },
      ],
    },
    {
      id: "mexicalia",
      name: "Casa Mexicália",
      category: "mexicana",
      cuisine: "Mexicana",
      keywords: "taco burrito tortilha salsa coentro",
      rating: 4.6,
      reviewCount: 690,
      time: "30–45 min",
      fee: 5.99,
      min: 28,
      distance: "1,5 km",
      promo: null,
      featured: false,
      open: true,
      hours: "Qua a segunda · 12h–23h",
      phone: "(11) 3097-4545",
      address: "Rua Aspicuelta, 88 — Vila Madalena",
      about: "Tortilha de milho, salsa fresca e carne desfiada. A picância média é o padrão da casa.",
      color: "#b84a2f",
      image: photo("photo-1565299585323-38d6b0865b47"),
      menu: [
        {
          id: "tacos",
          name: "Tacos",
          items: [
            item("tacos-carne", "Tacos de carne", "Três tortilhas, carne, coentro e cebola.", 34, {
              popular: true,
              image: photo("photo-1565299585323-38d6b0865b47"),
              options: [
                group("salsa", "Salsa", true, 1, [
                  choice("suave", "Suave"),
                  choice("media", "Média"),
                  choice("forte", "Forte"),
                ]),
              ],
            }),
            item("burrito", "Burrito da casa", "Arroz, feijão, carne e queijo, embrulhado firme.", 32),
          ],
        },
      ],
    },
    {
      id: "doce-lume",
      name: "Doce Lume",
      category: "doces",
      cuisine: "Sobremesas",
      keywords: "cheesecake brownie cookie bolo doce",
      rating: 4.9,
      reviewCount: 430,
      time: "25–40 min",
      fee: 4.99,
      min: 18,
      distance: "1,4 km",
      promo: null,
      featured: false,
      open: false,
      closedMessage: "Abre hoje às 14h",
      hours: "Todos os dias · 14h–21h",
      phone: "(11) 3672-0909",
      address: "Rua Original, 33 — Vila Madalena",
      about: "Confeitaria pequena. Os bolos saem em fornadas e, fora do horário, a vitrine fica fechada de propósito.",
      color: "#a85a78",
      image: photo("photo-1488477181946-6428a0291777"),
      menu: [
        {
          id: "doces-vitrine",
          name: "Vitrine",
          items: [
            item("cheesecake", "Cheesecake de frutas vermelhas", "Base crocante e calda azeda.", 22, {
              popular: true,
              image: photo("photo-1533134486753-c833f0ed4866"),
            }),
            item("brownie", "Brownie", "Meio amargo, com nozes.", 14, { image: photo("photo-1606313564200-e75d5e30476c") }),
            item("cookie", "Cookie grande", "Chocolate meio amargo, ainda macio no centro.", 9),
            item("cafe-doce", "Café com bolo do dia", "Uma fatia e um café curto.", 18),
            item("bolo-close", "Bolo de Close", "Fatia pequena com calda brilhante. Visita inventada: a Bruna Marquezine não tem vitrine aqui.", 24, {
              guest: "Bruna Marquezine",
            }),
          ],
        },
      ],
    },
  ];

  const reviewBank = {
    "brasa-lenha": [
      { name: "Helena Prado", stars: 5, date: "há 2 dias", text: "A picanha chegou no ponto e ainda quente. A farofa é viciante." },
      { name: "Igor Lima", stars: 4, date: "há 1 semana", text: "Demorou um pouco mais que o previsto, mas a costela valeu a espera." },
    ],
    "forno-alto": [
      { name: "Bianca Melo", stars: 5, date: "há 3 dias", text: "Borda alta de verdade e o centro não veio encharcado. Frete grátis ajudou." },
      { name: "Caio Nunes", stars: 5, date: "há 6 dias", text: "Margherita com búfala boa. Pedi grande e sobrou para o almoço." },
    ],
    "hana-sushi": [
      { name: "Lívia Okamoto", stars: 5, date: "ontem", text: "Salmão fresco e arroz no ponto. O combinado rende bem para dois." },
      { name: "Paulo Vieira", stars: 4, date: "há 4 dias", text: "Temaki generoso. O wasabi vem à parte, do jeito que eu gosto." },
    ],
    "vila-burger": [
      { name: "Renata Dias", stars: 5, date: "há 1 dia", text: "Smash crocante nas bordas e o pão não desmontou no caminho." },
      { name: "Diego Alves", stars: 4, date: "há 8 dias", text: "Batata sequinha. O cheddar do duplo é bem caprichado." },
    ],
    "nonna-clara": [
      { name: "Marina Costa", stars: 5, date: "há 5 dias", text: "Lasanha com molho curto, não aquele molho aguado. Tiramisù fechou bem." },
      { name: "André Pacheco", stars: 4, date: "há 2 semanas", text: "Risoto cremoso. A entrega veio bem fechada, sem vazar." },
    ],
    "norte-acai": [
      { name: "Ju Ferreira", stars: 5, date: "hoje", text: "Açaí grosso de verdade. O copo de 500 ml é o tamanho certo." },
      { name: "Leo Martins", stars: 4, date: "há 3 dias", text: "Chegou gelado. Eu pediria mais granola na próxima." },
    ],
    "lotus-thai": [
      { name: "Camila Rocha", stars: 5, date: "há 6 dias", text: "Pad thai equilibrado, amendoim crocante e camarão no ponto." },
      { name: "Hugo Santana", stars: 4, date: "há 9 dias", text: "Curry aromático. Pedi suave e veio suave, sem surpresa." },
    ],
    "raiz-verde": [
      { name: "Sara Mendes", stars: 5, date: "há 2 dias", text: "Bowl farto e o tahine é feito na casa. Almoço leve de verdade." },
      { name: "Bruno Teixeira", stars: 5, date: "há 1 semana", text: "Salada com folhas firmes, não aquela mistura murcha." },
    ],
    "sol-pao": [
      { name: "Elisa Ramos", stars: 4, date: "ontem", text: "Croissant amanteigado e o café chegou quente. Simples e bom." },
      { name: "Tiago Luz", stars: 5, date: "há 4 dias", text: "Pão na chapa lembrou padaria de bairro. Chegou no saquinho certo." },
    ],
    "mexicalia": [
      { name: "Nina Carvalho", stars: 5, date: "há 3 dias", text: "Tortilha de milho macia e a salsa tem gosto de coentro fresco." },
      { name: "Pedro Gama", stars: 4, date: "há 11 dias", text: "Burrito bem recheado. A picância média ficou no ponto." },
    ],
    "doce-lume": [
      { name: "Olívia Braga", stars: 5, date: "há 2 dias", text: "Cheesecake azedinho, do jeito certo. A calda não é só corante." },
      { name: "Fabio Muniz", stars: 5, date: "há 1 semana", text: "Brownie úmido. Vale esperar a fornada da tarde." },
    ],
  };

  restaurants.forEach((restaurant) => {
    restaurant.reviews = reviewBank[restaurant.id] || [];
  });

  const coupons = [
    {
      code: "BEMVINDO",
      title: "20% de desconto",
      description: "Para o primeiro pedido nesta demonstração. Teto de R$ 15.",
      type: "percent",
      percent: 0.2,
      cap: 15,
      min: 30,
    },
    {
      code: "SABOR10",
      title: "R$ 10 na sacola",
      description: "Desconto fixo em pedidos a partir de R$ 40.",
      type: "fixed",
      amount: 10,
      min: 40,
    },
    {
      code: "FRETEGRATIS",
      title: "Frete grátis",
      description: "Zera a taxa de entrega a partir de R$ 35.",
      type: "shipping",
      min: 35,
    },
  ];

  const faqs = [
    {
      id: "acompanhar",
      q: "Como acompanho um pedido?",
      a: "Depois de finalizar, a tela de acompanhamento mostra as etapas: confirmado, em preparo, a caminho e entregue. Nesta demonstração o status avança sozinho a cada alguns segundos.",
    },
    {
      id: "pagamento",
      q: "Quais formas de pagamento existem?",
      a: "Pix, vale-refeição, dinheiro e cartão salvo só neste navegador. Nada é cobrado. O código de segurança do cartão não fica gravado.",
    },
    {
      id: "cupom",
      q: "Por que o cupom não aplica?",
      a: "Cada cupom tem um pedido mínimo. Se a sacola ainda não chegou nesse valor, o desconto aparece como pendente e entra quando o mínimo for atingido.",
    },
    {
      id: "endereco",
      q: "Como troco o endereço?",
      a: "Em Endereços você escolhe o local da entrega ou cadastra outro. A escolha vale para o próximo checkout.",
    },
    {
      id: "loja",
      q: "Posso pedir de duas lojas juntas?",
      a: "A sacola guarda uma loja por vez. Se você adicionar um prato de outra casa, o app pede para esvaziar a sacola atual.",
    },
    {
      id: "visita",
      q: "O que são as visitas no cardápio?",
      a: "Quatro pratos extras, marcados como visita. São invenções desta demonstração. Nenhuma celebridade cozinha, assina ou endossa o SaborJá.",
    },
    {
      id: "real",
      q: "Este pedido chega de verdade?",
      a: "Não. O SaborJá é um trabalho de interface. Nenhum restaurante recebe o pedido e nenhum pagamento é processado.",
    },
  ];

  window.DB = { categories, restaurants, coupons, faqs };
})();
