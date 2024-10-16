"use client";

import { FcGoogle } from "react-icons/fc";
import { Button } from "../ui/button";

export const Social = () => {
  return (
    <div className="flex items-center w-full gap-x-2">
      <Button variant="outline" className="w-full" size="lg" onClick={() => {}}>
        <FcGoogle className="w-5 h-5" />
      </Button>
    </div>
  );
};
