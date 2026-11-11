/**
 * Feminario — Calculadora Femi Portafolio
 * 1) Guarda en la hoja "Calculadora" cada registro (nombre, correo y celular, con autorización)
 *    y cada cálculo que hace la persona.
 * 2) Cuando la persona calcula, le envía su resultado por correo.
 *
 * Instalación: Hoja de cálculo → Extensiones → Apps Script → pega este archivo →
 * Implementar → Administrar implementaciones → editar → Versión: NUEVA VERSIÓN → Implementar.
 * Ejecutar como YO · Acceso: Cualquier persona. La primera vez Google pide permiso para enviar correos: acéptalo.
 * El correo sale desde la cuenta con la que implementas.
 */
var HOJA = "Calculadora";
var URL_PAGINA = "https://feminario.github.io/Femi-portafolio/";
var COLS = ["Fecha", "Evento", "Nombre", "Correo", "Celular", "Autorizó datos", "Portafolio", "Mezcla",
  "Aporte mensual COP", "Aporte mensual USD", "Año inicio", "Aportado COP", "Valor final COP", "Valor final USD",
  "Origen", "Correo enviado"];
var MAX_CORREOS_POR_PERSONA = 3;   // cada 6 horas, para que nadie reciba decenas de correos
var MAX_CORREOS_TOTAL = 250;       // cada 6 horas, para cuidar la cuota de Google

function hoja_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(HOJA);
  if (!sh) {
    sh = ss.insertSheet(HOJA);
    sh.appendRow(COLS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, COLS.length).setFontWeight("bold").setBackground("#C2CBFF");
    return { sh: sh, head: COLS.slice() };
  }
  // Si la hoja ya existía con otras columnas, agrega las que falten a la derecha
  var ult = Math.max(sh.getLastColumn(), 1);
  var head = sh.getRange(1, 1, 1, ult).getValues()[0].map(String);
  COLS.forEach(function (c) {
    if (head.indexOf(c) < 0) {
      head.push(c);
      sh.getRange(1, head.length).setValue(c).setFontWeight("bold").setBackground("#C2CBFF");
    }
  });
  return { sh: sh, head: head };
}

function limpio_(v) {
  if (typeof v !== "string") return v;
  return v.slice(0, 300).replace(/^[=+\-@]/, "'$&"); // evita fórmulas
}

function esc_(t) {
  return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}
function miles_(n) {
  n = Math.round(Number(n) || 0);
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var d = JSON.parse(e.postData.contents);
    var correo = String(d["Correo"] || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) return out_({ ok: false, error: "correo" });
    d["Correo"] = correo;

    var evento = d["Evento"] === "resultado" ? "resultado" : "registro";
    d["Evento"] = evento;
    // Si la página reintenta con el mismo Id, no se duplica la fila ni el correo
    var cacheId = CacheService.getScriptCache(), kId = "id:" + (d["Id"] || "");
    if (d["Id"] && cacheId.get(kId)) return out_({ ok: true, emailed: cacheId.get(kId) === "1", duplicado: true });
    var enviado = "";
    var motivo = "";

    if (evento === "resultado" && d["Autorizó datos"] === "Sí") {
      var r = enviarResultado_(d);
      enviado = r.ok ? "Sí" : "No: " + r.motivo;
      motivo = r.motivo || "";
    }
    d["Correo enviado"] = enviado;

    var h = hoja_();
    var fila = h.head.map(function (c) { return d[c] !== undefined ? limpio_(d[c]) : ""; });
    h.sh.appendRow(fila);
    if (d["Id"]) cacheId.put(kId, enviado === "Sí" ? "1" : "0", 21600);
    return out_({ ok: true, emailed: enviado === "Sí", motivo: motivo });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  } finally { lock.releaseLock(); }
}

