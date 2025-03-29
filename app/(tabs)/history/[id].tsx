import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import PaymentList from '../../../components/PaymentList';
import { useGameHistory } from '../../../store/gameHistory';

export default function GameDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { games } = useGameHistory();
  const game = games.find(g => g.id === id);

  if (!game) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Game not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.date}>
          {new Date(game.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>

        {game.expense && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Expense</Text>
            <View style={styles.expenseCard}>
              <Text style={styles.expenseText}>
                <Text style={styles.expensePayer}>{game.expense.payer}</Text> paid{' '}
                <Text style={styles.expenseAmount}>${game.expense.amount.toFixed(2)}</Text>
              </Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Players</Text>
          {game.players.map((player, index) => (
            <View key={index} style={styles.playerCard}>
              <Text style={styles.playerName}>{player.name}</Text>
              <View style={styles.playerStats}>
                <Text style={styles.statLabel}>Buy-in:</Text>
                <Text style={styles.statValue}>${player.buyIn}</Text>
                <Text style={styles.statLabel}>Cash-out:</Text>
                <Text style={styles.statValue}>${player.cashOut}</Text>
                <Text style={styles.statLabel}>Net:</Text>
                <Text 
                  style={[
                    styles.statValue, 
                    { color: player.cashOut - player.buyIn >= 0 ? '#4B7B5C' : '#ef4444' }
                  ]}
                >
                  ${(player.cashOut - player.buyIn).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payments</Text>
          <PaymentList payments={game.payments} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
  },
  date: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 24,
  },
  error: {
    fontSize: 18,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  expenseCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  expenseText: {
    fontSize: 16,
    color: '#1e293b',
  },
  expensePayer: {
    fontWeight: '600',
  },
  expenseAmount: {
    color: '#4B7B5C',
    fontWeight: '600',
  },
  playerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  playerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  playerStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    marginRight: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginRight: 12,
  },
});