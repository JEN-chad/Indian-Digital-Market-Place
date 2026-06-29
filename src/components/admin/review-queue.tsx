import React, { useState } from "react";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";

interface ReviewQueueProps<T> {
  items: T[];
  renderCard: (item: T) => React.ReactNode;
  onAction?: (action: string, items: T[]) => void;
  filterOptions?: string[];
  searchKey?: keyof T;
}

export function ReviewQueue<T extends { id: string; status?: string }>({ 
  items, 
  renderCard,
  filterOptions = [],
  searchKey
}: ReviewQueueProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = searchKey 
      ? String(item[searchKey]).toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    const matchesFilter = activeFilter === "all" 
      ? true 
      : item.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-black/10 focus:outline-none focus:border-brand-green text-sm"
          />
        </div>
        
        {filterOptions.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select 
              value={activeFilter}
              onChange={e => setActiveFilter(e.target.value)}
              className="py-2 px-3 border border-black/10 focus:outline-none focus:border-brand-green text-sm bg-white"
            >
              <option value="all">All Statuses</option>
              {filterOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Queue Items */}
      <div className="space-y-4">
        {paginatedItems.length > 0 ? (
          paginatedItems.map(item => (
            <div key={item.id} className="bg-white border border-black/10 p-0">
              {renderCard(item)}
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500 border border-black/10 bg-gray-50 border-dashed">
            No items found in the queue.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-4 border-t border-black/10">
          <span className="text-xs text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length}
          </span>
          <div className="flex gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-1 border border-black/10 disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-1 border border-black/10 disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
