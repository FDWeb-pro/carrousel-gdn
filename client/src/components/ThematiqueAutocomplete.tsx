import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThematiqueAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function ThematiqueAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Ex: Intelligence Artificielle, Transformation digitale...",
  className 
}: ThematiqueAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search term to avoid too many requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(value);
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  const { data: searchResults = [] } = trpc.thematiques.search.useQuery(
    { searchTerm: debouncedSearchTerm },
    { enabled: debouncedSearchTerm.length > 0 && open }
  );

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    if (newValue.length > 0) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  const handleInputFocus = () => {
    // Don't open automatically on focus, only when typing
  };

  const handleInputBlur = () => {
    // Delay closing to allow click on suggestions
    setTimeout(() => setOpen(false), 200);
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        className={className}
      />
      {open && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md">
          <Command>
            <CommandList>
              <CommandGroup heading="Thématiques existantes">
                {searchResults.map((thematique) => (
                  <CommandItem
                    key={thematique.id}
                    value={thematique.name}
                    onSelect={() => handleSelect(thematique.name)}
                    onMouseDown={(e) => e.preventDefault()} // Prevent blur
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === thematique.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {thematique.name}
                    <span className="ml-auto text-xs text-muted-foreground">
                      ({thematique.usageCount} utilisations)
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
