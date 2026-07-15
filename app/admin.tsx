import FanVideoPlayer from '../components/FanVideoPlayer';
import { router } from 'expo-router';
import { getAuth } from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { db } from '../firebase/config';

const ADMIN_EMAIL = 'prabhudevupadhyay@gmail.com';

type FanPost = {
  id: string;
  docId?: string;
  text?: string;
  displayName?: string;
  userEmail?: string;
  userId?: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt?: number;
  moderationStatus?: string;
  heldAt?: number;
  heldReason?: string;
};

type ReportItem = {
  id: string;
  postId?: string;
  reason?: string;
  reporterEmail?: string;
  reporterId?: string;
  reportedBy?: string;
  createdAt?: number;
  status?: string;
  postText?: string;
  postImageUrl?: string;
  postVideoUrl?: string;
  postOwnerEmail?: string;
  dismissedAt?: unknown;
  resolution?: string;
};

function formatDate(value?: unknown) {
  if (!value) return 'Unknown time';

  let date: Date;

  if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'number' || typeof value === 'string') {
    date = new Date(value);
  } else if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate?: unknown }).toDate === 'function'
  ) {
    date = (value as { toDate: () => Date }).toDate();
  } else {
    return 'Unknown time';
  }

  return Number.isNaN(date.getTime()) ? 'Unknown time' : date.toLocaleString();
}

function getMediaType(post?: Partial<FanPost>, report?: Partial<ReportItem>) {
  const imageUrl = report?.postImageUrl || post?.imageUrl;
  const videoUrl = report?.postVideoUrl || post?.videoUrl;

  if (videoUrl) return '🎥 Video Post';
  if (imageUrl) return '📷 Photo Post';
  return '📝 Text Post';
}

