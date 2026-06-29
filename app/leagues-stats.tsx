import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const leagues = ['EPL', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'MLS', 'UCL', 'Europa', 'Saudi', 'Liga MX'];

const table = [
  ['1', 'Manchester City', '38', '28', '7', '3', '+62', '91'],
  ['2', 'Arsenal', '38', '26', '6', '6', '+45', '84'],
  ['3', 'Liverpool', '38', '24', '8', '6', '+41', '80'],
  ['4', 'Aston Villa', '38', '20', '8', '10', '+15', '68'],
  ['5', 'Tottenham', '38', '19', '6', '13', '+13', '63'],
  ['6', 'Chelsea', '38', '18', '9', '11', '+14', '63'],
];

const scorers = [
  ['Erling Haaland', 'Manchester City', '27'],
  ['Mohamed Salah', 'Liverpool', '23'],
  ['Bukayo Saka', 'Arsenal', '20'],
  ['Cole Palmer', 'Chelsea', '19'],
];

const assists = [
  ['Kevin De Bruyne', 'Manchester City', '14'],
  ['Martin Ødegaard', 'Arsenal', '12'],
  ['Bruno Fernandes', 'Man United', '11'],
  ['Son Heung-min', 'Tottenham', '10'],
];

const cards = [
  ['William Saliba', 'Arsenal', '9 YC'],
  ['Casemiro', 'Man United', '8 YC'],
  ['Leandro Trossard', 'Arsenal', '1 RC'],
];

const timeline = [
  ["15'", '⚽ Erling Haaland', 'Assist: Kevin De Bruyne', '1-0'],
  ["28'", '🟨 Martin Ødegaard', 'Yellow card', '1-0'],
  ["45+2'", '⚽ Phil Foden', 'Assist: Bernardo Silva', '2-0'],
  ["56'", '⚽ Bukayo Saka', 'Assist: Gabriel Martinelli', '2-1'],
  ["71'", '🟨 William Saliba', 'Yellow card', '2-1'],
  ["82'", '⚽ Erling Haaland', 'Assist: Julián Alvarez', '3-1'],
  ["90+1'", '🟥 Leandro Trossard', 'Red card', '3-1'],
];

