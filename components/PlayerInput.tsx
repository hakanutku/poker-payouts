import React from 'react';
import { View, TextInput, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';

type PlayerInputProps = {
  player: {
    id: string;
    name: string;
    buyIn: string;
    cashOut: string;
  };
  onUpdate: (id: string, field: 'name' | 'buyIn' | 'cashOut', value: string) => void;
  onRemove: (id: string) => void;
  showLabels?: boolean;
  canDelete: boolean;
};

export default function PlayerInput({ 
  player, 
  onUpdate, 
  onRemove, 
  showLabels = false,
  canDelete
}: PlayerInputProps) {
  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    _dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [64, 0],
    });

    return (
      <Animated.View
        style={[
          styles.deleteAction,
          {
            transform: [{ translateX: trans }],
          },
        ]}>
        <Ionicons name="trash-outline" size={24} color="white" />
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {showLabels && (
        <View style={styles.labelRow}>
          <Text style={[styles.label, styles.nameLabel]}>Name</Text>
          <View style={styles.amountLabels}>
            <Text style={[styles.label, styles.numberLabel]}>Buy-in</Text>
            <Text style={[styles.label, styles.numberLabel]}>Cash-out</Text>
          </View>
          <View style={styles.spacer} />
        </View>
      )}
      <Swipeable
        enabled={canDelete}
        renderRightActions={renderRightActions}
        onSwipeableOpen={() => onRemove(player.id)}
        overshootRight={false}>
        <View style={styles.rowContainer}>
          <View style={styles.row}>
            <View style={styles.nameInput}>
              <TextInput
                style={styles.input}
                placeholder=""
                value={player.name}
                onChangeText={(text) => onUpdate(player.id, 'name', text)}
              />
            </View>
            <View style={styles.amountInputs}>
              <TextInput
                style={[styles.input, styles.numberInput]}
                placeholder=""
                value={player.buyIn}
                onChangeText={(text) => onUpdate(player.id, 'buyIn', text)}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.numberInput]}
                placeholder=""
                value={player.cashOut}
                onChangeText={(text) => onUpdate(player.id, 'cashOut', text)}
                keyboardType="numeric"
              />
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => onRemove(player.id)}
              disabled={!canDelete}>
              <Ionicons 
                name="close-circle" 
                size={24} 
                color={canDelete ? "#ef4444" : "#cbd5e1"} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </Swipeable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  nameLabel: {
    flex: 2,
    marginRight: 8,
  },
  amountLabels: {
    flex: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  numberLabel: {
    flex: 1,
    marginHorizontal: 4,
    textAlign: 'center',
  },
  spacer: {
    width: 36,
  },
  rowContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  nameInput: {
    flex: 2,
    marginRight: 8,
  },
  amountInputs: {
    flex: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
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
    flex: 1,
    textAlign: 'right',
  },
  removeButton: {
    marginLeft: 8,
    padding: 4,
  },
  deleteAction: {
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 64,
    height: '100%',
  },
});