import * as WebBrowser from 'expo-web-browser';
import client from './client';

// Opens the Chapa checkout, then asks the server whether the payment went through.
// Returns true if the order is paid.
export async function payForOrder(orderId) {
  const { data } = await client.post('/payments/chapa/init', { orderId });
  if (data.paid) return true;

  await WebBrowser.openBrowserAsync(data.checkoutUrl);

  const res = await client.post('/payments/chapa/verify', { orderId });
  return res.data.paid;
}
