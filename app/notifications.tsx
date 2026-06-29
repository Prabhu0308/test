import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function NotificationsScreen() {
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.setItem('soccerDailyNotificationsRead', 'yes');
    }, [])
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>🔔 Notifications</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Welcome to Soccer Daily</Text>
        <Text style={styles.line}>Your notifications are now marked as read.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Testing Reminder</Text>
        <Text style={styles.line}>Check Fan Wall, Prediction Wheel, Admin reports, and Profile photo.</Text>
      </View>
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
  title: { color: '#FFD166', fontSize: 34, fontWeight: '900', marginBottom: 18 },
  card: {
    backgroundColor: '#0B1729',
    borderWidth: 1,
    borderColor: '#24344F',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
  },
  cardTitle: { color: '#FFD166', fontSize: 22, fontWeight: '900', marginBottom: 8 },
  line: { color: 'white', fontSize: 16, lineHeight: 24 },
});
