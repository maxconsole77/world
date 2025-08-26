import React from "react";
import { ScrollView, Text, View } from "react-native";

export default function PrivacyScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 22, marginBottom: 8 }}>Privacy Policy (bozza)</Text>
      <Text>
        Bozza da validare legalmente. World tratta i dati personali secondo il GDPR. Dati: credenziali, lingua, preferenze,
        contenuti generati (foto/video/post) e metadati tecnici. I contenuti possono essere analizzati da sistemi automatici
        per prevenire abusi, con eventuale revisione umana.
      </Text>
      <View style={{ height: 8 }} />
      <Text>
        Finalità: servizi turistici, community e notifiche; sicurezza e prevenzione abusi. Basi giuridiche: contratto,
        legittimo interesse, consenso (ove richiesto). Conservazione: per la durata dell’account o obblighi di legge.
        Diritti: accesso, rettifica, cancellazione, limitazione, opposizione, portabilità. Contatti: privacy@worldapp.example.
      </Text>
    </ScrollView>
  );
}
