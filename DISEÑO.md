# Pac-Papa — Documento de diseño

Un juego con la lógica exacta del Pac-Man clásico (1980), ambientado en un templo inca. Pac-Papa come hojuelas Inkachips y lo persiguen cuatro personajes de la naturaleza peruana.

---

## 1. Concepto

| Elemento | Original | Pac-Papa |
|---|---|---|
| Protagonista | Pac-Man | **Pac-Papa**, vestido de Inca |
| Laberinto | Líneas azules | **Muros de piedra inca** |
| Puntos | Puntos blancos | **Hojuelas Inkachips** (lisas) |
| Píldoras de poder | Puntos grandes | **Bolsas de Inkachips** (4 sabores) |
| Frutas | Cereza, fresa… | **Productos andinos y amazónicos** |
| Fantasmas | Blinky, Pinky, Inky, Clyde | **Golpe de Calor, El Niño, Coco, Canto rodado** |
| Puntaje | Puntos | **Toneladas de papa frita (T)** |
| Música | Sirena y jingles | **Los Mirlos** (o música original estilo cumbia amazónica) |

**Plataformas:** navegador en computadora (teclado) y celular (táctil). Se podrá instalar como app (PWA).

**Estilo visual:** moderno e ilustrado, con degradados, sombras suaves y animaciones fluidas. Todo se dibuja por código, sin imágenes externas.

---

## 2. Dirección visual

### Laberinto: piedra inca
- Muros hechos de **piedras poligonales encajadas**, al estilo de Sacsayhuamán y de la piedra de los 12 ángulos.
- Bloques de tamaños y formas distintos, con juntas finas, sin argamasa.
- Tonos de andesita y granito (grises cálidos y ocres), con un leve relieve y sombra en cada bloque.
- La forma de las piedras se genera de manera determinista: el laberinto se ve igual en cada partida.
- Fondo de los pasillos: tierra o piso de piedra oscuro, para que las hojuelas resalten.
- La puerta de la casa de los fantasmas es una **puerta trapezoidal inca**.
- Abajo a la derecha, fuera del laberinto y a la altura de las vidas, una placa de piedra pulida con el nombre **GONO** tallado.

### Pac-Papa
- Cuerpo redondo amarillo dorado, como una papa, con boca que se abre y se cierra (igual que el original).
- **Mascapaycha** (la borla roja real del Inca) sobre una **llauto** (cinta tejida) en la cabeza.
- Orejeras doradas y un toque de tocapus (diseños geométricos) en la vincha.
- Rota según la dirección de movimiento. La mascapaycha se mantiene arriba sin girar de cabeza.
- Animación de muerte: se encoge y desaparece, igual que el original.

### Hojuelas Inkachips (puntos)
- **Lisas**, delgadas, de contorno irregular. No onduladas.
- Doradas, con burbujitas de fritura y bordes ligeramente tostados.
- Cada hojuela tiene una forma y rotación un poco distintas, para que no se vean clonadas.

### Bolsas de Inkachips (píldoras de poder)
Una por esquina. **No parpadean** (a diferencia del original). Diseño basado en las bolsas reales: plástico negro brillante, logo "Inka CHIPS" en blanco, franja del color del sabor y un bowl con papas.

| Esquina | Sabor | Color de la franja |
|---|---|---|
| Superior izquierda | Sal de Mar | Amarillo |
| Superior derecha | Jalapeño | Verde |
| Inferior izquierda | BBQ & Cebolla (cebolla caramelizada) | Rojo |
| Inferior derecha | Queso & Cebolla | Naranja |

> Inkachips es una marca registrada. El uso es personal; para publicar el juego habría que pedir permiso o cambiar el nombre en las bolsas.

### Fantasmas

| Original | Comportamiento | Personaje | Diseño |
|---|---|---|---|
| **Blinky** (rojo) | Persigue directo | **Golpe de Calor** | Llama roja y anaranjada, con chispas y llamas animadas |
| **Pinky** (rosa) | Embosca por delante | **El Niño** | Nube de tormenta u ola con cara, gotas cayendo; "llega adelantado" |
| **Inky** (cian) | Errático | **Coco** | Coco peludo y redondo, con el pelito agitándose |
| **Clyde** (naranja) | Persigue y se aleja | **Canto rodado** | Piedra de río lisa y redondeada que rueda |

