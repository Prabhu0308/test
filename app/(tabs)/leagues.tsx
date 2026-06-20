import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const leagues: any = {
  premier: {
    name: 'Premier League',
    country: 'England',
    teams: [
      ['Liverpool', 82],
      ['Arsenal', 79],
      ['Manchester City', 74],
      ['Chelsea', 68],
      ['Newcastle United', 66],
      ['Manchester United', 61],
    ],
    scorers: [
      ['Erling Haaland', 'Manchester City', 28],
      ['Mohamed Salah', 'Liverpool', 24],
      ['Cole Palmer', 'Chelsea', 22],
      ['Alexander Isak', 'Newcastle United', 21],
      ['Bukayo Saka', 'Arsenal', 18],
    ],
    assists: [
      ['Kevin De Bruyne', 'Manchester City', 16],
      ['Bukayo Saka', 'Arsenal', 14],
      ['Mohamed Salah', 'Liverpool', 13],
      ['Cole Palmer', 'Chelsea', 12],
      ['Bruno Fernandes', 'Manchester United', 11],
    ],
  },
  laliga: {
    name: 'La Liga',
    country: 'Spain',
    teams: [
      ['Barcelona', 84],
      ['Real Madrid', 81],
      ['Atletico Madrid', 70],
      ['Athletic Club', 66],
      ['Villarreal', 61],
      ['Real Betis', 58],
    ],
    scorers: [
      ['Kylian Mbappé', 'Real Madrid', 26],
      ['Robert Lewandowski', 'Barcelona', 23],
      ['Vinícius Jr.', 'Real Madrid', 19],
      ['Antoine Griezmann', 'Atletico Madrid', 17],
      ['Raphinha', 'Barcelona', 16],
    ],
    assists: [
      ['Lamine Yamal', 'Barcelona', 15],
      ['Jude Bellingham', 'Real Madrid', 12],
      ['Vinícius Jr.', 'Real Madrid', 11],
      ['Raphinha', 'Barcelona', 10],
      ['Antoine Griezmann', 'Atletico Madrid', 9],
    ],
  },
  bundesliga: {
    name: 'Bundesliga',
    country: 'Germany',
    teams: [
      ['Bayern Munich', 78],
      ['Bayer Leverkusen', 72],
      ['Borussia Dortmund', 65],
      ['RB Leipzig', 62],
      ['Eintracht Frankfurt', 59],
      ['Stuttgart', 55],
    ],
    scorers: [
      ['Harry Kane', 'Bayern Munich', 29],
      ['Serhou Guirassy', 'Borussia Dortmund', 21],
      ['Florian Wirtz', 'Bayer Leverkusen', 14],
      ['Jamal Musiala', 'Bayern Munich', 13],
      ['Loïs Openda', 'RB Leipzig', 13],
    ],
    assists: [
      ['Florian Wirtz', 'Bayer Leverkusen', 14],
      ['Jamal Musiala', 'Bayern Munich', 12],
      ['Joshua Kimmich', 'Bayern Munich', 10],
      ['Julian Brandt', 'Borussia Dortmund', 9],
      ['Xavi Simons', 'RB Leipzig', 9],
    ],
  },
  mls: {
    name: 'MLS',
    country: 'USA / Canada',
    teams: [
      ['Inter Miami', 37],
      ['LAFC', 34],
      ['Columbus Crew', 32],
      ['FC Cincinnati', 31],
      ['Seattle Sounders', 29],
      ['Austin FC', 27],
    ],
    scorers: [
      ['Lionel Messi', 'Inter Miami', 18],
      ['Denis Bouanga', 'LAFC', 16],
      ['Cucho Hernández', 'Columbus Crew', 15],
      ['Luciano Acosta', 'FC Cincinnati', 13],
      ['Sebastián Driussi', 'Austin FC', 12],
    ],
    assists: [
      ['Lionel Messi', 'Inter Miami', 15],
      ['Luciano Acosta', 'FC Cincinnati', 13],
      ['Riqui Puig', 'LA Galaxy', 11],
      ['Thiago Almada', 'Atlanta United', 10],
      ['Diego Fagundez', 'Austin FC', 9],
    ],
  },
};

