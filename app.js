/**
 * Portafolio: typewriter, tabs, CRUD UI. Datos en JSON (localStorage) vía db.js.
 */

// --- Typewriter ---
const PHRASES = [
  'Entusiasta de ciberseguridad',
  'Ethical Hacker en formación',
  'Automatización y scripting',
  'Dev & Security'
];

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typewriterEl;

function typewriterTick() {
  if (!typewriterEl) return;
  const phrase = PHRASES[phraseIndex];
  if (isDeleting) {
    typewriterEl.textContent = phrase.slice(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % PHRASES.length;
    }
  } else {
    typewriterEl.textContent = phrase.slice(0, charIndex + 1);
    charIndex++;
    if (charIndex === phrase.length) {
      isDeleting = true;
      setTimeout(typewriterTick, 2000);
      return;
    }
  }
  setTimeout(typewriterTick, isDeleting ? 60 : 120);
}

function initTypewriter() {
  typewriterEl = document.getElementById('typewriter');
  if (typewriterEl) setTimeout(typewriterTick, 800);
}

// --- Tabs ---
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById('panel-' + tab);
      if (panel) panel.classList.add('active');
    });
  });
}

// --- Nav móvil ---
function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }
}

// --- Proyectos CRUD ---
function getProjectForm() {
  return {
    id: document.getElementById('project-id').value,
    title: document.getElementById('project-title').value.trim(),
    description: document.getElementById('project-desc').value.trim(),
    technologies: document.getElementById('project-tech').value.trim(),
    url: document.getElementById('project-url').value.trim()
  };
}

function setProjectForm(data) {
  if (!data) data = {};
  document.getElementById('project-id').value = data.id || '';
  document.getElementById('project-title').value = data.title || '';
  document.getElementById('project-desc').value = data.description || '';
  document.getElementById('project-tech').value = data.technologies || '';
  document.getElementById('project-url').value = data.url || '';
}

