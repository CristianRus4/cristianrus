var app;
var NIGHTLY_PAGE_DATA;
document.addEventListener("DOMContentLoaded", function () {
  var dataElement = document.getElementById("nightly-page-data");
  app = document.getElementById("app");
  if (!app || !dataElement) {
    return;
  }
  NIGHTLY_PAGE_DATA = JSON.parse(dataElement.textContent || "{}");
  setupSectionJumpButton();
  setupQuestionToggles();
  setupAnswersReveal();
  setupTrivia(NIGHTLY_PAGE_DATA.trivia);
  setupGame(NIGHTLY_PAGE_DATA.game, NIGHTLY_PAGE_DATA.date);
});
function setupQuestionToggles() {
  var cards = app.querySelectorAll("[data-question-card]");
  var index;
  for (index = 0; index < cards.length; index += 1) {
    setupQuestionCard(cards[index]);
  }
}

function setupAnswersReveal() {
  var button = app.querySelector("[data-answers-toggle]");
  var wrap = app.querySelector("[data-answers-toggle-wrap]");
  var content = app.querySelector("[data-answers-content]");
  if (!button || !content || !wrap) {
    return;
  }

  button.onclick = function () {
    wrap.hidden = true;
    content.hidden = false;
  };
}

function setupSectionJumpButton() {
  var button = document.createElement("button");
  button.type = "button";
  button.className = "section-jump-button";
  button.setAttribute("aria-label", "Jump to next section");
  button.innerHTML = "<span aria-hidden=\"true\">⌄</span>";

  button.onclick = function () {
    jumpToNextSection();
  };

  document.body.appendChild(button);
  updateSectionJumpButton(button);
  window.addEventListener("scroll", function () {
    updateSectionJumpButton(button);
  }, { passive: true });
  window.addEventListener("resize", function () {
    updateSectionJumpButton(button);
  });
}

function getNextSection() {
  var sections = app ? app.children : [];
  var tolerance = 96;
  var index;
  var section;
  var top;

  for (index = 0; index < sections.length; index += 1) {
    section = sections[index];
    if (!section.classList || !section.classList.contains("card")) {
      continue;
    }

    top = section.getBoundingClientRect().top;
    if (top > tolerance) {
      return section;
    }
  }

  return null;
}

function updateSectionJumpButton(button) {
  var nextSection = getNextSection();
  button.disabled = !nextSection;
  button.hidden = !nextSection;
}

function jumpToNextSection() {
  var nextSection = getNextSection();
  var offset = 18;
  if (!nextSection) {
    return;
  }

  window.scrollTo({
    top: window.scrollY + nextSection.getBoundingClientRect().top - offset,
    behavior: "smooth"
  });
}

function setupQuestionCard(card) {
  var buttons = card.querySelectorAll("[data-question-toggle]");
  var panels = card.querySelectorAll("[data-question-panel]");
  var index;

  function setButtonState(button, isOpen) {
    var marker = button.querySelector(".button-marker");
    button.classList.toggle("is-active", isOpen);
    button.setAttribute("aria-expanded", isOpen ? "true" : "false");
    if (marker) {
      marker.textContent = isOpen ? "-" : "+";
    }
  }

  function closeAll() {
    var panelIndex;
    for (panelIndex = 0; panelIndex < panels.length; panelIndex += 1) {
      panels[panelIndex].hidden = true;
    }

    for (panelIndex = 0; panelIndex < buttons.length; panelIndex += 1) {
      setButtonState(buttons[panelIndex], false);
    }
  }

  for (index = 0; index < buttons.length; index += 1) {
    buttons[index].onclick = function () {
      var target = this.getAttribute("data-question-toggle");
      var targetPanel = card.querySelector('[data-question-panel="' + target + '"]');
      var isOpen = !targetPanel.hidden;

      closeAll();

      if (!isOpen) {
        targetPanel.hidden = false;
        setButtonState(this, true);
      }
    };
  }
}

function setupTrivia(trivia) {
  var buttons = app.querySelectorAll("[data-trivia-option]");
  var explanation = app.querySelector("[data-trivia-explanation]");
  var index;

  for (index = 0; index < buttons.length; index += 1) {
    attachTriviaButton(buttons[index], buttons, explanation, trivia);
  }
}