- Todos tienen **ojos que miran en la dirección de movimiento**, igual que el original. Es parte de la jugabilidad.
- **Modo asustado:** se ponen azul pálido y tiemblan con una boca ondulada. Al final del tiempo parpadean en blanco.
- **Comidos:** solo quedan los ojos, que vuelven rápido a la casa.

### Frutas bonus

| Nivel | Original | Pac-Papa | Toneladas |
|---|---|---|---|
| 1 | Cereza | Cancha | 100 T |
| 2 | Fresa | Haba | 300 T |
| 3–4 | Naranja | Yuca | 500 T |
| 5–6 | Manzana | Camote | 700 T |
| 7–8 | Melón | Plátano | 1.000 T |
| 9–10 | Galaxian | Taro | 2.000 T |
| 11–12 | Campana | Choclo | 3.000 T |
| 13+ | Llave | Papa nativa | 5.000 T |

---

## 3. Puntaje: toneladas de papa frita

Los valores son los del original; solo cambia la unidad.

| Acción | Valor |
|---|---|
| Hojuela | 10 T |
| Bolsa | 50 T |
| Fantasmas comidos con una misma bolsa | 200 → 400 → 800 → 1.600 T |
| Fruta | según la tabla de arriba |
| Vida extra | una sola, al llegar a 10.000 T |

- Encabezado: **TONELADAS** y **RÉCORD** (el récord se guarda en el dispositivo).
- Formato peruano con punto de miles: `12.450 T`.
- Valores flotantes al comer un fantasma o una fruta ("800 T").
- Fin del juego: "GAME OVER — Comiste 12.450 toneladas de papa frita".

---

## 4. Lógica del juego (idéntica al original)

### Laberinto
- Grilla de **28 × 31** casillas (más 3 filas arriba y 2 abajo para el marcador): 28 × 36 en total.
- **240 hojuelas + 4 bolsas** = 244 ítems por nivel.
- Túnel lateral que conecta izquierda y derecha. Los fantasmas van más lentos dentro del túnel; Pac-Papa no.
- **Zonas sin giro hacia arriba**: en las 4 intersecciones de arriba de la casa y de la salida de Pac-Papa, los fantasmas no pueden girar hacia arriba durante los modos de dispersión y persecución.

### Movimiento
- Pac-Papa guarda la última dirección pedida y gira apenas puede (*pre-turn*).
- **Cornering**: Pac-Papa puede cortar esquinas unos píxeles antes que los fantasmas, lo que le da ventaja al girar.
- Pac-Papa se detiene **1 cuadro al comer una hojuela** y **3 cuadros al comer una bolsa**, igual que el original.
- Los fantasmas deciden su dirección **una casilla antes** de llegar a cada intersección. Eligen la salida que deja su casilla objetivo a menor distancia en línea recta. En caso de empate, el orden de preferencia es arriba > izquierda > abajo > derecha. Nunca dan media vuelta por su cuenta.

### Objetivo de cada fantasma (modo persecución)
- **Golpe de Calor (Blinky):** la casilla de Pac-Papa.
- **El Niño (Pinky):** 4 casillas delante de Pac-Papa. *Incluye el error del original: si Pac-Papa mira hacia arriba, el objetivo queda 4 arriba y 4 a la izquierda.*
- **Coco (Inky):** se toma el punto a 2 casillas delante de Pac-Papa (con el mismo error hacia arriba). Se traza el vector desde Golpe de Calor hasta ese punto y se duplica.
- **Canto rodado (Clyde):** si está a más de 8 casillas de Pac-Papa, lo persigue como Golpe de Calor. Si está más cerca, va a su esquina de dispersión.

### Esquinas de dispersión
- Golpe de Calor: arriba a la derecha.
- El Niño: arriba a la izquierda.
- Coco: abajo a la derecha.
- Canto rodado: abajo a la izquierda.

### Ciclo dispersión / persecución (segundos)

| Fase | Nivel 1 | Niveles 2–4 | Nivel 5+ |
|---|---|---|---|
| Dispersión 1 | 7 | 7 | 5 |
| Persecución 1 | 20 | 20 | 20 |
| Dispersión 2 | 7 | 7 | 5 |
| Persecución 2 | 20 | 20 | 20 |
| Dispersión 3 | 5 | 5 | 5 |
| Persecución 3 | 20 | 1033 | 1037 |
| Dispersión 4 | 5 | 1/60 | 1/60 |
| Persecución 4 | indefinida | indefinida | indefinida |

