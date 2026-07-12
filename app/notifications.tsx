import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { getAuth } from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { db } from '../firebase/config';

type AppNotification = {
  id: string;
  type?: string;
  title?: string;
  message?: string;
  screen?: string;
  read?: boolean;
  createdAt?: number;
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadNotifications() {
    try {
      setLoading(true);

      const user = getAuth().currentUser;
      const currentEmail = user?.email || '';
      const items: AppNotification[] = [];

      {
        const q = query(
          collection(db, 'appNotifications'),
          orderBy('createdAt', 'desc'),
          limit(50)
        );

        const snap = await getDocs(q);

        snap.docs.forEach((d) => {
          const data: any = d.data();

          const belongsToMe =
            !data.targetEmail || data.targetEmail === currentEmail;

          if (!belongsToMe) return;

          items.push({
            id: d.id,
            type: data.type,
            title: data.title,
            message: data.message || data.body || 'Notification',
            screen: data.screen,
            read: !!data.read,
            createdAt: data.createdAt || 0,
          });
        });
      }

      items.push({
        id: 'system-welcome',
        type: 'system',
        title: 'Welcome to Soccer Daily',
        message: 'Your notifications will appear here.',
        read: true,
        createdAt: 1,
      });

      setNotifications(items);

      await AsyncStorage.setItem('soccerDailyNotificationsRead', 'yes');

    } catch (error: any) {
      console.log('Load notifications error:', error);
      Alert.alert('Load notifications failed', error?.message || String(error));
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  async function markAllRead() {
    try {
      const q = query(
        collection(db, 'appNotifications'),
        orderBy('createdAt', 'desc'),
        limit(100)
      );

      const snap = await getDocs(q);

      const user = getAuth().currentUser;
      const currentEmail = user?.email || '';

      const myNotificationDocs = snap.docs.filter((docSnap) => {
        const data: any = docSnap.data();

        return !data.targetEmail || data.targetEmail === currentEmail;
      });

      await Promise.all(
        myNotificationDocs.map((docSnap) =>
          updateDoc(doc(db, 'appNotifications', docSnap.id), {
            read: true,
          }).catch((error) => console.log('Mark read item error:', error))
        )
      );

      setNotifications(
        notifications.map((item) => ({
          ...item,
          read: true,
        }))
      );

      await loadNotifications();
    } catch (error) {
      console.log('Mark all read error:', error);
    }
  }

  function openNotification(item: AppNotification) {
    if (item.screen === 'fan-wall') {
      router.push('/fan-wall' as any);
      return;
    }

    router.push('/' as any);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <View style={styles.headerRow}>
        <Text style={styles.title}>🔔 Notifications</Text>

        <View style={styles.headerButtons}>
          <Pressable style={styles.refreshButton} onPress={loadNotifications}>
            <Text style={styles.refreshText}>Refresh</Text>
          </Pressable>

          <Pressable style={styles.markReadButton} onPress={markAllRead}>
            <Text style={styles.markReadText}>Mark all read</Text>
          </Pressable>
        </View>
      </View>


      {loading ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator color="#FFD166" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : null}

      {!loading &&
        notifications.map((item) => (
          <Pressable key={item.id} style={styles.card} onPress={() => openNotification(item)}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>
                {item.type === 'comment' ? '💬 ' : item.type === 'reaction' ? '🔥 ' : '⚽ '}
                {item.title || 'Notification'}
              </Text>

              {!item.read ? <Text style={styles.unreadBadge}>NEW</Text> : null}
            </View>

            <Text style={styles.line}>{item.message || 'You have a new update.'}</Text>

            {item.screen === 'fan-wall' ? (
              <Text style={styles.openText}>Open Fan Wall →</Text>
            ) : null}
          </Pressable>
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07111F' },
  content: { padding: 20, paddingTop: 70, paddingBottom: 120 },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#132238',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 18,
  },
  backText: { color: '#FFD166', fontWeight: '900' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  title: { color: '#FFD166', fontSize: 30, fontWeight: '900', flex: 1 },
  headerButtons: {
    flexDirection: 'column',
    gap: 8,
    alignItems: 'flex-end',
  },
  markReadButton: {
    backgroundColor: '#FFD166',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  markReadText: {
    color: '#07111F',
    fontWeight: '900',
    fontSize: 13,
  },
  refreshButton: {
    backgroundColor: '#132238',
    borderWidth: 1,
    borderColor: '#24344F',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  refreshText: { color: '#FFD166', fontWeight: '900' },
  loadingCard: {
    backgroundColor: '#0B1729',
    borderWidth: 1,
    borderColor: '#24344F',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: { color: '#FFFFFF', fontWeight: '700' },
  card: {
    backgroundColor: '#0B1729',
    borderWidth: 1,
    borderColor: '#24344F',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardTitle: { color: '#FFD166', fontSize: 19, fontWeight: '900', marginBottom: 8, flex: 1 },
  line: { color: 'white', fontSize: 16, lineHeight: 24 },
  unreadBadge: {
    backgroundColor: '#FF4D4D',
    color: 'white',
    fontWeight: '900',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
    fontSize: 11,
  },
  openText: {
    color: '#FFD166',
    fontWeight: '900',
    marginTop: 12,
  },
});