function attachTriviaButton(button, buttons, explanation, trivia) {
  button.onclick = function () {
    var selected;
    var isCorrect;
    var index;
    var marker;
    var loopMarker;

    selected = Number(button.getAttribute("data-trivia-option"));
    isCorrect = selected === trivia.correct;
    marker = button.querySelector(".trivia-option-marker");

    for (index = 0; index < buttons.length; index += 1) {
      buttons[index].classList.remove("is-selected");
      buttons[index].classList.remove("is-correct");
      loopMarker = buttons[index].querySelector(".trivia-option-marker");
      loopMarker.textContent = "";
    }

    button.classList.add("is-selected");
    button.classList.remove("is-incorrect");

    if (isCorrect) {
      button.classList.add("is-correct");
      if (marker) {
        marker.textContent = "✓";
      }
      if (explanation) {
        explanation.hidden = false;
      }
    } else {
      button.classList.add("is-incorrect");
      if (marker) {
        marker.textContent = "×";
      }
      if (explanation) {
        explanation.hidden = true;
      }
    }
  };
}

function setupGame(game, dateString) {
  var container = document.getElementById("nightly-game");
  if (!container) {
    return;
  }

  if (game.type === "reveal") {
    setupRevealGame(container, game.data);
  } else if (game.type === "two_truths_one_lie") {
    setupTwoTruthsGame(container, game.data);
  } else if (game.type === "missing_word") {
    setupMissingWordGame(container, game.data);
  } else if (game.type === "concept_match") {
    setupConceptMatchGame(container, game.data, dateString);
  } else if (game.type === "letter_by_letter") {
    setupLetterByLetterGame(container, game.data);
  } else if (game.type === "first_and_last") {
    setupFirstAndLastGame(container, game.data);
  } else if (game.type === "false_cognate") {
    setupFalseCognateGame(container, game.data);
  } else if (game.type === "odd_one_out") {
    setupOddOneOutGame(container, game.data);
  }
}

function setupRevealGame(container, data) {
  var clues = toStringArray(data && data.clues, 4, "Clue unavailable.");
  var answer = safeText(data && data.answer, "");
  var scoreLabels = toStringArray(data && data.score_labels, 4, "Complete");
  var list = container.querySelector("[data-reveal-clues]");
  var button = container.querySelector("[data-reveal-more]");
  var form = container.querySelector("[data-reveal-form]");
  var input = container.querySelector("#reveal-guess");
  var status = container.querySelector("[data-reveal-status]");
  var submitButton = form.querySelector("button");
  var clueCount = 1;

  button.onclick = function () {
    var item;
    if (clueCount >= clues.length) {
      button.disabled = true;
      return;
    }

    item = document.createElement("p");
    item.textContent = (clueCount + 1) + ". " + clues[clueCount];
    list.appendChild(item);
    clueCount += 1;

    if (clueCount >= clues.length) {
      button.disabled = true;
    }
  };

  form.onsubmit = function (event) {
    var guess;
    var expected;
    var scoreIndex;

    event.preventDefault();
    guess = normalizeAnswer(input.value);
    expected = normalizeAnswer(answer);

    if (!guess) {
      setStatus(status, "Enter a guess first.", false);
      return;
    }

    if (guess === expected) {
      scoreIndex = Math.max(0, Math.min(clueCount - 1, scoreLabels.length - 1));
      setStatus(status, "", true);
      setActionButtonState(submitButton, "success");
      submitButton.disabled = true;
      input.disabled = true;
      button.disabled = true;
    } else {
      setStatus(status, "", false);
      setActionButtonState(submitButton, "error");
    }
  };

  input.oninput = function () {
    if (!submitButton.disabled) {
      setActionButtonState(submitButton, "idle");
    }
  };
}

function setupTwoTruthsGame(container, data) {
  var options = Array.isArray(data && data.options) ? data.options.slice(0, 3) : [];
  var buttons = container.querySelectorAll("[data-lie-option]");
  var status = container.querySelector("[data-lie-status]");
  var index;

  for (index = 0; index < buttons.length; index += 1) {
    attachLieButton(buttons[index], buttons, options, container, status);
  }
}

