document.addEventListener('DOMContentLoaded', () => {
  // Popover Dropdown Toggle
  const toggleBtn = document.getElementById('menuToggleBtn');
  const dropdownCard = document.getElementById('navDropdownCard');

  if (toggleBtn && dropdownCard) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdownCard.classList.contains('is-active');
      if (isOpen) {
        dropdownCard.classList.remove('is-active');
        toggleBtn.setAttribute('aria-expanded', 'false');
        dropdownCard.setAttribute('aria-hidden', 'true');
      } else {
        dropdownCard.classList.add('is-active');
        toggleBtn.setAttribute('aria-expanded', 'true');
        dropdownCard.setAttribute('aria-hidden', 'false');
      }
    });

    // Close when clicking anywhere outside
    document.addEventListener('click', (e) => {
      if (!dropdownCard.contains(e.target) && !toggleBtn.contains(e.target)) {
        dropdownCard.classList.remove('is-active');
        toggleBtn.setAttribute('aria-expanded', 'false');
        dropdownCard.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // 1-click copy buttons for code blocks
  document.querySelectorAll('pre code').forEach((codeBlock) => {
    const pre = codeBlock.parentNode;
    if (pre && pre.tagName.toLowerCase() === 'pre') {
      const copyBtn = document.createElement('button');
      copyBtn.className = 'code-copy-btn';
      copyBtn.textContent = 'Copy';
      copyBtn.style.cssText = `
        position: absolute;
        top: 8px;
        right: 8px;
        background: rgba(255, 255, 255, 0.15);
        color: #FFF;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 12px;
        cursor: pointer;
      `;
      pre.style.position = 'relative';
      pre.appendChild(copyBtn);

      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(codeBlock.innerText).then(() => {
          copyBtn.textContent = 'Copied!';
          setTimeout(() => {
            copyBtn.textContent = 'Copy';
          }, 2000);
        });
      });
    }
  });
});
