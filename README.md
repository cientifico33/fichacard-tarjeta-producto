# Tarjeta de producto y checkout

Flujo de compra de una tarjeta de crédito: el usuario ve el producto, elige cuántas quiere,
completa el formulario de pago y la compra se simula. No hay backend; el pago es falso y para
probarlos hay una tarjeta que el banco siempre rechaza.

Es una fintech, así que el número de la tarjeta y el CVV no se guardan en ningún lado: ni en
`localStorage`, ni en logs, ni en el estado después de pagar.

## Requisitos

- Node.js 22.12 o superior

## Instalación

```bash
npm install
```

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Levanta la app en desarrollo |
| `npm run build` | Compila TypeScript y genera el bundle de producción |
| `npm run preview` | Sirve el build de producción |
| `npm run typecheck` | Revisa los tipos sin generar archivos |
| `npm test` | Corre las pruebas una vez |
| `npm run test:watch` | Corre las pruebas y espera cambios |

No hace falta configurar nada más: no hay variables de entorno ni servicios externos.

## Cómo probarlo

```bash
npm run dev
```

Después:

1. Ajusta la cantidad con los botones `+` y `−` y mira cómo cambia el total.
2. Presiona **Comprar** y llena el formulario.
3. Cualquier dato de la siguiente tabla sirve:

| Campo | Valor de ejemplo |
| --- | --- |
| Nombre del titular | `Ana María López` |
| Número de tarjeta | `4111 1111 1111 1111` |
| Vencimiento | `12/30` |
| CVV | `123` |
| Correo | `ana@fichacard.com` |

Tarjetas que pasan el algoritmo de Luhn:

| Marca | Número | CVV |
| --- | --- | --- |
| Visa | `4111 1111 1111 1111` | 3 dígitos |
| Mastercard | `5555 5555 5555 4444` | 3 dígitos |
| Mastercard | `2223 0031 2200 3222` | 3 dígitos |
| Amex | `3782 8224 6310 005` | **4** dígitos |

Para ver el camino de error usa una tarjeta que empiece con `4000`, por ejemplo
`4000 0000 0000 0002`: el banco la rechaza, sale el aviso y se puede reintentar con otra tarjeta.

## Validaciones

| Campo | Regla |
| --- | --- |
| Nombre del titular | Obligatorio, solo letras y espacios, mínimo 3 caracteres |
| Número de tarjeta | 13 a 19 dígitos, válido según Luhn, se formatea en bloques de 4 |
| Marca | Visa (4), Mastercard (51–55 y 2221–2720), Amex (34 y 37) |
| Vencimiento | `MM/AA`, mes entre 01 y 12, no vencido |
| CVV | 3 dígitos, 4 si es Amex |
| Correo | Formato válido |

Los errores aparecen cuando el usuario sale del campo o cuando intenta enviar, no mientras escribe.

## Decisiones de diseño

### Toda la validación vive en funciones puras

`validarTarjeta.ts` y `validarFormulario.ts` no conocen React: reciben strings y devuelven errores.
Eso las hace probar sin montar nada, y deja el componente con una sola responsabilidad, que es
mostrar lo que ellas deciden. `FormularioPago.tsx` no calcula nada: pregunta, muestra y envía.

### Las reglas están escritas a mano

Podría haberse usado una librería de tarjetas, pero para lo que pide el enunciado son unas 120
líneas de funciones puras que se pueden explicar por completo sin ayuda. Una dependencia constante
de una librería externa es más riesgo que el código que reemplaza.

### Un componente `Campo` y nada más

Cada input es un `Campo` con su etiqueta, su pista y su error. Todos comparten la misma forma
de marcado, así que la accesibilidad se resuelve en un solo lugar: `label` con `htmlFor`,
`aria-invalid`, `aria-describedby` apuntando al mensaje de error y `role="alert"` para que el
lector de pantalla lo anuncie.

### El error se calcula siempre y se muestra a tiempo

`validarPago` devuelve el estado real de los cinco campos en cada render, pero el componente solo
enseña los que el usuario ya tocó o intentó enviar. Marcarle el error a alguien que está
escribiendo su nombre es más frustrante que útil.

### El número de la tarjeta no sobrevive al pago

El dato vive en el estado del formulario mientras el formulario está montado. Al aprobarse, el
componente se desmonta y ese estado desaparece: en pantalla solo quedan el número de orden y los
últimos cuatro dígitos. `procesarPago` recibe el número completo, decide con él y devuelve únicamente
esos cuatro dígitos. No hay `localStorage` ni `console.log` en todo el proyecto.

### CSS en un solo archivo

La pantalla es una, no un sistema de diseño. Partir `estilos.css` en varios módulos sería adelantar
estructura que no hace falta todavía. Si el proyecto creciera, ahí sí.

### Sin librería de enrutado ni de estado

Solo hay una pantalla con tres estados (`producto`, `pago`, `exito`). Eso es un `useState` con un
string, no Redux ni un router.

## Estructura

```
src/
├── App.tsx                     alterna entre producto, pago y éxito
├── estilos.css
├── producto/
│   ├── tipos.ts                el producto de ejemplo
│   ├── dinero.ts               formato de moneda
│   ├── TarjetaProducto.tsx     imagen, nombre, descripción, precio y stock
│   └── SelectorCantidad.tsx    cantidad y total en tiempo real
└── pago/
    ├── validarTarjeta.ts       Luhn, marca y formato
    ├── validarFormulario.ts    vencimiento, CVV, nombre, correo
    ├── procesarPago.ts         la compra simulada
    ├── Campo.tsx               un input con etiqueta y error
    ├── FormularioPago.tsx      estado, envío y validación
    └── PantallaExito.tsx       orden y últimos cuatro dígitos
```

## Pruebas

```bash
npm test
```

Son 55 pruebas en tres archivos:

- **Validaciones**: Luhn con tarjetas reales de cada marca, detección de marca, formato,
  vencimiento, CVV según marca, nombre y correo.
- **Flujo completo** con Testing Library: comprar, ver el éxito, bajar el stock, rechazo y
  reintento, cálculo del total y que el número completo desaparezca de la pantalla tras el pago.

La simulación de pago tarda 1.5 segundos a propósito, así que las pruebas de integración esperan
de verdad y la suite tarda unos segundos más.