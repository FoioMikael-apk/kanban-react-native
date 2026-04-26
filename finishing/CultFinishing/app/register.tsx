import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = 'http://192.168.1.82:3000';

export default function RegisterScreen() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos corretamente.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Nome: nome, Email: email, Senha: senha })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.erro || 'Erro ao cadastrar');
      
      Alert.alert('Sucesso', 'Conta criada com sucesso! Faça login.');
      router.back();
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
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Feather name="arrow-left" size={24} color="#0079BF" />
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={styles.title}>Criar Conta</Text>
              <Text style={styles.subtitle}>Comece a organizar suas atividades hoje.</Text>
            </View>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Seu nome completo"
                placeholderTextColor="#A1A1AA"
                value={nome}
                onChangeText={setNome}
              />
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

              <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Cadastrar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Já tem uma conta? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.linkText}>Faça login</Text>
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
  backButton: { position: 'absolute', top: 20, left: 32, zIndex: 10, padding: 8 },
  header: { marginBottom: 40, marginTop: 40 },
  title: { fontSize: 32, fontWeight: '800', color: '#172B4D', letterSpacing: -0.5, marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B778C' },
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