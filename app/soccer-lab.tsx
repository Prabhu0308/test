import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SOCCER_DAILY_YOUTUBE } from '../constants/socialLinks';

const academyText: any = {
  en: {
    title: 'Soccer Academy',
    subtitle: 'Train smarter with player analysis, weekly drills, fitness, daily challenges, and video learning.',
    playerLab: 'Player Analysis Lab',
    playerLabText: 'Add player name, position, jersey number, video link, strengths, needs work, coach notes, and a 7-day goal.',
    freeBeta: 'Free Beta Now • Pro AI Later',
    openPlayer: 'Open Player Analysis',
    trainingPlan: 'Training Plan',
    trainingText: 'Weekly drills for ball control, passing, shooting, speed, and recovery.',
    openTraining: 'Open Training',
    dailyChallenge: 'Daily Challenge',
    dailyText: 'Simple daily tasks to keep young players active, focused, and improving.',
    startChallenge: 'Start Challenge',
    fitness: 'Fitness & Speed',
    fitnessText: 'Agility, stamina, warm-up, strength, and safe soccer conditioning.',
    openFitness: 'Open Fitness',
    videos: 'Training Videos',
    videosText: 'Open Soccer Daily videos for drills, practice ideas, and soccer learning.',
    openYoutube: 'Open YouTube',
    food: 'Food & Recovery',
    foodText: 'Hydration, sleep, stretching, and recovery habits for young players.',
    skill: 'Skill Tracker',
    skillText: 'Track progress in passing, shooting, dribbling, fitness, and confidence.',
    comingSoon: 'Coming Soon',
    focusTitle: "Today’s Academy Focus",
    focus1: '1. First touch: 50 touches with both feet.',
    focus2: '2. Passing: 30 wall passes with left foot and right foot.',
    focus3: '3. Fitness: 5 short sprints with full rest.',
    focus4: '4. Reflection: write one strength and one thing to improve.',
    pathTitle: '7-Day Youth Growth Path',
    monday: 'Monday — Ball control',
    tuesday: 'Tuesday — Speed and agility',
    wednesday: 'Wednesday — Passing and first touch',
    thursday: 'Thursday — Shooting and finishing',
    friday: 'Friday — Fitness and core strength',
    saturday: 'Saturday — Match day or small-sided game',
    sunday: 'Sunday — Recovery and reflection',
    safetyTitle: 'Safety Note',
    safetyText: 'Youth training should stay positive and safe. Rest, hydration, parent/coach guidance, and privacy are always more important than pressure.',
  },
  es: {
    title: 'Academia de fútbol',
    subtitle: 'Entrena mejor con análisis de jugador, ejercicios semanales, fitness, retos diarios y videos.',
    playerLab: 'Laboratorio de análisis',
    playerLabText: 'Agrega nombre, posición, número de camiseta, video, fortalezas, áreas de mejora, notas y meta de 7 días.',
    freeBeta: 'Beta gratis ahora • IA Pro después',
    openPlayer: 'Abrir análisis',
    trainingPlan: 'Plan de entrenamiento',
    trainingText: 'Ejercicios semanales para control, pases, tiros, velocidad y recuperación.',
    openTraining: 'Abrir entrenamiento',
    dailyChallenge: 'Reto diario',
    dailyText: 'Tareas simples para mantener a los jóvenes activos, enfocados y mejorando.',
    startChallenge: 'Iniciar reto',
    fitness: 'Fitness y velocidad',
    fitnessText: 'Agilidad, resistencia, calentamiento, fuerza y acondicionamiento seguro.',
    openFitness: 'Abrir fitness',
    videos: 'Videos de entrenamiento',
    videosText: 'Abre videos de Soccer Daily para ejercicios, ideas y aprendizaje.',
    openYoutube: 'Abrir YouTube',
    food: 'Comida y recuperación',
    foodText: 'Hidratación, sueño, estiramiento y hábitos de recuperación.',
    skill: 'Seguimiento de habilidades',
    skillText: 'Sigue el progreso en pases, tiros, regate, fitness y confianza.',
    comingSoon: 'Próximamente',
    focusTitle: 'Enfoque de hoy',
    focus1: '1. Primer toque: 50 toques con ambos pies.',
    focus2: '2. Pases: 30 pases contra la pared con ambos pies.',
    focus3: '3. Fitness: 5 sprints cortos con descanso.',
    focus4: '4. Reflexión: escribe una fortaleza y una mejora.',
    pathTitle: 'Plan juvenil de 7 días',
    monday: 'Lunes — Control del balón',
    tuesday: 'Martes — Velocidad y agilidad',
    wednesday: 'Miércoles — Pase y primer toque',
    thursday: 'Jueves — Tiro y definición',
    friday: 'Viernes — Fitness y fuerza',
    saturday: 'Sábado — Partido o juego pequeño',
    sunday: 'Domingo — Recuperación y reflexión',
    safetyTitle: 'Nota de seguridad',
    safetyText: 'El entrenamiento juvenil debe ser positivo y seguro. Descanso, hidratación, guía de padres/entrenadores y privacidad son más importantes que la presión.',
  },
  ne: {
    title: 'सकर एकेडेमी',
    subtitle: 'खेलाडी विश्लेषण, साप्ताहिक अभ्यास, फिटनेस, दैनिक चुनौती र भिडियोबाट राम्रो प्रशिक्षण गर्नुहोस्।',
    playerLab: 'खेलाडी विश्लेषण ल्याब',
    playerLabText: 'खेलाडीको नाम, पोजिसन, जर्सी नम्बर, भिडियो लिंक, बलियो पक्ष, सुधार गर्नुपर्ने कुरा, कोच नोट र ७-दिनको लक्ष्य थप्नुहोस्।',
    freeBeta: 'अहिले निःशुल्क Beta • पछि Pro AI',
    openPlayer: 'खेलाडी विश्लेषण खोल्नुहोस्',
    trainingPlan: 'प्रशिक्षण योजना',
    trainingText: 'बल नियन्त्रण, पास, शूटिङ, गति र रिकभरीका लागि साप्ताहिक अभ्यास।',
    openTraining: 'प्रशिक्षण खोल्नुहोस्',
    dailyChallenge: 'दैनिक चुनौती',
    dailyText: 'युवा खेलाडीलाई सक्रिय, केन्द्रित र सुधारतर्फ राख्ने सरल दैनिक काम।',
    startChallenge: 'चुनौती सुरु गर्नुहोस्',
    fitness: 'फिटनेस र गति',
    fitnessText: 'एजिलिटी, स्टामिना, वार्मअप, शक्ति र सुरक्षित कन्डिसनिङ।',
    openFitness: 'फिटनेस खोल्नुहोस्',
    videos: 'प्रशिक्षण भिडियो',
    videosText: 'अभ्यास, विचार र सिकाइका लागि Soccer Daily भिडियो खोल्नुहोस्।',
    openYoutube: 'YouTube खोल्नुहोस्',
    food: 'खाना र रिकभरी',
    foodText: 'पानी, निद्रा, स्ट्रेचिङ र युवा खेलाडीका रिकभरी बानी।',
    skill: 'स्किल ट्र्याकर',
    skillText: 'पास, शूटिङ, ड्रिब्लिङ, फिटनेस र आत्मविश्वासको प्रगति ट्र्याक गर्नुहोस्।',
    comingSoon: 'चाँडै आउँदैछ',
    focusTitle: 'आजको एकेडेमी फोकस',
    focus1: '1. पहिलो टच: दुवै खुट्टाले ५० टच।',
    focus2: '2. पास: बायाँ र दायाँ खुट्टाले ३० वाल पास।',
    focus3: '3. फिटनेस: पूरा आरामसहित ५ छोटो स्प्रिन्ट।',
    focus4: '4. reflection: एउटा बलियो पक्ष र एउटा सुधार लेख्नुहोस्।',
    pathTitle: '७-दिन युवा विकास योजना',
    monday: 'सोमबार — बल नियन्त्रण',
    tuesday: 'मंगलबार — गति र एजिलिटी',
    wednesday: 'बुधबार — पास र पहिलो टच',
    thursday: 'बिहीबार — शूटिङ र फिनिशिङ',
    friday: 'शुक्रबार — फिटनेस र कोर शक्ति',
    saturday: 'शनिबार — म्याच वा सानो खेल',
    sunday: 'आइतबार — रिकभरी र reflection',
    safetyTitle: 'सुरक्षा नोट',
    safetyText: 'युवा प्रशिक्षण सकारात्मक र सुरक्षित हुनुपर्छ। आराम, पानी, अभिभावक/कोच मार्गदर्शन र गोपनीयता दबाबभन्दा महत्त्वपूर्ण छन्।',
  },
  hi: {
    title: 'सॉकर अकादमी',
    subtitle: 'प्लेयर एनालिसिस, साप्ताहिक ड्रिल्स, फिटनेस, डेली चैलेंज और वीडियो से बेहतर ट्रेनिंग करें।',
    playerLab: 'प्लेयर एनालिसिस लैब',
    playerLabText: 'नाम, पोजिशन, जर्सी नंबर, वीडियो लिंक, ताकत, सुधार, कोच नोट्स और 7-दिन का लक्ष्य जोड़ें।',
    freeBeta: 'अभी Free Beta • बाद में Pro AI',
    openPlayer: 'प्लेयर एनालिसिस खोलें',
    trainingPlan: 'ट्रेनिंग प्लान',
    trainingText: 'बॉल कंट्रोल, पासिंग, शूटिंग, स्पीड और रिकवरी के लिए साप्ताहिक ड्रिल्स।',
    openTraining: 'ट्रेनिंग खोलें',
    dailyChallenge: 'डेली चैलेंज',
    dailyText: 'युवा खिलाड़ियों को सक्रिय, केंद्रित और बेहतर बनाने के छोटे दैनिक काम।',
    startChallenge: 'चैलेंज शुरू करें',
    fitness: 'फिटनेस और स्पीड',
    fitnessText: 'Agility, stamina, warm-up, strength और safe conditioning.',
    openFitness: 'फिटनेस खोलें',
    videos: 'ट्रेनिंग वीडियो',
    videosText: 'ड्रिल्स, प्रैक्टिस ideas और सीखने के लिए Soccer Daily videos खोलें।',
    openYoutube: 'YouTube खोलें',
    food: 'Food और Recovery',
    foodText: 'Hydration, sleep, stretching और recovery habits.',
    skill: 'Skill Tracker',
    skillText: 'Passing, shooting, dribbling, fitness और confidence की progress track करें।',
    comingSoon: 'जल्द आ रहा है',
    focusTitle: 'आज का Academy Focus',
    focus1: '1. First touch: दोनों पैरों से 50 touches.',
    focus2: '2. Passing: दोनों पैरों से 30 wall passes.',
    focus3: '3. Fitness: पूरे rest के साथ 5 short sprints.',
    focus4: '4. Reflection: एक strength और एक improvement लिखें.',
    pathTitle: '7-दिन Youth Growth Path',
    monday: 'Monday — Ball control',
    tuesday: 'Tuesday — Speed और agility',
    wednesday: 'Wednesday — Passing और first touch',
    thursday: 'Thursday — Shooting और finishing',
    friday: 'Friday — Fitness और core strength',
    saturday: 'Saturday — Match day या small-sided game',
    sunday: 'Sunday — Recovery और reflection',
    safetyTitle: 'Safety Note',
    safetyText: 'Youth training positive और safe होना चाहिए। Rest, hydration, parent/coach guidance और privacy pressure से ज्यादा important हैं।',
  },
  pt: {
    title: 'Academia de Futebol',
    subtitle: 'Treine melhor com análise de jogador, treinos semanais, fitness, desafios diários e vídeos.',
    playerLab: 'Laboratório de Análise',
    playerLabText: 'Adicione nome, posição, número da camisa, vídeo, pontos fortes, melhorias, notas e meta de 7 dias.',
    freeBeta: 'Beta grátis agora • IA Pro depois',
    openPlayer: 'Abrir análise',
    trainingPlan: 'Plano de treino',
    trainingText: 'Treinos semanais para controle de bola, passes, chutes, velocidade e recuperação.',
    openTraining: 'Abrir treino',
    dailyChallenge: 'Desafio diário',
    dailyText: 'Tarefas simples para manter jovens jogadores ativos, focados e melhorando.',
    startChallenge: 'Iniciar desafio',
    fitness: 'Fitness e velocidade',
    fitnessText: 'Agilidade, resistência, aquecimento, força e condicionamento seguro.',
    openFitness: 'Abrir fitness',
    videos: 'Vídeos de treino',
    videosText: 'Abra vídeos do Soccer Daily para treinos, ideias e aprendizado.',
    openYoutube: 'Abrir YouTube',
    food: 'Alimentação e recuperação',
    foodText: 'Hidratação, sono, alongamento e hábitos de recuperação.',
    skill: 'Rastreador de habilidades',
    skillText: 'Acompanhe passes, chutes, dribles, fitness e confiança.',
    comingSoon: 'Em breve',
    focusTitle: 'Foco da Academia Hoje',
    focus1: '1. Primeiro toque: 50 toques com os dois pés.',
    focus2: '2. Passes: 30 passes na parede com os dois pés.',
    focus3: '3. Fitness: 5 sprints curtos com descanso.',
    focus4: '4. Reflexão: escreva uma força e uma melhoria.',
    pathTitle: 'Plano juvenil de 7 dias',
    monday: 'Segunda — Controle de bola',
    tuesday: 'Terça — Velocidade e agilidade',
    wednesday: 'Quarta — Passe e primeiro toque',
    thursday: 'Quinta — Chute e finalização',
    friday: 'Sexta — Fitness e força',
    saturday: 'Sábado — Jogo ou treino reduzido',
    sunday: 'Domingo — Recuperação e reflexão',
    safetyTitle: 'Nota de segurança',
    safetyText: 'O treino juvenil deve ser positivo e seguro. Descanso, hidratação, orientação dos pais/técnicos e privacidade são mais importantes que pressão.',
  },
  fr: {
    title: 'Académie de football',
    subtitle: 'Entraînez-vous mieux avec l’analyse joueur, les exercices, le fitness, les défis et les vidéos.',
    playerLab: 'Laboratoire d’analyse',
    playerLabText: 'Ajoutez nom, poste, numéro, vidéo, forces, axes d’amélioration, notes et objectif de 7 jours.',
    freeBeta: 'Bêta gratuite maintenant • IA Pro plus tard',
    openPlayer: 'Ouvrir l’analyse',
    trainingPlan: 'Plan d’entraînement',
    trainingText: 'Exercices pour contrôle, passes, tirs, vitesse et récupération.',
    openTraining: 'Ouvrir entraînement',
    dailyChallenge: 'Défi quotidien',
    dailyText: 'Petites tâches pour aider les jeunes joueurs à progresser.',
    startChallenge: 'Commencer le défi',
    fitness: 'Fitness et vitesse',
    fitnessText: 'Agilité, endurance, échauffement, force et conditionnement sûr.',
    openFitness: 'Ouvrir fitness',
    videos: 'Vidéos d’entraînement',
    videosText: 'Ouvrez les vidéos Soccer Daily pour exercices, idées et apprentissage.',
    openYoutube: 'Ouvrir YouTube',
    food: 'Nutrition et récupération',
    foodText: 'Hydratation, sommeil, étirements et habitudes de récupération.',
    skill: 'Suivi des compétences',
    skillText: 'Suivez les progrès en passes, tirs, dribble, fitness et confiance.',
    comingSoon: 'Bientôt',
    focusTitle: 'Focus de l’académie aujourd’hui',
    focus1: '1. Premier toucher : 50 touches avec les deux pieds.',
    focus2: '2. Passes : 30 passes contre un mur avec les deux pieds.',
    focus3: '3. Fitness : 5 sprints courts avec repos.',
    focus4: '4. Réflexion : écrire une force et une amélioration.',
    pathTitle: 'Parcours jeunesse de 7 jours',
    monday: 'Lundi — Contrôle du ballon',
    tuesday: 'Mardi — Vitesse et agilité',
    wednesday: 'Mercredi — Passe et premier toucher',
    thursday: 'Jeudi — Tir et finition',
    friday: 'Vendredi — Fitness et force',
    saturday: 'Samedi — Match ou petit jeu',
    sunday: 'Dimanche — Récupération et réflexion',
    safetyTitle: 'Note de sécurité',
    safetyText: 'L’entraînement des jeunes doit rester positif et sûr. Repos, hydratation, encadrement et vie privée sont plus importants que la pression.',
  },
  ar: {
    title: 'أكاديمية كرة القدم',
    subtitle: 'تدرّب بذكاء مع تحليل اللاعب، التمارين الأسبوعية، اللياقة، التحديات اليومية والفيديوهات.',
    playerLab: 'مختبر تحليل اللاعب',
    playerLabText: 'أضف الاسم، المركز، رقم القميص، رابط الفيديو، نقاط القوة، التحسينات، ملاحظات المدرب وهدف 7 أيام.',
    freeBeta: 'بيتا مجانية الآن • ذكاء اصطناعي Pro لاحقًا',
    openPlayer: 'افتح تحليل اللاعب',
    trainingPlan: 'خطة التدريب',
    trainingText: 'تمارين أسبوعية للتحكم بالكرة، التمرير، التسديد، السرعة والتعافي.',
    openTraining: 'افتح التدريب',
    dailyChallenge: 'تحدي يومي',
    dailyText: 'مهام بسيطة تساعد اللاعبين الشباب على النشاط والتركيز والتطور.',
    startChallenge: 'ابدأ التحدي',
    fitness: 'اللياقة والسرعة',
    fitnessText: 'الرشاقة، التحمل، الإحماء، القوة والتدريب الآمن.',
    openFitness: 'افتح اللياقة',
    videos: 'فيديوهات التدريب',
    videosText: 'افتح فيديوهات Soccer Daily للأفكار والتمارين والتعلم.',
    openYoutube: 'افتح YouTube',
    food: 'الغذاء والتعافي',
    foodText: 'الترطيب، النوم، التمدد وعادات التعافي.',
    skill: 'متتبع المهارات',
    skillText: 'تتبع التقدم في التمرير، التسديد، المراوغة، اللياقة والثقة.',
    comingSoon: 'قريبًا',
    focusTitle: 'تركيز الأكاديمية اليوم',
    focus1: '1. اللمسة الأولى: 50 لمسة بكلتا القدمين.',
    focus2: '2. التمرير: 30 تمريرة على الحائط بكلتا القدمين.',
    focus3: '3. اللياقة: 5 انطلاقات قصيرة مع راحة.',
    focus4: '4. التأمل: اكتب نقطة قوة وشيئًا للتحسين.',
    pathTitle: 'مسار نمو الشباب خلال 7 أيام',
    monday: 'الاثنين — التحكم بالكرة',
    tuesday: 'الثلاثاء — السرعة والرشاقة',
    wednesday: 'الأربعاء — التمرير واللمسة الأولى',
    thursday: 'الخميس — التسديد والإنهاء',
    friday: 'الجمعة — اللياقة والقوة',
    saturday: 'السبت — مباراة أو لعبة صغيرة',
    sunday: 'الأحد — التعافي والتأمل',
    safetyTitle: 'ملاحظة السلامة',
    safetyText: 'يجب أن يبقى تدريب الشباب إيجابيًا وآمنًا. الراحة، الترطيب، توجيه الأهل/المدرب والخصوصية أهم من الضغط.',
  },
};

