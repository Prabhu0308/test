import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const matches = [
  {
    id: 'usa-mexico',
    title: 'USA vs Mexico',
    teamA: 'USA',
    teamB: 'Mexico',
    possessionA: '54%',
    possessionB: '46%',
    shotsA: 12,
    shotsB: 9,
    targetA: 6,
    targetB: 4,
    cornersA: 5,
    cornersB: 3,
    passingA: '89%',
    passingB: '84%',
    foulsA: 11,
    foulsB: 14,
    yellowA: 1,
    yellowB: 2,
    topPlayer: 'Christian Pulisic',
    topPlayerStats: ['Goals: 1', 'Assists: 1', 'Shots: 4', 'Key Passes: 3', 'Rating: 8.7'],
    formA: 'W W D W L',
    formB: 'W D L W W',
    recordA: '8W - 2D - 1L',
    recordB: '6W - 3D - 2L',
    goalsA: 24,
    goalsB: 19,
    cleanSheetsA: 5,
    cleanSheetsB: 4,
    bestRun: 'USA unbeaten in 6 games',
    recentResults: [
      'USA 3 - 1 Canada',
      'USA 2 - 0 Jamaica',
      'USA 1 - 1 Panama',
      'USA 4 - 2 Costa Rica',
      'USA 0 - 1 Colombia',
    ],
    scorers: ['Christian Pulisic — 6 goals', 'Ricardo Pepi — 4 goals', 'Santiago Gimenez — 4 goals'],
    assists: ['Gio Reyna — 5 assists', 'Tim Weah — 4 assists', 'Hirving Lozano — 3 assists'],
    prediction: 'USA 56%',
    draw: '24%',
    opponentChance: 'Mexico 20%',
    momentum: 'USA slightly ahead',
    tacticalEdge: 'USA is stronger in midfield pressure and quick wing attacks.',
    fanTake: 'Fans should watch the first 20 minutes. If USA scores early, Mexico may struggle to control tempo.',
    table: [
      { team: 'USA', pos: '1st', pts: 12, gd: '+8' },
      { team: 'Mexico', pos: '2nd', pts: 10, gd: '+5' },
      { team: 'Canada', pos: '3rd', pts: 7, gd: '+1' },
      { team: 'Jamaica', pos: '4th', pts: 3, gd: '-6' },
    ],
    playerCompare: {
      playerA: 'Christian Pulisic',
      playerB: 'Santiago Gimenez',
      goalsA: 6,
      goalsB: 4,
      assistsA: 5,
      assistsB: 2,
      shotsA: 18,
      shotsB: 15,
      ratingA: 8.7,
      ratingB: 8.1,
    },
    playerForm: {
      player: 'Christian Pulisic',
      lastFive: 'Strong Form',
      goals: 4,
      assists: 2,
      rating: 8.4,
    },
  },
  {
    id: 'arg-brazil',
    title: 'Argentina vs Brazil',
    teamA: 'Argentina',
    teamB: 'Brazil',
    possessionA: '49%',
    possessionB: '51%',
    shotsA: 10,
    shotsB: 13,
    targetA: 5,
    targetB: 7,
    cornersA: 4,
    cornersB: 6,
    passingA: '87%',
    passingB: '90%',
    foulsA: 13,
    foulsB: 12,
    yellowA: 2,
    yellowB: 1,
    topPlayer: 'Lionel Messi',
    topPlayerStats: ['Goals: 1', 'Assists: 0', 'Shots: 3', 'Key Passes: 4', 'Rating: 8.5'],
    formA: 'W W W D L',
    formB: 'W D W W L',
    recordA: '9W - 1D - 1L',
    recordB: '8W - 2D - 1L',
    goalsA: 26,
    goalsB: 28,
    cleanSheetsA: 6,
    cleanSheetsB: 5,
    bestRun: 'Brazil unbeaten in 7 games',
    recentResults: [
      'Argentina 2 - 0 Chile',
      'Argentina 3 - 1 Peru',
      'Argentina 1 - 1 Uruguay',
      'Brazil 2 - 1 Colombia',
      'Brazil 3 - 0 Paraguay',
    ],
    scorers: ['Lionel Messi — 7 goals', 'Lautaro Martinez — 5 goals', 'Vinicius Jr — 5 goals'],
    assists: ['Rodrigo De Paul — 4 assists', 'Neymar Jr — 4 assists', 'Raphinha — 3 assists'],
    prediction: 'Brazil 52%',
    draw: '26%',
    opponentChance: 'Argentina 22%',
    momentum: 'Brazil pressing high',
    tacticalEdge: 'Brazil has more speed wide, while Argentina has more control through central play.',
    fanTake: 'This is a star-power match. One magic moment could decide everything.',
    table: [
      { team: 'Brazil', pos: '1st', pts: 13, gd: '+9' },
      { team: 'Argentina', pos: '2nd', pts: 12, gd: '+7' },
      { team: 'Uruguay', pos: '3rd', pts: 9, gd: '+3' },
      { team: 'Colombia', pos: '4th', pts: 7, gd: '0' },
    ],
    playerCompare: {
      playerA: 'Lionel Messi',
      playerB: 'Vinicius Jr',
      goalsA: 7,
      goalsB: 5,
      assistsA: 4,
      assistsB: 3,
      shotsA: 20,
      shotsB: 22,
      ratingA: 8.5,
      ratingB: 8.4,
    },
    playerForm: {
      player: 'Lionel Messi',
      lastFive: 'Creative Form',
      goals: 3,
      assists: 4,
      rating: 8.6,
    },
  },
  {
    id: 'eng-france',
    title: 'England vs France',
    teamA: 'England',
    teamB: 'France',
    possessionA: '50%',
    possessionB: '50%',
    shotsA: 11,
    shotsB: 11,
    targetA: 5,
    targetB: 6,
    cornersA: 5,
    cornersB: 5,
    passingA: '88%',
    passingB: '89%',
    foulsA: 10,
    foulsB: 9,
    yellowA: 1,
    yellowB: 1,
    topPlayer: 'Kylian Mbappe',
    topPlayerStats: ['Goals: 1', 'Assists: 1', 'Shots: 5', 'Key Passes: 2', 'Rating: 8.9'],
    formA: 'W D W W D',
    formB: 'W W L W W',
    recordA: '7W - 3D - 1L',
    recordB: '9W - 1D - 1L',
    goalsA: 22,
    goalsB: 30,
    cleanSheetsA: 5,
    cleanSheetsB: 6,
    bestRun: 'France won 5 straight games',
    recentResults: [
      'England 2 - 0 Scotland',
      'England 1 - 1 Germany',
      'England 3 - 1 Wales',
      'France 4 - 1 Belgium',
      'France 2 - 0 Netherlands',
    ],
    scorers: ['Harry Kane — 6 goals', 'Kylian Mbappe — 6 goals', 'Bukayo Saka — 4 goals'],
    assists: ['Antoine Griezmann — 5 assists', 'Jude Bellingham — 4 assists', 'Phil Foden — 3 assists'],
    prediction: 'France 51%',
    draw: '27%',
    opponentChance: 'England 22%',
    momentum: 'Very close match',
    tacticalEdge: 'France has transition speed, England has midfield balance and set-piece danger.',
    fanTake: 'This feels like a final-level match. The winner may come from a mistake or counterattack.',
    table: [
      { team: 'France', pos: '1st', pts: 14, gd: '+10' },
      { team: 'England', pos: '2nd', pts: 12, gd: '+6' },
      { team: 'Germany', pos: '3rd', pts: 8, gd: '+2' },
      { team: 'Netherlands', pos: '4th', pts: 7, gd: '+1' },
    ],
    playerCompare: {
      playerA: 'Harry Kane',
      playerB: 'Kylian Mbappe',
      goalsA: 6,
      goalsB: 6,
      assistsA: 2,
      assistsB: 5,
      shotsA: 17,
      shotsB: 24,
      ratingA: 8.2,
      ratingB: 8.9,
    },
    playerForm: {
      player: 'Kylian Mbappe',
      lastFive: 'Explosive Form',
      goals: 5,
      assists: 3,
      rating: 8.9,
    },
  },
];

