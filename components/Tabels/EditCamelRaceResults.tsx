"use client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ReportForm from "./CamelsResultsTabe";

const EditRaceResultPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (id) {
      const fetchResult = async () => {
        const response = await fetch(`/api/results/${id}`);
        const data = await response.json();
        setResult(data);
      };

      fetchResult();
    }
  }, [id]);

  const handleSubmit = async (data: any) => {
    await fetch(`/api/results/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    router.push("/admin/race-results");
  };

  if (!result) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Edit Race Result</h1>
      <ReportForm />
    </div>
  );
};

export default EditRaceResultPage;