function attachLieButton(button, buttons, options, container, status) {
  button.onclick = function () {
    var selected;
    var isLie;
    var index;
    var marker;

    if (button.disabled) {
      return;
    }

    selected = Number(button.getAttribute("data-lie-option"));
    isLie = Boolean(options[selected] && options[selected].is_lie);
    marker = button.querySelector(".trivia-option-marker");

    if (isLie) {
      for (index = 0; index < buttons.length; index += 1) {
        buttons[index].disabled = true;
      }
      button.classList.add("is-matched");
      if (marker) {
        marker.textContent = "✓";
      }
      setStatus(status, "", true);
    } else {
      button.classList.add("is-incorrect");
      if (marker) {
        marker.textContent = "×";
      }
      setStatus(status, "", false);
    }
  };
}

function setupMissingWordGame(container, data) {
  var answer = safeText(data && data.answer, "");
  var hint = safeNullableText(data && data.hint);
  var form = container.querySelector("[data-missing-form]");
  var input = container.querySelector("#missing-word-guess");
  var status = container.querySelector("[data-missing-status]");
  var hintLine = container.querySelector("[data-missing-hint]");
  var submitButton = form.querySelector("button");

  form.onsubmit = function (event) {
    var guess;
    event.preventDefault();
    guess = normalizeAnswer(input.value);

    if (!guess) {
      setStatus(status, "Enter a guess first.", false);
      return;
    }

    if (guess === normalizeAnswer(answer)) {
      setStatus(status, "", true);
      setActionButtonState(submitButton, "success");
      input.disabled = true;
      submitButton.disabled = true;
    } else {
      setStatus(status, "", false);
      setActionButtonState(submitButton, "error");
      if (hint) {
        hintLine.textContent = "Hint: " + hint;
        hintLine.hidden = false;
      }
    }
  };

  input.oninput = function () {
    if (!submitButton.disabled) {
      setActionButtonState(submitButton, "idle");
    }
  };
}

function setupConceptMatchGame(container, data) {
  var pairs = Array.isArray(data && data.pairs) ? data.pairs.slice(0, 4) : [];
  var wordButtons = container.querySelectorAll("[data-match-word]");
  var definitionButtons = container.querySelectorAll("[data-match-definition]");
  var status = container.querySelector("[data-match-status]");
  var selectedWordId = null;
  var selectedDefinitionId = null;
  var matches = 0;
  var index;

  for (index = 0; index < wordButtons.length; index += 1) {
    attachWordButton(wordButtons[index]);
  }

  for (index = 0; index < definitionButtons.length; index += 1) {
    attachDefinitionButton(definitionButtons[index]);
  }

  function attachWordButton(button) {
    button.onclick = function () {
      var buttonIndex;
      if (button.disabled) {
        return;
      }

      for (buttonIndex = 0; buttonIndex < wordButtons.length; buttonIndex += 1) {
        wordButtons[buttonIndex].classList.remove("is-selected");
      }
      button.classList.add("is-selected");
      button.classList.remove("is-incorrect");
      selectedWordId = button.getAttribute("data-match-word");
      attemptMatch();
    };
  }

  function attachDefinitionButton(button) {
    button.onclick = function () {
      var buttonIndex;
      if (button.disabled) {
        return;
      }

      for (buttonIndex = 0; buttonIndex < definitionButtons.length; buttonIndex += 1) {
        definitionButtons[buttonIndex].classList.remove("is-selected");
      }
      button.classList.add("is-selected");
      button.classList.remove("is-incorrect");
      selectedDefinitionId = button.getAttribute("data-match-definition");
      attemptMatch();
    };
  }

  function attemptMatch() {
    var wordButton;
    var definitionButton;
    var wordMarker;
    var definitionMarker;
    if (!selectedWordId || !selectedDefinitionId) {
      return;
    }

    wordButton = container.querySelector('[data-match-word="' + selectedWordId + '"]');
    definitionButton = container.querySelector('[data-match-definition="' + selectedDefinitionId + '"]');
    wordMarker = wordButton ? wordButton.querySelector(".match-option-marker") : null;
    definitionMarker = definitionButton ? definitionButton.querySelector(".match-option-marker") : null;

    if (selectedWordId === selectedDefinitionId) {
      matches += 1;
      wordButton.disabled = true;
      definitionButton.disabled = true;
      wordButton.classList.remove("is-incorrect", "is-selected");
      definitionButton.classList.remove("is-incorrect", "is-selected");
      wordButton.className = "option-button is-matched";
      definitionButton.className = "option-button is-matched";
      if (wordMarker) {
        wordMarker.textContent = "";
      }
      if (definitionMarker) {
        definitionMarker.textContent = "";
      }
      setStatus(status, "", true);

      if (matches === pairs.length) {
        setStatus(status, "All pairs matched.", true);
      }
    } else {
      if (wordButton) {
        wordButton.classList.add("is-incorrect");
      }
      if (definitionButton) {
        definitionButton.classList.add("is-incorrect");
      }
      if (wordMarker) {
        wordMarker.textContent = "";
      }
      if (definitionMarker) {
        definitionMarker.textContent = "";
      }
      setStatus(status, "", false);
      if (wordButton) {
        wordButton.classList.remove("is-selected");
      }
      if (definitionButton) {
        definitionButton.classList.remove("is-selected");
      }
    }

    selectedWordId = null;
    selectedDefinitionId = null;
  }
}

