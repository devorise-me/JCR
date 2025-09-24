"use client";
import { RegisteredCamelsTable } from "@/components/Tabels/RegisteredCamelsTabel";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import ExcelJS from 'exceljs';

const Page = () => {
  const [error, setError] = useState<string | null>(null);

  const exportToExcel = () => {
    const table = document.getElementById("RegisteredCamels");
    if (!table) {
      setError("Table element not found.");
      return;
    }
  
    try {
      // Create an array to hold the rows for the new Excel sheet
      const newData = [];
      const rows = table.getElementsByTagName("tr");
  
      // Add header row
      const headerRow = Array.from(rows[0].children).map((cell) => cell.textContent); // استخدام textContent لاستخراج النص
      newData.push(headerRow);
  
      // Add data rows
      for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].children;
        const rowData = Array.from(cells).map((cell) => cell.textContent); // استخدام textContent لاستخراج النص
        newData.push(rowData);
      }
  
      // Create a worksheet from the new data
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");

      // Add the data to the worksheet
      newData.forEach((row) => {
        worksheet.addRow(row);
      });
 
      // Export the workbook to a file
      workbook.xlsx.writeFile(  "registered-camels-data.xlsx");
    } catch (err) {
      console.error("Error exporting to Excel:", err);
      setError("An error occurred while exporting to Excel.");
    }
  };
  

  return (
    <div className="flex flex-1 h-screen" dir="rtl">
      <div className="p-2 md:p-5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        <div className="flex flex-col gap-2 h-full">
          <div className="h-full w-full rounded-lg bg-gray-100 dark:bg-neutral-800 flex flex-col py-1 px-4">
            <div className="flex flex-row items-center justify-between">
              <h2 className="w-full flex justify-start text-3xl font-semibold my-2">
                : الهجن المسجلة{" "}
              </h2>
              <Button className="ml-5" onClick={exportToExcel}>
                طباعة البيانات
              </Button>
            </div>
            <div className="w-full h-full bg-gray-200 rounded-lg p-2 overflow-y-auto">
              <RegisteredCamelsTable />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;

