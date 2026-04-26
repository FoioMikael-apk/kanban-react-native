import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tabs, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { AtividadeCard } from '../../components/AtividadeCard';
import { Atividade } from '../../types';

const API_URL = 'http://192.168.1.82:3000/atividades';

export default function ConcluidosScreen() {
  const [atividades, setAtividades] = useState<Atividade[]>([]);

  const [modalEditAtividadeVisible, setModalEditAtividadeVisible] = useState(false);
  const [atividadeEditando, setAtividadeEditando] = useState<Atividade | null>(null);
  const [tituloAtividade, setTituloAtividade] = useState('');
  const [descricaoAtividade, setDescricaoAtividade] = useState('');
  const [isLoadingAtividade, setIsLoadingAtividade] = useState(false);

  const carregarAtividades = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await fetch(`${API_URL}?usuarioId=${userId}`);
      if (!response.ok) throw new Error('Erro na resposta do servidor');
      const data: Atividade[] = await response.json();
      
      setAtividades(data.filter(item => item.Status === 'done'));
    } catch (error) {
      Alert.alert("Ops!", "Não foi possível carregar as atividades concluídas.");
    }
  };

  const atualizarStatus = async (id: number, novoStatus: Atividade['Status']) => {
    try {
      const response = await fetch(`${API_URL}/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Status: novoStatus })
      });
      
      if (!response.ok) throw new Error('Erro ao atualizar status');
      
      carregarAtividades();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível voltar o card.");
    }
  };

  const abrirModalEditAtividade = (atividade: Atividade) => {
    setAtividadeEditando(atividade);
    setTituloAtividade(atividade.Titulo);
    setDescricaoAtividade(atividade.Descricao || '');
    setModalEditAtividadeVisible(true);
  };

  const salvarEdicaoAtividade = async () => {
    if (!atividadeEditando || tituloAtividade.trim() === '') return;
    setIsLoadingAtividade(true);
    try {
      const response = await fetch(`${API_URL}/${atividadeEditando.ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Titulo: tituloAtividade, Descricao: descricaoAtividade })
      });
      if (!response.ok) throw new Error('Erro ao editar tarefa');
      
      setTituloAtividade(''); setDescricaoAtividade(''); setAtividadeEditando(null);
      setModalEditAtividadeVisible(false);
      Toast.show({ type: 'success', text1: 'Sucesso', text2: 'Tarefa atualizada.' });
      carregarAtividades();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível salvar edições.' });
    } finally {
      setIsLoadingAtividade(false);
    }
  };

  const excluirAtividade = async () => {
    if (!atividadeEditando) return;
    Alert.alert('Excluir Tarefa', 'Tem certeza que deseja excluir esta tarefa?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
          setIsLoadingAtividade(true);
          try {
            const response = await fetch(`${API_URL}/${atividadeEditando.ID}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Erro ao excluir');
            setModalEditAtividadeVisible(false);
            setAtividadeEditando(null);
            Toast.show({ type: 'success', text1: 'Excluída', text2: 'Tarefa apagada com sucesso.' });
            carregarAtividades();
          } catch (error) {
            Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível excluir a tarefa.' });
          } finally {
            setIsLoadingAtividade(false);
          }
      }}
    ]);
  };

  const calcularDesempenho = () => {
    if (atividades.length === 0) {
      return { texto: '-', cor: '#A1A1AA', bg: '#F4F5F7', icone: 'minus' };
    }

    let noPrazo = 0;
    let totalComPrazo = 0;

    atividades.forEach((ativ: any) => {
      if (ativ.DataLimite && ativ.DataConclusao) {
        totalComPrazo++;
        const dataLimite = ativ.DataLimite.split('T')[0];
        const dataConclusao = ativ.DataConclusao.split('T')[0];
        if (dataConclusao <= dataLimite) {
          noPrazo++;
        }
      }
    });

    if (totalComPrazo === 0) {
      if (atividades.length >= 10) return { texto: 'Excelente', cor: '#8B5CF6', bg: '#F5F3FF', icone: 'award' };
      if (atividades.length >= 5) return { texto: 'Muito Bom', cor: '#3B82F6', bg: '#EFF6FF', icone: 'thumbs-up' };
      return { texto: 'Bom', cor: '#10B981', bg: '#ECFDF5', icone: 'star' };
    }

    const taxa = noPrazo / totalComPrazo;

    if (taxa >= 0.8) return { texto: 'Excelente', cor: '#8B5CF6', bg: '#F5F3FF', icone: 'award' };
    if (taxa >= 0.6) return { texto: 'Bom', cor: '#10B981', bg: '#ECFDF5', icone: 'thumbs-up' };
    if (taxa >= 0.4) return { texto: 'Regular', cor: '#F59E0B', bg: '#FFFBEB', icone: 'alert-circle' };
    return { texto: 'Atenção', cor: '#EF4444', bg: '#FEF2F2', icone: 'trending-down' };
  };

  const desempenho = calcularDesempenho();

  useFocusEffect(
    useCallback(() => {
      carregarAtividades();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <Tabs.Screen options={{ 
        tabBarStyle: { backgroundColor: '#F4F5F7', borderTopWidth: 0, elevation: 0, shadowOpacity: 0 },
        tabBarActiveTintColor: '#0079BF',
        tabBarInactiveTintColor: '#A1A1AA'
      }} />
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.headerApp}>
        <Text style={styles.tituloApp}>Relatório de Tarefas</Text>
        <Text style={styles.subtituloApp}>Acompanhe sua produtividade e histórico.</Text>
      </View>

      <View style={styles.dashboardContainer}>
        <View style={styles.statsCard}>
          <View style={styles.iconWrapperSuccess}>
            <Feather name="check-circle" size={24} color="#10B981" />
          </View>
          <Text style={styles.statsValue}>{atividades.length}</Text>
          <Text style={styles.statsLabel}>Total Concluídas</Text>
        </View>
        
        <View style={styles.statsCard}>
          <View style={[styles.iconWrapperAward, { backgroundColor: desempenho.bg }]}>
            <Feather name={desempenho.icone as any} size={24} color={desempenho.cor} />
          </View>
          <Text style={styles.statsValue} adjustsFontSizeToFit numberOfLines={1}>{desempenho.texto}</Text>
          <Text style={styles.statsLabel}>Desempenho</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Histórico de Execução</Text>
      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {atividades.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma atividade concluída ainda.</Text>
        ) : (
          atividades.map(card => (
            <AtividadeCard 
              key={card.ID.toString()} 
              card={card} 
              onAtualizarStatus={atualizarStatus}
              esconderAvancar={true}
              onEditarAtividade={abrirModalEditAtividade}
            />
          ))
        )}
      </ScrollView>

      <Modal visible={modalEditAtividadeVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalhes da Tarefa</Text>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <TouchableOpacity onPress={excluirAtividade}>
                  <Feather name="trash-2" size={24} color="#EF4444" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setModalEditAtividadeVisible(false); setTituloAtividade(''); setDescricaoAtividade(''); }}><Feather name="x" size={24} color="#6B778C" /></TouchableOpacity>
              </View>
            </View>
            <TextInput style={styles.modalInput} placeholder="Nome da atividade..." placeholderTextColor="#A1A1AA" value={tituloAtividade} onChangeText={setTituloAtividade} />
            <TextInput style={[styles.modalInput, styles.modalInputArea]} placeholder="Descrição completa..." placeholderTextColor="#A1A1AA" value={descricaoAtividade} onChangeText={setDescricaoAtividade} multiline />
            <TouchableOpacity style={styles.modalButtonSave} onPress={salvarEdicaoAtividade} disabled={isLoadingAtividade}>
              {isLoadingAtividade ? <ActivityIndicator color="#FFF" /> : <Text style={styles.modalButtonSaveText}>Salvar Alterações</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7', paddingTop: 50 },
  headerApp: { paddingHorizontal: 24, marginBottom: 16 },
  tituloApp: { fontSize: 28, fontWeight: '800', color: '#172B4D', letterSpacing: -0.5 },
  subtituloApp: { fontSize: 16, color: '#6B778C', marginTop: 4 },
  
  dashboardContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 24,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrapperSuccess: { backgroundColor: '#ECFDF5', padding: 10, borderRadius: 12, marginBottom: 12 },
  iconWrapperAward: { backgroundColor: '#F5F3FF', padding: 10, borderRadius: 12, marginBottom: 12 },
  statsValue: { fontSize: 24, fontWeight: 'bold', color: '#172B4D' },
  statsLabel: { fontSize: 13, color: '#6B778C', marginTop: 4 },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#172B4D',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  listContainer: { paddingHorizontal: 24, flex: 1, paddingBottom: 20 },
  emptyText: { textAlign: 'center', color: '#6B778C', marginTop: 40, fontSize: 16 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(23, 43, 77, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 24, width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#172B4D' },
  modalInput: { backgroundColor: '#F4F5F7', borderRadius: 12, paddingHorizontal: 16, height: 50, fontSize: 16, color: '#172B4D', borderWidth: 1, borderColor: '#DFE1E6', marginBottom: 12 },
  modalInputArea: { height: 150, textAlignVertical: 'top', paddingVertical: 12 },
  modalButtonSave: { backgroundColor: '#0079BF', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  modalButtonSaveText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});