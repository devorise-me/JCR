"use client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EventsSchema } from "@/schemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createEventAction } from "@/Actions/Events";
import { FaTimes } from "react-icons/fa";

export const CreateEventForm = ({
  className,
  onClose,
  onEventAdded,
}: {
  className?: string;
  onClose: () => void;
  onEventAdded: () => void;
}) => {

  const form = useForm<z.infer<typeof EventsSchema>>({
    resolver: zodResolver(EventsSchema),
    defaultValues: {
      name: "",
      StartDate: new Date(),
      EndDate: new Date(),
      type: "International",
      startTime: "00:00",
      endTime: "00:00"
    },
  });

  const onSubmit = async (values: z.infer<typeof EventsSchema>) => {
    try {
      const startDateTime = new Date(`${new Date(values.StartDate).toISOString().split('T')[0]}T${values.startTime}:00.000Z`);
      const endDateTime = new Date(`${new Date(values.EndDate).toISOString().split('T')[0]}T${values.endTime}:00.000Z`);

      const newValues = {
        ...values,
        StartDate: startDateTime,
        EndDate: endDateTime
      };

      await createEventAction(newValues);
      onEventAdded();
    } catch (error) {
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-white/50 z-50 flex items-center justify-center ${className}`}
    >
      <div className="relative p-6 bg-white rounded-lg shadow-lg max-w-lg w-full flex flex-col items-center justify-center">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 left-2 text-gray-500 hover:text-gray-700"
        >
          <FaTimes size={20} />
        </button>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 w-full"
          >
            <div className="space-y-4 text-right w-full">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-end">
                      : اسم الفعالية
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        {...field}
                        placeholder="اسم الفعالية"
                        className="outline-none border-t-0 border-r-0 border-l-0 text-right focus:outline-none focus:ring-0 focus:border-transparent"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-end">
                      : نوع الفعالية
                    </FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="outline-none border-t-0 border-b w-full pb-2 border-r-0 border-l-0 text-right focus:outline-none focus:ring-0 focus:border-transparent"
                      >
                        <option value="International">الدولية</option>
                        <option value="National">المحلية</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name="StartDate"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="flex items-center justify-end">
                        : تاريخ البداية
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={
                            field.value && !isNaN(new Date(field.value).getTime())
                              ? new Date(field.value).toISOString().split("T")[0]
                              : ""
                          }
                          onChange={(e) => {
                            const newDate = new Date(e.target.value);
                            if (!isNaN(newDate.getTime())) {
                              field.onChange(newDate);
                            }
                          }}
                          className="outline-none border-t-0 border-r-0 border-l-0 flex items-center justify-end"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="flex items-center justify-end">
                        : وقت البداية
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          className="outline-none border-t-0 border-r-0 border-l-0 flex items-center justify-end"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name="EndDate"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="flex items-center justify-end">
                        : تاريخ النهاية
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={
                            field.value && !isNaN(new Date(field.value).getTime())
                              ? new Date(field.value).toISOString().split("T")[0]
                              : ""
                          }
                          onChange={(e) => {
                            const newDate = new Date(e.target.value);
                            if (!isNaN(newDate.getTime())) {
                              field.onChange(newDate);
                            }
                          }}
                          className="outline-none border-t-0 border-r-0 border-l-0 flex items-center justify-end"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="flex items-center justify-end">
                        : وقت النهاية
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          className="outline-none border-t-0 border-r-0 border-l-0 flex items-center justify-end"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <Button type="submit">إنشاء الفعالية</Button>
          </form>
        </Form>
      </div>
    </div>
  );
};
