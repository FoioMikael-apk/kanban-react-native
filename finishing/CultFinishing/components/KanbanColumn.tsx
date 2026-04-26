import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Atividade } from '../types';
import { AtividadeCard } from './AtividadeCard';

interface Props {
  tituloColuna: string;
  corHeader: string;
  cards: Atividade[];
  onAtualizarStatus: (id: number, novoStatus: Atividade['Status']) => void;
  onEditarAtividade?: (atividade: Atividade) => void;
}

export function KanbanColumn({ tituloColuna, corHeader, cards, onAtualizarStatus, onEditarAtividade }: Props) {
  return (
    <View style={styles.coluna}>
      <View style={styles.headerColuna}>
        <View style={styles.headerColunaLeft}>
          <View style={[styles.dot, { backgroundColor: corHeader }]} />
          <Text style={styles.tituloColuna}>{tituloColuna}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{cards.length}</Text>
        </View>
      </View>
      
      <ScrollView style={styles.scrollColuna} showsVerticalScrollIndicator={false}>
        {cards.map(card => (
          <AtividadeCard key={card.ID.toString()} card={card} onAtualizarStatus={onAtualizarStatus} onEditarAtividade={onEditarAtividade} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  coluna: {
    width: 300,
    backgroundColor: '#F4F5F7',
    marginHorizontal: 8,
    borderRadius: 20,
    padding: 16,
    maxHeight: '95%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  headerColuna: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingHorizontal: 4 },
  headerColunaLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  tituloColuna: { fontSize: 16, fontWeight: '700', color: '#18181B' },
  badge: { backgroundColor: '#E4E4E7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#52525B' },
  scrollColuna: { flex: 1 },
});