import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image as ExpoImage } from 'expo-image';
import { getAuth } from 'firebase/auth';
import { db } from '../../firebase/config';
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Easing, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

const matches = [
  {
    id: 'usa-mexico',
    title: 'USA vs Mexico',
    teamA: 'USA',
    teamB: 'Mexico',
    date: 'Featured Match',
    insight: 'USA has better recent momentum, but Mexico is dangerous in counterattack.',
    fanA: 56,
    fanDraw: 24,
    fanB: 20,
  },
  {
    id: 'arg-brazil',
    title: 'Argentina vs Brazil',
    teamA: 'Argentina',
    teamB: 'Brazil',
    date: 'Classic Rivalry',
    insight: 'Brazil has speed on the wings, Argentina has more control in the middle.',
    fanA: 42,
    fanDraw: 22,
    fanB: 36,
  },
  {
    id: 'eng-france',
    title: 'England vs France',
    teamA: 'England',
    teamB: 'France',
    date: 'Big Game',
    insight: 'France has explosive pace, England has balance and set-piece threat.',
    fanA: 39,
    fanDraw: 25,
    fanB: 36,
  },
];


const fanTarotCards = [
  {
    name: '⚽ The Striker',
    meaning: 'Attacking energy is strong. One side may create clear chances early.',
    pickTemplate: '{teamA} has attacking momentum',
    confidence: 72,
  },
  {
    name: '🧤 The Keeper',
    meaning: 'Defense and goalkeeping may decide this match. A tight score is likely.',
    pickTemplate: 'Draw or low-scoring match',
    confidence: 64,
  },
  {
    name: '👑 The Captain',
    meaning: 'Leadership and experience may control the pressure moments.',
    pickTemplate: '{teamA} controls the big moments',
    confidence: 70,
  },
  {
    name: '🔥 The Comeback',
    meaning: 'The match may change late. Do not trust the first-half feeling too much.',
    pickTemplate: '{teamB} can fight back',
    confidence: 68,
  },
  {
    name: '🌧️ The Red Card',
    meaning: 'Discipline, mistakes, or emotional moments may shift the result.',
    pickTemplate: 'Unexpected twist in the match',
    confidence: 61,
  },
  {
    name: '🛡️ The Defense',
    meaning: 'Shape, patience, and defending may matter more than pure attack.',
    pickTemplate: 'Draw feels possible',
    confidence: 63,
  },
  {
    name: '🚀 The Counter Attack',
    meaning: 'Speed in transition could punish the team that keeps more possession.',
    pickTemplate: '{teamB} can hurt on counters',
    confidence: 69,
  },
  {
    name: '🏟️ The Home Crowd',
    meaning: 'Fan energy and pressure may lift one team during key moments.',
    pickTemplate: '{teamA} has crowd energy',
    confidence: 71,
  },
  {
    name: '⏳ Extra Time',
    meaning: 'This feels close. Small details may decide it late.',
    pickTemplate: 'Very close match',
    confidence: 60,
  },
  {
    name: '⭐ The Star Player',
    meaning: 'One special player may change the match with one big moment.',
    pickTemplate: 'Star player decides the game',
    confidence: 74,
  },
];

type GlobalPrediction = {
  id: string;
  predictionId?: string;
  userId?: string;
  userEmail?: string;
  displayName?: string;
  photoUrl?: string;
  matchId?: string;
  match?: string;
  pick?: string;
  confidence?: number;
  potentialXp?: number;
  pointsAwarded?: number;
  status?: string;
  cycleId?: string;
  createdAtUtc?: string;
};

type PredictionItem = {
  id: string;
  match: string;
  pick: string;
  confidence: number;
  reason: string;
  xp: number;
  createdAt: string;
  createdAtUtc?: string;
  status?: 'pending' | 'locked' | 'scored';
  potentialXp?: number;
  pointsAwarded?: number;
  cycleId?: string;
  matchFinalAtUtc?: string;
};

const WHEEL_SIZE = 250;
const CENTER = WHEEL_SIZE / 2;
const RADIUS = 116;

function polarPoint(angle: number, radius = RADIUS) {
  const rad = (Math.PI / 180) * angle;
  return {
    x: CENTER + radius * Math.sin(rad),
    y: CENTER - radius * Math.cos(rad),
  };
}

