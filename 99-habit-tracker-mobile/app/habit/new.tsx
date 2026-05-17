import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { addHabit } from '../../utils/storage';
import { Colors, ICONS, COLORS } from '../../constants/Colors';

export default function NewHabitScreen() {
  const [habitName, setHabitName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('checkmark-circle');
  const [selectedColor, setSelectedColor] = useState(Colors.primary);
  const [items, setItems] = useState(['']);
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const addItem = () => {
    setItems([...items, '']);
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const saveHabit = async () => {
    if (!habitName.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    const filteredItems = items.filter(item => item.trim());
    if (filteredItems.length === 0) {
      Alert.alert('Error', 'Please add at least one checklist item');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const newHabit = {
      id: Date.now().toString(),
      name: habitName.trim(),
      description: description.trim(),
      icon: selectedIcon,
      color: selectedColor,
      items: filteredItems.map(text => ({
        id: Date.now().toString() + Math.random(),
        text: text.trim(),
        completed: false,
      })),
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      isRecurring,
      frequency,
      streak: 0,
    };

    await addHabit(newHabit);
    router.back();
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.formSection}>
        <Text style={styles.label}>Habit Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Morning Routine, Exercise, Read Books"
          value={habitName}
          onChangeText={setHabitName}
          placeholderTextColor={Colors.lightGray}
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>Description (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe your habit..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          placeholderTextColor={Colors.lightGray}
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>Choose Icon</Text>
        <View style={styles.iconGrid}>
          {ICONS.map(icon => (
            <TouchableOpacity
              key={icon}
              style={[
                styles.iconOption,
                selectedIcon === icon && styles.iconSelected,
              ]}
              onPress={() => setSelectedIcon(icon)}
            >
              <Ionicons name={icon as any} size={24} color={selectedIcon === icon ? Colors.white : Colors.primary} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>Choose Color</Text>
        <View style={styles.colorGrid}>
          {COLORS.map(color => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                selectedColor === color && styles.colorSelected,
              ]}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>Checklist Items *</Text>
        {items.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <TextInput
              style={[styles.input, styles.itemInput]}
              placeholder={`Item ${index + 1}`}
              value={item}
              onChangeText={(text) => updateItem(index, text)}
              placeholderTextColor={Colors.lightGray}
            />
            <TouchableOpacity
              style={styles.removeItemBtn}
              onPress={() => removeItem(index)}
            >
              <Ionicons name="close-circle" size={24} color={Colors.danger} />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addItemBtn} onPress={addItem}>
          <Ionicons name="add-circle" size={24} color={Colors.primary} />
          <Text style={styles.addItemText}>Add Item</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formSection}>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Recurring Habit</Text>
          <TouchableOpacity
            style={[
              styles.switch,
              isRecurring && styles.switchActive,
            ]}
            onPress={() => setIsRecurring(!isRecurring)}
          >
            <View
              style={[
                styles.switchKnob,
                isRecurring && styles.switchKnobActive,
              ]}
            />
          </TouchableOpacity>
        </View>
        {isRecurring && (
          <View style={styles.frequencyContainer}>
            {['daily', 'weekly', 'monthly'].map(freq => (
              <TouchableOpacity
                key={freq}
                style={[
                  styles.frequencyBtn,
                  frequency === freq && styles.frequencyBtnActive,
                ]}
                onPress={() => setFrequency(freq as any)}
              >
                <Text
                  style={[
                    styles.frequencyText,
                    frequency === freq && styles.frequencyTextActive,
                  ]}
                >
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={saveHabit}>
          <Text style={styles.saveBtnText}>Create Habit</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.lighterGray,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: Colors.dark,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconOption: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  colorGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorSelected: {
    borderColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemInput: {
    flex: 1,
    marginRight: 10,
  },
  removeItemBtn: {
    padding: 4,
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  addItemText: {
    color: Colors.primary,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switch: {
    width: 50,
    height: 28,
    backgroundColor: Colors.lighterGray,
    borderRadius: 14,
    padding: 2,
  },
  switchActive: {
    backgroundColor: Colors.primary,
  },
  switchKnob: {
    width: 24,
    height: 24,
    backgroundColor: Colors.white,
    borderRadius: 12,
  },
  switchKnobActive: {
    transform: [{ translateX: 22 }],
  },
  frequencyContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  frequencyBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: Colors.background,
    borderRadius: 8,
    alignItems: 'center',
  },
  frequencyBtnActive: {
    backgroundColor: Colors.primary,
  },
  frequencyText: {
    color: Colors.gray,
    fontWeight: '500',
  },
  frequencyTextActive: {
    color: Colors.white,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: Colors.background,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: Colors.gray,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnText: {
    color: Colors.white,
    fontWeight: '600',
  },
});