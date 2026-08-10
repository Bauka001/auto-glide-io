import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { imageFor } from "@/lib/cars";

export type Conversation = {
  id: string;
  carId: string | null;
  buyerId: string;
  sellerId: string;
  lastMessage: string;
  updatedAt: string;
  car?: { id: string; brand: string; model: string; price: number; image: string } | null;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
};

const SELECT =
  "id,car_id,buyer_id,seller_id,last_message,updated_at,cars(id,brand,model,price,image_key,image_url)";

type Raw = {
  id: string;
  car_id: string | null;
  buyer_id: string;
  seller_id: string;
  last_message: string;
  updated_at: string;
  cars: {
    id: string;
    brand: string;
    model: string;
    price: number;
    image_key: string | null;
    image_url: string | null;
  } | null;
};

function map(r: Raw): Conversation {
  return {
    id: r.id,
    carId: r.car_id,
    buyerId: r.buyer_id,
    sellerId: r.seller_id,
    lastMessage: r.last_message,
    updatedAt: r.updated_at,
    car: r.cars
      ? {
          id: r.cars.id,
          brand: r.cars.brand,
          model: r.cars.model,
          price: r.cars.price,
          image: imageFor(r.cars.image_key, r.cars.image_url),
        }
      : null,
  };
}

/** Every thread the signed-in user takes part in (as buyer or as dealer). */
export function useConversations(enabled: boolean) {
  return useQuery({
    queryKey: ["chat", "conversations"],
    enabled,
    queryFn: async (): Promise<Conversation[]> => {
      const { data, error } = await supabase
        .from("conversations")
        .select(SELECT)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as Raw[]).map(map);
    },
  });
}

export function useConversation(id?: string) {
  return useQuery({
    queryKey: ["chat", "conversation", id],
    enabled: Boolean(id),
    queryFn: async (): Promise<Conversation | null> => {
      const { data, error } = await supabase
        .from("conversations")
        .select(SELECT)
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data ? map(data as unknown as Raw) : null;
    },
  });
}

/** Opens (or reuses) the thread between the signed-in buyer and a car's owner. */
export function useStartConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (carId: string): Promise<string> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("auth");
      const existing = await supabase
        .from("conversations")
        .select("id")
        .eq("car_id", carId)
        .eq("buyer_id", auth.user.id)
        .maybeSingle();
      if (existing.data) return (existing.data as { id: string }).id;

      const car = await supabase
        .from("cars")
        .select("id,owner_id,dealer_id")
        .eq("id", carId)
        .maybeSingle();
      if (car.error) throw car.error;
      const row = car.data as { owner_id: string | null; dealer_id: string | null } | null;
      if (!row?.owner_id) throw new Error("no-seller");
      if (row.owner_id === auth.user.id) throw new Error("own-car");

      const { data, error } = await supabase
        .from("conversations")
        .insert({
          car_id: carId,
          dealer_id: row.dealer_id,
          buyer_id: auth.user.id,
          seller_id: row.owner_id,
        })
        .select("id")
        .single();
      if (error) throw error;
      return (data as { id: string }).id;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["chat", "conversations"] });
    },
  });
}

export function useMessages(conversationId?: string) {
  return useQuery({
    queryKey: ["chat", "messages", conversationId],
    enabled: Boolean(conversationId),
    queryFn: async (): Promise<Message[]> => {
      const { data, error } = await supabase
        .from("messages")
        .select("id,conversation_id,sender_id,body,created_at")
        .eq("conversation_id", conversationId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return ((data ?? []) as {
        id: string;
        conversation_id: string;
        sender_id: string;
        body: string;
        created_at: string;
      }[]).map((m) => ({
        id: m.id,
        conversationId: m.conversation_id,
        senderId: m.sender_id,
        body: m.body,
        createdAt: m.created_at,
      }));
    },
  });
}

export function useSendMessage(conversationId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: string) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user || !conversationId) throw new Error("auth");
      const { error } = await supabase
        .from("messages")
        .insert({ conversation_id: conversationId, sender_id: auth.user.id, body });
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["chat", "messages", conversationId] });
      void qc.invalidateQueries({ queryKey: ["chat", "conversations"] });
    },
  });
}

/** Live updates for a thread. */
export function useMessagesRealtime(conversationId?: string) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          void qc.invalidateQueries({ queryKey: ["chat", "messages", conversationId] });
          void qc.invalidateQueries({ queryKey: ["chat", "conversations"] });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId, qc]);
}
