import React, { useCallback, useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, Text, Alert, StyleSheet } from 'react-native';
import client, { errorMessage } from '../../api/client';
import RestaurantCard from '../../components/RestaurantCard';
import colors from '../../theme/colors';

export default function HomeScreen({ navigation }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await client.get('/restaurants');
      setRestaurants(data);
    } catch (err) {
      Alert.alert('Could not load restaurants', errorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.primary} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={restaurants}
        keyExtractor={(r) => String(r.id)}
        contentContainerStyle={{ padding: 16 }}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          load();
        }}
        ListEmptyComponent={<Text style={styles.empty}>No restaurants yet.</Text>}
        renderItem={({ item }) => (
          <RestaurantCard
            restaurant={item}
            onPress={() => navigation.navigate('Restaurant', { id: item.id, name: item.name })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
});
