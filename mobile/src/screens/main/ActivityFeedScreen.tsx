import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { ActivityEvent, ACTIVITY_ICONS, ACTIVITY_COLORS } from '../../types/activity';
import { generateMockActivities, generateNewActivity } from '../../data/mockData';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 5) return 'now';
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

interface ActivityItemProps {
  event: ActivityEvent;
  isNew?: boolean;
}

function ActivityItem({ event, isNew }: ActivityItemProps) {
  const [expanded, setExpanded] = useState(false);
  const slideAnim = useRef(new Animated.Value(isNew ? -100 : 0)).current;
  const fadeAnim = useRef(new Animated.Value(isNew ? 0 : 1)).current;

  useEffect(() => {
    if (isNew) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isNew, slideAnim, fadeAnim]);

  const handlePress = () => {
    if (event.expandable && event.details) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setExpanded(!expanded);
    }
  };

  const icon = ACTIVITY_ICONS[event.type];
  const accentColor = ACTIVITY_COLORS[event.type];
  const timeAgo = formatTimeAgo(event.timestamp);
  const isRecent = timeAgo === 'now' || timeAgo.includes('s ago');

  return (
    <Animated.View
      style={[
        styles.itemContainer,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.item}
        onPress={handlePress}
        activeOpacity={event.expandable ? 0.7 : 1}
      >
        {/* Timeline line */}
        <View style={styles.timeline}>
          <View style={[styles.dot, { backgroundColor: accentColor }]} />
          <View style={styles.line} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{icon}</Text>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>{event.title}</Text>
              {event.subtitle && (
                <Text style={styles.subtitle} numberOfLines={expanded ? undefined : 2}>
                  {event.subtitle}
                </Text>
              )}
            </View>
            <View style={styles.timeContainer}>
              <Text style={[styles.time, isRecent && styles.timeRecent]}>
                {timeAgo}
              </Text>
              {isRecent && <View style={[styles.liveDot, { backgroundColor: accentColor }]} />}
            </View>
          </View>

          {/* Expanded details */}
          {expanded && event.details && (
            <View style={styles.details}>
              {Object.entries(event.details).map(([key, value]) => (
                <View key={key} style={styles.detailRow}>
                  <Text style={styles.detailKey}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                  </Text>
                  <Text style={styles.detailValue}>
                    {typeof value === 'number' && key.includes('relevance')
                      ? `${Math.round(value * 100)}%`
                      : String(value)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {event.expandable && (
            <Text style={styles.expandHint}>
              {expanded ? '↑ Collapse' : '↓ Tap for details'}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function ActivityFeedScreen() {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const flatListRef = useRef<FlatList>(null);

  // Load initial activities
  useEffect(() => {
    setActivities(generateMockActivities());
  }, []);

  // Simulate live feed updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newActivity = generateNewActivity();

      setNewIds((prev) => new Set([...prev, newActivity.id]));

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setActivities((prev) => [newActivity, ...prev]);

      // Scroll to top
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });

      // Clear "new" status after animation
      setTimeout(() => {
        setNewIds((prev) => {
          const next = new Set(prev);
          next.delete(newActivity.id);
          return next;
        });
      }, 1000);
    }, 8000); // New event every 8 seconds

    return () => clearInterval(interval);
  }, []);

  const renderItem = ({ item }: { item: ActivityEvent }) => (
    <ActivityItem event={item} isNew={newIds.has(item.id)} />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.headerBar}>
        <View>
          <Text style={styles.headerTitle}>Barker Activity</Text>
          <Text style={styles.headerSubtitle}>Live feed of your agent working</Text>
        </View>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Active</Text>
        </View>
      </View>

      {/* Activity Feed */}
      <FlatList
        ref={flatListRef}
        data={activities}
        renderItem={renderItem}
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
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2ECC71',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2ECC71',
  },
  list: {
    paddingVertical: spacing.md,
  },
  itemContainer: {
    paddingHorizontal: spacing.lg,
  },
  item: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
  },
  timeline: {
    width: 24,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginTop: 4,
  },
  content: {
    flex: 1,
    marginLeft: spacing.sm,
    paddingBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  icon: {
    fontSize: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  time: {
    fontSize: 11,
    color: colors.textMuted,
  },
  timeRecent: {
    color: colors.accent,
    fontWeight: '600',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 4,
  },
  details: {
    marginTop: spacing.sm,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailKey: {
    fontSize: 12,
    color: colors.textMuted,
  },
  detailValue: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },
  expandHint: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
