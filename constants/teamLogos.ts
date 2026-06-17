export function getTeamBadge(teamName: string) {
  const name = teamName.toLowerCase();

  if (name.includes('real madrid')) return 'RM';
  if (name.includes('barcelona')) return 'BAR';
  if (name.includes('manchester city')) return 'MCI';
  if (name.includes('manchester united')) return 'MUN';
  if (name.includes('liverpool')) return 'LIV';
  if (name.includes('arsenal')) return 'ARS';
  if (name.includes('chelsea')) return 'CHE';
  if (name.includes('bayern')) return 'BAY';
  if (name.includes('psg')) return 'PSG';
  if (name.includes('usa') || name.includes('united states')) return 'USA';
  if (name.includes('nepal')) return 'NEP';
  if (name.includes('argentina')) return 'ARG';
  if (name.includes('brazil')) return 'BRA';

  return teamName.slice(0, 3).toUpperCase();
}