function setupLetterByLetterGame(container, data) {
  var answer = safeText(data && data.answer, "").toUpperCase();
  var maxWrong = Number.isInteger(data && data.max_wrong) ? data.max_wrong : 6;
  var successNote = safeNullableText(data && data.success_note);
  var mask = container.querySelector("[data-letter-mask]");
  var used = container.querySelector("[data-letter-used]");
  var wrong = container.querySelector("[data-letter-wrong]");
  var status = container.querySelector("[data-letter-status]");
  var form = container.querySelector("[data-letter-form]");
  var input = container.querySelector("#letter-guess");
  var submitButton = form.querySelector("button");
  var guessedLetters = [];
  var wrongCount = 0;

  form.onsubmit = function (event) {
    var letter;
    var currentMask;
    event.preventDefault();
    letter = String(input.value || "").trim().toUpperCase();

    if (!/^[A-ZÀ-ÖØ-Þ]$/i.test(letter)) {
      setStatus(status, "Enter one letter.", false);
      return;
    }

    if (guessedLetters.indexOf(letter) !== -1) {
      setStatus(status, "That letter was already used.", false);
      input.value = "";
      return;
    }

    guessedLetters.push(letter);
    used.textContent = "Used letters: " + guessedLetters.join(", ");

    if (answer.indexOf(letter) !== -1) {
      currentMask = renderMask(answer, guessedLetters);
      mask.innerHTML = currentMask;
      if (currentMask.indexOf("_") === -1) {
        setStatus(status, successNote || "Solved.", true);
        setActionButtonState(submitButton, "success");
        submitButton.disabled = true;
        input.disabled = true;
      } else {
        setStatus(status, "Good letter.", true);
        setActionButtonState(submitButton, "idle");
      }
    } else {
      wrongCount += 1;
      wrong.textContent = "Wrong guesses: " + wrongCount + " / " + maxWrong;
      if (wrongCount >= maxWrong) {
        setStatus(status, "No more guesses. The answer is below.", false);
        setActionButtonState(submitButton, "error");
        submitButton.disabled = true;
        input.disabled = true;
      } else {
        setStatus(status, "Not in the word.", false);
        setActionButtonState(submitButton, "error");
      }
    }

    input.value = "";
  };
}

function setupFirstAndLastGame(container, data) {
  var answer = safeText(data && data.answer, "");
  var form = container.querySelector("[data-first-last-form]");
  var input = container.querySelector("#first-last-guess");
  var status = container.querySelector("[data-first-last-status]");
  var submitButton = form.querySelector("button");

  form.onsubmit = function (event) {
    var middle;
    var guess;
    event.preventDefault();
    middle = String(input.value || "").trim();
    if (!middle) {
      setStatus(status, "Enter the missing middle letters.", false);
      return;
    }

    guess = answer.charAt(0) + middle + answer.charAt(answer.length - 1);
    if (normalizeAnswer(guess) === normalizeAnswer(answer)) {
      setStatus(status, "", true);
      setActionButtonState(submitButton, "success");
      input.disabled = true;
      submitButton.disabled = true;
    } else {
      setStatus(status, "", false);
      setActionButtonState(submitButton, "error");
    }
  };

  input.oninput = function () {
    if (!submitButton.disabled) {
      setActionButtonState(submitButton, "idle");
    }
  };
}

function setupFalseCognateGame(container, data) {
  var answer = normalizeGameType(data && data.answer);
  var buttons = container.querySelectorAll("[data-cognate-choice]");
  var status = container.querySelector("[data-cognate-status]");
  var index;

  for (index = 0; index < buttons.length; index += 1) {
    attachCognateButton(buttons[index], buttons, container, status, answer);
  }
}

