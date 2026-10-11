import { useState } from 'react';
import { Campo } from './Campo';
import { detectarMarca, formatearNumeroTarjeta } from './validarTarjeta';
import { largoCvvEsperado, validarPago } from './validarFormulario';
import type { DatosPago } from './validarFormulario';
import { procesarPago } from './procesarPago';
import type { ResultadoCompra } from './procesarPago';
import { formatearDinero } from '../producto/dinero';

interface PropsFormularioPago {
  totalPedido: number;
  onAprobado: (compra: ResultadoCompra) => void;
}

const DATOS_VACIOS: DatosPago = {
  nombre: '',
  numero: '',
  vencimiento: '',
  cvv: '',
  correo: '',
};

type Campos = keyof DatosPago;

export function FormularioPago({ totalPedido, onAprobado }: PropsFormularioPago) {
  const [datos, setDatos] = useState<DatosPago>(DATOS_VACIOS);
  const [tocado, setTocado] = useState<Partial<Record<Campos, boolean>>>({});
  const [enviado, setEnviado] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [fallo, setFallo] = useState<string | null>(null);

  const marca = detectarMarca(datos.numero);
  const errores = validarPago(datos, new Date());

  /**
   * Los errores se calculan siempre, pero solo se enseñan cuando el usuario ya
   * salió del campo o intentó enviar: marcarle el error mientras escribe lo
   * frustra más de lo que ayuda.
   */
  function errorAMostrar(campo: Campos): string | null {
    const yaRevisado = enviado || tocado[campo] === true;

    return yaRevisado ? (errores[campo] ?? null) : null;
  }

  function actualizar(campo: Campos, valor: string): void {
    setFallo(null);
    setDatos((anteriores) => ({ ...anteriores, [campo]: valor }));
  }

  function marcarTocado(campo: Campos): void {
    setTocado((anteriores) => ({ ...anteriores, [campo]: true }));
  }

  async function pagar(evento: React.FormEvent): Promise<void> {
    evento.preventDefault();
    setEnviado(true);

    if (Object.keys(errores).length > 0 || procesando) {
      return;
    }

    setProcesando(true);
    const resultado = await procesarPago(datos.numero);
    setProcesando(false);

    if (resultado.aprobado) {
      onAprobado(resultado);
      return;
    }

    setFallo(resultado.mensaje);
  }

  return (
    <form onSubmit={pagar} noValidate>
      {fallo !== null && (
        <p className="aviso aviso--error" role="alert">
          {fallo}
        </p>
      )}

      <Campo
        id="nombre"
        etiqueta="Nombre del titular"
        valor={datos.nombre}
        error={errorAMostrar('nombre')}
        autoComplete="cc-name"
        onCambio={(valor) => actualizar('nombre', valor)}
        onBlur={() => marcarTocado('nombre')}
      />

      <Campo
        id="numero"
        etiqueta="Número de tarjeta"
        valor={datos.numero}
        error={errorAMostrar('numero')}
        pista={marca === null ? null : `Tarjeta ${marca}`}
        inputMode="numeric"
        autoComplete="cc-number"
        onCambio={(valor) => actualizar('numero', formatearNumeroTarjeta(valor))}
        onBlur={() => marcarTocado('numero')}
      />

      <div className="fila">
        <Campo
          id="vencimiento"
          etiqueta="Vencimiento"
          valor={datos.vencimiento}
          error={errorAMostrar('vencimiento')}
          placeholder="MM/AA"
          inputMode="numeric"
          autoComplete="cc-exp"
          onCambio={(valor) => actualizar('vencimiento', formatearVencimiento(valor))}
          onBlur={() => marcarTocado('vencimiento')}
        />

        <Campo
          id="cvv"
          etiqueta="CVV"
          valor={datos.cvv}
          error={errorAMostrar('cvv')}
          pista={`${largoCvvEsperado(marca)} dígitos`}
          inputMode="numeric"
          autoComplete="cc-csc"
          onCambio={(valor) => actualizar('cvv', valor.replace(/\D/g, '').slice(0, largoCvvEsperado(marca)))}
          onBlur={() => marcarTocado('cvv')}
        />
      </div>

      <Campo
        id="correo"
        etiqueta="Correo electrónico"
        tipo="email"
        valor={datos.correo}
        error={errorAMostrar('correo')}
        inputMode="email"
        autoComplete="email"
        onCambio={(valor) => actualizar('correo', valor)}
        onBlur={() => marcarTocado('correo')}
      />

      <button type="submit" className="boton" disabled={procesando}>
        {procesando
          ? `Procesando ${formatearDinero(totalPedido)}...`
          : `Pagar ${formatearDinero(totalPedido)}`}
      </button>
    </form>
  );
}

/** Inserta la barra al escribir el cuarto dígito: 122026 → 12/2026. */
function formatearVencimiento(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 4);

  if (digitos.length <= 2) {
    return digitos;
  }

  return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
}