import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type FilterType = 'all' | 'REAL' | 'FAKE';

interface HistoryFilterProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const HistoryFilter = ({ filter, onFilterChange }: HistoryFilterProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs gap-1">
          <Filter className="w-3 h-3" />
          {filter === 'all' ? 'All' : filter}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup value={filter} onValueChange={(v) => onFilterChange(v as FilterType)}>
          <DropdownMenuRadioItem value="all">All Results</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="REAL">
            <span className="text-success">REAL Only</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="FAKE">
            <span className="text-destructive">FAKE Only</span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HistoryFilter;
