/* Contexto de autenticação com Google (Firebase Auth); sem foto, usa avatar gerado pelas iniciais */
import { createContext, ReactNode, useEffect, useState } from "react";
import { auth, firebase, isFirebaseConfigured } from "../services/firebase";

export type User = { id: string; name: string; avatar: string };

type AuthContextType = {
  user: User | undefined;
  ready: boolean;
  signInWithGoogle: () => Promise<User | undefined>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext({} as AuthContextType);

/* Avatar local (SVG com iniciais) quando a conta não tem foto — sem enviar o nome a terceiros */
export function initialsAvatar(name: string): string {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" rx="32" fill="#6b3fe0"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="26" fill="#fff">${initials}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/* Converte o usuário do Firebase no formato da aplicação */
function toUser(u: firebase.User): User {
  const name = u.displayName || "Participante";
  return { id: u.uid, name, avatar: u.photoURL || initialsAvatar(name) };
}

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>();
  const [ready, setReady] = useState(!isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) return undefined;
    return auth.onAuthStateChanged((u) => {
      setUser(u ? toUser(u) : undefined);
      setReady(true);
    });
  }, []);

  /* Abre o popup do Google e devolve o usuário autenticado */
  async function signInWithGoogle() {
    const result = await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    const signed = result.user ? toUser(result.user) : undefined;
    setUser(signed);
    return signed;
  }

  /* Encerra a sessão */
  async function signOut() {
    await auth.signOut();
    setUser(undefined);
  }

  return <AuthContext.Provider value={{ user, ready, signInWithGoogle, signOut }}>{children}</AuthContext.Provider>;
}
/* Fim de AuthContext.tsx */
