import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * CustomSelect
 * -----------
 * Responsive, keyboard-accessible custom select component intended to replace native <select>.
 *
 * Props:
 * - id, name, value, defaultValue
 * - onChange: (value) => void (value is string)
 * - options: array of { value: string, label: string, description?: string, disabled?: boolean }
 * - placeholder: string
 * - disabled: boolean
 * - className: additional container classes
 * - dropdownPlacement: "bottom" | "top" (auto by default)
 * - size: "md" | "sm"
 * - fullWidth: boolean (default true)
 * - renderValue: custom renderer for selected value
 * - renderOption: custom renderer for options
 *
 * Note: When migrating from native <select>, convert <option> list to options array once and pass down.
 */

const baseContainer =
  "relative select-none text-white";
const triggerBase =
  "flex items-center justify-between gap-3 rounded-lg border bg-white/5 px-3 py-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";
const dropdownBase =
  "absolute z-40 mt-1 max-h-56 overflow-y-auto rounded-lg border border-white/10 bg-gray-900/95 shadow-xl backdrop-blur-sm";
const optionBase =
  "flex flex-col gap-1 px-3 py-2 cursor-pointer transition text-sm";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const CustomSelect = React.forwardRef(
  (
    {
      id,
      name,
      value,
      defaultValue,
      onChange,
      options = [],
      placeholder = "Select an option",
      disabled = false,
      className = "",
      dropdownPlacement,
      size = "md",
      fullWidth = true,
      renderValue,
      renderOption,
      ariaLabel,
      ariaDescribedBy,
      allowSearch = false,
      searchPlaceholder = "Search…",
      emptyState = "No matches found",
      children,
    },
    ref
  ) => {
    const containerRef = useRef(null);
    const triggerRef = useRef(null);
    const listRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const [hasFocus, setHasFocus] = useState(false);
    const [filter, setFilter] = useState("");
    const controlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue ?? "");
    const selectedValue = controlled ? value : internalValue;

    const childOptions = useMemo(() => {
      if (!children) return [];
      return React.Children.toArray(children)
        .filter(
          (child) =>
            React.isValidElement(child) &&
            (child.type === "option" || child.type === "optgroup")
        )
        .flatMap((child, idx) => {
          if (child.type === "optgroup") {
            const groupLabel = child.props.label;
            return React.Children.toArray(child.props.children || []).map(
              (option, optionIdx) => ({
                group: groupLabel,
                value: option.props?.value ?? option.props?.children ?? `option-${idx}-${optionIdx}`,
                label: option.props?.children ?? option.props?.value ?? "",
                disabled: option.props?.disabled,
              })
            );
          }
          return {
            value: child.props?.value ?? child.props?.children ?? `option-${idx}`,
            label: child.props?.children ?? child.props?.value ?? "",
            disabled: child.props?.disabled,
          };
        });
    }, [children]);

    const normalizedOptions = useMemo(() => {
      const source = options.length ? options : childOptions;
      return source.map((opt, idx) => ({
        ...opt,
        key: opt.value ?? idx.toString(),
        label: opt.label ?? opt.value ?? "",
        value: opt.value ?? opt.label ?? `option-${idx}`,
      }));
    }, [options, childOptions]);

    const filteredOptions = useMemo(() => {
      if (!allowSearch || !filter.trim()) return normalizedOptions;
      const search = filter.toLowerCase();
      return normalizedOptions.filter((opt) => {
        const labelString = String(opt.label ?? "");
        const valueString = String(opt.value ?? "");
        const descriptionString = String(opt.description ?? "");
        return (
          labelString.toLowerCase().includes(search) ||
          valueString.toLowerCase().includes(search) ||
          descriptionString.toLowerCase().includes(search)
        );
      });
    }, [normalizedOptions, allowSearch, filter]);

    const selectedOption = normalizedOptions.find(
      (opt) => opt.value === selectedValue
    );

    const effectivePlacement = dropdownPlacement ?? "bottom";

    useEffect(() => {
      function handleOutsideClick(event) {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target)
        ) {
          setIsOpen(false);
        }
      }
      if (isOpen) {
        document.addEventListener("mousedown", handleOutsideClick);
      } else {
        document.removeEventListener("mousedown", handleOutsideClick);
      }
      return () => {
        document.removeEventListener("mousedown", handleOutsideClick);
      };
    }, [isOpen]);

    useEffect(() => {
      if (!isOpen && allowSearch) {
        setFilter("");
      }
    }, [isOpen, allowSearch]);

    const handleSelect = (option) => {
      if (option.disabled) return;
      if (!controlled) {
        setInternalValue(option.value);
      }
      if (onChange) {
        const syntheticEvent = {
          target: { value: option.value, name },
          currentTarget: { value: option.value, name },
          value: option.value,
          option,
          preventDefault: () => {},
          stopPropagation: () => {},
        };
        onChange(syntheticEvent, option);
      }
      setIsOpen(false);
      triggerRef.current?.focus();
    };

    const handleKeyDown = (event) => {
      if (disabled) return;
      switch (event.key) {
        case " ":
        case "Enter":
        case "ArrowUp":
        case "ArrowDown": {
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            const currentIndex = filteredOptions.findIndex(
              (opt) => opt.value === selectedValue
            );
            let nextIndex =
              event.key === "ArrowDown"
                ? Math.min(currentIndex + 1, filteredOptions.length - 1)
                : Math.max(currentIndex - 1, 0);
            if (currentIndex === -1) {
              nextIndex = event.key === "ArrowDown" ? 0 : filteredOptions.length - 1;
            }
            const nextOption = filteredOptions[nextIndex];
            if (nextOption && !nextOption.disabled) {
              handleSelect(nextOption);
            }
          }
          break;
        }
        case "Escape": {
          if (isOpen) {
            event.preventDefault();
            setIsOpen(false);
          }
          break;
        }
        default:
          break;
      }
    };

    return (
      <div
        ref={containerRef}
        className={classNames(baseContainer, fullWidth && "w-full", className)}
      >
        <button
          id={id}
          ref={triggerRef}
          name={name}
          type="button"
          className={classNames(
            triggerBase,
            size === "sm" ? "py-1.5 text-sm" : "py-2 text-sm",
            disabled
              ? "cursor-not-allowed border-white/10 text-white/40"
              : hasFocus
              ? "border-white/40 bg-white/10"
              : "border-white/15 hover:border-white/35 hover:bg-white/10"
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          onKeyDown={handleKeyDown}
          onFocus={() => setHasFocus(true)}
          onBlur={() => setHasFocus(false)}
        >
          <div className="flex-1 text-left truncate">
            {selectedOption ? (
              renderValue ? (
                renderValue(selectedOption)
              ) : (
                <span className="font-medium text-white">
                  {selectedOption.label}
                </span>
              )
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </div>
          <svg
            className={classNames(
              "h-4 w-4 flex-shrink-0 text-gray-300 transition-transform",
              isOpen ? "rotate-180" : "rotate-0"
            )}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {isOpen && (
          <div
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            className={classNames(
              dropdownBase,
              effectivePlacement === "top" ? "bottom-full mb-2" : "top-full"
            )}
          >
            {allowSearch && (
              <div className="p-3 border-b border-white/10">
                <input
                  autoFocus
                  type="text"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-white/40 focus:outline-none focus:ring-0"
                />
              </div>
            )}
            <ul className="py-1">
              {filteredOptions.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-gray-400">
                  {emptyState}
                </li>
              )}
              {filteredOptions.map((option) => {
                const isSelected = option.value === selectedValue;
                const optionClass = classNames(
                  optionBase,
                  option.disabled
                    ? "cursor-not-allowed text-gray-500"
                    : isSelected
                    ? "bg-white/15 border-l-2 border-emerald-400 text-white"
                    : "text-gray-200 hover:bg-white/10"
                );
                return (
                  <li
                    key={option.key}
                    role="option"
                    aria-selected={isSelected}
                    className={optionClass}
                    onClick={() => handleSelect(option)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleSelect(option);
                      }
                    }}
                  >
                    {renderOption ? (
                      renderOption(option, { isSelected })
                    ) : (
                      <>
                        <span className="font-medium">{option.label}</span>
                        {option.description && (
                          <span className="text-xs text-gray-400">
                            {option.description}
                          </span>
                        )}
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    );
  }
);

CustomSelect.displayName = "CustomSelect";

export default CustomSelect;

