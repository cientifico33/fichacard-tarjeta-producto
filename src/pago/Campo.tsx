interface PropsCampo {
  id: string;
  etiqueta: string;
  valor: string;
  error: string | null;
  pista?: string | null;
  tipo?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: 'text' | 'numeric' | 'email';
  onCambio: (valor: string) => void;
  onBlur: () => void;
}

/**
 * Un campo con su etiqueta y su mensaje de error.
 *
 * El error va en un `span` aparte para que `aria-describedby` lo anuncie sin
 * mezclarse con el texto que el usuario está escribiendo.
 */
export function Campo({
  id,
  etiqueta,
  valor,
  error,
  pista = null,
  tipo = 'text',
  placeholder,
  autoComplete,
  inputMode,
  onCambio,
  onBlur,
}: PropsCampo) {
  const idError = `${id}-error`;
  const idPista = pista === null ? null : `${id}-pista`;

  const descritos = [error === null ? null : idError, idPista].filter((valor) => valor !== null);

  return (
    <div className="campo">
      <label htmlFor={id}>{etiqueta}</label>
      <input
        id={id}
        type={tipo}
        value={valor}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={error !== null}
        aria-describedby={descritos.length === 0 ? undefined : descritos.join(' ')}
        onChange={(evento) => onCambio(evento.target.value)}
        onBlur={onBlur}
      />
      {pista !== null && (
        <span className="campo__pista" id={idPista ?? undefined}>
          {pista}
        </span>
      )}
      {error !== null && (
        <span className="campo__error" id={idError} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}