export default function LeaguesScreen() {
  const [selected, setSelected] = useState('premier');
  const league = leagues[selected];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🏆 League Tables</Text>
      <Text style={styles.subtitle}>Standings, points, and top competitions</Text>

      <View style={styles.tabs}>
        {Object.keys(leagues).map((key) => (
          <Pressable
            key={key}
            style={[styles.tab, selected === key && styles.activeTab]}
            onPress={() => setSelected(key)}
          >
            <Text style={[styles.tabText, selected === key && styles.activeTabText]}>
              {leagues[key].name}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.league}>{league.name}</Text>
        <Text style={styles.country}>{league.country}</Text>

        <View style={styles.headerRow}>
          <Text style={styles.headerRank}>#</Text>
          <Text style={styles.headerTeam}>Team</Text>
          <Text style={styles.headerPts}>Pts</Text>
        </View>

        {league.teams.map((team: any, index: number) => (
          <View key={team[0]} style={styles.row}>
            <Text style={styles.rank}>{index + 1}</Text>
            <Text style={styles.team}>{team[0]}</Text>
            <Text style={styles.points}>{team[1]}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.league}>⚽ Top Scorers</Text>
        <Text style={styles.country}>{league.name}</Text>

        {league.scorers.map((player: any, index: number) => (
          <View key={player[0]} style={styles.row}>
            <Text style={styles.rank}>{index + 1}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.team}>{player[0]}</Text>
              <Text style={styles.playerClub}>{player[1]}</Text>
            </View>
            <Text style={styles.points}>{player[2]}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.league}>🎯 Top Assists</Text>
        <Text style={styles.country}>{league.name}</Text>

        {league.assists.map((player: any, index: number) => (
          <View key={player[0]} style={styles.row}>
            <Text style={styles.rank}>{index + 1}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.team}>{player[0]}</Text>
              <Text style={styles.playerClub}>{player[1]}</Text>
            </View>
            <Text style={styles.points}>{player[2]}</Text>
          </View>
        ))}
      </View>


    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07111F', padding: 20, paddingTop: 60 },
  title: { color: 'white', fontSize: 34, fontWeight: 'bold', marginBottom: 6 },
  subtitle: { color: '#A7B0C0', fontSize: 16, marginBottom: 20 },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  tab: {
    backgroundColor: '#111C2E',
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#22314A',
  },
  activeTab: { backgroundColor: '#FFD166', borderColor: '#FFD166' },
  tabText: { color: 'white', fontWeight: 'bold' },
  activeTabText: { color: '#07111F' },
  card: { backgroundColor: '#111C2E', padding: 18, borderRadius: 18, marginBottom: 18 },
  league: { color: '#FFD166', fontSize: 24, fontWeight: 'bold' },
  country: { color: '#8FA3B8', marginTop: 4, marginBottom: 16 },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#123C69',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  headerRank: { color: '#FFD166', width: 35, fontWeight: 'bold' },
  headerTeam: { color: '#FFD166', flex: 1, fontWeight: 'bold' },
  headerPts: { color: '#FFD166', width: 50, textAlign: 'right', fontWeight: 'bold' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomColor: '#22314A',
    borderBottomWidth: 1,
  },
  rank: { color: '#8FA3B8', width: 35, fontSize: 16 },
  team: { color: 'white', flex: 1, fontSize: 17, fontWeight: '600' },
  points: { color: '#FFD166', width: 50, textAlign: 'right', fontSize: 16, fontWeight: 'bold' },
  playerClub: { color: '#8FA3B8', fontSize: 13, marginTop: 3 },
  note: { color: '#8FA3B8', fontSize: 14, lineHeight: 21, marginBottom: 40 },
});
