export interface ResultadoCompra {
  aprobado: boolean;
  orden: string | null;
  ultimosCuatro: string;
  mensaje: string | null;
}

const DURACION_SIMULACION_MS = 1500;

/**
 * Las tarjetas que empiezan con 4000 se rechazan, para poder probar el camino
 * de error sin backend.
 */
const PREFIJO_TARJETA_RECHAZADA = '4000';

function esTarjetaRechazada(numeroTarjeta: string): boolean {
  return numeroTarjeta.replace(/\D/g, '').startsWith(PREFIJO_TARJETA_RECHAZADA);
}

function esperar(milisegundos: number): Promise<void> {
  return new Promise((resolver) => setTimeout(resolver, milisegundos));
}

/** Número de orden con la hora, para que dos compras no se vean iguales. */
function generarNumeroOrden(): string {
  return `FC-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

/**
 * Simula la llamada al banco y tarda lo que tardaría una pasarela real.
 *
 * El número completo se usa solo para decidir y para quedarse con los últimos
 * cuatro dígitos: nunca se guarda, se registra ni se devuelve.
 */
export async function procesarPago(numeroTarjeta: string): Promise<ResultadoCompra> {
  const ultimosCuatro = numeroTarjeta.replace(/\D/g, '').slice(-4);

  await esperar(DURACION_SIMULACION_MS);

  if (esTarjetaRechazada(numeroTarjeta)) {
    return {
      aprobado: false,
      orden: null,
      ultimosCuatro,
      mensaje: 'Tu banco rechazó el pago. Revisa los datos e intenta de nuevo.',
    };
  }

  return { aprobado: true, orden: generarNumeroOrden(), ultimosCuatro, mensaje: null };
}