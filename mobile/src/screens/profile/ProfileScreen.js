import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import colors from '../../theme/colors';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.info}>{user.email}</Text>
      {user.phone ? <Text style={styles.info}>{user.phone}</Text> : null}
      <Button title="Log out" variant="outline" style={{ marginTop: 30 }} onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: colors.background },
  name: { fontSize: 26, fontWeight: '800', color: colors.text },
  info: { color: colors.muted, marginTop: 6, fontSize: 16 },
});
