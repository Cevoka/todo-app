import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '../theme';

export default function Confirm({ email, onBackToLogin }) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Yapılacaklar</Text>
          <Text style={styles.subtitle}>Neredeyse bitti!</Text>
        </View>

        <View style={styles.notice}>
          <Text style={styles.emoji}>📧</Text>
          <Text style={styles.noticeTitle}>E-postanızı onaylayın</Text>
          <Text style={styles.noticeText}>
            <Text style={styles.bold}>{email}</Text> adresine onay maili gönderdik.
          </Text>
          <Text style={styles.noticeText}>
            Maildeki linke tıklayın, sonra bu uygulamaya dönüp giriş yapın.
          </Text>

          <Pressable onPress={onBackToLogin} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Giriş sayfasına dön</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  notice: {
    padding: 28,
    alignItems: 'center',
  },
  emoji: { fontSize: 48, marginBottom: 14 },
  noticeTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#4338ca',
    marginBottom: 14,
    textAlign: 'center',
  },
  noticeText: {
    fontSize: 14,
    color: '#4338ca',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  bold: { fontWeight: '700' },
  backBtn: { marginTop: 14 },
  backBtnText: {
    color: colors.primary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
