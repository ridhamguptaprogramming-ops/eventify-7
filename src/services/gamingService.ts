import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Tournament, Match } from '../types';

export const seedGamingData = async () => {
  try {
    const tSnap = await getDocs(collection(db, 'tournaments'));
    if (!tSnap.empty) return; // Already seeded

    const tournaments: Omit<Tournament, 'id'>[] = [
      {
        gameName: 'VALORANT: PROTOCOL_ZERO',
        prizePool: '$100,000',
        startDate: Date.now() + 86400000 * 5,
        registeredTeamsCount: 64,
        bannerImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80',
        teamSize: 5,
        entryFee: 'FREE',
        status: 'upcoming'
      },
      {
        gameName: 'BGMI: APEX_SQUAD_OPEN',
        prizePool: '$25,000',
        startDate: Date.now() + 86400000 * 2,
        registeredTeamsCount: 128,
        bannerImage: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80',
        teamSize: 4,
        entryFee: '$10',
        status: 'upcoming'
      },
      {
        gameName: 'FIFA 26: VIRTUAL_KICKOFF',
        prizePool: '$5,000',
        startDate: Date.now(),
        registeredTeamsCount: 32,
        bannerImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80',
        teamSize: 1,
        entryFee: 'FREE',
        status: 'live'
      }
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
