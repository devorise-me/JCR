import { RegisterForm } from "@/components/auth/register-form";

const page = () => {
  return (
    <div className="relative w-full min-h-screen h-fit flex items-center justify-center bg-black bg-transparent bg-[url('/petra.jpg')] bg-no-repeat bg-cover bg-center">
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent"></div>

      <div className="relative z-10 my-10">
        <RegisterForm />
      </div>
    </div>
  );
};

export default page;