function enviarResultado_(d) {
  var cache = CacheService.getScriptCache();
  var kP = "p:" + d["Correo"], kT = "t:total";
  var nP = Number(cache.get(kP) || 0), nT = Number(cache.get(kT) || 0);
  if (nP >= MAX_CORREOS_POR_PERSONA) return { ok: false, motivo: "limite-persona" };
  if (nT >= MAX_CORREOS_TOTAL) return { ok: false, motivo: "limite-total" };
  try {
    var nombre = String(d["Nombre"] || "").split(" ")[0] || "";
    var html =
      '<div style="font-family:Arial,Helvetica,sans-serif;background:#F8F7F2;padding:24px">' +
      '<div style="max-width:560px;margin:auto;background:#fff;border-radius:24px;padding:28px;color:#3A3550">' +
      '<h2 style="margin:0 0 6px;color:#4C4F68">' + (nombre ? "Hola, " + esc_(nombre) + " 💜" : "Hola 💜") + '</h2>' +
      '<p style="margin:0 0 16px">Este es el resultado de tu simulación en la Calculadora Femi Portafolio.</p>' +
      '<div style="background:#F9E1FF;border-radius:18px;padding:16px 18px;margin-bottom:14px">' +
      '<div style="font-size:13px;color:#7E84AE;font-weight:bold">' + esc_(d["Portafolio"]) + '</div>' +
      '<div style="font-size:13px;margin-top:4px">Aporte de $' + miles_(d["Aporte mensual COP"]) + ' pesos al mes, desde ' + esc_(d["Año inicio"]) + ' hasta el 31 de diciembre de 2025.</div>' +
      '<div style="font-size:30px;font-weight:bold;color:#4C4F68;margin-top:10px">$' + miles_(d["Valor final COP"]) + ' <span style="font-size:14px;color:#7E84AE">pesos</span></div>' +
      '<div style="font-size:16px;color:#7E84AE;font-weight:bold">US$' + miles_(d["Valor final USD"]) + ' dólares</div>' +
      '</div>' +
      '<p style="margin:0 0 6px"><b>Lo que pusiste de tu bolsillo:</b> $' + miles_(d["Aportado COP"]) + ' pesos.</p>' +
      (d["Mejor"] ? '<p style="margin:0 0 6px"><b>Mejor año:</b> ' + esc_(d["Mejor"]) + '</p>' : '') +
      (d["Peor"] ? '<p style="margin:0 0 6px"><b>Peor año:</b> ' + esc_(d["Peor"]) + '</p>' : '') +
      '<p style="margin:14px 0 0"><a href="' + URL_PAGINA + '" style="background:#7E84AE;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:bold;display:inline-block">Probar con otro portafolio</a></p>' +
      '<p style="font-size:11.5px;color:#8A90B8;margin:22px 0 0;line-height:1.5"><b>Contenido exclusivamente educativo.</b> Es una simulación con datos históricos: no constituye una recomendación profesional para realizar inversiones en los términos del artículo 2.40.1.1.2 del Decreto 2555 de 2010 ni es asesoría financiera, legal o tributaria. Las rentabilidades pasadas no garantizan resultados futuros y puedes perder parte o la totalidad de lo invertido. Los valores en pesos usan el dólar de cierre de 2025 y no incluyen comisiones ni impuestos. Antes de invertir, consulta a un profesional autorizado.</p>' +
      '<p style="font-size:11.5px;color:#8A90B8;margin:10px 0 0">Recibes este correo porque autorizaste a Feminario a enviarte tu resultado y contenido. Si no quieres recibir más, respóndenos y te retiramos.</p>' +
      '</div></div>';
    MailApp.sendEmail({
      to: d["Correo"],
      subject: "Tu resultado en la Calculadora Femi Portafolio",
      htmlBody: html,
      body: "Tu resultado: $" + miles_(d["Valor final COP"]) + " pesos (US$" + miles_(d["Valor final USD"]) + "). Entra a " + URL_PAGINA + " para probar con otro portafolio. Contenido educativo; rentabilidades pasadas no garantizan resultados futuros.",
      name: "Feminario"
    });
    cache.put(kP, String(nP + 1), 21600);
    cache.put(kT, String(nT + 1), 21600);
    return { ok: true };
  } catch (err) {
    return { ok: false, motivo: "error-envio: " + String(err).slice(0, 80) };
  }
}

function doGet() { return out_({ ok: true, service: "feminario-calculadora-portafolio", version: 2, correo: true }); }
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
