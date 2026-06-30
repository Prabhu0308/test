import { getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import {collection, doc, getDoc, getDocs, limit, orderBy, query} from 'firebase/firestore';
import { useCallback, useRef, useState } from 'react';
import { db } from '../../firebase/config';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'ne', label: 'नेपाली' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'pt', label: 'Português' },
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
];

const text: any = {
  en: {
    app: 'Soccer Daily',
    welcome: 'Welcome to Soccer Daily',
    hero: 'Predict matches, share fan reactions, post 30-second videos, and connect with soccer fans.',
    choose: 'Choose Language',
    quick: 'Quick Access',
    scores: 'Scores',
    prediction: 'Prediction Wheel',
    fanWall: 'Fan Wall',
    tv: 'Soccer Daily TV',
    studio: 'Studio',
    stats: 'Stats Center',
    featured: 'Featured Match',
    matchup: 'USA vs Mexico',
    matchText: 'Spin the prediction wheel and share your fan opinion before kickoff.',
    community: 'Community Reminder',
    communityText: 'Fan Wall is 13+. Be respectful, do not post private info, and do not upload TV match clips.',
    coming: 'Coming Soon',
    comingText: 'More languages, admin tools, youth safety, talent wall, and stronger soccer community features.',
  },
  es: {
    app: 'Soccer Daily',
    welcome: 'Bienvenido a Soccer Daily',
    hero: 'Predice partidos, comparte reacciones, publica videos de 30 segundos y conecta con fans del fútbol.',
    choose: 'Elegir idioma',
    quick: 'Acceso rápido',
    scores: 'Marcadores',
    prediction: 'Rueda de predicción',
    fanWall: 'Muro de fans',
    tv: 'Soccer Daily TV',
    studio: 'Estudio',
    stats: 'Centro de estadísticas',
    featured: 'Partido destacado',
    matchup: 'USA vs México',
    matchText: 'Gira la rueda de predicción y comparte tu opinión antes del partido.',
    community: 'Recordatorio de comunidad',
    communityText: 'Fan Wall es para mayores de 13 años. Sé respetuoso, no publiques información privada ni clips de TV.',
    coming: 'Próximamente',
    comingText: 'Más idiomas, herramientas de admin, seguridad juvenil, Talent Wall y más comunidad futbolera.',
  },
  ne: {
    app: 'Soccer Daily',
    welcome: 'Soccer Daily मा स्वागत छ',
    hero: 'म्याच अनुमान गर्नुहोस्, फ्यान प्रतिक्रिया साझा गर्नुहोस्, ३० सेकेन्ड भिडियो पोस्ट गर्नुहोस् र फुटबल फ्यानहरूसँग जोडिनुहोस्।',
    choose: 'भाषा छान्नुहोस्',
    quick: 'छिटो पहुँच',
    scores: 'स्कोर',
    prediction: 'भविष्यवाणी चक्का',
    fanWall: 'फ्यान वाल',
    tv: 'Soccer Daily TV',
    studio: 'स्टुडियो',
    stats: 'स्टाट्स सेन्टर',
    featured: 'विशेष म्याच',
    matchup: 'USA vs Mexico',
    matchText: 'किकअफ अघि भविष्यवाणी चक्का घुमाउनुहोस् र आफ्नो फ्यान राय साझा गर्नुहोस्।',
    community: 'समुदाय सम्झना',
    communityText: 'Fan Wall १३ वर्ष वा माथिका लागि हो। सम्मानजनक हुनुहोस्, निजी जानकारी नहाल्नुहोस्, र TV म्याच क्लिप अपलोड नगर्नुहोस्।',
    coming: 'चाँडै आउँदैछ',
    comingText: 'थप भाषा, एडमिन टुल, युवा सुरक्षा, Talent Wall र बलियो फुटबल समुदाय सुविधा।',
  },
  hi: {
    app: 'Soccer Daily',
    welcome: 'Soccer Daily में आपका स्वागत है',
    hero: 'मैच की भविष्यवाणी करें, फैन रिएक्शन शेयर करें, 30 सेकंड वीडियो पोस्ट करें और फुटबॉल फैंस से जुड़ें।',
    choose: 'भाषा चुनें',
    quick: 'त्वरित पहुँच',
    scores: 'स्कोर',
    prediction: 'प्रेडिक्शन व्हील',
    fanWall: 'फैन वॉल',
    tv: 'Soccer Daily TV',
    studio: 'स्टूडियो',
    stats: 'स्टैट्स सेंटर',
    featured: 'विशेष मैच',
    matchup: 'USA vs Mexico',
    matchText: 'किकऑफ से पहले प्रेडिक्शन व्हील घुमाएँ और अपनी राय शेयर करें।',
    community: 'समुदाय याद दिलाना',
    communityText: 'Fan Wall 13+ के लिए है। सम्मान रखें, निजी जानकारी न डालें, और TV मैच क्लिप अपलोड न करें।',
    coming: 'जल्द आ रहा है',
    comingText: 'अधिक भाषाएँ, admin tools, youth safety, Talent Wall और मजबूत soccer community features.',
  },
  pt: {
    app: 'Soccer Daily',
    welcome: 'Bem-vindo ao Soccer Daily',
    hero: 'Faça previsões, compartilhe reações, publique vídeos de 30 segundos e conecte-se com fãs de futebol.',
    choose: 'Escolher idioma',
    quick: 'Acesso rápido',
    scores: 'Placar',
    prediction: 'Roda de previsão',
    fanWall: 'Mural dos fãs',
    tv: 'Soccer Daily TV',
    studio: 'Estúdio',
    stats: 'Centro de estatísticas',
    featured: 'Jogo em destaque',
    matchup: 'USA vs México',
    matchText: 'Gire a roda de previsão e compartilhe sua opinião antes do jogo.',
    community: 'Lembrete da comunidade',
    communityText: 'Fan Wall é para 13+. Seja respeitoso, não publique informações privadas nem clipes de TV.',
    coming: 'Em breve',
    comingText: 'Mais idiomas, ferramentas de admin, segurança juvenil, Talent Wall e recursos de comunidade.',
  },
  fr: {
    app: 'Soccer Daily',
    welcome: 'Bienvenue sur Soccer Daily',
    hero: 'Prédisez les matchs, partagez vos réactions, publiez des vidéos de 30 secondes et connectez-vous avec les fans.',
    choose: 'Choisir la langue',
    quick: 'Accès rapide',
    scores: 'Scores',
    prediction: 'Roue de prédiction',
    fanWall: 'Mur des fans',
    tv: 'Soccer Daily TV',
    studio: 'Studio',
    stats: 'Centre de statistiques',
    featured: 'Match vedette',
    matchup: 'USA vs Mexique',
    matchText: 'Tournez la roue de prédiction et partagez votre avis avant le coup d’envoi.',
    community: 'Rappel communautaire',
    communityText: 'Fan Wall est réservé aux 13+. Soyez respectueux, ne publiez pas d’infos privées ni de clips TV.',
    coming: 'Bientôt',
    comingText: 'Plus de langues, outils admin, sécurité des jeunes, Talent Wall et communauté renforcée.',
  },
  ar: {
    app: 'Soccer Daily',
    welcome: 'مرحبًا بك في Soccer Daily',
    hero: 'توقع المباريات، شارك ردود فعل المشجعين، انشر فيديوهات قصيرة، وتواصل مع عشاق كرة القدم.',
    choose: 'اختر اللغة',
    quick: 'وصول سريع',
    scores: 'النتائج',
    prediction: 'عجلة التوقع',
    fanWall: 'حائط المشجعين',
    tv: 'Soccer Daily TV',
    studio: 'الاستوديو',
    stats: 'مركز الإحصائيات',
    featured: 'مباراة مميزة',
    matchup: 'USA vs Mexico',
    matchText: 'أدر عجلة التوقع وشارك رأيك قبل بداية المباراة.',
    community: 'تذكير المجتمع',
    communityText: 'Fan Wall لعمر 13+ فقط. كن محترمًا، لا تنشر معلومات خاصة أو مقاطع تلفزيونية.',
    coming: 'قريبًا',
    comingText: 'المزيد من اللغات، أدوات الإدارة، سلامة الشباب، Talent Wall وميزات مجتمع أقوى.',
  },
};

