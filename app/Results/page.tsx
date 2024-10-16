import React from "react";
import Nav from "@/components/Navigation/Nav";
import ResultsTabel from "@/components/Results";

const page = () => {
  return (
    <>
      <Nav />
      <div>
        <ResultsTabel />
      </div>
    </>
  );
};

export default page;