export default function AdminPanel() {
  const currentUser = getAuth().currentUser;

  if (currentUser?.email !== ADMIN_EMAIL) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Not authorized</Text>
        <Pressable style={styles.backButton} onPress={() => router.replace('/' as any)}>
          <Text style={styles.backText}>Go Home</Text>
        </Pressable>
      </View>
    );
  }

  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<FanPost[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [showResolvedReports, setShowResolvedReports] = useState(false);
  const [reportSearch, setReportSearch] = useState('');

  useEffect(() => {
    const postsQuery = query(collection(db, 'fanWall'), orderBy('createdAt', 'desc'));
    const reportsQuery = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));

    const unsubPosts = onSnapshot(
      postsQuery,
      (snapshot) => {
        setPosts(
          snapshot.docs.map((d) => {
            const data = d.data() as Omit<FanPost, 'id'> & { id?: string };

            return {
              ...data,
              id: data.id || d.id,
              docId: d.id,
            };
          })
        );
        setLoading(false);
      },
      () => setLoading(false)
    );

    const unsubReports = onSnapshot(reportsQuery, (snapshot) => {
      setReports(
        snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ReportItem, 'id'>),
        }))
      );
    });

    return () => {
      unsubPosts();
      unsubReports();
    };
  }, []);

  const activeReports = useMemo(
    () => reports.filter((r) => r.status !== 'dismissed'),
    [reports]
  );

  const resolvedReports = useMemo(
    () => reports.filter((r) => r.status === 'dismissed'),
    [reports]
  );

  const heldPosts = useMemo(
    () => posts.filter((p) => p.moderationStatus === 'under_investigation'),
    [posts]
  );

  const filteredActiveReports = useMemo(() => {
    const search = normalizeText(reportSearch);

    if (!search) return activeReports;

    return activeReports.filter((report) => {
      const post = findPost(report);

      return [
        report.reason,
        report.postText,
        report.postOwnerEmail,
        report.reporterEmail,
        report.reportedBy,
        report.reporterId,
        post?.text,
        post?.userEmail,
        post?.displayName,
      ].some((value) => normalizeText(value).includes(search));
    });
  }, [activeReports, posts, reportSearch]);

  const filteredResolvedReports = useMemo(() => {
    const search = normalizeText(reportSearch);

    if (!search) return resolvedReports;

    return resolvedReports.filter((report) => {
      return [
        report.reason,
        report.postText,
        report.postOwnerEmail,
        report.reporterEmail,
        report.reportedBy,
        report.reporterId,
        report.resolution,
      ].some((value) => normalizeText(value).includes(search));
    });
  }, [resolvedReports, reportSearch]);

  function normalizeText(value?: string) {
    return String(value || '').trim().toLowerCase();
  }

  function findPost(report: ReportItem) {
    const reportText = normalizeText(report.postText);
    const reportOwner = normalizeText(report.postOwnerEmail);

    return posts.find((p) =>
      p.id === report.postId ||
      p.docId === report.postId ||
      (
        reportText &&
        normalizeText(p.text) === reportText &&
        (
          !reportOwner ||
          normalizeText(p.userEmail) === reportOwner ||
          normalizeText(p.displayName) === reportOwner
        )
      )
    );
  }

  function resolvePostDocId(postId?: string, report?: ReportItem) {
    if (report) {
      const matchedFromReport = findPost(report);
      if (matchedFromReport?.docId) return matchedFromReport.docId;
    }

    if (!postId) return '';

    const matchedPost = posts.find((p) =>
      p.id === postId ||
      p.docId === postId
    );

    return matchedPost?.docId || '';
  }

  function resolvePostOwnerEmail(postId?: string, report?: ReportItem) {
    if (report?.postOwnerEmail) return report.postOwnerEmail;

    if (report) {
      const matchedFromReport = findPost(report);
      if (matchedFromReport?.userEmail) {
        return matchedFromReport.userEmail;
      }
    }

    const matchedPost = posts.find(
      (post) => post.id === postId || post.docId === postId
    );

    return matchedPost?.userEmail || '';
  }

  async function createAdminNotification(
    targetEmail: string,
    title: string,
    message: string,
    type: string,
    postId?: string
  ) {
    const cleanTargetEmail = targetEmail.trim().toLowerCase();
    const cleanFromEmail = (currentUser?.email || ADMIN_EMAIL).trim().toLowerCase();

    if (!cleanTargetEmail) return;

    try {
      await addDoc(collection(db, 'appNotifications'), {
        targetEmail: cleanTargetEmail,
        fromEmail: cleanFromEmail,
        fromUser: 'Soccer Daily Admin',
        title,
        message,
        body: message,
        type,
        postId: postId || '',
        screen: 'fan-wall',
        read: false,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.log('Admin notification failed:', error);
    }
  }

  async function holdPost(postId?: string, report?: ReportItem) {
    const realPostDocId = resolvePostDocId(postId, report);

    if (!realPostDocId) {
      Alert.alert('Missing post', 'This report cannot be matched to a live Fan Wall post. It may already be deleted or it may be an older report.');
      return;
    }

    try {
      await updateDoc(doc(db, 'fanWall', realPostDocId), {
        moderationStatus: 'under_investigation',
        status: 'held',
        hidden: true,
        held: true,
        heldAt: Date.now(),
        heldReason: 'Admin review',
      });
      await createAdminNotification(
        resolvePostOwnerEmail(postId, report),
        '⏸️ Post under review',
        'Your Fan Zone post was temporarily hidden while it is reviewed by the Soccer Daily moderation team.',
        'moderation_hold',
        realPostDocId
      );

      Alert.alert('Held', 'Post is hidden from Fan Wall and under investigation.');
    } catch (error) {
      console.log('Hold post failed:', error);
      Alert.alert('Error', 'Could not hold this post. Check terminal for details.');
    }
  }

  async function releasePost(postId?: string, report?: ReportItem) {
    const realPostDocId = resolvePostDocId(postId, report);

    if (!realPostDocId) return;

    try {
      await updateDoc(doc(db, 'fanWall', realPostDocId), {
        moderationStatus: 'active',
        status: 'active',
        hidden: false,
        held: false,
        heldAt: null,
        heldReason: null,
      });
      await createAdminNotification(
        resolvePostOwnerEmail(postId, report),
        '✅ Post restored',
        'Your Fan Zone post was reviewed and is now visible again.',
        'moderation_release',
        realPostDocId
      );

      Alert.alert('Released', 'Post is visible again.');
    } catch {
      Alert.alert('Error', 'Could not release this post.');
    }
  }

  async function deletePost(postId?: string, report?: ReportItem) {
    const realPostDocId = resolvePostDocId(postId, report);
    const postOwnerEmail = resolvePostOwnerEmail(postId, report);

    const browserAlert = (
      globalThis as typeof globalThis & {
        alert?: (message: string) => void;
      }
    ).alert;

    const browserConfirm = (
      globalThis as typeof globalThis & {
        confirm?: (message: string) => boolean;
      }
    ).confirm;

    const showMessage = (title: string, message: string) => {
      if (typeof browserAlert === 'function') {
        browserAlert(`${title}\n\n${message}`);
      } else {
        Alert.alert(title, message);
      }
    };

    if (!realPostDocId) {
      showMessage('Missing post', 'This post cannot be found.');
      return;
    }

    const performDelete = async () => {
      try {
        await deleteDoc(doc(db, 'fanWall', realPostDocId));

        if (report?.id) {
          try {
            await updateDoc(doc(db, 'reports', report.id), {
              status: 'dismissed',
              dismissedAt: Date.now(),
              resolution: 'post_deleted',
            });
          } catch {
            // The post was deleted successfully even if report cleanup fails.
          }
        }

        await createAdminNotification(
          postOwnerEmail,
          '🗑️ Post removed',
          'Your Fan Zone post was removed after a moderation review.',
          'moderation_delete',
          realPostDocId
        );

        showMessage('Deleted', 'The post and its active report were removed.');
      } catch {
        showMessage('Error', 'Could not delete this post.');
      }
    };

    if (typeof browserConfirm === 'function') {
      const confirmed = browserConfirm(
        'Delete this post permanently? This action cannot be undone.'
      );

      if (confirmed) {
        await performDelete();
      }

      return;
    }

    Alert.alert('Delete Post?', 'This will permanently remove the post.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void performDelete();
        },
      },
    ]);
  }

  async function dismissReport(reportId: string) {
    try {
      await updateDoc(doc(db, 'reports', reportId), {
        status: 'dismissed',
        dismissedAt: Date.now(),
      });
    } catch {
      Alert.alert('Error', 'Could not dismiss report.');
    }
  }

  function renderMedia(imageUrl?: string, videoUrl?: string) {
    return (
      <>
        {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.adminImage} /> : null}

        {videoUrl ? (
          <FanVideoPlayer
            uri={videoUrl}
            style={styles.adminVideo}
            contentFit="contain"
          />
        ) : null}
      </>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading Admin Panel...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Admin Panel</Text>
        <Text style={styles.heroSubtitle}>
          Review reports, hold posts, release posts, and delete unsafe content.
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{activeReports.length}</Text>
          <Text style={styles.statLabel}>Reports</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{heldPosts.length}</Text>
          <Text style={styles.statLabel}>On Hold</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{resolvedReports.length}</Text>
          <Text style={styles.statLabel}>Resolved</Text>
        </View>
      </View>

      <View style={styles.searchCard}>
        <Text style={styles.searchLabel}>Search reports</Text>

        <TextInput
          style={styles.searchInput}
          value={reportSearch}
          onChangeText={setReportSearch}
          placeholder="Reason, post, owner, or reporter"
          placeholderTextColor="#64748B"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {reportSearch.trim() ? (
          <Text style={styles.searchResults}>
            {filteredActiveReports.length} active ·{' '}
            {filteredResolvedReports.length} resolved
          </Text>
        ) : null}
      </View>

      <Text style={styles.sectionTitle}>⏸️ Posts On Hold</Text>

      {heldPosts.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No posts are currently on hold.</Text>
        </View>
      ) : (
        heldPosts.map((post) => (
          <View key={post.id} style={styles.holdCard}>
            <Text style={styles.mediaType}>{getMediaType(post)}</Text>
            <Text style={styles.statusHold}>UNDER INVESTIGATION</Text>

            <Text style={styles.postText}>{post.text || 'No text in this post.'}</Text>

            {renderMedia(post.imageUrl, post.videoUrl)}

            <Text style={styles.meta}>Owner: {post.userEmail || post.displayName || 'Unknown'}</Text>
            <Text style={styles.time}>Held: {formatDate(post.heldAt || post.createdAt)}</Text>

            <View style={styles.actionRow}>
              <Pressable style={styles.releaseButton} onPress={() => releasePost(post.docId || post.id)}>
                <Text style={styles.buttonText}>Release</Text>
              </Pressable>

              <Pressable style={styles.deleteButton} onPress={() => deletePost(post.docId || post.id)}>
                <Text style={styles.buttonText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}

      <Text style={styles.sectionTitle}>🚩 Reported Content</Text>

      {filteredActiveReports.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>
            {reportSearch.trim()
              ? 'No active reports match your search.'
              : 'No active reports.'}
          </Text>
        </View>
      ) : (
        filteredActiveReports.map((report) => {
          const post = findPost(report);

          const imageUrl = report.postImageUrl || post?.imageUrl || '';
          const videoUrl = report.postVideoUrl || post?.videoUrl || '';
          const postText = report.postText || post?.text || 'No text in this post.';
          const owner = report.postOwnerEmail || post?.userEmail || post?.displayName || 'Unknown owner';
          const reporter = report.reporterEmail || report.reportedBy || report.reporterId || 'Unknown reporter';
          const isMissingPost = !post;
          const status = isMissingPost ? 'missing' : post?.moderationStatus || 'active';

          return (
            <View key={report.id} style={styles.reportCard}>
              <Text style={styles.mediaType}>{getMediaType(post, report)}</Text>
              <Text
                style={
                  status === 'under_investigation'
                    ? styles.statusHold
                    : isMissingPost
                      ? styles.statusMissing
                      : styles.statusActive
                }
              >
                {status === 'under_investigation'
                  ? 'UNDER INVESTIGATION'
                  : isMissingPost
                    ? 'POST NOT FOUND'
                    : 'ACTIVE'}
              </Text>

              <Text style={styles.label}>Reason</Text>
              <Text style={styles.value}>{report.reason || 'No reason added'}</Text>

              <Text style={styles.label}>Reported Post</Text>
              <Text style={styles.postText}>{postText}</Text>

              {renderMedia(imageUrl, videoUrl)}

              <Text style={styles.meta}>Owner: {owner}</Text>
              <Text style={styles.meta}>Reporter: {reporter}</Text>
              <Text style={styles.time}>{formatDate(report.createdAt)}</Text>

              <View style={styles.actionRow}>
                {isMissingPost ? (
                  <Pressable style={styles.dismissButton} onPress={() => dismissReport(report.id)}>
                    <Text style={styles.buttonText}>Dismiss Old Report</Text>
                  </Pressable>
                ) : status === 'under_investigation' ? (
                  <Pressable style={styles.releaseButton} onPress={() => releasePost(report.postId, report)}>
                    <Text style={styles.buttonText}>Release</Text>
                  </Pressable>
                ) : (
                  <Pressable style={styles.holdButton} onPress={() => holdPost(report.postId, report)}>
                    <Text style={styles.buttonTextDark}>Hold</Text>
                  </Pressable>
                )}

                {!isMissingPost ? (
                  <Pressable style={styles.deleteButton} onPress={() => deletePost(report.postId, report)}>
                    <Text style={styles.buttonText}>Delete</Text>
                  </Pressable>
                ) : null}

                {!isMissingPost ? (
                  <Pressable style={styles.dismissButton} onPress={() => dismissReport(report.id)}>
                    <Text style={styles.buttonText}>Dismiss</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          );
        })
      )}

      <Pressable
        style={styles.historyHeader}
        onPress={() => setShowResolvedReports((current) => !current)}
      >
        <View>
          <Text style={styles.historyHeaderTitle}>
            ✅ Resolved Reports History
          </Text>
          <Text style={styles.historyHeaderMeta}>
            {reportSearch.trim()
              ? filteredResolvedReports.length
              : resolvedReports.length}{' '}
            resolved report
            {(reportSearch.trim()
              ? filteredResolvedReports.length
              : resolvedReports.length) === 1
              ? ''
              : 's'}
          </Text>
        </View>

        <Text style={styles.historyArrow}>
          {showResolvedReports ? '▲ Hide' : '▼ Show'}
        </Text>
      </Pressable>

      {showResolvedReports ? (
        filteredResolvedReports.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              {reportSearch.trim()
                ? 'No resolved reports match your search.'
                : 'No resolved reports yet.'}
            </Text>
          </View>
        ) : (
          filteredResolvedReports.map((report) => {
            const resolutionLabel =
              report.resolution === 'post_deleted'
                ? 'RESOLVED — POST DELETED'
                : 'RESOLVED — DISMISSED';

            return (
              <View key={report.id} style={styles.reportCard}>
                <Text style={styles.mediaType}>
                  {getMediaType(undefined, report)}
                </Text>

                <Text
                  style={
                    report.resolution === 'post_deleted'
                      ? styles.statusMissing
                      : styles.statusActive
                  }
                >
                  {resolutionLabel}
                </Text>

                <Text style={styles.label}>Reason</Text>
                <Text style={styles.value}>
                  {report.reason || 'No reason added'}
                </Text>

                <Text style={styles.label}>Reported Post</Text>
                <Text style={styles.postText}>
                  {report.postText || 'No text saved for this report.'}
                </Text>

                {renderMedia(report.postImageUrl, report.postVideoUrl)}

                <Text style={styles.meta}>
                  Owner: {report.postOwnerEmail || 'Unknown owner'}
                </Text>

                <Text style={styles.meta}>
                  Reporter:{' '}
                  {report.reporterEmail ||
                    report.reportedBy ||
                    report.reporterId ||
                    'Unknown reporter'}
                </Text>

                <Text style={styles.time}>
                  Reported: {formatDate(report.createdAt)}
                </Text>

                <Text style={styles.time}>
                  Resolved: {formatDate(report.dismissedAt)}
                </Text>
              </View>
            );
          })
        )
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
    paddingTop: 70,
    paddingBottom: 150,
  },
  center: {
    flex: 1,
    backgroundColor: '#07111F',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#E5E7EB',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 12,
  },
  backButton: {
    backgroundColor: '#132238',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignSelf: 'flex-start',
    marginBottom: 18,
  },
  backText: {
    color: '#FFD166',
    fontWeight: '900',
    fontSize: 16,
  },
  hero: {
    backgroundColor: '#0B1729',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#24344F',
    marginBottom: 18,
  },
  heroTitle: {
    color: '#FFD166',
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: '#CBD5E1',
    fontSize: 15,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0B1729',
    borderWidth: 1,
    borderColor: '#24344F',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
  },
  statNumber: {
    color: '#FFD166',
    fontSize: 34,
    fontWeight: '900',
  },
  statLabel: {
    color: '#CBD5E1',
    fontSize: 15,
    fontWeight: '800',
  },
  historyHeader: {
    backgroundColor: '#0B1729',
    borderWidth: 1,
    borderColor: '#24344F',
    borderRadius: 18,
    padding: 16,
    marginTop: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  historyHeaderTitle: {
    color: '#FFD166',
    fontSize: 21,
    fontWeight: '900',
  },
  historyHeaderMeta: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  historyArrow: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '900',
  },
  searchCard: {
    backgroundColor: '#0B1729',
    borderWidth: 1,
    borderColor: '#24344F',
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
  },
  searchLabel: {
    color: '#E5E7EB',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: '#07111F',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    color: '#FFFFFF',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchResults: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 9,
  },
  sectionTitle: {
    color: '#FFD166',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 12,
    marginBottom: 14,
  },
  emptyBox: {
    backgroundColor: '#0B1729',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#24344F',
    padding: 18,
    marginBottom: 18,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 16,
  },
  holdCard: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
  },
  reportCard: {
    backgroundColor: '#07111F',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
  },
  mediaType: {
    color: '#FFD166',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 6,
  },
  statusActive: {
    color: '#86EFAC',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 10,
  },
  statusMissing: {
    color: '#FCA5A5',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 12,
  },
  statusHold: {
    color: '#FCA5A5',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 10,
  },
  label: {
    color: '#93C5FD',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 8,
  },
  value: {
    color: '#E5E7EB',
    fontSize: 16,
    marginTop: 3,
  },
  postText: {
    color: '#F8FAFC',
    fontSize: 17,
    lineHeight: 24,
    marginTop: 8,
    marginBottom: 8,
  },
  adminImage: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    backgroundColor: '#020617',
    marginTop: 8,
    marginBottom: 12,
  },
  adminVideo: {
    width: '100%',
    height: 260,
    borderRadius: 16,
    backgroundColor: '#020617',
    marginTop: 8,
    marginBottom: 12,
  },
  meta: {
    color: '#CBD5E1',
    fontSize: 14,
    marginTop: 4,
  },
  time: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  holdButton: {
    flex: 1,
    backgroundColor: '#F59E0B',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  releaseButton: {
    flex: 1,
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  dismissButton: {
    flex: 1,
    backgroundColor: '#24344F',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '900',
  },
  buttonTextDark: {
    color: '#07111F',
    fontSize: 15,
    fontWeight: '900',
  },
});
