import {collection, getDocs, limit, orderBy, query, setDoc, doc, Timestamp} from 'firebase/firestore';
import { db } from '../config/firebase';

export const requestBestScores = async () => {
    try {
        const docRef = collection(db, 'bestScore');
        const q = query(docRef, orderBy('score', 'asc'), limit(30));
        const docSnap = await getDocs(docRef);
    
        return docSnap.docs.map((doc) => doc.data())
    } catch (e) {
        return [];
    }
}

export const requestGenerateBestScore = async ({name, score}: {name: string, score: number}) => {
    try {
        await setDoc(doc(db, 'bestScore', `${name}의 최고 점수`), {
            name,
            score,
            createdAt: Timestamp.fromDate(new Date()),
        })
    } catch (e) {
        console.error(e)
        return '뭐가 잘 안됐음'
    }
}