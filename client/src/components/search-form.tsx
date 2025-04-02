import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Search } from "lucide-react";
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

// Schema for order number validation
const searchSchema = z.object({
  orderNumber: z.string()
    .min(1, "Order number is required")
    .regex(/^[A-Za-z0-9-]+$/, "Invalid order number format")
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
      orderNumber: ""
    }
  });

  // Handle form submission
  const onSubmit = (data: SearchFormValues) => {
    setIsSubmitting(true);
    
    // Navigate to the order page using the entered order number
    navigate(`/order/${data.orderNumber}`);
    
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="orderNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order Number</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      placeholder="Enter order number (e.g., ORD-12345)"
                      className="pl-10"
                      {...field}
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          
          <div className="flex items-center justify-between">
            <a 
              href="#" 
              className="text-sm font-medium text-primary hover:text-blue-700"
            >
              Don't have an order number?
            </a>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Searching..." : "Search Order"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
