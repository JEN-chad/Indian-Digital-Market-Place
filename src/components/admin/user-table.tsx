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
import { Search, MoreVertical, ArrowUpDown, ShieldOff, ShieldAlert } from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  kycStatus: string;
  listingsCount: number;
  dealsCount: number;
  createdAt: string;
}

interface UserTableProps {
  data: User[];
  onSuspend: (id: string, reason: string) => void;
  isLoading: boolean;
}

const columnHelper = createColumnHelper<User>();

export function UserTable({ data, onSuspend, isLoading }: UserTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [actionRow, setActionRow] = useState<string | null>(null);

  const columns = [
    columnHelper.accessor("name", {
      header: ({ column }) => (
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          User <ArrowUpDown className="w-3 h-3" />
        </div>
      ),
      cell: info => (
        <div>
          <p className="font-bold">{info.getValue() || "Unnamed User"}</p>
          <p className="text-xs text-gray-500">{info.row.original.email}</p>
        </div>
      ),
    }),
    columnHelper.accessor("role", {
      header: "Role",
      cell: info => (
        <span className="text-xs font-bold uppercase tracking-widest bg-gray-100 px-2 py-1">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("kycStatus", {
      header: "KYC Status",
      cell: info => {
        const val = info.getValue();
        let color = "bg-gray-100 text-gray-600";
        if (val === "approved") color = "bg-green-100 text-green-700";
        if (val === "rejected") color = "bg-red-100 text-red-700";
        if (val === "in_review") color = "bg-orange-100 text-orange-700";
        
        return (
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 ${color}`}>
            {val.replace("_", " ")}
          </span>
        );
      },
    }),
    columnHelper.accessor("listingsCount", {
      header: "Listings",
      cell: info => <div className="text-center font-mono">{info.getValue()}</div>,
    }),
    columnHelper.accessor("dealsCount", {
      header: "Deals",
      cell: info => <div className="text-center font-mono">{info.getValue()}</div>,
    }),
    columnHelper.accessor("createdAt", {
      header: "Joined",
      cell: info => <span className="text-sm">{new Date(info.getValue()).toLocaleDateString()}</span>,
    }),
    columnHelper.display({
      id: "actions",
      cell: info => {
        const user = info.row.original;
        const isOpen = actionRow === user.id;

        return (
          <div className="relative">
            <button 
              onClick={() => setActionRow(isOpen ? null : user.id)}
              className="p-1 hover:bg-black/5 rounded"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {isOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white border border-black/10 shadow-xl z-10 py-1 text-sm">
                {user.role !== "suspended" && (
                  <button 
                    onClick={() => {
                      const reason = prompt("Enter reason for suspension:");
                      if (reason) onSuspend(user.id, reason);
                      setActionRow(null);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
                  >
                    <ShieldOff className="w-4 h-4" /> Suspend User
                  </button>
                )}
                {user.role === "suspended" && (
                  <div className="px-4 py-2 text-red-600 flex items-center gap-2 opacity-50">
                    <ShieldAlert className="w-4 h-4" /> Suspended
                  </div>
                )}
              </div>
            )}
          </div>
        );
      },
    }),
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
            placeholder="Search users..."
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
                <td colSpan={7} className="p-8 text-center text-gray-500">Loading...</td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">No users found</td>
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
