# Calculadora Femi Portafolio

Página estática (GitHub Pages) que muestra en qué se habría convertido un aporte mensual pequeño en los portafolios de inversionistas famosos. **Contenido educativo, no asesoría.**

## Qué hace
- Aporte mensual (por defecto US$83, es decir US$1.000 al año) con su equivalente por día y en pesos (TRM de cierre de 2025).
- Portafolios: El mundo entero (VT), Solo EE. UU. (SPY), 90/10 de Buffett, All Weather de Dalio, Swensen, 50/50 de Markowitz, Cathie Wood (ARKK), dividendos (NOBL y SCHD) y «arma la tuya».
- Resultado: valor al 31-dic-2025, lo aportado, veces lo aportado, valor real (descontando inflación de EE. UU.), gráfica año por año, mejor y peor año, y qué habría pasado según el año de inicio.
- Correo opcional con consentimiento → hoja de Google Sheets.

## Datos y límites (leer antes de tocar)
- `assets/datos.js` trae el retorno total anual (USD, dividendos reinvertidos), el IPC y la TRM. Fuentes y fecha de consulta están en el encabezado del archivo.
- Los aportes se hacen al inicio de cada mes y el retorno anual se reparte en tasas mensuales iguales (aproximación).
- Aproximaciones marcadas en la página: Buffett usa IEF en lugar de bonos de corto plazo; Dalio no incluye materias primas; Swensen junta desarrollados y emergentes en VXUS.
- Muriel Siebert aparece solo en la historia: no hay un portafolio documentado que se le pueda atribuir.
- Esta es la primera página de la serie de portafolios; los demás (Mellody Hobson / Ariel, Mary Meeker, Burton Malkiel) se suman cuando estén cerrados.
- ARKK es un fondo que gestiona Cathie Wood, no su portafolio personal. NOBL no replica el método de Geraldine Weiss.
- Pendientes de verificar: comisión de AVUV, VBR, DBC y bonos cortos (SHY/BIL); series de materias primas, bonos cortos, VEA, ARKK; retornos en COP; el texto legal con abogado colombiano.
- La cifra «unos US$41.000» del guion del video no coincide con el recálculo (≈US$50.000–53.000 a fines de 2025, con 18 aportes de US$1.000).

## Guardar correos (Google Sheets + Apps Script)
1. Crea una hoja de cálculo nueva.
2. Extensiones → Apps Script, pega `apps-script/Code.gs`.
3. Implementar → Aplicación web → Ejecutar como **yo** · Acceso **Cualquier persona**.
4. Copia la URL `/exec` en `assets/config.js` (`API_URL`).
5. Prueba y borra la fila de prueba.

Parámetros opcionales: `?origen=instagram` se guarda en la columna Origen.
