"use client";
import { useState } from "react";
import SearchBar from "@/components/admin/SearchBar";
import { RedirectButton } from "@/components/auth/redirect-button";
import { ShowUsers } from "@/components/Tabels/usersTabel";
import { Button } from "@/components/ui/button";
import { FaPlus } from "react-icons/fa";
 import ExcelJS from 'exceljs';

const UsersPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<'general' | 'camelId'>('general');

 // The function must be async to handle file generation
const exportToExcel = async () => {
  try {
    // 1. Find the table element in the DOM
    const table = document.getElementById("myUsers");
    if (!table) {
      // Use 'throw' to be caught by the catch block for consistent error handling
      throw new Error("Table element with ID 'myUsers' not found.");
    }

    // 2. Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    // 3. Parse headers from <thead>
    const headers = Array.from(table.querySelectorAll('thead tr th')).map(th => (th as HTMLElement).innerText);
    if (headers.length === 0) {
      throw new Error("Table has no headers (<thead>). Cannot generate a valid Excel file.");
    }

    // 4. Define columns in the worksheet
    worksheet.columns = headers.map(header => ({
      header: header,
      key: header.toLowerCase().replace(/[^a-z0-9]/gi, ''), // Create a safe key
      width: 25 // Adjust width as needed
    }));

    // 5. Parse data rows from <tbody>
    const rows = Array.from(table.querySelectorAll('tbody tr')).map(tr =>
      Array.from(tr.querySelectorAll('td')).map(td => td.innerText)
    );

    // 6. Add the data to the worksheet
    rows.forEach(rowData => {
      const rowObject: Record<string, any> = {};
      worksheet.columns.forEach((column, index) => {
        if (typeof column.key === "string") {
          rowObject[column.key] = rowData[index];
        }
      });
      worksheet.addRow(rowObject);
    });

    // 7. Style the header row to make it stand out
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF007BFF' } // A nice blue color
    };

    // 8. Generate the file and trigger the download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "users-data.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (err) {
    // Catch any error from the process and display it
    console.error("Error exporting to Excel:", err);
    if (err instanceof Error) {
      setError(err.message || "An error occurred while exporting to Excel.");
    } else {
      setError("An error occurred while exporting to Excel.");
    }
  }
};

  return (
    <div className="flex flex-1 h-screen">
      <div className="p-2 md:p-5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        <div className="flex">
          <div className="h-20 w-full rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center py-1 px-4 gap-2">
            <RedirectButton path="/auth/register">
              <Button>
                <FaPlus /> انشاء مستخدم
              </Button>
            </RedirectButton>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              searchType={searchType}
              onSearchTypeChange={setSearchType}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-1 min-h-0">
          <div className="h-full w-full rounded-lg bg-gray-100 dark:bg-neutral-800 flex flex-col py-1 px-4">
            <div className="flex flex-row-reverse items-center justify-between">
              <h2 className="w-full flex justify-end text-3xl font-semibold my-2">
                : المستخدمين
              </h2>
              <Button
                variant="outline"
                className="mr-5"
                onClick={exportToExcel}
              >
                طباعة البيانات
              </Button>
            </div>
            <div className="flex-1 min-h-0 bg-gray-200 dark:bg-neutral-700 rounded-lg p-2">
              <ShowUsers searchTerm={searchTerm} searchType={searchType} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;