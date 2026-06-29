import React, { useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Search, ExternalLink, ArrowUpDown } from "lucide-react";
import { formatCurrency } from "../../../lib/utils.ts";
import { DEAL_STAGES } from "../../../config/constants.ts";

interface Deal {
  deal: any;
  listing: any;
  buyer: { name: string; email: string };
  seller: { name: string; email: string };
}

interface DealMonitorTableProps {
  data: Deal[];
  isLoading: boolean;
  onViewDeal: (dealId: string) => void;
}

const columnHelper = createColumnHelper<Deal>();

export function DealMonitorTable({ data, isLoading, onViewDeal }: DealMonitorTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = [
    columnHelper.accessor("deal.id", {
      header: "Deal ID",
      cell: info => <span className="font-mono text-xs">{info.getValue().split('-')[0]}</span>,
    }),
    columnHelper.accessor("listing.title", {
      header: "Listing",
      cell: info => <span className="font-bold">{info.getValue() || 'Unknown'}</span>,
    }),
    columnHelper.accessor("buyer.name", {
      header: "Buyer",
      cell: info => info.getValue() || info.row.original.buyer?.email || 'N/A',
    }),
    columnHelper.accessor("seller.name", {
      header: "Seller",
      cell: info => info.getValue() || info.row.original.seller?.email || 'N/A',
    }),
    columnHelper.accessor("deal.dealValue", {
      header: ({ column }) => (
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Value <ArrowUpDown className="w-3 h-3" />
        </div>
      ),
      cell: info => <span className="font-bold text-brand-green">{formatCurrency(info.getValue())}</span>,
    }),
    columnHelper.accessor("deal.stage", {
      header: "Stage",
      cell: info => {
        const stage = info.getValue();
        const label = DEAL_STAGES.find(s => s.value === stage)?.label || stage;
        return (
          <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-50 text-blue-700 px-2 py-1">
            {label}
          </span>
        );
      },
    }),
    columnHelper.accessor("deal.escrowStatus", {
      header: "Escrow",
      cell: info => {
        const status = info.getValue();
        let color = "bg-gray-100 text-gray-700";
        if (status === "funded") color = "bg-green-100 text-green-700";
        if (status === "released") color = "bg-purple-100 text-purple-700";
        
        return (
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 ${color}`}>
            {status.replace("_", " ")}
          </span>
        );
      }
    }),
    columnHelper.display({
      id: "actions",
      cell: info => (
        <button 
          onClick={() => onViewDeal(info.row.original.deal.id)}
          className="text-brand-green hover:opacity-80 p-1"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      )
    })
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            value={globalFilter ?? ""}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder="Search deals..."
            className="w-full pl-9 pr-4 py-2 border border-black/10 text-sm focus:outline-none focus:border-brand-green bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-black/10 overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 border-b border-black/10">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="p-4 font-bold text-gray-700">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-500">Loading...</td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-500">No deals found</td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className="border-b border-black/5 hover:bg-gray-50">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="p-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, data.length)} of {data.length}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 text-xs font-bold uppercase tracking-widest border border-black/10 disabled:opacity-50 hover:bg-gray-50"
          >
            Prev
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 text-xs font-bold uppercase tracking-widest border border-black/10 disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>

    </div>
  );
}
