import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SingleSelectOption {
  value: string;
  label: string;
}

interface SingleSelectProps {
  options: SingleSelectOption[];
  selected?: string;
  value?: string;
  onChange: (selected: string) => void;
  placeholder?: string;
  className?: string;
  enableSearch?: boolean;
}

export function SingleSelect({
  options,
  selected,
  value,
  onChange,
  placeholder = "Sélectionner...",
  className,
  enableSearch = true,
}: SingleSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (value: string) => {
    onChange(value);
    setOpen(false);
  };

  const currentValue = value || selected;
  const selectedOption = options.find((option) => option.value === currentValue);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <div className="flex items-center">
            {!selectedOption ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <span className="text-sm">{selectedOption.label}</span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          {enableSearch && <CommandInput placeholder="Rechercher..." />}
          <CommandList>
            {enableSearch && <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>}
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      currentValue === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}