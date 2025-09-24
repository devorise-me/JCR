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
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";

export const LoginForm = () => {
  const [error, setErrors] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="w-full max-w-md mx-auto">
      <CardWrapper
        heading="🐪 تسجيل الدخول"
        headerLabel="أهلاً بك من جديد!"
        showSocial
      >
        {/* Back Button */}
        <RedirectButton className="absolute top-4 left-4 p-2 rounded-xl glass-morphism glass-morphism-hover transition-all duration-300 hover:scale-110" path="/">
          <ArrowLeft size={20} className="text-gray-600" />
        </RedirectButton>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-5 text-right">
              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="flex items-center justify-end gap-2 text-gray-700 font-medium">
                      <Mail size={18} className="text-blue-500" />
                      البريد الإلكتروني
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          disabled={isPending}
                          type="email"
                          {...field}
                          placeholder="أدخل بريدك الإلكتروني"
                          className="input-modern text-right pr-12 pl-4 h-12 text-lg"
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <Mail size={20} className="text-gray-400" />
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage className="text-right" />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="flex items-center justify-end gap-2 text-gray-700 font-medium">
                      <Lock size={18} className="text-purple-500" />
                      كلمة المرور
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          disabled={isPending}
                          type={showPassword ? "text" : "password"}
                          {...field}
                          placeholder="أدخل كلمة المرور"
                          className="input-modern text-right pr-12 pl-12 h-12 text-lg"
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <Lock size={20} className="text-gray-400" />
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                        >
                          {showPassword ? (
                            <EyeOff size={20} className="text-gray-400" />
                          ) : (
                            <Eye size={20} className="text-gray-400" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-right" />
                  </FormItem>
                )}
              />
            </div>

            {/* Error and Success Messages */}
            <div className="space-y-3">
              <FormError message={error} />
              <FormSuccess message={success} />
            </div>

            {/* Submit Button */}
            <Button
              disabled={isPending}
              type="submit"
              className="btn-modern w-full h-12 text-lg font-semibold relative overflow-hidden group"
            >
              {isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="loading-spinner w-5 h-5"></div>
                  <span>جاري تسجيل الدخول...</span>
                </div>
              ) : (
                <span>تسجيل الدخول</span>
              )}
              
              {/* Button Animation Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </Button>

            {/* Additional Links */}
            <div className="text-center space-y-3 pt-4">
              <p className="text-gray-600">
                ليس لديك حساب؟{" "}
                <RedirectButton path="/auth/register">
                  <span className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer transition-colors duration-200">
                    إنشاء حساب جديد
                  </span>
                </RedirectButton>
              </p>
            </div>
          </form>
        </Form>
      </CardWrapper>
    </div>
  );
};
