/* VIDI Brechó — Provador Virtual (peças ilustradas em SVG, ajustadas ao corpo) */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (id) { return document.getElementById(id); };
  var SLOTS = ["top", "bottom", "shoes"];

  /* ---------- Catálogo de exemplo (cores da paleta da loja) ---------- */
  var CATALOG = {
    fem: {
      top: [
        { name: "Blusa de seda off-white", kind: "blouse",   color: "#f3ead9" },
        { name: "Camisa de linho cru",     kind: "shirt",    color: "#d6c0a0" },
        { name: "Cardigan de crochê",      kind: "cardigan", color: "#a47c5b" },
        { name: "Casaco de lã",            kind: "coat",     color: "#4e3424" }
      ],
      bottom: [
        { name: "Saia plissada",           kind: "pleated",  color: "#7d5a3f" },
        { name: "Calça de alfaiataria",    kind: "wide",     color: "#e8d9bf" },
        { name: "Jeans vintage",           kind: "jeans",    color: "#5f6f86" },
        { name: "Saia midi floral",        kind: "floral",   color: "#b98d6a" }
      ],
      shoes: [
        { name: "Sapatilha de couro",      kind: "flat",     color: "#2e1e14" },
        { name: "Bota cano curto",         kind: "boot",     color: "#7d5a3f" },
        { name: "Sandália retrô",          kind: "sandal",   color: "#c9a27e" }
      ]
    },
    masc: {
      top: [
        { name: "Camisa de linho",         kind: "shirt",    color: "#e8d9bf" },
        { name: "Camiseta básica",         kind: "tee",      color: "#faf5ec" },
        { name: "Jaqueta jeans",           kind: "jacket",   color: "#5f6f86" },
        { name: "Casaco de lã",            kind: "coat",     color: "#4e3424" }
      ],
      bottom: [
        { name: "Calça de alfaiataria",    kind: "tailored", color: "#c9ad8a" },
        { name: "Jeans reto",              kind: "jeans",    color: "#4f5d73" },
        { name: "Bermuda de sarja",        kind: "short",    color: "#a47c5b" }
      ],
      shoes: [
        { name: "Mocassim de couro",       kind: "loafer",   color: "#4e3424" },
        { name: "Tênis retrô",             kind: "sneaker",  color: "#f3ead9" },
        { name: "Chinelo de couro",        kind: "slide",    color: "#a47c5b" }
      ]
    }
  };
  var G = { fem: { sh: 50, w: 44, o: 48 }, masc: { sh: 62, w: 46, o: 44 } };

  /* ---------- Utilidades de desenho ---------- */
  var SKIN = "#e6c9a8", SKIN_D = "#cfa985", INK = "rgba(46,30,20,.3)";
  var DEFS =
    '<defs>' +
    '<linearGradient id="sh"><stop offset="0" stop-color="#2e1e14" stop-opacity=".24"/><stop offset=".3" stop-color="#2e1e14" stop-opacity="0"/><stop offset=".7" stop-color="#2e1e14" stop-opacity="0"/><stop offset="1" stop-color="#2e1e14" stop-opacity=".24"/></linearGradient>' +
    '<pattern id="cro" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="1.7" fill="#faf5ec" opacity=".3"/></pattern>' +
    '<pattern id="fl" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="6" cy="6" r="2.8" fill="#faf5ec" opacity=".8"/><circle cx="6" cy="6" r="1" fill="#a47c5b"/><circle cx="17" cy="16" r="2.2" fill="#e8d9bf" opacity=".85"/></pattern>' +
    '</defs>';

  function shade(h, p) {
    var n = parseInt(h.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    var t = p < 0 ? 0 : 255, q = Math.abs(p);
    return "#" + ((1 << 24) + (Math.round((t - r) * q + r) << 16) + (Math.round((t - g) * q + g) << 8) + Math.round((t - b) * q + b)).toString(16).slice(1);
  }
  function mir(s) { return s + '<g transform="translate(300 0) scale(-1 1)">' + s + '</g>'; }
  function part(d, c, extra) {
    return '<path d="' + d + '" fill="' + c + '" stroke="' + INK + '" stroke-width="1.5" stroke-linejoin="round"' + (extra || "") + '/>' +
           '<path d="' + d + '" fill="url(#sh)"/>';
  }
  function ln(d, stroke, w, dash) {
    return '<path d="' + d + '" fill="none" stroke="' + stroke + '" stroke-width="' + (w || 1.2) + '" stroke-linecap="round"' + (dash ? ' stroke-dasharray="' + dash + '"' : "") + '/>';
  }
  function svg(inner, extraStyle) {
    return '<svg viewBox="0 0 300 640" xmlns="http://www.w3.org/2000/svg" style="' + (extraStyle || "") + '">' + DEFS + inner + '</svg>';
  }

  /* ---------- Corpos ---------- */
  function body(g) {
    var fem = g === "fem", hair = fem ? "#4e3424" : "#2e1e14", s = "";
    if (fem) s += '<path d="M104 112C98 52 126 22 150 22s52 30 46 90c-1 34 8 64 12 92-18-18-22-46-24-72-16 8-62 8-78 0-2 26-6 54-24 72 4-28 13-58 0-92z" fill="' + hair + '"/>';
    s += '<rect x="138" y="108" width="24" height="40" fill="' + SKIN_D + '"/>';
    s += '<ellipse cx="150" cy="82" rx="28" ry="35" fill="' + SKIN + '"/>';
    s += fem ? '<path d="M121 72c10-14 48-14 58 0 0-22-12-38-29-38s-29 16-29 38z" fill="' + hair + '"/>'
             : '<path d="M120 76c0-34 12-46 30-46s30 12 30 46c-6-14-16-20-30-20s-24 6-30 20z" fill="' + hair + '"/>';
    var torso = fem
      ? "M100 150Q150 136 200 150L198 192Q190 230 184 262Q196 292 198 322L102 322Q104 292 116 262Q110 230 102 192Z"
      : "M88 152Q150 138 212 152L206 202Q202 240 196 270L194 322L106 322L104 270Q98 240 94 202Z";
    var arm = fem
      ? "M100 150Q82 156 80 192L70 300Q68 314 76 316Q86 318 88 304L102 204Z"
      : "M88 152Q68 160 66 198L56 302Q54 316 64 318Q76 320 78 306L96 208Z";
    var leg = fem
      ? "M102 318L149 318L146 450Q144 520 142 575L112 575Q110 520 108 450Q104 380 102 318Z"
      : "M106 318L149 318L147 450Q145 520 142 575L111 575Q109 520 107 450Q105 380 106 318Z";
    var foot = "M108 574h36l1 26q1 14-19 15-19 1-19-9z";
    s += mir(part(arm, SKIN)) + mir(part(leg, SKIN)) + part(torso, SKIN) + mir(part(foot, SKIN_D));
    return svg(s);
  }

  /* ---------- Parte de cima ---------- */
  function sleeves(sh, long, c) {
    var a = 150 - sh, d = long
      ? "M" + a + " 148Q" + (a - 16) + " 154 " + (a - 20) + " 192L" + (a - 30) + " 300L" + (a - 10) + " 304L" + (a + 4) + " 208Z"
      : "M" + a + " 148Q" + (a - 14) + " 154 " + (a - 18) + " 176L" + (a - 22) + " 206L" + (a + 4) + " 208Z";
    var extra = long ? ln("M" + (a - 30) + " 292L" + (a - 10) + " 296", INK, 1.4) : "";
    return mir(part(d, c) + extra);
  }
  function torso(sh, hw, hem, c) {
    return part("M" + (150 - sh) + " 148Q150 134 " + (150 + sh) + " 148L" + (150 + sh - 4) + " 210L" + (150 + hw) + " " + hem +
      "Q150 " + (hem + 10) + " " + (150 - hw) + " " + hem + "L" + (150 - sh + 4) + " 210Z", c);
  }
  function top(it, g) {
    var c = it.color, sh = G[g].sh, k = it.kind, s = "", dk = shade(c, -.22), lt = shade(c, .25);
    if (k === "blouse") {
      s = sleeves(sh, false, c) + torso(sh, sh + 4, 298, c) +
        '<path d="M133 141L150 178L167 141Z" fill="' + SKIN + '"/>' +
        ln("M133 141L150 178L167 141", INK, 1.2) + ln("M128 214Q150 238 172 214", "rgba(255,255,255,.4)", 1.4) +
        ln("M122 250Q150 268 178 250", "rgba(46,30,20,.14)", 1.4);
    } else if (k === "tee") {
      s = sleeves(sh, false, c) + torso(sh, sh - 2, 302, c) +
        '<path d="M130 141Q150 172 170 141Z" fill="' + SKIN + '"/>' + ln("M130 141Q150 172 170 141", INK, 1.4);
    } else if (k === "shirt" || k === "jacket") {
      var hem = k === "jacket" ? 298 : 306;
      s = sleeves(sh, true, c) + torso(sh, sh + 2, hem, c) +
        part("M137 140L150 170L127 160Z", lt) + part("M163 140L150 170L173 160Z", lt) +
        ln("M150 170L150 " + hem, INK, 1.2);
      if (k === "shirt") { for (var y = 188; y < 290; y += 30) s += '<circle cx="150" cy="' + y + '" r="2.2" fill="' + dk + '"/>'; }
      else {
        s += mir(part("M" + (150 - sh + 14) + " 192h22v26h-22z", c)) + ln("M" + (150 - sh + 4) + " 284H" + (150 - 4), dk, 1.2, "3 3") + ln("M" + (156) + " 284H" + (150 + sh - 4), dk, 1.2, "3 3");
        for (var y2 = 190; y2 < 290; y2 += 34) s += '<circle cx="150" cy="' + y2 + '" r="2.6" fill="#d6c0a0" stroke="' + INK + '" stroke-width=".8"/>';
      }
    } else if (k === "cardigan") {
      s = sleeves(sh, true, c) + torso(sh, sh + 8, 334, c) +
        '<path d="M137 141Q150 166 163 141L161 338L139 338Z" fill="#f3ead9" stroke="' + INK + '" stroke-width="1.2"/>' +
        ln("M139 150L139 336", dk, 2) + ln("M161 150L161 336", dk, 2) +
        '<path d="M' + (150 - sh) + ' 148Q150 134 ' + (150 + sh) + ' 148L' + (150 + sh - 4) + ' 210L' + (150 + sh + 8) + ' 334L161 338L163 141L137 141L139 338L' + (150 - sh - 8) + ' 334L' + (150 - sh + 4) + ' 210Z" fill="url(#cro)"/>';
    } else {
      var hw = sh + 18;
      s = sleeves(sh, true, c) + torso(sh, hw, 412, c) +
        mir(part("M150 176L121 148L127 198L147 216Z", lt)) +
        ln("M150 176L150 412", dk, 1.4) + ln("M" + (150 - hw + 14) + " 336H" + (150 - 20), dk, 1.4) + ln("M" + (150 + 20) + " 336H" + (150 + hw - 14), dk, 1.4) +
        '<circle cx="144" cy="244" r="3.2" fill="' + dk + '"/><circle cx="144" cy="296" r="3.2" fill="' + dk + '"/>' +
        ln("M" + (150 - sh + 6) + " 262Q150 274 " + (150 + sh - 6) + " 262", dk, 3);
    }
    return svg(s);
  }

  /* ---------- Parte de baixo ---------- */
  function pants(c, g, oh, ih, hem, style) {
    var o = G[g].o, w = G[g].w, dk = shade(c, -.2), cx = 150 - (o + 4) / 2, cy = 150 - (oh + ih) / 2;
    var leg = "M" + (150 - w) + " 292L150 292L" + (150 - ih) + " " + hem + "L" + (150 - oh) + " " + hem + "L" + (150 - o) + " 350Q" + (150 - o - 2) + " 320 " + (150 - w) + " 292Z";
    var det = "";
    if (style === "jeans") det = ln("M" + (150 - o + 4) + " 330L" + (150 - oh + 3) + " " + (hem - 6), "rgba(250,245,236,.5)", 1.2, "3 3") + ln("M" + (150 - w) + " 304Q" + (150 - w + 4) + " 336 " + (150 - w + 28) + " 340", "rgba(250,245,236,.55)", 1.3, "3 3");
    else if (style === "short") det = ln("M" + (150 - w + 2) + " 304Q" + (150 - w + 6) + " 332 " + (150 - w + 26) + " 336", dk, 1.2);
    else det = ln("M" + cx + " 306L" + cy + " " + (hem - 4), "rgba(46,30,20,.2)", 1.4);
    var band = part("M" + (150 - w - 1) + " 288L" + (150 + w + 1) + " 288L" + (150 + w + 1) + " 302L" + (150 - w - 1) + " 302Z", dk);
    return mir(part(leg, c) + det) + band + '<circle cx="150" cy="295" r="2.6" fill="' + shade(c, .35) + '"/>';
  }
  function bottom(it, g) {
    var c = it.color, k = it.kind, s = "", dk = shade(c, -.2);
    if (k === "wide") s = pants(c, g, 54, 3, 566, "tailored");
    else if (k === "tailored") s = pants(c, g, 50, 3, 566, "tailored");
    else if (k === "jeans") s = pants(c, g, g === "fem" ? 42 : 46, 6, 566, "jeans");
    else if (k === "short") s = pants(c, g, 52, 2, 438, "short");
    else if (k === "pleated") {
      s = part("M110 286L190 286L230 472Q150 488 70 472Z", c);
      for (var i = -4; i <= 4; i++) s += ln("M" + (150 + i * 9) + " 300L" + (150 + i * 20) + " 478", i % 2 ? "rgba(255,255,255,.22)" : "rgba(46,30,20,.2)", 1.4);
      s += part("M108 282h84v14h-84z", dk);
    } else if (k === "floral") {
      var d = "M110 288L190 288Q214 400 232 496Q220 508 205 498Q190 510 175 500Q160 510 145 500Q130 510 115 500Q100 510 85 498Q75 508 68 496Q86 400 110 288Z";
      s = part(d, c) + '<path d="' + d + '" fill="url(#fl)"/>' + part("M108 282h84v14h-84z", dk);
    }
    return svg(s);
  }

  /* ---------- Calçados ---------- */
  function shoes(it) {
    var c = it.color, k = it.kind, dk = shade(c, -.25), s = "";
    if (k === "flat") s = part("M107 588Q127 580 147 588L148 608Q147 620 127 620Q106 620 106 608Z", c) + '<path d="M115 589Q127 583 139 589Q127 596 115 589Z" fill="' + SKIN_D + '"/>' + '<circle cx="127" cy="599" r="3" fill="' + shade(c, .3) + '"/>';
    else if (k === "boot") s = part("M110 544L143 544L145 592Q152 614 127 618Q104 618 107 594Z", c) + part("M104 612Q127 623 149 612L149 621Q127 630 104 621Z", dk) + ln("M127 548L127 590", dk, 1.4);
    else if (k === "sandal") s = part("M106 610Q127 604 148 610L148 618Q127 624 106 618Z", c) + ln("M110 598Q127 586 144 598", c, 4) + ln("M112 572Q127 579 142 572", c, 3) + ln("M127 600L127 578", c, 2.4);
    else if (k === "loafer") s = part("M107 584Q127 576 147 584L148 608Q146 620 127 620Q105 620 106 608Z", c) + ln("M114 588Q127 602 140 588", dk, 1.8) + part("M106 614Q127 622 148 614L148 620Q127 627 106 620Z", dk);
    else if (k === "sneaker") s = part("M106 580Q127 574 147 582L149 606Q148 618 127 618Q105 618 106 606Z", c) + part("M104 610Q127 618 150 610L150 621Q127 629 104 621Z", "#e8d9bf") + ln("M114 590L138 590M114 598L140 598", "#a47c5b", 1.4) + ln("M106 604Q127 610 149 604", "#a47c5b", 2);
    else s = part("M106 610Q127 604 149 610L149 619Q127 625 106 619Z", dk) + part("M108 596Q127 584 146 596L146 604Q127 594 108 604Z", c);
    return svg(mir(s));
  }

  /* ---------- Estado e renderização ---------- */
  var state = { gender: "fem", idx: { top: 0, bottom: 0, shoes: 0 } };
  var BUILD = { top: top, bottom: bottom, shoes: shoes };

  function renderBody() { $("body").innerHTML = body(state.gender); }
  function renderSlot(slot, dir) {
    var item = CATALOG[state.gender][slot][state.idx[slot]];
    var layer = $("layer-" + slot);
    layer.innerHTML = BUILD[slot](item, state.gender);
    layer.firstChild.style.setProperty("--from", (dir || 1) * 16 + "px");
    $("name-" + slot).textContent = item.name;
  }
  function renderAll() { renderBody(); SLOTS.forEach(function (s) { renderSlot(s); }); }

  function change(slot, dir) {
    var n = CATALOG[state.gender][slot].length;
    state.idx[slot] = (state.idx[slot] + dir + n) % n;
    renderSlot(slot, dir);
  }
  document.querySelectorAll(".round[data-slot]").forEach(function (b) {
    b.addEventListener("click", function () { change(b.dataset.slot, parseInt(b.dataset.dir, 10)); });
  });

  var figure = $("figure");
  document.querySelectorAll(".gender__btn").forEach(function (b) {
    b.addEventListener("click", function () {
      if (b.dataset.gender === state.gender) return;
      state.gender = b.dataset.gender;
      state.idx = { top: 0, bottom: 0, shoes: 0 };
      document.querySelector(".gender").classList.toggle("is-masc", state.gender === "masc");
      document.querySelectorAll(".gender__btn").forEach(function (x) {
        var on = x === b; x.classList.toggle("is-active", on); x.setAttribute("aria-selected", on);
      });
      figure.classList.add("is-swapping");
      setTimeout(function () { renderAll(); figure.classList.remove("is-swapping"); }, reduce ? 0 : 350);
    });
  });

  $("shuffleBtn").addEventListener("click", function () {
    SLOTS.forEach(function (s) {
      state.idx[s] = Math.floor(Math.random() * CATALOG[state.gender][s].length);
      renderSlot(s, 1);
    });
  });

  function currentLook() {
    return SLOTS.map(function (s) { return CATALOG[state.gender][s][state.idx[s]].name; }).join(" + ");
  }

  /* =====================================================
     MENTORA DE LOOKS (IA gratuita, sem chave de API)
     Usa o serviço aberto Pollinations (text.pollinations.ai).
     Se falhar, responde com dicas locais.
     ===================================================== */
  var AI_URL = "https://text.pollinations.ai/openai";
  var history = [];
  var log = $("chatLog");

  function systemPrompt() {
    return "Você é a Mentora VIDI, consultora de estilo do brechó VIDI (moda circular, peças únicas, paleta bege e marrom). " +
      "Responda sempre em português do Brasil, com tom caloroso, elegante e objetivo (máx. 5 frases). " +
      "Dê sugestões de combinação, cores, acessórios e ocasiões; valorize consumo consciente e peças de brechó. " +
      "Não invente preços nem estoque. Look atual do cliente (" + (state.gender === "fem" ? "feminino" : "masculino") + "): " + currentLook() + ".";
  }

  function addMsg(text, who) {
    var m = document.createElement("div");
    m.className = "msg msg--" + who;
    m.textContent = text;
    log.appendChild(m);
    log.scrollTop = log.scrollHeight;
    return m;
  }
  function typing() {
    var t = document.createElement("div");
    t.className = "msg msg--bot msg--typing";
    t.innerHTML = "<i></i><i></i><i></i>";
    log.appendChild(t); log.scrollTop = log.scrollHeight;
    return t;
  }

  function localAnswer() {
    var tips = [
      "Gosto da base que você montou: " + currentLook() + ". Para equilibrar, mantenha duas cores neutras e deixe uma peça ser a protagonista. Um cinto de couro ou uma bolsa retrô fecham muito bem.",
      "Esse look tem boa harmonia de tons terrosos. Se quiser algo mais elegante, troque o calçado por um de couro liso e aposte em acessórios discretos.",
      "Para um visual mais casual, afrouxe a alfaiataria: combine uma peça estruturada com outra mais solta. Camadas leves, como um casaco por cima, dão personalidade."
    ];
    return tips[Math.floor(Math.random() * tips.length)] + "\n\n(Estou no modo offline agora, mas já posso ajudar com dicas gerais.)";
  }

  async function ask(text) {
    if (!text.trim()) return;
    addMsg(text, "user");
    history.push({ role: "user", content: text });
    var t = typing();
    $("chatStatus").textContent = "pensando…";
    var answer;
    try {
      var ctrl = new AbortController();
      var to = setTimeout(function () { ctrl.abort(); }, 20000);
      var res = await fetch(AI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: ctrl.signal,
        body: JSON.stringify({
          model: "openai",
          messages: [{ role: "system", content: systemPrompt() }].concat(history.slice(-8))
        })
      });
      clearTimeout(to);
      if (!res.ok) throw new Error("HTTP " + res.status);
      var data = await res.json();
      answer = data.choices && data.choices[0] && data.choices[0].message.content;
      if (!answer) throw new Error("vazio");
    } catch (e) {
      answer = localAnswer();
    }
    t.remove();
    history.push({ role: "assistant", content: answer });
    addMsg(answer.trim(), "bot");
    $("chatStatus").textContent = "pronta para ajudar";
  }

  $("chatForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var v = $("chatInput").value;
    $("chatInput").value = "";
    ask(v);
  });
  document.querySelectorAll(".chip").forEach(function (c) {
    c.addEventListener("click", function () { ask(c.textContent); });
  });
  $("askBtn").addEventListener("click", function () {
    $("mentora").scrollIntoView({ behavior: "smooth" });
    ask("O que você acha deste look: " + currentLook() + "? Como posso melhorá-lo?");
  });

  /* ---------- Início ---------- */
  addMsg("Olá! Sou a Mentora VIDI. Monte um look no provador e me conte a ocasião: eu ajudo a combinar as peças.", "bot");
  renderAll();
  $("year").textContent = new Date().getFullYear();
})();