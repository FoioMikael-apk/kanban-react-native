import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Atividade } from '../types';

interface Props {
  card: Atividade;
  onAtualizarStatus: (id: number, novoStatus: Atividade['Status']) => void;
  esconderAvancar?: boolean;
  onEditarAtividade?: (atividade: Atividade) => void;
}

export function AtividadeCard({ card, onAtualizarStatus, esconderAvancar, onEditarAtividade }: Props) {
  const getStatusColor = (status: string) => {
    if (status === 'todo') return '#6366F1';
    if (status === 'doing') return '#F59E0B';
    if (status === 'done') return '#10B981';
    return '#0079BF';
  };

  const formatarDataCurta = (dataString?: string) => {
    if (!dataString) return null;
    const partes = dataString.split('T')[0].split('-');
    if (partes.length === 3) return `${partes[2]}/${partes[1]}`;
    return null;
  };

  return (
    <View style={[styles.card, { borderLeftColor: getStatusColor(card.Status) }]}>
      <TouchableOpacity 
        style={styles.cardContent} 
        activeOpacity={0.7}
        onPress={() => onEditarAtividade && onEditarAtividade(card)}
      >
        <Text style={styles.cardTitulo}>{card.Titulo}</Text>
        {card.Descricao ? <Text style={styles.cardDescricao} numberOfLines={2}>{card.Descricao}</Text> : null}
        
        <View style={styles.tagsContainer}>
          {(card as any).QuadroNome && (
            <View style={styles.badgeData}>
              <Feather name="trello" size={12} color={getStatusColor(card.Status)} />
              <Text style={[styles.badgeDataText, { color: getStatusColor(card.Status) }]} numberOfLines={1}>{(card as any).QuadroNome}</Text>
            </View>
          )}

          {card.Status === 'done' && (card as any).DataConclusao ? (
            <View style={styles.badgeData}>
              <Feather name="check-circle" size={12} color={getStatusColor(card.Status)} />
              <Text style={[styles.badgeDataText, { color: getStatusColor(card.Status) }]}>Feito: {formatarDataCurta((card as any).DataConclusao)}</Text>
            </View>
          ) : card.DataLimite ? (
            <View style={styles.badgeData}>
              <Feather name="clock" size={12} color={getStatusColor(card.Status)} />
              <Text style={[styles.badgeDataText, { color: getStatusColor(card.Status) }]}>{formatarDataCurta(card.DataLimite)}</Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
      
      <View style={styles.areaBotoes}>
        {card.Status !== 'todo' ? (
          <TouchableOpacity 
            style={styles.botaoAcao} 
            onPress={() => onAtualizarStatus(card.ID, card.Status === 'done' ? 'doing' : 'todo')}
          >
            <Feather name="arrow-left" size={18} color="#52525B" />
          </TouchableOpacity>
        ) : <View style={styles.spacer} />}

        {!esconderAvancar && card.Status !== 'done' ? (
          <TouchableOpacity 
            style={styles.botaoAcao} 
            onPress={() => onAtualizarStatus(card.ID, card.Status === 'todo' ? 'doing' : 'done')}
          >
            <Feather name="arrow-right" size={18} color="#52525B" />
          </TouchableOpacity>
        ) : <View style={styles.spacer} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
  },
  cardContent: { marginBottom: 4 },
  cardTitulo: { fontSize: 15, fontWeight: '700', color: '#172B4D', marginBottom: 4 },
  cardDescricao: { fontSize: 13, color: '#6B778C', lineHeight: 18 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  badgeData: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F5F7', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 6, gap: 4, maxWidth: 160 },
  badgeDataText: { fontSize: 11, fontWeight: 'bold', flexShrink: 1 },
  areaBotoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F4F4F5',
  },
  botaoAcao: { padding: 8, backgroundColor: '#FAFAFA', borderRadius: 12 },
  spacer: { width: 34, height: 34 }
});