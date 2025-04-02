import { z } from 'zod';
import { InsertOrder, Order, OrderItem, TrackingUpdate } from '@shared/schema';

// Define the item schema
const airtableItemSchema = z.object({
  productName: z.string(),
  sku: z.string(),
  quantity: z.number(),
  price: z.string(),
  total: z.string(),
});

// Define the tracking update schema
const airtableTrackingUpdateSchema = z.object({
  status: z.string(),
  date: z.string(),
  timestamp: z.string(),
  icon: z.string(),
});

// Define the Airtable record schema
const airtableOrderSchema = z.object({
  id: z.string(),
  fields: z.object({
    orderNumber: z.string(),
    status: z.string(),
    orderDate: z.string(),
    customerName: z.string(),
    shippingAddress: z.string(),
    shippingMethod: z.string(),
    trackingNumber: z.string().nullable(),
    subtotal: z.string(),
    shipping: z.string(),
    tax: z.string(),
    total: z.string(),
    items: z.array(airtableItemSchema).optional(),
    trackingUpdates: z.array(airtableTrackingUpdateSchema).optional(),
  }),
});

type AirtableOrder = z.infer<typeof airtableOrderSchema>;

// Airtable API credentials from environment variables
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || "";
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || "";
const TABLE_NAME = process.env.TABLE_NAME || "Table 1";
const FIELD_NAME = process.env.FIELD_NAME || "orderNumber";

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
  
  // Process items from Airtable
  const items: OrderItem[] = (fields.items && fields.items.length > 0) 
    ? fields.items.map(item => ({
        productName: item.productName,
        sku: item.sku,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      }))
    : [];

  // Process tracking updates from Airtable
  const trackingUpdates: TrackingUpdate[] = (fields.trackingUpdates && fields.trackingUpdates.length > 0)
    ? fields.trackingUpdates.map(update => ({
        status: update.status,
        date: update.date,
        timestamp: update.timestamp,
        icon: update.icon,
      }))
    : [];

  // Create the order object with data from Airtable
  return {
    id: 0, // Will be replaced by storage.ts
    orderNumber: fields.orderNumber,
    status: fields.status,
    orderDate: new Date(fields.orderDate),
    customerName: fields.customerName,
    shippingAddress: fields.shippingAddress,
    shippingMethod: fields.shippingMethod,
    trackingNumber: fields.trackingNumber,
    subtotal: fields.subtotal,
    shipping: fields.shipping,
    tax: fields.tax,
    total: fields.total,
    items: items as unknown as any,
    trackingUpdates: trackingUpdates as unknown as any,
    airtableId: airtableOrder.id,
  };
}
