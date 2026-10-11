import { useState } from 'react';
import { TarjetaProducto } from './producto/TarjetaProducto';
import { SelectorCantidad } from './producto/SelectorCantidad';
import { PRODUCTO } from './producto/tipos';
import { formatearDinero } from './producto/dinero';
import { FormularioPago } from './pago/FormularioPago';
import { PantallaExito } from './pago/PantallaExito';
import type { ResultadoCompra } from './pago/procesarPago';

type Vista = 'producto' | 'pago' | 'exito';

export default function App() {
  const [cantidad, setCantidad] = useState(1);
  const [stock, setStock] = useState(PRODUCTO.stock);
  const [vista, setVista] = useState<Vista>('producto');
  const [compra, setCompra] = useState<ResultadoCompra | null>(null);

  const totalPedido = cantidad * PRODUCTO.precioUnitario;

  function comprar(): void {
    setVista('pago');
  }

  function volverAlProducto(): void {
    setCompra(null);
    setVista('producto');
  }

  function alAprobar(resultado: ResultadoCompra): void {
    setStock((restante) => restante - cantidad);
    setCantidad(1);
    setCompra(resultado);
    setVista('exito');
  }

  return (
    <main className="pagina">
      <header className="cabecera">
        <h1>Compra tu tarjeta</h1>
        <p>Revisa el producto y completa el pago.</p>
      </header>

      {vista === 'exito' && compra !== null ? (
        <PantallaExito
          numeroOrden={compra.orden ?? ''}
          ultimosCuatro={compra.ultimosCuatro}
          onSeguirComprando={volverAlProducto}
        />
      ) : vista === 'pago' ? (
        <section className="tarjeta">
          <p className="producto__stock">Total a pagar: {formatearDinero(totalPedido)}</p>
          <FormularioPago totalPedido={totalPedido} onAprobado={alAprobar} />
          <button type="button" className="boton boton--secundario" onClick={volverAlProducto}>
            Volver al producto
          </button>
        </section>
      ) : (
        <section className="tarjeta">
          <TarjetaProducto
            nombre={PRODUCTO.nombre}
            descripcion={PRODUCTO.descripcion}
            precioUnitario={PRODUCTO.precioUnitario}
            stock={stock}
            imagen={PRODUCTO.imagen}
          />

          <SelectorCantidad
            cantidad={cantidad}
            maximo={stock}
            precioUnitario={PRODUCTO.precioUnitario}
            onCambio={setCantidad}
          />

          <button type="button" className="boton" onClick={comprar} disabled={stock === 0}>
            Comprar
          </button>
        </section>
      )}
    </main>
  );
}