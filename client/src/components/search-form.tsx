import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Phone } from "lucide-react";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Schema for phone number validation
const searchSchema = z.object({
  phoneNumber: z.string()
    .min(1, "หมายเลขโทรศัพท์จำเป็นต้องระบุ")
    .regex(/^[0-9]+$/, "รูปแบบหมายเลขโทรศัพท์ไม่ถูกต้อง")
});

type SearchFormValues = z.infer<typeof searchSchema>;

export default function SearchForm() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      phoneNumber: ""
    }
  });

  // Handle form submission
  const onSubmit = (data: SearchFormValues) => {
    setIsSubmitting(true);
    
    // Navigate to the order page using the entered phone number
    navigate(`/order/${data.phoneNumber}`);
    
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>หมายเลขโทรศัพท์</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      placeholder="กรุณาใส่หมายเลขโทรศัพท์ (เช่น 0812345678)"
                      className="pl-10"
                      {...field}
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          
          <div className="flex items-center justify-between">
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "กำลังค้นหา..." : "ค้นหาคำสั่งซื้อ"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