export default function StatsCenterScreen() {
  const [selectedMatch, setSelectedMatch] = useState(matches[0]);
  const m = selectedMatch;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>📊 Stats Center</Text>
      <Text style={styles.subtitle}>
        Match stats, team form, player numbers, records, tables, and prediction helper.
      </Text>

      <View style={styles.selector}>
        {matches.map((match) => (
          <Pressable
            key={match.id}
            style={[
              styles.matchButton,
              selectedMatch.id === match.id && styles.activeMatchButton,
            ]}
            onPress={() => setSelectedMatch(match)}
          >
            <Text
              style={[
                styles.matchButtonText,
                selectedMatch.id === match.id && styles.activeMatchButtonText,
              ]}
            >
              {match.title}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>⚡ Quick Insight</Text>
        <Text style={styles.line}>Featured Match: {m.title}</Text>
        <Text style={styles.line}>Key Player: {m.topPlayer}</Text>
        <Text style={styles.line}>Prediction Edge: {m.prediction}</Text>
        <Text style={styles.line}>Momentum: {m.momentum}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🏆 Table Snapshot</Text>
        {m.table.map((row) => (
          <View key={row.team} style={styles.tableRow}>
            <Text style={styles.tableTeam}>{row.pos} {row.team}</Text>
            <Text style={styles.tableText}>{row.pts} pts</Text>
            <Text style={styles.tableText}>GD {row.gd}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Player Comparison</Text>

        <View style={styles.statRow}>
          <Text style={styles.left}>{m.playerCompare.playerA}</Text>
          <Text style={styles.middle}>Player</Text>
          <Text style={styles.right}>{m.playerCompare.playerB}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.left}>{m.playerCompare.goalsA}</Text>
          <Text style={styles.middle}>Goals</Text>
          <Text style={styles.right}>{m.playerCompare.goalsB}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.left}>{m.playerCompare.assistsA}</Text>
          <Text style={styles.middle}>Assists</Text>
          <Text style={styles.right}>{m.playerCompare.assistsB}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.left}>{m.playerCompare.shotsA}</Text>
          <Text style={styles.middle}>Shots</Text>
          <Text style={styles.right}>{m.playerCompare.shotsB}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.left}>{m.playerCompare.ratingA}</Text>
          <Text style={styles.middle}>Rating</Text>
          <Text style={styles.right}>{m.playerCompare.ratingB}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>⭐ Player Form</Text>
        <Text style={styles.playerName}>{m.playerForm.player}</Text>
        <Text style={styles.line}>Last 5 Games: {m.playerForm.lastFive}</Text>
        <Text style={styles.line}>Goals in Last 5: {m.playerForm.goals}</Text>
        <Text style={styles.line}>Assists in Last 5: {m.playerForm.assists}</Text>
        <Text style={styles.line}>Average Rating: {m.playerForm.rating}</Text>
        <Text style={styles.note}>
          This player is one of the biggest impact makers for {m.teamA}.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔥 Match Stats</Text>
        <Text style={styles.match}>{m.title}</Text>

        <View style={styles.statRow}>
          <Text style={styles.left}>{m.possessionA}</Text>
          <Text style={styles.middle}>Possession</Text>
          <Text style={styles.right}>{m.possessionB}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.left}>{m.shotsA}</Text>
          <Text style={styles.middle}>Shots</Text>
          <Text style={styles.right}>{m.shotsB}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.left}>{m.targetA}</Text>
          <Text style={styles.middle}>Shots on Target</Text>
          <Text style={styles.right}>{m.targetB}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.left}>{m.cornersA}</Text>
          <Text style={styles.middle}>Corners</Text>
          <Text style={styles.right}>{m.cornersB}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.left}>{m.passingA}</Text>
          <Text style={styles.middle}>Pass Accuracy</Text>
          <Text style={styles.right}>{m.passingB}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.left}>{m.foulsA}</Text>
          <Text style={styles.middle}>Fouls</Text>
          <Text style={styles.right}>{m.foulsB}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.left}>{m.yellowA}</Text>
          <Text style={styles.middle}>Yellow Cards</Text>
          <Text style={styles.right}>{m.yellowB}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>⭐ Top Player</Text>
        <Text style={styles.playerName}>{m.topPlayer}</Text>
        {m.topPlayerStats.map((item) => (
          <Text key={item} style={styles.line}>{item}</Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📈 Team Form</Text>
        <Text style={styles.line}>{m.teamA}: {m.formA}</Text>
        <Text style={styles.line}>{m.teamB}: {m.formB}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📚 Team Records</Text>
        <Text style={styles.line}>{m.teamA} Record: {m.recordA}</Text>
        <Text style={styles.line}>{m.teamB} Record: {m.recordB}</Text>
        <Text style={styles.line}>{m.teamA} Goals Scored: {m.goalsA}</Text>
        <Text style={styles.line}>{m.teamB} Goals Scored: {m.goalsB}</Text>
        <Text style={styles.line}>{m.teamA} Clean Sheets: {m.cleanSheetsA}</Text>
        <Text style={styles.line}>{m.teamB} Clean Sheets: {m.cleanSheetsB}</Text>
        <Text style={styles.line}>Best Run: {m.bestRun}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🕒 Last 5 Match Results</Text>
        {m.recentResults.map((result) => (
          <Text key={result} style={styles.line}>• {result}</Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🥅 Top Scorers</Text>
        {m.scorers.map((item, index) => (
          <Text key={item} style={styles.line}>{index + 1}. {item}</Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎯 Top Assists</Text>
        {m.assists.map((item, index) => (
          <Text key={item} style={styles.line}>{index + 1}. {item}</Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🧠 Tactical Edge</Text>
        <Text style={styles.line}>{m.tacticalEdge}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🗣 Fan Take</Text>
        <Text style={styles.line}>{m.fanTake}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🧠 Prediction Helper</Text>
        <Text style={styles.bigStat}>{m.prediction}</Text>
        <Text style={styles.line}>Draw chance: {m.draw}</Text>
        <Text style={styles.line}>{m.opponentChance}</Text>
        <Text style={styles.note}>Momentum: {m.momentum}</Text>
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  back: {
    color: '#FFD166',
    fontWeight: 'bold',
    marginBottom: 18,
  },
  title: {
    color: 'white',
    fontSize: 34,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#A7B0C0',
    fontSize: 15,
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 22,
  },
  selector: {
    marginBottom: 16,
  },
  matchButton: {
    backgroundColor: '#111C2E',
    padding: 13,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#22314A',
  },
  activeMatchButton: {
    backgroundColor: '#FFD166',
    borderColor: '#FFD166',
  },
  matchButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  activeMatchButtonText: {
    color: '#07111F',
  },
  card: {
    backgroundColor: '#111C2E',
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
  match: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#22314A',
  },
  left: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    width: 85,
    textAlign: 'center',
  },
  middle: {
    color: '#A7B0C0',
    fontSize: 14,
    flex: 1,
    textAlign: 'center',
  },
  right: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    width: 85,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#22314A',
  },
  tableTeam: {
    color: 'white',
    fontWeight: 'bold',
    flex: 1,
  },
  tableText: {
    color: '#FFD166',
    fontWeight: 'bold',
    width: 70,
    textAlign: 'right',
  },
  playerName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  line: {
    color: 'white',
    fontSize: 16,
    marginBottom: 9,
    lineHeight: 22,
  },
  bigStat: {
    color: '#FFD166',
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  note: {
    color: '#A7B0C0',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
});
