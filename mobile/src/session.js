import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'sb_session';

export async function saveSession(data) {
  await AsyncStorage.setItem(
    KEY,
    JSON.stringify({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + data.expires_in * 1000,
    })
  );
}

export async function getSession() {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function clearSession() {
  await AsyncStorage.removeItem(KEY);
}
