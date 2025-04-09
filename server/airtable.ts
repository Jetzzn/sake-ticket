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
    orderStatus: z.string().optional().default("FINALIZED"),
    paymentStatus: z.string().optional().default("NO_PAYMENT"),
    receiptLink: z.string().optional(),
  }),
});

type AirtableOrder = z.infer<typeof airtableOrderSchema>;

// Airtable API credentials
const AIRTABLE_API_KEY = "patTHltTr3vda9aDG.2df10985569ad6dca6d185bbf3f99e94e8c1d92e0dcef804dea82709627a5180";
const AIRTABLE_BASE_ID = "appTywnuzq68a91t9";
const TABLE_NAME = "Table 1";
const FIELD_NAME = "orderNumber";
const PHONE_FIELD_NAME = "phoneNumber";

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

// Define an array version of the schema
const airtableOrdersSchema = z.object({
  records: z.array(airtableOrderSchema),
});

// Function to fetch all orders from Airtable by phone number
export async function fetchOrdersFromAirtableByPhone(phoneNumber: string): Promise<Order[]> {
  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(TABLE_NAME)}?filterByFormula={${PHONE_FIELD_NAME}}="${encodeURIComponent(phoneNumber)}"`;
    
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
      return [];
    }

    // Convert each record to our Order format
    const orders: Order[] = [];
    
    for (const record of data.records) {
      try {
        const validatedRecord = airtableOrderSchema.parse(record);
        const order = convertAirtableOrderToOrder(validatedRecord);
        orders.push(order);
      } catch (error) {
        console.error('Error parsing Airtable record:', error);
        // Continue with the next record if one fails
      }
    }
    
    return orders;
  } catch (error) {
    console.error('Error fetching orders from Airtable by phone:', error);
    throw error;
  }
}

// Function to fetch a single order from Airtable by phone number (for backward compatibility)
export async function fetchOrderFromAirtableByPhone(phoneNumber: string): Promise<Order | null> {
  try {
    const orders = await fetchOrdersFromAirtableByPhone(phoneNumber);
    
    if (orders.length === 0) {
      return null;
    }
    
    // Return the first order found (for backward compatibility)
    return orders[0];
  } catch (error) {
    console.error('Error fetching order from Airtable by phone:', error);
    throw error;
  }
}

// Convert Airtable order format to our application's Order format
function convertAirtableOrderToOrder(airtableOrder: AirtableOrder): Order {
  const fields = airtableOrder.fields;
  
  // No need to process items and tracking updates with our simplified schema

  // Create the InsertOrder object with properly mapped fields
  const insertOrder: InsertOrder = {
    orderNumber: fields.orderNumber,
    recipientName: fields.recipientName || "",
    phoneNumber: fields.phoneNumber || "",
    email: fields.email || "",
    totalPrice: fields.totalPrice || "0",
    orderItemsSummary: fields.orderItemsSummary ? JSON.stringify(fields.orderItemsSummary) : JSON.stringify("No items"),
    orderStatus: fields.orderStatus || "FINALIZED",
    paymentStatus: fields.paymentStatus || "NO_PAYMENT",
    receiptLink: fields.receiptLink || null,
    airtableId: airtableOrder.id,
  };

  // Force cast to Order type
  return { 
    id: 0,
    ...insertOrder
  } as unknown as Order;
}
