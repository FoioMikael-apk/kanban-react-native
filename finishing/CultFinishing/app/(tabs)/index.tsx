import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tabs, useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { KanbanColumn } from '../../components/KanbanColumn';
import { Atividade } from '../../types';

const API_QUADROS = 'http://192.168.1.82:3000/quadros';
const API_ATIVIDADES = 'http://192.168.1.82:3000/atividades';

const CORES_QUADROS = ['#0079BF', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

interface Quadro {
  ID: number;
  Nome: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  const [quadros, setQuadros] = useState<Quadro[]>([]);
  const [nomeQuadro, setNomeQuadro] = useState<string>('');
  const [modalQuadroVisible, setModalQuadroVisible] = useState<boolean>(false);
  const [modalEditQuadroVisible, setModalEditQuadroVisible] = useState<boolean>(false);
  const [isLoadingQuadro, setIsLoadingQuadro] = useState<boolean>(false);

  const [quadroSelecionado, setQuadroSelecionado] = useState<Quadro | null>(null);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [tituloAtividade, setTituloAtividade] = useState<string>('');
  const [descricaoAtividade, setDescricaoAtividade] = useState<string>('');
  const [modalAtividadeVisible, setModalAtividadeVisible] = useState<boolean>(false);
  const [modalEditAtividadeVisible, setModalEditAtividadeVisible] = useState<boolean>(false);
  const [atividadeEditando, setAtividadeEditando] = useState<Atividade | null>(null);
  const [isLoadingAtividade, setIsLoadingAtividade] = useState<boolean>(false);

  const carregarQuadros = async () => {
    setIsLoadingQuadro(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await fetch(`${API_QUADROS}?usuarioId=${userId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detalhes || 'Erro na resposta do servidor');
      }
      const data = await response.json();
      setQuadros(data);
    } catch (error: any) {
      console.error("❌ Erro ao buscar Quadros no Frontend:", error.message);
      Toast.show({ type: 'error', text1: 'Erro de Servidor', text2: error.message });
    } finally {
      setIsLoadingQuadro(false);
    }
  };

  const criarQuadro = async () => {
    if (nomeQuadro.trim() === '') {
      Toast.show({ type: 'error', text1: 'Campo Obrigatório', text2: 'Dê um nome ao seu quadro.' });
      return;
    }
    setIsLoadingQuadro(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await fetch(API_QUADROS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Nome: nomeQuadro, UsuarioId: userId })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detalhes || 'Erro ao criar quadro');
      }
      
      setNomeQuadro('');
      setModalQuadroVisible(false);
      Toast.show({ type: 'success', text1: 'Sucesso!', text2: 'Novo quadro criado.' });
      carregarQuadros();
    } catch (error: any) {
      console.error("❌ Erro ao criar Quadro no Frontend:", error.message);
      Toast.show({ type: 'error', text1: 'Erro', text2: error.message });
      setIsLoadingQuadro(false);
    }
  };

  const salvarEdicaoQuadro = async () => {
    if (!quadroSelecionado || nomeQuadro.trim() === '') return;
    setIsLoadingQuadro(true);
    try {
      const response = await fetch(`${API_QUADROS}/${quadroSelecionado.ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Nome: nomeQuadro })
      });
      if (!response.ok) throw new Error('Erro ao editar quadro');
      
      setQuadroSelecionado({ ...quadroSelecionado, Nome: nomeQuadro });
      setNomeQuadro('');
      setModalEditQuadroVisible(false);
      Toast.show({ type: 'success', text1: 'Sucesso!', text2: 'Quadro renomeado.' });
      carregarQuadros();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível renomear o quadro.' });
    } finally {
      setIsLoadingQuadro(false);
    }
  };

  const excluirQuadro = async () => {
    if (!quadroSelecionado) return;
    Alert.alert('Excluir Quadro', 'Tem certeza que deseja excluir este quadro e todas as suas tarefas?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
          setIsLoadingQuadro(true);
          try {
            const response = await fetch(`${API_QUADROS}/${quadroSelecionado.ID}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Erro ao excluir');
            setModalEditQuadroVisible(false);
            setQuadroSelecionado(null);
            Toast.show({ type: 'success', text1: 'Excluído', text2: 'Quadro apagado com sucesso.' });
            carregarQuadros();
          } catch (error) {
            Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível excluir o quadro.' });
          } finally {
            setIsLoadingQuadro(false);
          }
      }}
    ]);
  };

  const carregarAtividades = async () => {
    if (!quadroSelecionado) return;
    setIsLoadingAtividade(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await fetch(`${API_ATIVIDADES}?quadroId=${quadroSelecionado.ID}&usuarioId=${userId}`);
      if (!response.ok) throw new Error('Erro na resposta');
      const data = await response.json();
      setAtividades(data);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível carregar as tarefas do quadro.' });
    } finally {
      setIsLoadingAtividade(false);
    }
  };

  const adicionarAtividade = async () => {
    if (tituloAtividade.trim() === '') {
      Toast.show({ type: 'error', text1: 'Aviso', text2: 'O título não pode estar vazio.' });
      return;
    }
    setIsLoadingAtividade(true);
    
    const dataPrazo = new Date();
    dataPrazo.setDate(dataPrazo.getDate() + 7);
    const stringDataPrazo = dataPrazo.toISOString().split('T')[0];

    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await fetch(API_ATIVIDADES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Titulo: tituloAtividade, Descricao: descricaoAtividade, DataLimite: stringDataPrazo, Status: 'todo', QuadroId: quadroSelecionado?.ID, UsuarioId: userId
        })
      });
      if (!response.ok) throw new Error('Erro ao salvar');
      
      setTituloAtividade(''); setDescricaoAtividade(''); setModalAtividadeVisible(false);
      Toast.show({ type: 'success', text1: 'Sucesso', text2: 'Tarefa adicionada.' });
      carregarAtividades();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível salvar a tarefa.' });
    } finally {
      setIsLoadingAtividade(false);
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
      const response = await fetch(`${API_ATIVIDADES}/${atividadeEditando.ID}`, {
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
            const response = await fetch(`${API_ATIVIDADES}/${atividadeEditando.ID}`, { method: 'DELETE' });
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

  const atualizarStatus = async (idTarefa: number, novoStatus: Atividade['Status']) => {
    try {
      const response = await fetch(`${API_ATIVIDADES}/${idTarefa}/status`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ Status: novoStatus })
      });
      if (!response.ok) throw new Error('Erro ao atualizar');
      carregarAtividades();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível mover a tarefa.' });
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', () => {
      setQuadroSelecionado(null);
    });
    return unsubscribe;
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      if (quadroSelecionado) {
        carregarAtividades();
      } else {
        carregarQuadros();
      }
    }, [quadroSelecionado])
  );

  if (quadroSelecionado) {
    const indexQuadro = quadros.findIndex(q => q.ID === quadroSelecionado.ID);
    const corFundo = CORES_QUADROS[indexQuadro >= 0 ? indexQuadro % CORES_QUADROS.length : 0];

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: corFundo }]}>
        <Tabs.Screen options={{ 
          tabBarStyle: { backgroundColor: corFundo, borderTopColor: corFundo, elevation: 0, shadowOpacity: 0 },
          tabBarActiveTintColor: '#FFF',
          tabBarInactiveTintColor: 'rgba(255,255,255,0.5)'
        }} />
        <StatusBar barStyle="light-content" backgroundColor={corFundo} />
        
        <View style={styles.boardHeader}>
          <TouchableOpacity onPress={() => setQuadroSelecionado(null)} style={styles.backButtonBoard}>
            <Feather name="trello" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.tituloAppBranco} numberOfLines={1}>{quadroSelecionado.Nome}</Text>
            <Text style={styles.subtituloBoard}>{atividades.length} {atividades.length === 1 ? 'tarefa' : 'tarefas'} no quadro</Text>
          </View>
          <TouchableOpacity style={styles.iconButtonBoard} onPress={() => {
            setNomeQuadro(quadroSelecionado.Nome);
            setModalEditQuadroVisible(true);
          }}>
            <Feather name="edit-2" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.boardContainer}>
          <KanbanColumn tituloColuna="Planejamento" corHeader="#EBECF0" cards={atividades.filter(a => a.Status === 'todo')} onAtualizarStatus={atualizarStatus} onEditarAtividade={abrirModalEditAtividade} />
          <KanbanColumn tituloColuna="Em Andamento" corHeader="#EBECF0" cards={atividades.filter(a => a.Status === 'doing')} onAtualizarStatus={atualizarStatus} onEditarAtividade={abrirModalEditAtividade} />
          <KanbanColumn tituloColuna="Concluído" corHeader="#EBECF0" cards={atividades.filter(a => a.Status === 'done')} onAtualizarStatus={atualizarStatus} onEditarAtividade={abrirModalEditAtividade} />
        </ScrollView>

        <TouchableOpacity style={[styles.fabExtended, { shadowColor: '#000' }]} onPress={() => setModalAtividadeVisible(true)}>
          <Feather name="plus" size={24} color={corFundo} />
          <Text style={[styles.fabExtendedText, { color: corFundo }]}>Nova Tarefa</Text>
        </TouchableOpacity>

        <Modal visible={modalAtividadeVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Nova Tarefa</Text>
                <TouchableOpacity onPress={() => { setModalAtividadeVisible(false); setTituloAtividade(''); setDescricaoAtividade(''); }}><Feather name="x" size={24} color="#6B778C" /></TouchableOpacity>
              </View>
              <TextInput style={styles.modalInput} placeholder="Nome da atividade..." placeholderTextColor="#A1A1AA" value={tituloAtividade} onChangeText={setTituloAtividade} />
              <TextInput style={[styles.modalInput, styles.modalInputArea]} placeholder="Descrição..." placeholderTextColor="#A1A1AA" value={descricaoAtividade} onChangeText={setDescricaoAtividade} multiline />
              <TouchableOpacity style={styles.modalButtonSave} onPress={adicionarAtividade} disabled={isLoadingAtividade}>
                {isLoadingAtividade ? <ActivityIndicator color="#FFF" /> : <Text style={styles.modalButtonSaveText}>Criar Tarefa</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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
              <TextInput style={[styles.modalInput, styles.modalInputArea]} placeholder="Descrição..." placeholderTextColor="#A1A1AA" value={descricaoAtividade} onChangeText={setDescricaoAtividade} multiline />
              <TouchableOpacity style={styles.modalButtonSave} onPress={salvarEdicaoAtividade} disabled={isLoadingAtividade}>
                {isLoadingAtividade ? <ActivityIndicator color="#FFF" /> : <Text style={styles.modalButtonSaveText}>Salvar Alterações</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={modalEditQuadroVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Renomear Quadro</Text>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <TouchableOpacity onPress={excluirQuadro}>
                    <Feather name="trash-2" size={24} color="#EF4444" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setModalEditQuadroVisible(false); setNomeQuadro(''); }}><Feather name="x" size={24} color="#6B778C" /></TouchableOpacity>
                </View>
              </View>
              <TextInput style={styles.modalInput} placeholder="Novo nome do Quadro..." placeholderTextColor="#6B778C" value={nomeQuadro} onChangeText={setNomeQuadro} />
              <TouchableOpacity style={styles.modalButtonSave} onPress={salvarEdicaoQuadro} disabled={isLoadingQuadro}>
                {isLoadingQuadro ? <ActivityIndicator color="#FFF" /> : <Text style={styles.modalButtonSaveText}>Salvar Novo Nome</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Tabs.Screen options={{ 
        tabBarStyle: { backgroundColor: '#F4F5F7', borderTopWidth: 0, elevation: 0, shadowOpacity: 0 },
        tabBarActiveTintColor: '#0079BF',
        tabBarInactiveTintColor: '#A1A1AA'
      }} />
      <StatusBar barStyle="dark-content" backgroundColor="#F4F5F7" />
      
      <View style={styles.headerApp}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.tituloApp}>Área de Trabalho</Text>
            <Text style={styles.subtituloApp}>Seus quadros de projetos.</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/perfil')}>
            <Image source={{ uri: 'https://ui-avatars.com/api/?name=Mikael&background=0D8ABC&color=fff' }} style={styles.profilePic} />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {quadros.length === 0 ? (
          <Text style={styles.emptyText}>Você ainda não possui nenhum quadro.</Text>
        ) : (
          quadros.map((quadro, index) => (
            <TouchableOpacity key={quadro.ID.toString()} style={[styles.quadroCard, { borderLeftColor: CORES_QUADROS[index % CORES_QUADROS.length] }]} onPress={() => setQuadroSelecionado(quadro)}>
              <Text style={styles.quadroNome}>{quadro.Nome}</Text>
              <Feather name="chevron-right" size={20} color="#6B778C" />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setModalQuadroVisible(true)}>
        <Feather name="plus" size={28} color="#FFF" />
      </TouchableOpacity>

      <Modal visible={modalQuadroVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo Quadro</Text>
              <TouchableOpacity onPress={() => setModalQuadroVisible(false)}>
                <Feather name="x" size={24} color="#6B778C" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Nome do Quadro (ex: Faculdade)"
              placeholderTextColor="#6B778C"
              value={nomeQuadro}
              onChangeText={setNomeQuadro}
            />
            
            <TouchableOpacity style={styles.modalButtonSave} onPress={criarQuadro} disabled={isLoadingQuadro}>
              {isLoadingQuadro ? <ActivityIndicator color="#FFF" /> : <Text style={styles.modalButtonSaveText}>Criar Quadro</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7', paddingTop: 12 },
  headerApp: { paddingHorizontal: 24, marginBottom: 24 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  profilePic: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#0079BF' },
  tituloApp: { fontSize: 28, fontWeight: '800', color: '#172B4D', letterSpacing: -0.5 },
  tituloAppBranco: { fontSize: 24, fontWeight: '800', color: '#FFF' },
  subtituloApp: { fontSize: 16, color: '#6B778C', marginTop: 4 },
  iconButton: { padding: 8 },
  
  listContainer: { paddingHorizontal: 24, flex: 1 },
  emptyText: { textAlign: 'center', color: '#6B778C', marginTop: 40, fontSize: 16 },
  boardContainer: { paddingHorizontal: 8, paddingBottom: 20 },
  
  quadroCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3, borderLeftWidth: 5 },
  quadroNome: { fontSize: 18, fontWeight: 'bold', color: '#172B4D' },
  
  fab: { position: 'absolute', bottom: 24, right: 24, backgroundColor: '#0079BF', width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', shadowColor: '#0079BF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6, zIndex: 100 },
  
  boardHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, backgroundColor: 'rgba(0,0,0,0.15)', marginBottom: 20 },
  backButtonBoard: { padding: 8, marginRight: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
  iconButtonBoard: { padding: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
  subtituloBoard: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 2, fontWeight: '500' },
  fabExtended: { position: 'absolute', bottom: 24, right: 24, backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 32, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6, zIndex: 100 },
  fabExtendedText: { fontWeight: 'bold', fontSize: 16, marginLeft: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(23, 43, 77, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 24, width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#172B4D' },
  modalInput: { backgroundColor: '#F4F5F7', borderRadius: 12, paddingHorizontal: 16, height: 50, fontSize: 16, color: '#172B4D', borderWidth: 1, borderColor: '#DFE1E6', marginBottom: 12 },
  modalInputArea: { height: 150, textAlignVertical: 'top', paddingVertical: 12 },
  modalButtonSave: { backgroundColor: '#0079BF', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  modalButtonSaveText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
