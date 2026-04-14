import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Clipboard,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontSize, spacing, borderRadius } from '../../constants/theme';
import { DraftedReply } from '../../types/activity';
import { MOCK_DRAFTED_REPLIES } from '../../data/mockData';

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

interface ReplyCardProps {
  reply: DraftedReply;
  onCopy: () => void;
  onMarkPosted: () => void;
}

function ReplyCard({ reply, onCopy, onMarkPosted }: ReplyCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handleCopy = () => {
    Clipboard.setString(reply.replyText);
    onCopy();
    Alert.alert('Copied!', 'Reply copied to clipboard. Paste it on Facebook.');
  };

  const handleOpenFacebook = () => {
    Linking.openURL('https://facebook.com');
  };

  const statusColor = reply.status === 'posted' ? colors.success :
                     reply.status === 'copied' ? colors.accent : colors.textTertiary;

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.groupName}>{reply.groupName}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {reply.status === 'posted' ? 'Posted' : reply.status === 'copied' ? 'Copied' : 'Pending'}
              </Text>
            </View>
          </View>
          <Text style={styles.timeAgo}>{formatTimeAgo(reply.createdAt)}</Text>
        </View>

        <Text style={styles.originalPostLabel}>In response to:</Text>
        <Text style={styles.originalPost} numberOfLines={2}>
          "{reply.originalPost}"
        </Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandedSection}>
          <Text style={styles.replyLabel}>Your reply:</Text>
          <View style={styles.replyBox}>
            <Text style={styles.replyText}>{reply.replyText}</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
              <Text style={styles.copyButtonText}>Copy Reply</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.facebookButton} onPress={handleOpenFacebook}>
              <Text style={styles.facebookButtonText}>Open Facebook</Text>
            </TouchableOpacity>
          </View>

          {reply.status !== 'posted' && (
            <TouchableOpacity style={styles.markPostedButton} onPress={onMarkPosted}>
              <Text style={styles.markPostedText}>Mark as Posted</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {!expanded && (
        <TouchableOpacity style={styles.expandButton} onPress={() => setExpanded(true)}>
          <Text style={styles.expandButtonText}>View Reply</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function RepliesScreen() {
  const [replies, setReplies] = useState<DraftedReply[]>(MOCK_DRAFTED_REPLIES);
  const [filter, setFilter] = useState<'all' | 'pending' | 'copied' | 'posted'>('all');

  const filteredReplies = filter === 'all' ? replies : replies.filter(r => r.status === filter);

  const handleCopy = (replyId: string) => {
    setReplies(prev =>
      prev.map(r => (r.id === replyId && r.status === 'pending' ? { ...r, status: 'copied' as const } : r))
    );
  };

  const handleMarkPosted = (replyId: string) => {
    setReplies(prev =>
      prev.map(r => (r.id === replyId ? { ...r, status: 'posted' as const } : r))
    );
    Alert.alert('Nice!', 'Reply marked as posted');
  };

  const pendingCount = replies.filter(r => r.status === 'pending').length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Replies</Text>
        {pendingCount > 0 && (
          <Text style={styles.subtitle}>{pendingCount} ready to post</Text>
        )}
      </View>

      <View style={styles.filters}>
        {(['all', 'pending', 'copied', 'posted'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredReplies}
        renderItem={({ item }) => (
          <ReplyCard
            reply={item}
            onCopy={() => handleCopy(item.id)}
            onMarkPosted={() => handleMarkPosted(item.id)}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No replies yet</Text>
            <Text style={styles.emptySubtext}>
              Barker will draft replies when it finds people who need your service.
            </Text>
          </View>
        }
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
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.hero,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontSize.subhead,
    color: colors.accent,
    marginTop: 4,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
  },
  filterTabActive: {
    backgroundColor: colors.backgroundCard,
  },
  filterText: {
    fontSize: fontSize.footnote,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.textPrimary,
  },
  list: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  groupName: {
    fontSize: fontSize.subhead,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  timeAgo: {
    fontSize: fontSize.footnote,
    color: colors.textTertiary,
  },
  originalPostLabel: {
    fontSize: fontSize.footnote,
    color: colors.textTertiary,
    marginBottom: 4,
  },
  originalPost: {
    fontSize: fontSize.subhead,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  expandedSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
  },
  replyLabel: {
    fontSize: fontSize.footnote,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  replyBox: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  replyText: {
    fontSize: fontSize.subhead,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.md,
  },
  copyButton: {
    flex: 1,
    backgroundColor: colors.accent,
    paddingVertical: 12,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  copyButtonText: {
    fontSize: fontSize.subhead,
    fontWeight: '600',
    color: colors.background,
  },
  facebookButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.separator,
    paddingVertical: 12,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  facebookButtonText: {
    fontSize: fontSize.subhead,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  markPostedButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  markPostedText: {
    fontSize: fontSize.subhead,
    color: colors.success,
    fontWeight: '500',
  },
  expandButton: {
    marginTop: spacing.md,
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
  },
  expandButtonText: {
    fontSize: fontSize.subhead,
    fontWeight: '600',
    color: colors.accent,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.section * 2,
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: fontSize.subhead,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
