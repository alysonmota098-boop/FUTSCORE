import {
  collection,
  doc,
  getDocFromServer,
  onSnapshot,
  setDoc,
  updateDoc,
  serverTimestamp,
  type DocumentData,
} from "firebase/firestore";
import { auth, db } from "./firebase";

enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("offline")) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

export const SCOREBOARD_DOC_PATH = "scoreboard/live";

export interface MatchData {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  timerValue: number; // in seconds (accumulated)
  timerStartedAt: number | null; // ms timestamp
  isTimerRunning: boolean;
  period: string;
  updatedAt?: any;
}

export const defaultMatchData: MatchData = {
  homeTeam: "TIME A",
  awayTeam: "TIME B",
  homeScore: 0,
  awayScore: 0,
  timerValue: 0,
  timerStartedAt: null,
  isTimerRunning: false,
  period: "1º TEMPO",
};
