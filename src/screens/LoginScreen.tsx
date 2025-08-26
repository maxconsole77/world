import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { ensureProfileRow } from '../lib/profile';

type Mode = 'signin' | 'signup';

export default function LoginScreen() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    if (!email || !password) return Alert.alert('Accesso', 'Inserisci email e password.');
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // sessione ok → assicura il profilo con default
      await ensureProfileRow();
      // il RootNavigator ascolta onAuthStateChange → ti porta ai tab
    } catch (e:any) {
      Alert.alert('Errore accesso', e?.message ?? 'Impossibile accedere');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async () => {
    if (!email || !password) return Alert.alert('Registrazione', 'Inserisci email e password.');
    if (password.length < 6) return Alert.alert('Registrazione', 'La password deve avere almeno 6 caratteri.');
    if (password !== password2) return Alert.alert('Registrazione', 'Le password non coincidono.');
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      // Se nelle impostazioni Supabase è richiesta conferma email:
      // session può essere null → avvisa l’utente di verificare l’email.
      if (!data.session) {
        Alert.alert(
          'Registrazione',
          'Utente creato. Controlla la tua email per confermare il tuo account, poi accedi.'
        );
        return;
      }

      // Se l’email è già confermata (es. utente creato da dashboard con "Email confirmed"):
      await ensureProfileRow();
    } catch (e:any) {
      Alert.alert('Errore registrazione', e?.message ?? 'Impossibile registrarsi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>World</Text>
      <View style={styles.switchRow}>
        <Pressable onPress={() => setMode('signin')} style={[styles.switchBtn, mode==='signin' && styles.switchActive]}>
          <Text style={[styles.switchTxt, mode==='signin' && styles.switchTxtActive]}>Accedi</Text>
        </Pressable>
        <Pressable onPress={() => setMode('signup')} style={[styles.switchBtn, mode==='signup' && styles.switchActive]}>
          <Text style={[styles.switchTxt, mode==='signup' && styles.switchTxtActive]}>Registrati</Text>
        </Pressable>
      </View>

      <TextInput
        style={styles.input}
        placeholder="email@dominio.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {mode==='signup' && (
        <TextInput
          style={styles.input}
          placeholder="Conferma password"
          secureTextEntry
          value={password2}
          onChangeText={setPassword2}
        />
      )}

      <Pressable style={styles.btn} onPress={mode==='signin' ? signIn : signUp} disabled={loading}>
        <Text style={styles.btnTxt}>{loading ? '...' : (mode==='signin' ? 'Entra' : 'Crea account')}</Text>
      </Pressable>

      {/* Nota: se vuoi, puoi lasciare un link per "Password dimenticata" in seguito */}
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, padding:24, justifyContent:'center', backgroundColor:'#F8F9FA' },
  title:{ fontSize:28, fontWeight:'800', textAlign:'center', marginBottom:16 },
  switchRow:{ flexDirection:'row', alignSelf:'center', backgroundColor:'#E9ECEF', borderRadius:12, marginBottom:16 },
  switchBtn:{ paddingVertical:8, paddingHorizontal:14, borderRadius:12 },
  switchActive:{ backgroundColor:'#0A84FF' },
  switchTxt:{ color:'#0A84FF', fontWeight:'700' },
  switchTxtActive:{ color:'#fff' },
  input:{ marginTop:10, borderWidth:1, borderColor:'#ddd', borderRadius:12, padding:12, backgroundColor:'#fff' },
  btn:{ marginTop:16, backgroundColor:'#0A84FF', padding:14, borderRadius:12, alignItems:'center' },
  btnTxt:{ color:'#fff', fontWeight:'700' }
});

