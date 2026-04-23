const express = require('express');
const router = express.Router();
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const Match = require('../models/Match');
const Claim = require('../models/Claim');
const { protect, authorize } = require('../middleware/authMiddleware');

const MATCH_THRESHOLD = 70;

const normalizeText = (value = '') =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tokenize = (value = '') => normalizeText(value).split(' ').filter((token) => token.length > 2);

const jaccardSimilarity = (a = '', b = '') => {
  const setA = new Set(tokenize(a));
  const setB = new Set(tokenize(b));
  if (!setA.size && !setB.size) return 0;
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
  const diffDays = Math.abs(new Date(a).getTime() - new Date(b).getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays <= 1) return 1;
  if (diffDays <= 3) return 0.85;
  if (diffDays <= 7) return 0.65;
  if (diffDays <= 14) return 0.4;
  return 0.15;
};

const computeMatchScore = (lostItem, foundItem) => {
  const categoryScore = lostItem.category === foundItem.category ? 1 : 0;
  const keywordScore = jaccardSimilarity(
    `${lostItem.itemName} ${lostItem.description}`,
    `${foundItem.itemName} ${foundItem.description}`,
  );
  const locationScore = stringSimilarity(lostItem.location, foundItem.location);
  const dateScore = dateProximityScore(lostItem.dateLostOrFound, foundItem.dateLostOrFound);
  const score = Math.round(categoryScore * 40 + keywordScore * 25 + locationScore * 20 + dateScore * 15);

  return {
    score,
    isPotentialMatch: score >= MATCH_THRESHOLD,
    breakdown: {
      category: Math.round(categoryScore * 100),
      keywords: Math.round(keywordScore * 100),
      location: Math.round(locationScore * 100),
      date: Math.round(dateScore * 100),
    },
  };
};

const createUniqueId = (prefix) => `${prefix}-${Date.now().toString().slice(-6)}`;

router.get('/dashboard', protect, async (req, res) => {
  const [lostCount, foundCount, claimCount, matchCount] = await Promise.all([
    LostItem.countDocuments(),
    FoundItem.countDocuments(),
    Claim.countDocuments({ status: 'PENDING' }),
    Match.countDocuments({ score: { $gte: MATCH_THRESHOLD } }),
  ]);

  res.json({
    schema: {
      Users: ['_id', 'role', 'name', 'email', 'hostelId', 'rollNo', 'referenceId'],
      Lost_Items: ['uniqueId', 'itemName', 'category', 'description', 'dateLostOrFound', 'location', 'status', 'reporterId'],
      Found_Items: ['uniqueId', 'itemName', 'category', 'description', 'dateLostOrFound', 'location', 'status', 'reporterId'],
      Matches: ['lostItemId', 'foundItemId', 'score', 'breakdown', 'status'],
      Claims: ['lostItemId', 'foundItemId', 'claimantId', 'verificationAnswers', 'status', 'reviewNotes', 'handoverSchedule'],
    },
    endpoints: [
      'GET /api/lost-found/dashboard',
      'GET /api/lost-found/items',
      'POST /api/lost-found/lost-items',
      'POST /api/lost-found/found-items',
      'GET /api/lost-found/claims',
      'POST /api/lost-found/claims',
      'PATCH /api/lost-found/claims/:id/review',
      'PATCH /api/lost-found/claims/:id/complete',
    ],
    summary: { lostCount, foundCount, claimsPending: claimCount, potentialMatches: matchCount },
  });
});

router.get('/items', protect, async (req, res) => {
  const scope = req.query.scope || (req.user.role === 'student' ? 'mine' : 'all');
  const query = scope === 'mine' ? { reporterId: req.user._id } : {};
  const [lostItems, foundItems] = await Promise.all([
    LostItem.find(query).sort({ createdAt: -1 }),
    FoundItem.find(query).sort({ createdAt: -1 }),
  ]);
  res.json({ lostItems, foundItems });
});