export default function SoccerAcademyScreen() {
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

  const t = academyText[language] || academyText.en;

  async function openYouTube() {
    try {
      await Linking.openURL(SOCCER_DAILY_YOUTUBE);
    } catch (error) {
      console.log('Could not open YouTube:', error);
    }
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>SOCCER DAILY</Text>
        <Text style={styles.title}>{t.title}</Text>
        <Text style={styles.subtitle}>{t.subtitle}</Text>
      </View>

      <Pressable
        style={[styles.card, styles.featuredCard]}
        onPress={() => router.push('/soccer-lab/player-analysis' as any)}
      >
        <Text style={styles.emoji}>🧠</Text>
        <Text style={styles.cardTitle}>{t.playerLab}</Text>
        <Text style={styles.cardText}>{t.playerLabText}</Text>
        <Text style={styles.cardBadge}>{t.freeBeta}</Text>
        <Text style={styles.cardAction}>{t.openPlayer} →</Text>
      </Pressable>

      <View style={styles.grid}>
        <Pressable style={styles.card} onPress={() => router.push('/training' as any)}>
          <Text style={styles.emoji}>⚽</Text>
          <Text style={styles.cardTitle}>{t.trainingPlan}</Text>
          <Text style={styles.cardText}>{t.trainingText}</Text>
          <Text style={styles.cardAction}>{t.openTraining} →</Text>
        </Pressable>

        <Pressable style={styles.card} onPress={() => router.push('/daily-challenge' as any)}>
          <Text style={styles.emoji}>🔥</Text>
          <Text style={styles.cardTitle}>{t.dailyChallenge}</Text>
          <Text style={styles.cardText}>{t.dailyText}</Text>
          <Text style={styles.cardAction}>{t.startChallenge} →</Text>
        </Pressable>

        <Pressable style={styles.card} onPress={() => router.push('/fitness' as any)}>
          <Text style={styles.emoji}>🏃</Text>
          <Text style={styles.cardTitle}>{t.fitness}</Text>
          <Text style={styles.cardText}>{t.fitnessText}</Text>
          <Text style={styles.cardAction}>{t.openFitness} →</Text>
        </Pressable>

        <Pressable style={styles.card} onPress={openYouTube}>
          <Text style={styles.emoji}>▶️</Text>
          <Text style={styles.cardTitle}>{t.videos}</Text>
          <Text style={styles.cardText}>{t.videosText}</Text>
          <Text style={styles.cardAction}>{t.openYoutube} →</Text>
        </Pressable>

        <View style={styles.card}>
          <Text style={styles.emoji}>🥗</Text>
          <Text style={styles.cardTitle}>{t.food}</Text>
          <Text style={styles.cardText}>{t.foodText}</Text>
          <Text style={styles.comingSoon}>{t.comingSoon}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.emoji}>🎯</Text>
          <Text style={styles.cardTitle}>{t.skill}</Text>
          <Text style={styles.cardText}>{t.skillText}</Text>
          <Text style={styles.comingSoon}>{t.comingSoon}</Text>
        </View>
      </View>

      <View style={styles.focusCard}>
        <Text style={styles.focusTitle}>{t.focusTitle}</Text>
        <Text style={styles.focusText}>{t.focus1}</Text>
        <Text style={styles.focusText}>{t.focus2}</Text>
        <Text style={styles.focusText}>{t.focus3}</Text>
        <Text style={styles.focusText}>{t.focus4}</Text>
      </View>

      <View style={styles.pathCard}>
        <Text style={styles.pathTitle}>{t.pathTitle}</Text>
        <Text style={styles.pathText}>{t.monday}</Text>
        <Text style={styles.pathText}>{t.tuesday}</Text>
        <Text style={styles.pathText}>{t.wednesday}</Text>
        <Text style={styles.pathText}>{t.thursday}</Text>
        <Text style={styles.pathText}>{t.friday}</Text>
        <Text style={styles.pathText}>{t.saturday}</Text>
        <Text style={styles.pathText}>{t.sunday}</Text>
      </View>

      <View style={styles.safetyCard}>
        <Text style={styles.safetyTitle}>{t.safetyTitle}</Text>
        <Text style={styles.safetyText}>{t.safetyText}</Text>
      </View>
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
    paddingTop: 64,
    paddingBottom: 46,
  },
  hero: {
    backgroundColor: '#0B1729',
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: '#FFD166',
    marginBottom: 18,
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
  grid: {
    marginTop: 4,
  },
  card: {
    backgroundColor: '#0B1729',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#24344F',
    marginBottom: 14,
  },
  featuredCard: {
    borderColor: '#FFD166',
    borderWidth: 2,
    backgroundColor: '#111C2E',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  cardTitle: {
    color: '#FFD166',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
  },
  cardText: {
    color: '#E2E8F0',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  cardBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#052E16',
    color: '#22C55E',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: '900',
    overflow: 'hidden',
    marginBottom: 10,
  },
  cardAction: {
    color: '#22C55E',
    fontSize: 15,
    fontWeight: '900',
  },
  comingSoon: {
    color: '#38BDF8',
    fontSize: 15,
    fontWeight: '900',
  },
  focusCard: {
    backgroundColor: '#052E16',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#22C55E',
    marginTop: 4,
    marginBottom: 14,
  },
  focusTitle: {
    color: '#FFD166',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 10,
  },
  focusText: {
    color: '#E2E8F0',
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '800',
  },
  pathCard: {
    backgroundColor: '#111C2E',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#38BDF8',
    marginBottom: 14,
  },
  pathTitle: {
    color: '#38BDF8',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 10,
  },
  pathText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 25,
    fontWeight: '800',
  },
  safetyCard: {
    backgroundColor: '#2A1F12',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFD166',
  },
  safetyTitle: {
    color: '#FFD166',
    fontSize: 19,
    fontWeight: '900',
    marginBottom: 6,
  },
  safetyText: {
    color: '#FFE8A3',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '700',
  },
});
