import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { signUp } from '../supabase';
import { colors } from '../theme';

export default function Register({ onRegistered, onSwitchToLogin }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleRegister() {
    setError('');
    if (!email.trim() || !password) {
      return setError('E-posta ve şifre gerekli.');
    }
    setLoading(true);
    try {
      await signUp(email.trim(), password);
      onRegistered(email.trim());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Yapılacaklar</Text>
            <Text style={styles.subtitle}>Hesap oluşturun</Text>
          </View>

          <View style={styles.body}>
            <Text style={styles.sectionTitle}>Kayıt Ol</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>E-posta</Text>
            <TextInput
              style={styles.input}
              placeholder="ornek@mail.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Şifre</Text>
            <TextInput
              style={styles.input}
              placeholder="En az 6 karakter"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <Pressable
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.btnText}>{loading ? 'Kaydediliyor...' : 'Kayıt Ol'}</Text>
            </Pressable>

            <Text style={styles.switchText}>
              Hesabınız var mı?{' '}
              <Text style={styles.link} onPress={onSwitchToLogin}>
                Giriş yapın
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.primaryDark,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: colors.primary,
    padding: 28,
  },
  title: { fontSize: 26, fontWeight: '700', color: '#fff' },
  subtitle: { fontSize: 13, color: '#fff', opacity: 0.85, marginTop: 4 },
  body: { padding: 28 },
  sectionTitle: { fontSize: 18, color: colors.text, marginBottom: 20, fontWeight: '600' },
  label: { fontSize: 12, color: '#666', marginBottom: 6, marginTop: 10 },
  input: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  switchText: { textAlign: 'center', marginTop: 16, color: colors.muted, fontSize: 13 },
  link: { color: colors.primary, textDecorationLine: 'underline' },
  errorBox: {
    backgroundColor: colors.errorBg,
    borderWidth: 1,
    borderColor: '#f5c6cb',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  errorText: { color: colors.error, fontSize: 13 },
});
