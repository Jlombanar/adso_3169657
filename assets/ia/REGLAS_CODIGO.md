# Estándares de Código y Estilos

## 1. Pila Tecnológica Frontend
- **HTML5 Semántico Obligatorio**: Uso estricto de `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`. Se prohíbe el uso de `<div>` sin justificación estructural.
- **Tailwind CSS (v3+)**: Clases de utilidad ordenadas lógicamente con diseño responsivo (`sm:`, `md:`, `lg:`). Paleta institucional SENA (`#39a900`, `#0067ac`, `#ff6b00`).
- **JavaScript (Vanilla ECMAScript 6+)**:
  - Sin frameworks SPA pesados en fases iniciales.
  - Asincronía con `async/await` y `fetch`.
  - Manipulación limpia del DOM y eventos mediante `addEventListener`.
- **Accesibilidad**: Cumplimiento de WCAG 2.1 nivel AA (contraste adecuado, navegación por teclado, soporte de lectores de pantalla con roles WAI-ARIA).

## 2. Arquitectura de Componentes (`components/`)
- **Shells Declarativos**: Archivos principales (`index.html`, `paginas/*.html`) deben tener menos de 120 líneas.
- **Ubicación de páginas**: En la raíz solo vive `index.html`. Las demás páginas van en `paginas/`, con `<html data-raiz="../">` y rutas `../assets/` y `../components/`.
- **Enlaces en componentes compartidos**: Si un componente se usa desde la raíz y desde `paginas/`, sus enlaces empiezan con `{{raiz}}` (ej. `{{raiz}}paginas/explorar.html`); el cargador lo reemplaza por el valor de `data-raiz`.
- **Estructura Modular**:
  - `components/layout/`: Elementos comunes de estructura (`topbar.html`, `sidebar.html`, `footer.html`)[cite: 1].
  - `components/views/`: Vistas de contenidos, pestañas y módulos de aprendizaje (`tab-*.html`)[cite: 1].
  - `components/modals/`: Diálogos y ventanas emergentes[cite: 1].
- **Cargador Reactivo**: Los componentes se inyectan mediante `data-component` en `assets/js/component-loader.js`, emitiendo el evento global `adso:componentsLoaded` al finalizar[cite: 1].
