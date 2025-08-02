import { useState, useMemo, useEffect } from 'react'
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiChevronUp,
  FiChevronDown,
} from 'react-icons/fi'
import { useTheme } from '@/theme/ThemeProvider'
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  ColumnDef,
  SortingState,
  getSortedRowModel,
  PaginationState,
} from '@tanstack/react-table'

export type DataTableProps<Data extends object> = {
  data: Data[]
  columns: ColumnDef<Data, any>[]
  total: number
  isLoading?: boolean
  onChangePagination: Function
}

export default function DataTable<Data extends object>({
  data,
  columns,
  total,
  isLoading,
  onChangePagination,
}: DataTableProps<Data>) {
  const { colors } = useTheme()
  const [sorting, setSorting] = useState<SortingState>([])
  const [pageCount, setPageCount] = useState(0)

  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  )

  useEffect(() => {
    if (total > 0) {
      const totalPage = Math.ceil(total / pagination.pageSize)
      setPageCount(totalPage)
    }
    onChangePagination(pagination)
  }, [total, pagination])

  const table = useReactTable({
    columns,
    data,
    pageCount: pageCount,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      pagination,
    },
    onPaginationChange: setPagination,
    manualPagination: true,
  })

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta: any = header.column.columnDef.meta
                  return (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className={`px-4 py-3 text-left text-sm font-medium border-b cursor-pointer hover:opacity-70 transition-opacity ${
                        meta?.isNumeric ? 'text-right' : ''
                      }`}
                      style={{
                        color: colors.text.secondary,
                        borderColor: colors.border.primary,
                        backgroundColor: colors.surface,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() ? (
                          header.column.getIsSorted() === 'desc' ? (
                            <FiChevronDown className="w-4 h-4" />
                          ) : (
                            <FiChevronUp className="w-4 h-4" />
                          )
                        ) : null}
                      </div>
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          {isLoading ? (
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <td
                        key={cell.id}
                        className="px-4 py-3 border-b"
                        style={{
                          borderColor: colors.border.secondary,
                          backgroundColor: colors.background,
                        }}
                      >
                        <div
                          className="h-4 rounded animate-pulse"
                          style={{ backgroundColor: colors.border.primary }}
                        ></div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          ) : (
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:opacity-70 transition-opacity"
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta: any = cell.column.columnDef.meta
                    return (
                      <td
                        key={cell.id}
                        className={`px-4 py-3 border-b text-sm ${
                          meta?.isNumeric ? 'text-right' : ''
                        }`}
                        style={{
                          color: colors.text.primary,
                          borderColor: colors.border.secondary,
                          backgroundColor: colors.background,
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div
          className="flex items-center justify-between mt-6 pt-6"
          style={{ borderTop: `1px solid ${colors.border.secondary}` }}
        >
          <div className="text-sm" style={{ color: colors.text.secondary }}>
            Showing {pageIndex * pageSize + 1} to{' '}
            {Math.min((pageIndex + 1) * pageSize, total)} of {total} items
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{
                borderColor: colors.border.secondary,
                backgroundColor: colors.background,
                color: colors.text.primary,
              }}
            >
              Previous
            </button>
            <span
              className="px-3 py-1 text-sm"
              style={{ color: colors.text.secondary }}
            >
              Page {pageIndex + 1} of {pageCount}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{
                borderColor: colors.border.secondary,
                backgroundColor: colors.background,
                color: colors.text.primary,
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
