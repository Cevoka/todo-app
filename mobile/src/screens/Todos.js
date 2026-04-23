import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  listTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  deleteDoneTodos,
} from '../supabase';
import { colors } from '../theme';

export default function Todos({ token, onLogout }) {
  const [tasks, setTasks]       = useState([]);
  const [filter, setFilter]     = useState('all');
  const [text, setText]         = useState('');
  const [adding, setAdding]     = useState(false);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [editingId, setEditing] = useState(null);
  const [editText, setEditText] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listTodos(token);
      setTasks(rows || []);
    } catch (e) {
      flashError('Görevler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  function flashError(msg) {
    setError(msg);
    setTimeout(() => setError(''), 4000);
  }

  async function onAdd() {
    const v = text.trim();
    if (!v) return;
    setAdding(true);
    try {
      const row = await createTodo(token, v);
      setTasks((t) => [...t, row]);
      setText('');
    } catch (e) {
      flashError('Görev eklenemedi.');
    } finally {
      setAdding(false);
    }
  }

  async function onToggle(id) {
    const current = tasks.find((t) => t.id === id);
    if (!current) return;
    const next = !current.done;
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: next } : t)));
    try {
      await updateTodo(token, id, { done: next });
    } catch (e) {
      setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !next } : t)));
      flashError('Güncelleme başarısız.');
    }
  }

  async function onDelete(id) {
    const prev = tasks;
    setTasks((ts) => ts.filter((t) => t.id !== id));
    try {
      await deleteTodo(token, id);
    } catch (e) {
      setTasks(prev);
      flashError('Silme başarısız.');
    }
  }

  function startEdit(t) {
    setEditing(t.id);
    setEditText(t.text);
  }

  async function saveEdit() {
    const id = editingId;
    const v = editText.trim();
    setEditing(null);
    if (!v) return;
    const current = tasks.find((t) => t.id === id);
    if (!current || current.text === v) return;
    const prev = current.text;
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, text: v } : t)));
    try {
      await updateTodo(token, id, { text: v });
    } catch (e) {
      setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, text: prev } : t)));
      flashError('Düzenleme kaydedilemedi.');
    }
  }

  async function onClearDone() {
    const prev = tasks;
    setTasks((ts) => ts.filter((t) => !t.done));
    try {
      await deleteDoneTodos(token);
    } catch (e) {
      setTasks(prev);
      flashError('Silme başarısız.');
    }
  }

  const filtered = tasks.filter((t) =>
    filter === 'active' ? !t.done : filter === 'done' ? t.done : true
  );
  const total  = tasks.length;
  const done   = tasks.filter((t) => t.done).length;
  const active = total - done;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Yapılacaklar</Text>
          <Text style={styles.stats}>
            {total} görev · {active} aktif · {done} tamamlandı
          </Text>
        </View>
        <Pressable style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutText}>Çıkış</Text>
        </Pressable>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Yeni görev ekle..."
          value={text}
          onChangeText={setText}
          onSubmitEditing={onAdd}
          returnKeyType="done"
          maxLength={200}
        />
        <Pressable
          style={[styles.addBtn, adding && { opacity: 0.5 }]}
          onPress={onAdd}
          disabled={adding}
        >
          <Text style={styles.addBtnText}>+</Text>
        </Pressable>
      </View>

      <View style={styles.filters}>
        {[
          { key: 'all', label: 'Tümü' },
          { key: 'active', label: 'Aktif' },
          { key: 'done', label: 'Tamamlanan' },
        ].map((f) => (
          <Pressable
            key={f.key}
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={[styles.filterText, filter === f.key && styles.filterTextActive]}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>✅</Text>
          <Text style={styles.emptyText}>
            {filter === 'done'
              ? 'Henüz tamamlanan görev yok.'
              : filter === 'active'
              ? 'Tüm görevler tamamlandı!'
              : 'Henüz görev eklenmedi.'}
          </Text>
        </View>
      ) : (
        <FlatList
          style={styles.list}
          data={filtered}
          keyExtractor={(t) => String(t.id)}
          renderItem={({ item }) =>
            editingId === item.id ? (
              <View style={styles.row}>
                <Pressable style={styles.checkbox} onPress={() => onToggle(item.id)}>
                  <Text style={styles.checkboxMark}>{item.done ? '✓' : ''}</Text>
                </Pressable>
                <TextInput
                  style={styles.editInput}
                  value={editText}
                  onChangeText={setEditText}
                  autoFocus
                  onBlur={saveEdit}
                  onSubmitEditing={saveEdit}
                  returnKeyType="done"
                />
              </View>
            ) : (
              <View style={styles.row}>
                <Pressable style={styles.checkbox} onPress={() => onToggle(item.id)}>
                  <Text style={styles.checkboxMark}>{item.done ? '✓' : ''}</Text>
                </Pressable>
                <Text style={[styles.rowText, item.done && styles.rowTextDone]}>
                  {item.text}
                </Text>
                <Pressable style={styles.iconBtn} onPress={() => startEdit(item)}>
                  <Text>✏️</Text>
                </Pressable>
                <Pressable style={styles.iconBtn} onPress={() => onDelete(item.id)}>
                  <Text>🗑️</Text>
                </Pressable>
              </View>
            )
          }
        />
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>{active} görev kaldı</Text>
        <Pressable onPress={onClearDone}>
          <Text style={styles.clearText}>Tamamlananları sil</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
  stats: { color: '#fff', fontSize: 12, opacity: 0.85, marginTop: 2 },
  logoutBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  logoutText: { color: '#fff', fontSize: 13 },

  inputRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 22, fontWeight: '700' },

  filters: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  filterBtn: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  filterBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: { fontSize: 12, color: colors.muted },
  filterTextActive: { color: '#fff' },

  errorBanner: { backgroundColor: colors.errorBg, padding: 8, paddingHorizontal: 20 },
  errorBannerText: { color: colors.error, fontSize: 13 },

  list: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxMark: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  rowText: { flex: 1, fontSize: 15, color: colors.text },
  rowTextDone: { color: colors.disabled, textDecorationLine: 'line-through' },
  editInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 15,
  },
  iconBtn: { padding: 4 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 10 },
  emptyText: { color: colors.disabled, fontSize: 14 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  footerText: { color: colors.disabled, fontSize: 12 },
  clearText: { color: '#e57373', fontSize: 13 },
});
