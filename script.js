// BANCO DE DADOS DOS JOGADORES (JM FC Tracker 3.0)
let elenco = JSON.parse(localStorage.getItem('jm_elenco')) || [
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

let historicoPartidas = JSON.parse(localStorage.getItem('jm_historico')) || [];

function salvarDados() {
  localStorage.setItem('jm_elenco', JSON.stringify(elenco));
  localStorage.setItem('jm_historico', JSON.stringify(historicoPartidas));
}

// NAVEGAÇÃO ENTRE ABAS
function trocarAba(nomeAba) {
  document.querySelectorAll('.aba-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.conteudo-aba').forEach(aba => aba.classList.remove('active'));

  const btnAtivo = Array.from(document.querySelectorAll('.aba-btn')).find(b => b.getAttribute('onclick').includes(nomeAba));
  if (btnAtivo) btnAtivo.classList.add('active');

  const abaAtiva = document.getElementById(`aba-${nomeAba}`);
  if (abaAtiva) abaAtiva.classList.add('active');

  if (nomeAba === 'artilharia') renderizarArtilharia();
  if (nomeAba === 'nova-partida') renderizarFormularioPartida();
  if (nomeAba === 'historico') renderizarHistorico();
}

// RENDERIZAR CAMPO E ELENCO
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

// RENDERIZAR FORMULÁRIO DE NOVA PARTIDA
function renderizarFormularioPartida() {
  const container = document.getElementById('lista-participantes');
  if (!container) return;
  container.innerHTML = '';

  elenco.forEach(j => {
    const div = document.createElement('div');
    div.className = 'item-participante';
    div.innerHTML = `
      <span><strong>${j.nome}</strong> (${j.status})</span>
      <div class="inputs-partida">
        <label>Gols:</label>
        <input type="number" id="gols-${j.id}" min="0" value="0">
        <label>Assis:</label>
        <input type="number" id="assis-${j.id}" min="0" value="0">
        <label>MVP?</label>
        <input type="checkbox" id="mvp-${j.id}">
      </div>
    `;
    container.appendChild(div);
  });
}

function salvarPartida(e) {
  e.preventDefault();
  const adv = document.getElementById('adversario').value;
  const gPro = parseInt(document.getElementById('gols-pro').value) || 0;
  const gContra = parseInt(document.getElementById('gols-contra').value) || 0;

  elenco.forEach(j => {
    const g = parseInt(document.getElementById(`gols-${j.id}`).value) || 0;
    const a = parseInt(document.getElementById(`assis-${j.id}`).value) || 0;
    const isMvp = document.getElementById(`mvp-${j.id}`).checked;

    if (g > 0 || a > 0 || isMvp) {
      j.stats.partidas += 1;
      j.stats.gols += g;
      j.stats.assistencias += a;
      if (isMvp) j.stats.mvp += 1;
    }
  });

  historicoPartidas.unshift({
    data: new Date().toLocaleDateString('pt-BR'),
    adversario: adv,
    placar: `${gPro} x ${gContra}`
  });

  salvarDados();
  alert('Partida registrada com sucesso!');
  trocarAba('elenco');
  renderizarCampo();
  renderizarElenco();
}

// RENDERIZAR HISTÓRICO
function renderizarHistorico() {
  const div = document.getElementById('lista-historico');
  if (!div) return;

  if (historicoPartidas.length === 0) {
    div.innerHTML = '<p class="empty-msg">Nenhuma partida registrada ainda.</p>';
    return;
  }

  div.innerHTML = historicoPartidas.map(p => `
    <div class="item-participante">
      <span><strong>vs ${p.adversario}</strong> (${p.data})</span>
      <span style="font-weight:bold; color:#38bdf8;">${p.placar}</span>
    </div>
  `).join('');
}

// RENDERIZAR ARTILHARIA
function renderizarArtilharia() {
  const corpo = document.getElementById('corpo-artilharia');
  if (!corpo) return;

  const ordenados = [...elenco].sort((a, b) => b.stats.gols - a.stats.gols || b.stats.assistencias - a.stats.assistencias);

  corpo.innerHTML = ordenados.map((j, i) => `
    <tr>
      <td>${i + 1}º</td>
      <td><strong>${j.nome}</strong></td>
      <td>${j.stats.partidas}</td>
      <td style="color:#22c55e; font-weight:bold;">${j.stats.gols}</td>
      <td>${j.stats.assistencias}</td>
      <td style="color:#eab308; font-weight:bold;">${j.stats.mvp}</td>
    </tr>
  `).join('');
}

// MODAL DE ESTATÍSTICAS
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
