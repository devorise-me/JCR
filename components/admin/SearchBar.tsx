"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  searchType?: 'general' | 'camelId';
  onSearchTypeChange?: (type: 'general' | 'camelId') => void;
  placeholder?: string;
  className?: string;
}

const SearchBar = ({
  value,
  onChange,
  searchType,
  onSearchTypeChange,
  placeholder = "ابحث عن طريق الاسم، البريد الإلكتروني، رقم الجوال، أو رقم الهوية",
  className = ""
}: SearchBarProps) => {
  return (
    <div className={`flex gap-2 flex-1 ${className}`}>
      {searchType && onSearchTypeChange && (
        <Select
          value={searchType}
          onValueChange={(value: 'general' | 'camelId') => onSearchTypeChange(value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="نوع البحث" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">بحث عام</SelectItem>
            <SelectItem value="camelId">رقم الشريحة</SelectItem>
          </SelectContent>
        </Select>
      )}
      <div className="relative flex-1">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        <Input
          type="search"
          placeholder={searchType === 'camelId' ? "ابحث عن طريق رقم الشريحة" : placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pr-10 text-right"
        />
      </div>
    </div>
  );
};

export default SearchBar;