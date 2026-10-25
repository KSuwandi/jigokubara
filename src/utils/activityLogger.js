import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../services/firebase/config";

export const createActivityLog =
  async ({
    action,
    user,
    role,
    target,
  }) => {

    try {

      await addDoc(
        collection(
          db,
          "activity_logs"
        ),
        {
          action,
          user,
          role,
          target,
          createdAt:
            serverTimestamp(),
        }
      );

    } catch (error) {

      console.error(
        "Activity Log Error:",
        error
      );
    }
  };