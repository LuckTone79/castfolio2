import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { initializeApp, type FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";

type ServerFirebaseConfig = FirebaseOptions & {
  firestoreDatabaseId?: string;
};

function loadFirebaseConfig(): ServerFirebaseConfig {
  const configFromEnv: ServerFirebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    firestoreDatabaseId: process.env.FIREBASE_FIRESTORE_DATABASE_ID,
  };

  if (configFromEnv.projectId && configFromEnv.apiKey && configFromEnv.appId) {
    console.log("[firebase.server] Loaded Firebase config from env");
    return configFromEnv;
  }

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const configPath = path.resolve(__dirname, "../firebase-applet-config.json");

  if (!existsSync(configPath)) {
    throw new Error(
      "firebase-applet-config.json 파일을 찾을 수 없습니다. 배포 패키지 포함 여부 또는 FIREBASE_* 환경변수를 확인하세요.",
    );
  }

  console.log("[firebase.server] Loaded Firebase config from json", { configPath });
  const rawConfig = readFileSync(configPath, "utf-8");
  return JSON.parse(rawConfig) as ServerFirebaseConfig;
}

const firebaseConfig = loadFirebaseConfig();
const app = initializeApp(firebaseConfig);

export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);
