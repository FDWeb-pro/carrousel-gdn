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
  const [searchTerm, setSearchTerm] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: searchResults = [] } = trpc.thematiques.search.useQuery(
    { searchTerm },
    { enabled: searchTerm.length > 0 && open }
  );

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setSearchTerm(selectedValue);
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
    if (newValue.length > 0) {
      setOpen(true);
    }
  };

  const handleInputFocus = () => {
    if (searchTerm.length > 0) {
      setOpen(true);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            ref={inputRef}
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            className={className}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandList>
            {searchResults.length === 0 && searchTerm.length > 0 && (
              <CommandEmpty>
                Aucune thématique trouvée. Tapez pour créer "{searchTerm}"
              </CommandEmpty>
            )}
            {searchResults.length > 0 && (
              <CommandGroup heading="Thématiques existantes">
                {searchResults.map((thematique) => (
                  <CommandItem
                    key={thematique.id}
                    value={thematique.name}
                    onSelect={() => handleSelect(thematique.name)}
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
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
