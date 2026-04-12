const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber, PageBreak,
  ExternalHyperlink
} = require("docx");

// ─── HELPERS ───
const px = (inches) => Math.round(inches * 1440);
const GREEN = "1B5E20";
const GREEN_MED = "2E7D32";
const GREEN_LIGHT = "43A047";
const GREEN_PALE = "E8F5E9";
const ORANGE = "FB8C00";
const BLUE = "1E88E5";
const GRAY = "666666";
const LIGHT_GRAY = "F5F5F5";
const WHITE = "FFFFFF";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: WHITE };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };
const W = 9360; // content width in DXA (letter - 1" margins each side)

function txt(text, opts = {}) {
  return new TextRun({ text, font: "Arial", size: opts.size || 24, ...opts });
}
function para(children, opts = {}) {
  return new Paragraph({ children: Array.isArray(children) ? children : [children], ...opts });
}
function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({ heading: level, children: [txt(text, { bold: true })] });
}
function spacer(h = 200) {
  return para([txt("")], { spacing: { after: h } });
}

function simpleCell(content, width, opts = {}) {
  const children = typeof content === "string"
    ? [para([txt(content, { size: opts.fontSize || 22, bold: opts.bold, color: opts.fontColor })], { alignment: opts.align })]
    : content;
  return new TableCell({
    borders: opts.noBorders ? noBorders : borders,
    width: { size: width, type: WidthType.DXA },
    shading: opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR } : undefined,
    margins: cellMargins,
    verticalAlign: opts.vAlign || undefined,
    children,
  });
}

