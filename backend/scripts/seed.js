const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Voice = require('../models/Voice');
const Feedback = require('../models/Feedback');
const students = require('../data/students.json');

const seedUsers = async () => {
  try {
    console.log('🌱 [SEED] Cleaning existing database content...');
    await User.deleteMany({});
    await Complaint.deleteMany({});
    await Voice.deleteMany({});
    await Feedback.deleteMany({});

    console.log('🌱 [SEED] Injecting institutional test accounts...');

    const studentUsers = students
      .map((student) => {
        const regnNo = String(student.regnNo || '').trim();
        return {
          name: student.name || `Student ${regnNo}`,
          email: `${regnNo}@hostelhub.edu`,
          rollNo: regnNo,
          password: regnNo,
          hostelId: student.roomNo ? `Room ${student.roomNo}` : 'Room TBD',
          role: 'student'
        };
      })
      .filter((student) => student.rollNo);

    const testUsers = [
      {
        name: 'System Admin',
        email: 'admin@hostelhub.edu',
        referenceId: '123',
        password: '123',
        role: 'admin'
      },
      {
        name: 'Kajal Khatri',
        email: 'kajal@hostelhub.edu',
        referenceId: 'kajal_k',
        password: '123',
        role: 'warden'
      },
      ...studentUsers,
    ];

    const users = await User.create(testUsers);
    const student = users.find(u => u.role === 'student');
    const warden = users.find(u => u.role === 'warden');

    // Seed Complaints
    const complaints = await Complaint.create([
      {
        studentId: student._id,
        title: 'Water Leakage in Wing B',
        description: 'Large leakage in the ceiling of the second-floor corridor.',
        category: 'Plumbing',
        priority: 'High'
      },
      {
        studentId: student._id,
        title: 'Broken Study Table',
        description: 'The leg of my study table is completely broken.',
        category: 'Maintenance',
        priority: 'Medium'
      }
    ]);

    await Feedback.create([
      {
        type: 'cleaning',
        title: 'Room cleaning feedback',
        prompt: 'Room cleaning round completed. Please rate the cleanliness and staff behavior.',
        studentId: student._id,
        createdBy: warden._id,
        createdByRole: 'warden',
        targetLabel: student.hostelId,
      },
      {
        type: 'complaint-resolution',
        title: 'Complaint resolution feedback',
        prompt: 'Your complaint was marked resolved. Please share whether the fix was satisfactory.',
        studentId: student._id,
        complaintId: complaints[0]._id,
        complaintTitle: complaints[0].title,
        createdBy: warden._id,
        createdByRole: 'system',
        targetLabel: complaints[0].title,
        status: 'Submitted',
        submittedAt: new Date(),
        response: {
          rating: 4,
          satisfaction: 'Satisfied',
          comment: 'The issue was handled well.',
        },
      }
    ]);

    // Seed Voice Hub
    await Voice.create([
      {
        authorId: student._id,
        authorName: student.name,
        hostelName: 'Block A',
        type: 'post',
        content: 'The common room projector has been flickering for a week. Can we get it repaired before the weekend match screening?',
        upvotes: 5,
        isTrending: true
      },
      {
        authorId: student._id,
        authorName: student.name,
        hostelName: 'Block A',
        type: 'poll',
        content: 'Should we extend the library access hours from 10 PM to 12 AM during finals?',
        metadata: {
          options: [
            { label: 'Yes, absolutely', votes: 15 },
            { label: 'No, not necessary', votes: 2 }
          ]
        }
      }
    ]);

    console.log('✅ [SEED] Successfully injected Admin, Warden, Student, and initial content.');
  } catch (error) {
    console.error(`❌ [SEED] FATAL: Seeding failed: ${error.message}`);
  }
};

module.exports = seedUsers;
