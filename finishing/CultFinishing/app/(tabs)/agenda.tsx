import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tabs, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Atividade } from '../../types';

const API_URL = 'http://192.168.1.82:3000/atividades';

LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  monthNamesShort: ['Jan.', 'Fev.', 'Mar.', 'Abr.', 'Mai.', 'Jun.', 'Jul.', 'Ago.', 'Set.', 'Out.', 'Nov.', 'Dez.'],
  dayNames: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
  dayNamesShort: ['Dom.', 'Seg.', 'Ter.', 'Qua.', 'Qui.', 'Sex.', 'Sáb.'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

export default function AgendaScreen() {
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [novaData, setNovaData] = useState('');
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [dataFiltro, setDataFiltro] = useState('');

  const [modalEditAtividadeVisible, setModalEditAtividadeVisible] = useState(false);
  const [atividadeEditando, setAtividadeEditando] = useState<Atividade | null>(null);
  const [tituloAtividade, setTituloAtividade] = useState('');
  const [descricaoAtividade, setDescricaoAtividade] = useState('');
  const [isLoadingAtividade, setIsLoadingAtividade] = useState(false);

  const carregarAgenda = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await fetch(`${API_URL}?usuarioId=${userId}`);
      if (!response.ok) throw new Error('Erro na resposta do servidor');
      const data: Atividade[] = await response.json();
      
      setAtividades(data);
    } catch (error) {
      Alert.alert("Ops!", "Não foi possível carregar a agenda.");
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
      
      carregarAgenda();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível avançar a tarefa.");
    }
  };

  const formatarData = (dataString?: string) => {
    if (!dataString) return 'Sem prazo';
    const partes = dataString.split('T')[0].split('-');
    if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
    return dataString;
  };

  const abrirModalData = (id: number, dataAtual?: string) => {
    setIdEditando(id);
    setNovaData(formatarData(dataAtual));
    setModalVisible(true);
  };

  const handleDateChange = (text: string) => {
    let formatado = text.replace(/\D/g, '');
    if (formatado.length > 2) formatado = formatado.replace(/^(\d{2})(\d)/, '$1/$2');
    if (formatado.length > 5) formatado = formatado.replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
    setNovaData(formatado.substring(0, 10));
  };

  const salvarNovaData = async () => {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!regex.test(novaData)) {
      Alert.alert('Formato Inválido', 'Por favor, informe uma data no formato DD/MM/AAAA.');
      return;
    }
    const partes = novaData.split('/');
    const dataFormatoBanco = `${partes[2]}-${partes[1]}-${partes[0]}`;

    try {
      const response = await fetch(`${API_URL}/${idEditando}/data`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ DataLimite: dataFormatoBanco })
      });
      if (!response.ok) throw new Error('Erro ao salvar data');
      setModalVisible(false);
      carregarAgenda();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível modificar o prazo.');
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
      carregarAgenda();
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
            carregarAgenda();
          } catch (error) {
            Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível excluir a tarefa.' });
          } finally {
            setIsLoadingAtividade(false);
          }
      }}
    ]);
  };

  useFocusEffect(
    useCallback(() => {
      carregarAgenda();
    }, [])
  );

  const hoje = new Date().toISOString().split('T')[0];

  const tarefasFiltradas = dataFiltro
    ? atividades.filter(a => a.DataLimite && a.DataLimite.split('T')[0] === dataFiltro)
    : atividades;

  const atrasadas = tarefasFiltradas.filter(a => a.Status !== 'done' && a.DataLimite && a.DataLimite.split('T')[0] < hoje);
  const emPlanejamento = tarefasFiltradas.filter(a => a.Status === 'todo' && (!a.DataLimite || a.DataLimite.split('T')[0] >= hoje));
  const emProgresso = tarefasFiltradas.filter(a => a.Status === 'doing' && (!a.DataLimite || a.DataLimite.split('T')[0] >= hoje));
  const finalizadas = tarefasFiltradas.filter(a => a.Status === 'done');

  const renderCard = (card: Atividade, corBorda: string) => (
    <View key={card.ID.toString()} style={[styles.avisoCard, { borderLeftColor: corBorda }]}>
      <TouchableOpacity style={styles.dataBadge} onPress={() => abrirModalData(card.ID, card.DataLimite)}>
        <Feather name="calendar" size={16} color="#0079BF" />
        <Text style={styles.dataText}>Prazo: {formatarData(card.DataLimite)}</Text>
        <Feather name="edit-2" size={14} color="#0079BF" style={{ marginLeft: 4 }} />
      </TouchableOpacity>
      
      <TouchableOpacity activeOpacity={0.7} onPress={() => abrirModalEditAtividade(card)}>
        <Text style={styles.cardTitulo}>{card.Titulo}</Text>
        
        {(card as any).QuadroNome && (
          <View style={styles.quadroTag}>
            <Feather name="trello" size={12} color="#0079BF" />
            <Text style={styles.quadroTagText}>{(card as any).QuadroNome}</Text>
          </View>
        )}

        <Text style={styles.cardDescricao} numberOfLines={3}>{card.Descricao || 'Sem descrição'}</Text>
      </TouchableOpacity>
      
      <View style={styles.cardFooter}>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>
            {card.Status === 'todo' ? 'A Fazer' : card.Status === 'doing' ? 'Em Andamento' : 'Concluída'}
          </Text>
        </View>
        
        {card.Status === 'todo' && (
          <TouchableOpacity style={styles.actionButton} onPress={() => atualizarStatus(card.ID, 'doing')}>
            <Text style={styles.actionButtonText}>Iniciar Tarefa</Text>
          </TouchableOpacity>
        )}
        {card.Status === 'doing' && (
          <TouchableOpacity style={[styles.actionButton, styles.actionButtonSuccess]} onPress={() => atualizarStatus(card.ID, 'done')}>
            <Text style={styles.actionButtonText}>Concluir</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
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
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.tituloApp}>Agenda</Text>
            <Text style={styles.subtituloApp}>Suas entregas e lembretes.</Text>
          </View>
          <TouchableOpacity style={styles.calendarButton} onPress={() => setMostrarCalendario(!mostrarCalendario)}>
            <Feather name="calendar" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {mostrarCalendario && (
        <View style={styles.calendarWrapper}>
          <Calendar
            onDayPress={(day: any) => {
              setDataFiltro(day.dateString);
              setMostrarCalendario(false);
            }}
            markedDates={{
              [dataFiltro]: { selected: true, selectedColor: '#0079BF' },
              [hoje]: { marked: true, dotColor: '#EF4444' }
            }}
            theme={{ todayTextColor: '#0079BF', arrowColor: '#0079BF' }}
          />
        </View>
      )}

      {dataFiltro !== '' && (
        <View style={styles.activeFilterContainer}>
          <Text style={styles.activeFilterText}>📅 Mostrando: {formatarData(dataFiltro)}</Text>
          <TouchableOpacity style={styles.clearFilterBtn} onPress={() => setDataFiltro('')}>
            <Text style={styles.clearFilterText}>Limpar</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.boardContainer} contentContainerStyle={{ paddingHorizontal: 24, paddingRight: 8 }}>
        <View style={styles.agendaColumn}>
          <View style={[styles.columnHeader, { borderBottomColor: '#6366F1' }]}>
            <Text style={styles.sectionTitle}>Planejamento 📝</Text>
            <View style={styles.badgeCount}><Text style={styles.badgeText}>{emPlanejamento.length}</Text></View>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            {emPlanejamento.length > 0 ? emPlanejamento.map(c => renderCard(c, '#6366F1')) : <Text style={styles.emptyColText}>Nenhuma tarefa.</Text>}
          </ScrollView>
        </View>

        <View style={styles.agendaColumn}>
          <View style={[styles.columnHeader, { borderBottomColor: '#F59E0B' }]}>
            <Text style={styles.sectionTitle}>Em Andamento ⏳</Text>
            <View style={styles.badgeCount}><Text style={styles.badgeText}>{emProgresso.length}</Text></View>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            {emProgresso.length > 0 ? emProgresso.map(c => renderCard(c, '#F59E0B')) : <Text style={styles.emptyColText}>Nenhuma tarefa.</Text>}
          </ScrollView>
        </View>

        <View style={styles.agendaColumn}>
          <View style={[styles.columnHeader, { borderBottomColor: '#10B981' }]}>
            <Text style={styles.sectionTitle}>Finalizadas ✅</Text>
            <View style={styles.badgeCount}><Text style={styles.badgeText}>{finalizadas.length}</Text></View>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            {finalizadas.length > 0 ? finalizadas.map(c => renderCard(c, '#10B981')) : <Text style={styles.emptyColText}>Nenhuma tarefa.</Text>}
          </ScrollView>
        </View>

        <View style={styles.agendaColumn}>
          <View style={[styles.columnHeader, { borderBottomColor: '#EF4444' }]}>
            <Text style={styles.sectionTitle}>Em Atraso 🚨</Text>
            <View style={styles.badgeCount}><Text style={styles.badgeText}>{atrasadas.length}</Text></View>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            {atrasadas.length > 0 ? atrasadas.map(c => renderCard(c, '#EF4444')) : <Text style={styles.emptyColText}>Tudo em dia!</Text>}
          </ScrollView>
        </View>
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Modificar Prazo</Text>
            <Text style={styles.modalSubtitle}>Digite a nova data de entrega:</Text>
            <TextInput
              style={styles.modalInput}
              value={novaData}
              onChangeText={handleDateChange}
              placeholder="DD/MM/AAAA"
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButtonCancel} onPress={() => setModalVisible(false)}><Text style={styles.modalButtonCancelText}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonSave} onPress={salvarNovaData}><Text style={styles.modalButtonSaveText}>Salvar Prazo</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={modalEditAtividadeVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderFlex}>
              <Text style={styles.modalTitle}>Detalhes da Tarefa</Text>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <TouchableOpacity onPress={excluirAtividade}>
                  <Feather name="trash-2" size={24} color="#EF4444" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setModalEditAtividadeVisible(false); setTituloAtividade(''); setDescricaoAtividade(''); }}><Feather name="x" size={24} color="#6B778C" /></TouchableOpacity>
              </View>
            </View>
            <TextInput style={styles.modalInputText} placeholder="Nome da atividade..." placeholderTextColor="#A1A1AA" value={tituloAtividade} onChangeText={setTituloAtividade} />
            <TextInput style={[styles.modalInputText, styles.modalInputArea]} placeholder="Descrição completa..." placeholderTextColor="#A1A1AA" value={descricaoAtividade} onChangeText={setDescricaoAtividade} multiline />
            <TouchableOpacity style={styles.modalButtonSaveFull} onPress={salvarEdicaoAtividade} disabled={isLoadingAtividade}>
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
  headerApp: { paddingHorizontal: 24, marginBottom: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tituloApp: { fontSize: 28, fontWeight: '800', color: '#172B4D', letterSpacing: -0.5 },
  subtituloApp: { fontSize: 16, color: '#6B778C', marginTop: 4 },
  calendarButton: { backgroundColor: '#0079BF', padding: 12, borderRadius: 12 },
  
  calendarWrapper: { marginHorizontal: 24, marginBottom: 16, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
  
  activeFilterContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#E0F2FE', paddingHorizontal: 16, paddingVertical: 12, marginHorizontal: 24, borderRadius: 12, marginBottom: 16 },
  activeFilterText: { color: '#0079BF', fontWeight: 'bold' },
  clearFilterBtn: { backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  clearFilterText: { color: '#0079BF', fontWeight: 'bold', fontSize: 12 },

  boardContainer: { flex: 1 },
  agendaColumn: {
    width: 300,
    backgroundColor: '#EBECF0',
    borderRadius: 12,
    padding: 12,
    marginRight: 16,
    marginBottom: 20,
  },
  columnHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 3, paddingBottom: 8 },
  badgeCount: { backgroundColor: '#DFE1E6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: 'bold', color: '#172B4D' },
  emptyColText: { textAlign: 'center', color: '#6B778C', marginTop: 20, fontSize: 14, fontStyle: 'italic' },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#172B4D',
  },
  
  avisoCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: '#F59E0B'
  },
  dataBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  dataText: { color: '#0079BF', fontWeight: 'bold', fontSize: 14 },
  cardTitulo: { fontSize: 18, fontWeight: 'bold', color: '#172B4D', marginBottom: 4 },
  
  quadroTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E0F2FE', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 8, gap: 6 },
  quadroTagText: { fontSize: 12, color: '#0079BF', fontWeight: 'bold' },

  cardDescricao: { fontSize: 14, color: '#6B778C', marginBottom: 12 },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  statusPill: { backgroundColor: '#DFE1E6', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
  statusText: { fontSize: 12, fontWeight: 'bold', color: '#172B4D' },
  
  actionButton: { backgroundColor: '#0079BF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  actionButtonSuccess: { backgroundColor: '#10B981' },
  actionButtonText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(23, 43, 77, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 24, width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  modalHeaderFlex: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#172B4D', marginBottom: 4 },
  modalSubtitle: { fontSize: 14, color: '#6B778C', marginBottom: 20 },
  modalInput: { backgroundColor: '#F4F5F7', borderRadius: 12, paddingHorizontal: 16, height: 50, fontSize: 16, color: '#172B4D', borderWidth: 1, borderColor: '#DFE1E6', marginBottom: 24, textAlign: 'center', letterSpacing: 2 },
  modalInputText: { backgroundColor: '#F4F5F7', borderRadius: 12, paddingHorizontal: 16, height: 50, fontSize: 16, color: '#172B4D', borderWidth: 1, borderColor: '#DFE1E6', marginBottom: 12 },
  modalInputArea: { height: 150, textAlignVertical: 'top', paddingVertical: 12 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalButtonCancel: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12 },
  modalButtonCancelText: { color: '#6B778C', fontWeight: 'bold', fontSize: 14 },
  modalButtonSave: { backgroundColor: '#0079BF', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
  modalButtonSaveFull: { backgroundColor: '#0079BF', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  modalButtonSaveText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
});