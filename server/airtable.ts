import { z } from 'zod';
import { InsertOrder, Order, OrderItem, TrackingUpdate } from '@shared/schema';

// Define the Airtable record schema
const airtableOrderSchema = z.object({
  id: z.string(),
  fields: z.object({
    OrderNumber: z.string(),
    Status: z.string(),
    OrderDate: z.string(),
    CustomerName: z.string(),
    ShippingAddress: z.string(),
    ShippingMethod: z.string(),
    TrackingNumber: z.string().optional(),
    Subtotal: z.string(),
    Shipping: z.string(),
    Tax: z.string(),
    Total: z.string(),
    Items: z.array(
      z.object({
        ProductName: z.string(),
        SKU: z.string(),
        Quantity: z.number(),
        Price: z.string(),
        Total: z.string(),
      })
    ),
    TrackingUpdates: z.array(
      z.object({
        Status: z.string(),
        Date: z.string(),
        Timestamp: z.string(),
        Icon: z.string(),
      })
    ).optional(),
  }),
});

type AirtableOrder = z.infer<typeof airtableOrderSchema>;

// Function to fetch an order from Airtable by order number
export async function fetchOrderFromAirtable(orderNumber: string): Promise<Order | null> {
  try {
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableName = process.env.AIRTABLE_TABLE_NAME || 'Orders';
    
    if (!apiKey || !baseId) {
      throw new Error('Airtable credentials not configured');
    }

    const url = `https://api.airtable.com/v0/${baseId}/${tableName}?filterByFormula={OrderNumber}="${encodeURIComponent(orderNumber)}"`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
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
  
  // Convert items
  const items: OrderItem[] = fields.Items.map(item => ({
    productName: item.ProductName,
    sku: item.SKU,
    quantity: item.Quantity,
    price: item.Price,
    total: item.Total,
  }));

  // Convert tracking updates if they exist
  const trackingUpdates: TrackingUpdate[] = fields.TrackingUpdates?.map(update => ({
    status: update.Status,
    date: update.Date,
    timestamp: update.Timestamp,
    icon: update.Icon,
  })) || [];

  // Create the order object
  const order: InsertOrder = {
    orderNumber: fields.OrderNumber,
    status: fields.Status,
    orderDate: new Date(fields.OrderDate),
    customerName: fields.CustomerName,
    shippingAddress: fields.ShippingAddress,
    shippingMethod: fields.ShippingMethod,
    trackingNumber: fields.TrackingNumber,
    subtotal: fields.Subtotal,
    shipping: fields.Shipping,
    tax: fields.Tax,
    total: fields.Total,
    items: items,
    trackingUpdates: trackingUpdates,
    airtableId: airtableOrder.id,
  };

  // Add id to match the Order type
  return { ...order, id: 0 };
}
