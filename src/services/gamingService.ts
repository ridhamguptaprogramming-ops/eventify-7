import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Tournament, Match } from '../types';

export const seedGamingData = async () => {
  try {
    const tSnap = await getDocs(collection(db, 'tournaments'));
    if (!tSnap.empty) return; // Already seeded

    const tournaments: Omit<Tournament, 'id'>[] = [
      
    ];

    for (const t of tournaments) {
      const docRef = await addDoc(collection(db, 'tournaments'), t);
      
      // Add a dummy match for this tournament
      const match: Omit<Match, 'id'> = {
        tournamentId: docRef.id,
        teamA: { id: 'team1', name: 'ALPHA_SQUAD' },
        teamB: { id: 'team2', name: 'OMEGA_ELITE' },
        scoreA: 12,
        scoreB: 10,
        matchStatus: 'live',
        scheduledAt: Date.now()
      };
      await addDoc(collection(db, 'matches'), match);
    }
    
    console.log('Gaming data seeded successfully');
  } catch (err) {
    console.error('Seeding failed:', err);
  }
};
