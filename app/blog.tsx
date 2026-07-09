import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type TabType = 'blog' | 'news';

type BlogPost = {
  id: string;
  title: string;
  author: string;
  initials: string;
  date: string;
  preview: string;
  body: string;
};

const blogPosts: BlogPost[] = [
  {
    id: 'new-world-cup-champion-2026',
    title: "It's Time for a New World Cup Champion",
    author: 'Prabhu Poudel',
    initials: 'PP',
    date: 'July 2026',
    preview:
      'A first-time World Cup champion in 2026 would show that football is not only about tradition, but also about opportunity, courage, and creating new legends.',
    body:
      "Every four years, football reminds us why it is called the world's game. Yet when the final whistle blows, it is often the same familiar names lifting the trophy. Brazil, Germany, Argentina, France, Italy, and Spain have built incredible legacies—but perhaps 2026 is the year history takes a different path.\n\nThis World Cup feels different. The tournament belongs to three nations as hosts, millions of new fans are watching, and football is growing faster than ever across the globe. What better way to celebrate this new era than by crowning a nation that has never been world champion?\n\nImagine the United States winning on home soil and inspiring an entire generation. Imagine Mexico lifting the trophy in front of one of the most passionate fan bases in football. Or imagine Norway, led by an exciting generation of talent, completing one of the greatest underdog stories in World Cup history after its remarkable run. Recent results have already shown that established giants can be beaten, proving that anything is possible in knockout football.\n\nA first-time champion would show every nation that dreams can become reality. It would inspire young players from countries that have never believed the World Cup was within reach. It would remind us that football is not only about tradition—it is also about opportunity, courage, and creating new legends.\n\nThe greatest stories in sport are often the ones nobody expected. This summer, the football world has a chance to witness history.\n\nWhoever earns it on the pitch, perhaps 2026 should be remembered as the year a new champion changed football forever.",
  },
  {
    id: 'academy-blog',
    title: 'How Young Players Can Improve With 15 Minutes a Day',
    author: 'Soccer Daily Team',
    initials: 'SD',
    date: 'Draft',
    preview:
      'A simple blog space for training ideas, daily discipline, first touch, passing, and confidence-building.',
    body:
      'How Young Players Can Improve With 15 Minutes a Day\n\nYoung players do not always need expensive training to improve. A simple daily routine can help them build confidence, ball control, fitness, and discipline.\n\nStart with five minutes of ball touches, five minutes of wall passing, and five minutes of weak-foot practice. The goal is not pressure. The goal is consistency.\n\nSoccer Daily Academy will help players and parents organize these small goals into a better training habit.',
  },
];


