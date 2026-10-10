export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precioUnitario: number;
  stock: number;
  imagen: string;
}

/**
 * Producto de ejemplo. En producción vendría de un catálogo; aquí lo dejamos fijo
 * para poder concentrarnos en el flujo de compra.
 */
export const PRODUCTO: Producto = {
  id: 'TC-001',
  nombre: 'Tarjeta de crédito FICHA',
  descripcion:
    'Tarjeta con contactless, compras internacionales sin comisión y tres meses de gratitud en la cuota de mantenimiento.',
  precioUnitario: 89.9,
  stock: 5,
  imagen: '/producto.svg',
};