// ─── COVER PAGE ───
function coverPage() {
  return [
    spacer(600),
    para([txt("PROYECTO UI/UX - SEGUNDO AVANCE", { size: 28, bold: true })], { alignment: AlignmentType.CENTER }),
    para([txt("MACROLY", { size: 32, bold: true, color: GREEN })], { alignment: AlignmentType.CENTER }),
    spacer(800),
    para([txt("ELABORADO POR", { size: 24, bold: true })], { alignment: AlignmentType.CENTER }),
    para([txt("KEVIN HERNANDO BELTRAN MARTINEZ - 2220221003", { size: 24 })], { alignment: AlignmentType.CENTER }),
    para([txt("JUAN CAMILO PEREA POSSOS - 2220232013", { size: 24 })], { alignment: AlignmentType.CENTER }),
    spacer(800),
    para([txt("PRESENTADO A", { size: 24, bold: true })], { alignment: AlignmentType.CENTER }),
    para([txt("ING. JUAN MANUEL CHAGUENDO BENAVIDES", { size: 24 })], { alignment: AlignmentType.CENTER }),
    spacer(1200),
    para([txt("FACULTAD DE INGENIERIA", { size: 24, bold: true })], { alignment: AlignmentType.CENTER }),
    para([txt("PROGRAMA DE INGENIERIA DE SISTEMAS", { size: 24, bold: true })], { alignment: AlignmentType.CENTER }),
    para([txt("DESARROLLO DE APLICACIONES UI/UX", { size: 24, bold: true })], { alignment: AlignmentType.CENTER }),
    para([txt("UNIVERSIDAD DE IBAGUE", { size: 24, bold: true })], { alignment: AlignmentType.CENTER }),
    para([txt("IBAGUE - TOLIMA", { size: 24, bold: true })], { alignment: AlignmentType.CENTER }),
    para([txt("2026", { size: 24, bold: true })], { alignment: AlignmentType.CENTER }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ─── a) NOMBRE Y LOGO ───
function seccionLogo() {
  return [
    heading("a) Nombre y logo del proyecto"),
    spacer(100),
    para([txt("Nombre: ", { bold: true, size: 24 }), txt("Macroly", { size: 24, color: GREEN, bold: true })]),
    spacer(100),
    para([txt("Macroly es un e-commerce de alimentos centrado en el seguimiento de macronutrientes. El nombre combina \"Macro\" (macronutrientes: proteinas, carbohidratos y grasas) con el sufijo \"-ly\" que evoca inteligencia y modernidad.", { size: 22 })]),
    spacer(100),
    para([txt("Concepto del logo:", { bold: true, size: 22 })]),
    para([txt("El isotipo representa un carrito de compras estilizado que contiene tres barras de progreso de macronutrientes en su interior (verde para proteinas, naranja para carbohidratos y azul para grasas). Este concepto comunica visualmente la propuesta de valor central de Macroly: compras inteligentes con seguimiento nutricional integrado.", { size: 22 })]),
    spacer(100),
    para([txt("El logotipo utiliza la tipografia Nunito Black con el texto \"Macro\" en verde oscuro (#1B5E20) y \"ly\" en verde medio (#43A047), acompanado del tagline \"Nutricion Inteligente\".", { size: 22 })]),
    spacer(100),
    para([txt("Variantes del logo:", { bold: true, size: 22 })]),
    para([txt("Se disenaron tres variantes del icono de aplicacion: version clara (fondo blanco), version oscura (fondo #121A12) y version a color (degradado verde). Adicionalmente se creo una version horizontal completa para fondos oscuros.", { size: 22 })]),
    spacer(100),
    para([txt("Nota: Las versiones visuales del logo se encuentran en el archivo logo-conceptos.html adjunto y en el archivo de Figma del proyecto.", { size: 20, italics: true, color: GRAY })]),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ─── b) SITE MAP ───
function seccionSitemap() {
  const tabData = [
    ["Inicio", "Dashboard con progreso diario de macros, resumen del carrito, recomendaciones automaticas (A4), notificaciones (pedido en camino, entregado, recordatorio semanal)"],
    ["Catalogo", "Busqueda con filtros nutricionales (A2): por categoria, por macronutriente, por rango calorico. Lista de productos. Detalle de producto con info nutricional e impacto en macros"],
    ["Carrito", "Progreso de macros en tiempo real (A3), lista de productos, sugerencias automaticas (A4), checkout (direccion de envio, metodo de pago, confirmacion)"],
    ["Educacion", "Articulos sobre nutricion (A6), tips nutricionales, guias de macros, detalle de articulo"],
    ["Perfil", "Configuracion nutricional (A1), favoritos y combinaciones guardadas (A7), pedido recurrente semanal (A5), historial de pedidos, datos personales"],
  ];

  return [
    heading("b) Site map"),
    spacer(100),
    para([txt("Macroly se plantea como una web app responsiva. La arquitectura de informacion se organiza alrededor de un flujo de entrada (login/registro + onboarding) y cinco secciones principales accesibles desde la barra de navegacion.", { size: 22 })]),
    spacer(100),
    para([txt("Flujo de entrada:", { bold: true, size: 22 })]),
    spacer(50),
    para([txt("1. Login / Registro: ", { bold: true, size: 22 }), txt("Autenticacion por email + password, OAuth con Google, y recuperacion de contrasena.", { size: 22 })]),
    para([txt("2. Onboarding (Accion 1): ", { bold: true, size: 22 }), txt("Datos personales, objetivo nutricional, metas de macros (proteina, carbohidratos, grasas) y preferencias alimentarias/alergias.", { size: 22 })]),
    spacer(100),
    para([txt("Navegacion principal (5 tabs):", { bold: true, size: 22 })]),
    spacer(50),
    new Table({
      width: { size: W, type: WidthType.DXA },
      columnWidths: [1800, 7560],
      rows: [
        new TableRow({
          children: [
            simpleCell("Tab", 1800, { bold: true, shading: GREEN, fontColor: WHITE, fontSize: 22 }),
            simpleCell("Contenido y acciones relacionadas", 7560, { bold: true, shading: GREEN, fontColor: WHITE, fontSize: 22 }),
          ]
        }),
        ...tabData.map(([tab, desc]) =>
          new TableRow({
            children: [
              simpleCell(tab, 1800, { bold: true, fontSize: 22 }),
              simpleCell(desc, 7560, { fontSize: 21 }),
            ]
          })
        ),
      ]
    }),
    spacer(100),
    para([txt("Nota: El sitemap visual completo con diagramas de conexion se encuentra en el archivo sitemap.html adjunto.", { size: 20, italics: true, color: GRAY })]),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ─── c) FLUJOS DE ACCION ───
function seccionFlujos() {
  const acciones = [
    ["Accion 1", "Configurar Perfil Nutricional y Metas de Macros", "https://www.figma.com/board/3wpXEjIJ6Uz2jHxLht4hsL/"],
    ["Accion 2", "Explorar Catalogo Filtrando por Info Nutricional", "https://www.figma.com/board/SbVeidqHF4xTEMKwo5OYP6/"],
    ["Accion 3", "Agregar al Carrito con Progreso de Macros en Tiempo Real", "https://www.figma.com/board/6r2CQ3vyu1UhiyQP2sHxdW/"],
    ["Accion 4", "Recomendaciones Automaticas para Completar Macros", "https://www.figma.com/board/NBGASlVtQQQYFhypgkAaT3/"],
    ["Accion 5", "Compra Recurrente Semanal", "https://www.figma.com/board/PH8cbmLPkFMmjAEmVBcCnO/"],
    ["Accion 6", "Consumir Contenido Educativo sobre Nutricion", "https://www.figma.com/board/Y8nfnAJypnpju7oyd9IneN/"],
    ["Accion 7", "Guardar Combinaciones Favoritas para Recompra Rapida", "https://www.figma.com/board/j31gMdnbOtjXaojqlqStHm/"],
  ];

  return [
    heading("c) Flujo de acciones por usuarios"),
    spacer(100),
    para([txt("Se disenaron siete flujos de accion principales que representan las interacciones clave del usuario con la plataforma Macroly. Cada flujo fue diagramado en FigJam (Figma) siguiendo la notacion de diagramas de flujo estandar.", { size: 22 })]),
    spacer(100),
    new Table({
      width: { size: W, type: WidthType.DXA },
      columnWidths: [1400, 4960, 3000],
      rows: [
        new TableRow({
          children: [
            simpleCell("ID", 1400, { bold: true, shading: GREEN, fontColor: WHITE, fontSize: 22 }),
            simpleCell("Nombre del flujo", 4960, { bold: true, shading: GREEN, fontColor: WHITE, fontSize: 22 }),
            simpleCell("Link Figma", 3000, { bold: true, shading: GREEN, fontColor: WHITE, fontSize: 22 }),
          ]
        }),
        ...acciones.map(([id, nombre, link]) =>
          new TableRow({
            children: [
              simpleCell(id, 1400, { bold: true, fontSize: 22 }),
              simpleCell(nombre, 4960, { fontSize: 22 }),
              simpleCell([
                new Paragraph({ children: [
                  new ExternalHyperlink({ children: [txt("Ver en Figma", { size: 22, color: "0563C1", underline: {} })], link })
                ]})
              ], 3000),
            ]
          })
        ),
      ]
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ─── e) MOODBOARD ───
function seccionMoodboard() {
  return [
    heading("e) Moodboard"),
    spacer(100),
    para([txt("El moodboard de Macroly establece la direccion visual del proyecto, comunicando la estetica, personalidad de marca y el lenguaje visual que guia todas las decisiones de diseno.", { size: 22 })]),
    spacer(100),
    para([txt("Personalidad de marca:", { bold: true, size: 22 })]),
    para([txt("Fresco, Saludable, Inteligente, Energetico, Minimalista, Natural, Confiable, Amigable, Moderno, Organico, Datos claros, Accesible.", { size: 22 })]),
    spacer(100),
    para([txt("Direccion visual:", { bold: true, size: 22 })]),
    spacer(50),
    new Table({
      width: { size: W, type: WidthType.DXA },
      columnWidths: [2800, 6560],
      rows: [
        ["Frescura y Naturaleza", "Tonos verdes, alimentos frescos, hojas, vida sana. Transmite la esencia de alimentacion saludable."],
        ["Calidez y Energia", "Colores calidos (naranja), apetitoso, nutritivo. Representa los carbohidratos y la energia."],
        ["Datos y Tecnologia", "Azul-verde, visualizaciones claras, dashboards, precision. Representa el seguimiento inteligente de macros."],
        ["UI Limpio y Espacioso", "Mucho espacio en blanco, bordes redondeados (12-16px), sombras sutiles. Interfaz moderna y respirable."],
        ["Estilo de Vida Activo", "Fitness, meal prep, bienestar integral. Conecta con el usuario objetivo."],
      ].map(([titulo, desc]) =>
        new TableRow({
          children: [
            simpleCell(titulo, 2800, { bold: true, fontSize: 22, shading: GREEN_PALE }),
            simpleCell(desc, 6560, { fontSize: 21 }),
          ]
        })
      ),
    }),
    spacer(100),
    para([txt("Elementos adicionales del moodboard:", { bold: true, size: 22 })]),
    para([txt("- Componentes UI: Botones primarios (verde), secundarios (verde claro), outline. Inputs con bordes redondeados. Chips de filtro.", { size: 22 })]),
    para([txt("- Tarjeta de producto: Imagen + nombre + chips de macros (P/C/G) + precio + boton agregar.", { size: 22 })]),
    para([txt("- Iconografia: Estilo outline (Lucide Icons), stroke-width 2px, stroke-linecap round.", { size: 22 })]),
    para([txt("- Formas: Predominan los bordes redondeados (12-20px radius), formas suaves y organicas.", { size: 22 })]),
    para([txt("- Sistema de espaciado: Escala de 4px (micro) a 48px (seccion).", { size: 22 })]),
    spacer(100),
    para([txt("Nota: El moodboard visual completo se encuentra en el archivo moodboard.html adjunto.", { size: 20, italics: true, color: GRAY })]),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ─── f) PALETA DE COLORES ───
function seccionColores() {
  const colores = [
    ["#1B5E20", "Verde Oscuro", "Primario", "Acciones principales, titulos, CTA, navbar activo"],
    ["#2E7D32", "Verde Primario", "Primario", "Botones primarios, enfasis fuerte"],
    ["#43A047", "Verde Medio", "Primario", "Links, iconos activos, acento \"ly\" del logo"],
    ["#66BB6A", "Verde Claro", "Primario", "Elementos decorativos, hover states, modo oscuro"],
    ["#C8E6C9", "Verde Palido", "Primario", "Fondos de tarjetas, chips inactivos, backgrounds"],
    ["#FB8C00", "Naranja", "Secundario", "Barras de carbohidratos, badges, alertas, energia"],
    ["#1E88E5", "Azul", "Secundario", "Barras de grasas, informacion complementaria"],
    ["#121A12", "Fondo Oscuro", "Neutro", "Modo oscuro, fondos de contraste"],
    ["#F5F7F5", "Fondo Claro", "Neutro", "Fondo general de la aplicacion"],
  ];

  return [
    heading("f) Paleta de colores"),
    spacer(100),
    para([txt("La paleta de colores de Macroly se fundamenta en una combinacion triadica (verde-naranja-azul) con variaciones monocromaticas del verde como color principal. Esta eleccion responde a:", { size: 22 })]),
    spacer(50),
    para([txt("- Verde: ", { bold: true, size: 22 }), txt("Salud, frescura, naturaleza. Es el color dominante por su asociacion directa con alimentacion saludable y bienestar.", { size: 22 })]),
    para([txt("- Naranja: ", { bold: true, size: 22 }), txt("Energia, calidez, apetito. Codifica los carbohidratos y genera contraste calido.", { size: 22 })]),
    para([txt("- Azul: ", { bold: true, size: 22 }), txt("Confianza, precision, datos. Codifica las grasas y refuerza la credibilidad de la informacion nutricional.", { size: 22 })]),
    spacer(100),
    para([txt("Tipo de combinacion: Triadica + Monocromatica", { bold: true, size: 22, color: GREEN })]),
    spacer(100),
    new Table({
      width: { size: W, type: WidthType.DXA },
      columnWidths: [1400, 1800, 1560, 4600],
      rows: [
        new TableRow({
          children: [
            simpleCell("Hex", 1400, { bold: true, shading: GREEN, fontColor: WHITE, fontSize: 22 }),
            simpleCell("Nombre", 1800, { bold: true, shading: GREEN, fontColor: WHITE, fontSize: 22 }),
            simpleCell("Tipo", 1560, { bold: true, shading: GREEN, fontColor: WHITE, fontSize: 22 }),
            simpleCell("Uso", 4600, { bold: true, shading: GREEN, fontColor: WHITE, fontSize: 22 }),
          ]
        }),
        ...colores.map(([hex, nombre, tipo, uso]) =>
          new TableRow({
            children: [
              simpleCell([
                para([txt(hex, { size: 22, bold: true, color: hex.replace("#","") })])
              ], 1400),
              simpleCell(nombre, 1800, { fontSize: 22 }),
              simpleCell(tipo, 1560, { fontSize: 22 }),
              simpleCell(uso, 4600, { fontSize: 21 }),
            ]
          })
        ),
      ]
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ─── g) TIPOGRAFIA ───
function seccionTipografia() {
  const tipoData = [
    ["Display", "Nunito", "Black (900)", "40px", "#1B5E20", "Titulos principales, hero sections"],
    ["Heading 1", "Nunito", "ExtraBold (800)", "28px", "#1B5E20", "Encabezados de seccion, saludos"],
    ["Heading 2", "Nunito", "Bold (700)", "20px", "#333333", "Subtitulos, nombres de seccion"],
    ["Heading 3", "Nunito", "Bold (700)", "16px", "#555555", "Nombres de producto, subtitulos menores"],
    ["Body", "Inter", "Regular (400)", "15px", "#666666", "Texto de cuerpo, descripciones"],
    ["Caption", "Inter", "Medium (500)", "13px", "#999999", "Datos secundarios, progreso de macros"],
    ["Overline", "Nunito", "Bold (700)", "11px", "#BBBBBB", "Etiquetas, categorias (uppercase)"],
  ];

  return [
    heading("g) Tipografia"),
    spacer(100),
    para([txt("Se seleccionaron dos familias tipograficas complementarias:", { size: 22 })]),
    spacer(50),
    para([txt("Nunito (Google Fonts) - Titulos y encabezados", { bold: true, size: 22, color: GREEN })]),
    para([txt("Tipografia sans-serif con terminaciones redondeadas (rounded). Transmite amigabilidad, modernidad y confianza. Ideal para marcas de bienestar y nutricion. Se utiliza en pesos Black (900), ExtraBold (800) y Bold (700).", { size: 22 })]),
    spacer(50),
    para([txt("Inter (Google Fonts) - Cuerpo y datos", { bold: true, size: 22, color: GREEN })]),
    para([txt("Tipografia sans-serif neutra disenada especificamente para interfaces digitales. Ofrece excelente legibilidad en tamanos pequenos, lo que la hace perfecta para datos nutricionales, tablas y descripciones de productos. Se utiliza en pesos Regular (400) y Medium (500).", { size: 22 })]),
    spacer(100),
    para([txt("Escala tipografica:", { bold: true, size: 22 })]),
    spacer(50),
    new Table({
      width: { size: W, type: WidthType.DXA },
      columnWidths: [1300, 1100, 1500, 900, 1200, 3360],
      rows: [
        new TableRow({
          children: [
            simpleCell("Rol", 1300, { bold: true, shading: GREEN, fontColor: WHITE, fontSize: 20 }),
            simpleCell("Fuente", 1100, { bold: true, shading: GREEN, fontColor: WHITE, fontSize: 20 }),
            simpleCell("Peso", 1500, { bold: true, shading: GREEN, fontColor: WHITE, fontSize: 20 }),
            simpleCell("Tamano", 900, { bold: true, shading: GREEN, fontColor: WHITE, fontSize: 20 }),
            simpleCell("Color", 1200, { bold: true, shading: GREEN, fontColor: WHITE, fontSize: 20 }),
            simpleCell("Uso", 3360, { bold: true, shading: GREEN, fontColor: WHITE, fontSize: 20 }),
          ]
        }),
        ...tipoData.map(([rol, fuente, peso, tam, color, uso]) =>
          new TableRow({
            children: [
              simpleCell(rol, 1300, { bold: true, fontSize: 20 }),
              simpleCell(fuente, 1100, { fontSize: 20 }),
              simpleCell(peso, 1500, { fontSize: 20 }),
              simpleCell(tam, 900, { fontSize: 20 }),
              simpleCell(color, 1200, { fontSize: 20 }),
              simpleCell(uso, 3360, { fontSize: 20 }),
            ]
          })
        ),
      ]
    }),
    spacer(100),
    para([txt("Buenas practicas aplicadas:", { bold: true, size: 22 })]),
    para([txt("- Minimo de fuentes: Solo 2 familias tipograficas (Nunito + Inter).", { size: 22 })]),
    para([txt("- Fuentes estandar: Ambas son Google Fonts, gratuitas y ampliamente compatibles.", { size: 22 })]),
    para([txt("- Legibles en diferentes tamanos: Inter fue disenada para pantallas; Nunito es legible desde 11px hasta display.", { size: 22 })]),
    para([txt("- Contraste tipografico: Nunito Black (900) vs Inter Regular (400) genera contraste jerarquico claro.", { size: 22 })]),
    para([txt("- Saltos de linea espaciados: line-height de 1.2 a 1.6 segun el nivel.", { size: 22 })]),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ─── h) JERARQUIA VISUAL ───
function seccionJerarquia() {
  return [
    heading("h) Jerarquia visual"),
    spacer(100),
    para([txt("La jerarquia visual de Macroly se construye aplicando seis principios fundamentales que guian la atencion del usuario hacia la informacion mas relevante en cada pantalla.", { size: 22 })]),
    spacer(100),
    para([txt("Principios aplicados:", { bold: true, size: 24, color: GREEN })]),
    spacer(50),
    // Principles table
    new Table({
      width: { size: W, type: WidthType.DXA },
      columnWidths: [600, 2200, 6560],
      rows: [
        new TableRow({ children: [
          simpleCell("#", 600, { bold: true, shading: GREEN, fontColor: WHITE, fontSize: 22 }),
          simpleCell("Principio", 2200, { bold: true, shading: GREEN, fontColor: WHITE, fontSize: 22 }),
          simpleCell("Aplicacion en Macroly", 6560, { bold: true, shading: GREEN, fontColor: WHITE, fontSize: 22 }),
        ]}),
        ...[
          ["1", "Tamano y peso", "Los elementos mas importantes son mas grandes y con mayor peso tipografico. El numero de calorias en la card de macros (2rem, weight 900) es el primer punto focal."],
          ["2", "Color como guia", "Verde oscuro (#1B5E20) para acciones primarias y titulos. Los colores semanticos de macros (verde, naranja, azul) guian la lectura de datos nutricionales."],
          ["3", "Contraste intencional", "Texto oscuro sobre fondos claros. La card de macros usa fondo verde oscuro con texto blanco, creando el mayor contraste de la pantalla como punto focal principal."],
          ["4", "Espacio en blanco", "Margenes generosos (16-32px) entre secciones. El espaciado separa grupos de informacion y reduce la carga cognitiva del usuario."],
          ["5", "Agrupacion visual", "Cards con bordes redondeados (12-16px) agrupan informacion relacionada. Los chips de macros se agrupan por producto formando unidades visuales cohesivas."],
          ["6", "Patron de lectura F", "El contenido principal se alinea a la izquierda siguiendo el patron natural de lectura. Las acciones secundarias (\"Ver todo\") se ubican a la derecha como anclaje visual."],
        ].map(([n, princ, app]) =>
          new TableRow({ children: [
            simpleCell(n, 600, { bold: true, fontSize: 22, shading: GREEN_PALE }),
            simpleCell(princ, 2200, { bold: true, fontSize: 22 }),
            simpleCell(app, 6560, { fontSize: 21 }),
          ]})
        ),
      ]
    }),
    spacer(200),
    para([txt("Jerarquia de color por funcion:", { bold: true, size: 24, color: GREEN })]),
    spacer(50),
    new Table({
      width: { size: W, type: WidthType.DXA },
      columnWidths: [1000, 2200, 6160],
      rows: [
        new TableRow({ children: [
          simpleCell("Nivel", 1000, { bold: true, shading: GREEN, fontColor: WHITE, fontSize: 22 }),
          simpleCell("Funcion", 2200, { bold: true, shading: GREEN, fontColor: WHITE, fontSize: 22 }),
          simpleCell("Elementos", 6160, { bold: true, shading: GREEN, fontColor: WHITE, fontSize: 22 }),
        ]}),
        ...[
          ["1", "Accion primaria", "Botones CTA, titulos principales, navbar activo (#1B5E20)"],
          ["2", "Enfasis secundario", "Links, iconos activos, acento \"ly\" del logo (#43A047)"],
          ["3", "Datos - Carbohidratos", "Barras de carbos, badges de energia, alertas (#FB8C00)"],
          ["4", "Datos - Grasas", "Barras de grasas, informacion complementaria (#1E88E5)"],
          ["5", "Fondos y superficies", "Cards, chips inactivos, backgrounds sutiles (#E8F5E9)"],
          ["6", "Neutro / Inactivo", "Bordes, placeholders, texto deshabilitado (#F5F5F5)"],
        ].map(([n, func, elem]) =>
          new TableRow({ children: [
            simpleCell(n, 1000, { bold: true, fontSize: 22, shading: GREEN_PALE }),
            simpleCell(func, 2200, { bold: true, fontSize: 22 }),
            simpleCell(elem, 6160, { fontSize: 21 }),
          ]})
        ),
      ]
    }),
    spacer(200),
    para([txt("Aplicacion en pantalla de inicio:", { bold: true, size: 24, color: GREEN })]),
    spacer(50),
    new Table({
      width: { size: W, type: WidthType.DXA },
      columnWidths: [2400, 6960],
      rows: [
        new TableRow({ children: [
          simpleCell("Elemento", 2400, { bold: true, shading: GREEN, fontColor: WHITE, fontSize: 22 }),
          simpleCell("Herramienta de jerarquia utilizada", 6960, { bold: true, shading: GREEN, fontColor: WHITE, fontSize: 22 }),
        ]}),
        ...[
          ["Saludo + nombre (H1)", "Tamano + color verde oscuro + peso tipografico 900. Primer punto focal que crea conexion personal."],
          ["Card de macros", "Fondo verde oscuro con maximo contraste. Numero de calorias en 2rem. Barras de progreso con colores semanticos. Punto focal principal."],
          ["Seccion Recomendados", "Titulo H3 mas pequeno, establece nueva seccion. \"Ver todo\" en verde medio a la derecha como accion secundaria."],
          ["Tarjetas de producto", "Fondo sutil (#F5F7F5). Micro-jerarquia interna: imagen > nombre (bold) > tag macro (chip) > precio (bold verde)."],
          ["Navegacion inferior", "Menor jerarquia visual. Iconos en gris neutro, tab activo en verde oscuro con stroke mas grueso. Tamano reducido."],
        ].map(([elem, herr]) =>
          new TableRow({ children: [
            simpleCell(elem, 2400, { bold: true, fontSize: 22 }),
            simpleCell(herr, 6960, { fontSize: 21 }),
          ]})
        ),
      ]
    }),
    spacer(100),
    para([txt("Nota: La demostracion visual completa con mockup anotado se encuentra en el archivo jerarquia-visual.html adjunto.", { size: 20, italics: true, color: GRAY })]),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ─── k) LINKS DEL PROYECTO ───
function seccionLinks() {
  return [
    heading("k) Links del proyecto"),
    spacer(100),
    para([txt("Archivo de Figma (Design System & UI Kit):", { bold: true, size: 22 })]),
    para([new ExternalHyperlink({
      children: [txt("https://www.figma.com/design/QlnDkWpDOX7R1P5ecu28xc", { size: 22, color: "0563C1", underline: {} })],
      link: "https://www.figma.com/design/QlnDkWpDOX7R1P5ecu28xc"
    })]),
    spacer(100),
    para([txt("Boards de flujos de accion en Figma:", { bold: true, size: 22 })]),
    ...[
      ["Accion 1 - Configurar Perfil Nutricional", "https://www.figma.com/board/3wpXEjIJ6Uz2jHxLht4hsL/"],
      ["Accion 2 - Explorar Catalogo", "https://www.figma.com/board/SbVeidqHF4xTEMKwo5OYP6/"],
      ["Accion 3 - Agregar al Carrito", "https://www.figma.com/board/6r2CQ3vyu1UhiyQP2sHxdW/"],
      ["Accion 4 - Recomendaciones Automaticas", "https://www.figma.com/board/NBGASlVtQQQYFhypgkAaT3/"],
      ["Accion 5 - Compra Recurrente Semanal", "https://www.figma.com/board/PH8cbmLPkFMmjAEmVBcCnO/"],
      ["Accion 6 - Contenido Educativo", "https://www.figma.com/board/Y8nfnAJypnpju7oyd9IneN/"],
      ["Accion 7 - Combinaciones Favoritas", "https://www.figma.com/board/j31gMdnbOtjXaojqlqStHm/"],
    ].map(([name, link]) =>
      para([
        txt("- " + name + ": ", { size: 22 }),
        new ExternalHyperlink({ children: [txt("Ver en Figma", { size: 22, color: "0563C1", underline: {} })], link })
      ])
    ),
  ];
}

// ─── BUILD DOCUMENT ───
async function main() {
  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 24 } } },
      paragraphStyles: [
        {
          id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 32, bold: true, font: "Arial", color: GREEN },
          paragraph: { spacing: { before: 240, after: 200 }, outlineLevel: 0 },
        },
        {
          id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 28, bold: true, font: "Arial", color: GREEN_MED },
          paragraph: { spacing: { before: 180, after: 160 }, outlineLevel: 1 },
        },
      ],
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [para([
            txt("Macroly - Segundo Avance | UI/UX | Universidad de Ibague", { size: 18, color: GRAY, italics: true })
          ], { alignment: AlignmentType.RIGHT })],
        }),
      },
      footers: {
        default: new Footer({
          children: [para([
            txt("Pagina ", { size: 18, color: GRAY }),
            new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: GRAY }),
          ], { alignment: AlignmentType.CENTER })],
        }),
      },
      children: [
        ...coverPage(),
        ...seccionLogo(),
        ...seccionSitemap(),
        ...seccionFlujos(),
        ...seccionMoodboard(),
        ...seccionColores(),
        ...seccionTipografia(),
        ...seccionJerarquia(),
        ...seccionLinks(),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = "/Users/kevin_beltran/Library/Mobile Documents/com~apple~CloudDocs/Universidad/SemestreIX/UI_UX/PROYECTO UI_UX - SEGUNDO AVANCE.docx";
  fs.writeFileSync(outPath, buffer);
  console.log("Document created: " + outPath);
}

main().catch(console.error);
