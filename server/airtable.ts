import { z } from 'zod';
import { InsertOrder, Order, OrderItem, TrackingUpdate } from '@shared/schema';

// Define the Airtable record schema based on actual Airtable fields
const airtableOrderSchema = z.object({
  id: z.string(),
  fields: z.object({
    orderNumber: z.string(),
    recipientName: z.string().optional().default(""),
    phoneNumber: z.string().optional().default(""),
    email: z.string().optional().default(""),
    totalPrice: z.string().optional().default("0"),
    orderItemsSummary: z.string().optional().default(""),
  }),
});

type AirtableOrder = z.infer<typeof airtableOrderSchema>;

// Airtable API credentials
const AIRTABLE_API_KEY = "patTHltTr3vda9aDG.2df10985569ad6dca6d185bbf3f99e94e8c1d92e0dcef804dea82709627a5180";
const AIRTABLE_BASE_ID = "appTywnuzq68a91t9";
const TABLE_NAME = "Table 1";
const FIELD_NAME = "orderNumber";

// Function to fetch an order from Airtable by order number
export async function fetchOrderFromAirtable(orderNumber: string): Promise<Order | null> {
  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(TABLE_NAME)}?filterByFormula={${FIELD_NAME}}="${encodeURIComponent(orderNumber)}"`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.records || data.records.length === 0) {
      return null;
    }

    // Validate the response
    const validatedRecord = airtableOrderSchema.parse(data.records[0]);
    
    // Convert to our Order format
    return convertAirtableOrderToOrder(validatedRecord);
  } catch (error) {
    console.error('Error fetching order from Airtable:', error);
    throw error;
  }
}

// Convert Airtable order format to our application's Order format
function convertAirtableOrderToOrder(airtableOrder: AirtableOrder): Order {
  const fields = airtableOrder.fields;
  
  // Create items from orderItemsSummary if available
  let items: OrderItem[] = [];
  if (fields.orderItemsSummary) {
    // Create a single item with the summary
    items = [
      {
        productName: fields.orderItemsSummary,
        sku: "SKU-" + fields.orderNumber,
        quantity: 1,
        price: fields.totalPrice || "0",
        total: fields.totalPrice || "0"
      }
    ];
  } else {
    // Default item if no order items summary
    items = [
      {
        productName: "Order Item",
        sku: "SKU-" + fields.orderNumber,
        quantity: 1,
        price: fields.totalPrice || "0",
        total: fields.totalPrice || "0"
      }
    ];
  }

  // Create a default tracking update
  const trackingUpdates: TrackingUpdate[] = [
    {
      status: "Order Received",
      date: new Date().toLocaleDateString(),
      timestamp: new Date().toISOString(),
      icon: "package" 
    }
  ];

  // Create the InsertOrder object with properly mapped fields
  const insertOrder: InsertOrder = {
    orderNumber: fields.orderNumber,
    status: "Processing", // Default status
    orderDate: new Date(), // Current date as default
    customerName: fields.recipientName || "Customer",
    shippingAddress: fields.email || "-",
    shippingMethod: "Standard Shipping", // Default shipping method
    trackingNumber: fields.phoneNumber ? fields.phoneNumber : null, // Ensure it's string | null
    subtotal: fields.totalPrice || "0",
    shipping: "0",
    tax: "0",
    total: fields.totalPrice || "0",
    items: items as unknown as any, // Cast to satisfy jsonb type
    trackingUpdates: trackingUpdates as unknown as any, // Cast to satisfy jsonb type
    airtableId: airtableOrder.id,
  };

  // Force cast to Order type
  return { 
    id: 0,
    ...insertOrder
  } as unknown as Order;
}
