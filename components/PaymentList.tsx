import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Payment = {
  from: string;
  to: string;
  amount: number;
};

type PaymentListProps = {
  payments: Payment[];
};

export default function PaymentList({ payments }: PaymentListProps) {
  if (payments.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No payments to show</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {payments.map((payment, index) => (
        <View key={index} style={styles.paymentRow}>
          <Ionicons name="arrow-forward" size={20} color="#4B7B5C" style={styles.icon} />
          <Text style={styles.paymentText}>
            <Text style={styles.playerName}>{payment.from}</Text> pays{' '}
            <Text style={styles.amount}>${payment.amount.toFixed(2)}</Text> to{' '}
            <Text style={styles.playerName}>{payment.to}</Text>
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  icon: {
    marginRight: 12,
  },
  paymentText: {
    fontSize: 16,
    flex: 1,
  },
  playerName: {
    fontWeight: '600',
    color: '#1e293b',
  },
  amount: {
    color: '#4B7B5C',
    fontWeight: '600',
  },
});