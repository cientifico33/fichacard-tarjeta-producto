import { detectarMarca, esNumeroDeTarjetaValido } from './validarTarjeta';

const LONGITUD_CVV = 3;
const LONGITUD_CVV_AMEX = 4;

const LARGO_CVV = {
  Visa: LONGITUD_CVV,
  Mastercard: LONGITUD_CVV,
  Amex: LONGITUD_CVV_AMEX,
} as const;

/** Longitud que el CVV debe tener según la marca de la tarjeta. */
export function largoCvvEsperado(marca: keyof typeof LARGO_CVV | null): number {
  return marca === null ? LONGITUD_CVV : LARGO_CVV[marca];
}

export function esCvvValido(cvV: string, marca: keyof typeof LARGO_CVV | null): boolean {
  return new RegExp(`^\\d{${largoCvvEsperado(marca)}}$`).test(cvV);
}

type ResultadoVencimiento = { valido: true } | { valido: false; mensaje: string };

/**
 * Valida el formato MM/AA y que la fecha todavía no haya pasado.
 *
 * La comparación es contra el último día del mes, porque una tarjeta que vence
 * este mes todavía sirve hasta el último día.
 */
export function validarVencimiento(vencimiento: string, hoy: Date): ResultadoVencimiento {
  const coincide = /^(\d{2})\/(\d{2})$/.exec(vencimiento);

  if (coincide === null) {
    return { valido: false, mensaje: 'Usa el formato MM/AA.' };
  }

  const mes = Number(coincide[1]);
  const anio = Number(coincide[2]);

  if (mes < 1 || mes > 12) {
    return { valido: false, mensaje: 'El mes debe estar entre 01 y 12.' };
  }

  const anioCompleto = 2000 + anio;
  const ultimoDia = new Date(anioCompleto, mes, 0);

  if (hoy > ultimoDia) {
    return { valido: false, mensaje: 'La tarjeta ya venció.' };
  }

  return { valido: true };
}

const LONGITUD_NOMBRE_MINIMA = 3;

export function validarNombreTitular(nombre: string): string | null {
  if (nombre.trim().length === 0) {
    return 'Escribe el nombre del titular.';
  }

  if (nombre.trim().length < LONGITUD_NOMBRE_MINIMA) {
    return 'El nombre debe tener al menos 3 caracteres.';
  }

  if (!/^[\p{L}\s]+$/u.test(nombre.trim())) {
    return 'El nombre solo puede tener letras y espacios.';
  }

  return null;
}

/** Exigimos algo antes del @ y un punto con algo después del punto. */
export function esEmailValido(correo: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo.trim());
}

export interface DatosPago {
  nombre: string;
  numero: string;
  vencimiento: string;
  cvv: string;
  correo: string;
}

type ErroresPago = Partial<Record<keyof DatosPago, string>>;

/**
 * Revisa los cinco campos del formulario y devuelve solo los que están mal.
 *
 * Vive acá y no en el componente justamente para poder probarla sin React: si
 * un campo falla, el componente no tiene nada que decidir, solo que mostrar.
 */
export function validarPago(datos: DatosPago, hoy: Date): ErroresPago {
  const errores: ErroresPago = {};
  const nombre = validarNombreTitular(datos.nombre);

  if (nombre !== null) {
    errores.nombre = nombre;
  }

  if (datos.numero.length === 0) {
    errores.numero = 'Escribe el número de tarjeta.';
  } else if (!esNumeroDeTarjetaValido(datos.numero)) {
    errores.numero = 'El número de tarjeta no es válido.';
  }

  if (datos.vencimiento.length === 0) {
    errores.vencimiento = 'Escribe el mes y año de vencimiento.';
  } else {
    const resultado = validarVencimiento(datos.vencimiento, hoy);

    if (!resultado.valido) {
      errores.vencimiento = resultado.mensaje;
    }
  }

  if (datos.cvv.length === 0) {
    errores.cvv = 'Escribe el código de seguridad.';
  } else if (!esCvvValido(datos.cvv, detectarMarca(datos.numero))) {
    errores.cvv = `El CVV debe tener ${largoCvvEsperado(detectarMarca(datos.numero))} dígitos.`;
  }

  if (datos.correo.length === 0) {
    errores.correo = 'Escribe tu correo electrónico.';
  } else if (!esEmailValido(datos.correo)) {
    errores.correo = 'Escribe un correo válido.';
  }

  return errores;
}