/**
 * Todo se guarda en JSON en localStorage. Sin IndexedDB.
 * Clave: portfolio_json — un solo objeto con projects, events, notes, goals, roadmap.
 */
const LS_KEY = 'portfolio_json';

// Claves con nombres poco llamativos para no revelar propósito (F12)
const _r0 = '_r0';   // referencia de estado / cache
const _s0 = '_s0';   // sesión

function _x(s, k) {
  if (!s || !k) return '';
  var r = '', i = 0;
  for (var j = 0; j < s.length; j++) {
    r += String.fromCharCode(s.charCodeAt(j) ^ k.charCodeAt(i % k.length));
    i++;
  }
  return r;
}

function _enc(v) {
  try {
    var j = typeof v === 'string' ? v : JSON.stringify(v);
    return btoa(unescape(encodeURIComponent(_x(j, '7f3a9e'))));
  } catch (_) { return ''; }
}

function _dec(s) {
  try {
    var raw = decodeURIComponent(escape(atob(s)));
    return _x(raw, '7f3a9e');
  } catch (_) { return ''; }
}

/** Obtiene credenciales almacenadas (ofuscadas). Devuelve { u, p } o null. */
function getStoredCredentials() {
  try {
    var raw = localStorage.getItem(_r0);
    if (!raw) return null;
    var json = _dec(raw);
    if (!json) return null;
    var o = JSON.parse(json);
    return o && (o.u !== undefined || o.p !== undefined) ? { u: o.u || '', p: o.p || '' } : null;
  } catch (_) { return null; }
}

/** Guarda credenciales (ofuscadas). Solo un usuario. */
function setStoredCredentials(u, p) {
  try {
    var payload = _enc(JSON.stringify({ u: String(u || ''), p: String(p || '') }));
    localStorage.setItem(_r0, payload);
  } catch (_) {}
}

/** Comprueba si hay sesión válida. */
function hasValidSession() {
  try {
    var raw = localStorage.getItem(_s0);
    if (!raw) return false;
    var t = _dec(raw);
    return t === '1' || (parseInt(t, 10) && Date.now() - parseInt(t, 10) < 86400000);
  } catch (_) { return false; }
}

/** Establece sesión (valor ofuscado). */
function setSession() {
  try {
    localStorage.setItem(_s0, _enc(String(Date.now())));
  } catch (_) {}
}

/** Cierra sesión. */
function clearSession() {
  try { localStorage.removeItem(_s0); } catch (_) {}
}

function getData() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return {
    projects: [],
    events: [],
    notes: [],
    goals: [],
    roadmap: [],
    annotations: []
  };
}

function saveData(data) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch (_) {}
}

function nextId(arr) {
  if (!arr.length) return 1;
  const ids = arr.map(x => x.id).filter(n => typeof n === 'number');
  return ids.length ? Math.max(...ids) + 1 : 1;
}

// Para compatibilidad con app.js que llama await openDB()
function openDB() {
  return Promise.resolve(null);
}

// --- Projects ---
async function getAllProjects() {
  return getData().projects;
}

async function addProject(data) {
  const d = getData();
  const id = nextId(d.projects);
  d.projects.push({
    id,
    title: data.title || '',
    description: data.description || '',
    technologies: data.technologies || '',
    url: data.url || '',
    created: Date.now()
  });
  saveData(d);
  return id;
}

async function updateProject(id, data) {
  const d = getData();
  const i = d.projects.findIndex(p => p.id === Number(id));
  if (i === -1) return;
  d.projects[i] = { ...d.projects[i], ...data, id: Number(id) };
  saveData(d);
}

async function deleteProject(id) {
  const d = getData();
  const numId = Number(id);
  d.projects = d.projects.filter(p => p.id !== numId);
  d.annotations = d.annotations.filter(a => a.projectId !== numId);
  saveData(d);
}

