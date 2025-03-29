import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGameHistory } from '../../../store/gameHistory';

export default function HistoryScreen() {
  const { games, clearHistory } = useGameHistory();

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all game history? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => clearHistory(),
        },
      ]
    );
  };

  if (games.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No games recorded yet</Text>
        <Text style={styles.subtext}>
          Game history will appear here after you calculate payments
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: typeof games[0] }) => (
    <Link href={`/history/${item.id}`} asChild>
      <TouchableOpacity style={styles.gameCard}>
        <View style={styles.gameHeader}>
          <Text style={styles.date}>
            {new Date(item.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#64748b" />
        </View>
        <View style={styles.gameSummary}>
          <Text style={styles.players}>
            {item.players.length} players • ${item.players.reduce((sum, player) => sum + player.buyIn, 0)} total
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.list}
        data={games}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
      {games.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearHistory}
        >
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
          <Text style={styles.clearButtonText}>Clear History</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  text: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  gameCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  gameSummary: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  players: {
    fontSize: 14,
    color: '#64748b',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fef2f2',
    borderTopWidth: 1,
    borderTopColor: '#fecaca',
  },
  clearButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '500',
  },
});