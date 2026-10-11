import { describe, expect, it } from 'vitest';
import {
  detectarMarca,
  esNumeroDeTarjetaValido,
  formatearNumeroTarjeta,
  quitarSeparadores,
} from '../validarTarjeta';

describe('esNumeroDeTarjetaValido', () => {
  it.each([
    ['4111111111111111', 'Visa'],
    ['5555555555554444', 'Mastercard'],
    ['2223003122003222', 'Mastercard'],
    ['378282246310005', 'Amex'],
    ['371449635398431', 'Amex'],
  ])('acepta %s (%s)', (numero) => {
    expect(esNumeroDeTarjetaValido(numero)).toBe(true);
  });

  it.each([
    ['4111111111111112', 'no pasa el dígito de control'],
    ['1234567890123456', 'pasa Luhn pero no es una tarjeta real'],
    ['411111', 'tiene menos de 13 dígitos'],
    ['41111111111111111111', 'tiene más de 19 dígitos'],
    ['', 'está vacío'],
  ])('rechaza %s (%s)', (numero) => {
    expect(esNumeroDeTarjetaValido(numero)).toBe(false);
  });

  it('ignora guiones y espacios', () => {
    expect(esNumeroDeTarjetaValido('4111-1111 1111-1111')).toBe(true);
  });
});

describe('detectarMarca', () => {
  it('reconoce Visa por el 4 inicial', () => {
    expect(detectarMarca('4111111111111111')).toBe('Visa');
  });

  it('reconoce Mastercard del 51 al 55', () => {
    expect(detectarMarca('5500000000000004')).toBe('Mastercard');
  });

  it('reconoce Mastercard del 2221 al 2720', () => {
    expect(detectarMarca('2223003122003222')).toBe('Mastercard');
    expect(detectarMarca('2720990000000000')).toBe('Mastercard');
  });

  it('reconoce Amex por el 34 o 37', () => {
    expect(detectarMarca('378282246310005')).toBe('Amex');
    expect(detectarMarca('341111111111111')).toBe('Amex');
  });

  it('devuelve null si el prefijo no es de ninguna marca', () => {
    expect(detectarMarca('9999999999999999')).toBeNull();
    expect(detectarMarca('')).toBeNull();
  });

  it('no confunde el 2720 con un número fuera del rango', () => {
    expect(detectarMarca('2820990000000000')).toBeNull();
    expect(detectarMarca('2120990000000000')).toBeNull();
  });
});

describe('formatearNumeroTarjeta', () => {
  it('agrupa en bloques de cuatro', () => {
    expect(formatearNumeroTarjeta('4111111111111111')).toBe('4111 1111 1111 1111');
  });

  it('funciona con un número de 15 dígitos', () => {
    expect(formatearNumeroTarjeta('378282246310005')).toBe('3782 8224 6310 005');
  });

  it('no deja espacio al final mientras se escribe', () => {
    expect(formatearNumeroTarjeta('4111')).toBe('4111');
    expect(formatearNumeroTarjeta('41111')).toBe('4111 1');
  });

  it('no deja pasar más de 19 dígitos', () => {
    const formateado = formatearNumeroTarjeta('4'.repeat(25));

    expect(quitarSeparadores(formateado)).toHaveLength(19);
  });
});