export default function HomeScreen() {
  const [notificationBadgeCount, setNotificationBadgeCount] = useState(3);
  const [language, setLanguage] = useState('en');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [homePhotoUrl, setHomePhotoUrl] = useState('');
  const [homeClubTeam, setHomeClubTeam] = useState('');
  const [homeNationalTeam, setHomeNationalTeam] = useState('');
  const searchInputRef = useRef<TextInput>(null);

  useFocusEffect(
    useCallback(() => {
      loadLanguage();
      loadHomeProfile();
    }, [])
  );


  async function loadHomeProfile() {
    try {
      const q = query(
        collection(db, 'appNotifications'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const snap = await getDocs(q);
      let unreadCount = 0;

      snap.docs.forEach((docSnap) => {
        const data: any = docSnap.data();
        if (!data.read) {
          unreadCount += 1;
        }
      });

      setNotificationBadgeCount(unreadCount);
    } catch (error) {
      console.log('Home notification count error:', error);
      setNotificationBadgeCount(0);
    }

    const localClub = await AsyncStorage.getItem('favoriteClubTeam');
    const localNational = await AsyncStorage.getItem('favoriteNationalTeam');

    setHomeClubTeam(localClub || '');
    setHomeNationalTeam(localNational || '');

    const user = getAuth().currentUser;
    if (!user?.uid) return;

    try {
      const snap = await getDoc(doc(db, 'userProfiles', user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setHomePhotoUrl(data.photoUrl || '');
        setHomeClubTeam(data.favoriteClubTeam || localClub || '');
        setHomeNationalTeam(data.favoriteNationalTeam || localNational || '');
      }
    } catch {}
  }

  async function openNotificationsAndClear() {
    router.push('/notifications' as any);
  }

  async function loadLanguage() {
    const saved = await AsyncStorage.getItem('soccerDailyLanguage');
    if (saved) {
      setLanguage(saved);
    }
  }

  async function chooseLanguage(code: string) {
    setLanguage(code);
    setShowLanguages(false);
    await AsyncStorage.setItem('soccerDailyLanguage', code);
  }

  const t = text[language] || text.en;
  const activeLabel = languages.find((item) => item.code === language)?.label || 'English';

  const searchPlaceholder: any = {
    en: 'Search teams, fans, news...',
    es: 'Buscar equipos, fans, noticias...',
    ne: 'टिम, फ्यान, समाचार खोज्नुहोस्...',
    hi: 'टीम, फैन, समाचार खोजें...',
    pt: 'Buscar times, fãs, notícias...',
    fr: 'Rechercher équipes, fans, actualités...',
    ar: 'ابحث عن الفرق والمشجعين والأخبار...',
  };

  const newsLabel: any = {
    en: 'News',
    es: 'Noticias',
    ne: 'समाचार',
    hi: 'समाचार',
    pt: 'Notícias',
    fr: 'Actualités',
    ar: 'الأخبار',
  };



  const languageOptions = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'ne', label: 'नेपाली', flag: '🇳🇵' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'pt', label: 'Português', flag: '🇧🇷' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  ];

  const selectedLanguage =
    languageOptions.find((item) => item.code === language) || languageOptions[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.homeLanguageBox}>
        <Pressable
          style={styles.homeLanguageButton}
          onPress={() => setShowLanguageMenu(!showLanguageMenu)}
        >
          <Text style={styles.homeLanguageButtonText}>
            🌐 {selectedLanguage.flag} {selectedLanguage.label}
          </Text>
          <Text style={styles.homeLanguageArrow}>{showLanguageMenu ? '▲' : '▼'}</Text>
        </Pressable>

        {showLanguageMenu ? (
          <View style={styles.homeLanguageMenu}>
            {languageOptions.map((item) => (
              <Pressable
                key={item.code}
                style={[
                  styles.homeLanguageOption,
                  language === item.code && styles.homeLanguageOptionActive,
                ]}
                onPress={() => {
                  setLanguage(item.code);
                  setShowLanguageMenu(false);
                }}
              >
                <Text
                  style={[
                    styles.homeLanguageOptionText,
                    language === item.code && styles.homeLanguageOptionTextActive,
                  ]}
                >
                  {item.flag} {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.topTools}>
        <Pressable style={styles.searchBox} onPress={() => router.push('/search' as any)}>
          <Text style={styles.searchIcon}>🔎</Text>
          <Text style={styles.searchInputText}>Search teams, news, fans...</Text>
        </Pressable>

        <Pressable style={styles.notificationButton} onPress={openNotificationsAndClear}>
          <Text style={styles.notificationIcon}>🔔</Text>
          {notificationBadgeCount > 0 ? (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{notificationBadgeCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <View style={styles.hero}>
        <Text style={styles.logo}>⚽</Text>
        <Text style={styles.appName}>{t.app}</Text>
        <Text style={styles.title}>{t.welcome}</Text>
        <Text style={styles.subtitle}>{t.hero}</Text>
      </View>

      <View style={styles.homeProfileCard}>
        {homePhotoUrl ? (
          <Image source={{ uri: homePhotoUrl }} style={styles.homeAvatar} />
        ) : (
          <View style={styles.homeAvatarFallback}>
            <Text style={styles.homeAvatarText}>⚽</Text>
          </View>
        )}

        <View style={{ flex: 1 }}>
          <Text style={styles.homeProfileTitle}>My Soccer Profile</Text>
          <Text style={styles.homeProfileText}>Club: {homeClubTeam || 'Not selected'}</Text>
          <Text style={styles.homeProfileText}>National: {homeNationalTeam || 'Not selected'}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t.quick}</Text>

        <View style={styles.grid}>
          <Pressable style={styles.quickButton} onPress={() => router.push('/scores' as any)}>
            <Text style={styles.quickIcon}>📊</Text>
            <Text style={styles.quickText}>{t.scores}</Text>
          </Pressable>

          <Pressable style={styles.quickButton} onPress={() => router.push('/news' as any)}>
            <Text style={styles.quickIcon}>📰</Text>
            <Text style={styles.quickText}>{newsLabel[language] || newsLabel.en}</Text>
          </Pressable>

          <Pressable style={styles.quickButton} onPress={() => router.push('/fan-wall' as any)}>
            <Text style={styles.quickIcon}>🔥</Text>
            <Text style={styles.quickText}>{t.fanWall}</Text>
          </Pressable>

          <Pressable style={styles.quickButton} onPress={() => router.push('/tv' as any)}>
            <Text style={styles.quickIcon}>📺</Text>
            <Text style={styles.quickText}>{t.tv}</Text>
          </Pressable>

          <Pressable style={styles.quickButton} onPress={() => router.push('/studio' as any)}>
            <Text style={styles.quickIcon}>🎙️</Text>
            <Text style={styles.quickText}>{t.studio}</Text>
          </Pressable>

          <Pressable style={styles.quickButton} onPress={() => router.push('/stats-center' as any)}>
            <Text style={styles.quickIcon}>📈</Text>
            <Text style={styles.quickText}>{t.stats}</Text>
          </Pressable>

          <Pressable style={styles.quickButton} onPress={() => router.push('/community-guidelines' as any)}>
            <Text style={styles.quickIcon}>🛡️</Text>
            <Text style={styles.quickText}>Community Rules</Text>
          </Pressable>

          <Pressable style={[styles.quickButton, styles.leaguesQuickButton]} onPress={() => router.push('/leagues-stats' as any)}>
            <Text style={styles.quickIcon}>🏆</Text>
            <Text style={styles.quickText}>Leagues & Stats</Text>
          </Pressable>
          {searchText.trim().toLowerCase() === 'handler' && (
            <Pressable style={[styles.quickButton, styles.adminQuickButton]} onPress={() => router.push('/admin' as any)}>
              <Text style={styles.quickIcon}>🛡️</Text>
              <Text style={styles.adminQuickText}>Admin Panel</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.featuredCard}>
        <Text style={styles.featuredLabel}>{t.featured}</Text>
        <Text style={styles.matchTitle}>{t.matchup}</Text>
        <Text style={styles.line}>{t.matchText}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>⚽ {t.community}</Text>
        <Text style={styles.line}>{t.communityText}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🚀 {t.coming}</Text>
        <Text style={styles.line}>{t.comingText}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  homeLanguageOptionTextActive: {
    color: '#07111F',
    fontSize: 16,
    fontWeight: 'bold',
  },

  homeLanguageOptionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  homeLanguageOptionActive: {
    backgroundColor: '#FFD166',
  },

  homeLanguageOption: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
  },

  homeLanguageMenu: {
    backgroundColor: '#0E192B',
    borderTopWidth: 1,
    borderTopColor: '#22314A',
    padding: 8,
  },

  homeLanguageArrow: {
    color: '#FFD166',
    fontSize: 13,
    fontWeight: 'bold',
  },

  homeLanguageButtonText: {
    color: '#FFD166',
    fontSize: 16,
    fontWeight: 'bold',
  },

  homeLanguageButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  homeLanguageBox: {
    marginBottom: 14,
    backgroundColor: '#111C2E',
    borderWidth: 1,
    borderColor: '#22314A',
    borderRadius: 16,
    overflow: 'hidden',
  },

  container: {
    flex: 1,
    backgroundColor: '#07111F',
  },
  content: {
    padding: 20,
    paddingTop: 70,
    paddingBottom: 40,
  },
  languageBox: {
    backgroundColor: '#111C2E',
    borderWidth: 1,
    borderColor: '#22314A',
    borderRadius: 18,
    marginBottom: 16,
    overflow: 'hidden',
  },
  languageHeader: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageTitle: {
    color: '#FFD166',
    fontSize: 16,
    fontWeight: 'bold',
  },
  languageValue: {
    color: 'white',
    fontWeight: 'bold',
  },
  languageList: {
    borderTopWidth: 1,
    borderTopColor: '#22314A',
    padding: 10,
  },
  languageOption: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 7,
    backgroundColor: '#07111F',
  },
  activeLanguageOption: {
    backgroundColor: '#FFD166',
  },
  languageOptionText: {
    color: 'white',
    fontWeight: 'bold',
  },
  activeLanguageText: {
    color: '#07111F',
  },
  hero: {
    backgroundColor: '#111C2E',
    borderWidth: 1,
    borderColor: '#FFD166',
    padding: 22,
    borderRadius: 26,
    marginBottom: 16,
    alignItems: 'center',
  },
  logo: {
    fontSize: 52,
  },
  appName: {
    color: '#FFD166',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  title: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    color: '#A7B0C0',
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: 10,
  },
  homeProfileCard: {
    backgroundColor: '#0B1729',
    borderWidth: 1,
    borderColor: '#24344F',
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  homeAvatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#132238',
  },
  homeAvatarFallback: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#132238',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFD166',
  },
  homeAvatarText: {
    fontSize: 28,
  },
  homeProfileTitle: {
    color: '#FFD166',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  homeProfileText: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#111C2E',
    borderWidth: 1,
    borderColor: '#22314A',
    padding: 18,
    borderRadius: 20,
    marginBottom: 16,
  },
  cardTitle: {
    color: '#FFD166',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  leaguesQuickButton: {
    borderColor: '#FFD166',
  },
  quickButton: {
    width: '48%',
    backgroundColor: '#07111F',
    borderWidth: 1,
    borderColor: '#22314A',
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    minHeight: 92,
    justifyContent: 'center',
  },
  quickIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  quickText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 13,
  },
  featuredCard: {
    backgroundColor: '#1A2A44',
    borderWidth: 1,
    borderColor: '#FFD166',
    padding: 18,
    borderRadius: 22,
    marginBottom: 16,
  },
  featuredLabel: {
    color: '#A7B0C0',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  matchTitle: {
    color: '#FFD166',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 8,
  },
  line: {
    color: 'white',
    fontSize: 15,
    lineHeight: 23,
  },
  goldButton: {
    backgroundColor: '#FFD166',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  goldButtonText: {
    color: '#07111F',
    fontWeight: 'bold',
    fontSize: 16,
  },
  topTools: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  searchBox: {
    flex: 1,
    backgroundColor: '#111C2E',
    borderWidth: 1,
    borderColor: '#22314A',
    borderRadius: 18,
    paddingHorizontal: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 15,
    height: 52,
  },
  clearSearch: {
    color: '#FFD166',
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 6,
  },
  searchResultsBox: {
    backgroundColor: '#111C2E',
    borderWidth: 1,
    borderColor: '#FFD166',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
  },
  searchResultsTitle: {
    color: '#FFD166',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  searchResultItem: {
    backgroundColor: '#07111F',
    borderWidth: 1,
    borderColor: '#22314A',
    borderRadius: 14,
    padding: 13,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchResultIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  searchResultText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noSearchResult: {
    color: '#A7B0C0',
    fontSize: 15,
    lineHeight: 22,
  },
  notificationButton: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#111C2E',
    borderWidth: 1,
    borderColor: '#FFD166',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationIcon: {
    fontSize: 22,
  },
  notificationBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#EF4444',
    width: 19,
    height: 19,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
