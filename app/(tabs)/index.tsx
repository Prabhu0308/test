import { getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import {collection, doc, getDoc, getDocs, limit, orderBy, query, where} from 'firebase/firestore';
import { useCallback, useRef, useState } from 'react';
import { db } from '../../firebase/config';
import { SOCCER_DAILY_FACEBOOK, SOCCER_DAILY_THREADS, SOCCER_DAILY_X, SOCCER_DAILY_YOUTUBE } from '../../constants/socialLinks';
import { Image, ImageBackground, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';

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
    soccerAcademy: 'Soccer Academy',
    newsBlog: 'News & Blog',
    profile: 'Profile',
    myTeams: 'My Teams',
    favoriteClub: 'Favorite Club',
    nationalTeam: 'National Team',
    followSoccerDaily: 'Follow Soccer Daily',
    officialUpdates: 'Official updates, videos, and community posts',
    watchOnYoutube: 'Watch on YouTube',
    newVideosSoon: 'New videos and beta updates coming soon.',
    openYoutube: 'Open YouTube Channel',
    readCommunityRules: 'Read Community Rules',
    prediction: 'Prediction Wheel',
    fanWall: 'Fan Zone',
    tv: 'Soccer Daily TV',
    studioTitle: 'Soccer Studio',
    studioSub: 'Create • Edit • Go Live',
    studioBadge: '✦ NEW',
    studioButton: 'Studio Tools',
    studioAlert: 'Soccer Studio is opening step by step. Teleprompter, scripts, video ideas, and creator tools are coming soon.',
    studio: 'Studio',
    stats: 'Stats Center',
    featured: 'Featured Match',
    matchup: 'USA vs Mexico',
    matchText: 'Spin the prediction wheel and share your fan opinion before kickoff.',
    community: 'Community Reminder',
    communityText: 'Fan Wall is 13+. Be respectful, do not post private info, and do not upload TV match clips.',
    coming: 'Coming Soon',
    comingText: 'More languages, admin tools, youth safety, talent wall, and stronger soccer community features.',  },
  es: {
    app: 'Soccer Daily',
    welcome: 'Bienvenido a Soccer Daily',
    hero: 'Predice partidos, comparte reacciones, publica videos de 30 segundos y conecta con fans del fútbol.',
    choose: 'Elegir idioma',
    quick: 'Acceso rápido',
    scores: 'Marcadores',
    soccerAcademy: 'Academia de fútbol',
    newsBlog: 'Noticias y Blog',
    profile: 'Perfil',
    myTeams: 'Mis equipos',
    favoriteClub: 'Club favorito',
    nationalTeam: 'Selección nacional',
    followSoccerDaily: 'Sigue Soccer Daily',
    officialUpdates: 'Actualizaciones oficiales, videos y publicaciones de la comunidad',
    watchOnYoutube: 'Ver en YouTube',
    newVideosSoon: 'Nuevos videos y actualizaciones beta próximamente.',
    openYoutube: 'Abrir canal de YouTube',
    readCommunityRules: 'Leer reglas de la comunidad',
    prediction: 'Rueda de predicción',
    fanWall: 'Muro de fans',
    tv: 'Soccer Daily TV',
    studioTitle: 'Soccer Studio',
    studioSub: 'Crear • Editar • En vivo',
    studioBadge: '✦ NUEVO',
    studioButton: 'Herramientas Studio',
    studioAlert: 'Soccer Studio se abrirá paso a paso. Teleprompter, guiones, ideas de video y herramientas para creadores vienen pronto.',
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
    soccerAcademy: 'सकर एकेडेमी',
    newsBlog: 'समाचार र ब्लग',
    profile: 'प्रोफाइल',
    myTeams: 'मेरा टिमहरू',
    favoriteClub: 'मनपर्ने क्लब',
    nationalTeam: 'राष्ट्रिय टिम',
    followSoccerDaily: 'Soccer Daily फलो गर्नुहोस्',
    officialUpdates: 'आधिकारिक अपडेट, भिडियो, र समुदाय पोस्टहरू',
    watchOnYoutube: 'YouTube मा हेर्नुहोस्',
    newVideosSoon: 'नयाँ भिडियो र beta अपडेट चाँडै आउँदैछन्।',
    openYoutube: 'YouTube च्यानल खोल्नुहोस्',
    readCommunityRules: 'समुदाय नियम पढ्नुहोस्',
    prediction: 'भविष्यवाणी चक्का',
    fanWall: 'फ्यान वाल',
    tv: 'Soccer Daily TV',
    studioTitle: 'Soccer Studio',
    studioSub: 'बनाउनुहोस् • सम्पादन • लाइभ',
    studioBadge: '✦ नयाँ',
    studioButton: 'Studio Tools',
    studioAlert: 'Soccer Studio चरणबद्ध रूपमा खुल्दैछ। Teleprompter, scripts, video ideas र creator tools चाँडै आउँदैछन्।',
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
    soccerAcademy: 'सॉकर अकादमी',
    newsBlog: 'न्यूज़ और ब्लॉग',
    profile: 'प्रोफाइल',
    myTeams: 'मेरी टीमें',
    favoriteClub: 'पसंदीदा क्लब',
    nationalTeam: 'राष्ट्रीय टीम',
    followSoccerDaily: 'Soccer Daily फ़ॉलो करें',
    officialUpdates: 'आधिकारिक अपडेट, वीडियो और कम्युनिटी पोस्ट',
    watchOnYoutube: 'YouTube पर देखें',
    newVideosSoon: 'नए वीडियो और beta अपडेट जल्द आ रहे हैं।',
    openYoutube: 'YouTube चैनल खोलें',
    readCommunityRules: 'कम्युनिटी नियम पढ़ें',
    prediction: 'प्रेडिक्शन व्हील',
    fanWall: 'फैन वॉल',
    tv: 'Soccer Daily TV',
    studioTitle: 'Soccer Studio',
    studioSub: 'बनाएं • एडिट करें • लाइव',
    studioBadge: '✦ नया',
    studioButton: 'Studio Tools',
    studioAlert: 'Soccer Studio धीरे-धीरे खुल रहा है। Teleprompter, scripts, video ideas और creator tools जल्द आएंगे।',
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
    soccerAcademy: 'Academia de Futebol',
    newsBlog: 'Notícias e Blog',
    profile: 'Perfil',
    myTeams: 'Meus times',
    favoriteClub: 'Clube favorito',
    nationalTeam: 'Seleção nacional',
    followSoccerDaily: 'Siga Soccer Daily',
    officialUpdates: 'Atualizações oficiais, vídeos e posts da comunidade',
    watchOnYoutube: 'Assista no YouTube',
    newVideosSoon: 'Novos vídeos e atualizações beta em breve.',
    openYoutube: 'Abrir canal do YouTube',
    readCommunityRules: 'Ler regras da comunidade',
    prediction: 'Roda de previsão',
    fanWall: 'Mural dos fãs',
    tv: 'Soccer Daily TV',
    studioTitle: 'Soccer Studio',
    studioSub: 'Criar • Editar • Ao vivo',
    studioBadge: '✦ NOVO',
    studioButton: 'Ferramentas Studio',
    studioAlert: 'Soccer Studio será aberto por etapas. Teleprompter, roteiros, ideias de vídeo e ferramentas de criação chegam em breve.',
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
    soccerAcademy: 'Académie de football',
    newsBlog: 'Actualités et Blog',
    profile: 'Profil',
    myTeams: 'Mes équipes',
    favoriteClub: 'Club favori',
    nationalTeam: 'Équipe nationale',
    followSoccerDaily: 'Suivre Soccer Daily',
    officialUpdates: 'Mises à jour officielles, vidéos et publications de la communauté',
    watchOnYoutube: 'Regarder sur YouTube',
    newVideosSoon: 'Nouvelles vidéos et mises à jour bêta bientôt.',
    openYoutube: 'Ouvrir la chaîne YouTube',
    readCommunityRules: 'Lire les règles de la communauté',
    prediction: 'Roue de prédiction',
    fanWall: 'Mur des fans',
    tv: 'Soccer Daily TV',
    studioTitle: 'Soccer Studio',
    studioSub: 'Créer • Modifier • En direct',
    studioBadge: '✦ NOUVEAU',
    studioButton: 'Outils Studio',
    studioAlert: 'Soccer Studio ouvrira étape par étape. Téléprompteur, scripts, idées vidéo et outils créateurs arrivent bientôt.',
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
    soccerAcademy: 'أكاديمية كرة القدم',
    newsBlog: 'الأخبار والمدونة',
    profile: 'الملف الشخصي',
    myTeams: 'فرقي',
    favoriteClub: 'النادي المفضل',
    nationalTeam: 'المنتخب الوطني',
    followSoccerDaily: 'تابع Soccer Daily',
    officialUpdates: 'تحديثات رسمية وفيديوهات ومنشورات المجتمع',
    watchOnYoutube: 'شاهد على YouTube',
    newVideosSoon: 'فيديوهات جديدة وتحديثات beta قريبًا.',
    openYoutube: 'افتح قناة YouTube',
    readCommunityRules: 'اقرأ قواعد المجتمع',
    prediction: 'عجلة التوقع',
    fanWall: 'حائط المشجعين',
    tv: 'Soccer Daily TV',
    studioTitle: 'Soccer Studio',
    studioSub: 'إنشاء • تحرير • بث مباشر',
    studioBadge: '✦ جديد',
    studioButton: 'أدوات الاستوديو',
    studioAlert: 'سيتم فتح Soccer Studio خطوة بخطوة. التلقين، النصوص، أفكار الفيديو وأدوات المبدعين قادمة قريبًا.',
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


const homeUi: any = {
  en: {
    dailyChallenge: 'Daily Challenge',
    trainingFitness: 'Training & Fitness',
    tvMiniLabel: 'WATCH ON YOUTUBE',
    tvTitle: 'Soccer Daily TV',
    tvDescription: 'New videos and beta updates coming soon.',
    tvButton: 'Open YouTube Channel',
    tvNote: 'New videos and beta updates coming soon.',
    searchPlaceholder: '{ui.searchPlaceholder}',
  },
  es: {
    dailyChallenge: 'Reto diario',
    trainingFitness: 'Entrenamiento y condición física',
    tvMiniLabel: 'VER EN YOUTUBE',
    tvTitle: 'Soccer Daily TV',
    tvDescription: 'Reacciones de fans, predicciones, charlas de partidos, ideas de entrenamiento y novedades beta de Soccer Daily.',
    tvButton: 'Abrir canal de YouTube',
    tvNote: 'Nuevos videos y actualizaciones beta llegarán pronto.',
    searchPlaceholder: 'Buscar equipos, noticias, fans...',
  },
  ne: {
    dailyChallenge: 'दैनिक फुटबल चुनौती',
    trainingFitness: 'तालिम र फिटनेस',
    tvMiniLabel: 'YOUTUBE मा हेर्नुहोस्',
    tvTitle: 'Soccer Daily TV',
    tvDescription: 'फ्यान प्रतिक्रिया, भविष्यवाणी, म्याच चर्चा, तालिम सुझाव र Soccer Daily beta अपडेटहरू हेर्नुहोस्।',
    tvButton: 'YouTube च्यानल खोल्नुहोस्',
    tvNote: 'नयाँ भिडियो र beta अपडेटहरू चाँडै आउँदैछन्।',
    searchPlaceholder: 'टिम, समाचार, फ्यान खोज्नुहोस्...',
  },
  hi: {
    dailyChallenge: 'दैनिक फुटबॉल चुनौती',
    trainingFitness: 'ट्रेनिंग और फिटनेस',
    tvMiniLabel: 'YOUTUBE पर देखें',
    tvTitle: 'Soccer Daily TV',
    tvDescription: 'फैन रिएक्शन, भविष्यवाणी, मैच चर्चा, ट्रेनिंग आइडिया और Soccer Daily beta अपडेट देखें।',
    tvButton: 'YouTube चैनल खोलें',
    tvNote: 'नए वीडियो और beta अपडेट जल्द आएँगे।',
    searchPlaceholder: 'टीम, खबरें, फैंस खोजें...',
  },
  pt: {
    dailyChallenge: 'Desafio diário',
    trainingFitness: 'Treino e condicionamento',
    tvMiniLabel: 'ASSISTA NO YOUTUBE',
    tvTitle: 'Soccer Daily TV',
    tvDescription: 'Reações dos fãs, previsões, conversas sobre jogos, ideias de treino e atualizações beta do Soccer Daily.',
    tvButton: 'Abrir canal no YouTube',
    tvNote: 'Novos vídeos e atualizações beta em breve.',
    searchPlaceholder: 'Buscar times, notícias, fãs...',
  },
  fr: {
    dailyChallenge: 'Défi quotidien',
    trainingFitness: 'Entraînement et forme',
    tvMiniLabel: 'REGARDER SUR YOUTUBE',
    tvTitle: 'Soccer Daily TV',
    tvDescription: 'Réactions des fans, prédictions, discussions de match, idées d’entraînement et mises à jour beta de Soccer Daily.',
    tvButton: 'Ouvrir la chaîne YouTube',
    tvNote: 'Nouvelles vidéos et mises à jour beta bientôt disponibles.',
    searchPlaceholder: 'Rechercher équipes, actus, fans...',
  },
  ar: {
    dailyChallenge: 'تحدي كرة القدم اليومي',
    trainingFitness: 'التدريب واللياقة',
    tvMiniLabel: 'شاهد على يوتيوب',
    tvTitle: 'Soccer Daily TV',
    tvDescription: 'ردود فعل المشجعين، التوقعات، نقاشات المباريات، أفكار التدريب، وتحديثات Soccer Daily التجريبية.',
    tvButton: 'افتح قناة يوتيوب',
    tvNote: 'فيديوهات جديدة وتحديثات تجريبية قريبًا.',
    searchPlaceholder: 'ابحث عن الفرق، الأخبار، المشجعين...',
  },
};


export default function HomeScreen() {
  async function openSocialLink(url: string) {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.log('Could not open social link:', url);
    }
  }

  async function openProtectedRoute(routeName: string) {
    const manualLogout = await AsyncStorage.getItem('soccerDailyManualLogout');
    const auth = getAuth();

    if (manualLogout === 'true' || !auth.currentUser) {
      router.push('/login' as any);
      return;
    }

    router.push(routeName as any);
  }

  const [notificationBadgeCount, setNotificationBadgeCount] = useState(0);
  const [language, setLanguage] = useState('en');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [homePhotoUrl, setHomePhotoUrl] = useState('');
  const [homeCoverPhotoUrl, setHomeCoverPhotoUrl] = useState('');

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function reloadHomePhotosAfterLogin() {
        try {
          const auth = getAuth();
          const user = auth.currentUser;
          if (!user?.uid) return;

          const uid = user.uid;

          let mergedData: any = {};

          for (const collectionName of ['users', 'publicProfiles', 'userProfiles']) {
            try {
              const snap = await getDoc(doc(db, collectionName, uid));
              if (snap.exists()) {
                mergedData = {
                  ...mergedData,
                  ...snap.data(),
                };
              }
            } catch (error) {
              console.log('Home photo lookup skipped:', collectionName, error);
            }
          }

          const localProfilePhoto =
            await AsyncStorage.getItem(`profilePhotoUrl:${uid}`) ||
            await AsyncStorage.getItem('profilePhotoUrl') ||
            await AsyncStorage.getItem('soccerDailyProfilePhoto') ||
            await AsyncStorage.getItem('homePhotoUrl') ||
            '';

          const localCoverPhoto =
            await AsyncStorage.getItem(`coverPhotoUrl:${uid}`) ||
            await AsyncStorage.getItem(`homeCoverPhotoUrl:${uid}`) ||
            await AsyncStorage.getItem('coverPhotoUrl') ||
            await AsyncStorage.getItem('homeCoverPhotoUrl') ||
            await AsyncStorage.getItem('soccerDailyCoverPhoto') ||
            '';

          const loadedProfilePhoto =
            mergedData.photoURL ||
            mergedData.photoUrl ||
            mergedData.profileImageUrl ||
            mergedData.avatarUrl ||
            user.photoURL ||
            localProfilePhoto ||
            '';

          const loadedCoverPhoto =
            mergedData.coverPhotoUrl ||
            mergedData.homeCoverPhotoUrl ||
            mergedData.coverPhoto ||
            localCoverPhoto ||
            '';

          if (!cancelled) {
            if (loadedProfilePhoto) setHomePhotoUrl(loadedProfilePhoto);
            if (loadedCoverPhoto) setHomeCoverPhotoUrl(loadedCoverPhoto);
          }
        } catch (error) {
          console.log('Reload home photos failed:', error);
        }
      }

      reloadHomePhotosAfterLogin();

      return () => {
        cancelled = true;
      };
    }, [])
  );

  const [homeClubTeam, setHomeClubTeam] = useState('');
  const [homeNationalTeam, setHomeNationalTeam] = useState('');
  const searchInputRef = useRef<TextInput>(null);

  async function openSoccerDailyYouTube() {
    try {
      await Linking.openURL(SOCCER_DAILY_YOUTUBE);
    } catch (error) {
      console.log('YouTube open error:', error);
    }
  }


  useFocusEffect(
    useCallback(() => {
      loadLanguage();
      loadHomeProfile();
    }, [])
  );


  async function loadHomeProfile() {
    try {
      const user = getAuth().currentUser;
      const currentEmail =
        user?.email?.trim().toLowerCase() || '';

      if (!currentEmail) {
        setNotificationBadgeCount(0);
      } else {
        const q = query(
          collection(db, 'appNotifications'),
          where('targetEmail', '==', currentEmail),
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
      }
    } catch (error) {
      console.log('Home notification count error:', error);
      setNotificationBadgeCount(0);
    }

    const localClub = await AsyncStorage.getItem('favoriteClubTeam');
    const localClubAlt = await AsyncStorage.getItem('soccerDailyFavoriteClub');
    const fanZoneClub = await AsyncStorage.getItem('savedFanBadge');

    const localNational = await AsyncStorage.getItem('favoriteNationalTeam');
    const localNationalAlt = await AsyncStorage.getItem('soccerDailyFavoriteNational');

    setHomeClubTeam(localClub || '');
    setHomeNationalTeam(localNational || '');

    const user = getAuth().currentUser;
    if (!user?.uid) return;

    try {
      const snap = await getDoc(doc(db, 'userProfiles', user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setHomePhotoUrl(data.photoUrl || '');
          setHomeCoverPhotoUrl(data.coverPhotoUrl || '');
        const clubFromAnywhere =
          data.favoriteClubTeam ||
          data.savedFanBadge ||
          localClub ||
          localClubAlt ||
          fanZoneClub ||
          '';

        const nationalFromAnywhere =
          data.favoriteNationalTeam ||
          localNational ||
          localNationalAlt ||
          '';

        setHomeClubTeam(clubFromAnywhere);
        setHomeNationalTeam(nationalFromAnywhere);
      }
    } catch {}
  }

  async function openNotificationsAndClear() {
    openProtectedRoute('/notifications');
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

  const ui = homeUi[language] || homeUi.en;

  const homeUser = getAuth().currentUser;
  const homeUserName =
    homeUser?.displayName || homeUser?.email?.split('@')[0] || 'Soccer Fan';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.compactTopBar}>
        <Pressable
          style={styles.compactLanguageButton}
          onPress={() => setShowLanguageMenu(!showLanguageMenu)}
        >
          <Text style={styles.compactLanguageText}>
            🌐 {selectedLanguage.flag} {selectedLanguage.label}
          </Text>
          <Text style={styles.compactLanguageArrow}>{showLanguageMenu ? '▲' : '▼'}</Text>
        </Pressable>

        <View style={styles.compactTopActions}>
          <Pressable style={styles.compactIconButton} onPress={() => router.push('/search' as any)}>
            <Text style={styles.compactIconText}>🔎</Text>
          </Pressable>

          <Pressable style={styles.compactIconButton} onPress={openNotificationsAndClear}>
            <Text style={styles.compactIconText}>🔔</Text>
            {notificationBadgeCount > 0 ? (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{notificationBadgeCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>

      {showLanguageMenu ? (
        <View style={styles.homeLanguageMenu}>
          {languageOptions.map((item) => (
            <Pressable
              key={item.code}
              style={[
                styles.homeLanguageOption,
                language === item.code && styles.homeLanguageOptionActive,
              ]}
              onPress={async () => {
                setLanguage(item.code);
                setShowLanguageMenu(false);
                await AsyncStorage.setItem('soccerDailyLanguage', item.code);
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

      {(homeCoverPhotoUrl || homePhotoUrl) ? (
        <ImageBackground
          source={{ uri: homeCoverPhotoUrl || homePhotoUrl }}
          style={styles.personalHero}
          imageStyle={styles.personalHeroImage}
        >
          <View style={styles.personalHeroOverlay}>
            <View style={styles.personalHeroTop}>
              <Text style={styles.personalAppName}>⚽ {t.app}</Text>
              <Text style={styles.personalWelcome}>{t.welcome || 'My Soccer Home'}</Text>
            </View>

            <View style={styles.personalHeroBottom}>
              {homePhotoUrl ? (
                <Image source={{ uri: homePhotoUrl }} style={styles.personalAvatar} />
              ) : (
                <View style={styles.personalAvatarFallback}>
                  <Text style={styles.personalAvatarText}>⚽</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.personalName}>{homeUserName}</Text>
                <Text style={styles.personalBadge}>🏟️ Club: {homeClubTeam || 'Not selected'}</Text>
                <Text style={styles.personalBadge}>🌎 National: {homeNationalTeam || 'Not selected'}</Text>
                <Text style={styles.personalBadge}>🌐 Language: {selectedLanguage.flag} {selectedLanguage.label}</Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      ) : (
        <View style={styles.personalHeroFallback}>
          <View style={styles.personalHeroTop}>
            <Text style={styles.personalAppName}>⚽ {t.app}</Text>
            <Text style={styles.personalWelcome}>{t.welcome || 'My Soccer Home'}</Text>
          </View>

          <View style={styles.personalHeroBottom}>
            <View style={styles.personalAvatarFallback}>
              <Text style={styles.personalAvatarText}>⚽</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.personalName}>{homeUserName}</Text>
              <Text style={styles.personalBadge}>🏟️ Club: {homeClubTeam || 'Not selected'}</Text>
              <Text style={styles.personalBadge}>🌎 National: {homeNationalTeam || 'Not selected'}</Text>
                <Text style={styles.personalBadge}>🌐 Language: {selectedLanguage.flag} {selectedLanguage.label}</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.myTeamsCard}>
        <Text style={styles.myTeamsTitle}>{t.myTeams}</Text>

        <View style={styles.myTeamsRow}>
          <Text style={styles.myTeamsEmoji}>🏟️</Text>
          <View style={styles.myTeamsTextBox}>
            <Text style={styles.myTeamsLabel}>{t.favoriteClub}</Text>
            <Text style={styles.myTeamsValue}>{homeClubTeam || 'Pick your club in Fan Zone'}</Text>
          </View>
        </View>

        <View style={styles.myTeamsRow}>
          <Text style={styles.myTeamsEmoji}>🌎</Text>
          <View style={styles.myTeamsTextBox}>
            <Text style={styles.myTeamsLabel}>{t.nationalTeam}</Text>
            <Text style={styles.myTeamsValue}>{homeNationalTeam || 'Add national team in Profile'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t.quick}</Text>

        <View style={styles.grid}>
          <Pressable style={[styles.quickButton, styles.quickScores]} onPress={() => router.push('/soccer-lab' as any)}>
            <Text style={styles.quickIcon}>🎓</Text>
            <Text style={styles.quickText}>{t.soccerAcademy}</Text>
          </Pressable>

          <Pressable style={[styles.quickButton, styles.quickFanZone]} onPress={() => openProtectedRoute('/fan-wall')}>
            <Text style={styles.quickIcon}>💬</Text>
            <Text style={styles.quickText}>Fan Zone</Text>
          </Pressable>

          <Pressable style={[styles.quickButton, styles.quickPrediction]} onPress={() => openProtectedRoute('/prediction')}>
            <Text style={styles.quickIcon}>🔮</Text>
            <Text style={styles.quickText}>{t.prediction}</Text>
          </Pressable>

          <Pressable style={[styles.quickButton, styles.quickAcademy]} onPress={() => router.push('/scores' as any)}>
            <Text style={styles.quickIcon}>📊</Text>
            <Text style={styles.quickText}>{t.scores}</Text>
          </Pressable>

          <Pressable style={[styles.quickButton, styles.quickProfile]} onPress={() => router.push('/profile' as any)}>
            <Text style={styles.quickIcon}>👤</Text>
            <Text style={styles.quickText}>{t.profile}</Text>
          </Pressable>

          <Pressable style={[styles.quickButton, styles.quickBlog]} onPress={() => router.push('/blog' as any)}>
            <Text style={styles.quickIcon}>📰</Text>
            <Text style={styles.quickText}>{t.newsBlog}</Text>
          </Pressable>
        </View>
      </View>



      <Pressable
        style={styles.studioKeyCard}
        onPress={() => router.push('/studio' as any)}
      >
        <View pointerEvents="none" style={styles.studioKeyFacetLeft} />
        <View pointerEvents="none" style={styles.studioKeyFacetRight} />
        <View pointerEvents="none" style={styles.studioKeyShine} />

        <View style={styles.studioIconCluster}>
          <Text style={styles.studioClapIcon}>🎬</Text>
          <Text style={styles.studioMicIcon}>🎙️</Text>
        </View>

        <View style={styles.studioTextBlock}>
          <View style={styles.studioBadge}>
            <Text style={styles.studioBadgeText}>{t.studioBadge}</Text>
          </View>

          <Text style={styles.studioKeyTitle}>{t.studioTitle}</Text>
          <Text style={styles.studioKeySub}>{t.studioSub}</Text>

          <View style={styles.studioToolPill}>
            <Text style={styles.studioToolText}>✨ {t.studioButton}</Text>
            <Text style={styles.studioToolArrow}>›</Text>
          </View>
        </View>
      </Pressable>

      <View style={styles.tvGlowCard}>
        <View style={styles.tvTopRow}>
          <View style={styles.tvIconCircle}>
            <Text style={styles.tvIcon}>📺</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.tvMiniLabel}>{ui.tvMiniLabel}</Text>
            <Text style={styles.tvTitle}>{ui.tvTitle}</Text>
          </View>
        </View>

        <Text style={styles.tvDescription}>{t.newVideosSoon}</Text>

        <Pressable style={styles.youtubeMegaButton} onPress={openSoccerDailyYouTube}>
          <Text style={styles.youtubePlay}>▶</Text>
          <Text style={styles.youtubeMegaText}>{ui.tvButton}</Text>
        </Pressable>
      </View>

      <View style={styles.socialCard}>
        <Text style={styles.socialTitle}>{t.followSoccerDaily}</Text>
        <Text style={styles.socialSub}>{t.officialUpdates}</Text>

        <View style={styles.socialRow}>
          <Pressable style={styles.socialButton} onPress={() => openSocialLink(SOCCER_DAILY_YOUTUBE)}>
            <Text style={styles.socialButtonText}>▶ YouTube</Text>
          </Pressable>

          <Pressable style={styles.socialButton} onPress={() => openSocialLink(SOCCER_DAILY_FACEBOOK)}>
            <Text style={styles.socialButtonText}>f Facebook</Text>
          </Pressable>
        </View>

        <View style={styles.socialRow}>
          <Pressable style={styles.socialButton} onPress={() => openSocialLink(SOCCER_DAILY_THREADS)}>
            <Text style={styles.socialButtonText}>@ Threads</Text>
          </Pressable>

          <Pressable style={styles.socialButton} onPress={() => openSocialLink(SOCCER_DAILY_X)}>
            <Text style={styles.socialButtonText}>𝕏 X</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.featuredCard}>
        <Text style={styles.featuredLabel}>{t.featured}</Text>
        <Text style={styles.matchTitle}>{t.matchup}</Text>
        <Text style={styles.line}>{t.matchText}</Text>
      </View>

      <Pressable style={styles.card} onPress={() => router.push('/community-guidelines' as any)}>
        <Text style={styles.cardTitle}>⚽ {t.community}</Text>
        <Text style={styles.line}>{t.communityText}</Text>
        <Text style={styles.cardLink}>{t.readCommunityRules}  →</Text>
      </Pressable>

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

  compactTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  compactLanguageButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 20,
    backgroundColor: '#111C2E',
    borderWidth: 1,
    borderColor: '#22314A',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactLanguageText: {
    color: '#FFD166',
    fontSize: 17,
    fontWeight: '900',
  },
  compactLanguageArrow: {
    color: '#FFD166',
    fontSize: 16,
    fontWeight: '900',
  },
  compactTopActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compactIconButton: {
    width: 54,
    height: 54,
    borderRadius: 20,
    backgroundColor: '#111C2E',
    borderWidth: 1.5,
    borderColor: '#FFD166',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactIconText: {
    fontSize: 25,
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
  personalHero: {
    height: 285,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 18,
    backgroundColor: '#111C2E',
    borderWidth: 1,
    borderColor: '#22314A',
  },
  personalHeroImage: {
    borderRadius: 28,
  },
  personalHeroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 17, 31, 0.55)',
    padding: 18,
    justifyContent: 'space-between',
  },
  personalHeroFallback: {
    height: 285,
    borderRadius: 28,
    marginBottom: 18,
    backgroundColor: '#111C2E',
    borderWidth: 1,
    borderColor: '#22314A',
    padding: 18,
    justifyContent: 'space-between',
  },
  personalHeroTop: {
    alignItems: 'flex-start',
  },
  personalAppName: {
    color: '#FFD166',
    fontSize: 18,
    fontWeight: '900',
  },
  personalWelcome: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
    marginTop: 8,
  },
  personalHeroBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(7, 17, 31, 0.72)',
    borderRadius: 22,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.35)',
  },
  personalAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#FFD166',
  },
  personalAvatarFallback: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: 12,
    backgroundColor: '#07111F',
    borderWidth: 2,
    borderColor: '#FFD166',
    alignItems: 'center',
    justifyContent: 'center',
  },
  personalAvatarText: {
    fontSize: 30,
  },
  personalName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
  },
  personalBadge: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
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


  studioKeyCard: {
    minHeight: 142,
    marginBottom: 16,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#FFD166',
    backgroundColor: '#0B1729',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    shadowColor: '#FFD166',
    shadowOpacity: 0.32,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 12,
  },
  studioKeyFacetLeft: {
    position: 'absolute',
    left: -46,
    top: 18,
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255, 209, 102, 0.13)',
    transform: [{ rotate: '45deg' }],
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.45)',
  },
  studioKeyFacetRight: {
    position: 'absolute',
    right: -52,
    top: 14,
    width: 130,
    height: 130,
    backgroundColor: 'rgba(96, 165, 250, 0.13)',
    transform: [{ rotate: '45deg' }],
    borderWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.35)',
  },
  studioKeyShine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 52,
    backgroundColor: 'rgba(255,255,255,0.055)',
  },
  studioIconCluster: {
    width: 92,
    height: 92,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.55)',
    backgroundColor: 'rgba(7, 17, 31, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  studioClapIcon: {
    fontSize: 38,
    marginBottom: -6,
  },
  studioMicIcon: {
    fontSize: 30,
    marginTop: -4,
  },
  studioTextBlock: {
    flex: 1,
  },
  studioBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#FFD166',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 6,
    backgroundColor: 'rgba(255, 209, 102, 0.12)',
  },
  studioBadgeText: {
    color: '#FFD166',
    fontWeight: '900',
    fontSize: 12,
  },
  studioKeyTitle: {
    color: '#FFD166',
    fontSize: 29,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  studioKeySub: {
    color: '#EAF2FF',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 3,
    marginBottom: 12,
  },
  studioToolPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD166',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: 'rgba(255, 209, 102, 0.09)',
  },
  studioToolText: {
    color: '#FFD166',
    fontWeight: '900',
    fontSize: 14,
  },
  studioToolArrow: {
    color: '#FFD166',
    fontWeight: '900',
    fontSize: 22,
    marginLeft: 9,
    marginTop: -2,
  },

  tvGlowCard: {
    marginTop: 18,
    marginBottom: 22,
    padding: 22,
    borderRadius: 30,
    backgroundColor: '#101B2D',
    borderWidth: 2,
    borderColor: '#FFD166',
    shadowColor: '#FFD166',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  tvTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  tvIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#07111F',
    borderWidth: 1,
    borderColor: '#FFD166',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tvIcon: {
    fontSize: 32,
  },
  tvMiniLabel: {
    color: '#8FA3B8',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  tvTitle: {
    color: '#FFD166',
    fontSize: 30,
    fontWeight: '900',
    marginTop: 3,
  },
  tvDescription: {
    color: '#E6EEF8',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 18,
  },
  youtubeMegaButton: {
    minHeight: 64,
    borderRadius: 22,
    backgroundColor: '#FFD166',
    borderWidth: 2,
    borderColor: '#FFE8A8',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  youtubePlay: {
    color: '#07111F',
    fontSize: 22,
    fontWeight: '900',
  },
  youtubeMegaText: {
    color: '#07111F',
    fontSize: 18,
    fontWeight: '900',
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

  quickScores: {
    backgroundColor: '#064E3B',
    borderColor: '#22C55E',
  },
  quickFanZone: {
    backgroundColor: '#082F49',
    borderColor: '#38BDF8',
  },
  quickPrediction: {
    backgroundColor: '#2E1065',
    borderColor: '#A78BFA',
  },
  quickAcademy: {
    backgroundColor: '#14532D',
    borderColor: '#FFD166',
  },
  quickProfile: {
    backgroundColor: '#1E293B',
    borderColor: '#94A3B8',
  },
  quickTV: {
    backgroundColor: '#3F0F12',
    borderColor: '#FCA5A5',
  },
  quickBlog: {
    backgroundColor: '#3F0F12',
    borderColor: '#FCA5A5',
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
  cardLink: {
    color: '#FFD166',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 10,
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
  socialCard: {
    backgroundColor: '#0B1526',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.35)',
    padding: 16,
    marginTop: 16,
    marginBottom: 18,
  },
  socialTitle: {
    color: '#FFD166',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  socialSub: {
    color: '#DDE7F0',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  socialButton: {
    flex: 1,
    backgroundColor: '#07111F',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.35)',
    paddingVertical: 12,
    alignItems: 'center',
  },
  socialButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  myTeamsCard: {
    backgroundColor: '#0B1729',
    borderRadius: 26,
    padding: 20,
    borderWidth: 2,
    borderColor: '#FFD166',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,


    },
  myTeamsTitle: {
    color: '#FFD166',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 14,
    textAlign: 'center',

    },
  myTeamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#071526',
    borderRadius: 20,
    padding: 15,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: '#24344F',

    },
  myTeamsEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  myTeamsTextBox: {
    flex: 1,
  },
  myTeamsLabel: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  myTeamsValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 24,

    },

});
