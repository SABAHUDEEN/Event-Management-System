// Minimal modal helper: creates a single reusable overlay and lets pages
// push whatever HTML they want into it. No framework required.
const Modal = {
  ensure() {
    if (document.getElementById('appModal')) return;
    const div = document.createElement('div');
    div.id = 'appModal';
    div.className = 'modal-overlay';
    div.innerHTML = `
      <div class="modal-box" id="appModalBox">
        <div class="modal-head">
          <h5 id="appModalTitle">Dialog</h5>
          <button class="modal-close" id="appModalClose">&times;</button>
        </div>
        <div class="modal-body-inner" id="appModalBody"></div>
      </div>`;
    document.body.appendChild(div);
    document.getElementById('appModalClose').addEventListener('click', Modal.close);
    div.addEventListener('click', (e) => { if (e.target === div) Modal.close(); });
  },
  open(title, html, size = '') {
    Modal.ensure();
    document.getElementById('appModalTitle').textContent = title;
    document.getElementById('appModalBody').innerHTML = html;
    document.getElementById('appModalBox').className = 'modal-box ' + size;
    document.getElementById('appModal').classList.add('open');
  },
  close() {
    const el = document.getElementById('appModal');
    if (el) el.classList.remove('open');
  }
};
