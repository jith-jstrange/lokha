document.addEventListener('DOMContentLoaded', () => {
  // Add copy code buttons to all code blocks
  document.querySelectorAll('pre code').forEach((codeBlock) => {
    const pre = codeBlock.parentNode;
    if (!pre) return;

    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-code-btn';
    copyBtn.innerText = 'Copy';
    copyBtn.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #fff;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s ease;
    `;

    pre.style.position = 'relative';
    pre.appendChild(copyBtn);

    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(codeBlock.innerText).then(() => {
        copyBtn.innerText = 'Copied!';
        copyBtn.style.borderColor = '#00F0FF';
        copyBtn.style.color = '#00F0FF';
        setTimeout(() => {
          copyBtn.innerText = 'Copy';
          copyBtn.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          copyBtn.style.color = '#fff';
        }, 2000);
      });
    });
  });
});
