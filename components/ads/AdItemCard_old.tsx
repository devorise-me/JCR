"use client";

import { useState, useEffect, useRef } from "react";

interface AdItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  author?: { id: string; username: string | null; role: string | null };
}

interface AdItemCardProps {
  item: AdItem;
  onItemClick: (item: AdItem) => void;
  showAuthor?: boolean;
  className?: string;
}

export default function AdItemCard({ 
  item, 
  onItemClick,
  showAuthor = true,
  className = '' 
}: AdItemCardProps) {
  const [needsReadMore, setNeedsReadMore] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const isActive = new Date(item.startDate) <= new Date() && new Date() <= new Date(item.endDate);

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
      {item.imageUrl && (
        <div className="h-40 w-full overflow-hidden">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-gray-900 leading-snug group-hover:text-blue-800 transition-colors">
            {item.title}
          </h2>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {isActive ? 'نشط' : 'غير نشط'}
            </span>
            <span className="shrink-0 rounded-full bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 text-xs">
              {new Date(item.startDate).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="relative">
          <div
            ref={contentRef}
            className="text-gray-800 whitespace-pre-line leading-relaxed text-[15px] overflow-hidden"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 5,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
            dangerouslySetInnerHTML={{ __html: item.description }}
          />
          {needsReadMore && (
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
          )}
        </div>
        <div className="flex justify-between items-center mt-2">
          {showAuthor && item.author && (
            <div className="text-xs text-gray-400">
              بواسطة: {item.author.username || "-"}
            </div>
          )}
          <div className="text-xs text-gray-500">
            ينتهي في: {new Date(item.endDate).toLocaleDateString()}
          </div>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1 rounded-b-2xl bg-gradient-to-l from-blue-600/70 to-indigo-600/70 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
