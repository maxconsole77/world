import React from "react";
import { ScrollView, Text } from "react-native";

export default function TermsScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 22, marginBottom: 8 }}>Termini d’uso (bozza)</Text>
      <Text>
        1) Accettazione: usando World accetti questi termini. 2) Contenuti: non caricare materiale illegale o lesivo di terzi.
        3) Moderazione: automatica + revisione manuale. 4) Terze parti: mappe/prenotazioni sono soggette ai loro termini.
        5) Chiusura account: possibile in ogni momento; effetti sui contenuti vedi privacy. 6) Legge/foro: da definire con legale.
      </Text>
    </ScrollView>
  );
}
