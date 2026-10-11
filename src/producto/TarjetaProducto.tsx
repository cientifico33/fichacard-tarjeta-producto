import { formatearDinero } from './dinero';

interface PropsTarjetaProducto {
  nombre: string;
  descripcion: string;
  precioUnitario: number;
  stock: number;
  imagen: string;
}

export function TarjetaProducto({
  nombre,
  descripcion,
  precioUnitario,
  stock,
  imagen,
}: PropsTarjetaProducto) {
  return (
    <article className="producto">
      <img className="producto__imagen" src={imagen} alt={`Imagen de ${nombre}`} />
      <div className="producto__detalle">
        <h2 className="producto__nombre">{nombre}</h2>
        <p className="producto__descripcion">{descripcion}</p>
        <p className="producto__precio">{formatearDinero(precioUnitario)}</p>
        <p className="producto__stock">
          {stock === 0 ? 'Sin existencias' : `${stock} disponibles`}
        </p>
      </div>
    </article>
  );
}