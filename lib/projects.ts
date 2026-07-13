import { supabase } from "./supabase";

export async function createProject(
  title: string,
  description: string
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuario no autenticado");
  }

  const { data, error } = await supabase
    .from("projects")
    .insert([
      {
        creator_id: user.id,
        title,
        description,
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}