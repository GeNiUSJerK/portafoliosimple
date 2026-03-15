# Portafolio estático — Dark Mode Tech

Sitio estático tipo portafolio + panel de control personal, pensado para **GitHub Pages**. Estética *Dark Mode Tech* con acentos cian, glassmorphism y neon glow. Backend simulado con **IndexedDB** en el navegador (sin servidor).

## Contenido

- **Hero** con efecto typewriter (frases rotativas).
- **Sobre mí** y metas técnicas.
- **Tech Stack** en matriz de iconos por categorías.
- **Roadmap** como línea de tiempo (estados: completado, en desarrollo, idea).
- **Proyectos** en tarjetas glassmorphism (públicas + las que añadas desde el Dashboard).
- **Dashboard** (CRUD local):
  - **Proyectos**: crear, editar, eliminar; se muestran también en la sección Proyectos.
  - **Calendario**: eventos de aprendizaje con fecha y notas.
  - **Roadmap**: ítems de la línea de tiempo (estado y orden).
  - **Notas**: notas personales (p. ej. ciberseguridad).
  - **Checklist**: objetivos con marcar completado / eliminar.

Todo lo que guardes en el Dashboard se persiste en **IndexedDB** en el mismo navegador.

## Cómo publicar en GitHub Pages

1. Crea un repositorio en GitHub (p. ej. `tu-usuario.github.io` para sitio de usuario).
2. Sube la carpeta con `index.html`, `styles.css`, `db.js` y `app.js`.
3. En el repo: **Settings → Pages → Source**: elige la rama (p. ej. `main`) y la carpeta `/ (root)`.
4. Guarda; en unos minutos el sitio estará en `https://tu-usuario.github.io` (o la URL que indique GitHub).

## Personalización rápida

- **Nombre/alias**: en `index.html`, cambia el texto del elemento con `id="hero-name"` (p. ej. `Tu Alias`).
- **Frases del typewriter**: en `app.js`, edita el array `PHRASES`.
- **Contacto**: en `index.html`, actualiza el `mailto:` y los enlaces de GitHub/LinkedIn en la sección de contacto.
- **Certificaciones**: en `index.html`, modifica la lista dentro de `#cert-list` y, si quieres, el Tech Stack en los `#stack-*`.

## Estructura de archivos

```
├── index.html   # Estructura y secciones
├── styles.css   # Estilos (variables, glass, neon, responsive)
├── db.js        # IndexedDB: open, CRUD proyectos, eventos, notas, goals, roadmap
├── app.js       # Typewriter, tabs, formularios y renderizado desde DB
└── README.md
```

## Tecnologías

- HTML5, CSS3 (variables, flexbox, grid)
- JavaScript (vanilla)
- IndexedDB (persistencia local)
- Fuentes: Inter (lectura), Fira Code (técnico)
