import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase/config';

type AppNotification = {
  id: string;
  title: string;
  message: string;
  type?: string;
  createdAt?: any;
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const auth = getAuth();
      const email = auth.currentUser?.email;

      const list: AppNotification[] = [];

      try {
        const notifQuery = query(
          collection(db, 'notifications'),
          orderBy('createdAt', 'desc'),
          limit(30)
        );

        const notifSnap = await getDocs(notifQuery);

        notifSnap.docs.forEach((doc) => {
          const data = doc.data();

          if (!data.userEmail || data.userEmail === email) {
            list.push({
              id: doc.id,
              title: data.title || 'Soccer Daily',
              message: data.message || '',
              type: data.type || 'info',
              createdAt: data.createdAt,
            });
          }
        });
      } catch (error) {
        console.log('Notifications collection not ready yet:', error);
      }

      const predictionSnap = await getDocs(collection(db, 'predictions'));

      predictionSnap.docs.forEach((doc) => {
        const data = doc.data();

        if (email && data.userEmail && data.userEmail !== email) return;

        if (data.correct === true) {
          list.push({
            id: `correct-${doc.id}`,
            title: '✅ Prediction Won',
            message: `You earned ${data.points || 0} points for ${
              data.homeTeam || 'Home'
            } vs ${data.awayTeam || 'Away'}.`,
            type: 'success',
            createdAt: data.createdAt,
          });
        } else if (data.correct === false) {
          list.push({
            id: `wrong-${doc.id}`,
            title: '❌ Prediction Missed',
            message: `Your pick for ${data.homeTeam || 'Home'} vs ${
              data.awayTeam || 'Away'
            } did not win.`,
            type: 'danger',
            createdAt: data.createdAt,
          });
        } else {
          list.push({
            id: `pending-${doc.id}`,
            title: '⏳ Prediction Pending',
            message: `Your pick for ${data.homeTeam || 'Home'} vs ${
              data.awayTeam || 'Away'
            } is waiting for the final result.`,
            type: 'pending',
            createdAt: data.createdAt,
          });
        }
      });

      list.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });

      setNotifications(list);
    } catch (error) {
      console.log('Notification loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>🔔 Notifications</Text>
      <Text style={styles.subtitle}>Prediction updates, match alerts, and app news</Text>

      <Pressable style={styles.refreshButton} onPress={loadNotifications}>
        <Text style={styles.refreshText}>Refresh Notifications</Text>
      </Pressable>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#FFD166" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptyText}>
            Your prediction results and match reminders will appear here.
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {notifications.map((item) => (
            <View
              key={item.id}
              style={[
                styles.card,
                item.type === 'success'
                  ? styles.successCard
                  : item.type === 'danger'
                  ? styles.dangerCard
                  : item.type === 'pending'
                  ? styles.pendingCard
                  : null,
              ]}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardText}>{item.message}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07111F',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    marginBottom: 14,
  },
  backText: {
    color: '#FFD166',
    fontSize: 16,
    fontWeight: '700',
  },
  title: {
    color: 'white',
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subtitle: {
    color: '#A7B0C0',
    fontSize: 16,
    marginBottom: 18,
    lineHeight: 22,
  },
  refreshButton: {
    backgroundColor: '#FFD166',
    padding: 14,
    borderRadius: 14,
    marginBottom: 18,
  },
  refreshText: {
    color: '#07111F',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  loadingBox: {
    marginTop: 60,
    alignItems: 'center',
  },
  loadingText: {
    color: '#A7B0C0',
    marginTop: 12,
  },
  emptyCard: {
    backgroundColor: '#111C2E',
    padding: 20,
    borderRadius: 18,
    marginTop: 20,
  },
  emptyTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    color: '#A7B0C0',
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#111C2E',
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD166',
  },
  successCard: {
    borderLeftColor: '#00E676',
  },
  dangerCard: {
    borderLeftColor: '#FF6B6B',
  },
  pendingCard: {
    borderLeftColor: '#FFD166',
  },
  cardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardText: {
    color: '#A7B0C0',
    fontSize: 15,
    lineHeight: 22,
  },
});
