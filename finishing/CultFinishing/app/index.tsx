import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = 'http://192.168.1.82:3000';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Erro', 'Por favor, preencha seu e-mail e senha.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Email: email, Senha: senha })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.erro || 'E-mail ou senha incorretos');
      
      await AsyncStorage.setItem('userId', data.usuario.ID.toString());
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Feather name="trello" size={36} color="#0079BF" />
              </View>
              <Text style={styles.title}>Bem-vindo de volta</Text>
              <Text style={styles.subtitle}>Faça login para gerenciar seus projetos.</Text>
            </View>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Seu e-mail"
                placeholderTextColor="#A1A1AA"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              <TextInput
                style={styles.input}
                placeholder="Sua senha"
                placeholderTextColor="#A1A1AA"
                secureTextEntry
                value={senha}
                onChangeText={setSenha}
              />

              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Entrar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Ainda não tem uma conta? </Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={styles.linkText}>Cadastre-se</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7' },
  keyboardView: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  header: { alignItems: 'center', marginBottom: 40 },
  iconContainer: { 
    width: 80, height: 80, backgroundColor: '#E0F2FE', 
    borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 24
  },
  title: { fontSize: 28, fontWeight: '800', color: '#172B4D', letterSpacing: -0.5, marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B778C', textAlign: 'center' },
  form: { gap: 16 },
  input: { 
    backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 16, 
    height: 56, fontSize: 16, color: '#172B4D', borderWidth: 1, borderColor: '#DFE1E6'
  },
  button: { 
    backgroundColor: '#0079BF', height: 56, borderRadius: 12, 
    justifyContent: 'center', alignItems: 'center', marginTop: 8,
    shadowColor: '#0079BF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: '#6B778C', fontSize: 14 },
  linkText: { color: '#0079BF', fontSize: 14, fontWeight: 'bold' }
});