- Cada cambio de modo hace que los fantasmas den **media vuelta**.
- El temporizador se pausa mientras dura el modo asustado.

### Modo asustado (al comer una bolsa)
- Los fantasmas dan media vuelta, se ponen azules y eligen direcciones **pseudoaleatorias** en cada intersección.
- Duración por nivel (segundos): 1: 6 · 2: 5 · 3: 4 · 4: 3 · 5: 2 · 6: 5 · 7: 2 · 8: 2 · 9: 1 · 10: 5 · 11: 2 · 12: 1 · 13: 1 · 14: 3 · 15: 1 · 16: 1 · 17: 0 · 18: 1 · 19+: 0.
- Parpadean 5 veces antes de terminar (3 en los niveles con 1 segundo).
- Desde el nivel 17 (y en el 19 en adelante), la bolsa solo da puntos y hace que los fantasmas den media vuelta, sin asustarlos.

### Velocidades (porcentaje de la velocidad máxima)

| Nivel | Pac-Papa | Pac-Papa asustando | Fantasmas | Fantasmas asustados | Fantasmas en túnel |
|---|---|---|---|---|---|
| 1 | 80 % | 90 % | 75 % | 50 % | 40 % |
| 2–4 | 90 % | 95 % | 85 % | 55 % | 45 % |
| 5–20 | 100 % | 100 % | 95 % | 60 % | 50 % |
| 21+ | 90 % | — | 95 % | — | 50 % |

### "Cruise Elroy" (Golpe de Calor se enfurece)
Cuando quedan pocas hojuelas, Golpe de Calor acelera en dos etapas. Desde la primera etapa, persigue a Pac-Papa incluso en modo dispersión. Los umbrales y las velocidades siguen la tabla original por nivel; en el nivel 1, la primera etapa empieza con 20 hojuelas restantes y la segunda con 10.

### Salida de la casa de los fantasmas
- El Niño sale de inmediato. Coco y Canto rodado esperan según un **contador de hojuelas comidas**:
  - Nivel 1: Coco a las 30 y Canto rodado a las 60.
  - Nivel 2: Coco a las 0 y Canto rodado a las 50.
  - Nivel 3+: todos salen de inmediato.
- Tras perder una vida se usa un **contador global**: El Niño a las 7, Coco a las 17 y Canto rodado a las 32.
- Si Pac-Papa pasa demasiado tiempo sin comer (4 s en los niveles 1–4; 3 s desde el 5), sale el siguiente fantasma.

### Frutas
- Aparecen bajo la casa de los fantasmas al comer **70** y **170** hojuelas.
- Desaparecen después de un tiempo de entre 9 y 10 segundos.
- Abajo se muestran las últimas 7 frutas de los niveles jugados, **a la izquierda de la placa con el nombre** (la placa no se mueve).

### Vidas y niveles
- Se empieza con 3 vidas y hay una vida extra a las 10.000 T.
- Al completar un nivel, el laberinto parpadea y empieza el siguiente.
- **Intermedios** (escenas cómicas), como en el original, que se pueden saltar con un toque o una flecha:
  - Tras el nivel 2: Golpe de Calor persigue a Pac-Papa y vuelve asustado, perseguido por un Pac-Papa gigante.
  - Tras el nivel 5: Golpe de Calor pasa bajo la lluvia de El Niño, se apaga a medias y huye chiquito.
  - Tras los niveles 9, 13 y 17: Golpe de Calor, convertido en brasita humeante, cruza con El Niño lloviéndole encima.
- **Pantalla de título**: logo, Pac-Papa comiendo hojuelas, presentación de los personajes uno por uno (como el original) y valores de hojuela y bolsa. Tras un GAME OVER, el juego vuelve al título a los 10 segundos.
- La pantalla rota del nivel 256 no se replica: el juego sigue en el nivel 255 en adelante.

---

## 5. Controles

