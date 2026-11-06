// BANCO DE DADOS DOS JOGADORES (Ajuste os caminhos das suas imagens aqui)
const elenco = [
  {
    id: "mbappe",
    nome: "Mbappé",
    posicao: "ATA",
    status: "Titular",
    top: "20%", left: "50%",
    imgAnimada: "imagens/mbappe_animada.webp",
    imgEstatica: "imagens/mbappe_estatica.png",
    imgAtributos: "imagens/mbappe_atributos.png",
    stats: { partidas: 12, gols: 15, assistencias: 4, mvp: 3 }
  },
  {
    id: "vini",
    nome: "Vini Jr.",
    posicao: "ME",
    status: "Titular",
    top: "35%", left: "20%",
    imgAnimada: "imagens/vini_animada.webp",
    imgEstatica: "imagens/vini_estatica.png",
    imgAtributos: "imagens/vini_atributos.png",
    stats: { partidas: 12, gols: 8, assistencias: 9, mvp: 2 }
  },
  {
    id: "baggio",
    nome: "R. Baggio",
    posicao: "MEI",
    status: "Titular",
    top: "38%", left: "50%",
    imgAnimada: "imagens/baggio_animada.webp",
    imgEstatica: "imagens/baggio_estatica.png",
    imgAtributos: "imagens/baggio_atributos.png",
    stats: { partidas: 10, gols: 6, assistencias: 7, mvp: 1 }
  },
  {
    id: "lamine",
    nome: "Lamine Yamal",
    posicao: "MD",
    status: "Titular",
    top: "35%", left: "80%",
    imgAnimada: "imagens/yamal_animada.webp",
    imgEstatica: "imagens/yamal_estatica.png",
    imgAtributos: "imagens/yamal_atributos.png",
    stats: { partidas: 0, gols: 2, assistencias: 4, mvp: 0 }
  },
  {
    id: "makelele",
    nome: "Makélélé",
    posicao: "VOL",
    status: "Titular",
    top: "55%", left: "35%",
    imgAnimada: "imagens/makelele_animada.webp",
    imgEstatica: "imagens/makelele_estatica.png",
    imgAtributos: "imagens/makelele_atributos.png",
    stats: { partidas: 12, gols: 1, assistencias: 3, mvp: 0 }
  },
  {
    id: "rodri",
    nome: "Rodri",
    posicao: "VOL",
    status: "Titular",
    top: "55%", left: "65%",
    imgAnimada: "imagens/rodri_animada.webp",
    imgEstatica: "imagens/rodri_estatica.png",
    imgAtributos: "imagens/rodri_atributos.png",
    stats: { partidas: 11, gols: 2, assistencias: 5, mvp: 1 }
  },
  {
    id: "cucurella",
    nome: "Cucurella",
    posicao: "LE",
    status: "Titular",
    top: "72%", left: "15%",
    imgAnimada: "imagens/cucurella_animada.webp",
    imgEstatica: "imagens/cucurella_estatica.png",
    imgAtributos: "imagens/cucurella_atributos.png",
    stats: { partidas: 10, gols: 0, assistencias: 2, mvp: 0 }
  },
  {
    id: "maldini",
    nome: "Maldini",
    posicao: "ZAG",
    status: "Titular",
    top: "75%", left: "38%",
    imgAnimada: "imagens/maldini_animada.webp",
    imgEstatica: "imagens/maldini_estatica.png",
    imgAtributos: "imagens/maldini_atributos.png",
    stats: { partidas: 12, gols: 1, assistencias: 0, mvp: 1 }
  },
  {
    id: "gabriel",
    nome: "Gabriel",
    posicao: "ZAG",
    status: "Titular",
    top: "75%", left: "62%",
    imgAnimada: "imagens/gabriel_animada.webp",
    imgEstatica: "imagens/gabriel_estatica.png",
    imgAtributos: "imagens/gabriel_atributos.png",
    stats: { partidas: 12, gols: 2, assistencias: 0, mvp: 0 }
  },
  {
    id: "marcos",
    nome: "Marcos Llorente",
    posicao: "LD",
    status: "Titular",
    top: "72%", left: "85%",
    imgAnimada: "imagens/marcos_animada.webp",
    imgEstatica: "imagens/marcos_estatica.png",
    imgAtributos: "imagens/marcos_atributos.png",
    stats: { partidas: 11, gols: 1, assistencias: 3, mvp: 0 }
  },
  {
    id: "cech",
    nome: "Čech",
    posicao: "GOL",
    status: "Titular",
    top: "90%", left: "50%",
    imgAnimada: "imagens/cech_animada.webp",
    imgEstatica: "imagens/cech_estatica.png",
    imgAtributos: "imagens/cech_atributos.png",
    stats: { partidas: 12, gols: 0, assistencias: 0, mvp: 0 }
  },
  {
    id: "ronaldinho",
    nome: "Ronaldinho",
    posicao: "PE",
    status: "Reserva",
    imgAnimada: "imagens/ronaldinho_animada.webp",
    imgEstatica: "imagens/ronaldinho_estatica.png",
    imgAtributos: "imagens/ronaldinho_atributos.png",
    stats: { partidas: 5, gols: 3, assistencias: 2, mvp: 1 }
  },
  {
    id: "messi",
    nome: "Messi",
    posicao: "AD",
    status: "Reserva",
    imgAnimada: "imagens/messi_animada.webp",
    imgEstatica: "imagens/messi_estatica.png",
    imgAtributos: "imagens/messi_atributos.png",
    stats: { partidas: 4, gols: 2, assistencias: 1, mvp: 0 }
  }
];

