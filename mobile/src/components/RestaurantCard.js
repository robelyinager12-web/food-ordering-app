import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';

export default function RestaurantCard({ restaurant, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.name}>{restaurant.name}</Text>
      {restaurant.description ? <Text style={styles.desc}>{restaurant.description}</Text> : null}
      <View style={styles.row}>
        <Text style={styles.address} numberOfLines={1}>
          {restaurant.address || 'No address'}
        </Text>
        <Text style={[styles.badge, { color: restaurant.is_open ? colors.success : colors.danger }]}>
          {restaurant.is_open ? 'Open' : 'Closed'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: { fontSize: 18, fontWeight: '700', color: colors.text },
  desc: { color: colors.muted, marginTop: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  address: { color: colors.muted, flex: 1, marginRight: 10 },
  badge: { fontWeight: '600' },
});
