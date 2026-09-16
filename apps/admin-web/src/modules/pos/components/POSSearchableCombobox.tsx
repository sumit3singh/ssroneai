import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { renderSafeString } from "../utils/renderSafeString";

export interface ComboboxOption {
  value: string | number;
  label: string;
  sublabel?: string;
  badge?: string;
  badgeColor?: string;
  isOccupied?: boolean;
}

interface POSSearchableComboboxProps {
  value: string | number;
  onChange: (val: string | number) => void;
  options: ComboboxOption[];
  placeholder?: string;
  icon?: React.ReactNode;
  isRequiredWarning?: boolean;
  disabled?: boolean;
  className?: string;
  onCreateNewWithSearchTerm?: (term: string) => void;
  triggerId?: string;
  shortcutBadge?: string;
}

export const POSSearchableCombobox: React.FC<POSSearchableComboboxProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select...",
  icon,
  isRequiredWarning = false,
  disabled = false,
  className = "",
  onCreateNewWithSearchTerm,
  triggerId,
  shortcutBadge,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Currently selected option
  const selectedOption = options.find((o) => {
    if (!o.value && o.value !== 0) return false;
    const strVal = String(value || "").toLowerCase().trim();
    if (!strVal) return false;

    const optVal = String(o.value).toLowerCase().trim();
    const optLabel = String(o.label || "").toLowerCase().trim();
    const cleanOptLabel = optLabel.replace(/^table\s+/, "").trim();

    return (
      optVal === strVal ||
      optLabel === strVal ||
      cleanOptLabel === strVal ||
      optLabel === `table ${strVal}`
    );
  });

  // Word-by-word real-time auto-filtering
  const filteredOptions = React.useMemo(() => {
    if (!query.trim()) return options;
    const words = query.toLowerCase().trim().split(/\s+/);
    return options.filter((opt) => {
      const text = `${opt.label} ${opt.sublabel || ""} ${opt.badge || ""}`.toLowerCase();
      return words.every((w) => text.includes(w));
    });
  }, [options, query]);

  // Reset active index on query change
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Close popup on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val: string | number) => {
    onChange(val);
    setIsOpen(false);
    setQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown") {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredOptions.length > 0) {
        const targetOpt = filteredOptions[activeIndex] || filteredOptions[0];
        handleSelect(targetOpt.value);
      } else if (query.trim() && onCreateNewWithSearchTerm) {
        const term = query.trim();
        setIsOpen(false);
        setQuery("");
        onCreateNewWithSearchTerm(term);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full select-none ${className}`}>
      {/* Combobox Trigger & Auto-Search Input Combined */}
      <div
        id={triggerId}
        onClick={() => {
          if (!disabled) {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 10);
          }
        }}
        className={`flex items-center gap-1.5 px-2 py-1 bg-background border rounded-md cursor-pointer transition-all ${
          isOpen ? "ring-1 ring-primary border-primary" : ""
        } ${
          isRequiredWarning && !value
            ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold"
            : "border-border text-foreground"
        }`}
      >
        {icon && <span className="shrink-0 text-muted-foreground">{icon}</span>}
        
        {isOpen ? (
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedOption ? selectedOption.label : placeholder}
            className="w-full text-xs font-semibold bg-transparent text-foreground focus:outline-none placeholder:text-muted-foreground/60"
            autoFocus
          />
        ) : (
          <span className="w-full text-xs font-semibold truncate">
            {selectedOption ? (
              <span className="flex items-center gap-1 truncate">
                <span className="truncate">{selectedOption.label}</span>
                {selectedOption.badge && (
                  <span className={`text-[9px] font-mono font-extrabold px-1 rounded border shrink-0 ${selectedOption.badgeColor || "bg-muted border-border"}`}>
                    {selectedOption.badge}
                  </span>
                )}
              </span>
            ) : value ? (
              <span className="truncate text-foreground font-semibold">{String(value).toLowerCase().startsWith("table") ? String(value) : `Table ${value}`}</span>
            ) : (
              <span className="text-muted-foreground/80">{placeholder}</span>
            )}
          </span>
        )}

        {shortcutBadge && !isOpen && (
          <span className="text-[9px] font-mono font-bold px-1 rounded bg-muted/80 text-muted-foreground border border-border shrink-0 opacity-80 hover:opacity-100">
            {shortcutBadge}
          </span>
        )}

        <ChevronDown size={14} className="shrink-0 text-muted-foreground opacity-70" />
      </div>

      {/* Floating Popup Dropdown Overlay */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-popover border border-border rounded-md shadow-xl overflow-hidden max-h-56 flex flex-col">
          {/* LOV Popup Header with Close Cross Button */}
          <div className="flex items-center justify-between px-2.5 py-1 bg-muted/60 border-b border-border text-[10px] font-bold text-muted-foreground shrink-0">
            <span>{filteredOptions.length} Result{filteredOptions.length === 1 ? "" : "s"}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="p-0.5 rounded hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground cursor-pointer transition-colors font-mono font-extrabold text-[11px]"
              title="Close dropdown"
            >
              ✕
            </button>
          </div>

          <div className="overflow-y-auto scrollbar-thin max-h-48">
            {filteredOptions.length === 0 ? (
              <div className="p-2 space-y-1 text-center">
                <p className="text-xs text-muted-foreground italic">No matching results found.</p>
                {query.trim() && onCreateNewWithSearchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      const term = query.trim();
                      setIsOpen(false);
                      setQuery("");
                      onCreateNewWithSearchTerm(term);
                    }}
                    className="w-full py-1 px-2 text-xs font-bold rounded bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer flex items-center justify-center gap-1 mt-1"
                  >
                    <span>+ Create customer for "{query.trim()}"</span>
                    <kbd className="px-1 text-[9px] bg-background/50 rounded border">↵ Enter</kbd>
                  </button>
                )}
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = String(opt.value) === String(value);
                const isActive = idx === activeIndex;

                return (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`px-2.5 py-1.5 text-xs font-medium flex items-center justify-between cursor-pointer transition-colors ${
                      isActive ? "bg-primary/10 text-primary" : "text-popover-foreground hover:bg-muted"
                    } ${isSelected ? "font-bold bg-primary/15" : ""}`}
                  >
                    <div className="flex flex-col truncate pr-2">
                      <span className="truncate flex items-center gap-1.5">
                        {renderSafeString(opt.label)}
                        {opt.badge && (
                          <span className={`text-[9px] font-mono font-extrabold px-1 py-0.2 rounded border ${opt.badgeColor || "bg-muted border-border text-muted-foreground"}`}>
                            {renderSafeString(opt.badge)}
                          </span>
                        )}
                      </span>
                      {opt.sublabel && (
                        <span className="text-[10px] text-muted-foreground truncate">{renderSafeString(opt.sublabel)}</span>
                      )}
                    </div>

                    {isSelected && <Check size={12} className="text-primary shrink-0" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
