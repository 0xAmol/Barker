import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontSize, spacing } from '../../constants/theme';
import { ActivityEvent } from '../../types/activity';
import { generateMockActivities, generateNewActivity } from '../../data/mockData';

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return 'now';
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

const EVENT_ICONS: Record<string, string> = {
  group_scanned: '◎',
  demand_found: '◆',
  post_analyzed: '◇',
  reply_drafted: '✎',
  reply_posted: '↗',
  lead_captured: '●',
  sms_sent: '✉',
  agent_started: '▶',
  agent_paused: '❚❚',
  error: '!',
};

interface ActivityItemProps {
  event: ActivityEvent;
  isNew?: boolean;
  isLast?: boolean;
}

function ActivityItem({ event, isNew, isLast }: ActivityItemProps) {
  const fadeAnim = useRef(new Animated.Value(isNew ? 0 : 1)).current;

  useEffect(() => {
    if (isNew) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [isNew, fadeAnim]);

  const icon = EVENT_ICONS[event.type] || '•';
  const timeAgo = formatTimeAgo(event.timestamp);
  const isHighlight = event.type === 'lead_captured' || event.type === 'sms_sent';

  return (
    <Animated.View style={[styles.item, { opacity: fadeAnim }]}>
      <Text style={[styles.icon, isHighlight && styles.iconHighlight]}>{icon}</Text>
      <Text style={styles.text} numberOfLines={1}>
        {event.title}
      </Text>
      <Text style={styles.time}>{timeAgo}</Text>
      {!isLast && <View style={styles.separator} />}
    </Animated.View>
  );
}

export function ActivityFeedScreen() {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setActivities(generateMockActivities());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const newActivity = generateNewActivity();
      setNewIds((prev) => new Set([...prev, newActivity.id]));
      setActivities((prev) => [newActivity, ...prev]);
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });

      setTimeout(() => {
        setNewIds((prev) => {
          const next = new Set(prev);
          next.delete(newActivity.id);
          return next;
        });
      }, 1000);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Live</Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={activities}
        renderItem={({ item, index }) => (
          <ActivityItem
            event={item}
            isNew={newIds.has(item.id)}
            isLast={index === activities.length - 1}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.hero,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  statusText: {
    fontSize: fontSize.footnote,
    color: colors.textSecondary,
  },
  list: {
    paddingHorizontal: spacing.screen,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  icon: {
    fontSize: 14,
    color: colors.textTertiary,
    width: 24,
  },
  iconHighlight: {
    color: colors.accent,
  },
  text: {
    flex: 1,
    fontSize: fontSize.subhead,
    color: colors.textPrimary,
  },
  time: {
    fontSize: fontSize.footnote,
    color: colors.textTertiary,
    marginLeft: spacing.md,
  },
  separator: {
    position: 'absolute',
    bottom: 0,
    left: 24,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
  },
});
