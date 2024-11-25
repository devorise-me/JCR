"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar = ({
  value,
  onChange,
  placeholder = "ابحث عن طريق الاسم، البريد الإلكتروني، رقم الجوال، أو رقم الهوية"
}: SearchBarProps) => {
  return (
    <div className="relative flex-1">
      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pr-10 text-right"
      />
    </div>
  );
};

export default SearchBar;