const blogUiText: any = {
  en: {
    back: '← Back',
    backToBlogs: '← Back to Blogs',
    title: 'News & Blog',
    subtitle: 'Blogs written by us. News section ready for future API headlines.',
    blog: 'Blog',
    news: 'News',
    blogsTitle: 'Blogs',
    blogsText: 'Tap any blog card to read the full post.',
    readBlog: 'Read Blog',
    howAddTitle: 'How We Add More Blogs',
    howAddText: 'Add a new item inside the blogPosts list near the top of this file. Later, we can build admin-only blog posting.',
    newsTitle: 'News',
    newsText: 'API-ready section for future live soccer headlines.',
    refreshNews: 'Refresh News from API',
    openWebsite: 'Open Soccer Daily Website',
    apiPlan: 'API Plan',
    api1: '1. App asks our secure backend for soccer news.',
    api2: '2. Backend calls the news/sports API.',
    api3: '3. App shows headlines, source, date, and link.',
    api4: '4. API key stays safe on backend, not inside the app.',
    apiComingTitle: 'News API Coming Soon',
    apiComingText: 'This button is ready for API news. Next step: connect a soccer/news API through a secure backend so the app can load live headlines.',
    errorTitle: 'Error',
    websiteError: 'Could not open website.',
  },
  es: {
    back: '← Atrás',
    backToBlogs: '← Volver a blogs',
    title: 'Noticias y Blog',
    subtitle: 'Blogs escritos por nosotros. La sección de noticias está lista para titulares futuros desde API.',
    blog: 'Blog',
    news: 'Noticias',
    blogsTitle: 'Blogs',
    blogsText: 'Toca cualquier blog para leer la publicación completa.',
    readBlog: 'Leer Blog',
    howAddTitle: 'Cómo agregamos más blogs',
    howAddText: 'Agrega un nuevo elemento en la lista blogPosts cerca de la parte superior de este archivo. Después podemos crear publicación solo para admin.',
    newsTitle: 'Noticias',
    newsText: 'Sección lista para API con futuros titulares de fútbol en vivo.',
    refreshNews: 'Actualizar noticias desde API',
    openWebsite: 'Abrir sitio web de Soccer Daily',
    apiPlan: 'Plan de API',
    api1: '1. La app pide noticias a nuestro backend seguro.',
    api2: '2. El backend llama a la API de noticias/deportes.',
    api3: '3. La app muestra titulares, fuente, fecha y enlace.',
    api4: '4. La clave API queda segura en backend, no dentro de la app.',
    apiComingTitle: 'API de noticias próximamente',
    apiComingText: 'Este botón está listo para noticias por API. Siguiente paso: conectar una API de fútbol/noticias por backend seguro.',
    errorTitle: 'Error',
    websiteError: 'No se pudo abrir el sitio web.',
  },
  ne: {
    back: '← पछाडि',
    backToBlogs: '← Blog मा फर्कनुहोस्',
    title: 'समाचार र ब्लग',
    subtitle: 'हामीले लेखेका blog हरू। News section future API headlines का लागि तयार छ।',
    blog: 'Blog',
    news: 'News',
    blogsTitle: 'Blogs',
    blogsText: 'पूरा post पढ्न कुनै पनि blog card थिच्नुहोस्।',
    readBlog: 'Blog पढ्नुहोस्',
    howAddTitle: 'थप Blog कसरी राख्ने',
    howAddText: 'यो file को माथि रहेको blogPosts list मा नयाँ item थप्नुहोस्। पछि admin-only blog posting बनाउन सक्छौं।',
    newsTitle: 'News',
    newsText: 'Future live soccer headlines का लागि API-ready section.',
    refreshNews: 'API बाट News refresh गर्नुहोस्',
    openWebsite: 'Soccer Daily Website खोल्नुहोस्',
    apiPlan: 'API योजना',
    api1: '1. App ले secure backend बाट soccer news माग्छ।',
    api2: '2. Backend ले news/sports API call गर्छ।',
    api3: '3. App ले headline, source, date र link देखाउँछ।',
    api4: '4. API key backend मा सुरक्षित रहन्छ, app भित्र हुँदैन।',
    apiComingTitle: 'News API चाँडै आउँदैछ',
    apiComingText: 'यो button API news का लागि तयार छ। Next step: secure backend मार्फत soccer/news API connect गर्ने।',
    errorTitle: 'त्रुटि',
    websiteError: 'Website खोल्न सकिएन।',
  },
  hi: {
    back: '← वापस',
    backToBlogs: '← Blogs पर वापस',
    title: 'समाचार और ब्लॉग',
    subtitle: 'हमारे लिखे ब्लॉग। समाचार section future API headlines के लिए तैयार है।',
    blog: 'ब्लॉग',
    news: 'समाचार',
    blogsTitle: 'ब्लॉग',
    blogsText: 'पूरा पोस्ट पढ़ने के लिए किसी ब्लॉग कार्ड पर टैप करें।',
    readBlog: 'ब्लॉग पढ़ें',
    howAddTitle: 'और ब्लॉग कैसे जोड़ें',
    howAddText: 'इस file के ऊपर blogPosts list में नया item जोड़ें। बाद में admin-only ब्लॉग posting बना सकते हैं।',
    newsTitle: 'समाचार',
    newsText: 'भविष्य के live soccer headlines के लिए API-ready section.',
    refreshNews: 'API से समाचार refresh करें',
    openWebsite: 'Soccer Daily Website खोलें',
    apiPlan: 'API Plan',
    api1: '1. App secure backend से soccer news मांगता है।',
    api2: '2. Backend news/sports API call करता है।',
    api3: '3. App headlines, source, date और link दिखाता है।',
    api4: '4. API key backend पर safe रहती है, app के अंदर नहीं।',
    apiComingTitle: 'News API जल्द आएगा',
    apiComingText: 'यह button API news के लिए ready है। Next step: secure backend से soccer/news API connect करना।',
    errorTitle: 'Error',
    websiteError: 'Website open नहीं हो सका।',
  },
  pt: {
    back: '← Voltar',
    backToBlogs: '← Voltar aos blogs',
    title: 'Notícias e Blog',
    subtitle: 'Blogs escritos por nós. A seção de notícias está pronta para futuras manchetes via API.',
    blog: 'Blog',
    news: 'Notícias',
    blogsTitle: 'Blogs',
    blogsText: 'Toque em qualquer blog para ler o post completo.',
    readBlog: 'Ler Blog',
    howAddTitle: 'Como adicionar mais blogs',
    howAddText: 'Adicione um novo item na lista blogPosts perto do topo deste arquivo. Depois podemos criar postagem apenas para admin.',
    newsTitle: 'Notícias',
    newsText: 'Seção pronta para API com futuras manchetes ao vivo.',
    refreshNews: 'Atualizar notícias da API',
    openWebsite: 'Abrir site Soccer Daily',
    apiPlan: 'Plano da API',
    api1: '1. O app pede notícias ao backend seguro.',
    api2: '2. O backend chama a API de notícias/esportes.',
    api3: '3. O app mostra manchetes, fonte, data e link.',
    api4: '4. A chave API fica segura no backend, não no app.',
    apiComingTitle: 'API de notícias em breve',
    apiComingText: 'Este botão está pronto para notícias via API. Próximo passo: conectar uma API por backend seguro.',
    errorTitle: 'Erro',
    websiteError: 'Não foi possível abrir o site.',
  },
  fr: {
    back: '← Retour',
    backToBlogs: '← Retour aux blogs',
    title: 'Actualités et Blog',
    subtitle: 'Blogs écrits par nous. La section actualités est prête pour les futurs titres via API.',
    blog: 'Blog',
    news: 'Actualités',
    blogsTitle: 'Blogs',
    blogsText: 'Touchez une carte blog pour lire l’article complet.',
    readBlog: 'Lire le blog',
    howAddTitle: 'Comment ajouter plus de blogs',
    howAddText: 'Ajoutez un nouvel élément dans la liste blogPosts en haut de ce fichier. Plus tard, nous pourrons créer une publication admin.',
    newsTitle: 'Actualités',
    newsText: 'Section prête pour API avec futurs titres de football en direct.',
    refreshNews: 'Actualiser depuis API',
    openWebsite: 'Ouvrir le site Soccer Daily',
    apiPlan: 'Plan API',
    api1: '1. L’app demande les actualités à notre backend sécurisé.',
    api2: '2. Le backend appelle l’API news/sports.',
    api3: '3. L’app affiche titre, source, date et lien.',
    api4: '4. La clé API reste sécurisée côté backend.',
    apiComingTitle: 'API actualités bientôt',
    apiComingText: 'Ce bouton est prêt pour les actualités via API. Prochaine étape : connecter une API via un backend sécurisé.',
    errorTitle: 'Erreur',
    websiteError: 'Impossible d’ouvrir le site.',
  },
  ar: {
    back: '← رجوع',
    backToBlogs: '← العودة إلى المدونات',
    title: 'الأخبار والمدونة',
    subtitle: 'مدونات نكتبها نحن. قسم الأخبار جاهز لعناوين مستقبلية عبر API.',
    blog: 'مدونة',
    news: 'أخبار',
    blogsTitle: 'المدونات',
    blogsText: 'اضغط على أي بطاقة مدونة لقراءة المقال كاملًا.',
    readBlog: 'اقرأ المدونة',
    howAddTitle: 'كيف نضيف مدونات أكثر',
    howAddText: 'أضف عنصرًا جديدًا داخل قائمة blogPosts قرب أعلى هذا الملف. لاحقًا يمكن بناء نشر خاص بالمدير.',
    newsTitle: 'الأخبار',
    newsText: 'قسم جاهز لـ API لعناوين كرة قدم مباشرة مستقبلًا.',
    refreshNews: 'تحديث الأخبار من API',
    openWebsite: 'فتح موقع Soccer Daily',
    apiPlan: 'خطة API',
    api1: '1. التطبيق يطلب أخبار كرة القدم من backend آمن.',
    api2: '2. الـ backend يستدعي API الأخبار/الرياضة.',
    api3: '3. التطبيق يعرض العنوان والمصدر والتاريخ والرابط.',
    api4: '4. مفتاح API يبقى آمنًا في backend وليس داخل التطبيق.',
    apiComingTitle: 'API الأخبار قريبًا',
    apiComingText: 'هذا الزر جاهز لأخبار API. الخطوة التالية: ربط API كرة القدم/الأخبار عبر backend آمن.',
    errorTitle: 'خطأ',
    websiteError: 'تعذر فتح الموقع.',
  },
};


