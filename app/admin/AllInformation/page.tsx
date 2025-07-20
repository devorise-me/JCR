"use client";
import React, { useEffect, useMemo, useState } from "react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { Button } from "@/components/ui/button";

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

function translateSex(sex: string) {
  switch (sex) {
    case "Male": return "قعدان";
    case "Female": return "بكار";
    default: return sex;
  }
}
function translateAge(age: string) {
  switch (age) {
    case "GradeOne": return "مفرد";
    case "GradeTwo": return "حقايق";
    case "GradeThree": return "لقايا";
    case "GradeFour": return "جذاع";
    case "GradeFive": return "ثنايا";
    case "GradeSixMale": return "زمول";
    case "GradeSixFemale": return "حيل";
    default: return age;
  }
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
