import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface ExportButtonsProps {
  data: any[];
  filename: string;
  sheetName?: string;
}

export function ExportButtons({ data, filename, sheetName = "Data" }: ExportButtonsProps) {
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
    saveAs(dataBlob, `${filename}.xlsx`);
  };

  const exportToCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    const dataBlob = new Blob([csvOutput], { type: "text/csv;charset=utf-8" });
    saveAs(dataBlob, `${filename}.csv`);
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={exportToExcel}
        className="gap-2 border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
      >
        <FileSpreadsheet className="w-4 h-4" />
        Excel
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={exportToCSV}
        className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
      >
        <FileText className="w-4 h-4" />
        CSV
      </Button>
    </div>
  );
}
