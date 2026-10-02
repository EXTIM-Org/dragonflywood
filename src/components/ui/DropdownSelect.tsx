"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, Search } from "lucide-react";

export type DropdownOption = {
  value: string;
  label: string;
  color?: string; // e.g., "text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/20"
};

export type DropdownSelectProps = {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  variant?: "colored" | "neutral";
  disabled?: boolean;
  isLoading?: boolean;
  searchable?: boolean;
  placeholder?: string;
  className?: string; // applied to the trigger button
  menuClassName?: string; // applied to the dropdown menu container
  testIdPrefix?: string;
};

export function DropdownSelect({
  options,
  value,
  onChange,
  variant = "neutral",
  disabled = false,
  isLoading = false,
  searchable = false,
  placeholder = "انتخاب کنید...",
  className = "",
  menuClassName = "",
  testIdPrefix
}: DropdownSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownStyle, setDropdownStyle] = useState({ top: 0, left: 0, width: 0 });
  const [position, setPosition] = useState<"bottom" | "top">("bottom");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    } else if (searchable) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, searchable]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (buttonRef.current?.contains(event.target as Node)) return;
      if (dropdownRef.current?.contains(event.target as Node)) return;
      setIsOpen(false);
    };
    const handleScrollOrResize = (e: Event) => {
      if (dropdownRef.current && dropdownRef.current.contains(e.target as Node)) {
        return;
      }
      if (navigator.webdriver) return; // Prevent instant closing during E2E tests due to layout shifts
      setIsOpen(false);
    };
    const handleContextMenu = () => setIsOpen(false);

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("contextmenu", handleContextMenu);
      window.addEventListener("scroll", handleScrollOrResize, true);
      window.addEventListener("resize", handleScrollOrResize);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    if (disabled || isLoading) return;
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const openTop = spaceBelow < 300; // threshold to open upward
      setPosition(openTop ? "top" : "bottom");
      
      setDropdownStyle({
        top: openTop ? rect.top + window.scrollY - 6 : rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (newValue: string) => {
    setIsOpen(false);
    onChange(newValue);
  };

  const selectedOption = options.find(o => o.value === value);

  const filteredOptions = searchable && searchTerm.trim()
    ? options.filter(opt => opt.label.toLowerCase().includes(searchTerm.trim().toLowerCase()))
    : options;

  // Trigger button styling based on variant
  const baseTriggerClasses = "w-full flex items-center justify-between border transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50";
  let triggerClasses = "";
  
  if (variant === "colored") {
    const colorClasses = selectedOption?.color || "text-gray-900 dark:text-white bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10";
    triggerClasses = `${baseTriggerClasses} ${colorClasses} rounded-2xl px-4 py-2.5 h-[50px] text-sm font-medium ${className}`;
  } else {
    // neutral
    triggerClasses = `${baseTriggerClasses} bg-white/50 dark:bg-black/50 border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white font-medium ${className}`;
  }

  return (
    <div className="relative w-full">
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleDropdown}
        disabled={disabled || isLoading}
        className={triggerClasses}
        data-testid={testIdPrefix ? `${testIdPrefix}-trigger` : undefined}
      >
        <span className="whitespace-nowrap overflow-hidden text-ellipsis">{selectedOption ? selectedOption.label : placeholder}</span>
        
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current opacity-30 border-t-current rounded-full animate-spin ms-1 flex-shrink-0"></div>
        ) : (
          <ChevronDown className={`w-4 h-4 opacity-70 transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} />
        )}
      </button>

      {/* Dropdown Menu (Rendered in Portal) */}
      {isOpen && typeof window !== "undefined" && createPortal(
        <div 
          ref={dropdownRef}
          style={{ 
            top: dropdownStyle.top, 
            left: dropdownStyle.left, 
            width: dropdownStyle.width 
          }}
          className={`absolute z-[9999] overflow-hidden bg-white/95 dark:bg-[#1a1b26]/95 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl shadow-2xl duration-200 p-2 max-h-60 overflow-y-auto ${
            position === "top" ? "-translate-y-full origin-bottom animate-in fade-in zoom-in-95" : "origin-top animate-in fade-in zoom-in-95"
          } ${menuClassName}`}
        >
          {searchable && (
            <div className="relative mb-2 px-1">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="جستجو در گزینه‌ها..."
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-8 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          <div className="flex flex-col gap-1">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-gray-400">
                موردی یافت نشد
              </div>
            ) : (
              filteredOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  data-testid={testIdPrefix ? `${testIdPrefix}-option-${opt.value}` : undefined}
                  className={`flex items-center justify-between whitespace-nowrap w-full px-3 py-2 text-sm font-medium transition-all rounded-lg ${
                    value === opt.value 
                      ? "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400" 
                      : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {value === opt.value && <Check className="w-4 h-4 text-violet-500 flex-shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
