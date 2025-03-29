import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ExpenseInputProps = {
  expense: {
    id: string;
    title: string;
    amount: string;
    payerId: string;
  };
  players: {
    id: string;
    name: string;
  }[];
  onUpdate: (field: 'title' | 'amount' | 'payerId', value: string) => void;
  onRemove: () => void;
  showLabels?: boolean;
  canDelete: boolean;
};

export default function ExpenseInput({ 
  expense, 
  players, 
  onUpdate,
  onRemove,
  showLabels = false,
  canDelete
}: ExpenseInputProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const validPlayers = players.filter(player => player.name.trim() !== '');
  const selectedPlayer = validPlayers.find(player => player.id === expense.payerId);

  return (
    <View style={styles.container}>
      {showLabels && (
        <View style={styles.labelRow}>
          <Text style={[styles.label, styles.titleLabel]}>Title (optional)</Text>
          <Text style={[styles.label, styles.amountLabel]}>Amount</Text>
          <Text style={[styles.label, styles.payerLabel]}>Paid by</Text>
          <View style={styles.spacer} />
        </View>
      )}
      <View style={styles.row}>
        <View style={styles.titleInput}>
          <TextInput
            style={styles.input}
            value={expense.title}
            onChangeText={(text) => onUpdate('title', text)}
            placeholder="e.g., Food, Drinks"
          />
        </View>
        <View style={styles.amountInput}>
          <TextInput
            style={[styles.input, styles.numberInput]}
            value={expense.amount}
            onChangeText={(text) => onUpdate('amount', text)}
            keyboardType="numeric"
            placeholder="0.00"
          />
        </View>
        <View style={styles.payerInput}>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setIsDropdownOpen(true)}
          >
            <Text style={[
              styles.dropdownButtonText,
              !selectedPlayer && styles.dropdownPlaceholder
            ]}>
              {selectedPlayer ? selectedPlayer.name : 'Select player'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={onRemove}
          disabled={!canDelete}>
          <Ionicons 
            name="close-circle" 
            size={24} 
            color={canDelete ? "#ef4444" : "#cbd5e1"} 
          />
        </TouchableOpacity>
      </View>

      <Modal
        visible={isDropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDropdownOpen(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setIsDropdownOpen(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Player</Text>
              <TouchableOpacity
                onPress={() => setIsDropdownOpen(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={validPlayers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.playerItem,
                    item.id === expense.payerId && styles.selectedItem
                  ]}
                  onPress={() => {
                    onUpdate('payerId', item.id);
                    setIsDropdownOpen(false);
                  }}
                >
                  <Text style={[
                    styles.playerItemText,
                    item.id === expense.payerId && styles.selectedItemText
                  ]}>
                    {item.name}
                  </Text>
                  {item.id === expense.payerId && (
                    <Ionicons name="checkmark" size={20} color="#4B7B5C" />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  titleLabel: {
    flex: 2,
    marginRight: 8,
  },
  amountLabel: {
    flex: 1,
    marginRight: 8,
    textAlign: 'center',
  },
  payerLabel: {
    flex: 2,
    marginRight: 8,
  },
  spacer: {
    width: 36,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  titleInput: {
    flex: 2,
  },
  amountInput: {
    flex: 1,
  },
  payerInput: {
    flex: 2,
  },
  input: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  numberInput: {
    textAlign: 'right',
  },
  dropdownButton: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    fontSize: 14,
    color: '#1e293b',
  },
  dropdownPlaceholder: {
    color: '#94a3b8',
  },
  removeButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  playerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  selectedItem: {
    backgroundColor: '#E8F1EC',
  },
  playerItemText: {
    fontSize: 16,
    color: '#1e293b',
  },
  selectedItemText: {
    color: '#4B7B5C',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#e2e8f0',
  },
});