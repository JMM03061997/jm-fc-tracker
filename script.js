// BANCO DE DADOS DOS JOGADORES (JM FC Tracker 2.8)
const elenco = [
  { id: "mbappe", nome: "Mbappé", posicao: "ATA", status: "Titular", top: "18%", left: "50%", imgAnimada: "mbappe_animada.webp", imgEstatica: "mbappe_estatica.png", imgAtributos: "mbappe_atributos.png", stats: { partidas: 12, gols: 15, assistencias: 4, mvp: 3 } },
  { id: "vini", nome: "Vini Jr.", posicao: "ME", status: "Titular", top: "34%", left: "22%", imgAnimada: "vini_animada.webp", imgEstatica: "vini_estatica.png", imgAtributos: "vini_atributos.png", stats: { partidas: 12, gols: 8, assistencias: 9, mvp: 2 } },
  { id: "baggio", nome: "R. Baggio", posicao: "MEI", status: "Titular", top: "38%", left: "50%", imgAnimada: "baggio_animada.webp", imgEstatica: "baggio_estatica.png", imgAtributos: "baggio_atributos.png", stats: { partidas: 10, gols: 6, assistencias: 7, mvp: 1 } },
  { id: "lamine", nome: "Lamine Yamal", posicao: "MD", status: "Titular", top: "34%", left: "78%", imgAnimada: "yamal_animada.webp", imgEstatica: "yamal_estatica.png", imgAtributos: "yamal_atributos.png", stats: { partidas: 0, gols: 2, assistencias: 4, mvp: 0 } },
  { id: "makelele", nome: "Makélélé", posicao: "VOL", status: "Titular", top: "54%", left: "35%", imgAnimada: "makelele_animada.webp", imgEstatica: "makelele_estatica.png", imgAtributos: "makelele_atributos.png", stats: { partidas: 12, gols: 1, assistencias: 3, mvp: 0 } },
  { id: "rodri", nome: "Rodri", posicao: "VOL", status: "Titular", top: "54%", left: "65%", imgAnimada: "rodri_animada.webp", imgEstatica: "rodri_estatica.png", imgAtributos: "rodri_atributos.png", stats: { partidas: 11, gols: 2, assistencias: 5, mvp: 1 } },
  { id: "cucurella", nome: "Cucurella", posicao: "LE", status: "Titular", top: "72%", left: "16%", imgAnimada: "cucurella_animada.webp", imgEstatica: "cucurella_estatica.png", imgAtributos: "cucurella_atributos.png", stats: { partidas: 10, gols: 0, assistencias: 2, mvp: 0 } },
  { id: "maldini", nome: "Maldini", posicao: "ZAG", status: "Titular", top: "74%", left: "38%", imgAnimada: "maldini_animada.webp", imgEstatica: "maldini_estatica.png", imgAtributos: "maldini_atributos.png", stats: { partidas: 12, gols: 1, assistencias: 0, mvp: 1 } },
  { id: "gabriel", nome: "Gabriel", posicao: "ZAG", status: "Titular", top: "74%", left: "62%", imgAnimada: "gabriel_animada.webp", imgEstatica: "gabriel_estatica.png", imgAtributos: "gabriel_atributos.png", stats: { partidas: 12, gols: 2, assistencias: 0, mvp: 0 } },
  { id: "marcos", nome: "Marcos Llorente", posicao: "LD", status: "Titular", top: "72%", left: "84%", imgAnimada: "marcos_animada.webp", imgEstatica: "marcos_estatica.png", imgAtributos: "marcos_atributos.png", stats: { partidas: 11, gols: 1, assistencias: 3, mvp: 0 } },
  { id: "cech", nome: "Čech", posicao: "GOL", status: "Titular", top: "88%", left: "50%", imgAnimada: "cech_animada.webp", imgEstatica: "cech_estatica.png", imgAtributos: "cech_atributos.png", stats: { partidas: 12, gols: 0, assistencias: 0, mvp: 0 } },
  { id: "ronaldinho", nome: "Ronaldinho", posicao: "PE", status: "Reserva", imgAnimada: "ronaldinho_animada.webp", imgEstatica: "ronaldinho_estatica.png", imgAtributos: "ronaldinho_atributos.png", stats: { partidas: 5, gols: 3, assistencias: 2, mvp: 1 } },
  { id: "messi", nome: "Messi", posicao: "AD", status: "Reserva", imgAnimada: "messi_animada.webp", imgEstatica: "messi_estatica.png", imgAtributos: "messi_atributos.png", stats: { partidas: 4, gols: 2, assistencias: 1, mvp: 0 } }
];

function renderizarCampo() {
  const campo = document.getElementById("campo");
  if (!campo) return;
  campo.innerHTML = "";

  elenco.filter(j => j.status === "Titular").forEach(jogador => {
    const el = document.createElement("div");
    el.className = "jogador-campo";
    el.style.top = jogador.top;
    el.style.left = jogador.left;
    
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      abrirModal(jogador.id);
    });

    el.innerHTML = `
      <img src="${jogador.imgAnimada}" alt="${jogador.nome}" onerror="this.style.visibility='hidden'">
      <span class="tag-nome">${jogador.nome}</span>
    `;

    campo.appendChild(el);
  });
}

function renderizarElenco() {
  const grid = document.getElementById("elenco-grid");
  if (!grid) return;
  grid.innerHTML = "";

  elenco.forEach(jogador => {
    const card = document.createElement("div");
    card.className = "card-elenco";
    
    card.addEventListener("click", (e) => {
      e.stopPropagation();
      abrirModal(jogador.id);
    });

    card.innerHTML = `
      <img src="${jogador.imgEstatica}" alt="${jogador.nome}" onerror="this.style.visibility='hidden'">
      <div class="nome-jogador">${jogador.nome}</div>
      <div class="status-tag">(${jogador.status})</div>
    `;

    grid.appendChild(card);
  });
}

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

function fecharModalFora(event) {
  if (event.target.id === "modal-container") {
    fecharModal();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderizarCampo();
  renderizarElenco();
});
