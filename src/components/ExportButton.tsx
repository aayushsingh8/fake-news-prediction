import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AnalysisRecord, exportToCSV, exportToPDF } from "@/lib/exportUtils";
import { useToast } from "@/hooks/use-toast";

interface ExportButtonProps {
  records: AnalysisRecord[];
  title?: string;
}

const ExportButton = ({ records, title = 'Analysis History' }: ExportButtonProps) => {
  const { toast } = useToast();

  const handleExportCSV = () => {
    if (records.length === 0) {
      toast({
        title: "No Data",
        description: "No records to export",
        variant: "destructive",
      });
      return;
    }
    exportToCSV(records, title.toLowerCase().replace(/\s+/g, '-'));
    toast({
      title: "Exported",
      description: `${records.length} records exported to CSV`,
    });
  };

  const handleExportPDF = () => {
    if (records.length === 0) {
      toast({
        title: "No Data",
        description: "No records to export",
        variant: "destructive",
      });
      return;
    }
    exportToPDF(records, title);
    toast({
      title: "Exported",
      description: `${records.length} records exported to PDF`,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs gap-1">
          <Download className="w-3 h-3" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleExportCSV}>
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF}>
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButton;
