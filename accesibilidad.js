(function () {
  const root = document.documentElement;

  const controls = {
    size: document.getElementById("text-size"),
    letter: document.getElementById("letter-spacing"),
    word: document.getElementById("word-spacing"),
    line: document.getElementById("line-height"),
    paragraph: document.getElementById("paragraph-spacing"),
    contrast: document.getElementById("contrast-toggle"),
    reset: document.getElementById("reset-accessibility"),
    presetAa: document.getElementById("preset-aa-spacing"),
    presetLarge: document.getElementById("preset-large-text"),
    presetTight: document.getElementById("preset-tight-text"),
    valueSize: document.getElementById("value-size"),
    valueLetter: document.getElementById("value-letter"),
    valueWord: document.getElementById("value-word"),
    valueLine: document.getElementById("value-line"),
    valueParagraph: document.getElementById("value-paragraph"),
    live: document.getElementById("live-config")
  };

  if (!controls.size) {
    return;
  }

  function applyValues() {
    const size = Number(controls.size.value);
    const letter = Number(controls.letter.value);
    const word = Number(controls.word.value);
    const line = Number(controls.line.value);
    const para = Number(controls.paragraph.value);

    root.style.setProperty("--font-scale", String(size / 100));
    root.style.setProperty("--letter-space", `${letter}em`);
    root.style.setProperty("--word-space", `${word}em`);
    root.style.setProperty("--line-space", String(line));
    root.style.setProperty("--paragraph-space", `${para}em`);

    controls.valueSize.textContent = `${size}%`;
    controls.valueLetter.textContent = `${letter.toFixed(2)}em`;
    controls.valueWord.textContent = `${word.toFixed(2)}em`;
    controls.valueLine.textContent = line.toFixed(1);
    controls.valueParagraph.textContent = `${para.toFixed(1)}em`;

    controls.live.textContent = `Preferencias actualizadas: texto ${size}%, letras ${letter.toFixed(2)}em, palabras ${word.toFixed(2)}em, linea ${line.toFixed(1)}, parrafos ${para.toFixed(1)}em.`;
  }

  function resetValues() {
    controls.size.value = "100";
    controls.letter.value = "0.00";
    controls.word.value = "0.00";
    controls.line.value = "1.6";
    controls.paragraph.value = "0";
    controls.contrast.checked = false;
    document.body.classList.remove("high-contrast");
    applyValues();
  }

  [controls.size, controls.letter, controls.word, controls.line, controls.paragraph].forEach((input) => {
    input.addEventListener("input", applyValues);
  });

  controls.contrast.addEventListener("change", () => {
    document.body.classList.toggle("high-contrast", controls.contrast.checked);
    controls.live.textContent = controls.contrast.checked
      ? "Modo alto contraste activado."
      : "Modo alto contraste desactivado.";
  });

  controls.reset.addEventListener("click", resetValues);

  controls.presetAa.addEventListener("click", () => {
    controls.letter.value = "0.12";
    controls.word.value = "0.16";
    controls.line.value = "1.9";
    controls.paragraph.value = "2";
    applyValues();
  });

  controls.presetLarge.addEventListener("click", () => {
    controls.size.value = "200";
    applyValues();
  });

  controls.presetTight.addEventListener("click", () => {
    controls.letter.value = "-0.04";
    controls.word.value = "0.00";
    controls.line.value = "1.5";
    applyValues();
  });

  applyValues();

  /* WCAG 4.9: cerrar tooltip con tecla Escape. */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      var active = document.activeElement;
      if (active && active.closest(".tooltip-wrap")) {
        active.blur();
      }
      document.querySelectorAll(".tooltip").forEach((tip) => {
        tip.classList.remove("tooltip-visible");
      });
    }
  });
})();
