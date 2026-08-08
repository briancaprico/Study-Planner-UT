import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch,
  getDocs,
  query
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Subject, StudySession, WeeklyTarget } from '../types';
import { INITIAL_SUBJECTS, getInitialSessions } from '../data/initialData';
import { sortSessionsByDate } from '../utils/dateHelper';

const SUBJECTS_COLL = 'subjects';
const SESSIONS_COLL = 'sessions';
const SETTINGS_COLL = 'settings';

export interface CloudSyncState {
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  error: string | null;
}

// Subscribe to Realtime Updates from Firestore
export const subscribeToSubjects = (
  onData: (subjects: Subject[]) => void,
  onError?: (err: Error) => void
) => {
  return onSnapshot(
    collection(db, SUBJECTS_COLL),
    (snapshot) => {
      const items: Subject[] = [];
      snapshot.forEach((doc) => {
        items.push({ ...doc.data(), id: doc.id } as Subject);
      });
      onData(items);
    },
    (error) => {
      console.error('Firestore subjects subscription error:', error);
      if (onError) onError(error);
    }
  );
};

export const subscribeToSessions = (
  onData: (sessions: StudySession[]) => void,
  onError?: (err: Error) => void
) => {
  return onSnapshot(
    collection(db, SESSIONS_COLL),
    (snapshot) => {
      const items: StudySession[] = [];
      snapshot.forEach((doc) => {
        items.push({ ...doc.data(), id: doc.id } as StudySession);
      });
      onData(sortSessionsByDate(items));
    },
    (error) => {
      console.error('Firestore sessions subscription error:', error);
      if (onError) onError(error);
    }
  );
};

export const subscribeToTarget = (
  onData: (target: WeeklyTarget) => void,
  onError?: (err: Error) => void
) => {
  return onSnapshot(
    doc(db, SETTINGS_COLL, 'weeklyTarget'),
    (docSnap) => {
      if (docSnap.exists()) {
        onData(docSnap.data() as WeeklyTarget);
      }
    },
    (error) => {
      console.error('Firestore target subscription error:', error);
      if (onError) onError(error);
    }
  );
};

// Firestore CRUD operations for Subjects
export const saveSubjectToCloud = async (subject: Subject) => {
  try {
    await setDoc(doc(db, SUBJECTS_COLL, subject.id), subject, { merge: true });
  } catch (err) {
    console.error('Error saving subject to cloud:', err);
    throw err;
  }
};

export const deleteSubjectFromCloud = async (subjectId: string) => {
  try {
    await deleteDoc(doc(db, SUBJECTS_COLL, subjectId));
  } catch (err) {
    console.error('Error deleting subject from cloud:', err);
    throw err;
  }
};

// Firestore CRUD operations for Sessions
export const saveSessionToCloud = async (session: StudySession) => {
  try {
    await setDoc(doc(db, SESSIONS_COLL, session.id), session, { merge: true });
  } catch (err) {
    console.error('Error saving session to cloud:', err);
    throw err;
  }
};

export const deleteSessionFromCloud = async (sessionId: string) => {
  try {
    await deleteDoc(doc(db, SESSIONS_COLL, sessionId));
  } catch (err) {
    console.error('Error deleting session from cloud:', err);
    throw err;
  }
};

// Firestore CRUD operations for WeeklyTarget
export const saveTargetToCloud = async (target: WeeklyTarget) => {
  try {
    await setDoc(doc(db, SETTINGS_COLL, 'weeklyTarget'), target, { merge: true });
  } catch (err) {
    console.error('Error saving target to cloud:', err);
    throw err;
  }
};

// Seed or Sync local data to Cloud if Cloud is empty
export const initializeCloudDataIfEmpty = async (
  localSubjects: Subject[],
  localSessions: StudySession[],
  localTarget: WeeklyTarget
) => {
  try {
    const subjectsSnap = await getDocs(query(collection(db, SUBJECTS_COLL)));
    if (subjectsSnap.empty) {
      console.log('Seeding initial subjects to Firestore...');
      const batch = writeBatch(db);
      const subjectsToUpload = localSubjects.length > 0 ? localSubjects : INITIAL_SUBJECTS;
      subjectsToUpload.forEach((sub) => {
        batch.set(doc(db, SUBJECTS_COLL, sub.id), sub);
      });
      await batch.commit();
    }

    const sessionsSnap = await getDocs(query(collection(db, SESSIONS_COLL)));
    if (sessionsSnap.empty) {
      console.log('Seeding initial sessions to Firestore...');
      const batch = writeBatch(db);
      const sessionsToUpload = localSessions.length > 0 ? localSessions : getInitialSessions();
      sessionsToUpload.forEach((ses) => {
        batch.set(doc(db, SESSIONS_COLL, ses.id), ses);
      });
      await batch.commit();
    }

    await setDoc(doc(db, SETTINGS_COLL, 'weeklyTarget'), localTarget, { merge: true });
  } catch (err) {
    console.warn('Could not auto-initialize cloud data:', err);
  }
};

// Bulk overwrite cloud data (for import or reset)
export const overwriteAllCloudData = async (
  subjects: Subject[],
  sessions: StudySession[],
  target: WeeklyTarget
) => {
  try {
    // Clear existing subjects and sessions from cloud
    const existingSubjects = await getDocs(collection(db, SUBJECTS_COLL));
    const batchDelete = writeBatch(db);
    existingSubjects.forEach((d) => batchDelete.delete(d.ref));
    
    const existingSessions = await getDocs(collection(db, SESSIONS_COLL));
    existingSessions.forEach((d) => batchDelete.delete(d.ref));
    
    await batchDelete.commit();

    // Upload new data
    const batchUpload = writeBatch(db);
    subjects.forEach((s) => batchUpload.set(doc(db, SUBJECTS_COLL, s.id), s));
    sessions.forEach((s) => batchUpload.set(doc(db, SESSIONS_COLL, s.id), s));
    batchUpload.set(doc(db, SETTINGS_COLL, 'weeklyTarget'), target);

    await batchUpload.commit();
  } catch (err) {
    console.error('Error overwriting cloud data:', err);
    throw err;
  }
};
