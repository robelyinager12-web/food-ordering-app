const CURRENCY = 'ETB'; // change to your currency

export default function formatPrice(value) {
  return `${Number(value).toFixed(2)} ${CURRENCY}`;
}