// RENDERIZAR JOGADORES NO CAMPO (Cartas Animadas)
function renderizarCampo() {
  const campo = document.getElementById("campo");
  campo.innerHTML = "";

  elenco.filter(j => j.status === "Titular").forEach(jogador => {
    const el = document.createElement("div");
    el.className = "jogador-campo";
    el.style.top = jogador.top;
    el.style.left = jogador.left;
    el.onclick = () => abrirModal(jogador.id);

    el.innerHTML = `
      <img src="${jogador.imgAnimada}" alt="${jogador.nome}" onerror="this.src='${jogador.imgEstatica}'">
      <span class="tag-nome">${jogador.nome}</span>
    `;

    campo.appendChild(el);
  });
}

// RENDERIZAR BANCO DE RESERVAS E ELENCO (Cartas PNG Fixas)
function renderizarElenco() {
  const grid = document.getElementById("elenco-grid");
  grid.innerHTML = "";

  elenco.forEach(jogador => {
    const card = document.createElement("div");
    card.className = "card-elenco";
    card.onclick = () => abrirModal(jogador.id);

    card.innerHTML = `
      <img src="${jogador.imgEstatica}" alt="${jogador.nome}">
      <div class="nome-jogador">${jogador.nome}</div>
      <div class="status-tag">(${jogador.status})</div>
    `;

    grid.appendChild(card);
  });
}

// ABRIR MODAL EXPANDIDO COM ESTATÍSTICAS
function abrirModal(id) {
  const jogador = elenco.find(j => j.id === id);
  if (!jogador) return;

  const part = jogador.stats.partidas;
  const gols = jogador.stats.gols;
  const ass = jogador.stats.assistencias;
  const partDiretas = gols + ass;
  const media = part > 0 ? (gols / part).toFixed(2) : "0.00";

  document.getElementById("modal-nome").innerText = jogador.nome;
  document.getElementById("modal-img-atributos").src = jogador.imgAtributos;
  document.getElementById("modal-img-atributos").onerror = function() {
    this.src = jogador.imgEstatica; // Fallback se a imagem de atributos não existir
  };

  document.getElementById("stat-partidas").innerText = part;
  document.getElementById("stat-gols").innerText = gols;
  document.getElementById("stat-assistencias").innerText = ass;
  document.getElementById("stat-participacoes").innerText = partDiretas;
  document.getElementById("stat-mvp").innerText = jogador.stats.mvp;
  document.getElementById("stat-media").innerText = media;

  document.getElementById("modal-container").classList.remove("hidden");
}

function fecharModal() {
  document.getElementById("modal-container").classList.add("hidden");
}

// INICIALIZAR
document.addEventListener("DOMContentLoaded", () => {
  renderizarCampo();
  renderizarElenco();
});
