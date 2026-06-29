import AsyncStorage from '@react-native-async-storage/async-storage';
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

type PredictionItem = {
  id: string;
  match: string;
  pick: string;
  confidence: number;
  reason: string;
  xp: number;
  createdAt: string;
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
  const [spinResult, setSpinResult] = useState('');
  const [spinning, setSpinning] = useState(false);

  const spinAnim = useRef(new Animated.Value(0)).current;
  const pointerAngleRef = useRef(0);

  const m = selectedMatch;

  useEffect(() => {
    loadHistory();
  }, []);

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

  async function savePrediction() {
    if (!pick) {
      Alert.alert('Choose prediction', 'Please choose a team, draw, or spin the wheel first.');
      return;
    }

    const xp = confidence >= 80 ? 25 : confidence >= 60 ? 15 : 10;

    const newPrediction: PredictionItem = {
      id: Date.now().toString(),
      match: selectedMatch.title,
      pick,
      confidence,
      reason: reason.trim() || 'No reason added.',
      xp,
      createdAt: new Date().toLocaleString(),
    };

    const updated = [newPrediction, ...history].slice(0, 10);
    setHistory(updated);
    await AsyncStorage.setItem('predictionHistory', JSON.stringify(updated));

    setPick('');
    setReason('');
    setConfidence(60);
    setSpinResult('');

    Alert.alert('Prediction Saved', `You earned ${xp} XP for this prediction.`);
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>🔮 Predictions</Text>
      <Text style={styles.subtitle}>
        Choose a match, spin the pro soccer selector, and save your fan prediction.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>⚽ Choose Match</Text>

        {matches.map((match) => (
          <Pressable
            key={match.id}
            style={[
              styles.matchButton,
              selectedMatch.id === match.id && styles.activeMatchButton,
            ]}
            onPress={() => chooseMatch(match)}
          >
            <Text
              style={[
                styles.matchText,
                selectedMatch.id === match.id && styles.activeMatchText,
              ]}
            >
              {match.title}
            </Text>

            <Text
              style={[
                styles.matchSubText,
                selectedMatch.id === match.id && styles.activeMatchText,
              ]}
            >
              {match.date}
            </Text>
          </Pressable>
        ))}
      </View>

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

      <View style={styles.card}>
        <View style={styles.historyHeader}>
          <Text style={styles.cardTitle}>🏆 Prediction History</Text>

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
          history.map((item) => (
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
});
