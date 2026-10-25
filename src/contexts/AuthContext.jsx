import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  auth,
  db,
} from "../services/firebase/config";

const AuthContext =
  createContext();

export const useAuth =
  () => useContext(
    AuthContext
  );

const googleProvider =
  new GoogleAuthProvider();

export function AuthProvider({
  children,
}) {

  const [user, setUser] =
    useState(null);

  const [profile, setProfile] =
    useState(null);

  const [role, setRole] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  // =====================================
  // LOGIN
  // =====================================
  const loginWithGoogle =
    async () => {

      try {

        const result =
          await signInWithPopup(
            auth,
            googleProvider
          );

        const firebaseUser =
          result.user;

        const userRef =
          doc(
            db,
            "users",
            firebaseUser.uid
          );

        const userSnap =
          await getDoc(
            userRef
          );

        // =====================================
        // USER BARU
        // =====================================
        if (
          !userSnap.exists()
        ) {

          // EMAIL OYABUN
          const isOyabun =
            firebaseUser.email ===
            "kevinsports05@gmail.com";

          // ROLE DEFAULT
          const newRole =
            isOyabun
              ? "Oyabun"
              : "Pending";

          await setDoc(
            userRef,
            {

              uid:
                firebaseUser.uid,

              // GOOGLE NAME
              name:
                firebaseUser.displayName ||
                "Unknown",

              // RP NAME
              rpName:
                firebaseUser.displayName ||
                "Unknown",

              email:
                firebaseUser.email,

              photo:
                firebaseUser.photoURL ||
                "",

              role:
                newRole,

              debtLimit:
                newRole ===
                "Oyabun"
                  ? 999999999
                  : 500000,

              totalDebt: 0,

              status:
                "Active",

              createdAt:
                serverTimestamp(),
            }
          );
        }

      } catch (error) {

        console.error(
          error
        );

        alert(
          "Failed to login with Google"
        );
      }
    };

  // =====================================
  // LOGOUT
  // =====================================
  const logout =
    async () => {

      try {

        await signOut(
          auth
        );

      } catch (error) {

        console.error(
          error
        );
      }
    };

  // =====================================
  // AUTH LISTENER
  // =====================================
  useEffect(() => {

    let unsubscribeUser =
      null;

    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        async (
          currentUser
        ) => {

          try {

            if (
              currentUser
            ) {

              const userRef =
                doc(
                  db,
                  "users",
                  currentUser.uid
                );

              // REALTIME USER
              unsubscribeUser =
                onSnapshot(
                  userRef,
                  (
                    snapshot
                  ) => {

                    if (
                      snapshot.exists()
                    ) {

                      const userData =
                        snapshot.data();

                      setProfile(
                        userData
                      );

                      setUser({

                        ...currentUser,

                        rpName:
                          userData.rpName ||
                          userData.name ||
                          currentUser.displayName ||
                          "Unknown",

                        photo:
                          userData.photo ||
                          currentUser.photoURL,

                        role:
                          userData.role,
                      });

                      setRole(userData.role);
                    }
                  }
                );

            } else {

              setUser(null);

              setProfile(null);

              setRole(null);
            }

          } catch (error) {

            console.error(
              error
            );
          }

          setLoading(false);
        }
      );

    return () => {

      unsubscribeAuth();

      if (
        unsubscribeUser
      ) {

        unsubscribeUser();
      }
    };

  }, []);

  return (

    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        loading,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}