function sectorPath(startAngle: number, endAngle: number) {
  const start = polarPoint(startAngle);
  const end = polarPoint(endAngle);

  let diff = endAngle - startAngle;
  if (diff < 0) diff += 360;

  const largeArcFlag = diff > 180 ? 1 : 0;

  return [
    `M ${CENTER} ${CENTER}`,
    `L ${start.x} ${start.y}`,
    `A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
}


function getUtcWeekCycleId(date = new Date()) {
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utc.getUTCDay(); // Sunday 0, Monday 1
  const daysSinceMonday = (day + 6) % 7;
  utc.setUTCDate(utc.getUTCDate() - daysSinceMonday);
  return utc.toISOString().slice(0, 10); // Monday date in UTC
}

function getNextMondayUtcLabel(date = new Date()) {
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utc.getUTCDay();
  const daysUntilNextMonday = ((8 - day) % 7) || 7;
  utc.setUTCDate(utc.getUTCDate() + daysUntilNextMonday);
  return `${utc.toISOString().slice(0, 10)} 00:00 UTC`;
}

function predictorRankTitle(index: number, xp: number) {
  if (xp <= 0) return '⏳ Pending Predictor';
  if (index === 0) return '🐐 GOAT Predictor';
  if (index === 1) return '💎 Diamond Predictor';
  if (index === 2) return '🥇 Gold Predictor';
  if (index >= 3 && index <= 9) return '🔥 Super Predictor';
  if (index >= 10 && index <= 24) return '⭐ Rising Predictor';
  return '⚽ Fan Predictor';
}

function predictorRankNote(index: number, xp: number) {
  if (xp <= 0) return 'Waiting for final match results';
  if (index === 0) return 'Only one GOAT per weekly cycle';
  if (index === 1) return 'Rank #2';
  if (index === 2) return 'Rank #3';
  if (index >= 3 && index <= 9) return 'Rank #4–10';
  if (index >= 10 && index <= 24) return 'Rank #11–25';
  return 'Active predictor';
}

function openSpotTitle(index: number) {
  if (index === 0) return '🐐 GOAT';
  if (index === 1) return '💎 Diamond';
  if (index === 2) return '🥇 Gold';
  return 'Open Spot';
}

function comparePredictorRows(a: any, b: any) {
  // Ranking order:
  // 1. Points
  // 2. Accuracy
  // 3. Correct predictions
  // 4. Difficulty / underdog points
  // 5. Earlier prediction behavior
  // 6. Streak
  // 7. First to reach score
  const pointDiff = (b.xp || 0) - (a.xp || 0);
  if (pointDiff !== 0) return pointDiff;

  const accuracyDiff = (b.accuracy || 0) - (a.accuracy || 0);
  if (accuracyDiff !== 0) return accuracyDiff;

  const correctDiff = (b.correctPicks || 0) - (a.correctPicks || 0);
  if (correctDiff !== 0) return correctDiff;

  const difficultyDiff = (b.underdogPoints || 0) - (a.underdogPoints || 0);
  if (difficultyDiff !== 0) return difficultyDiff;

  const earlyDiff = (b.earlyPickPoints || 0) - (a.earlyPickPoints || 0);
  if (earlyDiff !== 0) return earlyDiff;

  const streakDiff = (b.streak || 0) - (a.streak || 0);
  if (streakDiff !== 0) return streakDiff;

  const aReached = a.reachedScoreAtUtc ? new Date(a.reachedScoreAtUtc).getTime() : Number.MAX_SAFE_INTEGER;
  const bReached = b.reachedScoreAtUtc ? new Date(b.reachedScoreAtUtc).getTime() : Number.MAX_SAFE_INTEGER;

  return aReached - bReached;
}

function scientificPointRuleSummary() {
  return 'Participation points + final-result points + confidence + difficulty + early pick + streak.';
}

function labelFontSize(name: string) {
  if (name.length >= 9) return 13;
  if (name.length >= 7) return 14;
  return 16;
}

export default function PredictionScreen() {
  const [selectedMatch, setSelectedMatch] = useState(matches[0]);
  const [pick, setPick] = useState('');
  const [confidence, setConfidence] = useState(60);
  const [reason, setReason] = useState('');
  const [history, setHistory] = useState<PredictionItem[]>([]);
  const [globalPredictions, setGlobalPredictions] = useState<GlobalPrediction[]>([]);
  const [globalPredictionsLoading, setGlobalPredictionsLoading] = useState(false);
  const [spinResult, setSpinResult] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [tarotCard, setTarotCard] = useState<(typeof fanTarotCards)[number] | null>(null);
  const [showChasers, setShowChasers] = useState(false);
  const [showLeague, setShowLeague] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showMatchDropdown, setShowMatchDropdown] = useState(false);
  const [predictionMethod, setPredictionMethod] = useState<'wheel' | 'tarot'>('wheel');

  const spinAnim = useRef(new Animated.Value(0)).current;
  const pointerAngleRef = useRef(0);

  const m = selectedMatch;

  useEffect(() => {
    loadHistory();
    loadGlobalPredictions();
  }, []);

  async function loadGlobalPredictions() {
    try {
      setGlobalPredictionsLoading(true);

      const globalQuery = query(
        collection(db, 'predictions'),
        orderBy('createdAt', 'desc'),
        limit(500)
      );

      const snapshot = await getDocs(globalQuery);

      const items: GlobalPrediction[] = snapshot.docs.map((predictionDoc) => ({
        id: predictionDoc.id,
        ...(predictionDoc.data() as Omit<GlobalPrediction, 'id'>),
      }));

      setGlobalPredictions(items);
      console.log(`Loaded ${items.length} global predictions.`);
    } catch (error) {
      console.log('Load global predictions error:', error);
      setGlobalPredictions([]);
    } finally {
      setGlobalPredictionsLoading(false);
    }
  }

  async function loadHistory() {
    const saved = await AsyncStorage.getItem('predictionHistory');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }

  function chooseMatch(match: (typeof matches)[0]) {
    setSelectedMatch(match);
    setPick('');
    setReason('');
    setSpinResult('');
    setTarotCard(null);
    setConfidence(60);
    pointerAngleRef.current = 0;
    spinAnim.setValue(0);
  }

  function spinWheel() {
    if (spinning) return;

    setSpinning(true);
    setSpinResult('');

    const resultOptions = [
      `${m.teamA} Wins`,
      'Draw',
      `${m.teamB} Wins`,
    ];

    const landingAngles = [
      300, // left/top zone: team A
      180, // bottom zone: draw
      60,  // right/top zone: team B
    ];

    const selectedIndex = Math.floor(Math.random() * resultOptions.length);
    const selectedOption = resultOptions[selectedIndex];
    const targetAngle = landingAngles[selectedIndex];

    const currentAngle = pointerAngleRef.current % 360;
    let extraAngle = targetAngle - currentAngle;
    if (extraAngle < 0) extraAngle += 360;

    const randomTurns = 7 + Math.floor(Math.random() * 5);
    const randomDuration = 4800 + Math.floor(Math.random() * 2800);

    const finalAngle = pointerAngleRef.current + 360 * randomTurns + extraAngle;

    Animated.timing(spinAnim, {
      toValue: finalAngle,
      duration: randomDuration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      pointerAngleRef.current = finalAngle;
      setSpinResult(selectedOption);
      setPick(selectedOption);
      setReason(`My spin prediction says: ${selectedOption}.`);
      setConfidence(70);
      setSpinning(false);
    });
  }


  function drawFanTarot() {
    const card = fanTarotCards[Math.floor(Math.random() * fanTarotCards.length)];
    const tarotPick = card.pickTemplate
      .replace('{teamA}', m.teamA)
      .replace('{teamB}', m.teamB);

    setTarotCard(card);
    setPick(tarotPick);
    setConfidence(card.confidence);
    setReason(`Fan Tarot drew ${card.name}. ${card.meaning} For fun only, not betting advice.`);
  }

  async function postPredictionToFanZone(newPrediction: PredictionItem) {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const currentEmail = user?.email || 'guest@soccerdaily.app';
      const currentUid = user?.uid || '';
      const savedBadge = await AsyncStorage.getItem('favoriteFanBadge');

      const badge = savedBadge || 'General Fan Wall';
      const postTitle = tarotCard
        ? '🔮 Fan Tarot Pick'
        : spinResult
          ? '🎡 Prediction Wheel Pick'
          : '⚽ Match Prediction';

      const cardText = tarotCard
        ? `\nCard: ${tarotCard.name}\nMeaning: ${tarotCard.meaning}`
        : '';

      const fanZoneText =
        `${postTitle}\n\n` +
        `Match: ${newPrediction.match}` +
        cardText +
        `\nPick: ${newPrediction.pick}` +
        `\nConfidence: ${newPrediction.confidence}%` +
        `\nReason: ${newPrediction.reason}` +
        `\nStatus: Pending until match is final` +
        `\n\nPosted from Soccer Daily Predictions.`;

      await addDoc(collection(db, 'fanWall'), {
        text: fanZoneText,
        userEmail: currentEmail,
        userId: currentUid,
        badge,
        user: currentEmail.split('@')[0],
        likes: [],
        comments: [],
        source: 'prediction',
        predictionId: newPrediction.id,
        createdAt: serverTimestamp(),
      });

      return true;
    } catch (error) {
      console.log('Fan Zone prediction post error:', error);
      return false;
    }
  }

  async function savePrediction() {
    if (!pick) {
      Alert.alert('Choose prediction', 'Please choose a team, draw, or spin the wheel first.');
      return;
    }

    const xp = confidence >= 80 ? 25 : confidence >= 60 ? 15 : 10;

    const now = new Date();

    const newPrediction: PredictionItem = {
      id: Date.now().toString(),
      match: selectedMatch.title,
      pick,
      confidence,
      reason: reason.trim() || 'No reason added.',
      xp,
      potentialXp: xp,
      pointsAwarded: 0,
      status: 'pending',
      cycleId: 'pending-final-result',
      createdAt: now.toLocaleString(),
      createdAtUtc: now.toISOString(),
    };

    const updated = [newPrediction, ...history].slice(0, 10);
    setHistory(updated);
    await AsyncStorage.setItem('predictionHistory', JSON.stringify(updated));

    const user = getAuth().currentUser;
    let savedToFirestore = false;

    if (user) {
      try {
        await addDoc(collection(db, 'predictions'), {
          predictionId: newPrediction.id,
          userId: user.uid,
          userEmail: user.email?.trim().toLowerCase() || '',
          displayName:
            user.displayName ||
            user.email?.split('@')[0] ||
            'Soccer Fan',
          photoUrl: user.photoURL || '',
          matchId: selectedMatch.id,
          match: selectedMatch.title,
          teamA: selectedMatch.teamA,
          teamB: selectedMatch.teamB,
          pick: newPrediction.pick,
          confidence: newPrediction.confidence,
          reason: newPrediction.reason,
          potentialXp: newPrediction.potentialXp || xp,
          pointsAwarded: 0,
          status: 'pending',
          cycleId: getUtcWeekCycleId(now),
          createdAt: serverTimestamp(),
          createdAtUtc: newPrediction.createdAtUtc,
        });

        savedToFirestore = true;
      } catch (error) {
        console.log('Save prediction to Firestore error:', error);
      }
    }

    const postedToFanZone = await postPredictionToFanZone(newPrediction);

    setPick('');
    setReason('');
    setConfidence(60);
    setSpinResult('');

    Alert.alert(
      'Prediction Saved',
      savedToFirestore
        ? postedToFanZone
          ? `Prediction saved to the global league as pending. Potential XP: ${xp}. Points count after the match is final.`
          : `Prediction saved to the global league as pending. Potential XP: ${xp}. Fan Zone post could not be created.`
        : `Prediction saved on this device. Potential XP: ${xp}. Global league save could not be completed.`
    );
  }

  async function clearHistory() {
    await AsyncStorage.removeItem('predictionHistory');
    setHistory([]);
  }

  const pointerRotate = spinAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const teamAPos = polarPoint(300, 74);
  const drawPos = polarPoint(180, 76);
  const teamBPos = polarPoint(60, 74);

  const topLine = polarPoint(0);
  const rightLine = polarPoint(120);
  const leftLine = polarPoint(240);

  const authUser = getAuth().currentUser;
  const currentCycleId = getUtcWeekCycleId(new Date());
  const nextResetLabel = getNextMondayUtcLabel(new Date());
  const displayName = authUser?.displayName || authUser?.email?.split('@')[0] || 'You';
  const profilePhotoUrl = authUser?.photoURL || '';

  const scoredPredictions = history.filter((item) => item.status === 'scored');
  const pendingPredictions = history.filter((item) => item.status !== 'scored');

  const scoredXp = scoredPredictions.reduce(
    (total, item) => total + (item.pointsAwarded ?? item.xp ?? 0),
    0
  );

  // Small activity points keep users interested even before match final.
  // Big ranking points still depend on final match result.
  const participationPoints = history.length * 2;
  const pendingPotentialPoints = pendingPredictions.reduce(
    (total, item) => total + (item.potentialXp ?? item.xp ?? 0),
    0
  );
  const visibleUserPoints = scoredXp + participationPoints;

  const predictorRows = [
    {
      id: 'current-user',
      name: displayName,
      photoUrl: profilePhotoUrl,
      xp: visibleUserPoints,
      scoredXp,
      participationPoints,
      pendingPotentialPoints,
      pending: pendingPredictions.length,
      total: history.length,
      accuracy: scoredPredictions.length > 0 ? 100 : 0,
      correctPicks: scoredPredictions.length,
      underdogPoints: 0,
      earlyPickPoints: 0,
      streak: 0,
      reachedScoreAtUtc: scoredPredictions[0]?.matchFinalAtUtc || scoredPredictions[0]?.createdAtUtc || '',
    },
  ].sort(comparePredictorRows);

  const topPredictorSlots = [0, 1, 2].map((index) => ({
    index,
    row: predictorRows[index],
    title: openSpotTitle(index),
  }));

  const otherPredictors = predictorRows.slice(3);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>🔮 Predictions</Text>
      <Text style={styles.subtitle}>
        Choose a match, spin the pro soccer selector, and save your fan prediction.
      </Text>

      <View style={styles.quickGuide}>
        <Text style={styles.quickGuideTitle}>Make Your Prediction</Text>
        <Text style={styles.quickGuideStep}>1. Choose a match</Text>
        <Text style={styles.quickGuideStep}>2. Pick the winner or draw</Text>
        <Text style={styles.quickGuideStep}>3. Set confidence and save</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>1. Choose Match</Text>

        <Pressable
          style={styles.dropdownButton}
          onPress={() => setShowMatchDropdown(!showMatchDropdown)}
        >
          <View>
            <Text style={styles.dropdownMainText}>{selectedMatch.title}</Text>
            <Text style={styles.dropdownSubText}>{selectedMatch.date}</Text>
          </View>

          <Text style={styles.dropdownArrow}>
            {showMatchDropdown ? '▲' : '▼'}
          </Text>
        </Pressable>

        {showMatchDropdown ? (
          <View style={styles.dropdownList}>
            {matches.map((match) => (
              <Pressable
                key={match.id}
                style={[
                  styles.dropdownOption,
                  selectedMatch.id === match.id && styles.activeDropdownOption,
                ]}
                onPress={() => {
                  chooseMatch(match);
                  setShowMatchDropdown(false);
                }}
              >
                <Text style={styles.dropdownOptionTitle}>{match.title}</Text>
                <Text style={styles.dropdownOptionSub}>{match.date}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>2. Choose Prediction Method</Text>

        <View style={styles.methodRow}>
          <Pressable
            style={[
              styles.methodButton,
              predictionMethod === 'wheel' && styles.activeMethodButton,
            ]}
            onPress={() => setPredictionMethod('wheel')}
          >
            <Text
              style={[
                styles.methodButtonText,
                predictionMethod === 'wheel' && styles.activeMethodButtonText,
              ]}
            >
              Soccer Wheel
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.methodButton,
              predictionMethod === 'tarot' && styles.activeMethodButton,
            ]}
            onPress={() => setPredictionMethod('tarot')}
          >
            <Text
              style={[
                styles.methodButtonText,
                predictionMethod === 'tarot' && styles.activeMethodButtonText,
              ]}
            >
              Fan Tarot
            </Text>
          </Pressable>
        </View>
      </View>

      {predictionMethod === 'tarot' ? (
        <View style={styles.tarotCardBox}>
          <Text style={styles.cardTitle}>Fan Tarot Pick</Text>
          <Text style={styles.tarotIntro}>
            Draw a soccer-style tarot card for fun and turn it into a fan prediction.
          </Text>

          <View style={styles.scoreboard}>
            <View style={styles.scoreTeam}>
              <Text style={styles.scoreTeamText}>{m.teamA}</Text>
            </View>

            <Text style={styles.vsText}>VS</Text>

            <View style={styles.scoreTeam}>
              <Text style={styles.scoreTeamText}>{m.teamB}</Text>
            </View>
          </View>

          <Pressable style={styles.tarotButton} onPress={drawFanTarot}>
            <Text style={styles.tarotButtonText}>Draw Fan Tarot</Text>
          </Pressable>

          {tarotCard ? (
            <View style={styles.tarotResult}>
              <Text style={styles.tarotName}>{tarotCard.name}</Text>
              <Text style={styles.tarotMeaning}>{tarotCard.meaning}</Text>
              <Text style={styles.tarotPick}>Pick: {pick}</Text>
              <Text style={styles.tarotPick}>Confidence: {confidence}%</Text>
            </View>
          ) : null}

          <Text style={styles.tarotDisclaimer}>
            For fun only. Not betting advice.
          </Text>
        </View>
      ) : null}

      {predictionMethod === 'wheel' ? (
      <View style={styles.wheelCard}>
        <Text style={styles.cardTitle}>🎡 Soccer Prediction Wheel</Text>

        <View style={styles.scoreboard}>
          <View style={styles.scoreTeam}>
            <Text style={styles.scoreTeamText}>{m.teamA}</Text>
          </View>

          <Text style={styles.vsText}>VS</Text>

          <View style={styles.scoreTeam}>
            <Text style={styles.scoreTeamText}>{m.teamB}</Text>
          </View>
        </View>

        <Text style={styles.wheelSub}>
          Three equal landing zones: {m.teamA} Wins • Draw • {m.teamB} Wins
        </Text>

        <View style={styles.proWheelWrap}>
          <Svg
            width={WHEEL_SIZE}
            height={WHEEL_SIZE}
            viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
            style={styles.wheelSvg}
          >
            <Path d={sectorPath(240, 360)} fill="#15803D" stroke="#F8FAFC" strokeWidth={3} />
            <Path d={sectorPath(0, 120)} fill="#22C55E" stroke="#F8FAFC" strokeWidth={3} />
            <Path d={sectorPath(120, 240)} fill="#166534" stroke="#F8FAFC" strokeWidth={3} />

            <Circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke="#F8FAFC"
              strokeWidth={12}
            />

            <Line x1={CENTER} y1={CENTER} x2={topLine.x} y2={topLine.y} stroke="#F8FAFC" strokeWidth={3} />
            <Line x1={CENTER} y1={CENTER} x2={rightLine.x} y2={rightLine.y} stroke="#F8FAFC" strokeWidth={3} />
            <Line x1={CENTER} y1={CENTER} x2={leftLine.x} y2={leftLine.y} stroke="#F8FAFC" strokeWidth={3} />

            <Circle
              cx={CENTER}
              cy={CENTER}
              r={42}
              fill="#07111F"
              stroke="#FFD166"
              strokeWidth={7}
            />

            <SvgText
              x={teamAPos.x}
              y={teamAPos.y - 10}
              fill="white"
              fontSize={labelFontSize(m.teamA)}
              fontWeight="800"
              textAnchor="middle"
            >
              {m.teamA.toUpperCase()}
            </SvgText>
            <SvgText
              x={teamAPos.x}
              y={teamAPos.y + 10}
              fill="white"
              fontSize="13"
              fontWeight="800"
              textAnchor="middle"
            >
              WINS
            </SvgText>

            <SvgText
              x={drawPos.x}
              y={drawPos.y + 4}
              fill="white"
              fontSize="18"
              fontWeight="900"
              textAnchor="middle"
            >
              DRAW
            </SvgText>

            <SvgText
              x={teamBPos.x}
              y={teamBPos.y - 10}
              fill="white"
              fontSize={labelFontSize(m.teamB)}
              fontWeight="800"
              textAnchor="middle"
            >
              {m.teamB.toUpperCase()}
            </SvgText>
            <SvgText
              x={teamBPos.x}
              y={teamBPos.y + 10}
              fill="white"
              fontSize="13"
              fontWeight="800"
              textAnchor="middle"
            >
              WINS
            </SvgText>
          </Svg>

          <Animated.View
            pointerEvents="none"
            style={[
              styles.rotatingPointer,
              {
                transform: [{ rotate: pointerRotate }],
              },
            ]}
          >
            <View style={styles.pointerBadge}>
              <Text style={styles.pointerBadgeText}>▼</Text>
            </View>
          </Animated.View>

          <View style={styles.centerBall}>
            <Text style={styles.ballText}>⚽</Text>
          </View>
        </View>

        <View style={styles.landingCard}>
          <Text style={styles.landingLabel}>Pointer Landing</Text>
          <Text style={styles.landingText}>
            {spinning ? 'Spinning...' : spinResult || 'Ready'}
          </Text>
        </View>

        <View style={styles.resultChoices}>
          <View style={styles.choicePill}>
            <Text style={styles.choiceSmall}>ZONE 1</Text>
            <Text style={styles.choiceText}>{m.teamA} Wins</Text>
          </View>

          <View style={styles.choicePill}>
            <Text style={styles.choiceSmall}>ZONE 2</Text>
            <Text style={styles.choiceText}>Draw</Text>
          </View>

          <View style={styles.choicePill}>
            <Text style={styles.choiceSmall}>ZONE 3</Text>
            <Text style={styles.choiceText}>{m.teamB} Wins</Text>
          </View>
        </View>

        <Pressable style={styles.spinButton} onPress={spinWheel} disabled={spinning}>
          <Text style={styles.spinButtonText}>
            {spinning ? '🎡 Spinning...' : '🎡 Spin Now'}
          </Text>
        </Pressable>

        {spinResult ? (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>🎯 Spin Result</Text>
            <Text style={styles.resultText}>{spinResult}</Text>
            <Text style={styles.resultSub}>Do you agree with this prediction?</Text>

            <Pressable style={styles.saveResultButton} onPress={savePrediction}>
              <Text style={styles.saveResultText}>Save as My Prediction</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🧠 Match Insight</Text>
        <Text style={styles.matchTitle}>{m.title}</Text>
        <Text style={styles.line}>{m.insight}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Fan Poll Snapshot</Text>

        <View style={styles.pollRow}>
          <Text style={styles.pollLabel}>{m.teamA}</Text>
          <Text style={styles.pollValue}>{m.fanA}%</Text>
        </View>
        <View style={styles.pollBar}>
          <View style={[styles.pollFill, { width: `${m.fanA}%` }]} />
        </View>

        <View style={styles.pollRow}>
          <Text style={styles.pollLabel}>Draw</Text>
          <Text style={styles.pollValue}>{m.fanDraw}%</Text>
        </View>
        <View style={styles.pollBar}>
          <View style={[styles.pollFill, { width: `${m.fanDraw}%` }]} />
        </View>

        <View style={styles.pollRow}>
          <Text style={styles.pollLabel}>{m.teamB}</Text>
          <Text style={styles.pollValue}>{m.fanB}%</Text>
        </View>
        <View style={styles.pollBar}>
          <View style={[styles.pollFill, { width: `${m.fanB}%` }]} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>✅ Your Pick</Text>

        <View style={styles.pickRow}>
          <Pressable
            style={[styles.pickButton, pick === `${m.teamA} Wins` && styles.activePick]}
            onPress={() => setPick(`${m.teamA} Wins`)}
          >
            <Text style={[styles.pickText, pick === `${m.teamA} Wins` && styles.activePickText]}>
              {m.teamA} Wins
            </Text>
          </Pressable>

          <Pressable
            style={[styles.pickButton, pick === 'Draw' && styles.activePick]}
            onPress={() => setPick('Draw')}
          >
            <Text style={[styles.pickText, pick === 'Draw' && styles.activePickText]}>
              Draw
            </Text>
          </Pressable>

          <Pressable
            style={[styles.pickButton, pick === `${m.teamB} Wins` && styles.activePick]}
            onPress={() => setPick(`${m.teamB} Wins`)}
          >
            <Text style={[styles.pickText, pick === `${m.teamB} Wins` && styles.activePickText]}>
              {m.teamB} Wins
            </Text>
          </Pressable>
        </View>

        <Text style={styles.confidenceText}>Confidence: {confidence}%</Text>

        <View style={styles.confidenceRow}>
          <Pressable
            style={styles.smallButton}
            onPress={() => setConfidence(Math.max(10, confidence - 10))}
          >
            <Text style={styles.smallButtonText}>-10</Text>
          </Pressable>

          <Pressable
            style={styles.smallButton}
            onPress={() => setConfidence(Math.min(100, confidence + 10))}
          >
            <Text style={styles.smallButtonText}>+10</Text>
          </Pressable>
        </View>

        <TextInput
          value={reason}
          onChangeText={setReason}
          placeholder="Why do you think this will happen?"
          placeholderTextColor="#7F8A9A"
          multiline
          style={styles.reasonInput}
        />

        <Pressable style={styles.saveButton} onPress={savePrediction}>
          <Text style={styles.saveText}>💾 Save Prediction</Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.sectionToggle}
        onPress={() => setShowHistory(!showHistory)}
      >
        <Text style={styles.sectionToggleTitle}>Prediction History</Text>
        <Text style={styles.sectionToggleText}>
          {history.length} saved prediction{history.length === 1 ? '' : 's'} {showHistory ? '▲' : '▼'}
        </Text>
      </Pressable>

      {showHistory ? (
        <View style={styles.card}>
          <View style={styles.historyHeader}>
            <Text style={styles.cardTitle}>Recent Predictions</Text>

            {history.length > 0 && (
              <Pressable onPress={clearHistory}>
                <Text style={styles.clearText}>Clear</Text>
              </Pressable>
            )}
          </View>

          {history.length === 0 ? (
            <Text style={styles.emptyText}>
              No predictions yet. Spin the wheel or save your first prediction.
            </Text>
          ) : (
            history.slice(0, 3).map((item) => (
              <View key={item.id} style={styles.historyItem}>
                <Text style={styles.historyMatch}>{item.match}</Text>
                <Text style={styles.line}>Pick: {item.pick}</Text>
                <Text style={styles.line}>Confidence: {item.confidence}%</Text>
                <Text style={styles.line}>Reason: {item.reason}</Text>
                <Text style={styles.xpText}>+{item.xp} XP</Text>
                <Text style={styles.dateText}>{item.createdAt}</Text>
              </View>
            ))
          )}

          {history.length > 3 ? (
            <Text style={styles.emptyText}>
              Showing the latest 3 of {history.length} predictions.
            </Text>
          ) : null}
        </View>
      ) : null}

      <Text style={styles.secondarySectionLabel}>League and Rankings</Text>
      <Pressable
        style={styles.sectionToggle}
        onPress={() => setShowLeague(!showLeague)}
      >
        <Text style={styles.sectionToggleTitle}>Weekly Predictor League</Text>
        <Text style={styles.sectionToggleText}>
          Rankings, points and rewards {showLeague ? '▲' : '▼'}
        </Text>
      </Pressable>

      {showLeague ? (
      <View style={styles.topLeagueCard}>
        <Text style={styles.topLeagueTitle}>Weekly Predictor League</Text>
        <Text style={styles.topLeagueSub}>
          One GOAT only. Weekly reset Monday 00:00 UTC. Tie-breakers: points, accuracy, correct picks, difficulty, early picks, streak, then first to reach score.
        </Text>

        <View style={styles.goatFeatureBox}>
          <Text style={styles.goatCrown}>🐐 GOAT Predictor</Text>

          {topPredictorSlots[0]?.row?.photoUrl ? (
            <ExpoImage source={{ uri: topPredictorSlots[0].row.photoUrl }} style={styles.goatAvatarImage} contentFit="cover" />
          ) : (
            <View style={styles.goatAvatarFallback}>
              <Text style={styles.goatAvatarText}>
                {topPredictorSlots[0]?.row ? topPredictorSlots[0].row.name.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
          )}

          <Text style={styles.goatName}>
            {topPredictorSlots[0]?.row ? topPredictorSlots[0].row.name : 'Open GOAT spot'}
          </Text>

          <View style={styles.goatXpPill}>
            <Text style={styles.goatXpText}>
              {topPredictorSlots[0]?.row ? `${topPredictorSlots[0].row.xp} XP` : 'Climb here'}
            </Text>
          </View>

          <Text style={styles.goatRule}>Only Rank #1 can be GOAT this week</Text>
        </View>

        <View style={styles.diamondGoldRow}>
          {[topPredictorSlots[1], topPredictorSlots[2]].map((slot) => (
            <View
              key={slot.index}
              style={[
                styles.smallPodiumBox,
                slot.index === 1 && styles.diamondPodiumBox,
                slot.index === 2 && styles.goldPodiumBox,
              ]}
            >
              <Text style={styles.smallPodiumRank}>{slot.title}</Text>

              {slot.row?.photoUrl ? (
                <ExpoImage source={{ uri: slot.row.photoUrl }} style={styles.smallPodiumAvatarImage} contentFit="cover" />
              ) : (
                <View style={styles.smallPodiumAvatarFallback}>
                  <Text style={styles.smallPodiumAvatarText}>
                    {slot.row ? slot.row.name.charAt(0).toUpperCase() : '?'}
                  </Text>
                </View>
              )}

              <Text style={styles.smallPodiumName}>
                {slot.row ? slot.row.name : 'Open spot'}
              </Text>

              <Text style={styles.smallPodiumXp}>
                {slot.row ? `${slot.row.xp} XP` : 'Climb here'}
              </Text>

              <Text style={styles.smallPodiumTiny}>
                {slot.index === 1 ? 'Rank #2' : 'Rank #3'}
              </Text>
            </View>
          ))}
        </View>


        <Pressable style={styles.chaserToggleBox} onPress={() => setShowChasers(!showChasers)}>
          <View style={styles.chaserMiniGrid}>
            <View style={styles.chaserMiniBox}>
              <Text style={styles.chaserMiniEmoji}>🔥</Text>
              <Text style={styles.chaserMiniTitle}>Super</Text>
              <Text style={styles.chaserMiniSub}>#4–10</Text>
            </View>

            <View style={styles.chaserMiniBox}>
              <Text style={styles.chaserMiniEmoji}>⭐</Text>
              <Text style={styles.chaserMiniTitle}>Rising</Text>
              <Text style={styles.chaserMiniSub}>#11–25</Text>
            </View>

            <View style={styles.chaserMiniBox}>
              <Text style={styles.chaserMiniEmoji}>⚽</Text>
              <Text style={styles.chaserMiniTitle}>Fan</Text>
              <Text style={styles.chaserMiniSub}>All users</Text>
            </View>
          </View>

          <Text style={styles.chaserToggleSub}>
            Tap to {showChasers ? 'hide' : 'open'} predictor list #{4} and below {showChasers ? '▲' : '▼'}
          </Text>
        </Pressable>

        {showChasers ? (
          <View style={styles.chaserListBox}>
            {otherPredictors.length > 0 ? (
              otherPredictors.map((row, index) => {
                const realIndex = index + 3;
                return (
                  <View key={row.id} style={styles.chaserRow}>
                    <Text style={styles.chaserRank}>#{realIndex + 1}</Text>

                    {row.photoUrl ? (
                      <ExpoImage source={{ uri: row.photoUrl }} style={styles.chaserAvatarImage} contentFit="cover" />
                    ) : (
                      <View style={styles.chaserAvatarFallback}>
                        <Text style={styles.chaserAvatarText}>{row.name.charAt(0).toUpperCase()}</Text>
                      </View>
                    )}

                    <View style={styles.chaserInfo}>
                      <Text style={styles.chaserName}>{row.name}</Text>
                      <Text style={styles.chaserBadge}>{predictorRankTitle(realIndex, row.xp)}</Text>
                      <Text style={styles.chaserStats}>
                        Points: {row.xp} • Pending: {row.pending} • Picks: {row.total}
                      </Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyChaserBox}>
                <Text style={styles.emptyChaserText}>
                  More predictors will appear here as users join. Everyone can still see their own points above.
                </Text>
              </View>
            )}
          </View>
        ) : null}


        <View style={styles.leagueRuleStrip}>
          <Text style={styles.leagueRuleText}>Cycle: {currentCycleId}</Text>
          <Text style={styles.leagueRuleText}>Next reset: {nextResetLabel}</Text>
          <Text style={styles.leagueRuleSmall}>
            Points count only after match final. Live games at reset count next cycle.
          </Text>
        </View>

        <View style={styles.myPointsBox}>
          <Text style={styles.myPointsTitle}>📍 My Predictor Points</Text>
          <Text style={styles.myPointsBig}>{visibleUserPoints} pts</Text>
          <Text style={styles.myPointsSmall}>
            Scored: {scoredXp} • Participation: {participationPoints} • Pending potential: {pendingPotentialPoints}
          </Text>
          <Text style={styles.myPointsNote}>
            Every participant can see their points, even outside GOAT, Diamond, Gold, Super, or Rising groups.
          </Text>
        </View>

          <Pressable style={styles.rulesLinkButton} onPress={() => router.push('/prediction-rules' as any)}>
            <Text style={styles.rulesLinkText}>📘 Scoring & Rules Book</Text>
            <Text style={styles.rulesLinkSub}>{scientificPointRuleSummary()}</Text>
          </Pressable>

      </View>
      ) : null}

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
    paddingTop: 75,
    paddingBottom: 40,
  },
  title: {
    color: '#FFD166',
    fontSize: 34,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#A7B0C0',
    fontSize: 16,
    lineHeight: 23,
    marginTop: 8,
    marginBottom: 20,
  },
  quickGuide: {
    backgroundColor: '#111C2D',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  quickGuideTitle: {
    color: '#FFD166',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
  },
  quickGuideStep: {
    color: '#F8FAFC',
    fontSize: 15,
    lineHeight: 25,
  },
  secondarySectionLabel: {
    color: '#A7B0C0',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  dropdownButton: {
    backgroundColor: '#0B1626',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownMainText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  dropdownSubText: {
    color: '#A7B0C0',
    fontSize: 13,
    marginTop: 3,
  },
  dropdownArrow: {
    color: '#FFD166',
    fontSize: 16,
    fontWeight: '800',
  },
  dropdownList: {
    backgroundColor: '#0B1626',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  dropdownOption: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#263447',
  },
  activeDropdownOption: {
    backgroundColor: '#173A2B',
  },
  dropdownOptionTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  dropdownOptionSub: {
    color: '#A7B0C0',
    fontSize: 12,
    marginTop: 3,
  },
  methodRow: {
    flexDirection: 'row',
    gap: 10,
  },
  methodButton: {
    flex: 1,
    backgroundColor: '#0B1626',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeMethodButton: {
    backgroundColor: '#FFD166',
    borderColor: '#FFD166',
  },
  methodButtonText: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '800',
  },
  activeMethodButtonText: {
    color: '#07111F',
  },
  sectionToggle: {
    backgroundColor: '#111C2D',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  sectionToggleTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '800',
  },
  sectionToggleText: {
    color: '#A7B0C0',
    fontSize: 13,
    marginTop: 4,
  },
  topLeagueCard: {
    backgroundColor: '#061322',
    borderRadius: 30,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.45)',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  topLeagueTitle: {
    color: '#FFD166',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  topLeagueSub: {
    color: '#DDE7F0',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  podiumGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    alignItems: 'center',
  },
  podiumBox: {
    flex: 1,
    backgroundColor: '#111C2E',
    borderRadius: 22,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.22)',
    minHeight: 184,
  },
  podiumRank: {
    color: '#FFD166',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  podiumAvatarImage: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#243044',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.75)',
  },
  podiumAvatarFallback: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#243044',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.75)',
  },
  podiumAvatarText: {
    color: '#FFD166',
    fontSize: 20,
    fontWeight: '900',
  },
  podiumName: {
    color: 'white',
    fontWeight: '900',
    fontSize: 14,
    textAlign: 'center',
  },
  podiumXp: {
    color: '#07111F',
    backgroundColor: '#FFD166',
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 8,
    textAlign: 'center',
  },
  podiumTiny: {
    color: '#6EE7B7',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 6,
    textAlign: 'center',
  },
  leagueRuleStrip: {
    backgroundColor: 'rgba(255, 209, 102, 0.14)',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.24)',
  },
  leagueRuleText: {
    color: '#FFD166',
    fontWeight: '900',
    fontSize: 12,
    marginBottom: 3,
  },
  leagueRuleSmall: {
    color: '#E5E7EB',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5,
  },
  chaserHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chaserTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
  },
  chaserSub: {
    color: '#A7B0C0',
    fontSize: 12,
    fontWeight: '800',
  },
  chaserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#101D31',
    borderRadius: 16,
    padding: 10,
    marginBottom: 10,
  },
  chaserRank: {
    color: '#FFD166',
    fontWeight: '900',
    width: 34,
  },
  chaserAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#243044',
    marginRight: 10,
  },
  chaserAvatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#243044',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  chaserAvatarText: {
    color: '#FFD166',
    fontWeight: '900',
  },
  chaserInfo: {
    flex: 1,
  },
  chaserName: {
    color: 'white',
    fontWeight: '900',
  },
  chaserBadge: {
    color: '#FFD166',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },
  chaserStats: {
    color: '#A7B0C0',
    fontSize: 12,
    marginTop: 3,
  },
  emptyChaserBox: {
    backgroundColor: '#101D31',
    borderRadius: 16,
    padding: 12,
  },
  emptyChaserText: {
    color: '#A7B0C0',
    fontSize: 13,
    lineHeight: 19,
  },
  goatPodiumBox: {
    backgroundColor: '#1F1604',
    borderColor: '#FFD166',
    borderWidth: 2,
    transform: [{ scale: 1.04 }],
    shadowColor: '#FFD166',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  diamondPodiumBox: {
    backgroundColor: '#071A2D',
    borderColor: '#67E8F9',
    borderWidth: 2,
    shadowColor: '#67E8F9',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  goldPodiumBox: {
    backgroundColor: '#221A08',
    borderColor: '#FACC15',
    borderWidth: 2,
    shadowColor: '#FACC15',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  rulesLinkButton: {
    backgroundColor: 'rgba(96, 165, 250, 0.14)',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.35)',
  },
  rulesLinkText: {
    color: '#93C5FD',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 4,
  },
  rulesLinkSub: {
    color: '#DDE7F0',
    fontSize: 12,
    lineHeight: 17,
  },
  goatFeatureBox: {
    backgroundColor: '#1F1604',
    borderRadius: 28,
    padding: 18,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#FFD166',
    shadowColor: '#FFD166',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  goatCrown: {
    color: '#FFD166',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 12,
    textAlign: 'center',
  },
  goatAvatarImage: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#243044',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    marginBottom: 12,
  },
  goatAvatarFallback: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#243044',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    marginBottom: 12,
  },
  goatAvatarText: {
    color: '#FFD166',
    fontSize: 34,
    fontWeight: '900',
  },
  goatName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },
  goatXpPill: {
    backgroundColor: '#FFD166',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 7,
    marginBottom: 10,
  },
  goatXpText: {
    color: '#07111F',
    fontWeight: '900',
    fontSize: 16,
  },
  goatRule: {
    color: '#6EE7B7',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  diamondGoldRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  smallPodiumBox: {
    flex: 1,
    backgroundColor: '#111C2E',
    borderRadius: 24,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    minHeight: 178,
  },
  smallPodiumRank: {
    color: '#FFD166',
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },
  smallPodiumAvatarImage: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#243044',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginBottom: 10,
  },
  smallPodiumAvatarFallback: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#243044',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginBottom: 10,
  },
  smallPodiumAvatarText: {
    color: '#FFD166',
    fontSize: 24,
    fontWeight: '900',
  },
  smallPodiumName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
  },
  smallPodiumXp: {
    color: '#07111F',
    backgroundColor: '#FFD166',
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 8,
    textAlign: 'center',
  },
  smallPodiumTiny: {
    color: '#6EE7B7',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 8,
    textAlign: 'center',
  },
  chaserToggleBox: {
    backgroundColor: '#0B1B2D',
    borderRadius: 22,
    padding: 12,
    marginTop: 0,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.35)',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  chaserToggleTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  chaserToggleSub: {
    color: '#A7B0C0',
    fontSize: 12,
    marginTop: 3,
    fontWeight: '700',
  },
  chaserToggleArrow: {
    color: '#FFD166',
    fontSize: 18,
    fontWeight: '900',
    marginLeft: 10,
  },
  chaserListBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 18,
    padding: 8,
    marginBottom: 4,
  },
  myPointsBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.32)',
  },
  myPointsTitle: {
    color: '#6EE7B7',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 4,
  },
  myPointsBig: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 4,
  },
  myPointsSmall: {
    color: '#DDE7F0',
    fontSize: 12,
    lineHeight: 18,
  },
  myPointsNote: {
    color: '#A7B0C0',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  chaserMiniGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  chaserMiniBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 209, 102, 0.12)',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.28)',
  },
  chaserMiniEmoji: {
    fontSize: 20,
    marginBottom: 3,
  },
  chaserMiniTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  chaserMiniSub: {
    color: '#FFD166',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#111C2E',
    padding: 18,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#22314A',
  },
  wheelCard: {
    backgroundColor: '#111C2E',
    padding: 18,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFD166',
  },
  cardTitle: {
    color: '#FFD166',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  matchButton: {
    backgroundColor: '#07111F',
    borderWidth: 1,
    borderColor: '#22314A',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  activeMatchButton: {
    backgroundColor: '#FFD166',
    borderColor: '#FFD166',
  },
  matchText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  matchSubText: {
    color: '#A7B0C0',
    marginTop: 4,
  },
  activeMatchText: {
    color: '#07111F',
  },
  scoreboard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreTeam: {
    backgroundColor: '#07111F',
    borderWidth: 1,
    borderColor: '#22314A',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  scoreTeamText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 17,
  },
  vsText: {
    color: '#FFD166',
    fontWeight: 'bold',
    marginHorizontal: 12,
  },
  wheelSub: {
    color: '#A7B0C0',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 12,
    lineHeight: 20,
  },
  proWheelWrap: {
    width: 300,
    height: 300,
    alignSelf: 'center',
    position: 'relative',
    marginBottom: 10,
  },
  wheelSvg: {
    position: 'absolute',
    top: 25,
    left: 25,
  },
  rotatingPointer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 300,
    height: 300,
    alignItems: 'center',
  },
  pointerBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFD166',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#07111F',
  },
  pointerBadgeText: {
    color: '#07111F',
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 2,
  },
  centerBall: {
    position: 'absolute',
    left: 112,
    top: 112,
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#07111F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ballText: {
    fontSize: 43,
  },
  landingCard: {
    backgroundColor: '#07111F',
    borderWidth: 1,
    borderColor: '#22314A',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    marginBottom: 14,
  },
  landingLabel: {
    color: '#A7B0C0',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  landingText: {
    color: '#FFD166',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 4,
    textAlign: 'center',
  },
  resultChoices: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14,
  },
  choicePill: {
    flex: 1,
    backgroundColor: '#07111F',
    borderWidth: 1,
    borderColor: '#22314A',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 999,
  },
  choiceSmall: {
    color: '#A7B0C0',
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  choiceText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 11,
    textAlign: 'center',
  },
  spinButton: {
    backgroundColor: '#FFD166',
    padding: 16,
    borderRadius: 18,
    alignItems: 'center',
  },
  spinButtonText: {
    color: '#07111F',
    fontWeight: 'bold',
    fontSize: 20,
  },
  resultCard: {
    backgroundColor: '#07111F',
    borderWidth: 1,
    borderColor: '#FFD166',
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  resultTitle: {
    color: '#FFD166',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultSub: {
    color: '#A7B0C0',
    marginTop: 8,
    marginBottom: 14,
  },
  saveResultButton: {
    backgroundColor: '#FFD166',
    padding: 13,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  saveResultText: {
    color: '#07111F',
    fontWeight: 'bold',
  },
  matchTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  line: {
    color: 'white',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 6,
  },
  pollRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  pollLabel: {
    color: 'white',
    fontWeight: 'bold',
  },
  pollValue: {
    color: '#FFD166',
    fontWeight: 'bold',
  },
  pollBar: {
    height: 10,
    backgroundColor: '#07111F',
    borderRadius: 10,
    marginTop: 6,
    overflow: 'hidden',
  },
  pollFill: {
    height: 10,
    backgroundColor: '#FFD166',
    borderRadius: 10,
  },
  pickRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  pickButton: {
    flex: 1,
    backgroundColor: '#07111F',
    borderWidth: 1,
    borderColor: '#22314A',
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  activePick: {
    backgroundColor: '#FFD166',
    borderColor: '#FFD166',
  },
  pickText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  activePickText: {
    color: '#07111F',
  },
  confidenceText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  confidenceRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  smallButton: {
    flex: 1,
    backgroundColor: '#123C69',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  smallButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  reasonInput: {
    backgroundColor: '#07111F',
    color: 'white',
    minHeight: 100,
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 14,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#FFD166',
    padding: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveText: {
    color: '#07111F',
    fontWeight: 'bold',
    fontSize: 16,
  },
  predictorLeagueCard: {
    backgroundColor: '#081827',
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.35)',
  },
  leagueTitle: {
    color: '#FFD166',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
  },
  leagueSubtitle: {
    color: '#DDE7F0',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 12,
  },
  utcRuleCard: {
    backgroundColor: 'rgba(255, 209, 102, 0.12)',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.24)',
  },
  utcRuleText: {
    color: '#FFD166',
    fontWeight: '900',
    marginBottom: 4,
  },
  utcRuleSmall: {
    color: '#E5E7EB',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  rankRulesBox: {
    backgroundColor: '#101D31',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },
  rankRulesTitle: {
    color: 'white',
    fontWeight: '900',
    fontSize: 16,
    marginBottom: 8,
  },
  rankRulesText: {
    color: '#A7B0C0',
    fontSize: 13,
    lineHeight: 20,
  },
  predictorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111C2E',
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
  },
  predictorRankNumber: {
    color: '#FFD166',
    fontWeight: '900',
    fontSize: 16,
    width: 34,
  },
  predictorAvatarImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 12,
    backgroundColor: '#243044',
  },
  predictorAvatarFallback: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 12,
    backgroundColor: '#243044',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.35)',
  },
  predictorAvatarText: {
    color: '#FFD166',
    fontSize: 20,
    fontWeight: '900',
  },
  predictorInfo: {
    flex: 1,
  },
  predictorName: {
    color: 'white',
    fontWeight: '900',
    fontSize: 16,
  },
  predictorTitle: {
    color: '#FFD166',
    fontWeight: '900',
    marginTop: 2,
  },
  predictorNote: {
    color: '#A7B0C0',
    fontSize: 12,
    marginTop: 2,
  },
  predictorStats: {
    color: '#DDE7F0',
    fontSize: 12,
    marginTop: 6,
  },
  pendingInfoBox: {
    backgroundColor: 'rgba(96, 165, 250, 0.12)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.24)',
  },
  pendingInfoTitle: {
    color: '#93C5FD',
    fontWeight: '900',
    marginBottom: 6,
  },
  pendingInfoText: {
    color: '#DDE7F0',
    fontSize: 13,
    lineHeight: 19,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearText: {
    color: '#FFD166',
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#A7B0C0',
    fontSize: 15,
    lineHeight: 22,
  },
  historyItem: {
    backgroundColor: '#07111F',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  historyMatch: {
    color: '#FFD166',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  xpText: {
    color: '#FFD166',
    fontWeight: 'bold',
    marginTop: 4,
  },
  dateText: {
    color: '#A7B0C0',
    fontSize: 12,
    marginTop: 6,
  },

  tarotCardBox: {
    backgroundColor: '#111C2E',
    borderWidth: 1,
    borderColor: '#3A2B5E',
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
  },
  tarotIntro: {
    color: '#A7B0C0',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 14,
  },
  tarotButton: {
    backgroundColor: '#FFD166',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 14,
  },
  tarotButtonText: {
    color: '#07111F',
    fontSize: 17,
    fontWeight: '900',
  },
  tarotResult: {
    backgroundColor: '#07111F',
    borderWidth: 1,
    borderColor: '#2B3D5E',
    borderRadius: 20,
    padding: 15,
    marginTop: 4,
  },
  tarotName: {
    color: '#FFD166',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
  },
  tarotMeaning: {
    color: 'white',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
  tarotPick: {
    color: '#A7B0C0',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
  },
  tarotDisclaimer: {
    color: '#7F8A9A',
    fontSize: 12,
    marginTop: 10,
    fontStyle: 'italic',
  },
});