function attachCognateButton(button, buttons, container, status, answer) {
  button.onclick = function () {
    var choice;
    var index;
    var correctButton;

    if (button.disabled) {
      return;
    }

    choice = button.getAttribute("data-cognate-choice");
    for (index = 0; index < buttons.length; index += 1) {
      buttons[index].disabled = true;
    }

    if (choice === answer) {
      button.classList.add("is-correct");
      setStatus(status, "", true);
    } else {
      button.classList.add("is-incorrect");
      setStatus(status, "", false);
      correctButton = container.querySelector('[data-cognate-choice="' + answer + '"]');
      if (correctButton) {
        correctButton.classList.add("is-correct");
      }
    }
  };
}

function setupOddOneOutGame(container, data) {
  var options = Array.isArray(data && data.options) ? data.options.slice(0, 5) : [];
  var buttons = container.querySelectorAll("[data-odd-option]");
  var status = container.querySelector("[data-odd-status]");
  var index;

  for (index = 0; index < buttons.length; index += 1) {
    attachOddButton(buttons[index], buttons, options, container, status);
  }
}

function attachOddButton(button, buttons, options, container, status) {
  button.onclick = function () {
    var selected;
    var isOdd;
    var index;
    var correctIndex;
    var correctButton;

    if (button.disabled) {
      return;
    }

    selected = Number(button.getAttribute("data-odd-option"));
    isOdd = Boolean(options[selected] && options[selected].is_odd);

    for (index = 0; index < buttons.length; index += 1) {
      buttons[index].disabled = true;
    }

    if (isOdd) {
      button.classList.add("is-correct");
      setStatus(status, "", true);
    } else {
      button.classList.add("is-incorrect");
      setStatus(status, "", false);
      correctIndex = -1;
      for (index = 0; index < options.length; index += 1) {
        if (options[index] && options[index].is_odd) {
          correctIndex = index;
          break;
        }
      }
      correctButton = container.querySelector('[data-odd-option="' + correctIndex + '"]');
      if (correctButton) {
        correctButton.classList.add("is-correct");
      }
    }
  };
}

function renderMask(answer, guessedLetters) {
  return answer
    .toUpperCase()
    .split("")
    .map(function (character) {
      if (character === " ") {
        return "<span>&nbsp;</span>";
      }

      return guessedLetters.indexOf(character) !== -1
        ? "<span>" + escapeHtml(character) + "</span>"
        : "<span>_</span>";
    })
    .join("");
}

function normalizeGameType(value) {
  var raw = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  var aliases = {
    reveal: "reveal",
    two_truths_one_lie: "two_truths_one_lie",
    two_truths_one_lies: "two_truths_one_lie",
    missing_word: "missing_word",
    concept_match: "concept_match",
    letter_by_letter: "letter_by_letter",
    first_and_last: "first_and_last",
    false_cognate: "false_cognate",
    odd_one_out: "odd_one_out"
  };

  return aliases[raw] || "unsupported";
}

function normalizeAnswer(value) {
  return stripMarks(String(value || ""))
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, " ");
}

function stripMarks(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function setStatus(element, text, isSuccess) {
  if (!element) {
    return;
  }
  element.textContent = text;
  element.className = isSuccess ? "game-status is-success" : "game-status is-error";
}

function setActionButtonState(button, state) {
  var defaultLabel;
  if (!button) {
    return;
  }

  defaultLabel = button.getAttribute("data-default-label") || "Submit";
  button.classList.remove("is-success", "is-error");

  if (state === "success") {
    button.textContent = "Correct";
    button.classList.add("is-success");
    return;
  }

  if (state === "error") {
    button.textContent = "Try again";
    button.classList.add("is-error");
    return;
  }

  button.textContent = defaultLabel;
}

function safeText(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function safeNullableText(value) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function toStringArray(value, fallbackCount, fallbackText, allowObjects) {
  var index;
  var result;
  if (!Array.isArray(value) || !value.length) {
    result = [];
    for (index = 0; index < Math.max(fallbackCount, 1); index += 1) {
      result.push(fallbackText);
    }
    return result;
  }

  return value.map(function (item) {
    if (allowObjects && item && typeof item === "object") {
      return item;
    }
    return safeText(item, fallbackText);
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
