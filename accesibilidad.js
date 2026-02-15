(function () {
  const root = document.documentElement;

  const controls = {
    size: document.getElementById("text-size"),
    letter: document.getElementById("letter-spacing"),
    word: document.getElementById("word-spacing"),
    line: document.getElementById("line-height"),
    contrast: document.getElementById("contrast-toggle"),
    reset: document.getElementById("reset-accessibility"),
    presetAa: document.getElementById("preset-aa-spacing"),
    presetLarge: document.getElementById("preset-large-text"),
    presetTight: document.getElementById("preset-tight-text"),
    valueSize: document.getElementById("value-size"),
    valueLetter: document.getElementById("value-letter"),
    valueWord: document.getElementById("value-word"),
    valueLine: document.getElementById("value-line"),
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

    root.style.setProperty("--font-scale", String(size / 100));
    root.style.setProperty("--letter-space", `${letter}em`);
    root.style.setProperty("--word-space", `${word}em`);
    root.style.setProperty("--line-space", String(line));

    controls.valueSize.textContent = `${size}%`;
    controls.valueLetter.textContent = `${letter.toFixed(2)}em`;
    controls.valueWord.textContent = `${word.toFixed(2)}em`;
    controls.valueLine.textContent = line.toFixed(1);

    controls.live.textContent = `Configuracion aplicada: texto ${size}%, espaciado de letras ${letter.toFixed(2)}em, espaciado de palabras ${word.toFixed(2)}em, altura de linea ${line.toFixed(1)}.`;
  }

  function resetValues() {
    controls.size.value = "100";
    controls.letter.value = "0.00";
    controls.word.value = "0.00";
    controls.line.value = "1.6";
    controls.contrast.checked = false;
    document.body.classList.remove("high-contrast");
    applyValues();
  }

  [controls.size, controls.letter, controls.word, controls.line].forEach((input) => {
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
})();
