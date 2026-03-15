/**
 * Todo se guarda en JSON en localStorage. Sin IndexedDB.
 * Clave: portfolio_json — un solo objeto con projects, events, notes, goals, roadmap.
 */
const LS_KEY = 'portfolio_json';

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