| Plataforma | Control |
|---|---|
| Teclado | Flechas o WASD · `P` / `Esc` pausa · `M` silencio |
| Celular | **Deslizar** el dedo en cualquier dirección y en cualquier parte de la pantalla. Botón de pausa en pantalla. |

- En el celular, el juego va en orientación **vertical**, que calza bien con el laberinto de 28 × 36.
- El lienzo se escala para ocupar la pantalla sin deformarse.
- La pantalla no se apaga mientras se juega.

---

## 6. Sonido y música

### Música: sistema doble
El juego busca archivos en la carpeta `musica/`. Si un archivo existe, lo usa. Si no, toca la **música original estilo cumbia amazónica**, generada por código: guitarra con trémolo, bajo, timbales y güiro.

| Momento | Archivo esperado | Equivalente original |
|---|---|---|
| Inicio de partida | `musica/inicio.mp3` | Jingle de inicio |
| Durante el juego (en bucle) | `musica/juego.mp3` | Sirena |
| Modo asustado | `musica/asustado.mp3` | Sonido de fantasmas azules |
| Intermedios | `musica/intermedio.mp3` | Música de intermedio |

- La música de juego **acelera levemente** a medida que quedan menos hojuelas, como la sirena original.
- Las canciones de Los Mirlos las aporta el usuario. Por derechos de autor, no se incluyen en el proyecto.

### Efectos (originales, propios)
Crujido de hojuela al comer (reemplaza el "waka-waka"), apertura de bolsa, fantasma comido, ojos volviendo a casa, fruta comida, vida extra y muerte de Pac-Papa.

---

## 7. Tecnología

- **HTML5 Canvas + JavaScript puro**, sin frameworks ni proceso de compilación.
- Bucle de juego a **60 cuadros por segundo con paso fijo**, como el original, para que la lógica sea exacta en cualquier dispositivo.
- Audio con **Web Audio API**.
- **PWA**: manifiesto y *service worker* para instalarlo en el celular y jugar sin conexión.
- Récord guardado en `localStorage`.
- Para desarrollar en local se usa un servidor simple. Para probar en el celular, este debe estar en la misma red wifi.

### Estructura de carpetas (propuesta)

```
Pac-Man/
├── index.html
├── manifest.json
├── sw.js
├── css/
│   └── estilos.css
├── js/
│   ├── main.js          # arranque y bucle de juego
│   ├── constantes.js    # tablas por nivel (velocidades, tiempos, frutas)
│   ├── laberinto.js     # mapa 28×31, hojuelas, túnel, zonas sin giro
│   ├── pacpapa.js       # movimiento, cornering, comer
│   ├── fantasmas.js     # modos, objetivos, casa, Elroy
│   ├── juego.js         # estados, vidas, niveles, puntaje, frutas
│   ├── controles.js     # teclado y gestos táctiles
│   ├── audio.js         # música doble y efectos
│   └── render/
│       ├── piedras.js   # muros de piedra inca
│       ├── personajes.js
│       ├── items.js     # hojuelas, bolsas, frutas
│       └── hud.js       # marcador e interfaz
└── musica/
    └── LEEME.txt        # nombres de archivo que espera el juego
```

---

## 8. Etapas de desarrollo

1. **Base:** laberinto de piedra inca dibujado, Pac-Papa moviéndose con teclado (pre-turn, cornering, túnel). ✅
2. **Comer:** hojuelas, bolsas, puntaje en toneladas y récord. ✅
3. **Fantasmas:** los 4 personajes con objetivos, ciclo dispersión/persecución, modo asustado, casa y Elroy. También vidas, muerte y fin del juego, que van de la mano con los choques. ✅
4. **Partida completa:** frutas andinas y revisión de las tablas por nivel. ✅
5. **Celular:** gestos táctiles, escalado y PWA. ✅
6. **Sonido:** efectos, música original y carga de archivos de `musica/`. ✅
7. **Pulido:** intermedios, pantalla de título, animaciones y ajustes visuales. ✅

Al cerrar cada etapa, el juego se puede probar en el navegador.

---

## 9. Notas legales

- "Pac-Man", su laberinto y sus sonidos pertenecen a Bandai Namco.
- "Inkachips" es una marca registrada.
- La música de Los Mirlos tiene derechos de autor.

El proyecto es para **uso personal**. Antes de publicarlo habría que revisar el nombre, las bolsas y la música.
