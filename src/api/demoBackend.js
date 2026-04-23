import studentDirectory from './students.json';

const STORAGE_KEY = 'hostelhub_demo_db_v6';
const MATCH_THRESHOLD = 70;

const isoNow = () => new Date().toISOString();

const makeId = (prefix) =>
  `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;

const createToken = (user) => {
  const payload = btoa(JSON.stringify({ id: user._id, role: user.role }));
  return `demo.${payload}.signature`;
};

const parseToken = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

const normalizeText = (value = '') =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tokenize = (value = '') =>
  normalizeText(value)
    .split(' ')
    .filter((token) => token.length > 2);

const jaccardSimilarity = (a = '', b = '') => {
  const setA = new Set(tokenize(a));
  const setB = new Set(tokenize(b));

  if (!setA.size && !setB.size) {
    return 0;
  }

  const intersection = [...setA].filter((token) => setB.has(token)).length;
  const union = new Set([...setA, ...setB]).size || 1;
  return intersection / union;
};

const stringSimilarity = (a = '', b = '') => {
  const first = normalizeText(a);
  const second = normalizeText(b);
  if (!first || !second) return 0;
  if (first === second) return 1;
  if (first.includes(second) || second.includes(first)) return 0.85;
  return jaccardSimilarity(first, second);
};

const dateProximityScore = (a, b) => {
  if (!a || !b) return 0;
  const diffDays = Math.abs(new Date(a).getTime() - new Date(b).getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays <= 1) return 1;
  if (diffDays <= 3) return 0.85;
  if (diffDays <= 7) return 0.65;
  if (diffDays <= 14) return 0.4;
  return 0.15;
};

const computeMatchScore = (lostItem, foundItem) => {
  const categoryScore = lostItem.category === foundItem.category ? 1 : 0;
  const keywordScore = Math.max(
    jaccardSimilarity(`${lostItem.itemName} ${lostItem.description}`, `${foundItem.itemName} ${foundItem.description}`),
    jaccardSimilarity(lostItem.description, foundItem.description),
  );
  const locationScore = stringSimilarity(lostItem.location, foundItem.location);
  const dateScore = dateProximityScore(lostItem.dateLostOrFound, foundItem.dateLostOrFound);

  const score = Math.round(
    categoryScore * 40 +
      keywordScore * 25 +
      locationScore * 20 +
      dateScore * 15,
  );

  return {
    score,
    breakdown: {
      category: Math.round(categoryScore * 100),
      keywords: Math.round(keywordScore * 100),
      location: Math.round(locationScore * 100),
      date: Math.round(dateScore * 100),
    },
    isPotentialMatch: score >= MATCH_THRESHOLD,
  };
};

const buildSeedState = () => {
  const adminId = 'usr_admin_001';
  const wardenId = 'usr_warden_001';
  const studentAId = 'usr_student_001';
  const studentBId = 'usr_student_002';
  const studentCId = 'usr_student_003';
  const studentDId = 'usr_student_004';

  const lostItem1 = 'lost_001';
  const lostItem2 = 'lost_002';
  const foundItem1 = 'found_001';
  const foundItem2 = 'found_002';
  const match1 = 'match_001';
  const match2 = 'match_002';
  const claim1 = 'claim_001';

  const students = Array.isArray(studentDirectory) ? studentDirectory : [];
  const fallbackStudents = [
    { regnNo: '240212', name: 'Student A', roomNo: '203A' },
    { regnNo: '240138', name: 'Student B', roomNo: '011A' },
    { regnNo: '240261', name: 'Student C', roomNo: '209A' },
    { regnNo: '240216', name: 'Student D', roomNo: '302A' },
  ];
  const baseStudents = students.length ? students : fallbackStudents;

  const [studentASeed, studentBSeed, studentCSeed, studentDSeed] = baseStudents;

  const toStudentUser = (seed, id) => ({
    _id: id,
    id,
    name: seed?.name || `Student ${seed?.regnNo || ''}`.trim(),
    email: `${seed?.regnNo || id}@hostelhub.edu`,
    rollNo: String(seed?.regnNo || '').trim(),
    password: String(seed?.regnNo || '').trim(),
    hostelId: seed?.roomNo ? `Room ${seed.roomNo}` : 'Room TBD',
    role: 'student',
  });

  const extraStudentUsers = baseStudents.slice(4).map((seed) =>
    toStudentUser(seed, `usr_student_${seed.regnNo}`),
  );

  return {
    users: [
      {
        _id: adminId,
        id: adminId,
        name: 'System Admin',
        email: 'admin@hostelhub.edu',
        referenceId: '123',
        password: '123',
        role: 'admin',
        hostelId: 'Campus Control',
      },
      {
        _id: wardenId,
        id: wardenId,
        name: 'Kajal Khatri',
        email: 'kajal@hostelhub.edu',
        referenceId: 'kajal_k',
        password: '123',
        role: 'warden',
        hostelId: 'Block A',
      },
      {
        ...toStudentUser(studentASeed, studentAId),
      },
      {
        ...toStudentUser(studentBSeed, studentBId),
      },
      {
        ...toStudentUser(studentCSeed, studentCId),
      },
      {
        ...toStudentUser(studentDSeed, studentDId),
      },
      ...extraStudentUsers,
    ],
    complaints: [
      {
        _id: 'cmp_001',
        studentId: studentAId,
        title: 'Water Leakage in Wing B',
        description: 'Large leakage in the ceiling of the second-floor corridor.',
        category: 'Plumbing',
        priority: 'High',
        status: 'Pending',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
      },
      {
        _id: 'cmp_002',
        studentId: studentAId,
        title: 'Broken Study Table',
        description: 'The leg of my study table is completely broken.',
        category: 'Maintenance',
        priority: 'Medium',
        status: 'In Progress',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
      },
      {
        _id: 'cmp_003',
        studentId: studentBId,
        title: 'Corridor light not working',
        description: 'The light outside room 102 was replaced after repeated flickering.',
        category: 'Electrical',
        priority: 'Low',
        status: 'Resolved',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 60).toISOString(),
        resolutionTimeMinutes: 720,
      },
    ],
    feedback: [
      {
        _id: 'fbk_001',
        type: 'cleaning',
        title: 'Room cleaning feedback',
        prompt:
          'The warden requested quick feedback after the latest room cleaning round. Please rate cleanliness and staff conduct.',
        studentId: studentAId,
        createdBy: wardenId,
        createdByRole: 'warden',
        status: 'Pending',
        audience: 'single',
        targetLabel: toStudentUser(studentASeed, studentAId).hostelId,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
        submittedAt: '',
        response: null,
      },
      {
        _id: 'fbk_002',
        type: 'complaint-resolution',
        title: 'Complaint resolution feedback',
        prompt:
          'Your complaint about the corridor light was marked resolved. Please share whether the issue was fixed properly and on time.',
        studentId: studentBId,
        complaintId: 'cmp_003',
        complaintTitle: 'Corridor light not working',
        createdBy: wardenId,
        createdByRole: 'system',
        status: 'Submitted',
        audience: 'single',
        targetLabel: 'Complaint #cmp_003',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 58).toISOString(),
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 54).toISOString(),
        response: {
          rating: 4,
          satisfaction: 'Satisfied',
          comment: 'Issue was fixed and the light has been working properly since then.',
        },
      },
    ],
    leaves: [
      {
        _id: 'lev_001',
        studentId: studentBId,
        studentName: studentBSeed?.name || 'Student',
        rollNo: String(studentBSeed?.regnNo || '').trim(),
        reason: 'Need to attend a family function.',
        startDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
        type: 'Home Visit',
        status: 'Pending',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      },
      {
        _id: 'lev_002',
        studentId: studentCId,
        studentName: studentCSeed?.name || 'Student',
        rollNo: String(studentCSeed?.regnNo || '').trim(),
        reason: 'Scheduled medical consultation.',
        startDate: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        endDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        type: 'Medical',
        status: 'Approved',
        approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 60).toISOString(),
      },
    ],
    voice: [
      {
        _id: 'voc_001',
        authorId: studentAId,
        authorName: studentASeed?.name || 'Student',
        hostelName: 'Block A',
        type: 'post',
        content:
          'The common room projector has been flickering for a week. Can we get it repaired before the weekend screening?',
        upvotes: 5,
        upvotedBy: [studentBId],
        comments: [
          {
            authorName: 'Kajal Khatri',
            role: 'warden',
            content: 'Maintenance has been scheduled for tomorrow afternoon.',
            createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
          },
        ],
        isTrending: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      },
      {
        _id: 'voc_002',
        authorId: studentBId,
        authorName: studentBSeed?.name || 'Student',
        hostelName: 'Block A',
        type: 'poll',
        content: 'Should we extend library access hours from 10 PM to 12 AM during finals?',
        metadata: {
          options: [
            { label: 'Yes, absolutely', votes: 15 },
            { label: 'No, current hours are fine', votes: 2 },
          ],
        },
        upvotes: 3,
        upvotedBy: [studentAId],
        voters: [studentAId],
        comments: [],
        isTrending: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      },
    ],
    lostFound: {
      lostItems: [
        {
          _id: lostItem1,
          uniqueId: 'LF-LOST-1001',
          itemName: 'Blue Wallet',
          category: 'Accessories',
          description:
            'Navy blue leather wallet with college ID card, some receipts, and a silver zip pocket.',
          dateLostOrFound: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
          location: 'Block A common room',
          imageUrl: '',
          imageName: '',
          status: 'MATCH_FOUND',
          reporterId: studentAId,
          reporterRole: 'student',
          linkedMatchIds: [match1],
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 47).toISOString(),
          updatedAt: isoNow(),
        },
        {
          _id: lostItem2,
          uniqueId: 'LF-LOST-1002',
          itemName: 'Scientific Calculator',
          category: 'Electronics',
          description: 'Black Casio calculator with small scratch near display and initials AJ on back.',
          dateLostOrFound: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
          location: 'Engineering library second floor',
          imageUrl: '',
          imageName: '',
          status: 'OPEN',
          reporterId: studentBId,
          reporterRole: 'student',
          linkedMatchIds: [],
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
          updatedAt: isoNow(),
        },
      ],
      foundItems: [
        {
          _id: foundItem1,
          uniqueId: 'LF-FOUND-2001',
          itemName: 'Blue Wallet',
          category: 'Accessories',
          description:
            'Found a blue wallet with student cards inside near the TV lounge in Block A common area.',
          dateLostOrFound: new Date(Date.now() - 1000 * 60 * 60 * 45).toISOString(),
          location: 'Block A TV lounge',
          imageUrl: '',
          imageName: '',
          status: 'MATCH_LINKED',
          reporterId: studentCId,
          reporterRole: 'student',
          linkedMatchIds: [match1],
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 44).toISOString(),
          updatedAt: isoNow(),
        },
        {
          _id: foundItem2,
          uniqueId: 'LF-FOUND-2002',
          itemName: 'Wireless Earbuds',
          category: 'Electronics',
          description:
            'White earbuds in a charging case found near the library help desk. Case has a tiny star sticker.',
          dateLostOrFound: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
          location: 'Library help desk',
          imageUrl: '',
          imageName: '',
          status: 'MATCH_LINKED',
          reporterId: studentDId,
          reporterRole: 'student',
          linkedMatchIds: [match2],
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
          updatedAt: isoNow(),
        },
      ],
      matches: [
        {
          _id: match1,
          lostItemId: lostItem1,
          foundItemId: foundItem1,
          score: 88,
          status: 'Potential Match',
          breakdown: { category: 100, keywords: 78, location: 82, date: 85 },
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 43).toISOString(),
        },
        {
          _id: match2,
          lostItemId: null,
          foundItemId: foundItem2,
          score: 72,
          status: 'Potential Match',
          breakdown: { category: 100, keywords: 60, location: 55, date: 70 },
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 19).toISOString(),
        },
      ],
      claims: [
        {
          _id: claim1,
          lostItemId: lostItem1,
          foundItemId: foundItem1,
          claimantId: studentAId,
          claimantRole: 'student',
          verificationAnswers: {
            uniqueIdentifiers: 'College ID and two ATM cards were inside.',
            contentsProof: 'Small silver key and one folded canteen bill.',
            proofStatement: 'I can show a photo from last week carrying the wallet.',
          },
          status: 'PENDING',
          reviewerId: '',
          reviewNotes: '',
          handoverSchedule: '',
          completedAt: '',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          updatedAt: isoNow(),
        },
      ],
      notifications: [
        {
          _id: makeId('notif'),
          userId: studentAId,
          title: 'Potential Match Found',
          message: 'A found wallet in Block A may match your lost report.',
          type: 'match',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
          read: false,
        },
        {
          _id: makeId('notif'),
          userId: studentCId,
          title: 'Potential Owner Detected',
          message: 'A student lost-item report may match the wallet you found.',
          type: 'match',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
          read: false,
        },
      ],
      activityLog: [
        {
          _id: makeId('log'),
          actorId: studentAId,
          actorRole: 'student',
          action: 'LOST_ITEM_REPORTED',
          entityType: 'lost-item',
          entityId: lostItem1,
          message: 'Lost wallet report created.',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 47).toISOString(),
        },
        {
          _id: makeId('log'),
          actorId: studentCId,
          actorRole: 'student',
          action: 'FOUND_ITEM_REPORTED',
          entityType: 'found-item',
          entityId: foundItem1,
          message: 'Found wallet report created.',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 44).toISOString(),
        },
        {
          _id: makeId('log'),
          actorId: studentAId,
          actorRole: 'student',
          action: 'CLAIM_REQUESTED',
          entityType: 'claim',
          entityId: claim1,
          message: 'Claim submitted for potential wallet match.',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        },
      ],
    },
  };
};

const readState = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return JSON.parse(raw);
  const seed = buildSeedState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
};

const writeState = (state) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const getAuthToken = (config = {}) =>
  config.headers?.Authorization?.replace('Bearer ', '') || localStorage.getItem('token') || '';

const getCurrentUser = (config = {}) => {
  const parsed = parseToken(getAuthToken(config));
  if (!parsed?.id) return null;
  const state = readState();
  return state.users.find((user) => user._id === parsed.id) || null;
};

const requireUser = (config) => {
  const user = getCurrentUser(config);
  if (!user) throw new Error('Unauthorized');
  return user;
};

const normalizeUser = (user) => ({
  id: user._id,
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  rollNo: user.rollNo,
  hostelId: user.hostelId,
  referenceId: user.referenceId,
});

const withStudentInfo = (complaint, users) => {
  const student = users.find((user) => user._id === complaint.studentId);
  return {
    ...complaint,
    studentId: student
      ? { _id: student._id, name: student.name, rollNo: student.rollNo, hostelId: student.hostelId }
      : complaint.studentId,
  };
};

const withFeedbackInfo = (feedback, users) => {
  const student = users.find((user) => user._id === feedback.studentId);
  const createdByUser = users.find((user) => user._id === feedback.createdBy);

  return {
    ...feedback,
    student: student
      ? {
          _id: student._id,
          name: student.name,
          rollNo: student.rollNo,
          hostelId: student.hostelId,
          email: student.email,
        }
      : null,
    createdByUser: createdByUser
      ? {
          _id: createdByUser._id,
          name: createdByUser.name,
          role: createdByUser.role,
        }
      : null,
  };
};

const createFeedbackRequest = (state, payload) => {
  const feedback = {
    _id: makeId('fbk'),
    type: payload.type,
    title: payload.title,
    prompt: payload.prompt,
    studentId: payload.studentId,
    complaintId: payload.complaintId || '',
    complaintTitle: payload.complaintTitle || '',
    createdBy: payload.createdBy,
    createdByRole: payload.createdByRole,
    status: 'Pending',
    audience: payload.audience || 'single',
    targetLabel: payload.targetLabel || '',
    createdAt: isoNow(),
    submittedAt: '',
    response: null,
  };

  state.feedback.unshift(feedback);
  return feedback;
};

const makeResponse = (data) => Promise.resolve({ data });

const addNotification = (state, userId, title, message, type) => {
  state.lostFound.notifications.unshift({
    _id: makeId('notif'),
    userId,
    title,
    message,
    type,
    createdAt: isoNow(),
    read: false,
  });
};

const addActivityLog = (state, actor, action, entityType, entityId, message) => {
  state.lostFound.activityLog.unshift({
    _id: makeId('log'),
    actorId: actor._id,
    actorRole: actor.role,
    action,
    entityType,
    entityId,
    message,
    createdAt: isoNow(),
  });
};

const getUniqueReference = (kind, items) => {
  const prefix = kind === 'lost' ? 'LF-LOST-' : 'LF-FOUND-';
  return `${prefix}${1000 + items.length + 1}`;
};

const getVisibleName = (state, userId) => {
  return state.users.find((user) => user._id === userId)?.name || 'Unknown user';
};

const recalculateLostFoundMatches = (state, actor) => {
  const { lostItems, foundItems } = state.lostFound;

  state.lostFound.matches = [];

  lostItems.forEach((lostItem) => {
    lostItem.linkedMatchIds = [];
    if (lostItem.status !== 'CLAIM_REQUESTED' && lostItem.status !== 'VERIFIED' && lostItem.status !== 'CLOSED') {
      lostItem.status = 'OPEN';
    }
  });

  foundItems.forEach((foundItem) => {
    foundItem.linkedMatchIds = [];
    if (foundItem.status !== 'HANDED_OVER' && foundItem.status !== 'CLOSED') {
      foundItem.status = 'REPORTED';
    }
  });

  lostItems.forEach((lostItem) => {
    foundItems.forEach((foundItem) => {
      if (foundItem.status === 'CLOSED' || lostItem.status === 'CLOSED') return;

      const result = computeMatchScore(lostItem, foundItem);
      if (!result.isPotentialMatch) return;

      const matchId = makeId('match');
      state.lostFound.matches.push({
        _id: matchId,
        lostItemId: lostItem._id,
        foundItemId: foundItem._id,
        score: result.score,
        status: 'Potential Match',
        breakdown: result.breakdown,
        createdAt: isoNow(),
      });

      lostItem.linkedMatchIds.push(matchId);
      foundItem.linkedMatchIds.push(matchId);

      if (lostItem.status === 'OPEN') lostItem.status = 'MATCH_FOUND';
      if (foundItem.status === 'REPORTED') foundItem.status = 'MATCH_LINKED';
    });
  });

  state.lostFound.matches.sort((a, b) => b.score - a.score);

  if (actor) {
    addActivityLog(
      state,
      actor,
      'MATCH_ENGINE_RUN',
      'matching',
      'lost-found',
      `Lost and found matching refreshed. ${state.lostFound.matches.length} potential matches available.`,
    );
  }
};

const buildLostFoundItemView = (state, item, kind, currentUser) => {
  const itemMatches = state.lostFound.matches
    .filter((match) =>
      kind === 'lost' ? match.lostItemId === item._id : match.foundItemId === item._id,
    )
    .map((match) => {
      const oppositeItem =
        kind === 'lost'
          ? state.lostFound.foundItems.find((entry) => entry._id === match.foundItemId)
          : state.lostFound.lostItems.find((entry) => entry._id === match.lostItemId);

      const oppositeReporter = oppositeItem
        ? state.users.find((user) => user._id === oppositeItem.reporterId)
        : null;

      const claim = state.lostFound.claims.find(
        (entry) => entry.lostItemId === match.lostItemId && entry.foundItemId === match.foundItemId,
      );

      return {
        ...match,
        oppositeItem: oppositeItem
          ? {
              _id: oppositeItem._id,
              uniqueId: oppositeItem.uniqueId,
              itemName: oppositeItem.itemName,
              category: oppositeItem.category,
              description: oppositeItem.description,
              dateLostOrFound: oppositeItem.dateLostOrFound,
              location: oppositeItem.location,
              status: oppositeItem.status,
              imageUrl: oppositeItem.imageUrl,
              imageName: oppositeItem.imageName,
              reporterLabel:
                currentUser.role === 'student' && claim?.status !== 'APPROVED'
                  ? 'Hidden until claim approval'
                  : oppositeReporter?.name || 'Unknown reporter',
            }
          : null,
        claimStatus: claim?.status || '',
        claimId: claim?._id || '',
      };
    });

  const claims = state.lostFound.claims.filter((claim) =>
    kind === 'lost' ? claim.lostItemId === item._id : claim.foundItemId === item._id,
  );

  return {
    ...item,
    reporterName: getVisibleName(state, item.reporterId),
    matches: itemMatches,
    claims,
  };
};

const buildClaimView = (state, claim) => {
  const lostItem = state.lostFound.lostItems.find((item) => item._id === claim.lostItemId);
  const foundItem = state.lostFound.foundItems.find((item) => item._id === claim.foundItemId);
  const claimant = state.users.find((user) => user._id === claim.claimantId);
  const reviewer = state.users.find((user) => user._id === claim.reviewerId);
  const match = state.lostFound.matches.find(
    (entry) => entry.lostItemId === claim.lostItemId && entry.foundItemId === claim.foundItemId,
  );

  return {
    ...claim,
    claimantName: claimant?.name || 'Unknown claimant',
    lostItem,
    foundItem,
    match,
    reviewerName: reviewer?.name || '',
  };
};

const buildLostFoundDashboard = (state, currentUser) => {
  const lostItems =
    currentUser.role === 'student'
      ? state.lostFound.lostItems.filter((item) => item.reporterId === currentUser._id)
      : state.lostFound.lostItems;

  const foundItems =
    currentUser.role === 'student'
      ? state.lostFound.foundItems.filter((item) => item.reporterId === currentUser._id)
      : state.lostFound.foundItems;

  const claims =
    currentUser.role === 'student'
      ? state.lostFound.claims.filter((item) => item.claimantId === currentUser._id)
      : state.lostFound.claims;

  const pendingReviewClaims = state.lostFound.claims.filter((claim) => claim.status === 'PENDING').length;
  const notifications = state.lostFound.notifications.filter(
    (notification) => currentUser.role !== 'student' || notification.userId === currentUser._id,
  );

  return {
    schema: {
      users: ['_id', 'role', 'name', 'email', 'hostelId', 'rollNo', 'referenceId'],
      lostItems: [
        'uniqueId',
        'itemName',
        'category',
        'description',
        'dateLostOrFound',
        'location',
        'imageUrl',
        'status',
        'reporterId',
      ],
      foundItems: [
        'uniqueId',
        'itemName',
        'category',
        'description',
        'dateLostOrFound',
        'location',
        'imageUrl',
        'status',
        'reporterId',
      ],
      matches: ['lostItemId', 'foundItemId', 'score', 'breakdown', 'status'],
      claims: [
        'lostItemId',
        'foundItemId',
        'claimantId',
        'verificationAnswers',
        'status',
        'reviewNotes',
        'handoverSchedule',
      ],
    },
    endpoints: [
      'GET /api/lost-found/dashboard',
      'GET /api/lost-found/items?kind=lost|found|all&scope=mine|all',
      'POST /api/lost-found/lost-items',
      'POST /api/lost-found/found-items',
      'GET /api/lost-found/claims?scope=mine|review|all',
      'POST /api/lost-found/claims',
      'PATCH /api/lost-found/claims/:id/review',
      'PATCH /api/lost-found/claims/:id/complete',
      'GET /api/lost-found/notifications',
    ],
    summary: {
      lostCount: state.lostFound.lostItems.length,
      foundCount: state.lostFound.foundItems.length,
      potentialMatches: state.lostFound.matches.filter((match) => match.score >= MATCH_THRESHOLD).length,
      claimsPending: pendingReviewClaims,
      myLostReports: lostItems.length,
      myFoundReports: foundItems.length,
      myClaims: claims.length,
      unreadNotifications: notifications.filter((notification) => !notification.read).length,
      falseClaimLimit: 3,
      directContactPolicy: 'Reporter contact details remain hidden until claim approval.',
    },
    notifications: notifications.slice(0, 8),
    activityLog: state.lostFound.activityLog.slice(0, 10),
    architecture: {
      frontend: ['LostFoundCenter', 'student reporting flows', 'warden/admin review queue', 'notifications'],
      backend: ['Users', 'Lost_Items', 'Found_Items', 'Matches', 'Claims'],
      matchingAlgorithm: 'Category 40%, Description keywords 25%, Location 20%, Date proximity 15%',
    },
  };
};

export const demoRequest = async (method, url, body = {}, config = {}) => {
  const state = readState();

  if (url === '/auth/login' && method === 'post') {
    const { identifier, password, role } = body;
    const user = state.users.find(
      (item) =>
        [item.email, item.rollNo, item.referenceId].includes(identifier) &&
        (!role || item.role === role),
    );
    if (!user) throw new Error('Account not recognized.');
    if (user.password !== password) throw new Error('Invalid password.');
    return makeResponse({ token: createToken(user), user: normalizeUser(user) });
  }

  if (url === '/users/profile' && method === 'patch') {
    const currentUser = requireUser(config);
    state.users = state.users.map((user) =>
      user._id === currentUser._id
        ? {
            ...user,
            name: body.name?.trim() || user.name,
            email: body.email?.trim() || user.email,
            hostelId: body.hostelId?.trim() || user.hostelId,
            referenceId: user.role !== 'student' ? body.referenceId?.trim() || user.referenceId : user.referenceId,
          }
        : user,
    );
    writeState(state);
    return makeResponse(normalizeUser(state.users.find((user) => user._id === currentUser._id)));
  }

  if (url === '/users/students' && method === 'get') {
    const currentUser = requireUser(config);
    if (!['warden', 'admin'].includes(currentUser.role)) throw new Error('Forbidden');
    return makeResponse(state.users.filter((user) => user.role === 'student').map(normalizeUser));
  }

  if (url === '/users/wardens' && method === 'get') {
    const currentUser = requireUser(config);
    if (currentUser.role !== 'admin') throw new Error('Forbidden');
    return makeResponse(state.users.filter((user) => user.role === 'warden').map(normalizeUser));
  }

  if (url === '/complaints' && method === 'get') {
    const currentUser = requireUser(config);
    const complaints =
      currentUser.role === 'student'
        ? state.complaints.filter((item) => item.studentId === currentUser._id)
        : state.complaints;
    return makeResponse(
      complaints.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((item) => withStudentInfo(item, state.users)),
    );
  }

  if (url === '/complaints' && method === 'post') {
    const currentUser = requireUser(config);
    if (currentUser.role !== 'student') throw new Error('Only students can submit complaints.');
    const complaint = {
      _id: makeId('cmp'),
      studentId: currentUser._id,
      title: body.title,
      description: body.description,
      category: body.category,
      priority: body.priority,
      status: 'Pending',
      createdAt: isoNow(),
    };
    state.complaints.unshift(complaint);
    writeState(state);
    return makeResponse(withStudentInfo(complaint, state.users));
  }

  if (url.match(/^\/complaints\/[^/]+\/status$/) && method === 'patch') {
    const currentUser = requireUser(config);
    if (!['warden', 'admin'].includes(currentUser.role)) throw new Error('Forbidden');
    const complaintId = url.split('/')[2];
    const complaint = state.complaints.find((item) => item._id === complaintId);
    if (!complaint) throw new Error('Complaint not found.');
    complaint.status = body.status;
    if (body.status === 'Resolved') {
      complaint.resolvedAt = isoNow();
      complaint.resolutionTimeMinutes = Math.max(
        1,
        Math.round((Date.now() - new Date(complaint.createdAt).getTime()) / 60000),
      );

      const alreadyRequested = state.feedback.some(
        (entry) => entry.complaintId === complaint._id && entry.type === 'complaint-resolution',
      );

      if (!alreadyRequested) {
        createFeedbackRequest(state, {
          type: 'complaint-resolution',
          title: 'Complaint resolution feedback',
          prompt: `Your complaint "${complaint.title}" was marked resolved. Please confirm whether the issue has been fixed properly.`,
          studentId: complaint.studentId,
          complaintId: complaint._id,
          complaintTitle: complaint.title,
          createdBy: currentUser._id,
          createdByRole: 'system',
          targetLabel: complaint.title,
        });
      }
    }
    writeState(state);
    return makeResponse(withStudentInfo(complaint, state.users));
  }

  if (url === '/feedback' && method === 'get') {
    const currentUser = requireUser(config);
    const feedbackItems =
      currentUser.role === 'student'
        ? state.feedback.filter((item) => item.studentId === currentUser._id)
        : currentUser.role === 'admin'
          ? state.feedback
          : [];

    return makeResponse(
      feedbackItems
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((item) => withFeedbackInfo(item, state.users)),
    );
  }

  if (url === '/feedback/requests' && method === 'post') {
    const currentUser = requireUser(config);
    if (!['warden', 'admin'].includes(currentUser.role)) throw new Error('Forbidden');

    const studentIds = Array.isArray(body.studentIds) ? body.studentIds : [];
    if (!studentIds.length) throw new Error('Select at least one student.');

    const requests = studentIds.map((studentId) =>
      createFeedbackRequest(state, {
        type: body.type || 'cleaning',
        title: body.title || 'Feedback request',
        prompt: body.prompt || 'Please share your feedback.',
        studentId,
        createdBy: currentUser._id,
        createdByRole: currentUser.role,
        audience: studentIds.length > 1 ? 'bulk' : 'single',
        targetLabel: body.targetLabel || '',
      }),
    );

    writeState(state);
    return makeResponse(requests.map((item) => withFeedbackInfo(item, state.users)));
  }

  if (url.match(/^\/feedback\/[^/]+\/submit$/) && method === 'patch') {
    const currentUser = requireUser(config);
    if (currentUser.role !== 'student') throw new Error('Only students can submit feedback.');

    const feedbackId = url.split('/')[2];
    const feedback = state.feedback.find((item) => item._id === feedbackId);
    if (!feedback) throw new Error('Feedback request not found.');
    if (feedback.studentId !== currentUser._id) throw new Error('Forbidden');

    feedback.status = 'Submitted';
    feedback.submittedAt = isoNow();
    feedback.response = {
      rating: body.rating,
      satisfaction: body.satisfaction,
      comment: body.comment?.trim() || '',
    };

    writeState(state);
    return makeResponse(withFeedbackInfo(feedback, state.users));
  }

  if (url === '/leave' && method === 'get') {
    const currentUser = requireUser(config);
    const leaves =
      currentUser.role === 'student'
        ? state.leaves.filter((item) => item.studentId === currentUser._id)
        : state.leaves;
    return makeResponse(leaves.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  }

  if (url === '/leave' && method === 'post') {
    const currentUser = requireUser(config);
    if (currentUser.role !== 'student') throw new Error('Only students can apply for leave.');
    const leave = {
      _id: makeId('lev'),
      studentId: currentUser._id,
      studentName: currentUser.name,
      rollNo: currentUser.rollNo,
      reason: body.reason,
      startDate: body.startDate,
      endDate: body.endDate,
      type: body.type,
      status: 'Pending',
      createdAt: isoNow(),
    };
    state.leaves.unshift(leave);
    writeState(state);
    return makeResponse(leave);
  }

  if (url.match(/^\/leave\/[^/]+\/status$/) && method === 'patch') {
    const currentUser = requireUser(config);
    if (!['warden', 'admin'].includes(currentUser.role)) throw new Error('Forbidden');
    const leaveId = url.split('/')[2];
    const leave = state.leaves.find((item) => item._id === leaveId);
    if (!leave) throw new Error('Leave application not found.');
    leave.status = body.status;
    leave.wardenRemarks = body.remarks;
    if (body.status === 'Approved') leave.approvedAt = isoNow();
    writeState(state);
    return makeResponse(leave);
  }

  if (url === '/voice' && method === 'get') {
    requireUser(config);
    return makeResponse(
      state.voice
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((item) => ({
          ...item,
          comments: item.comments || [],
          metadata: item.metadata || {},
          upvotedBy: item.upvotedBy || [],
          voters: item.voters || [],
          timeAgo: new Date(item.createdAt).toLocaleDateString(),
        })),
    );
  }

  if (url === '/voice' && method === 'post') {
    const currentUser = requireUser(config);
    const voice = {
      _id: makeId('voc'),
      authorId: currentUser._id,
      authorName: currentUser.name,
      hostelName: currentUser.hostelId || 'General',
      type: body.type,
      content: body.content,
      metadata: body.metadata || {},
      upvotes: 0,
      upvotedBy: [],
      voters: [],
      comments: [],
      isTrending: false,
      createdAt: isoNow(),
    };
    state.voice.unshift(voice);
    writeState(state);
    return makeResponse(voice);
  }

  if (url.match(/^\/voice\/[^/]+\/upvote$/) && method === 'patch') {
    const currentUser = requireUser(config);
    const voiceId = url.split('/')[2];
    const voice = state.voice.find((item) => item._id === voiceId);
    if (!voice) throw new Error('Content not found.');
    voice.upvotedBy = voice.upvotedBy || [];
    const alreadyUpvoted = voice.upvotedBy.includes(currentUser._id);
    voice.upvotedBy = alreadyUpvoted
      ? voice.upvotedBy.filter((id) => id !== currentUser._id)
      : [...voice.upvotedBy, currentUser._id];
    voice.upvotes = voice.upvotedBy.length;
    writeState(state);
    return makeResponse(voice);
  }

  if (url.match(/^\/voice\/[^/]+\/vote$/) && method === 'patch') {
    const currentUser = requireUser(config);
    const voiceId = url.split('/')[2];
    const voice = state.voice.find((item) => item._id === voiceId);
    if (!voice || voice.type !== 'poll') throw new Error('Poll not found.');
    voice.voters = voice.voters || [];
    if (voice.voters.includes(currentUser._id)) throw new Error('You have already voted in this poll.');
    const option = voice.metadata?.options?.[body.optionIndex];
    if (!option) throw new Error('Invalid option selected.');
    option.votes += 1;
    voice.voters.push(currentUser._id);
    writeState(state);
    return makeResponse(voice);
  }

  if (url.match(/^\/voice\/[^/]+\/comment$/) && method === 'post') {
    const currentUser = requireUser(config);
    const voiceId = url.split('/')[2];
    const voice = state.voice.find((item) => item._id === voiceId);
    if (!voice) throw new Error('Content not found.');
    voice.comments = voice.comments || [];
    voice.comments.push({
      authorName: currentUser.name,
      role: currentUser.role,
      content: body.content,
      createdAt: isoNow(),
    });
    writeState(state);
    return makeResponse(voice);
  }

  if (url === '/lost-found/dashboard' && method === 'get') {
    const currentUser = requireUser(config);
    return makeResponse(buildLostFoundDashboard(state, currentUser));
  }

  if (url === '/lost-found/items' && method === 'get') {
    const currentUser = requireUser(config);
    const params = config.params || {};
    const kind = params.kind || 'all';
    const scope = params.scope || (currentUser.role === 'student' ? 'mine' : 'all');

    const scopeFilter = (item) => (scope === 'mine' ? item.reporterId === currentUser._id : true);

    const lostItems = state.lostFound.lostItems
      .filter(scopeFilter)
      .map((item) => buildLostFoundItemView(state, item, 'lost', currentUser));

    const foundItems = state.lostFound.foundItems
      .filter(scopeFilter)
      .map((item) => buildLostFoundItemView(state, item, 'found', currentUser));

    if (kind === 'lost') return makeResponse(lostItems);
    if (kind === 'found') return makeResponse(foundItems);
    return makeResponse({ lostItems, foundItems });
  }

  if (url === '/lost-found/notifications' && method === 'get') {
    const currentUser = requireUser(config);
    return makeResponse(
      state.lostFound.notifications.filter(
        (notification) => currentUser.role !== 'student' || notification.userId === currentUser._id,
      ),
    );
  }

  if (url === '/lost-found/claims' && method === 'get') {
    const currentUser = requireUser(config);
    const params = config.params || {};
    const scope = params.scope || (currentUser.role === 'student' ? 'mine' : 'review');

    const claims = state.lostFound.claims.filter((claim) => {
      if (scope === 'mine') return claim.claimantId === currentUser._id;
      if (scope === 'review') return ['warden', 'admin'].includes(currentUser.role);
      return true;
    });

    return makeResponse(claims.map((claim) => buildClaimView(state, claim)));
  }

  if (url === '/lost-found/lost-items' && method === 'post') {
    const currentUser = requireUser(config);
    const item = {
      _id: makeId('lost'),
      uniqueId: getUniqueReference('lost', state.lostFound.lostItems),
      itemName: body.itemName,
      category: body.category,
      description: body.description,
      dateLostOrFound: body.dateLostOrFound,
      location: body.location,
      imageUrl: body.imageUrl || '',
      imageName: body.imageName || '',
      status: 'OPEN',
      reporterId: currentUser._id,
      reporterRole: currentUser.role,
      linkedMatchIds: [],
      createdAt: isoNow(),
      updatedAt: isoNow(),
    };
    state.lostFound.lostItems.unshift(item);
    recalculateLostFoundMatches(state, currentUser);
    addActivityLog(state, currentUser, 'LOST_ITEM_REPORTED', 'lost-item', item._id, `${item.itemName} reported as lost.`);
    item.linkedMatchIds.forEach((matchId) => {
      const match = state.lostFound.matches.find((entry) => entry._id === matchId);
      const foundItem = state.lostFound.foundItems.find((entry) => entry._id === match?.foundItemId);
      if (foundItem) {
        addNotification(state, currentUser._id, 'Potential Match Found', `A found report for "${foundItem.itemName}" is now linked to your lost item.`, 'match');
        addNotification(state, foundItem.reporterId, 'Potential Owner Detected', `Your found report "${foundItem.itemName}" now has a potential claimant.`, 'match');
      }
    });
    writeState(state);
    return makeResponse(buildLostFoundItemView(state, item, 'lost', currentUser));
  }

  if (url === '/lost-found/found-items' && method === 'post') {
    const currentUser = requireUser(config);
    const item = {
      _id: makeId('found'),
      uniqueId: getUniqueReference('found', state.lostFound.foundItems),
      itemName: body.itemName,
      category: body.category,
      description: body.description,
      dateLostOrFound: body.dateLostOrFound,
      location: body.location,
      imageUrl: body.imageUrl || '',
      imageName: body.imageName || '',
      status: 'REPORTED',
      reporterId: currentUser._id,
      reporterRole: currentUser.role,
      linkedMatchIds: [],
      createdAt: isoNow(),
      updatedAt: isoNow(),
    };
    state.lostFound.foundItems.unshift(item);
    recalculateLostFoundMatches(state, currentUser);
    addActivityLog(state, currentUser, 'FOUND_ITEM_REPORTED', 'found-item', item._id, `${item.itemName} reported as found.`);
    item.linkedMatchIds.forEach((matchId) => {
      const match = state.lostFound.matches.find((entry) => entry._id === matchId);
      const lostItem = state.lostFound.lostItems.find((entry) => entry._id === match?.lostItemId);
      if (lostItem) {
        addNotification(state, currentUser._id, 'Potential Owner Detected', `Your found report "${item.itemName}" is linked with a lost report.`, 'match');
        addNotification(state, lostItem.reporterId, 'Potential Match Found', `A new found item may match your lost report "${lostItem.itemName}".`, 'match');
      }
    });
    writeState(state);
    return makeResponse(buildLostFoundItemView(state, item, 'found', currentUser));
  }

  if (url === '/lost-found/claims' && method === 'post') {
    const currentUser = requireUser(config);
    if (currentUser.role !== 'student') throw new Error('Only students can request claims.');

    const pendingClaims = state.lostFound.claims.filter(
      (claim) => claim.claimantId === currentUser._id && claim.status === 'PENDING',
    ).length;
    if (pendingClaims >= 3) {
      throw new Error('Claim limit reached. Resolve current claims before creating more.');
    }

    const foundItem = state.lostFound.foundItems.find((item) => item._id === body.foundItemId);
    const lostItem = state.lostFound.lostItems.find((item) => item._id === body.lostItemId);
    if (!foundItem || !lostItem) throw new Error('Invalid match selection.');

    const existingClaim = state.lostFound.claims.find(
      (claim) => claim.foundItemId === foundItem._id && claim.lostItemId === lostItem._id && claim.status !== 'REJECTED',
    );
    if (existingClaim) throw new Error('A claim already exists for this match.');

    const claim = {
      _id: makeId('claim'),
      lostItemId: lostItem._id,
      foundItemId: foundItem._id,
      claimantId: currentUser._id,
      claimantRole: currentUser.role,
      verificationAnswers: body.verificationAnswers,
      status: 'PENDING',
      reviewerId: '',
      reviewNotes: '',
      handoverSchedule: '',
      completedAt: '',
      createdAt: isoNow(),
      updatedAt: isoNow(),
    };

    state.lostFound.claims.unshift(claim);
    lostItem.status = 'CLAIM_REQUESTED';
    addNotification(state, currentUser._id, 'Claim Submitted', `Your claim for "${foundItem.itemName}" is pending review.`, 'claim');
    addNotification(state, foundItem.reporterId, 'Claim Submitted', `A student has requested claim verification for "${foundItem.itemName}".`, 'claim');
    addNotification(state, state.users.find((user) => user.role === 'warden')._id, 'Claim Requires Review', `New claim submitted for "${foundItem.itemName}".`, 'review');
    addActivityLog(state, currentUser, 'CLAIM_REQUESTED', 'claim', claim._id, `Claim created for ${foundItem.itemName}.`);
    writeState(state);
    return makeResponse(buildClaimView(state, claim));
  }

  if (url.match(/^\/lost-found\/claims\/[^/]+\/review$/) && method === 'patch') {
    const currentUser = requireUser(config);
    if (!['warden', 'admin'].includes(currentUser.role)) throw new Error('Forbidden');
    const claimId = url.split('/')[3];
    const claim = state.lostFound.claims.find((entry) => entry._id === claimId);
    if (!claim) throw new Error('Claim not found.');

    const lostItem = state.lostFound.lostItems.find((item) => item._id === claim.lostItemId);
    const foundItem = state.lostFound.foundItems.find((item) => item._id === claim.foundItemId);

    claim.status = body.status;
    claim.reviewerId = currentUser._id;
    claim.reviewNotes = body.reviewNotes || '';
    claim.handoverSchedule = body.handoverSchedule || '';
    claim.updatedAt = isoNow();

    if (body.status === 'APPROVED') {
      lostItem.status = 'VERIFIED';
      foundItem.status = 'HANDED_OVER';
      addNotification(state, claim.claimantId, 'Claim Approved', `Your claim for "${foundItem.itemName}" was approved. Handover scheduled.`, 'claim');
      addNotification(state, foundItem.reporterId, 'Claim Approved', `Claim for "${foundItem.itemName}" has been approved.`, 'claim');
    } else {
      lostItem.status = lostItem.linkedMatchIds?.length ? 'MATCH_FOUND' : 'OPEN';
      foundItem.status = foundItem.linkedMatchIds?.length ? 'MATCH_LINKED' : 'REPORTED';
      addNotification(state, claim.claimantId, 'Claim Rejected', `Your claim for "${foundItem.itemName}" was rejected.`, 'claim');
    }

    addActivityLog(
      state,
      currentUser,
      `CLAIM_${body.status}`,
      'claim',
      claim._id,
      `Claim ${body.status.toLowerCase()} for ${foundItem.itemName}.`,
    );
    writeState(state);
    return makeResponse(buildClaimView(state, claim));
  }

  if (url.match(/^\/lost-found\/claims\/[^/]+\/complete$/) && method === 'patch') {
    const currentUser = requireUser(config);
    if (!['warden', 'admin'].includes(currentUser.role)) throw new Error('Forbidden');
    const claimId = url.split('/')[3];
    const claim = state.lostFound.claims.find((entry) => entry._id === claimId);
    if (!claim) throw new Error('Claim not found.');
    if (claim.status !== 'APPROVED') throw new Error('Only approved claims can be completed.');

    const lostItem = state.lostFound.lostItems.find((item) => item._id === claim.lostItemId);
    const foundItem = state.lostFound.foundItems.find((item) => item._id === claim.foundItemId);

    claim.completedAt = isoNow();
    claim.updatedAt = isoNow();
    lostItem.status = 'CLOSED';
    foundItem.status = 'CLOSED';

    addNotification(state, claim.claimantId, 'Handover Completed', `Your item handover for "${foundItem.itemName}" has been completed.`, 'handover');
    addNotification(state, foundItem.reporterId, 'Item Handover Completed', `"${foundItem.itemName}" has been handed over successfully.`, 'handover');
    addActivityLog(state, currentUser, 'CLAIM_COMPLETED', 'claim', claim._id, `Handover completed for ${foundItem.itemName}.`);
    writeState(state);
    return makeResponse(buildClaimView(state, claim));
  }

  throw new Error(`Unsupported demo route: ${method.toUpperCase()} ${url}`);
};
