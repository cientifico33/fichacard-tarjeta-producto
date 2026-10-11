import { formatearDinero } from './dinero';

interface PropsSelectorCantidad {
  cantidad: number;
  maximo: number;
  precioUnitario: number;
  onCambio: (cantidad: number) => void;
}

export function SelectorCantidad({
  cantidad,
  maximo,
  precioUnitario,
  onCambio,
}: PropsSelectorCantidad) {
  const total = cantidad * precioUnitario;

  return (
    <div className="cantidad">
      <button
        type="button"
        className="cantidad__boton"
        onClick={() => onCambio(cantidad - 1)}
        disabled={cantidad <= 1}
        aria-label="Quitar una unidad"
      >
        −
      </button>

      <span className="cantidad__valor" aria-live="polite">
        {cantidad}
      </span>

      <button
        type="button"
        className="cantidad__boton"
        onClick={() => onCambio(cantidad + 1)}
        disabled={cantidad >= maximo}
        aria-label="Agregar una unidad"
      >
        +
      </button>

      <span className="cantidad__total" data-testid="total">
        {formatearDinero(total)}
      </span>
    </div>
  );
}