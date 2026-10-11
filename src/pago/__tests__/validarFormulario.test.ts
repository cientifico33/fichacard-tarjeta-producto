import { describe, expect, it } from 'vitest';
import {
  esCvvValido,
  esEmailValido,
  largoCvvEsperado,
  validarNombreTitular,
  validarPago,
  validarVencimiento,
} from '../validarFormulario';

const HOY = new Date('2026-10-12T12:00:00');

const TARJETA_VALIDA = {
  nombre: 'Ana María López',
  numero: '4111111111111111',
  vencimiento: '12/30',
  cvv: '123',
  correo: 'ana@fichacard.com',
};

describe('validarVencimiento', () => {
  it('acepta un mes y año que todavía no pasó', () => {
    expect(validarVencimiento('12/30', HOY)).toEqual({ valido: true });
  });

  it('acepta la tarjeta que vence este mes', () => {
    expect(validarVencimiento('10/26', HOY)).toEqual({ valido: true });
  });

  it('rechaza una tarjeta ya vencida', () => {
    expect(validarVencimiento('10/25', HOY).valido).toBe(false);
  });

  it('rechaza un mes fuera del rango 01-12', () => {
    expect(validarVencimiento('13/30', HOY)).toEqual({
      valido: false,
      mensaje: 'El mes debe estar entre 01 y 12.',
    });
    expect(validarVencimiento('00/30', HOY).valido).toBe(false);
  });

  it('rechaza un formato que no sea MM/AA', () => {
    expect(validarVencimiento('1226', HOY).valido).toBe(false);
    expect(validarVencimiento('12/2026', HOY).valido).toBe(false);
  });
});

describe('esCvvValido', () => {
  it('pide tres dígitos en Visa y Mastercard', () => {
    expect(esCvvValido('123', 'Visa')).toBe(true);
    expect(esCvvValido('123', 'Mastercard')).toBe(true);
    expect(esCvvValido('1234', 'Visa')).toBe(false);
  });

  it('pide cuatro dígitos en Amex', () => {
    expect(esCvvValido('1234', 'Amex')).toBe(true);
    expect(esCvvValido('123', 'Amex')).toBe(false);
  });

  it('no admite letras', () => {
    expect(esCvvValido('12a', 'Visa')).toBe(false);
  });

  it('usa tres dígitos cuando todavía no se sabe la marca', () => {
    expect(largoCvvEsperado(null)).toBe(3);
  });
});

describe('validarNombreTitular', () => {
  it('acepta un nombre de más de tres letras', () => {
    expect(validarNombreTitular('Ana María López')).toBeNull();
  });

  it('rechaza un nombre demasiado corto', () => {
    expect(validarNombreTitular('Ab')).not.toBeNull();
  });

  it('rechaza nombres con números o símbolos', () => {
    expect(validarNombreTitular('Ana1 López')).not.toBeNull();
    expect(validarNombreTitular('Ana-María')).not.toBeNull();
  });

  it('rechaza un nombre vacío o solo espacios', () => {
    expect(validarNombreTitular('')).not.toBeNull();
    expect(validarNombreTitular('   ')).not.toBeNull();
  });
});

describe('esEmailValido', () => {
  it.each([
    ['ana@fichacard.com', true],
    ['ana.maria@fichacard.com', true],
    ['ana@fichacard', false],
    ['ana@@fichacard.com', false],
    ['ana fichacard.com', false],
    ['', false],
  ])('%s → %s', (correo, esperado) => {
    expect(esEmailValido(correo)).toBe(esperado);
  });
});

describe('validarPago', () => {
  it('no devuelve errores con los cinco campos correctos', () => {
    expect(validarPago(TARJETA_VALIDA, HOY)).toEqual({});
  });

  it('marca solo los campos que están mal', () => {
    const errores = validarPago({ ...TARJETA_VALIDA, cvv: '1' }, HOY);

    expect(Object.keys(errores)).toEqual(['cvv']);
  });

  it('reporta los cinco campos vacíos', () => {
    const errores = validarPago(
      { nombre: '', numero: '', vencimiento: '', cvv: '', correo: '' },
      HOY,
    );

    expect(Object.keys(errores).sort()).toEqual(['correo', 'cvv', 'nombre', 'numero', 'vencimiento']);
  });

  it('exige cuatro dígitos de CVV cuando la tarjeta es Amex', () => {
    const amex = { ...TARJETA_VALIDA, numero: '378282246310005' };

    expect(validarPago({ ...amex, cvv: '123' }, HOY).cvv).toBeDefined();
    expect(validarPago({ ...amex, cvv: '1234' }, HOY)).toEqual({});
  });
});