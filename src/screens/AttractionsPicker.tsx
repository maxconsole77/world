import React, { useEffect, useMemo, useState } from "react";
import { Modal, View, Text, Pressable, ScrollView } from "react-native";
import { Poi } from "../navigation/types";

type Props = {
  visible: boolean;
  city: "Roma" | "Parigi" | "Londra";
  data: Record<string, Poi[]>;
  initialSelectedIds?: string[];
  onClose: () => void;
  onSave: (selected: Poi[]) => void;
};

export default function AttractionsPicker({
  visible,
  city,
  data,
  initialSelectedIds = [],
  onClose,
  onSave,
}: Props) {
  const all = useMemo(() => Object.values(data).flat(), [data]);
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelectedIds));

  useEffect(() => { setSelected(new Set(initialSelectedIds)); }, [initialSelectedIds]);

  const toggle = (id: string) => {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelected(s);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, padding: 16, backgroundColor: "#F6F7FB" }}>
        <Text style={{ fontSize: 20, fontWeight: "800", marginBottom: 8 }}>
          Seleziona attrazioni · {city}
        </Text>

        <ScrollView contentContainerStyle={{ paddingBottom: 100, gap: 8 }}>
          {Object.entries(data).map(([family, list]) => (
            <View key={family} style={{ backgroundColor: "white", borderRadius: 12, padding: 12 }}>
              <Text style={{ fontWeight: "700", marginBottom: 8 }}>{family}</Text>
              {list.map((poi) => {
                const checked = selected.has(poi.id);
                return (
                  <Pressable
                    key={poi.id}
                    onPress={() => toggle(poi.id)}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingVertical: 10,
                      borderTopWidth: 1,
                      borderColor: "#F3F4F6",
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>{poi.title}</Text>
                    <View
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 6,
                        borderWidth: 2,
                        borderColor: checked ? "#007AFF" : "#CBD5E1",
                        backgroundColor: checked ? "#007AFF" : "transparent",
                      }}
                    />
                  </Pressable>
                );
              })}
            </View>
          ))}
        </ScrollView>

        <View style={{ position: "absolute", left: 16, right: 16, bottom: 20, flexDirection: "row", gap: 10 }}>
          <Pressable onPress={onClose} style={{ flex: 1, padding: 14, borderRadius: 12, backgroundColor: "#E5E7EB" }}>
            <Text style={{ textAlign: "center", fontWeight: "700" }}>Annulla</Text>
          </Pressable>
          <Pressable
            onPress={() => onSave(all.filter((p) => selected.has(p.id)))}
            style={{ flex: 1, padding: 14, borderRadius: 12, backgroundColor: "#007AFF" }}
          >
            <Text style={{ textAlign: "center", color: "white", fontWeight: "700" }}>Salva</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
