"use client";
import React, { useEffect, useMemo, useState } from "react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { Button } from "@/components/ui/button";
import { translateAge, translateSex } from "@/lib/helper";
import * as XLSX from "xlsx";

interface Camel {
  id: number;
  name: string;
  camelID: string;
  age: string;
  sex: string;
  ownerId: string;
  owner: {
    id: string;
    FirstName: string;
    FamilyName: string;
    username: string;
    email: string;
  };
}


export const AllInformationPage = () => {
  const [data, setData] = useState<Camel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/camels")
      .then((res) => res.json())
      .then((data) => setData(data))
      .finally(() => setLoading(false));
  }, []);

  const handleExportToExcel = () => {
    // Prepare data for export with translations
    const exportData = data.map((camel) => ({
      "#ID": camel.id,
      "رقم الشريحة": camel.camelID,
      "الفئة": translateAge(camel.age),
      "النوع": translateSex(camel.sex),
      "اسم المستخدم": camel.owner?.username ?? "",
      "اسم المطية": camel.name,
      "البريد الإلكتروني": camel.owner?.email ?? "",
    }));

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "جميع المعلومات");

    // Generate Excel file and download
    XLSX.writeFile(workbook, `جميع_المعلومات_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const columns = useMemo<MRT_ColumnDef<Camel>[]>(
    () => [
      { accessorKey: "id", header: "#ID", size: 60 },
      { accessorKey: "camelID", header: "رقم الشريحة" },
      {
        accessorKey: "age",
        header: "الفئة",
        Cell: ({ cell }) => translateAge(cell.getValue<string>()),
      },
      {
        accessorKey: "sex",
        header: "النوع",
        Cell: ({ cell }) => translateSex(cell.getValue<string>()),
      },
      {
        accessorKey: "owner.username",
        header: "اسم المستخدم",
        Cell: ({ row }) => row.original.owner?.username ?? "",
      },
      { accessorKey: "name", header: "اسم المطية" },
      {
        accessorKey: "owner.email",
        header: "البريد الإلكتروني",
        Cell: ({ row }) => row.original.owner?.email ?? "",
      },

    ],
    []
  );

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-end">
        <Button
          onClick={handleExportToExcel}
          disabled={loading || data.length === 0}
          className="bg-green-600 hover:bg-green-700"
        >
          تصدير إلى Excel
        </Button>
      </div>
      <MaterialReactTable
        columns={columns}
        data={data}
        state={{ isLoading: loading }}
        enableColumnFilters
        enableGlobalFilter
        enableSorting
        enablePagination
        enableRowNumbers
        muiTablePaperProps={{ sx: { borderRadius: 2 } }}
        muiTableContainerProps={{ sx: { maxHeight: "80vh" } }}
        initialState={{ pagination: { pageIndex: 0, pageSize: 20 } }}
        localization={{
          // You can add Arabic localization here if you want
        }}
      />
    </div>
  );
};

export default AllInformationPage;
