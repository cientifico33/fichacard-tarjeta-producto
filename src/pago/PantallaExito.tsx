interface PropsPantallaExito {
  numeroOrden: string;
  ultimosCuatro: string;
}

export function PantallaExito({ numeroOrden, ultimosCuatro }: PropsPantallaExito) {
  return (
    <section className="tarjeta exito">
      <div className="exito__icono" aria-hidden="true">
        ✓
      </div>
      <h2>Compra aprobada</h2>
      <p className="exito__detalle">Tu tarjeta de crédito {ultimosCuatro} ya está en camino.</p>
      <p className="exito__orden">{numeroOrden}</p>
    </section>
  );
}