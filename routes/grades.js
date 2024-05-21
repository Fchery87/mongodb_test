// import express from 'express';
// import db from '../db/conn.js';
// import { ObjectId } from 'mongodb';

// const router = express.Router();

// //+ GET Grades/
// router.get('/', (req, res) => {
//   res.send('Hello from Grades Router');
// });

// //+ POST Grades/
// router.post('/', async (req, res) => {
//   const collection = await db.collection('grades')
//   const newDocument = req.body

//   //! rename fields for backwards compatibility
//   if (newDocument.student_id) {
//     newDocument.learner_id = newDocument.student_id
//     delete newDocument.student_id
//   }

//   const result = await collection.insertOne(newDocument)
//   res.send(result).status(204)
// });



// //+ GET Grades/:id
// router.get('/:id', async (req, res) => {
//   const collection = await db.collection('grades');
//   const query = { _id: new ObjectId(req.params.id) };
//   const result = await collection.findOne(query);

//   if (!result) res.send('Not Found').status(404);
//   else res.send(result).status(200);
// });

// //! GET (grades/student/id) = Redirect to (/grades/learner/id)
// router.get("/student/:id", async (req, res) => {
//   res.redirect(`/grades/learner/${req.params.id}`);
// });

// //+ GET student's grade data (grades/student/id)
// router.get('/learner/:id', async (req, res) => {
//   const collection = await db.collection('grades');
//   const query = { learner_id: Number(req.params.id) };
//   const result = await collection.find(query).toArray();

//   if (!result) res.status(404).json({ message: 'Not Found' });
//   else res.status(200).json(result);
// });

// //+ GET class's grade data (grades/class/id)
// router.get('/class/:id', async (req, res) => {
//   const collection = await db.collection('grades');
//   const query = { class_id: Number(req.params.id) };
//   const result = await collection.find(query).toArray();

//   if (!result) res.status(404).json({ message: 'Not Found' });
//   else res.status(200).json(result);
// });

// export default router;



import express from 'express';
import db from '../db/conn.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

//+ GET route for a specified combination of learner_id and class_id
router.get('/learner/:learner_id/class/:class_id', async (req, res) => {
  const collection = await db.collection('grades');
  const query = {
    learner_id: Number(req.params.learner_id),
    class_id: Number(req.params.class_id)
  };
  const result = await collection.find(query).toArray();

  if (!result || result.length === 0) {
    res.status(404).json({ message: 'No grades found for the specified learner and class combination.' });
  } else {
    res.status(200).json(result);
  }
});

//+ GET route for weighted average score for each class for a learner
router.get('/learner/:learner_id/weighted-average', async (req, res) => {
  const learnerId = Number(req.params.learner_id);
  const weightedAverageScores = await calculateWeightedAverageScoreForLearner(learnerId);

  if (!weightedAverageScores || Object.keys(weightedAverageScores).length === 0) {
    res.status(404).json({ message: 'No grades found for the specified learner.' });
  } else {
    res.status(200).json(weightedAverageScores);
  }
});

//+ GET route for overall weighted average score for a learner
router.get('/learner/:learner_id/overall-weighted-average', async (req, res) => {
  const learnerId = Number(req.params.learner_id);
  const overallWeightedAverageScore = await calculateOverallWeightedAverageScoreForLearner(learnerId);

  if (!overallWeightedAverageScore) {
    res.status(404).json({ message: 'No grades found for the specified learner.' });
  } else {
    res.status(200).json({ overallWeightedAverageScore });
  }
});

//+ GET Grades/
router.get('/', (req, res) => {
  res.send('Hello from Grades Router');
});

//+ POST Grades/
router.post('/', async (req, res) => {
  const collection = await db.collection('grades')
  const newDocument = req.body

  //! rename fields for backwards compatibility
  if (newDocument.student_id) {
    newDocument.learner_id = newDocument.student_id
    delete newDocument.student_id
  }

  const result = await collection.insertOne(newDocument)
  res.send(result).status(204)
});

//+ GET Grades/:id
router.get('/:id', async (req, res) => {
  const collection = await db.collection('grades');
  const query = { _id: new ObjectId(req.params.id) };
  const result = await collection.findOne(query);

  if (!result) res.send('Not Found').status(404);
  else res.send(result).status(200);
});

//! GET (grades/student/id) = Redirect to (/grades/learner/id)
router.get("/student/:id", async (req, res) => {
  res.redirect(`/grades/learner/${req.params.id}`);
});

//+ GET student's grade data (grades/student/id)
router.get('/learner/:id', async (req, res) => {
  const collection = await db.collection('grades');
  const query = { learner_id: Number(req.params.id) };
  const result = await collection.find(query).toArray();

  if (!result) res.status(404).json({ message: 'Not Found' });
  else res.status(200).json(result);
});

//+ GET class's grade data (grades/class/id)
router.get('/class/:id', async (req, res) => {
  const collection = await db.collection('grades');
  const query = { class_id: Number(req.params.id) };
  const result = await collection.find(query).toArray();

  if (!result) res.status(404).json({ message: 'Not Found' });
  else res.status(200).json(result);
});

// Function to calculate weighted average score for a learner
async function calculateWeightedAverageScoreForLearner(learnerId) {
  const collection = await db.collection('grades');
  const grades = await collection.find({ learner_id: learnerId }).toArray();

  if (!grades || grades.length === 0) {
    return null; // Return null if no grade is found for learner
  }

  // Calculate weighted average score for each class
  const weightedAverageScores = {};
  grades.forEach(grade => {
    const classId = grade.class_id.toString(); 

    if (!weightedAverageScores[classId]) {
      weightedAverageScores[classId] = {
        totalScore: 0,
        totalWeight: 0
      };
    }
    weightedAverageScores[classId].totalScore += grade.score * grade.weight;
    weightedAverageScores[classId].totalWeight += grade.weight;
  });

  // Calculate the weighted average score for each class
  for (const classId in weightedAverageScores) {
    const classData = weightedAverageScores[classId];
    if (classData.totalWeight !== 0) {
      classData.averageScore = classData.totalScore / classData.totalWeight;
    } else {
      classData.averageScore = 0; // Avoid division by zero
    }
  }

  return weightedAverageScores;
}


// Placeholder function for calculating overall weighted average score for a learner
async function calculateOverallWeightedAverageScoreForLearner(learnerId) {
  const collection = await db.collection('grades');
  const grades = await collection.find({ learner_id: learnerId }).toArray();

  if (!grades || grades.length === 0) {
    return null; // No grades found for the learner
  }

  let totalScore = 0;
  let totalWeight = 0;

  grades.forEach(grade => {
    totalScore += grade.score * grade.weight;
    totalWeight += grade.weight;
  });

  if (totalWeight === 0) {
    return null; // Avoid division by zero
  }

  const overallWeightedAverageScore = totalScore / totalWeight;
  return overallWeightedAverageScore;
}

export default router;
