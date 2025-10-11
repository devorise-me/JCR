"use client";
import { useState, useEffect, useRef } from "react";

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  image?: string;
  startDate?: string;
  endDate?: string;
  isPinned?: boolean;
  isVisible?: boolean;
  author?: { id: string; username: string | null; role: string | null };
}

// Helper function to extract plain text from HTML
const stripHtml = (html: string): string => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

interface NewsItemCardProps {
  item: NewsItem;
  onItemClick: (item: NewsItem) => void;
  onDeleteClick?: (item: NewsItem) => void;
  onToggleVisibleClick?: (item: NewsItem) => void;
  showAuthor?: boolean;
  showAdminActions?: boolean;
  className?: string;
}

export default function NewsItemCard({ 
  item, 
  onItemClick,
  onDeleteClick,
  onToggleVisibleClick,
  showAuthor = true,
  showAdminActions = false,
  className = '' 
}: NewsItemCardProps) {
  const [needsReadMore, setNeedsReadMore] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const el = contentRef.current;
      const lineHeight = parseInt(getComputedStyle(el).lineHeight) || 24;
      const maxHeight = lineHeight * 5;
      setNeedsReadMore(el.scrollHeight > maxHeight);
    }
  }, [item.description]);

  return (
    <div
      className={`group relative rounded-2xl bg-white/80 backdrop-blur ring-1 ring-gray-100 hover:ring-blue-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden ${className}`}
      onClick={() => onItemClick(item)}
    >
      {item.image && (
        <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
          {item.isPinned && (
            <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              مثبت
            </div>
          )}
        </div>
      )}
      <div className="p-6 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 leading-snug group-hover:text-blue-800 transition-colors">
              {item.title}
            </h2>
            {!item.image && item.isPinned && (
              <span className="inline-flex items-center gap-1 mt-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                مثبت
              </span>
            )}
          </div>
          <span className="shrink-0 rounded-full bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 text-xs">
            {item.startDate ? new Date(item.startDate).toLocaleDateString() : '-'}
          </span>
        </div>
        <div className="relative">
          {/* Auto-extract excerpt from description (first 200 characters) */}
          <p className="text-gray-800 leading-relaxed text-[15px] line-clamp-3">
            {stripHtml(item.description).slice(0, 200)}
            {stripHtml(item.description).length > 200 && '...'}
          </p>
          <div className="mt-2 text-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onItemClick(item);
              }}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded-full hover:bg-blue-50 transition-colors"
            >
              قراءة المزيد
            </button>
          </div>
        </div>
        {showAuthor && item.author && (
          <div className="text-xs text-gray-400 self-end">
            بواسطة: {item.author.username || "-"}
          </div>
        )}
        {showAdminActions && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-2">
            {onToggleVisibleClick && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisibleClick(item);
                }}
                className={`px-3 py-1 text-sm rounded-md flex items-center gap-1 ${
                  item.isVisible 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                {item.isVisible ? 'إخفاء' : 'إظهار'}
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onItemClick(item);
              }}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              تعديل
            </button>
            {onDeleteClick && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteClick(item);
                }}
                className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200 flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                حذف
              </button>
            )}
          </div>
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1 rounded-b-2xl bg-gradient-to-l from-blue-600/70 to-indigo-600/70 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
