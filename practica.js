// Práctica "Diferencia el tipo de aprendizaje". Se añade a las preguntas del test.
// "a" = índice de la correcta:
// 0 = Supervisado, 1 = No supervisado, 2 = Semisupervisado, 3 = Refuerzo, 4 = Aprendizaje en conjunto
// "j" = justificación corta que se muestra SOLO después de responder.
const PRACTICA_OPCIONES = ["Supervisado", "No supervisado", "Semisupervisado", "Refuerzo", "Aprendizaje en conjunto"];
const PRACTICA_LETRAS = ["A", "B", "C", "D", "E"];

const PRACTICA = [
  { q: "Una empresa analiza las compras de sus clientes y los divide automáticamente en grupos según sus hábitos, sin conocer de antemano esos grupos.", a: 1, j: "Forma grupos por sí sola, sin grupos ni respuestas previas: aprendizaje no supervisado." },
  { q: "Una aplicación aprende con datos de viviendas cuyo precio de venta ya se conoce y predice el precio de una vivienda nueva.", a: 0, j: "Aprende con datos que ya tienen la respuesta (el precio): aprendizaje supervisado." },
  { q: "Para estimar las ventas del próximo mes, una empresa utiliza varios modelos de IA y calcula una media de sus predicciones.", a: 4, j: "Combina varios modelos y hace una media de sus predicciones: aprendizaje en conjunto." },
  { q: "Un programa aprende a jugar a un videojuego. Prueba diferentes movimientos y recibe recompensas cuando consigue superar una pantalla.", a: 3, j: "Aprende por ensayo y error con recompensas: aprendizaje por refuerzo." },
  { q: "Una empresa dispone de mensajes de atención al cliente ya clasificados y de muchos mensajes sin clasificar. Aprovecha los dos grupos para organizar los mensajes nuevos.", a: 2, j: "Usa datos etiquetados y sin etiquetar a la vez: aprendizaje semisupervisado." },
  { q: "Una empresa tiene miles de imágenes sin clasificar y solo unas pocas etiquetadas. Utiliza esas pocas etiquetas para ayudar al sistema a clasificar las demás.", a: 2, j: "Pocas imágenes con etiqueta ayudan a clasificar las que no la tienen: aprendizaje semisupervisado." },
  { q: "Una aplicación de música organiza canciones en grupos según sus características, sin que una persona haya establecido previamente las categorías.", a: 1, j: "Agrupa por parecido sin categorías previas: aprendizaje no supervisado." },
  { q: "Un dron aprende a aterrizar en una zona señalada. Recibe una recompensa cuando aterriza correctamente y una penalización cuando se desvía.", a: 3, j: "Recompensas y penalizaciones según lo que hace: aprendizaje por refuerzo." },
  { q: "Una IA aprende con solicitudes de empleo que ya están clasificadas como completas o incompletas y después revisa nuevas solicitudes.", a: 0, j: "Aprende con ejemplos ya clasificados (con respuesta): aprendizaje supervisado." },
  { q: "Una empresa combina las predicciones de tres modelos diferentes para decidir si una solicitud de crédito debe revisarse.", a: 4, j: "Combina las predicciones de varios modelos: aprendizaje en conjunto." },
  { q: "Un robot de reparto prueba distintas rutas dentro de un entorno de entrenamiento y recibe recompensas cuando llega al destino evitando obstáculos.", a: 3, j: "Prueba rutas y recibe recompensas: aprendizaje por refuerzo." },
  { q: "Una empresa tiene fotografías de residuos con etiquetas que indican el tipo de material y otras fotografías sin etiquetar. Utiliza ambas para ayudar a clasificar los residuos.", a: 2, j: "Mezcla fotos etiquetadas y sin etiquetar: aprendizaje semisupervisado." },
  { q: "Una empresa quiere descubrir qué productos suelen comprarse juntos. La IA analiza los datos de compra y encuentra grupos de productos relacionados sin tenerlos definidos previamente.", a: 1, j: "Encuentra grupos sin definirlos de antemano: aprendizaje no supervisado." },
  { q: "Un hospital combina las predicciones de varios modelos para estimar el tiempo que puede durar una atención médica.", a: 4, j: "Une las predicciones de varios modelos: aprendizaje en conjunto." },
  { q: "Una IA aprende con registros de vehículos que ya indican si han pasado o no la inspección técnica y utiliza lo aprendido para analizar vehículos nuevos.", a: 0, j: "Aprende con registros que ya traen la respuesta (pasa o no pasa): aprendizaje supervisado." },
  { q: "Una aplicación aprende con ejemplos de mensajes que ya están identificados como positivos o negativos y después clasifica nuevas opiniones.", a: 0, j: "Ejemplos ya etiquetados como positivo/negativo: aprendizaje supervisado." },
  { q: "Una compañía utiliza cinco modelos distintos para predecir si un cliente renovará su contrato y combina las predicciones para decidir el resultado final.", a: 4, j: "Cinco modelos cuyas predicciones se combinan: aprendizaje en conjunto." },
  { q: "Una universidad tiene algunos trabajos de estudiantes clasificados por tema y muchos sin etiqueta. Utiliza los ejemplos etiquetados junto con los que no tienen etiqueta para ayudar a organizar todos los trabajos.", a: 2, j: "Algunos datos con etiqueta y muchos sin ella, usados juntos: aprendizaje semisupervisado." },
  { q: "Una empresa analiza las respuestas de una encuesta y agrupa a las personas según sus respuestas parecidas, sin haber definido previamente los grupos.", a: 1, j: "Agrupa por parecido sin grupos previos: aprendizaje no supervisado." },
  { q: "Un sistema aprende a controlar la velocidad de un vehículo en un simulador. Recibe recompensas cuando mantiene una conducción adecuada y penalizaciones cuando comete errores.", a: 3, j: "Recompensas y penalizaciones en un simulador: aprendizaje por refuerzo." }
].map((p) => ({ t: "clasif", q: p.q, o: PRACTICA_OPCIONES, l: PRACTICA_LETRAS, a: p.a, j: p.j }));

QUESTIONS.push(...PRACTICA);
