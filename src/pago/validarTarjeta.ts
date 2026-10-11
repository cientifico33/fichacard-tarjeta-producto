/**
 * Validaciones de la tarjeta, todas funciones puras sin estado ni React.
 *
 * Así se pueden probar por separado y el formulario solo se ocupa de mostrar lo
 * que aquí se decide.
 */

const LARGO_MINIMO = 13;
const LARGO_MAXIMO = 19;

/** Quita espacios y guiones: el usuario escribe el número como le sale. */
export function quitarSeparadores(numero: string): string {
  return numero.replace(/[\s-]/g, '');
}

export function esNumeroDeTarjetaValido(numero: string): boolean {
  const digitos = quitarSeparadores(numero);

  if (digitos.length < LARGO_MINIMO || digitos.length > LARGO_MAXIMO) {
    return false;
  }

  return pasaLuhn(digitos);
}

/**
 * Luhn: el último dígito es la suma de los anteriores, y esa suma tiene que dar
 * un múltiplo de diez. Se recorre de derecha a izquierda, duplicando cada
 * segundo dígito.
 */
function pasaLuhn(digitos: string): boolean {
  let suma = 0;
  let duplicar = false;

  for (let posicion = digitos.length - 1; posicion >= 0; posicion -= 1) {
    let digito = digitos.charCodeAt(posicion) - 48;

    if (duplicar) {
      digito *= 2;

      if (digito > 9) {
        digito -= 9;
      }
    }

    suma += digito;
    duplicar = !duplicar;
  }

  return suma % 10 === 0;
}

/** Agrupa en bloques de cuatro mientras se escribe, para que se lea mejor. */
export function formatearNumeroTarjeta(numero: string): string {
  const digitos = quitarSeparadores(numero).slice(0, LARGO_MAXIMO);

  return digitos.replace(/(.{4})/g, '$1 ').trim();
}

export type MarcaTarjeta = 'Visa' | 'Mastercard' | 'Amex';

export function detectarMarca(numero: string): MarcaTarjeta | null {
  const digitos = quitarSeparadores(numero);

  if (/^4/.test(digitos)) {
    return 'Visa';
  }

  if (/^(51|52|53|54|55)/.test(digitos)) {
    return 'Mastercard';
  }

  if (/^2[2-7]/.test(digitos)) {
    return 'Mastercard';
  }

  if (/^3[47]/.test(digitos)) {
    return 'Amex';
  }

  return null;
}