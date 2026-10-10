import { useState } from 'react';
import { TarjetaProducto } from './producto/TarjetaProducto';
import { SelectorCantidad } from './producto/SelectorCantidad';
import { PRODUCTO } from './producto/tipos';

export default function App() {
  const [cantidad, setCantidad] = useState(1);

  return (
    <main className="pagina">
      <header className="cabecera">
        <h1>Compra tu tarjeta</h1>
        <p>Revisa el producto y completa el pago.</p>
      </header>

      <section className="tarjeta">
        <TarjetaProducto
          nombre={PRODUCTO.nombre}
          descripcion={PRODUCTO.descripcion}
          precioUnitario={PRODUCTO.precioUnitario}
          stock={PRODUCTO.stock}
          imagen={PRODUCTO.imagen}
        />

        <SelectorCantidad
          cantidad={cantidad}
          maximo={PRODUCTO.stock}
          precioUnitario={PRODUCTO.precioUnitario}
          onCambio={setCantidad}
        />
      </section>
    </main>
  );
}