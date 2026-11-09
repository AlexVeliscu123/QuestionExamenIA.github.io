# 🤖 Test de Inteligencia Artificial

Web con dos pruebas independientes que funciona en PC, móvil y tablet sin instalar nada. Al entrar, cada persona elige cuál hacer:

- **📘 Test teórico** (32 preguntas): AutoML, aprendizaje supervisado, semisupervisado, por refuerzo, por transferencia, en conjunto, CNN, RNN, Transformers, metaaprendizaje…
- **🧪 Práctica: tipo de aprendizaje** (20 situaciones): decidir si es *supervisado*, *no supervisado*, *semisupervisado*, *refuerzo* o *aprendizaje en conjunto*.

## Características

- Menú inicial para elegir el test (las preguntas de cada prueba no se mezclan con las de la otra)
- Opción de mezclar el orden de las preguntas dentro de cada test
- Corrección inmediata de cada pregunta
- En la práctica, justificación corta que aparece solo después de responder
- Resultado con porcentaje, mensaje y mejor nota guardada en el navegador
- Revisión de fallos con tu respuesta, la correcta y la justificación
- Botón **Repetir solo los fallos** (se puede repetir tantas veces como haga falta)
- Atajos de teclado en PC (A–D o 1–4 en el test; A–E o 1–5 en la práctica; Enter para continuar)
- Diseño moderno, adaptado a móvil, con modo claro y oscuro automático según tu sistema
- Botón ☀️/🌙 (arriba a la derecha) para cambiar de tema a mano; se recuerda tu elección
- Icono propio en la pestaña del navegador (`favicon.svg`)

## Publicar en GitHub Pages

1. Sube estos archivos a un repositorio: `index.html`, `style.css`, `favicon.svg`, `questions.js`, `practica.js`, `script.js`.
2. En GitHub: **Settings → Pages → Build and deployment**.
3. En *Source* elige **Deploy from a branch**, rama `main` y carpeta `/ (root)`.
4. Guarda y, en un minuto, tendrás la web en `https://TU-USUARIO.github.io/NOMBRE-REPO/`.

## Editar preguntas

- Test teórico: `questions.js`. Cada pregunta tiene el enunciado (`q`), las opciones (`o`) y el índice de la correcta (`a`: 0 = A, 1 = B, 2 = C, 3 = D). La justificación (`j`) es opcional y solo se muestra si se falla.
- Práctica: `practica.js`. Cada situación tiene el enunciado (`q`), la correcta (`a`: 0 = Supervisado, 1 = No supervisado, 2 = Semisupervisado, 3 = Refuerzo, 4 = Aprendizaje en conjunto) y la justificación (`j`).

Los contadores del menú se actualizan solos según las preguntas que haya en cada archivo.
