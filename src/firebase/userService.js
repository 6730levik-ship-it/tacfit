import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './config';

export async function createUserProfile(uid, data) {
  await setDoc(doc(db, 'users', uid), {
    name: data.name || '',
    email: data.email || '',
    photoURL: data.photoURL || '',
    weight: 75,
    height: 175,
    age: 20,
    goal: 'cut',          // cut | bulk | maintain
    workoutDays: 4,       // 3 | 4 | 5
    fitnessLevel: 'intermediate',
    subscriptionStatus: 'trial',
    trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    ...data,
  });
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

export async function updateUserProfile(uid, data) {
  await updateDoc(doc(db, 'users', uid), data);
}

// Save a completed run to Firestore
export async function saveRunToCloud(uid, run) {
  const runRef = doc(db, 'users', uid, 'runs', run.id);
  await setDoc(runRef, run);
}

// Save workout log to Firestore
export async function saveWorkoutLog(uid, log) {
  const ref = doc(db, 'users', uid, 'workouts', log.id);
  await setDoc(ref, log);
}
