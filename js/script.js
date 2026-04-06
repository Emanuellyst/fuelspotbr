const linksNav = document.querySelectorAll(".navgas a");
const secoes = document.querySelectorAll("main section[id]");

function removerAtivo() {
    linksNav.forEach(link => link.classList.remove("ativo"));
}

function ativarLinkPorId(idSecao) {
    removerAtivo();

    const linkAtivo = document.querySelector(`.navgas a[href="#${idSecao}"]`);

    if (linkAtivo) {
        linkAtivo.classList.add("ativo");
    }
}

linksNav.forEach(link => {
    link.addEventListener("click", function () {
        const id = this.getAttribute("href").replace("#", "");
        ativarLinkPorId(id);
    });
});

window.addEventListener("scroll", function () {
    let secaoAtual = "";

    secoes.forEach(secao => {
        const topoSecao = secao.offsetTop - 120;
        const alturaSecao = secao.offsetHeight;

        if (window.scrollY >= topoSecao && window.scrollY < topoSecao + alturaSecao) {
            secaoAtual = secao.getAttribute("id");
        }
    });

    if (secaoAtual) {
        ativarLinkPorId(secaoAtual);
    }
});

const formBusca = document.querySelector(".form-busca");
const estadoVazio = document.querySelector(".estado-vazio");
const resultadosBusca = document.querySelector(".resultados-busca");
const textoResultado = document.querySelector(".texto-resultado");
const todosCards = Array.from(document.querySelectorAll(".card-posto"));

function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

formBusca.addEventListener("submit", function (event) {
    event.preventDefault();

    const nome = document.querySelector("#nome").value.trim();
    const cidade = document.querySelector("#cidade").value.trim();
    const bairro = document.querySelector("#bairro").value.trim();
    const combustivel = document.querySelector("#combustivel").value;

    if (nome === "" && cidade === "" && bairro === "" && combustivel === "") {
    mostrarPopupErro("Preencha alguma opção");
    return;
    }

    const cards = Array.from(document.querySelectorAll(".card-posto"));

    atualizarCards(cards, combustivel);
    limparDestaques(cards);

    const cardsFiltrados = filtrarCards(
        cards,
        normalizarTexto(nome),
        normalizarTexto(cidade),
        normalizarTexto(bairro)
    );

    exibirCardsFiltrados(cards, cardsFiltrados);

    textoResultado.textContent = `Encontramos ${cardsFiltrados.length} posto(s) para sua busca`;

    if (cardsFiltrados.length === 0) {
        mostrarPopupErro("Nenhum posto encontrado");
        return;
    }

    const melhorCard = encontrarMelhorCard(cardsFiltrados);

    if (melhorCard) {
        destacarMelhorCard(melhorCard);
        ordenarCards(cardsFiltrados);
    }

    estadoVazio.classList.add("oculto");
    resultadosBusca.classList.add("ativo");
});

function filtrarCards(cards, nomeDigitado, cidadeDigitada, bairroDigitado) {
    return cards.filter(function (card) {
        const nomePosto = normalizarTexto(
            card.querySelector(".dados-posto h3").textContent
        );

        const bairroCidade = normalizarTexto(
            card.querySelector(".bairro-cidade").textContent
        );

        const nomeOk = nomeDigitado === "" || nomePosto.includes(nomeDigitado);
        const cidadeOk = cidadeDigitada === "" || bairroCidade.includes(cidadeDigitada);
        const bairroOk = bairroDigitado === "" || bairroCidade.includes(bairroDigitado);

        return nomeOk && cidadeOk && bairroOk;
    });
}

function exibirCardsFiltrados(todos, filtrados) {
    todos.forEach(function (card) {
        card.style.display = "none";
    });

    filtrados.forEach(function (card) {
        card.style.display = "block";
    });
}

function atualizarCards(cards, combustivelSelecionado) {
    cards.forEach(function (card) {
        const tipoCombustivel = card.querySelector(".tipo-combustivel");
        const valorPrincipal = card.querySelector(".valor-principal");

        let precoSelecionado = "";
        let nomeCombustivel = "";

        if (combustivelSelecionado === "gasolina-aditivada") {
            precoSelecionado = card.querySelector(".preco-gasolina-aditivada").textContent.trim();
            nomeCombustivel = "Gasolina Aditivada";
        } else if (combustivelSelecionado === "gasolina") {
            precoSelecionado = card.querySelector(".preco-gasolina").textContent.trim();
            nomeCombustivel = "Gasolina";
        } else if (combustivelSelecionado === "etanol") {
            precoSelecionado = card.querySelector(".preco-etanol").textContent.trim();
            nomeCombustivel = "Etanol";
        } else if (combustivelSelecionado === "diesel") {
            precoSelecionado = card.querySelector(".preco-diesel").textContent.trim();
            nomeCombustivel = "Diesel";
        } else {
            precoSelecionado = card.querySelector(".preco-gasolina").textContent.trim();
            nomeCombustivel = "Gasolina";
        }

        tipoCombustivel.textContent = nomeCombustivel;
        valorPrincipal.textContent = precoSelecionado;
    });
}

function limparDestaques(cards) {
    cards.forEach(function (card) {
        card.classList.remove("destaque");

        const valorPrincipal = card.querySelector(".valor-principal");
        valorPrincipal.classList.remove("melhor");

        const seloAntigo = card.querySelector(".melhor-preco");
        if (seloAntigo) {
            seloAntigo.remove();
        }
    });
}

function encontrarMelhorCard(cards) {
    let melhorCard = null;
    let menorPreco = Infinity;

    cards.forEach(function (card) {
        const valorPrincipal = card.querySelector(".valor-principal");
        const precoNumero = converterPrecoParaNumero(valorPrincipal.textContent);

        if (precoNumero < menorPreco) {
            menorPreco = precoNumero;
            melhorCard = card;
        }
    });

    return melhorCard;
}

function destacarMelhorCard(card) {
    card.classList.add("destaque");

    const valorPrincipal = card.querySelector(".valor-principal");
    valorPrincipal.classList.add("melhor");

    let linhaTitulo = card.querySelector(".linha-titulo");

    if (!linhaTitulo) {
        const h3 = card.querySelector(".dados-posto h3");

        linhaTitulo = document.createElement("div");
        linhaTitulo.className = "linha-titulo";

        h3.parentNode.insertBefore(linhaTitulo, h3);
        linhaTitulo.appendChild(h3);
    }

    const selo = document.createElement("span");
    selo.className = "melhor-preco";
    selo.textContent = "Melhor Preço";
    linhaTitulo.appendChild(selo);
}

function ordenarCards(cards) {
    const containerResultados = document.querySelector(".resultados-busca");

    const cardsOrdenados = cards.sort(function (a, b) {
        const precoA = converterPrecoParaNumero(
            a.querySelector(".valor-principal").textContent
        );

        const precoB = converterPrecoParaNumero(
            b.querySelector(".valor-principal").textContent
        );

        return precoA - precoB;
    });

    cardsOrdenados.forEach(function (card) {
        containerResultados.appendChild(card);
    });
}

function converterPrecoParaNumero(precoTexto) {
    return parseFloat(
        precoTexto
            .replace("R$", "")
            .trim()
            .replace(/\./g, "")
            .replace(",", ".")
    );
}

function mostrarPopupErro(mensagem) {
    const popup = document.querySelector("#popup-erro");
    const texto = document.querySelector("#popup-texto");

    texto.textContent = mensagem;
    popup.classList.add("ativo");

    setTimeout(() => {
        popup.classList.remove("ativo");
    }, 3000);
}