import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = 'http://192.168.1.82:3000';

export default function PerfilScreen() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const carregarPerfil = async () => {
      const id = await AsyncStorage.getItem('userId');
      if (id) {
        setUserId(id);
        try {
          const response = await fetch(`${API_URL}/usuarios/${id}`);
          const data = await response.json();
          setNome(data.Nome);
          setEmail(data.Email);
        } catch (error) {
          Alert.alert('Erro', 'Não foi possível carregar os dados do perfil.');
        }
      }
    };
    carregarPerfil();
  }, []);

  const salvarAlteracoes = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`${API_URL}/usuarios/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Nome: nome, Email: email })
      });
      if (!response.ok) throw new Error('Falha ao atualizar');
      Alert.alert('Sucesso', 'Seu perfil foi atualizado no banco de dados!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    }
  };

  const sairDaConta = async () => {
    await AsyncStorage.removeItem('userId');
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#172B4D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: `https://ui-avatars.com/api/?name=${nome || 'User'}&background=0D8ABC&color=fff&size=128` }} 
              style={styles.avatar} 
            />
            <View style={styles.editAvatarBadge}>
              <Feather name="camera" size={14} color="#FFF" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome Completo</Text>
            <View style={styles.inputContainer}>
              <Feather name="user" size={18} color="#6B778C" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                value={nome} 
                onChangeText={setNome} 
                placeholder="Digite seu nome" 
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Endereço de E-mail</Text>
            <View style={styles.inputContainer}>
              <Feather name="mail" size={18} color="#6B778C" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                value={email} 
                onChangeText={setEmail} 
                placeholder="Digite seu e-mail"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
          
          <TouchableOpacity style={styles.saveButton} onPress={salvarAlteracoes}>
            <Feather name="check" size={20} color="#FFF" />
            <Text style={styles.saveButtonText}>Salvar Alterações</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuList}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => Alert.alert('Configurações', 'As preferências da conta estarão disponíveis na próxima atualização.')}
          >
            <Feather name="settings" size={20} color="#6B778C" />
            <Text style={styles.menuText}>Configurações de Conta</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => Alert.alert('Avisos', 'As notificações em tempo real já estão ativadas no seu dispositivo.')}
          >
            <Feather name="bell" size={20} color="#6B778C" />
            <Text style={styles.menuText}>Notificações</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={sairDaConta}>
            <Feather name="log-out" size={20} color="#E11D48" />
            <Text style={[styles.menuText, { color: '#E11D48' }]}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7' },
  header: { 
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 20, 
    backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EBECF0' 
  },
  backButton: { padding: 8, marginRight: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#172B4D' },
  
  profileCard: {
    backgroundColor: '#FFF',
    margin: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
  },
  avatarContainer: { position: 'relative', marginBottom: 24 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#F4F5F7' },
  editAvatarBadge: { 
    position: 'absolute', right: 0, bottom: 0, backgroundColor: '#0079BF', 
    width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', 
    borderWidth: 3, borderColor: '#FFF' 
  },
  
  inputGroup: { width: '100%', marginBottom: 16 },
  label: { fontSize: 13, color: '#6B778C', marginBottom: 6, fontWeight: '600' },
  inputContainer: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFA', 
    borderRadius: 12, borderWidth: 1, borderColor: '#DFE1E6', paddingHorizontal: 12, height: 50 
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 16, color: '#172B4D' },
  
  saveButton: { backgroundColor: '#0079BF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', paddingVertical: 14, borderRadius: 12, marginTop: 8 },
  saveButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },

  menuList: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: '#FAFAFA'
  },
  menuText: { fontSize: 16, color: '#172B4D', marginLeft: 16, fontWeight: '500' }
});