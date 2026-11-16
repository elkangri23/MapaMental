import { SLIDE_TABLE_LIMITS, type SlideTable } from '@espacio-visual/domain';

type Props = {
  table: SlideTable;
  onChange?: (table: SlideTable) => void;
  onRemove?: () => void;
  disabled?: boolean;
};

export function SlideTableBlock({ table, onChange, onRemove, disabled }: Props) {
  const label = (column: number) => table.headers[column] || `Columna ${column + 1}`;
  const editCell = (row: number, column: number, value: string) => {
    const rows = table.rows.map((cells, index) =>
      index === row ? cells.map((cell, cellIndex) => cellIndex === column ? value : cell) : cells);
    onChange?.({ ...table, rows });
  };
  return (
    <div className="slide-table-block">
      <table className="slide-table">
        <caption>Tabla de la diapositiva</caption>
        <thead><tr>
          {table.headers.map((header, column) => <th key={column} scope="col">
            {onChange ? <input aria-label={`Encabezado ${column + 1}`} disabled={disabled} value={header}
              maxLength={SLIDE_TABLE_LIMITS.cellLength} onChange={(event) => onChange({
                ...table, headers: table.headers.map((item, index) => index === column ? event.target.value : item),
              })} /> : label(column)}
          </th>)}
          {onChange && <th scope="col" className="slide-table__row-action">Filas</th>}
        </tr></thead>
        <tbody>{table.rows.map((cells, row) => <tr key={row}>
          {cells.map((cell, column) => <td key={column}>
            {onChange ? <input aria-label={`Fila ${row + 1}, ${label(column)}`} disabled={disabled} value={cell}
              maxLength={SLIDE_TABLE_LIMITS.cellLength} onChange={(event) => editCell(row, column, event.target.value)} /> : cell}
          </td>)}
          {onChange && <td><button type="button" className="slide-block-remove" aria-label={`Quitar fila ${row + 1}`}
            disabled={disabled || table.rows.length === 1}
            onClick={() => onChange({ ...table, rows: table.rows.filter((_, index) => index !== row) })}>×</button></td>}
        </tr>)}</tbody>
      </table>
      {onChange && <div className="slide-table__actions">
        <button type="button" className="slide-block-add" disabled={disabled || table.rows.length >= SLIDE_TABLE_LIMITS.rows}
          onClick={() => onChange({ ...table, rows: [...table.rows, table.headers.map(() => '')] })}>Añadir fila</button>
        <button type="button" className="slide-block-add" disabled={disabled || table.headers.length >= SLIDE_TABLE_LIMITS.columns}
          onClick={() => onChange({ headers: [...table.headers, `Columna ${table.headers.length + 1}`], rows: table.rows.map((row) => [...row, '']) })}>Añadir columna</button>
        <button type="button" className="slide-block-remove" disabled={disabled || table.headers.length <= 2}
          onClick={() => onChange({ headers: table.headers.slice(0, -1), rows: table.rows.map((row) => row.slice(0, -1)) })}>Quitar última columna</button>
        {onRemove && <button type="button" className="slide-block-remove" disabled={disabled} onClick={onRemove}>Quitar tabla</button>}
      </div>}
    </div>
  );
}