export default function LeaguesStatsScreen() {
  const [selectedLeague, setSelectedLeague] = useState('EPL');
  const [tab, setTab] = useState<'table' | 'scorers' | 'assists' | 'cards' | 'match'>('table');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>🏆 Leagues & Stats</Text>
      <Text style={styles.subtitle}>Mock soccer data for testing. Real API can be connected later.</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.leagueScroll}>
        {leagues.map((league) => (
          <Pressable
            key={league}
            style={[styles.leagueChip, selectedLeague === league && styles.leagueChipActive]}
            onPress={() => setSelectedLeague(league)}
          >
            <Text style={[styles.leagueText, selectedLeague === league && styles.leagueTextActive]}>
              {league}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.tabs}>
        <Pressable style={[styles.tab, tab === 'table' && styles.activeTab]} onPress={() => setTab('table')}>
          <Text style={styles.tabText}>Table</Text>
        </Pressable>
        <Pressable style={[styles.tab, tab === 'scorers' && styles.activeTab]} onPress={() => setTab('scorers')}>
          <Text style={styles.tabText}>Scorers</Text>
        </Pressable>
        <Pressable style={[styles.tab, tab === 'assists' && styles.activeTab]} onPress={() => setTab('assists')}>
          <Text style={styles.tabText}>Assists</Text>
        </Pressable>
        <Pressable style={[styles.tab, tab === 'cards' && styles.activeTab]} onPress={() => setTab('cards')}>
          <Text style={styles.tabText}>Cards</Text>
        </Pressable>
        <Pressable style={[styles.tab, tab === 'match' && styles.activeTab]} onPress={() => setTab('match')}>
          <Text style={styles.tabText}>Match</Text>
        </Pressable>
      </View>

      {tab === 'table' && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{selectedLeague} League Table</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.colSmall}>#</Text>
            <Text style={styles.colTeam}>Team</Text>
            <Text style={styles.col}>P</Text>
            <Text style={styles.col}>W</Text>
            <Text style={styles.col}>D</Text>
            <Text style={styles.col}>L</Text>
            <Text style={styles.col}>GD</Text>
            <Text style={styles.col}>Pts</Text>
          </View>
          {table.map((row) => (
            <View key={row.join('-')} style={styles.tableRow}>
              <Text style={styles.colSmall}>{row[0]}</Text>
              <Text style={styles.colTeam}>{row[1]}</Text>
              <Text style={styles.col}>{row[2]}</Text>
              <Text style={styles.col}>{row[3]}</Text>
              <Text style={styles.col}>{row[4]}</Text>
              <Text style={styles.col}>{row[5]}</Text>
              <Text style={styles.col}>{row[6]}</Text>
              <Text style={styles.col}>{row[7]}</Text>
            </View>
          ))}
        </View>
      )}

      {tab === 'scorers' && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>⚽ Top Scorers</Text>
          {scorers.map((item, index) => (
            <View key={item[0]} style={styles.statRow}>
              <Text style={styles.rank}>{index + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.player}>{item[0]}</Text>
                <Text style={styles.team}>{item[1]}</Text>
              </View>
              <Text style={styles.bigStat}>{item[2]}</Text>
            </View>
          ))}
        </View>
      )}

      {tab === 'assists' && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>👟 Top Assists</Text>
          {assists.map((item, index) => (
            <View key={item[0]} style={styles.statRow}>
              <Text style={styles.rank}>{index + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.player}>{item[0]}</Text>
                <Text style={styles.team}>{item[1]}</Text>
              </View>
              <Text style={styles.bigStat}>{item[2]}</Text>
            </View>
          ))}
        </View>
      )}

      {tab === 'cards' && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🟨 Cards</Text>
          {cards.map((item, index) => (
            <View key={item[0]} style={styles.statRow}>
              <Text style={styles.rank}>{index + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.player}>{item[0]}</Text>
                <Text style={styles.team}>{item[1]}</Text>
              </View>
              <Text style={styles.bigStat}>{item[2]}</Text>
            </View>
          ))}
        </View>
      )}

      {tab === 'match' && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Match Details</Text>
          <View style={styles.scoreBox}>
            <Text style={styles.teamName}>Manchester City</Text>
            <Text style={styles.score}>3 - 1</Text>
            <Text style={styles.teamName}>Arsenal</Text>
          </View>
          <Text style={styles.matchMeta}>Premier League • Etihad Stadium</Text>

          <Text style={styles.subSection}>Timeline</Text>
          {timeline.map((item) => (
            <View key={item.join('-')} style={styles.timelineRow}>
              <Text style={styles.minute}>{item[0]}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.event}>{item[1]}</Text>
                <Text style={styles.assist}>{item[2]}</Text>
              </View>
              <Text style={styles.eventScore}>{item[3]}</Text>
            </View>
          ))}

          <Text style={styles.subSection}>Team Stats</Text>
          <View style={styles.statsGrid}>
            <Text style={styles.gridText}>Possession: 61% - 39%</Text>
            <Text style={styles.gridText}>Shots: 17 - 9</Text>
            <Text style={styles.gridText}>Passes: 612 - 401</Text>
            <Text style={styles.gridText}>Corners: 8 - 3</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07111F' },
  content: { padding: 20, paddingTop: 70, paddingBottom: 130 },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#132238',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 18,
  },
  backText: { color: '#FFD166', fontWeight: '900' },
  title: { color: '#FFD166', fontSize: 32, fontWeight: '900' },
  subtitle: { color: '#CBD5E1', fontSize: 15, lineHeight: 22, marginTop: 6, marginBottom: 18 },
  leagueScroll: { marginBottom: 16 },
  leagueChip: {
    backgroundColor: '#0B1729',
    borderWidth: 1,
    borderColor: '#24344F',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 18,
    marginRight: 10,
  },
  leagueChipActive: { borderColor: '#FFD166', backgroundColor: '#132238' },
  leagueText: { color: '#CBD5E1', fontWeight: '900' },
  leagueTextActive: { color: '#FFD166' },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  tab: {
    backgroundColor: '#132238',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  activeTab: { backgroundColor: '#F59E0B' },
  tabText: { color: 'white', fontWeight: '900' },
  card: {
    backgroundColor: '#0B1729',
    borderWidth: 1,
    borderColor: '#24344F',
    borderRadius: 24,
    padding: 16,
    marginBottom: 18,
  },
  sectionTitle: { color: '#FFD166', fontSize: 24, fontWeight: '900', marginBottom: 14 },
  tableHeader: { flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#24344F' },
  tableRow: { flexDirection: 'row', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#132238' },
  colSmall: { color: '#E5E7EB', width: 25, fontWeight: '900' },
  colTeam: { color: '#E5E7EB', flex: 1.7, fontWeight: '800' },
  col: { color: '#E5E7EB', flex: 0.55, textAlign: 'center' },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#07111F',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  rank: { color: '#FFD166', fontSize: 18, fontWeight: '900', width: 34 },
  player: { color: 'white', fontSize: 17, fontWeight: '900' },
  team: { color: '#94A3B8', marginTop: 3 },
  bigStat: { color: '#FFD166', fontSize: 22, fontWeight: '900' },
  scoreBox: {
    backgroundColor: '#07111F',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  teamName: { color: '#E5E7EB', fontSize: 17, fontWeight: '900' },
  score: { color: 'white', fontSize: 42, fontWeight: '900', marginVertical: 8 },
  matchMeta: { color: '#94A3B8', textAlign: 'center', marginBottom: 16 },
  subSection: { color: '#FFD166', fontSize: 20, fontWeight: '900', marginTop: 10, marginBottom: 10 },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#132238',
  },
  minute: { color: '#CBD5E1', width: 55, fontWeight: '900' },
  event: { color: 'white', fontWeight: '900', fontSize: 15 },
  assist: { color: '#94A3B8', marginTop: 2 },
  eventScore: { color: '#FFD166', fontWeight: '900' },
  statsGrid: {
    backgroundColor: '#07111F',
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  gridText: { color: '#E5E7EB', fontSize: 15, fontWeight: '800' },
});
