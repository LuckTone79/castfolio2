import React from "react";

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface TableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function Table<T extends Record<string, unknown>>({
  columns, data, loading, emptyMessage = "데이터가 없습니다", onRowClick,
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(col => (
              <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">로딩 중...</td></tr>
          ) : data.length === 0 ? (
            <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">{emptyMessage}</td></tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={i}
                onClick={() => onRowClick?.(row)}
                className={`${onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}`}
              >
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 text-gray-700">
                    {col.render ? col.render(row) : String(row[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
