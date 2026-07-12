import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  router,
  useFocusEffect } from 'expo-router';
import { useCallback,
  useEffect,
  useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
} from 'react-native';


const playerLabTopText: any = {
  en: {
    back: '← Back',
    kicker: 'SOCCER DAILY ACADEMY',
    title: 'Player Analysis Lab',
    subtitle: 'Add a training video link, write coach notes, and create a simple 7-day improvement plan.',
    noticeTitle: 'Free Beta Now • Pro Later',
    noticeText: 'Today, this lab works as a private coach notebook with Smart Coach Template. Later, Soccer Daily Pro can add paid AI Coach Assist and deeper video analysis.',
    playerDetails: 'Player Details',
    playerName: 'Player Name',
    playerNamePlaceholder: 'Example: Prasanna',
    position: 'Position',
    positionPlaceholder: 'Example: Midfielder, Striker, Defender, Goalkeeper',
    jerseyNumber: 'Jersey Number',
    jerseyNumberPlaceholder: 'Example: 8',
    jerseyColor: 'Jersey Color',
    jerseyColorPlaceholder: 'Example: Blue, Red, White',
    videoLength: 'Video Length',
    videoLengthPlaceholder: 'Example: 5 minutes. Best: 3–8 minutes.',
    aiVideoTitle: 'AI Video Analysis — Pro Coming Later',
    aiVideoText1: 'For future AI tracking, add jersey number, jersey color, position, and a clear 3–8 minute video where the player is visible.',
    aiVideoText2: 'Later Pro version can use player photo, jersey number, and video to help identify the player. No automatic video analysis is active yet.',
    youtubeLink: 'YouTube Video Link',
    youtubePlaceholder: 'Paste YouTube training or match video link',
    openVideo: 'Open Video',
    analysisNotes: 'Analysis Notes',
    strengths: 'Strengths',
    strengthsPlaceholder: 'Example: first touch, speed, passing, confidence',
    needsWork: 'Needs Work',
    needsWorkPlaceholder: 'Example: weak foot, stamina, shooting accuracy, positioning',
    coachNotes: 'Coach Notes',
    coachNotesPlaceholder: 'Write parent/coach observations here...',
    nextGoal: 'Next 7-Day Training Goal',
    nextGoalPlaceholder: 'Write the improvement goal for the next week...',
    suggestGoal: 'Suggest 7-Day Goal',
    smartCoach: 'Smart Coach Template',
    aiCoachComing: 'AI Coach Assist — Coming Soon',
    quickSummary: 'Quick Summary',
    summaryPlayer: 'Player',
    summaryPosition: 'Position',
    summaryJersey: 'Jersey',
    summaryVideoLength: 'Video Length',
    summaryStrengths: 'Strengths',
    summaryNeedsWork: 'Needs Work',
    notAdded: 'Not added yet',
    colorNotAdded: 'Color not added',
    numberNotAdded: 'Number not added',
    saveNotes: 'Save Notes',
    clear: 'Clear',
    futurePro: 'Future Soccer Daily Pro',
    pro1: '✅ AI Coach Assist from written notes',
    pro2: '✅ Better 7-day training plans',
    pro3: '✅ Player photo + jersey identity',
    pro4: '✅ Video analysis for clear 3–8 minute clips',
    proSmall: 'Beta users can use Smart Coach Template free while we build this safely.',
    safetyPrivacy: 'Safety & Privacy',
    safetyText: 'Use training or personal videos with permission. Do not publicly judge children, post private information, or upload copyrighted match footage without rights.',
  },
  es: {
    back: '← Atrás',
    kicker: 'ACADEMIA SOCCER DAILY',
    title: 'Laboratorio de análisis',
    subtitle: 'Agrega un video de entrenamiento, escribe notas y crea un plan simple de mejora de 7 días.',
    noticeTitle: 'Beta gratis ahora • Pro después',
    noticeText: 'Hoy funciona como un cuaderno privado de entrenador. Después, Soccer Daily Pro puede agregar IA y análisis de video más profundo.',
    playerDetails: 'Detalles del jugador',
    playerName: 'Nombre del jugador',
    playerNamePlaceholder: 'Ejemplo: Prasanna',
    position: 'Posición',
    positionPlaceholder: 'Ejemplo: Mediocampista, Delantero, Defensa, Portero',
    jerseyNumber: 'Número de camiseta',
    jerseyNumberPlaceholder: 'Ejemplo: 8',
    jerseyColor: 'Color de camiseta',
    jerseyColorPlaceholder: 'Ejemplo: Azul, Rojo, Blanco',
    videoLength: 'Duración del video',
    videoLengthPlaceholder: 'Ejemplo: 5 minutos. Mejor: 3–8 minutos.',
    aiVideoTitle: 'Análisis de video con IA — Pro después',
    aiVideoText1: 'Para futura IA, agrega número, color, posición y un video claro de 3–8 minutos.',
    aiVideoText2: 'La versión Pro podrá usar foto, número y video para identificar al jugador. Aún no hay análisis automático.',
    youtubeLink: 'Enlace de YouTube',
    youtubePlaceholder: 'Pega enlace de entrenamiento o partido',
    openVideo: 'Abrir video',
    analysisNotes: 'Notas de análisis',
    strengths: 'Fortalezas',
    strengthsPlaceholder: 'Ejemplo: primer toque, velocidad, pases, confianza',
    needsWork: 'Necesita mejorar',
    needsWorkPlaceholder: 'Ejemplo: pie débil, resistencia, precisión de tiro, posición',
    coachNotes: 'Notas del entrenador',
    coachNotesPlaceholder: 'Escribe observaciones de padre/entrenador aquí...',
    nextGoal: 'Próxima meta de 7 días',
    nextGoalPlaceholder: 'Escribe la meta de mejora para la próxima semana...',
    suggestGoal: 'Sugerir meta de 7 días',
    smartCoach: 'Plantilla de entrenador',
    aiCoachComing: 'Asistente IA — Próximamente',
    quickSummary: 'Resumen rápido',
    summaryPlayer: 'Jugador',
    summaryPosition: 'Posición',
    summaryJersey: 'Camiseta',
    summaryVideoLength: 'Duración del video',
    summaryStrengths: 'Fortalezas',
    summaryNeedsWork: 'Necesita mejorar',
    notAdded: 'No agregado',
    colorNotAdded: 'Color no agregado',
    numberNotAdded: 'Número no agregado',
    saveNotes: 'Guardar notas',
    clear: 'Borrar',
    futurePro: 'Futuro Soccer Daily Pro',
    pro1: '✅ Asistente IA desde notas escritas',
    pro2: '✅ Mejores planes de entrenamiento de 7 días',
    pro3: '✅ Foto del jugador + identidad de camiseta',
    pro4: '✅ Análisis de video para clips claros de 3–8 minutos',
    proSmall: 'Usuarios beta pueden usar Smart Coach Template gratis mientras lo construimos con seguridad.',
    safetyPrivacy: 'Seguridad y privacidad',
    safetyText: 'Usa videos personales o de entrenamiento con permiso. No juzgues públicamente a niños ni subas información privada o videos con derechos sin permiso.',
  },
  ne: {
    back: '← पछाडि',
    kicker: 'SOCCER DAILY एकेडेमी',
    title: 'खेलाडी विश्लेषण ल्याब',
    subtitle: 'प्रशिक्षण भिडियो लिंक थप्नुहोस्, कोच नोट लेख्नुहोस्, र सरल ७-दिनको सुधार योजना बनाउनुहोस्।',
    noticeTitle: 'अहिले निःशुल्क Beta • पछि Pro',
    noticeText: 'आज यो निजी कोच नोटबुक जस्तै काम गर्छ। पछि Soccer Daily Pro मा AI Coach Assist र गहिरो भिडियो विश्लेषण थप्न सकिन्छ।',
    playerDetails: 'खेलाडी विवरण',
    playerName: 'खेलाडीको नाम',
    playerNamePlaceholder: 'उदाहरण: Prasanna',
    position: 'पोजिसन',
    positionPlaceholder: 'उदाहरण: Midfielder, Striker, Defender, Goalkeeper',
    jerseyNumber: 'जर्सी नम्बर',
    jerseyNumberPlaceholder: 'उदाहरण: 8',
    jerseyColor: 'जर्सी रंग',
    jerseyColorPlaceholder: 'उदाहरण: नीलो, रातो, सेतो',
    videoLength: 'भिडियो अवधि',
    videoLengthPlaceholder: 'उदाहरण: ५ मिनेट। राम्रो: ३–८ मिनेट।',
    aiVideoTitle: 'AI भिडियो विश्लेषण — Pro पछि',
    aiVideoText1: 'भविष्यको AI tracking का लागि जर्सी नम्बर, रंग, पोजिसन र ३–८ मिनेटको स्पष्ट भिडियो थप्नुहोस्।',
    aiVideoText2: 'पछि Pro ले खेलाडी फोटो, जर्सी नम्बर र भिडियो प्रयोग गर्न सक्छ। अहिले automatic video analysis छैन।',
    youtubeLink: 'YouTube भिडियो लिंक',
    youtubePlaceholder: 'प्रशिक्षण वा म्याच भिडियो लिंक टाँस्नुहोस्',
    openVideo: 'भिडियो खोल्नुहोस्',
    analysisNotes: 'विश्लेषण नोट',
    strengths: 'बलियो पक्ष',
    strengthsPlaceholder: 'उदाहरण: first touch, speed, passing, confidence',
    needsWork: 'सुधार गर्नुपर्ने',
    needsWorkPlaceholder: 'उदाहरण: weak foot, stamina, shooting accuracy, positioning',
    coachNotes: 'कोच नोट',
    coachNotesPlaceholder: 'अभिभावक/कोच observation यहाँ लेख्नुहोस्...',
    nextGoal: 'अर्को ७-दिनको प्रशिक्षण लक्ष्य',
    nextGoalPlaceholder: 'अर्को हप्ताको सुधार लक्ष्य लेख्नुहोस्...',
    suggestGoal: '७-दिनको लक्ष्य सुझाव',
    smartCoach: 'Smart Coach Template',
    aiCoachComing: 'AI Coach Assist — चाँडै',
    quickSummary: 'छोटो सारांश',
    summaryPlayer: 'खेलाडी',
    summaryPosition: 'पोजिसन',
    summaryJersey: 'जर्सी',
    summaryVideoLength: 'भिडियो अवधि',
    summaryStrengths: 'बलियो पक्ष',
    summaryNeedsWork: 'सुधार गर्नुपर्ने',
    notAdded: 'अझै थपिएको छैन',
    colorNotAdded: 'रंग थपिएको छैन',
    numberNotAdded: 'नम्बर थपिएको छैन',
    saveNotes: 'नोट सेभ गर्नुहोस्',
    clear: 'हटाउनुहोस्',
    futurePro: 'भविष्यको Soccer Daily Pro',
    pro1: '✅ लेखिएको नोटबाट AI Coach Assist',
    pro2: '✅ राम्रो ७-दिनको प्रशिक्षण योजना',
    pro3: '✅ खेलाडी फोटो + जर्सी पहिचान',
    pro4: '✅ स्पष्ट ३–८ मिनेट भिडियोको विश्लेषण',
    proSmall: 'Beta प्रयोगकर्ताले Smart Coach Template निःशुल्क प्रयोग गर्न सक्छन्।',
    safetyPrivacy: 'सुरक्षा र गोपनीयता',
    safetyText: 'अनुमति भएको training वा personal video मात्र प्रयोग गर्नुहोस्। बच्चालाई सार्वजनिक रूपमा judge नगर्नुहोस्, निजी जानकारी नपोस्ट गर्नुहोस्, वा अधिकार नभएको भिडियो upload नगर्नुहोस्।',
  },
  hi: {
    back: '← वापस',
    kicker: 'SOCCER DAILY अकादमी',
    title: 'प्लेयर एनालिसिस लैब',
    subtitle: 'ट्रेनिंग वीडियो लिंक जोड़ें, कोच नोट्स लिखें, और 7-दिन का सरल सुधार प्लान बनाएं।',
    noticeTitle: 'अभी Free Beta • बाद में Pro',
    noticeText: 'आज यह निजी कोच नोटबुक की तरह काम करता है। बाद में Soccer Daily Pro में AI Coach Assist और गहरा वीडियो analysis आ सकता है।',
    playerDetails: 'खिलाड़ी विवरण',
    playerName: 'खिलाड़ी का नाम',
    playerNamePlaceholder: 'उदाहरण: Prasanna',
    position: 'पोजिशन',
    positionPlaceholder: 'उदाहरण: Midfielder, Striker, Defender, Goalkeeper',
    jerseyNumber: 'जर्सी नंबर',
    jerseyNumberPlaceholder: 'उदाहरण: 8',
    jerseyColor: 'जर्सी रंग',
    jerseyColorPlaceholder: 'उदाहरण: नीला, लाल, सफेद',
    videoLength: 'वीडियो अवधि',
    videoLengthPlaceholder: 'उदाहरण: 5 मिनट। अच्छा: 3–8 मिनट।',
    aiVideoTitle: 'AI वीडियो एनालिसिस — Pro बाद में',
    aiVideoText1: 'भविष्य की AI tracking के लिए जर्सी नंबर, रंग, पोजिशन और साफ 3–8 मिनट का वीडियो जोड़ें।',
    aiVideoText2: 'बाद में Pro फोटो, जर्सी नंबर और वीडियो से खिलाड़ी पहचानने में मदद कर सकता है। अभी automatic analysis नहीं है।',
    youtubeLink: 'YouTube वीडियो लिंक',
    youtubePlaceholder: 'ट्रेनिंग या मैच वीडियो लिंक डालें',
    openVideo: 'वीडियो खोलें',
    analysisNotes: 'एनालिसिस नोट्स',
    strengths: 'ताकत',
    strengthsPlaceholder: 'उदाहरण: first touch, speed, passing, confidence',
    needsWork: 'सुधार की जरूरत',
    needsWorkPlaceholder: 'उदाहरण: weak foot, stamina, shooting accuracy, positioning',
    coachNotes: 'कोच नोट्स',
    coachNotesPlaceholder: 'Parent/coach observations यहाँ लिखें...',
    nextGoal: 'अगला 7-दिन ट्रेनिंग लक्ष्य',
    nextGoalPlaceholder: 'अगले सप्ताह का सुधार लक्ष्य लिखें...',
    suggestGoal: '7-दिन लक्ष्य सुझाव',
    smartCoach: 'Smart Coach Template',
    aiCoachComing: 'AI Coach Assist — जल्द',
    quickSummary: 'छोटा सारांश',
    summaryPlayer: 'खिलाड़ी',
    summaryPosition: 'पोजिशन',
    summaryJersey: 'जर्सी',
    summaryVideoLength: 'वीडियो अवधि',
    summaryStrengths: 'ताकत',
    summaryNeedsWork: 'सुधार की जरूरत',
    notAdded: 'अभी जोड़ा नहीं गया',
    colorNotAdded: 'रंग नहीं जोड़ा गया',
    numberNotAdded: 'नंबर नहीं जोड़ा गया',
    saveNotes: 'नोट्स सेव करें',
    clear: 'क्लियर',
    futurePro: 'Future Soccer Daily Pro',
    pro1: '✅ लिखे हुए notes से AI Coach Assist',
    pro2: '✅ बेहतर 7-दिन training plans',
    pro3: '✅ Player photo + jersey identity',
    pro4: '✅ साफ 3–8 मिनट clips के लिए video analysis',
    proSmall: 'Beta users Smart Coach Template मुफ्त use कर सकते हैं।',
    safetyPrivacy: 'Safety & Privacy',
    safetyText: 'Training या personal videos permission से use करें। बच्चों को publicly judge न करें, private information post न करें, और copyrighted video बिना rights upload न करें।',
  },
  pt: {
    back: '← Voltar',
    kicker: 'ACADEMIA SOCCER DAILY',
    title: 'Laboratório de Análise',
    subtitle: 'Adicione um vídeo de treino, escreva notas e crie um plano simples de 7 dias.',
    noticeTitle: 'Beta grátis agora • Pro depois',
    noticeText: 'Hoje funciona como um caderno privado de treinador. Depois, Soccer Daily Pro pode adicionar IA e análise de vídeo.',
    playerDetails: 'Detalhes do jogador',
    playerName: 'Nome do jogador',
    playerNamePlaceholder: 'Exemplo: Prasanna',
    position: 'Posição',
    positionPlaceholder: 'Exemplo: Meio-campo, Atacante, Defensor, Goleiro',
    jerseyNumber: 'Número da camisa',
    jerseyNumberPlaceholder: 'Exemplo: 8',
    jerseyColor: 'Cor da camisa',
    jerseyColorPlaceholder: 'Exemplo: Azul, Vermelho, Branco',
    videoLength: 'Duração do vídeo',
    videoLengthPlaceholder: 'Exemplo: 5 minutos. Melhor: 3–8 minutos.',
    aiVideoTitle: 'Análise de vídeo com IA — Pro depois',
    aiVideoText1: 'Para futura IA, adicione número, cor, posição e um vídeo claro de 3–8 minutos.',
    aiVideoText2: 'A versão Pro poderá usar foto, número e vídeo para identificar o jogador. Ainda não há análise automática.',
    youtubeLink: 'Link do YouTube',
    youtubePlaceholder: 'Cole link de treino ou jogo',
    openVideo: 'Abrir vídeo',
    analysisNotes: 'Notas de análise',
    strengths: 'Pontos fortes',
    strengthsPlaceholder: 'Exemplo: primeiro toque, velocidade, passes, confiança',
    needsWork: 'Precisa melhorar',
    needsWorkPlaceholder: 'Exemplo: pé fraco, resistência, precisão no chute, posição',
    coachNotes: 'Notas do treinador',
    coachNotesPlaceholder: 'Escreva observações dos pais/treinador aqui...',
    nextGoal: 'Próxima meta de 7 dias',
    nextGoalPlaceholder: 'Escreva a meta de melhoria para a próxima semana...',
    suggestGoal: 'Sugerir meta de 7 dias',
    smartCoach: 'Modelo de treinador',
    aiCoachComing: 'Assistente IA — Em breve',
    quickSummary: 'Resumo rápido',
    summaryPlayer: 'Jogador',
    summaryPosition: 'Posição',
    summaryJersey: 'Camisa',
    summaryVideoLength: 'Duração do vídeo',
    summaryStrengths: 'Pontos fortes',
    summaryNeedsWork: 'Precisa melhorar',
    notAdded: 'Ainda não adicionado',
    colorNotAdded: 'Cor não adicionada',
    numberNotAdded: 'Número não adicionado',
    saveNotes: 'Salvar notas',
    clear: 'Limpar',
    futurePro: 'Futuro Soccer Daily Pro',
    pro1: '✅ Assistente IA a partir de notas',
    pro2: '✅ Melhores planos de treino de 7 dias',
    pro3: '✅ Foto do jogador + identidade da camisa',
    pro4: '✅ Análise de vídeo para clipes claros de 3–8 minutos',
    proSmall: 'Usuários beta podem usar Smart Coach Template grátis enquanto construímos com segurança.',
    safetyPrivacy: 'Segurança e privacidade',
    safetyText: 'Use vídeos pessoais ou de treino com permissão. Não julgue crianças publicamente nem envie informações privadas ou vídeos protegidos sem direitos.',
  },
  fr: {
    back: '← Retour',
    kicker: 'ACADÉMIE SOCCER DAILY',
    title: 'Laboratoire d’analyse',
    subtitle: 'Ajoutez un lien vidéo, écrivez des notes et créez un plan simple de 7 jours.',
    noticeTitle: 'Bêta gratuite maintenant • Pro plus tard',
    noticeText: 'Aujourd’hui, ce lab fonctionne comme un carnet privé d’entraîneur. Plus tard, Soccer Daily Pro pourra ajouter l’IA et l’analyse vidéo.',
    playerDetails: 'Détails du joueur',
    playerName: 'Nom du joueur',
    playerNamePlaceholder: 'Exemple : Prasanna',
    position: 'Poste',
    positionPlaceholder: 'Exemple : Milieu, Attaquant, Défenseur, Gardien',
    jerseyNumber: 'Numéro de maillot',
    jerseyNumberPlaceholder: 'Exemple : 8',
    jerseyColor: 'Couleur du maillot',
    jerseyColorPlaceholder: 'Exemple : Bleu, Rouge, Blanc',
    videoLength: 'Durée de la vidéo',
    videoLengthPlaceholder: 'Exemple : 5 minutes. Idéal : 3–8 minutes.',
    aiVideoTitle: 'Analyse vidéo IA — Pro plus tard',
    aiVideoText1: 'Pour la future IA, ajoutez numéro, couleur, poste et une vidéo claire de 3–8 minutes.',
    aiVideoText2: 'La version Pro pourra utiliser photo, numéro et vidéo pour identifier le joueur. Aucune analyse automatique pour l’instant.',
    youtubeLink: 'Lien vidéo YouTube',
    youtubePlaceholder: 'Collez le lien vidéo d’entraînement ou de match',
    openVideo: 'Ouvrir la vidéo',
    analysisNotes: 'Notes d’analyse',
    strengths: 'Forces',
    strengthsPlaceholder: 'Exemple : premier toucher, vitesse, passes, confiance',
    needsWork: 'À améliorer',
    needsWorkPlaceholder: 'Exemple : pied faible, endurance, précision du tir, placement',
    coachNotes: 'Notes du coach',
    coachNotesPlaceholder: 'Écrivez les observations parent/coach ici...',
    nextGoal: 'Prochain objectif de 7 jours',
    nextGoalPlaceholder: 'Écrivez l’objectif d’amélioration pour la semaine prochaine...',
    suggestGoal: 'Suggérer objectif 7 jours',
    smartCoach: 'Modèle coach intelligent',
    aiCoachComing: 'Assistant IA — Bientôt',
    quickSummary: 'Résumé rapide',
    summaryPlayer: 'Joueur',
    summaryPosition: 'Poste',
    summaryJersey: 'Maillot',
    summaryVideoLength: 'Durée de la vidéo',
    summaryStrengths: 'Forces',
    summaryNeedsWork: 'À améliorer',
    notAdded: 'Pas encore ajouté',
    colorNotAdded: 'Couleur non ajoutée',
    numberNotAdded: 'Numéro non ajouté',
    saveNotes: 'Enregistrer les notes',
    clear: 'Effacer',
    futurePro: 'Futur Soccer Daily Pro',
    pro1: '✅ Assistant IA à partir des notes écrites',
    pro2: '✅ Meilleurs plans de 7 jours',
    pro3: '✅ Photo du joueur + identité du maillot',
    pro4: '✅ Analyse vidéo pour clips clairs de 3–8 minutes',
    proSmall: 'Les utilisateurs bêta peuvent utiliser Smart Coach Template gratuitement.',
    safetyPrivacy: 'Sécurité et confidentialité',
    safetyText: 'Utilisez les vidéos personnelles ou d’entraînement avec permission. Ne jugez pas publiquement les enfants et ne publiez pas d’informations privées ou de vidéos protégées sans droits.',
  },
  ar: {
    back: '← رجوع',
    kicker: 'أكاديمية SOCCER DAILY',
    title: 'مختبر تحليل اللاعب',
    subtitle: 'أضف رابط فيديو التدريب، اكتب ملاحظات المدرب، وأنشئ خطة تحسين بسيطة لمدة 7 أيام.',
    noticeTitle: 'بيتا مجانية الآن • Pro لاحقًا',
    noticeText: 'اليوم يعمل هذا المختبر كدفتر مدرب خاص. لاحقًا يمكن أن يضيف Soccer Daily Pro مساعد الذكاء الاصطناعي وتحليل الفيديو.',
    playerDetails: 'تفاصيل اللاعب',
    playerName: 'اسم اللاعب',
    playerNamePlaceholder: 'مثال: Prasanna',
    position: 'المركز',
    positionPlaceholder: 'مثال: وسط، مهاجم، مدافع، حارس',
    jerseyNumber: 'رقم القميص',
    jerseyNumberPlaceholder: 'مثال: 8',
    jerseyColor: 'لون القميص',
    jerseyColorPlaceholder: 'مثال: أزرق، أحمر، أبيض',
    videoLength: 'مدة الفيديو',
    videoLengthPlaceholder: 'مثال: 5 دقائق. الأفضل: 3–8 دقائق.',
    aiVideoTitle: 'تحليل فيديو بالذكاء الاصطناعي — Pro لاحقًا',
    aiVideoText1: 'للتتبع المستقبلي، أضف رقم القميص، اللون، المركز وفيديو واضح من 3–8 دقائق.',
    aiVideoText2: 'لاحقًا يمكن لنسخة Pro استخدام صورة اللاعب والرقم والفيديو للمساعدة في التعرف عليه. لا يوجد تحليل تلقائي الآن.',
    youtubeLink: 'رابط فيديو YouTube',
    youtubePlaceholder: 'الصق رابط فيديو تدريب أو مباراة',
    openVideo: 'افتح الفيديو',
    analysisNotes: 'ملاحظات التحليل',
    strengths: 'نقاط القوة',
    strengthsPlaceholder: 'مثال: اللمسة الأولى، السرعة، التمرير، الثقة',
    needsWork: 'يحتاج إلى تحسين',
    needsWorkPlaceholder: 'مثال: القدم الضعيفة، اللياقة، دقة التسديد، التمركز',
    coachNotes: 'ملاحظات المدرب',
    coachNotesPlaceholder: 'اكتب ملاحظات الوالد/المدرب هنا...',
    nextGoal: 'هدف التدريب القادم لمدة 7 أيام',
    nextGoalPlaceholder: 'اكتب هدف التحسين للأسبوع القادم...',
    suggestGoal: 'اقترح هدف 7 أيام',
    smartCoach: 'قالب المدرب الذكي',
    aiCoachComing: 'مساعد الذكاء الاصطناعي — قريبًا',
    quickSummary: 'ملخص سريع',
    summaryPlayer: 'اللاعب',
    summaryPosition: 'المركز',
    summaryJersey: 'القميص',
    summaryVideoLength: 'مدة الفيديو',
    summaryStrengths: 'نقاط القوة',
    summaryNeedsWork: 'يحتاج إلى تحسين',
    notAdded: 'لم تتم الإضافة بعد',
    colorNotAdded: 'لم تتم إضافة اللون',
    numberNotAdded: 'لم تتم إضافة الرقم',
    saveNotes: 'احفظ الملاحظات',
    clear: 'مسح',
    futurePro: 'مستقبل Soccer Daily Pro',
    pro1: '✅ مساعد ذكاء اصطناعي من الملاحظات المكتوبة',
    pro2: '✅ خطط تدريب أفضل لمدة 7 أيام',
    pro3: '✅ صورة اللاعب + هوية القميص',
    pro4: '✅ تحليل فيديو لمقاطع واضحة من 3–8 دقائق',
    proSmall: 'يمكن لمستخدمي بيتا استخدام Smart Coach Template مجانًا أثناء البناء الآمن.',
    safetyPrivacy: 'السلامة والخصوصية',
    safetyText: 'استخدم فيديوهات التدريب أو الفيديوهات الشخصية بإذن. لا تحكم على الأطفال علنًا ولا تنشر معلومات خاصة أو فيديوهات محمية بدون حقوق.',
  },
};


