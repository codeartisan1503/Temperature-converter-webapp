/* =========================================================
   Temperature Converter — Logic
   Handles validation, conversion, and UI state.
   ========================================================= */

(() => {
  "use strict";

  /* ---------- DOM references ---------- */
  const form = document.getElementById("converter-form");
  const valueInput = document.getElementById("temp-value");
  const fromSelect = document.getElementById("from-unit");
  const toSelect = document.getElementById("to-unit");
  const errorMessage = document.getElementById("error-message");
  const resultCard = document.getElementById("result-card");
  const resultValue = document.getElementById("result-value");
  const resetBtn = document.getElementById("reset-btn");
  const swapBtn = document.getElementById("swap-btn");

  /* ---------- Unit metadata ---------- */
  const UNIT_LABELS = {
    C: "°C",
    F: "°F",
    K: "K",
  };

  /* ---------- Conversion formulas ----------
     Each function accepts a Celsius, Fahrenheit or Kelvin value
     and returns the amount for the target unit.
     Formulas implemented directly (not chained) for accuracy
     and clarity, covering every C / F / K combination. */
  const CONVERSIONS = {
    "C-F": (c) => (c * 9) / 5 + 32,
    "C-K": (c) => c + 273.15,
    "F-C": (f) => ((f - 32) * 5) / 9,
    "F-K": (f) => ((f - 32) * 5) / 9 + 273.15,
    "K-C": (k) => k - 273.15,
    "K-F": (k) => ((k - 273.15) * 9) / 5 + 32,
  };

  /**
   * Converts a temperature value from one unit to another.
   * Returns the value unchanged when the units match, to avoid
   * unnecessary floating-point work.
   */
  function convertTemperature(value, fromUnit, toUnit) {
    if (fromUnit === toUnit) return value;
    const key = `${fromUnit}-${toUnit}`;
    return CONVERSIONS[key](value);
  }

  /* ---------- Validation ---------- */

  /**
   * Validates the raw input string.
   * Returns an error message string if invalid, or null if valid.
   */
  function validateInput(rawValue, unit) {
    if (rawValue.trim() === "") {
      return "Please enter a temperature value.";
    }

    const numericValue = Number(rawValue);

    if (Number.isNaN(numericValue)) {
      return "Please enter a valid number.";
    }

    // Physical lower bound: nothing can be colder than absolute zero.
    const belowAbsoluteZero =
      (unit === "C" && numericValue < -273.15) ||
      (unit === "K" && numericValue < 0) ||
      (unit === "F" && numericValue < -459.67);

    if (belowAbsoluteZero) {
      return "That's below absolute zero — please enter a valid temperature.";
    }

    return null;
  }

  function showError(message) {
    errorMessage.textContent = message;
    valueInput.classList.add("input--invalid");
    resultCard.hidden = true;

    // Remove the shake class after the animation completes so it can
    // be re-triggered on a subsequent invalid submission.
    valueInput.addEventListener(
      "animationend",
      () => valueInput.classList.remove("input--invalid"),
      { once: true }
    );
  }

  function clearError() {
    errorMessage.textContent = "";
    valueInput.classList.remove("input--invalid");
  }

  /* ---------- Result display ---------- */
  function showResult(value, unit) {
    const rounded = value.toFixed(2);
    resultValue.textContent = `${rounded} ${UNIT_LABELS[unit]}`;
    resultCard.hidden = false;
  }

  /* ---------- Event: Convert ---------- */
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearError();

    const rawValue = valueInput.value;
    const fromUnit = fromSelect.value;
    const toUnit = toSelect.value;

    const validationError = validateInput(rawValue, fromUnit);
    if (validationError) {
      showError(validationError);
      return;
    }

    const numericValue = Number(rawValue);
    const converted = convertTemperature(numericValue, fromUnit, toUnit);
    showResult(converted, toUnit);
  });

  /* ---------- Event: Reset ---------- */
  resetBtn.addEventListener("click", () => {
    form.reset();
    clearError();
    resultCard.hidden = true;
    valueInput.focus();
  });

  /* ---------- Event: Swap From/To units ---------- */
  swapBtn.addEventListener("click", () => {
    const temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;

    // Small spin animation for feedback
    swapBtn.classList.add("swap-btn--spin");
    setTimeout(() => swapBtn.classList.remove("swap-btn--spin"), 350);

    // If a result is already showing, refresh it with the new units
    if (!resultCard.hidden) {
      form.requestSubmit();
    }
  });

  /* ---------- Live error clearing while typing ---------- */
  valueInput.addEventListener("input", clearError);
})();
