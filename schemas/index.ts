import * as z from "zod";

export const LoginSchema = z.object({
  email: z.string().email({
    message: "البريد الالكتروني مطلوب",
  }).toLowerCase(),
  password: z.string().min(1, {
    message: "كلمة المرور مطلوبة",
  }),
});

export const RegisterSchema = z
  .object({
    FirstName: z
      .string({
        message: "الاسم مطلوب",
      })
      .min(1, {
        message: "الاسم مطلوب",
      })
      .optional(),
    FatherName: z
      .string({
        message: "اسم الاب مطلوب",
      })
      .min(1, {
        message: "اسم الاب مطلوب",
      })
      .optional(),
    GrandFatherName: z
      .string({
        message: "اسم الجد مطلوب",
      })
      .min(1, {
        message: "اسم الجد مطلوب",
      })
      .optional(),
    FamilyName: z
      .string({
        message: "اسم العائلة مطلوب",
      })
      .min(1, {
        message: "اسم العائلة مطلوب",
      })
      .optional(),
    username: z
      .string({
        message: "اسم المستخدم مطلوب",
      })
      .min(1, {
        message: "اسم المستخدم مطلوب",
      })
      .toLowerCase(),
    email: z.string().email({
      message: "البريد الالكتروني مطلوب",
    }).toLowerCase(),
    NationalID: z
      .string()
      .min(10, {
        message: "الرقم الوطني يجب أن يتكون من 10 ارقام",
      })
      .max(11, {
        message: "الرقم الوطني يجب ألا يتجاوز 11 رقمًا",
      })
      .regex(/^\d+$/, {
        message: "الرقم الوطني يجب أن يتكون من أرقام فقط",
      })
      .optional(),
    BDate: z
      .date({
        message: "تاريخ الميلاد مطلوب",
      })
      .refine((date) => date < new Date(), {
        message: "تاريخ الميلاد يجب أن يكون في الماضي",
      })
      .optional(),
    MobileNumber: z
      .string()
      .min(9, {
        message: "رقم الهاتف يجب أن يتكون من 10 ارقام",
      })
      .max(15, {
        message: "رقم الهاتف يجب ألا يتجاوز 15 رقمًا",
      })
      .regex(/^\+?[0-9]\d{1,14}$/, {
        message: "صيغة رقم الهاتف غير صحيحة",
      })
      .optional(),
    role: z.enum(["USER", "ADMIN", "SUPERVISOR", "RESULTS_EDITOR"]).default("USER"),
    password: z.string().min(6, {
      message: "الطول 6 حروف على الاقل",
    }),
    confirmPassword: z.string().min(6, {
      message: "الطول 6 حروف على الاقل",
    }),
    swiftCode: z
      .string()
      .optional(),
    IBAN: z
      .string()
      .optional(),
    bankName: z
      .string({
        message: "اسم البنك مطلوب",
      })
      .min(1, {
        message: "اسم البنك مطلوب",
      })
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "كلمة المرور وتأكيد كلمة المرور غير متطابقين",
  });

export const UpdateUserSchema = z.object({
  id: z.string(),
  FirstName: z.string().optional(),
  FatherName: z.string().optional(),
  GrandFatherName: z.string().optional(),
  FamilyName: z.string().optional(),
  username: z.string().optional(),
  email: z.string().email().toLowerCase().optional(),
  NationalID: z.string().optional(),
  BDate: z.string().optional(),
  MobileNumber: z.string().optional(),
  role: z.string().optional(),
  password: z.string().optional(),
  swiftCode: z.string().optional(),
  IBAN: z.string().optional(),
  bankName: z.string().optional(),
});

export const EventsSchema = z
  .object({
    name: z.string().min(1, "اسم الفعالية مطلوب"),
    StartDate: z
      .date({
        required_error: "تاريخ البدء مطلوب",
      })
      .refine((date) => date > new Date(), {
        message: "تاريخ البدء يجب أن يكون في المستقبل",
      }),
    EndDate: z
      .date({
        required_error: "تاريخ الانتهاء مطلوب",
      })
      .refine((date) => date > new Date(), {
        message: "تاريخ الانتهاء يجب أن يكون في المستقبل",
      }),
    type: z.enum(["International", "National"]),
    startTime: z.string().min(5).max(5),
    endTime: z.string().min(5).max(5),
  })
  .superRefine((data, ctx) => {
    if (data.EndDate <= data.StartDate) {
      ctx.addIssue({
        code: "custom",
        path: ["EndDate"],
        message: "تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء",
      });
    }
  });

export const camelSchema = z.object({
  name: z.string().min(1, "اسم الجمل مطلوب"),
  camelID: z.string().min(1, "رقم الشريحة مطلوب"),
  age: z.enum(
    [
      "GradeOne",
      "GradeTwo",
      "GradeThree",
      "GradeFour",
      "GradeFive",
      "GradeSixMale",
      "GradeSixFemale",
    ],
    {
      invalid_type_error: "العمر غير صحيح",
    }
  ),
  sex: z.enum(["Male", "Female"], {
    invalid_type_error: "الجنس غير صحيح",
  }),
  ownerId: z.string().min(1),
});

export const createLoopSchema = z
  .object({
    capacity: z.number().min(1),
    age: z.enum([
      "GradeOne",
      "GradeTwo",
      "GradeThree",
      "GradeFour",
      "GradeFive",
      "GradeSixMale",
      "GradeSixFemale",
    ]),
    sex: z.enum(["Male", "Female"]),
    time: z
      .enum(["Morning", "Evening", "صباحي", "مسائي"])
      .transform((val) =>
        val === "صباحي" ? "Morning" : val === "مسائي" ? "Evening" : val
      ),
    startRegister: z.string().transform((str) => new Date(str)),
    endRegister: z.string().transform((str) => new Date(str)),
    number: z.number().min(1),
  })
  .superRefine((data, ctx) => {
    if (data.endRegister <= data.startRegister) {
      ctx.addIssue({
        code: "custom",
        path: ["EndDate"],
        message: "تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء",
      });
    }
  });

export const registerCamelSchema = z.object({
  camelId: z.coerce.number().min(1),
  loopId: z.string().min(1),
});

export const raceResultSchema = z.object({
  rank: z.number().min(1),
  eventId: z.string(),
  ownerId: z.string(),
  camelId: z.number(),
  camelID: z.string(), // Adding camelID as a string
  loopId: z.string(),
  IBAN: z.string(),
  bankName: z.string(),
  swiftCode: z.string(),
  ownerName: z.string(),
  NationalID: z.string().optional(), // NationalID remains optional

});
