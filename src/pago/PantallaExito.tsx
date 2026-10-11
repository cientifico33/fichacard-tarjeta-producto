interface PropsPantallaExito {
  numeroOrden: string;
  ultimosCuatro: string;
  onSeguirComprando: () => void;
}

export function PantallaExito({
  numeroOrden,
  ultimosCuatro,
  onSeguirComprando,
}: PropsPantallaExito) {
  return (
    <section className="tarjeta exito">
      <div className="exito__icono" aria-hidden="true">
        ✓
      </div>
      <h2>Compra aprobada</h2>
      <p className="exito__detalle">Tu tarjeta de crédito {ultimosCuatro} ya está en camino.</p>
      <p className="exito__orden">{numeroOrden}</p>
      <button type="button" className="boton boton--secundario" onClick={onSeguirComprando}>
        Volver al producto
      </button>
    </section>
  );
}