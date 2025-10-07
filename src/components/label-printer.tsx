'use client';

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Upload, Printer, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LabelCard } from './label-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";

type LabelData = {
  id: string;
  name: string;
};

const toProperCase = (str: string) => {
  return str.trim()
    .split(' ')
    .map(word => {
      // Giữ nguyên các từ viết tắt (2-3 ký tự in hoa)
      if (word.length <= 3 && word === word.toUpperCase()) {
        return word;
      }
      // Chuyển đổi proper case cho các từ thường
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ')
    .replace(/\s+/g, ' '); // Loại bỏ khoảng trắng thừa
};

export function LabelPrinter() {
  const [labels, setLabels] = useState<LabelData[]>([]);
  const [fileName, setFileName] = useState('');
  const { toast } = useToast();

  // Removed automatic font scaling to prevent text from becoming blurry


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setLabels([]);
    if (!file) {
      setFileName('');
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        
        if (json.length < 2) {
          toast({ variant: "destructive", title: "Error", description: "Excel file seems to be empty or has no data rows." });
          return;
        }

        const parsedLabels = json
          .slice(1)
          .map((row) => ({
            id: row && row[0] ? String(row[0]) : '',
            name: row && row[1] ? toProperCase(String(row[1])) : '',
          }))
          .filter((item) => item.id && item.name);

        if (parsedLabels.length === 0) {
            toast({ variant: "destructive", title: "Error", description: "No valid data found in columns A and B. Make sure the first row is a header." });
            return;
        }

        setLabels(parsedLabels);
        toast({ title: "Success", description: `Successfully imported ${parsedLabels.length} labels.` });
      } catch (err) {
        console.error("Error parsing Excel file:", err);
        toast({ variant: "destructive", title: "Parsing Error", description: "Failed to parse the Excel file. Please ensure it is a valid .xlsx or .xls file." });
      }
    };
    reader.onerror = () => {
        toast({ variant: "destructive", title: "File Error", description: "Failed to read the file." });
    }
    reader.readAsArrayBuffer(file);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="no-print">
        <header className="text-center">
          <h1 className="text-5xl font-bold tracking-tight">Label Printer</h1>
          <p className="text-muted-foreground mt-2 text-lg">Import an Excel file to generate and print labels for envelopes.</p>
        </header>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>1. Upload Your File</CardTitle>
            <CardDescription>
              Select an Excel (.xlsx, .xls) file. Data should be in the first sheet with ID in Column A and Name in Column B. The first row is assumed to be a header and will be skipped.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <label htmlFor="excel-upload" className="flex-grow w-full">
                  <div className="flex items-center gap-2 border-2 border-dashed rounded-md p-4 hover:bg-muted cursor-pointer transition-colors">
                      <FileText className="h-6 w-6 text-muted-foreground"/>
                      <span className="text-muted-foreground">{fileName || 'Click to upload your Excel file'}</span>
                  </div>
                  <Input id="excel-upload" type="file" accept=".xlsx, .xls" onChange={handleFileChange} className="sr-only"/>
                </label>
                <Button onClick={handlePrint} disabled={labels.length === 0} className="w-full sm:w-auto">
                  <Printer className="mr-2 h-4 w-4" />
                  2. Print Labels
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div id="print-area">
        <h2 className="text-lg font-semibold mb-4 no-print">Print Preview</h2>
        <div className="a4-preview bg-white shadow-lg rounded-lg p-8 mx-auto w-full aspect-[210/297]">
          {labels.length > 0 ? (
            <div className="flex flex-col items-center space-y-2">
              {labels.map((label, index) => (
                <LabelCard key={index} id={label.id} name={label.name} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg bg-muted/50 no-print">
              <div className="text-center text-muted-foreground">
                <Upload className="mx-auto h-12 w-12" />
                <p className="mt-4 font-semibold">Label preview will appear here</p>
                <p className="text-sm">Upload a file to get started.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
