import type { ReactNode } from "react";

import { Spinner } from "./Spinner";

export type Column<TRowData> = {
  id: string;
  title: ReactNode;
  accessor: (row: TRowData) => ReactNode;
  className?: string;
};

type Props<TRowData> = {
  columns: Column<TRowData>[];
  rows: (TRowData & { id?: string })[];
  isFetching?: boolean;
};

export function Table<TRowData = any>({
  columns,
  rows,
  isFetching,
}: Props<TRowData>) {
  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.id}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isFetching ? (
                  <td colSpan={columns.length}>
                    <div className="flex justify-center items-center px-4 py-4 w-full">
                      <Spinner />
                    </div>
                  </td>
                ) : (
                  rows.map((row, i) => (
                    <tr key={row.id || i}>
                      {columns.map((column) => (
                        <td
                          key={column.id}
                          className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${
                            column.className || ""
                          }`}
                        >
                          {column.accessor(row)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
