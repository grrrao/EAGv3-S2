(function() {
  let activePopup = null;
  let activeTrigger = null;
  let selectionTimeout = null;

  document.addEventListener('mouseup', handleSelection);
  document.addEventListener('mousedown', (e) => {
    // If clicking outside popup or trigger, remove them
    if (activePopup && !activePopup.contains(e.target)) {
      removePopup();
    }
    if (activeTrigger && !activeTrigger.contains(e.target)) {
      removeTrigger();
    }
  });

  function handleSelection(e) {
    // Don't interfere if a popup is already showing
    if (activePopup) return;

    if (selectionTimeout) clearTimeout(selectionTimeout);

    selectionTimeout = setTimeout(() => {
      // Re-check popup in case it opened during the debounce window
      if (activePopup) return;

      const selection = window.getSelection();
      const selectedText = selection.toString().trim();

      // Skip if multiple words are selected, empty, or too short
      if (!selectedText || selectedText.includes(' ') || selectedText.includes('\n') || selectedText.length < 2) {
        removeTrigger();
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      showTriggerButton(rect.left + window.scrollX, rect.top + window.scrollY - 30, selectedText);
    }, 200); // 200ms debounce
  }

  function showTriggerButton(x, y, word) {
    removeTrigger(); // only remove trigger, never touch existing popup

    const trigger = document.createElement('div');
    trigger.className = 'kannada-translate-trigger';
    trigger.style.left = `${x}px`;
    trigger.style.top = `${y}px`;
    trigger.innerHTML = 'ಕ';
    trigger.title = `Translate "${word}" to Kannada`;

    trigger.addEventListener('mousedown', (e) => e.stopPropagation());
    trigger.addEventListener('mouseup', (e) => e.stopPropagation());
    trigger.onclick = (e) => {
      e.stopPropagation();
      removeTrigger();
      showPopup(x, y + 40, word);
    };

    document.body.appendChild(trigger);
    activeTrigger = trigger;
  }

  function showPopup(x, y, word) {
    removePopup();

    const popup = document.createElement('div');
    popup.className = 'kannada-translate-popup loading';
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;

    popup.innerHTML = `
      <div class="k-header">
        <span class="k-word">${word}</span>
        <button class="k-close" title="Close">✕</button>
      </div>
      <div class="k-loading-row"><div class="k-loader"></div></div>
    `;

    // Stop mouse events inside popup from propagating to document
    popup.addEventListener('mousedown', (e) => e.stopPropagation());
    popup.addEventListener('mouseup', (e) => e.stopPropagation());

    // Explicit close button
    popup.querySelector('.k-close').onclick = (e) => {
      e.stopPropagation();
      removePopup();
    };

    document.body.appendChild(popup);
    activePopup = popup;

    // Send to background for translation
    chrome.runtime.sendMessage({ type: 'TRANSLATE_WORD', word }, (response) => {
      if (chrome.runtime.lastError) {
        updatePopupError("Extension context invalidated. Please refresh the page.");
        return;
      }
      if (response && response.success) {
        updatePopup(response.data);
      } else {
        updatePopupError(response ? response.error : 'Translation failed');
      }
    });

    // Ensure popup is within viewport
    requestAnimationFrame(() => {
      if (!activePopup) return;
      const popupRect = popup.getBoundingClientRect();
      if (popupRect.right > window.innerWidth) {
        popup.style.left = `${window.innerWidth - popupRect.width - 20}px`;
      }
      if (popupRect.bottom > window.innerHeight) {
        popup.style.top = `${y - popupRect.height - 50}px`;
      }
    });
  }

  function updatePopup(data) {
    if (!activePopup) return;
    activePopup.classList.remove('loading');

    activePopup.innerHTML = `
      <div class="k-container">
        <div class="k-main">
          <div class="k-translation">${data.translation}</div>
          <div class="k-transliteration">${data.transliteration}</div>
        </div>
        <div class="k-breakdown">
          ${data.breakdown.map(item => `
            <div class="k-char-item">
              <span class="k-char">${item.char}</span>
              <span class="k-sound">${item.sound}</span>
              <span class="k-type">${item.type}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function updatePopupError(error) {
    if (!activePopup) return;
    activePopup.classList.remove('loading');
    activePopup.innerHTML = `<div class="k-error">${error}</div>`;
  }

  function removePopup() {
    if (activePopup) {
      activePopup.remove();
      activePopup = null;
    }
  }

  function removeTrigger() {
    if (activeTrigger) {
      activeTrigger.remove();
      activeTrigger = null;
    }
  }
})();
