import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, Text, Alert, StyleSheet } from 'react-native';
import client, { errorMessage } from '../../api/client';
import MenuItemCard from '../../components/MenuItemCard';
import { useCart } from '../../context/CartContext';
import colors from '../../theme/colors';

export default function RestaurantScreen({ route, navigation }) {
  const { id, name } = route.params;
  const { addItem, count } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({ title: name });
    (async () => {
      try {
        const { data } = await client.get(`/restaurants/${id}`);
        setRestaurant(data);
      } catch (err) {
        Alert.alert('Could not load menu', errorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.primary} />;
  if (!restaurant) return null;

  return (
    <View style={styles.container}>
      {!restaurant.is_open && <Text style={styles.closed}>This restaurant is currently closed</Text>}
      <FlatList
        data={restaurant.menu}
        keyExtractor={(m) => String(m.id)}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>No menu items yet.</Text>}
        renderItem={({ item }) => (
          <MenuItemCard
            item={item}
            disabled={!restaurant.is_open}
            onAdd={() => addItem({ id: restaurant.id, name: restaurant.name }, item)}
          />
        )}
      />
      {count > 0 && (
        <Text style={styles.footer} onPress={() => navigation.navigate('Tabs', { screen: 'Cart' })}>
          View cart ({count} items)
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  closed: { backgroundColor: colors.danger, color: '#fff', textAlign: 'center', padding: 8 },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
  footer: {
    backgroundColor: colors.primary,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
    padding: 16,
  },
});
