/**
 * Feminario — Calculadora Femi Portafolio
 * Guarda en la hoja "Calculadora" el correo (con autorización) de quien lo deja y lo que simuló.
 * Instalación: Hoja de cálculo nueva → Extensiones → Apps Script → pega este archivo →
 * Implementar → Aplicación web → Ejecutar como YO · Acceso: Cualquier persona → copia la URL /exec en assets/config.js.
 * Si cambias el acceso o el código, crea una "Versión nueva" de la implementación.
 */
var HOJA = "Calculadora";
var COLS = ["Fecha", "Correo", "Autorizó datos", "Portafolio", "Mezcla", "Aporte mensual USD", "Año inicio", "Aportado USD", "Valor final USD", "Origen"];

function hoja_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(HOJA);
  if (!sh) {
    sh = ss.insertSheet(HOJA);
    sh.appendRow(COLS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, COLS.length).setFontWeight("bold").setBackground("#C2CBFF");
  }
  return sh;
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var d = JSON.parse(e.postData.contents);
    var fila = COLS.map(function (c) {
      var v = d[c] !== undefined ? d[c] : "";
      return typeof v === "string" ? v.replace(/^[=+\-@]/, "'$&") : v; // evita fórmulas
    });
    hoja_().appendRow(fila);
    return out_({ ok: true });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  } finally { lock.releaseLock(); }
}

function doGet() { return out_({ ok: true, service: "feminario-calculadora-portafolio" }); }
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
