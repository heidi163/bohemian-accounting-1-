import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, Check, Plus } from 'lucide-react';
import { clsx } from 'clsx';

export interface SelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  allowCreate?: boolean;
}

export function SearchableSelect({ value, onChange, options, placeholder = "اختر...", className, disabled = false, allowCreate = true }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const updateRect = () => {
    if (wrapperRef.current) {
      setRect(wrapperRef.current.getBoundingClientRect());
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current && !wrapperRef.current.contains(event.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      updateRect();
      const handleScroll = (e: Event) => {
        if (dropdownRef.current && dropdownRef.current.contains(e.target as Node)) return;
        updateRect();
      };
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', updateRect);
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', updateRect);
      };
    }
  }, [isOpen]);

  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);
  const exactMatch = options.some(opt => opt.label.toLowerCase() === searchTerm.toLowerCase() || opt.value.toLowerCase() === searchTerm.toLowerCase());
  const showCreate = allowCreate && searchTerm.trim() !== '' && !exactMatch;

  const handleToggle = () => {
    if (!disabled) {
      updateRect();
      setIsOpen(!isOpen);
    }
  };

  const dropdownContent = isOpen && rect ? (
    <div 
      ref={dropdownRef}
      className="fixed z-[99999] bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden"
      style={{ 
        top: `${rect.bottom + 4}px`, 
        left: `${rect.left}px`, 
        width: `${rect.width}px` 
      }}
    >
      <div className="p-2 border-b border-slate-100 flex items-center gap-2 px-3 bg-slate-50/50">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          autoFocus
          className="w-full text-sm outline-none bg-transparent py-1.5"
          placeholder="ابحث..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
        {filteredOptions.length === 0 && !showCreate ? (
          <div className="p-3 text-sm text-center text-slate-500">لا توجد نتائج</div>
        ) : (
          filteredOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
                setSearchTerm('');
              }}
              className={clsx(
                "w-full text-start px-3 py-2 text-sm rounded-lg flex items-center justify-between transition-colors",
                value === option.value ? "bg-primary-50 text-primary-600 font-bold" : "hover:bg-slate-50 text-slate-700"
              )}
            >
              {option.label}
              {value === option.value && <Check className="w-4 h-4 text-primary-600" />}
            </button>
          ))
        )}
        {showCreate && (
          <button
            type="button"
            onClick={() => {
              onChange(searchTerm);
              setIsOpen(false);
              setSearchTerm('');
            }}
            className="w-full text-start px-3 py-2 text-sm rounded-lg flex items-center gap-2 hover:bg-primary-50 text-primary-600 font-bold transition-colors mt-1 border-t border-slate-100"
          >
            <Plus className="w-4 h-4" />
            إضافة "{searchTerm}"
          </button>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div ref={wrapperRef} className={clsx("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={clsx(
          "w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 outline-none transition-all flex items-center justify-between",
          disabled ? "opacity-60 cursor-not-allowed bg-slate-50" : "focus:ring-2 focus:ring-primary-500/20 hover:border-slate-300"
        )}
      >
        <span className={clsx("truncate", (selectedOption || (allowCreate && value)) ? "text-slate-900 font-bold" : "text-slate-400 font-normal")}>
          {selectedOption ? selectedOption.label : (allowCreate && value ? value : placeholder)}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(dropdownContent, document.body)}
    </div>
  );
}
