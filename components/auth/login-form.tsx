"use client";
import { CardWrapper } from "./card-wrapper";
import * as z from "zod";
import { LoginSchema } from "@/schemas";
import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FormError } from "../Forms/form-error";
import { FormSuccess } from "../Forms/form-success";
import { login } from "@/Actions/login";
import { useRouter } from "next/navigation";
import { RedirectButton } from "./redirect-button";
import { IconArrowBack } from "@tabler/icons-react";

export const LoginForm = () => {
  const [error, setErrors] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    setErrors("");
    setSuccess("");
    startTransition(async () => {
      const data = await login(values);
      setErrors(data.error || "");
      setSuccess(data.success || "");

      if (data.token) {
        localStorage.setItem("authToken", data.token);
        if (data.role === "ADMIN" || data.role === "SUPERVISOR") {
          router.push("/admin/dashboard");
        } else {
          router.push("/");
        }
      }
    });
  };

  return (
    <CardWrapper
      heading=" 🐪تـسجيل الدخول"
      headerLabel="! أهلا من جديد"
      showSocial
    >
      <RedirectButton className="cursor-pointer absolute top-2 left-2" path="/">
        <IconArrowBack />
      </RedirectButton>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4 text-right">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-end">
                    : البريد الالكتروني
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      type="email"
                      {...field}
                      placeholder="أدخل بريدك الالكتروني"
                      className="outline-none border-t-0 border-r-0 border-l-0 text-right focus:outline-none focus:ring-0 focus:border-transparent"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-end">
                    : كلمة السر
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      type="password"
                      {...field}
                      placeholder="أدخل كلمة المرور"
                      className="outline-none border-t-0 border-r-0 border-l-0 text-right focus:outline-none focus:ring-0 focus:border-transparent"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button
            disabled={isPending}
            type="submit"
            className="rounded-md w-full"
          >
            تسجيل الدخول
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