export default function PlayerAnalysisLabScreen() {
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

  const topT = playerLabTopText[language] || playerLabTopText.en;
  const [playerName, setPlayerName] = useState('');
  const [position, setPosition] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [jerseyColor, setJerseyColor] = useState('');
  const [videoLength, setVideoLength] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [strengths, setStrengths] = useState('');
  const [needsWork, setNeedsWork] = useState('');
  const [coachNotes, setCoachNotes] = useState('');
  const [trainingGoal, setTrainingGoal] = useState('');

  useEffect(() => {
    loadSavedAnalysis();
  }, []);

  async function loadSavedAnalysis() {
    try {
      const saved = await AsyncStorage.getItem('soccerDailyPlayerAnalysis');

      if (!saved) return;

      const data = JSON.parse(saved);

      setPlayerName(data.playerName || '');
      setPosition(data.position || '');
      setJerseyNumber(data.jerseyNumber || '');
      setJerseyColor(data.jerseyColor || '');
      setVideoLength(data.videoLength || '');
      setYoutubeLink(data.youtubeLink || '');
      setStrengths(data.strengths || '');
      setNeedsWork(data.needsWork || '');
      setCoachNotes(data.coachNotes || '');
      setTrainingGoal(data.trainingGoal || '');
    } catch (error) {
      console.log('Could not load player analysis:', error);
    }
  }

  async function saveAnalysis() {
    try {
      const data = {
        playerName: playerName.trim(),
        position: position.trim(),
        jerseyNumber: jerseyNumber.trim(),
        jerseyColor: jerseyColor.trim(),
        videoLength: videoLength.trim(),
        youtubeLink: youtubeLink.trim(),
        strengths: strengths.trim(),
        needsWork: needsWork.trim(),
        coachNotes: coachNotes.trim(),
        trainingGoal: trainingGoal.trim(),
        updatedAt: Date.now(),
      };

      await AsyncStorage.setItem('soccerDailyPlayerAnalysis', JSON.stringify(data));

      Alert.alert('Saved', 'Player analysis notes saved on this device.');
    } catch (error) {
      console.log('Could not save player analysis:', error);
      Alert.alert('Error', 'Could not save player analysis.');
    }
  }

  async function openVideo() {
    const link = youtubeLink.trim();

    if (!link) {
      Alert.alert('Missing link', 'Please paste a YouTube video link first.');
      return;
    }

    if (!link.startsWith('http')) {
      Alert.alert('Invalid link', 'Please paste a full YouTube link starting with https://');
      return;
    }

    try {
      await Linking.openURL(link);
    } catch (error) {
      console.log('Could not open video:', error);
      Alert.alert('Error', 'Could not open this video link.');
    }
  }

  async function performClearAnalysis() {
    try {
      await AsyncStorage.removeItem('soccerDailyPlayerAnalysis');

      setPlayerName('');
      setPosition('');
      setJerseyNumber('');
      setJerseyColor('');
      setVideoLength('');
      setYoutubeLink('');
      setStrengths('');
      setNeedsWork('');
      setCoachNotes('');
      setTrainingGoal('');

      if (Platform.OS === 'web') {
        const browserWindow = globalThis as any;

        if (typeof browserWindow.alert === 'function') {
          browserWindow.alert('Player analysis cleared.');
        }
      } else {
        Alert.alert('Cleared', 'Player analysis has been cleared.');
      }
    } catch (error) {
      console.log('Could not clear player analysis:', error);

      if (Platform.OS === 'web') {
        const browserWindow = globalThis as any;

        if (typeof browserWindow.alert === 'function') {
          browserWindow.alert('Could not clear player analysis.');
        }
      } else {
        Alert.alert('Error', 'Could not clear player analysis.');
      }
    }
  }

  async function clearAnalysis() {
    if (Platform.OS === 'web') {
      const browserWindow = globalThis as any;

      const confirmed =
        typeof browserWindow.confirm === 'function'
          ? browserWindow.confirm(
              'Clear Analysis?\n\nThis will clear the saved player analysis from this device.'
            )
          : true;

      if (!confirmed) return;

      await performClearAnalysis();
      return;
    }

    Alert.alert(
      'Clear Analysis?',
      'This will clear the saved player analysis from this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            void performClearAnalysis();
          },
        },
      ]
    );
  }

  function autoFillTrainingGoal() {
    const weak = needsWork.trim();

    if (weak) {
      setTrainingGoal(
        `For the next 7 days, focus on ${weak}. Watch the player${jerseyColor || jerseyNumber ? ` in ${jerseyColor || 'the'} jersey #${jerseyNumber || '?'}` : ''}, practice 15 minutes daily, track progress, and review the video again after one week.`
      );
    } else {
      setTrainingGoal(
        'For the next 7 days, focus on first touch, weak foot, passing accuracy, short sprints, and recovery.'
      );
    }
  }

  function smartCoachTemplate() {
    const name = playerName.trim() || 'This player';
    const role = position.trim() || 'player';
    const strong = strengths.trim() || 'effort, focus, and willingness to improve';
    const weak = needsWork.trim() || 'first touch, weak foot, stamina, and decision-making';
    const jersey = jerseyColor || jerseyNumber
      ? ` wearing ${jerseyColor || 'the'} jersey #${jerseyNumber || '?'}`
      : '';

    setCoachNotes(
      `${name} is a ${role}${jersey}. Main strengths: ${strong}. Main improvement areas: ${weak}. Watch the video carefully for body position, first touch, movement without the ball, confidence, and recovery after mistakes. Keep feedback positive and focus on one or two goals at a time.`
    );

    setTrainingGoal(
      `7-Day Goal for ${name}: Day 1–2 focus on ball control and weak-foot touches. Day 3–4 focus on passing accuracy and first touch. Day 5 focus on speed and stamina. Day 6 review the video and repeat weak areas. Day 7 light recovery and reflection. Main focus: ${weak}.`
    );
  }

  function showAiCoachComingSoon() {
    Alert.alert(
      'AI Coach Assist — Pro Coming Later',
      'During beta, Smart Coach Template is free. Later, Soccer Daily Pro can include AI Coach Assist, deeper player notes, and video-based analysis using jersey number, jersey color, player photo, and clear training video.'
    );
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>{topT.back}</Text>
      </Pressable>

      <View style={styles.hero}>
        <Text style={styles.kicker}>{topT.kicker}</Text>
        <Text style={styles.title}>{topT.title}</Text>
        <Text style={styles.subtitle}>{topT.subtitle}</Text>
      </View>

      <View style={styles.noticeCard}>
        <Text style={styles.noticeTitle}>{topT.noticeTitle}</Text>
        <Text style={styles.noticeText}>{topT.noticeText}</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>{topT.playerDetails}</Text>

        <Text style={styles.label}>{topT.playerName}</Text>
        <TextInput
          style={styles.input}
          placeholder={topT.playerNamePlaceholder}
          placeholderTextColor="#718096"
          value={playerName}
          onChangeText={setPlayerName}
        />

        <Text style={styles.label}>{topT.position}</Text>
        <TextInput
          style={styles.input}
          placeholder={topT.positionPlaceholder}
          placeholderTextColor="#718096"
          value={position}
          onChangeText={setPosition}
        />

        <Text style={styles.label}>{topT.jerseyNumber}</Text>
        <TextInput
          style={styles.input}
          placeholder={topT.jerseyNumberPlaceholder}
          placeholderTextColor="#718096"
          value={jerseyNumber}
          onChangeText={setJerseyNumber}
          keyboardType="number-pad"
        />

        <Text style={styles.label}>{topT.jerseyColor}</Text>
        <TextInput
          style={styles.input}
          placeholder={topT.jerseyColorPlaceholder}
          placeholderTextColor="#718096"
          value={jerseyColor}
          onChangeText={setJerseyColor}
        />

        <Text style={styles.label}>{topT.videoLength}</Text>
        <TextInput
          style={styles.input}
          placeholder={topT.videoLengthPlaceholder}
          placeholderTextColor="#718096"
          value={videoLength}
          onChangeText={setVideoLength}
        />

        <View style={styles.aiInfoCard}>
          <Text style={styles.aiInfoTitle}>{topT.aiVideoTitle}</Text>
          <Text style={styles.aiInfoText}>{topT.aiVideoText1}</Text>
          <Text style={styles.aiInfoText}>{topT.aiVideoText2}</Text>
        </View>

        <Text style={styles.label}>{topT.youtubeLink}</Text>
        <TextInput
          style={styles.input}
          placeholder={topT.youtubePlaceholder}
          placeholderTextColor="#718096"
          value={youtubeLink}
          onChangeText={setYoutubeLink}
          autoCapitalize="none"
          keyboardType="url"
        />

        <Pressable style={styles.videoButton} onPress={openVideo}>
          <Text style={styles.videoButtonText}>{topT.openVideo}</Text>
        </Pressable>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>{topT.analysisNotes}</Text>

        <Text style={styles.label}>{topT.strengths}</Text>
        <TextInput
          style={styles.textArea}
          placeholder={topT.strengthsPlaceholder}
          placeholderTextColor="#718096"
          value={strengths}
          onChangeText={setStrengths}
          multiline
        />

        <Text style={styles.label}>{topT.needsWork}</Text>
        <TextInput
          style={styles.textArea}
          placeholder={topT.needsWorkPlaceholder}
          placeholderTextColor="#718096"
          value={needsWork}
          onChangeText={setNeedsWork}
          multiline
        />

        <Text style={styles.label}>{topT.coachNotes}</Text>
        <TextInput
          style={styles.textArea}
          placeholder={topT.coachNotesPlaceholder}
          placeholderTextColor="#718096"
          value={coachNotes}
          onChangeText={setCoachNotes}
          multiline
        />

        <Text style={styles.label}>{topT.nextGoal}</Text>
        <TextInput
          style={styles.textArea}
          placeholder={topT.nextGoalPlaceholder}
          placeholderTextColor="#718096"
          value={trainingGoal}
          onChangeText={setTrainingGoal}
          multiline
        />

        <Pressable style={styles.autoButton} onPress={autoFillTrainingGoal}>
          <Text style={styles.autoButtonText}>{topT.suggestGoal}</Text>
        </Pressable>

        <Pressable style={styles.coachButton} onPress={smartCoachTemplate}>
          <Text style={styles.coachButtonText}>{topT.smartCoach}</Text>
        </Pressable>

        <Pressable style={styles.aiComingButton} onPress={showAiCoachComingSoon}>
          <Text style={styles.aiComingButtonText}>{topT.aiCoachComing}</Text>
        </Pressable>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>{topT.quickSummary}</Text>
        <Text style={styles.summaryText}>👤 {topT.summaryPlayer}: {playerName || topT.notAdded}</Text>
        <Text style={styles.summaryText}>📍 {topT.summaryPosition}: {position || topT.notAdded}</Text>
        <Text style={styles.summaryText}>👕 {topT.summaryJersey}: {jerseyColor || topT.colorNotAdded} #{jerseyNumber || topT.numberNotAdded}</Text>
        <Text style={styles.summaryText}>🎥 {topT.summaryVideoLength}: {videoLength || topT.notAdded}</Text>
        <Text style={styles.summaryText}>⭐ {topT.summaryStrengths}: {strengths || topT.notAdded}</Text>
        <Text style={styles.summaryText}>🎯 {topT.summaryNeedsWork}: {needsWork || topT.notAdded}</Text>
      </View>

      <View style={styles.actionRow}>
        <Pressable style={styles.saveButton} onPress={saveAnalysis}>
          <Text style={styles.saveButtonText}>{topT.saveNotes}</Text>
        </Pressable>

        <Pressable style={styles.clearButton} onPress={clearAnalysis}>
          <Text style={styles.clearButtonText}>{topT.clear}</Text>
        </Pressable>
      </View>

      <View style={styles.proCard}>
        <Text style={styles.proTitle}>{topT.futurePro}</Text>
        <Text style={styles.proText}>{topT.pro1}</Text>
        <Text style={styles.proText}>{topT.pro2}</Text>
        <Text style={styles.proText}>{topT.pro3}</Text>
        <Text style={styles.proText}>{topT.pro4}</Text>
        <Text style={styles.proSmall}>{topT.proSmall}</Text>
      </View>

      <View style={styles.warningCard}>
        <Text style={styles.warningTitle}>{topT.safetyPrivacy}</Text>
        <Text style={styles.warningText}>{topT.safetyText}</Text>
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
    paddingTop: 62,
    paddingBottom: 48,
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
    fontSize: 34,
    fontWeight: '900',
    marginBottom: 10,
  },
  subtitle: {
    color: '#E2E8F0',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
  },
  noticeCard: {
    backgroundColor: '#052E16',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#22C55E',
    marginBottom: 16,
  },
  noticeTitle: {
    color: '#FFD166',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
  },
  noticeText: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: '#0B1729',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#24344F',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFD166',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 14,
  },
  label: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 7,
    marginTop: 6,
  },
  input: {
    backgroundColor: '#071526',
    color: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#24344F',
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  textArea: {
    backgroundColor: '#071526',
    color: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#24344F',
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 105,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  videoButton: {
    backgroundColor: '#22C55E',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 2,
  },
  videoButtonText: {
    color: '#052E16',
    fontSize: 17,
    fontWeight: '900',
  },
  autoButton: {
    backgroundColor: '#132238',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD166',
  },
  autoButtonText: {
    color: '#FFD166',
    fontSize: 16,
    fontWeight: '900',
  },
  summaryCard: {
    backgroundColor: '#111C2E',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFD166',
    marginBottom: 16,
  },
  summaryTitle: {
    color: '#FFD166',
    fontSize: 21,
    fontWeight: '900',
    marginBottom: 10,
  },
  summaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#FFD166',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#07111F',
    fontSize: 18,
    fontWeight: '900',
  },
  clearButton: {
    backgroundColor: '#EF4444',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  warningCard: {
    backgroundColor: '#2A1F12',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFD166',
  },
  warningTitle: {
    color: '#FFD166',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
  },
  warningText: {
    color: '#FFE8A3',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '700',
  },
  aiInfoCard: {
    backgroundColor: '#052E16',
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: '#22C55E',
    marginBottom: 12,
  },
  aiInfoTitle: {
    color: '#FFD166',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 6,
  },
  aiInfoText: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '700',
    marginBottom: 5,
  },

  coachButton: {
    backgroundColor: '#22C55E',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  coachButtonText: {
    color: '#052E16',
    fontSize: 16,
    fontWeight: '900',
  },
  aiComingButton: {
    backgroundColor: '#111C2E',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  aiComingButtonText: {
    color: '#38BDF8',
    fontSize: 16,
    fontWeight: '900',
  },

  proCard: {
    backgroundColor: '#071526',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#38BDF8',
    marginBottom: 16,
  },
  proTitle: {
    color: '#38BDF8',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 10,
  },
  proText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '800',
  },
  proSmall: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
    fontWeight: '700',
  },

});
