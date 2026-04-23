import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { restoreSession, signOut } from './src/supabase';
import Register from './src/screens/Register';
import Login    from './src/screens/Login';
import Confirm  from './src/screens/Confirm';
import Todos    from './src/screens/Todos';
import { colors } from './src/theme';

export default function App() {
  const [view, setView]     = useState('loading'); // loading | register | login | confirm | app
  const [token, setToken]   = useState(null);
  const [pendingEmail, setPendingEmail] = useState('');

  useEffect(() => {
    (async () => {
      const t = await restoreSession();
      if (t) { setToken(t); setView('app'); }
      else   { setView('register'); }
    })();
  }, []);

  async function handleLogout() {
    await signOut();
    setToken(null);
    setView('login');
  }

  function renderView() {
    switch (view) {
      case 'register':
        return (
          <Register
            onRegistered={(email) => { setPendingEmail(email); setView('confirm'); }}
            onSwitchToLogin={() => setView('login')}
          />
        );
      case 'login':
        return (
          <Login
            onLoggedIn={(t) => { setToken(t); setView('app'); }}
            onSwitchToRegister={() => setView('register')}
          />
        );
      case 'confirm':
        return <Confirm email={pendingEmail} onBackToLogin={() => setView('login')} />;
      case 'app':
        return <Todos token={token} onLogout={handleLogout} />;
      default:
        return (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        );
    }
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {renderView()}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryDark,
  },
});
