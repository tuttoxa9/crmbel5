import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { firebaseConfig } from "./config";

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

if (typeof window !== "undefined" || process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  if (!getApps().length && firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
  } else if (getApps().length) {
    app = getApp();
  }
  if (app) {
    auth = getAuth(app);
    db = getFirestore(app);
  }
}

export { app, auth, db };
