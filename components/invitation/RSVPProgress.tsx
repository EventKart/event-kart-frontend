import { Text, View } from 'react-native';

import type { InvitationStats } from '@/types';

interface RSVPProgressProps {
  stats: InvitationStats;
}

export function RSVPProgress({ stats }: RSVPProgressProps) {
  const { totalSent, totalYes, totalNo, totalMaybe, totalNotRsvped } = stats;
  const denom = Math.max(totalSent, 1);
  const yesPct = (totalYes / denom) * 100;
  const noPct = (totalNo / denom) * 100;
  const maybePct = (totalMaybe / denom) * 100;
  const pendingPct = (totalNotRsvped / denom) * 100;

  return (
    <View className="gap-4">
      <View className="flex-row gap-3">
        <Stat label="Accepted" value={totalYes} tone="navy" />
        <Stat label="Pending" value={totalNotRsvped} tone="neutral" />
        <Stat label="Declined" value={totalNo} tone="error" />
      </View>

      <View>
        <View className="flex-row h-2 rounded-full overflow-hidden bg-surface-container-high">
          <View style={{ width: `${yesPct}%` }} className="bg-primary-container" />
          <View style={{ width: `${maybePct}%` }} className="bg-tertiary-container" />
          <View style={{ width: `${pendingPct}%` }} className="bg-surface-container-highest" />
          <View style={{ width: `${noPct}%` }} className="bg-error" />
        </View>
        <Text className="font-sans text-label-md text-surface-on-variant mt-2">
          {totalYes + totalMaybe} of {totalSent} guests confirmed
        </Text>
      </View>
    </View>
  );
}

interface StatProps {
  label: string;
  value: number;
  tone: 'navy' | 'neutral' | 'error';
}

function Stat({ label, value, tone }: StatProps) {
  const palette: Record<StatProps['tone'], { bg: string; text: string }> = {
    navy: { bg: 'bg-primary-container', text: 'text-primary-on' },
    neutral: { bg: 'bg-surface-container-high', text: 'text-surface-on' },
    error: { bg: 'bg-error-container', text: 'text-error-on-container' },
  };
  return (
    <View className={`flex-1 ${palette[tone].bg} rounded-xl p-4`}>
      <Text className={`font-serif-bold text-h2 ${palette[tone].text}`}>{value}</Text>
      <Text className={`font-sans-md text-label-md uppercase tracking-wider ${palette[tone].text}/80`}>
        {label}
      </Text>
    </View>
  );
}
