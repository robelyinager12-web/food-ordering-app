import React, { useState } from 'react';
import { Text, StyleSheet, Alert, ScrollView } from 'react-native';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { errorMessage } from '../../api/client';
import colors from '../../theme/colors';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async () => {
    if (!form.name || !form.email || form.password.length < 6) {
      return Alert.alert('Missing info', 'Name, email and a password of 6+ characters are required.');
    }
    setLoading(true);
    try {
      await register({ ...form, email: form.email.trim() });
    } catch (err) {
      Alert.alert('Sign up failed', errorMessage(err));
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Create account</Text>

      <Input label="Full name" value={form.name} onChangeText={set('name')} autoCapitalize="words" />
      <Input label="Email" value={form.email} onChangeText={set('email')} keyboardType="email-address" />
      <Input label="Phone (optional)" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" />
      <Input label="Password" value={form.password} onChangeText={set('password')} secureTextEntry />

      <Button title="Sign up" onPress={onSubmit} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.background },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 24 },
});