const sampleNews = [
  {
    label: 'APP UPDATE',
    title: 'Player Analysis Lab Added',
    text:
      'Soccer Academy now includes Player Analysis Lab with video link, jersey number, strengths, needs work, coach notes, and 7-day training goals.',
  },
  {
    label: 'COMING SOON',
    title: 'AI Coach Assist',
    text:
      'Future Soccer Daily Pro can include AI-assisted coach notes and deeper player analysis.',
  },
  {
    label: 'NEWS API READY',
    title: 'Live Soccer News Will Come From API',
    text:
      'Later this section can pull real soccer headlines from a news API instead of writing every news item manually.',
  },
];

export default function NewsBlogScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('blog');
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [language, setLanguage] = useState('en');

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadLanguage() {
        const saved = await AsyncStorage.getItem('soccerDailyLanguage');
        if (active && saved) {
          setLanguage(saved);
        }
      }

      loadLanguage();

      return () => {
        active = false;
      };
    }, [])
  );

  const t = blogUiText[language] || blogUiText.en;

  function refreshNewsFromApi() {
    Alert.alert(t.apiComingTitle, t.apiComingText);
  }

  async function openSoccerDailyWebsite() {
    try {
      await Linking.openURL('https://soccerdailyapp.com');
    } catch (error) {
      Alert.alert(t.errorTitle, t.websiteError);
    }
  }

  if (selectedBlog) {
    return (
      <ScrollView style={styles.page} contentContainerStyle={styles.content}>
        <Pressable style={styles.backButton} onPress={() => setSelectedBlog(null)}>
          <Text style={styles.backText}>{t.backToBlogs}</Text>
        </Pressable>

        <View style={styles.fullBlogCard}>
          <View style={styles.authorRow}>
            <View style={styles.authorPhoto}>
              <Text style={styles.authorPhotoText}>{selectedBlog.initials}</Text>
            </View>

            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{selectedBlog.author}</Text>
              <Text style={styles.blogDate}>{selectedBlog.date}</Text>
            </View>
          </View>

          <Text style={styles.fullBlogTitle}>{selectedBlog.title}</Text>

          {selectedBlog.body.split('\n').map((paragraph, index) => (
            <Text key={index} style={paragraph.trim() ? styles.fullBlogText : styles.fullBlogSpace}>
              {paragraph}
            </Text>
          ))}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>{t.back}</Text>
      </Pressable>

      <View style={styles.hero}>
        <Text style={styles.kicker}>SOCCER DAILY</Text>
        <Text style={styles.title}>{t.title}</Text>
        <Text style={styles.subtitle}>{t.subtitle}</Text>
      </View>

      <View style={styles.tabRow}>
        <Pressable
          style={activeTab === 'blog' ? styles.activeTab : styles.inactiveTab}
          onPress={() => setActiveTab('blog')}
        >
          <Text style={activeTab === 'blog' ? styles.activeTabText : styles.inactiveTabText}>
            {t.blog}
          </Text>
        </Pressable>

        <Pressable
          style={activeTab === 'news' ? styles.activeTab : styles.inactiveTab}
          onPress={() => setActiveTab('news')}
        >
          <Text style={activeTab === 'news' ? styles.activeTabText : styles.inactiveTabText}>
            {t.news}
          </Text>
        </Pressable>
      </View>

      {activeTab === 'blog' ? (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.blogsTitle}</Text>
            <Text style={styles.sectionText}>{t.blogsText}</Text>
          </View>

          {blogPosts.map((post) => (
            <Pressable key={post.id} style={styles.blogCard} onPress={() => setSelectedBlog(post)}>
              <View style={styles.authorRow}>
                <View style={styles.authorPhoto}>
                  <Text style={styles.authorPhotoText}>{post.initials}</Text>
                </View>

                <View style={styles.authorInfo}>
                  <Text style={styles.authorName}>{post.author}</Text>
                  <Text style={styles.blogDate}>{post.date}</Text>
                </View>
              </View>

              <Text style={styles.blogTitle}>{post.title}</Text>
              <Text style={styles.blogPreview}>{post.preview}</Text>

              <View style={styles.readButton}>
                <Text style={styles.readButtonText}>{t.readBlog} →</Text>
              </View>
            </Pressable>
          ))}

          <View style={styles.noteCard}>
            <Text style={styles.noteTitle}>{t.howAddTitle}</Text>
            <Text style={styles.noteText}>{t.howAddText}</Text>
          </View>
        </>
      ) : (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.newsTitle}</Text>
            <Text style={styles.sectionText}>{t.newsText}</Text>
          </View>

          <Pressable style={styles.refreshButton} onPress={refreshNewsFromApi}>
            <Text style={styles.refreshButtonText}>{t.refreshNews}</Text>
          </Pressable>

          {sampleNews.map((item, index) => (
            <Pressable key={index} style={styles.newsCard} onPress={refreshNewsFromApi}>
              <Text style={styles.newsLabel}>{item.label}</Text>
              <Text style={styles.newsTitle}>{item.title}</Text>
              <Text style={styles.newsText}>{item.text}</Text>
            </Pressable>
          ))}

          <Pressable style={styles.websiteButton} onPress={openSoccerDailyWebsite}>
            <Text style={styles.websiteButtonText}>{t.openWebsite}</Text>
          </Pressable>

          <View style={styles.apiNoteCard}>
            <Text style={styles.apiNoteTitle}>{t.apiPlan}</Text>
            <Text style={styles.apiNoteText}>{t.api1}</Text>
            <Text style={styles.apiNoteText}>{t.api2}</Text>
            <Text style={styles.apiNoteText}>{t.api3}</Text>
            <Text style={styles.apiNoteText}>{t.api4}</Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#07111F',
  },
  content: {
    padding: 18,
    paddingTop: 62,
    paddingBottom: 46,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#132238',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#FFD166',
    marginBottom: 14,
  },
  backText: {
    color: '#FFD166',
    fontSize: 15,
    fontWeight: '900',
  },
  hero: {
    backgroundColor: '#0B1729',
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: '#FFD166',
    marginBottom: 16,
  },
  kicker: {
    color: '#22C55E',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.3,
    marginBottom: 8,
  },
  title: {
    color: '#FFD166',
    fontSize: 36,
    fontWeight: '900',
    marginBottom: 10,
  },
  subtitle: {
    color: '#E2E8F0',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
  },
  tabRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  activeTab: {
    flex: 1,
    backgroundColor: '#FFD166',
    borderRadius: 999,
    paddingVertical: 13,
    alignItems: 'center',
  },
  activeTabText: {
    color: '#07111F',
    fontSize: 16,
    fontWeight: '900',
  },
  inactiveTab: {
    flex: 1,
    backgroundColor: '#111C2E',
    borderRadius: 999,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#24344F',
  },
  inactiveTabText: {
    color: '#CBD5E1',
    fontSize: 16,
    fontWeight: '900',
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#FFD166',
    fontSize: 25,
    fontWeight: '900',
  },
  sectionText: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '700',
    marginTop: 4,
  },
  blogCard: {
    backgroundColor: '#0B1729',
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: '#FFD166',
    marginBottom: 16,
  },
  fullBlogCard: {
    backgroundColor: '#0B1729',
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFD166',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  authorPhoto: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFD166',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  authorPhotoText: {
    color: '#07111F',
    fontSize: 17,
    fontWeight: '900',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  blogDate: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
  },
  blogTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900',
    lineHeight: 32,
    marginBottom: 10,
  },
  fullBlogTitle: {
    color: '#FFD166',
    fontSize: 31,
    fontWeight: '900',
    lineHeight: 38,
    marginBottom: 18,
  },
  blogPreview: {
    color: '#E2E8F0',
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '700',
    marginBottom: 16,
  },
  fullBlogText: {
    color: '#E2E8F0',
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '700',
    marginBottom: 12,
  },
  fullBlogSpace: {
    height: 8,
  },
  readButton: {
    backgroundColor: '#22C55E',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  readButtonText: {
    color: '#052E16',
    fontSize: 16,
    fontWeight: '900',
  },
  refreshButton: {
    backgroundColor: '#22C55E',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 14,
  },
  refreshButtonText: {
    color: '#052E16',
    fontSize: 16,
    fontWeight: '900',
  },
  newsCard: {
    backgroundColor: '#082F49',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#38BDF8',
    marginBottom: 14,
  },
  newsLabel: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 8,
  },
  newsTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '900',
    marginBottom: 8,
  },
  newsText: {
    color: '#E0F2FE',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
  },
  websiteButton: {
    backgroundColor: '#111C2E',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD166',
    marginBottom: 14,
  },
  websiteButtonText: {
    color: '#FFD166',
    fontSize: 16,
    fontWeight: '900',
  },
  noteCard: {
    backgroundColor: '#2A1F12',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFD166',
    marginTop: 4,
  },
  noteTitle: {
    color: '#FFD166',
    fontSize: 19,
    fontWeight: '900',
    marginBottom: 8,
  },
  noteText: {
    color: '#FFE8A3',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '700',
  },
  apiNoteCard: {
    backgroundColor: '#111C2E',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#24344F',
  },
  apiNoteTitle: {
    color: '#FFD166',
    fontSize: 19,
    fontWeight: '900',
    marginBottom: 8,
  },
  apiNoteText: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '700',
  },
});
