import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const languages = [
  {
    code: 'en',
    name: 'English',
    native: 'English',
    welcome: 'Welcome to Soccer Daily',
    subtitle: 'Your soccer fan community for predictions, videos, scores, and reactions.',
  },
  {
    code: 'es',
    name: 'Spanish',
    native: 'Español',
    welcome: 'Bienvenido a Soccer Daily',
    subtitle: 'Tu comunidad de fútbol para predicciones, videos, marcadores y reacciones.',
  },
  {
    code: 'ne',
    name: 'Nepali',
    native: 'नेपाली',
    welcome: 'Soccer Daily मा स्वागत छ',
    subtitle: 'भविष्यवाणी, भिडियो, स्कोर र प्रतिक्रिया साझा गर्ने फुटबल समुदाय।',
  },
  {
    code: 'hi',
    name: 'Hindi',
    native: 'हिन्दी',
    welcome: 'Soccer Daily में आपका स्वागत है',
    subtitle: 'भविष्यवाणी, वीडियो, स्कोर और प्रतिक्रियाओं के लिए आपका फुटबॉल समुदाय।',
  },
  {
    code: 'pt',
    name: 'Portuguese',
    native: 'Português',
    welcome: 'Bem-vindo ao Soccer Daily',
    subtitle: 'Sua comunidade de futebol para previsões, vídeos, placares e reações.',
  },
  {
    code: 'fr',
    name: 'French',
    native: 'Français',
    welcome: 'Bienvenue sur Soccer Daily',
    subtitle: 'Votre communauté de football pour prédictions, vidéos, scores et réactions.',
  },
  {
    code: 'ar',
    name: 'Arabic',
    native: 'العربية',
    welcome: 'مرحبًا بك في Soccer Daily',
    subtitle: 'مجتمع كرة القدم للتوقعات والفيديوهات والنتائج والتفاعل.',
  },
];

export default function LanguageScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  useEffect(() => {
    loadLanguage();
  }, []);

  async function loadLanguage() {
    const saved = await AsyncStorage.getItem('soccerDailyLanguage');
    if (saved) {
      setSelectedLanguage(saved);
    }
  }

  async function chooseLanguage(code: string) {
    setSelectedLanguage(code);
    await AsyncStorage.setItem('soccerDailyLanguage', code);
  }

  const active = languages.find((item) => item.code === selectedLanguage) || languages[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <View style={styles.hero}>
        <Text style={styles.heroIcon}>🌐</Text>
        <Text style={styles.title}>Multilingual Center</Text>
        <Text style={styles.subtitle}>
          Choose your preferred language for Soccer Daily. Full app translation will continue improving step by step.
        </Text>
      </View>

      <View style={styles.previewCard}>
        <Text style={styles.previewLabel}>Current Language</Text>
        <Text style={styles.previewTitle}>{active.native}</Text>
        <Text style={styles.previewWelcome}>{active.welcome}</Text>
        <Text style={styles.previewText}>{active.subtitle}</Text>
      </View>

      <Text style={styles.sectionTitle}>Choose Language</Text>

      {languages.map((language) => {
        const isActive = selectedLanguage === language.code;

        return (
          <Pressable
            key={language.code}
            style={[styles.languageCard, isActive && styles.activeLanguageCard]}
            onPress={() => chooseLanguage(language.code)}
          >
            <View>
              <Text style={[styles.languageName, isActive && styles.activeLanguageName]}>
                {language.native}
              </Text>
              <Text style={[styles.languageSub, isActive && styles.activeLanguageSub]}>
                {language.name}
              </Text>
            </View>

            <Text style={[styles.checkText, isActive && styles.activeCheckText]}>
              {isActive ? '✓ Selected' : 'Choose'}
            </Text>
          </Pressable>
        );
      })}

      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>Testing Note</Text>
        <Text style={styles.noteText}>
          This first version saves the user's language preference. After beta testing,
          we can connect this selection to Home, Fan Wall, Prediction, TV, Profile,
          and notifications.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07111F',
  },
  content: {
    padding: 20,
    paddingTop: 70,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#111C2E',
    borderWidth: 1,
    borderColor: '#22314A',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    marginBottom: 18,
  },
  backText: {
    color: '#FFD166',
    fontWeight: 'bold',
  },
  hero: {
    backgroundColor: '#111C2E',
    borderWidth: 1,
    borderColor: '#FFD166',
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  heroIcon: {
    fontSize: 46,
    marginBottom: 8,
  },
  title: {
    color: '#FFD166',
    fontSize: 31,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: '#A7B0C0',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    textAlign: 'center',
  },
  previewCard: {
    backgroundColor: '#1A2A44',
    borderWidth: 1,
    borderColor: '#FFD166',
    padding: 18,
    borderRadius: 20,
    marginBottom: 18,
  },
  previewLabel: {
    color: '#A7B0C0',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  previewTitle: {
    color: '#FFD166',
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 6,
  },
  previewWelcome: {
    color: 'white',
    fontSize: 21,
    fontWeight: 'bold',
    marginTop: 12,
  },
  previewText: {
    color: '#DDE6F3',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  sectionTitle: {
    color: '#FFD166',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  languageCard: {
    backgroundColor: '#111C2E',
    borderWidth: 1,
    borderColor: '#22314A',
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeLanguageCard: {
    backgroundColor: '#FFD166',
    borderColor: '#FFD166',
  },
  languageName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  activeLanguageName: {
    color: '#07111F',
  },
  languageSub: {
    color: '#A7B0C0',
    fontSize: 14,
    marginTop: 4,
  },
  activeLanguageSub: {
    color: '#26364F',
  },
  checkText: {
    color: '#FFD166',
    fontWeight: 'bold',
  },
  activeCheckText: {
    color: '#07111F',
  },
  noteCard: {
    backgroundColor: '#0B3B2E',
    borderWidth: 1,
    borderColor: '#22C55E',
    padding: 16,
    borderRadius: 18,
    marginTop: 10,
  },
  noteTitle: {
    color: '#BBF7D0',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 7,
  },
  noteText: {
    color: 'white',
    fontSize: 14,
    lineHeight: 21,
  },
});
