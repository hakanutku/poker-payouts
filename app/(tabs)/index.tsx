import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Image,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import PlayerInput from '../../components/PlayerInput';
import PaymentList from '../../components/PaymentList';
import ExpenseInput from '../../components/ExpenseInput';
import { useGameHistory } from '../../store/gameHistory';

type Player = {
  id: string;
  name: string;
  buyIn: string;
  cashOut: string;
};

type Payment = {
  from: string;
  to: string;
  amount: number;
};

type Expense = {
  id: string;
  title: string;
  amount: string;
  payerId: string;
};

export default function CalculatorScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: '', buyIn: '', cashOut: '' },
    { id: '2', name: '', buyIn: '', cashOut: '' },
  ]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showExpenses, setShowExpenses] = useState(false);
  const { addGame } = useGameHistory();

  const { totalBuyIn, totalCashOut, hasDiscrepancy } = React.useMemo(() => {
    const buyInSum = players.reduce((sum, player) => {
      const buyIn = parseFloat(player.buyIn) || 0;
      return sum + buyIn;
    }, 0);

    const cashOutSum = players.reduce((sum, player) => {
      const cashOut = parseFloat(player.cashOut) || 0;
      return sum + cashOut;
    }, 0);

    return {
      totalBuyIn: buyInSum,
      totalCashOut: cashOutSum,
      hasDiscrepancy: Math.abs(buyInSum - cashOutSum) > 0.01,
    };
  }, [players]);

  const addPlayer = () => {
    setPlayers([
      ...players,
      {
        id: Date.now().toString(),
        name: '',
        buyIn: '',
        cashOut: '',
      },
    ]);
  };

  const removePlayer = (id: string) => {
    if (players.length <= 2) {
      Alert.alert('Error', 'Minimum 2 players required');
      return;
    }
    setPlayers(players.filter((p) => p.id !== id));
    setExpenses(expenses.filter(e => e.payerId !== id));
  };

  const updatePlayer = (
    id: string,
    field: 'name' | 'buyIn' | 'cashOut',
    value: string
  ) => {
    setPlayers(
      players.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      )
    );
  };

  const addExpense = () => {
    setExpenses([
      ...expenses,
      {
        id: Date.now().toString(),
        title: '',
        amount: '',
        payerId: '',
      },
    ]);
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const updateExpense = (
    id: string,
    field: keyof Expense,
    value: string
  ) => {
    setExpenses(expenses.map(e =>
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  const calculatePayments = () => {
    // Validate inputs
    const invalidPlayers = players.filter(
      (p) => !p.name || !p.buyIn || !p.cashOut
    );
    if (invalidPlayers.length > 0) {
      Alert.alert('Error', 'Please fill in all player information');
      return;
    }

    // First calculate initial balances without expenses
    const initialBalances = players.map(p => ({
      name: p.name,
      cashOut: parseFloat(p.cashOut),
      buyIn: parseFloat(p.buyIn),
      profit: parseFloat(p.cashOut) - parseFloat(p.buyIn),
      id: p.id
    }));

    // Calculate total profit (only from winners)
    const totalProfit = initialBalances.reduce((sum, player) => 
      sum + Math.max(0, player.profit), 0);

    // Process each expense
    const balances = initialBalances.map(player => {
      let adjustedCashOut = player.cashOut;

      // For each expense where this player is a winner
      if (player.profit > 0) {
        expenses.forEach(expense => {
          if (!expense.amount || !expense.payerId) return; // Skip invalid expenses
          const expenseAmount = parseFloat(expense.amount) || 0;
          if (expenseAmount > 0) {
            const expenseShare = (player.profit / totalProfit) * expenseAmount;
            adjustedCashOut -= expenseShare;
          }
        });
      }

      // Add back expenses this player paid for
      expenses.forEach(expense => {
        if (expense.payerId === player.id && expense.amount) {
          adjustedCashOut += parseFloat(expense.amount) || 0;
        }
      });

      return {
        name: player.name,
        balance: adjustedCashOut - player.buyIn
      };
    });

    // Sort by balance
    const positiveBalances = balances
      .filter((b) => b.balance > 0)
      .sort((a, b) => b.balance - a.balance);
    const negativeBalances = balances
      .filter((b) => b.balance < 0)
      .sort((a, b) => a.balance - b.balance);

    // Calculate payments with rounding
    const newPayments: Payment[] = [];
    let i = 0;
    let j = 0;

    // Keep track of remaining unrounded amounts
    const remainingNegative = [...negativeBalances];
    const remainingPositive = [...positiveBalances];

    while (i < negativeBalances.length && j < positiveBalances.length) {
      const debt = Math.abs(remainingNegative[i].balance);
      const credit = remainingPositive[j].balance;
      const amount = Math.min(debt, credit);

      // Round the payment amount to nearest dollar
      const roundedAmount = Math.round(amount);

      // Add the payment
      newPayments.push({
        from: negativeBalances[i].name,
        to: positiveBalances[j].name,
        amount: roundedAmount,
      });

      // Update remaining balances with the exact (unrounded) amount
      remainingNegative[i].balance += amount;
      remainingPositive[j].balance -= amount;

      // Move to next player if their balance is close to zero
      if (Math.abs(remainingNegative[i].balance) < 0.01) i++;
      if (Math.abs(remainingPositive[j].balance) < 0.01) j++;
    }

    setPayments(newPayments);

    // Save to game history
    const gameData = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      players: players.map(p => ({
        name: p.name,
        buyIn: parseFloat(p.buyIn),
        cashOut: parseFloat(p.cashOut),
      })),
      expenses: expenses
        .filter(e => e.amount && e.payerId) // Only include valid expenses
        .map(e => ({
          title: e.title || undefined,
          amount: parseFloat(e.amount),
          payer: players.find(p => p.id === e.payerId)?.name || '',
        })),
      payments: newPayments,
    };

    addGame(gameData);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/images/logo.png')}
              style={[{ width: windowWidth }]}
              resizeMode="contain"
            />
          </View>

          <View style={styles.playersContainer}>
            <Text style={styles.sectionTitle}>Players</Text>
            {players.map((player, index) => (
              <PlayerInput
                key={player.id}
                player={player}
                onUpdate={updatePlayer}
                onRemove={removePlayer}
                showLabels={index === 0}
                canDelete={players.length > 2}
              />
            ))}
            <TouchableOpacity
              style={styles.addButton}
              onPress={addPlayer}>
              <Ionicons name="add-circle" size={24} color="#4B7B5C" />
              <Text style={styles.addButtonText}>Add Player</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.addButton,
              styles.expenseButton,
              showExpenses && styles.expenseButtonActive
            ]}
            onPress={() => {
              setShowExpenses(!showExpenses);
              if (!showExpenses && expenses.length === 0) {
                addExpense();
              }
            }}>
            <Ionicons 
              name={showExpenses ? "remove-circle" : "add-circle"} 
              size={24} 
              color="#4B7B5C" 
            />
            <Text style={styles.addButtonText}>
              {showExpenses ? "Hide Expenses" : "Add Expenses"}
            </Text>
          </TouchableOpacity>

          {showExpenses && (
            <View style={styles.expensesContainer}>
              <Text style={styles.sectionTitle}>Expenses</Text>
              {expenses.map((expense, index) => (
                <ExpenseInput
                  key={expense.id}
                  expense={expense}
                  players={players}
                  onUpdate={(field, value) => updateExpense(expense.id, field, value)}
                  onRemove={() => removeExpense(expense.id)}
                  showLabels={index === 0}
                  canDelete={expenses.length > 1}
                />
              ))}
              <TouchableOpacity
                style={[styles.addButton, styles.addExpenseButton]}
                onPress={addExpense}>
                <Ionicons name="add-circle" size={24} color="#4B7B5C" />
                <Text style={styles.addButtonText}>Add Another Expense</Text>
              </TouchableOpacity>
            </View>
          )}

          {hasDiscrepancy && (
            <View style={styles.warningContainer}>
              <Ionicons name="warning" size={24} color="#f59e0b" style={styles.warningIcon} />
              <Text style={styles.warningText}>Buy-ins and cash-outs do not match</Text>
              <View style={styles.totalsContainer}>
                <Text style={styles.totalText}>Total Buy-in: ${totalBuyIn.toFixed(2)}</Text>
                <Text style={styles.totalText}>Total Cash-out: ${totalCashOut.toFixed(2)}</Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.calculateButton}
            onPress={calculatePayments}>
            <Text style={styles.calculateButtonText}>Calculate Payments</Text>
          </TouchableOpacity>

          <View style={styles.paymentsContainer}>
            <Text style={styles.sectionTitle}>Payments</Text>
            <PaymentList payments={payments} />
          </View>
        </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  logoContainer: {
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 16
  },
  playersContainer: {
    marginBottom: 24,
  },
  expensesContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#E8F1EC',
    borderRadius: 8,
    justifyContent: 'center',
  },
  expenseButton: {
    marginBottom: 24,
  },
  expenseButtonActive: {
    backgroundColor: '#fde2e2',
  },
  addExpenseButton: {
    marginTop: 12,
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#4B7B5C',
    fontWeight: '500',
  },
  warningContainer: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  warningIcon: {
    marginBottom: 8,
  },
  warningText: {
    fontSize: 16,
    color: '#92400e',
    fontWeight: '600',
    marginBottom: 12,
  },
  totalsContainer: {
    marginTop: 8,
  },
  totalText: {
    fontSize: 14,
    color: '#92400e',
    marginBottom: 4,
  },
  calculateButton: {
    backgroundColor: '#4B7B5C',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  calculateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  paymentsContainer: {
    flex: 1,
  },
});