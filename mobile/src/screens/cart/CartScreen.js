import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import client, { errorMessage } from '../../api/client';
import { useCart } from '../../context/CartContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import formatPrice from '../../utils/formatPrice';
import colors from '../../theme/colors';

export default function CartScreen({ navigation }) {
  const { items, restaurant, total, changeQty, clear } = useCart();
  const [address, setAddress] = useState('');
  const [placing, setPlacing] = useState(false);

  const placeOrder = async () => {
    if (!address.trim()) {
      return Alert.alert('Address needed', 'Please enter your delivery address.');
    }
    setPlacing(true);
    try {
      await client.post('/orders', {
        restaurantId: restaurant.id,
        items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
        deliveryAddress: address.trim(),
        paymentMethod: 'cash',
      });
      clear();
      setAddress('');
      Alert.alert('Order placed!', 'The restaurant has received your order.');
      navigation.navigate('Orders');
    } catch (err) {
      Alert.alert('Order failed', errorMessage(err));
    } finally {
      setPlacing(false);
    }
  };

  if (!items.length) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptyText}>Pick a restaurant and add something tasty.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      <Text style={styles.restaurant}>{restaurant.name}</Text>

      {items.map((item) => (
        <View key={item.menuItemId} style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>{formatPrice(item.price * item.quantity)}</Text>
          </View>
          <View style={styles.qty}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => changeQty(item.menuItemId, -1)}>
              <Text style={styles.qtyText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.qtyNum}>{item.quantity}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => changeQty(item.menuItemId, 1)}>
              <Text style={styles.qtyText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatPrice(total)}</Text>
      </View>

      <Input
        label="Delivery address"
        value={address}
        onChangeText={setAddress}
        placeholder="Street, building, landmark..."
        autoCapitalize="sentences"
        multiline
      />
      <Text style={styles.note}>Payment: cash on delivery</Text>

      <Button title="Place order" onPress={placeOrder} loading={placing} />
      <Button title="Clear cart" variant="outline" style={{ marginTop: 10 }} onPress={clear} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  emptyText: { color: colors.muted, marginTop: 6 },
  restaurant: { fontSize: 20, fontWeight: '800', marginBottom: 14, color: colors.text },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: { fontSize: 16, fontWeight: '600', color: colors.text },
  price: { color: colors.primary, fontWeight: '700', marginTop: 4 },
  qty: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: { fontSize: 18, fontWeight: '700', color: colors.text },
  qtyNum: { marginHorizontal: 12, fontSize: 16, fontWeight: '600' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 16 },
  totalLabel: { fontSize: 18, fontWeight: '700' },
  totalValue: { fontSize: 18, fontWeight: '800', color: colors.primary },
  note: { color: colors.muted, marginBottom: 14 },
});