async function loadProjects() {
  const list = document.getElementById('projects-crud-list');
  const grid = document.getElementById('projects-grid');
  const staticCards = document.querySelectorAll('#projects-grid [data-static]');
  const items = await getAllProjects();

  list.innerHTML = items.map(p => `
    <div class="crud-item" data-id="${p.id}">
      <div class="crud-item-content">
        <h4>${escapeHtml(p.title)}</h4>
        <p>${escapeHtml(p.description || '')}</p>
      </div>
      <div class="crud-item-actions">
        <button type="button" class="edit" data-id="${p.id}">Editar</button>
        <button type="button" class="delete" data-id="${p.id}">Eliminar</button>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('.edit').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const all = await getAllProjects();
      const one = all.find(x => x.id === Number(id));
      if (one) setProjectForm(one);
    });
  });
  list.querySelectorAll('.delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('¿Eliminar este proyecto?')) {
        await deleteProject(btn.dataset.id);
        loadProjects();
        renderProjectsGrid();
        setProjectForm(null);
      }
    });
  });

  // Grid público: estáticos + dinámicos
  const dynamic = items.map(p => `
    <article class="project-card glass">
      <h3 class="font-mono">${escapeHtml(p.title)}</h3>
      <p>${escapeHtml(p.description || '')}</p>
      <div class="project-tags">${(p.technologies || '').split(',').map(t => t.trim()).filter(Boolean).map(t => `<span>${escapeHtml(t)}</span>`).join('')}</div>
      <a href="${escapeHtml(p.url || '#')}" class="btn btn-small" target="_blank" rel="noopener">GitHub</a>
    </article>
  `).join('');
  grid.innerHTML = staticCards.length ? (staticCards[0].outerHTML + dynamic) : dynamic;
}

function renderProjectsGrid() {
  getAllProjects().then(items => {
    const grid = document.getElementById('projects-grid');
    const staticCards = document.querySelectorAll('#projects-grid [data-static]');
    const dynamic = items.map(p => `
      <article class="project-card glass">
        <h3 class="font-mono">${escapeHtml(p.title)}</h3>
        <p>${escapeHtml(p.description || '')}</p>
        <div class="project-tags">${(p.technologies || '').split(',').map(t => t.trim()).filter(Boolean).map(t => `<span>${escapeHtml(t)}</span>`).join('')}</div>
        <a href="${escapeHtml(p.url || '#')}" class="btn btn-small" target="_blank" rel="noopener">GitHub</a>
      </article>
    `).join('');
    grid.innerHTML = staticCards.length ? (staticCards[0].outerHTML + dynamic) : dynamic;
  });
}

document.getElementById('project-save')?.addEventListener('click', async () => {
  const form = getProjectForm();
  if (!form.title) return;
  if (form.id) {
    await updateProject(form.id, { title: form.title, description: form.description, technologies: form.technologies, url: form.url });
  } else {
    await addProject(form);
  }
  setProjectForm(null);
  loadProjects();
  renderProjectsGrid();
});

document.getElementById('project-cancel')?.addEventListener('click', () => setProjectForm(null));

// --- Eventos (calendario) ---
function getEventForm() {
  return {
    id: document.getElementById('event-id').value,
    title: document.getElementById('event-title').value.trim(),
    date: document.getElementById('event-date').value,
    notes: document.getElementById('event-notes').value.trim()
  };
}

function setEventForm(data) {
  if (!data) data = {};
  document.getElementById('event-id').value = data.id || '';
  document.getElementById('event-title').value = data.title || '';
  document.getElementById('event-date').value = data.date || '';
  document.getElementById('event-notes').value = data.notes || '';
}

async function loadEvents() {
  const list = document.getElementById('events-list');
  const items = await getAllEvents();
  list.innerHTML = items.map(e => `
    <div class="crud-item" data-id="${e.id}">
      <div class="crud-item-content">
        <h4>${escapeHtml(e.title)} — ${e.date || 'Sin fecha'}</h4>
        <p>${escapeHtml(e.notes || '')}</p>
      </div>
      <div class="crud-item-actions">
        <button type="button" class="edit" data-id="${e.id}">Editar</button>
        <button type="button" class="delete" data-id="${e.id}">Eliminar</button>
      </div>
    </div>
  `).join('');
  list.querySelectorAll('.edit').forEach(btn => {
    btn.addEventListener('click', async () => {
      const all = await getAllEvents();
      const one = all.find(x => x.id === Number(btn.dataset.id));
      if (one) setEventForm(one);
    });
  });
  list.querySelectorAll('.delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('¿Eliminar este evento?')) {
        await deleteEvent(btn.dataset.id);
        loadEvents();
        renderCalendarView();
        setEventForm(null);
      }
    });
  });
}

document.getElementById('event-save')?.addEventListener('click', async () => {
  const form = getEventForm();
  if (!form.title) return;
  if (form.id) {
    await updateEvent(form.id, { title: form.title, date: form.date, notes: form.notes });
  } else {
    await addEvent(form);
  }
  setEventForm(null);
  loadEvents();
  renderCalendarView();
});

document.getElementById('event-cancel')?.addEventListener('click', () => setEventForm(null));

// --- Roadmap ---
async function loadRoadmap() {
  const container = document.getElementById('timeline-items');
  const items = await getAllRoadmap();
  const sorted = items.slice().sort((a, b) => (a.order || 0) - (b.order || 0));
  toggleRoadmapEmpty(items.length > 0);
  if (container) {
    container.innerHTML = sorted.map(r => {
      const stateLabel = { completed: 'Completado', in_progress: 'En desarrollo', idea: 'Idea futura' }[r.state] || r.state;
      const stateClass = r.state === 'completed' ? 'completed' : r.state === 'idea' ? 'idea' : '';
      return `
        <div class="timeline-item ${stateClass}" data-id="${r.id}">
          <span class="state">${stateLabel}</span>
          <h4>${escapeHtml(r.title)}</h4>
          <p>${escapeHtml(r.description || '')}</p>
        </div>
      `;
    }).join('');
  }
}

function getRoadmapForm() {
  return {
    id: document.getElementById('roadmap-id').value,
    title: document.getElementById('roadmap-title').value.trim(),
    description: document.getElementById('roadmap-desc').value.trim(),
    state: document.getElementById('roadmap-state').value
  };
}

function setRoadmapForm(data) {
  if (!data) data = {};
  document.getElementById('roadmap-id').value = data.id || '';
  document.getElementById('roadmap-title').value = data.title || '';
  document.getElementById('roadmap-desc').value = data.description || '';
  document.getElementById('roadmap-state').value = data.state || 'idea';
}

async function loadRoadmapCrudList() {
  const list = document.getElementById('roadmap-crud-list');
  const items = await getAllRoadmap();
  const sorted = items.slice().sort((a, b) => (a.order || 0) - (b.order || 0));
  list.innerHTML = sorted.map(r => {
    const stateLabel = { completed: 'Completado', in_progress: 'En desarrollo', idea: 'Idea futura' }[r.state] || r.state;
    return `
      <div class="crud-item" data-id="${r.id}">
        <div class="crud-item-content">
          <h4>${escapeHtml(r.title)} — ${stateLabel}</h4>
          <p>${escapeHtml(r.description || '')}</p>
        </div>
        <div class="crud-item-actions">
          <button type="button" class="edit" data-id="${r.id}">Editar</button>
          <button type="button" class="delete" data-id="${r.id}">Eliminar</button>
        </div>
      </div>
    `;
  }).join('');
  list.querySelectorAll('.edit').forEach(btn => {
    btn.addEventListener('click', async () => {
      const all = await getAllRoadmap();
      const one = all.find(x => x.id === Number(btn.dataset.id));
      if (one) setRoadmapForm(one);
    });
  });
  list.querySelectorAll('.delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('¿Eliminar este ítem del roadmap?')) {
        await deleteRoadmapItem(btn.dataset.id);
        loadRoadmapCrudList();
        loadRoadmap();
        setRoadmapForm(null);
      }
    });
  });
}

document.getElementById('roadmap-save')?.addEventListener('click', async () => {
  const form = getRoadmapForm();
  if (!form.title) return;
  if (form.id) {
    const all = await getAllRoadmap();
    const existing = all.find(x => x.id === Number(form.id));
    const payload = { title: form.title, description: form.description, state: form.state, order: existing?.order ?? Date.now() };
    await updateRoadmapItem(form.id, payload);
  } else {
    await addRoadmapItem({ title: form.title, description: form.description, state: form.state, order: Date.now() });
  }
  setRoadmapForm(null);
  loadRoadmapCrudList();
  loadRoadmap();
});

document.getElementById('roadmap-cancel')?.addEventListener('click', () => setRoadmapForm(null));

// --- Notas ---
function getNoteForm() {
  return {
    id: document.getElementById('note-id').value,
    title: document.getElementById('note-title').value.trim(),
    content: document.getElementById('note-content').value.trim()
  };
}

function setNoteForm(data) {
  if (!data) data = {};
  document.getElementById('note-id').value = data.id || '';
  document.getElementById('note-title').value = data.title || '';
  document.getElementById('note-content').value = data.content || '';
}

async function loadNotes() {
  const list = document.getElementById('notes-list');
  const items = await getAllNotes();
  list.innerHTML = items.map(n => `
    <div class="crud-item" data-id="${n.id}">
      <div class="crud-item-content">
        <h4>${escapeHtml(n.title)}</h4>
        <p>${escapeHtml((n.content || '').slice(0, 120))}${(n.content || '').length > 120 ? '…' : ''}</p>
      </div>
      <div class="crud-item-actions">
        <button type="button" class="edit" data-id="${n.id}">Editar</button>
        <button type="button" class="delete" data-id="${n.id}">Eliminar</button>
      </div>
    </div>
  `).join('');
  list.querySelectorAll('.edit').forEach(btn => {
    btn.addEventListener('click', async () => {
      const all = await getAllNotes();
      const one = all.find(x => x.id === Number(btn.dataset.id));
      if (one) setNoteForm(one);
    });
  });
  list.querySelectorAll('.delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('¿Eliminar esta nota?')) {
        await deleteNote(btn.dataset.id);
        loadNotes();
        renderNotesView();
        setNoteForm(null);
      }
    });
  });
}

document.getElementById('note-save')?.addEventListener('click', async () => {
  const form = getNoteForm();
  if (!form.title) return;
  if (form.id) {
    await updateNote(form.id, { title: form.title, content: form.content });
  } else {
    await addNote(form);
  }
  setNoteForm(null);
  loadNotes();
  renderNotesView();
});

document.getElementById('note-cancel')?.addEventListener('click', () => setNoteForm(null));

// --- Checklist ---
function getGoalForm() {
  return { id: document.getElementById('goal-id').value, text: document.getElementById('goal-text').value.trim() };
}

function setGoalForm(data) {
  document.getElementById('goal-id').value = data?.id || '';
  document.getElementById('goal-text').value = data?.text || '';
}

async function loadChecklist() {
  const list = document.getElementById('checklist-list');
  const items = await getAllGoals();
  list.innerHTML = items.map(g => `
    <li class="checklist-item ${g.done ? 'done' : ''}" data-id="${g.id}">
      <input type="checkbox" ${g.done ? 'checked' : ''} data-id="${g.id}" aria-label="Marcar como completado">
      <span>${escapeHtml(g.text)}</span>
      <div class="checklist-item-actions">
        <button type="button" class="delete" data-id="${g.id}" aria-label="Eliminar">✕</button>
      </div>
    </li>
  `).join('');
  list.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', async () => {
      await toggleGoal(cb.dataset.id, cb.checked);
      loadChecklist();
      renderChecklistView();
    });
  });
  list.querySelectorAll('.delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      await deleteGoal(btn.dataset.id);
      loadChecklist();
      renderChecklistView();
    });
  });
}

document.getElementById('goal-save')?.addEventListener('click', async () => {
  const form = getGoalForm();
  if (!form.text) return;
  await addGoal({ text: form.text });
  document.getElementById('goal-text').value = '';
  loadChecklist();
  renderChecklistView();
});

document.getElementById('goal-cancel')?.addEventListener('click', () => document.getElementById('goal-text').value = '');

// --- Vistas de página (Calendario, Notas, Checklist en el inicio) ---
async function renderCalendarView() {
  const container = document.getElementById('calendar-events-view');
  const emptyEl = document.getElementById('calendar-empty');
  if (!container) return;
  const events = await getAllEvents();
  const sorted = events.slice().sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  if (sorted.length === 0) {
    container.innerHTML = '';
    if (emptyEl) emptyEl.classList.remove('hidden');
    return;
  }
  if (emptyEl) emptyEl.classList.add('hidden');
  container.innerHTML = sorted.map(e => `
    <div class="calendar-event-card">
      <span class="calendar-event-date">${escapeHtml(e.date || 'Sin fecha')}</span>
      <div class="calendar-event-body">
        <h4>${escapeHtml(e.title)}</h4>
        ${e.notes ? `<p>${escapeHtml(e.notes)}</p>` : ''}
      </div>
    </div>
  `).join('');
}

async function renderNotesView() {
  const container = document.getElementById('notes-view');
  const emptyEl = document.getElementById('notes-empty');
  if (!container) return;
  const notes = await getAllNotes();
  if (notes.length === 0) {
    container.innerHTML = '';
    if (emptyEl) emptyEl.classList.remove('hidden');
    return;
  }
  if (emptyEl) emptyEl.classList.add('hidden');
  container.innerHTML = notes.map(n => {
    const preview = (n.content || '').slice(0, 120) + ((n.content || '').length > 120 ? '…' : '');
    return `
      <article class="note-card glass">
        <h4>${escapeHtml(n.title)}</h4>
        <p class="note-preview">${escapeHtml(preview)}</p>
      </article>
    `;
  }).join('');
}

async function renderChecklistView() {
  const container = document.getElementById('checklist-view');
  const progressEl = document.getElementById('checklist-progress');
  const emptyEl = document.getElementById('checklist-empty');
  if (!container) return;
  const goals = await getAllGoals();
  const done = goals.filter(g => g.done).length;
  const total = goals.length;
  if (progressEl) progressEl.innerHTML = `<span class="font-mono">${done} / ${total} completados</span>`;
  if (goals.length === 0) {
    container.innerHTML = '';
    if (emptyEl) emptyEl.classList.remove('hidden');
    return;
  }
  if (emptyEl) emptyEl.classList.add('hidden');
  container.innerHTML = goals.map(g => `
    <li class="checklist-view-item ${g.done ? 'done' : ''}" data-id="${g.id}">
      <input type="checkbox" ${g.done ? 'checked' : ''} data-id="${g.id}" aria-label="Marcar">
      <span class="checklist-view-text">${escapeHtml(g.text)}</span>
    </li>
  `).join('');
  container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', async () => {
      await toggleGoal(cb.dataset.id, cb.checked);
      loadChecklist();
      renderChecklistView();
    });
  });
}

function toggleRoadmapEmpty(hasItems) {
  const el = document.getElementById('roadmap-empty');
  if (el) el.classList.toggle('hidden', hasItems);
}

// --- Utilidad ---
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// --- Inicio ---
async function init() {
  initTypewriter();
  initTabs();
  initNav();
  await openDB();
  await loadProjects();
  await loadEvents();
  await renderCalendarView();
  await loadRoadmap();
  await loadRoadmapCrudList();
  await loadNotes();
  await renderNotesView();
  await loadChecklist();
  await renderChecklistView();
}

document.addEventListener('DOMContentLoaded', init);
