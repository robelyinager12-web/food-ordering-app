import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import formatPrice from '../utils/formatPrice';

export default function MenuItemCard({ item, onAdd, disabled }) {
  return (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
        <Text style={styles.price}>{formatPrice(item.price)}</Text>
      </View>
      <TouchableOpacity
        style={[styles.add, disabled && { opacity: 0.4 }]}
        onPress={onAdd}
        disabled={disabled}
      >
        <Text style={styles.addText}>Add</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: { fontSize: 16, fontWeight: '600', color: colors.text },
  desc: { color: colors.muted, marginTop: 2 },
  price: { marginTop: 6, fontWeight: '700', color: colors.primary },
  add: { backgroundColor: colors.primary, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 8 },
  addText: { color: '#fff', fontWeight: '700' },
});
