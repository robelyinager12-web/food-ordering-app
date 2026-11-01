import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client, { errorMessage } from '../../api/client';
import { payForOrder } from '../../api/payments';
import Button from '../../components/Button';
import formatPrice from '../../utils/formatPrice';
import colors from '../../theme/colors';

const STATUS = {
  pending: { label: 'Waiting for restaurant', color: colors.muted },
  accepted: { label: 'Accepted', color: '#1C7ED6' },
  preparing: { label: 'Preparing', color: '#F08C00' },
  on_the_way: { label: 'On the way', color: '#7048E8' },
  delivered: { label: 'Delivered', color: colors.success },
  cancelled: { label: 'Cancelled', color: colors.danger },
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payingId, setPayingId] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await client.get('/orders/mine');
      setOrders(data);
    } catch (err) {
      Alert.alert('Could not load orders', errorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const pay = async (orderId) => {
    setPayingId(orderId);
    try {
      const paid = await payForOrder(orderId);
      Alert.alert(
        paid ? 'Payment received!' : 'Payment not completed',
        paid ? 'The restaurant has received your order.' : 'You can try again with the Pay now button.'
      );
      load();
    } catch (err) {
      Alert.alert('Payment error', errorMessage(err));
    } finally {
      setPayingId(null);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.primary} />;

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 16 }}
      data={orders}
      keyExtractor={(o) => String(o.id)}
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        load();
      }}
      ListEmptyComponent={<Text style={styles.empty}>You have no orders yet.</Text>}
      renderItem={({ item }) => {
        const awaitingPayment =
          item.payment_method === 'online' && item.payment_status !== 'paid' && item.status !== 'cancelled';
        const s = awaitingPayment
          ? { label: 'Awaiting payment', color: colors.danger }
          : STATUS[item.status] || STATUS.pending;

        return (
          <View style={styles.card}>
            <View style={styles.top}>
              <Text style={styles.title}>{item.restaurant_name}</Text>
              <Text style={[styles.status, { color: s.color }]}>{s.label}</Text>
            </View>
            <Text style={styles.meta}>
              Order #{item.id} - {new Date(item.created_at).toLocaleString()}
            </Text>
            <Text style={styles.meta}>
              {item.payment_method === 'online'
                ? item.payment_status === 'paid' ? 'Paid online' : 'Online payment'
                : 'Cash on delivery'}
            </Text>
            <Text style={styles.total}>{formatPrice(item.total)}</Text>

            {awaitingPayment && (
              <Button
                title="Pay now"
                style={{ marginTop: 10 }}
                loading={payingId === item.id}
                onPress={() => pay(item.id)}
              />
            )}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: '700', color: colors.text, flex: 1 },
  status: { fontWeight: '700' },
  meta: { color: colors.muted, marginTop: 6 },
  total: { marginTop: 8, fontWeight: '800', color: colors.primary },
});