// --- Anotaciones (por proyecto) ---
async function getAnnotationsByProject(projectId) {
  const d = getData();
  return (d.annotations || []).filter(a => a.projectId === Number(projectId));
}

async function addAnnotation(projectId, data) {
  const d = getData();
  d.annotations = d.annotations || [];
  const id = nextId(d.annotations);
  d.annotations.push({
    id,
    projectId: Number(projectId),
    title: data.title || '',
    content: data.content || '',
    created: Date.now()
  });
  saveData(d);
  return id;
}

async function updateAnnotation(id, data) {
  const d = getData();
  d.annotations = d.annotations || [];
  const i = d.annotations.findIndex(a => a.id === Number(id));
  if (i === -1) return;
  d.annotations[i] = { ...d.annotations[i], ...data, id: Number(id) };
  saveData(d);
}

async function deleteAnnotation(id) {
  const d = getData();
  d.annotations = (d.annotations || []).filter(a => a.id !== Number(id));
  saveData(d);
}

// --- Events (calendario) ---
async function getAllEvents() {
  return getData().events;
}

async function addEvent(data) {
  const d = getData();
  const id = nextId(d.events);
  d.events.push({
    id,
    title: data.title || '',
    date: data.date || '',
    notes: data.notes || '',
    created: Date.now()
  });
  saveData(d);
  return id;
}

async function updateEvent(id, data) {
  const d = getData();
  const i = d.events.findIndex(e => e.id === Number(id));
  if (i === -1) return;
  d.events[i] = { ...d.events[i], ...data, id: Number(id) };
  saveData(d);
}

async function deleteEvent(id) {
  const d = getData();
  d.events = d.events.filter(e => e.id !== Number(id));
  saveData(d);
}

// --- Notes ---
async function getAllNotes() {
  return getData().notes;
}

async function addNote(data) {
  const d = getData();
  const id = nextId(d.notes);
  d.notes.push({
    id,
    title: data.title || '',
    content: data.content || '',
    created: Date.now()
  });
  saveData(d);
  return id;
}

async function updateNote(id, data) {
  const d = getData();
  const i = d.notes.findIndex(n => n.id === Number(id));
  if (i === -1) return;
  d.notes[i] = { ...d.notes[i], ...data, id: Number(id) };
  saveData(d);
}

async function deleteNote(id) {
  const d = getData();
  d.notes = d.notes.filter(n => n.id !== Number(id));
  saveData(d);
}

// --- Goals (checklist) ---
async function getAllGoals() {
  return getData().goals;
}

async function addGoal(data) {
  const d = getData();
  const id = nextId(d.goals);
  d.goals.push({
    id,
    text: data.text || '',
    done: false,
    created: Date.now()
  });
  saveData(d);
  return id;
}

async function toggleGoal(id, done) {
  const d = getData();
  const g = d.goals.find(x => x.id === Number(id));
  if (g) {
    g.done = done;
    saveData(d);
  }
}

async function deleteGoal(id) {
  const d = getData();
  d.goals = d.goals.filter(g => g.id !== Number(id));
  saveData(d);
}

// --- Roadmap ---
async function getAllRoadmap() {
  return getData().roadmap;
}

async function addRoadmapItem(data) {
  const d = getData();
  const id = nextId(d.roadmap);
  d.roadmap.push({
    id,
    title: data.title || '',
    description: data.description || '',
    state: data.state || 'idea',
    order: data.order ?? Date.now(),
    created: Date.now()
  });
  saveData(d);
  return id;
}

async function updateRoadmapItem(id, data) {
  const d = getData();
  const i = d.roadmap.findIndex(r => r.id === Number(id));
  if (i === -1) return;
  d.roadmap[i] = { ...d.roadmap[i], ...data, id: Number(id) };
  saveData(d);
}

async function deleteRoadmapItem(id) {
  const d = getData();
  d.roadmap = d.roadmap.filter(r => r.id !== Number(id));
  saveData(d);
}
