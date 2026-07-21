"use server";

import { signOut } from "@/auth";

// Sign-out lives in its own server-action module so the client-side
// <UserMenu> dropdown can wire it straight into a <form action={…}>.
// Auth.js's signOut has to run on the server.
export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
