import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

const TARJETA_APROBADA = '4111111111111111';
const TARJETA_RECHAZADA = '4000000000000002';

/** La simulación tarda 1.5 s a propósito, así que las esperas son más largas. */
const ESPERA_PAGO = { timeout: 3000 };

async function llenarFormulario(usuario: ReturnType<typeof userEvent.setup>, numero: string) {
  await usuario.type(screen.getByLabelText('Nombre del titular'), 'Ana María López');
  await usuario.type(screen.getByLabelText('Número de tarjeta'), numero);
  await usuario.type(screen.getByLabelText('Vencimiento'), '1230');
  await usuario.type(screen.getByLabelText('CVV'), '123');
  await usuario.type(screen.getByLabelText('Correo electrónico'), 'ana@fichacard.com');
}

describe('flujo de compra', () => {
  it('lleva del producto al pago y confirma la compra', async () => {
    const usuario = userEvent.setup();

    render(<App />);

    await usuario.click(screen.getByRole('button', { name: 'Comprar' }));
    await llenarFormulario(usuario, TARJETA_APROBADA);

    await usuario.click(screen.getByRole('button', { name: /Pagar/ }));

    expect(await screen.findByText('Compra aprobada', {}, ESPERA_PAGO)).toBeInTheDocument();
    expect(screen.getByText(/1111 ya está en camino/)).toBeInTheDocument();
    expect(screen.getByText(/FC-/)).toBeInTheDocument();
  });

  it('baja el stock después de comprar', async () => {
    const usuario = userEvent.setup();

    render(<App />);

    expect(screen.getByText('5 disponibles')).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: 'Comprar' }));
    await llenarFormulario(usuario, TARJETA_APROBADA);
    await usuario.click(screen.getByRole('button', { name: /Pagar/ }));

    await screen.findByText('Compra aprobada', {}, ESPERA_PAGO);
    await usuario.click(screen.getByRole('button', { name: /volver al producto/i }));

    expect(screen.getByText('4 disponibles')).toBeInTheDocument();
  });

  it('muestra el rechazo y permite reintentar con otra tarjeta', async () => {
    const usuario = userEvent.setup();

    render(<App />);

    await usuario.click(screen.getByRole('button', { name: 'Comprar' }));
    await llenarFormulario(usuario, TARJETA_RECHAZADA);
    await usuario.click(screen.getByRole('button', { name: /Pagar/ }));

    expect(await screen.findByText(/Tu banco rechazó el pago/, {}, ESPERA_PAGO)).toBeInTheDocument();

    const numero = screen.getByLabelText('Número de tarjeta');
    await usuario.clear(numero);
    await usuario.type(numero, TARJETA_APROBADA);
    await usuario.click(screen.getByRole('button', { name: /Pagar/ }));

    expect(await screen.findByText('Compra aprobada', {}, ESPERA_PAGO)).toBeInTheDocument();
  });

  it('no deja el número completo ni el CVV en pantalla tras el pago', async () => {
    const usuario = userEvent.setup();

    const { container } = render(<App />);

    await usuario.click(screen.getByRole('button', { name: 'Comprar' }));
    await llenarFormulario(usuario, TARJETA_APROBADA);
    await usuario.click(screen.getByRole('button', { name: /Pagar/ }));

    await screen.findByText('Compra aprobada', {}, ESPERA_PAGO);

    expect(container.textContent).not.toContain(TARJETA_APROBADA);
    expect(screen.queryByLabelText('Número de tarjeta')).toBeNull();
    expect(screen.queryByLabelText('CVV')).toBeNull();
  });
});

describe('validación del formulario', () => {
  it('marca los campos al salir de ellos, no mientras se escribe', async () => {
    const usuario = userEvent.setup();

    render(<App />);

    await usuario.click(screen.getByRole('button', { name: 'Comprar' }));

    const nombre = screen.getByLabelText('Nombre del titular');
    await usuario.type(nombre, 'A');
    expect(screen.queryByText('El nombre debe tener al menos 3 caracteres.')).toBeNull();

    await usuario.tab();
    expect(screen.getByText('El nombre debe tener al menos 3 caracteres.')).toBeInTheDocument();
  });

  it('muestra todos los errores al intentar enviar el formulario vacío', async () => {
    const usuario = userEvent.setup();

    render(<App />);

    await usuario.click(screen.getByRole('button', { name: 'Comprar' }));
    await usuario.click(screen.getByRole('button', { name: /Pagar/ }));

    expect(await screen.findByText('Escribe el número de tarjeta.')).toBeInTheDocument();
    expect(screen.getByText('Escribe el código de seguridad.')).toBeInTheDocument();
  });

  it('detecta la marca y ajusta el CVV que pide', async () => {
    const usuario = userEvent.setup();

    render(<App />);

    await usuario.click(screen.getByRole('button', { name: 'Comprar' }));
    await usuario.type(screen.getByLabelText('Número de tarjeta'), '378282246310005');

    expect(screen.getByText('Tarjeta Amex')).toBeInTheDocument();
    expect(screen.getByText('4 dígitos')).toBeInTheDocument();
  });

  it('conecta el error del campo con aria-describedby', async () => {
    const usuario = userEvent.setup();

    render(<App />);

    await usuario.click(screen.getByRole('button', { name: 'Comprar' }));
    await usuario.click(screen.getByRole('button', { name: /Pagar/ }));

    const numero = await screen.findByLabelText('Número de tarjeta');

    expect(numero).toHaveAttribute('aria-invalid', 'true');
    expect(numero).toHaveAccessibleDescription('Escribe el número de tarjeta.');
  });
});

describe('selector de cantidad', () => {
  it('calcula el total en tiempo real', async () => {
    const usuario = userEvent.setup();

    render(<App />);

    expect(screen.getByTestId('total')).toHaveTextContent('$89.90');

    await usuario.click(screen.getByRole('button', { name: 'Agregar una unidad' }));

    expect(screen.getByTestId('total')).toHaveTextContent('$179.80');
  });

  it('no deja pasar del stock disponible', async () => {
    const usuario = userEvent.setup();

    render(<App />);

    const agregar = screen.getByRole('button', { name: 'Agregar una unidad' });

    for (let paso = 0; paso < 4; paso += 1) {
      await usuario.click(agregar);
    }

    expect(agregar).toBeDisabled();
    expect(screen.getByTestId('total')).toHaveTextContent('$449.50');
  });

  it('no deja bajar de una unidad', () => {
    render(<App />);

    expect(screen.getByRole('button', { name: 'Quitar una unidad' })).toBeDisabled();
  });
});