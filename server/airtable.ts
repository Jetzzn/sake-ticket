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
    status: z.string().optional().default("Processing"),
    orderDate: z.string().optional().default(new Date().toISOString()),
    customerName: z.string().optional().default("Customer"),
    shippingAddress: z.string().optional().default("123 Main St, City, Country"),
    shippingMethod: z.string().optional().default("Standard Shipping"),
    trackingNumber: z.string().nullable().optional().default(null),
    subtotal: z.string().optional().default("$0.00"),
    shipping: z.string().optional().default("$0.00"),
    tax: z.string().optional().default("$0.00"),
    total: z.string().optional().default("$0.00"),
    items: z.array(airtableItemSchema).optional().default([]),
    trackingUpdates: z.array(airtableTrackingUpdateSchema).optional().default([]),
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
  
  // Create sample items if not available
  const items: OrderItem[] = (fields.items && fields.items.length > 0) 
    ? fields.items.map(item => ({
        productName: item.productName,
        sku: item.sku,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      }))
    : [
        {
          productName: "Sample Product",
          sku: "SKU-12345",
          quantity: 1,
          price: "$24.99",
          total: "$24.99"
        }
      ];

  // Convert tracking updates if they exist
  const trackingUpdates: TrackingUpdate[] = (fields.trackingUpdates && fields.trackingUpdates.length > 0)
    ? fields.trackingUpdates.map(update => ({
        status: update.status,
        date: update.date,
        timestamp: update.timestamp,
        icon: update.icon,
      }))
    : [
        {
          status: "Order Received",
          date: new Date().toLocaleDateString(),
          timestamp: new Date().toISOString(),
          icon: "package" 
        }
      ];

  // Create the order object with properly typed field values
  const order = {
    id: 0, // Add id to match the Order type
    orderNumber: fields.orderNumber,
    status: fields.status || "Processing",
    orderDate: new Date(fields.orderDate || new Date().toISOString()),
    customerName: fields.customerName || "Customer",
    shippingAddress: fields.shippingAddress || "123 Main St, City, Country",
    shippingMethod: fields.shippingMethod || "Standard Shipping",
    trackingNumber: fields.trackingNumber ?? null,
    subtotal: fields.subtotal || "$0.00",
    shipping: fields.shipping || "$0.00",
    tax: fields.tax || "$0.00",
    total: fields.total || "$0.00",
    items: items as unknown as any, // Cast to satisfy jsonb type
    trackingUpdates: trackingUpdates as unknown as any, // Cast to satisfy jsonb type
    airtableId: airtableOrder.id,
  };

  // Return the order with correct typing
  return order as Order;
}
