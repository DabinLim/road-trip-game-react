import {
  collection, getDocs, limit, orderBy, query, Timestamp, addDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface BestScore {
  name: string;
  score: number;
  createdAt: Timestamp;
}

export const requestBestScores = async () => {
  try {
    const docRef = collection(db, 'bestScore');
    const q = query(docRef, orderBy('score', 'desc'), limit(100));
    const docSnap = await getDocs(q);

    return docSnap.docs.map((data) => data.data()) as BestScore[];
  } catch (e) {
    return [];
  }
};

export const requestGenerateBestScore = async (
  { name, score }: { name: string, score: number },
) => {
  try {
    await addDoc(collection(db, 'bestScore'), {
      name,
      score,
      createdAt: Timestamp.fromDate(new Date()),
    });
    return '뭐가 잘 됐음';
  } catch (e) {
    return '뭐가 잘 안됐음';
  }
};
