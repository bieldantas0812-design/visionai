import { db } from '../firebase';
import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';

export async function seedInitialData(adminEmail: string) {
  try {
    // 1. Create Default Plans
    const plans = [
      {
        id: 'plan_free',
        name: 'Free',
        description: 'Experimente nossa tecnologia com alguns créditos iniciais.',
        price: 0,
        initialCredits: 5,
        active: true,
        order: 0,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'plan_starter',
        name: 'Starter',
        description: 'Ideal para entusiastas e criadores ocasionais.',
        price: 49.90,
        initialCredits: 50,
        active: true,
        order: 1,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'plan_pro',
        name: 'Pro',
        description: 'Para profissionais que precisam de alta demanda criativa.',
        price: 99.90,
        initialCredits: 150,
        active: true,
        order: 2,
        createdAt: new Date().toISOString(),
      }
    ];

    for (const plan of plans) {
      await setDoc(doc(db, 'plans', plan.id), plan);
    }

    console.log("Planos iniciais criados com sucesso.");
    return true;
  } catch (error) {
    console.error("Erro ao semear dados:", error);
    throw error;
  }
}