router.post('/lost-items', protect, async (req, res) => {
  const item = await LostItem.create({
    ...req.body,
    uniqueId: createUniqueId('LF-LOST'),
    reporterId: req.user._id,
    reporterRole: req.user.role,
  });
  res.status(201).json(item);
});

router.post('/found-items', protect, async (req, res) => {
  const item = await FoundItem.create({
    ...req.body,
    uniqueId: createUniqueId('LF-FOUND'),
    reporterId: req.user._id,
    reporterRole: req.user.role,
  });
  res.status(201).json(item);
});

router.post('/match/run', protect, authorize('warden', 'admin'), async (req, res) => {
  const [lostItems, foundItems] = await Promise.all([LostItem.find(), FoundItem.find()]);
  const operations = [];

  for (const lostItem of lostItems) {
    for (const foundItem of foundItems) {
      const result = computeMatchScore(lostItem, foundItem);
      if (!result.isPotentialMatch) continue;

      operations.push(
        Match.findOneAndUpdate(
          { lostItemId: lostItem._id, foundItemId: foundItem._id },
          {
            lostItemId: lostItem._id,
            foundItemId: foundItem._id,
            score: result.score,
            breakdown: result.breakdown,
            status: 'Potential Match',
          },
          { new: true, upsert: true },
        ),
      );
    }
  }

  const matches = await Promise.all(operations);
  res.json(matches);
});

router.get('/claims', protect, async (req, res) => {
  const scope = req.query.scope || (req.user.role === 'student' ? 'mine' : 'review');
  const query = scope === 'mine' ? { claimantId: req.user._id } : {};
  const claims = await Claim.find(query)
    .populate('claimantId', 'name role email rollNo')
    .populate('reviewerId', 'name role')
    .populate('lostItemId')
    .populate('foundItemId')
    .sort({ createdAt: -1 });
  res.json(claims);
});

router.post('/claims', protect, authorize('student'), async (req, res) => {
  const pendingClaims = await Claim.countDocuments({ claimantId: req.user._id, status: 'PENDING' });
  if (pendingClaims >= 3) {
    return res.status(400).json({ message: 'Claim limit reached. Resolve current claims before creating more.' });
  }

  const claim = await Claim.create({
    ...req.body,
    claimantId: req.user._id,
    claimantRole: req.user.role,
  });

  await LostItem.findByIdAndUpdate(req.body.lostItemId, { status: 'CLAIM_REQUESTED' });
  res.status(201).json(claim);
});

router.patch('/claims/:id/review', protect, authorize('warden', 'admin'), async (req, res) => {
  const claim = await Claim.findById(req.params.id);
  if (!claim) return res.status(404).json({ message: 'Claim not found' });

  claim.status = req.body.status;
  claim.reviewerId = req.user._id;
  claim.reviewNotes = req.body.reviewNotes || '';
  claim.handoverSchedule = req.body.handoverSchedule || null;
  await claim.save();

  if (req.body.status === 'APPROVED') {
    await LostItem.findByIdAndUpdate(claim.lostItemId, { status: 'VERIFIED' });
    await FoundItem.findByIdAndUpdate(claim.foundItemId, { status: 'HANDED_OVER' });
  }

  if (req.body.status === 'REJECTED') {
    await LostItem.findByIdAndUpdate(claim.lostItemId, { status: 'MATCH_FOUND' });
    await FoundItem.findByIdAndUpdate(claim.foundItemId, { status: 'MATCH_LINKED' });
  }

  res.json(claim);
});

router.patch('/claims/:id/complete', protect, authorize('warden', 'admin'), async (req, res) => {
  const claim = await Claim.findById(req.params.id);
  if (!claim) return res.status(404).json({ message: 'Claim not found' });
  if (claim.status !== 'APPROVED') return res.status(400).json({ message: 'Only approved claims can be completed' });

  claim.completedAt = new Date();
  await claim.save();
  await LostItem.findByIdAndUpdate(claim.lostItemId, { status: 'CLOSED' });
  await FoundItem.findByIdAndUpdate(claim.foundItemId, { status: 'CLOSED' });

  res.json(claim);
});

module.exports = router;
