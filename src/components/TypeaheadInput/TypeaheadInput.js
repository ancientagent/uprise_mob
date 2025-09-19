import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function TypeaheadInput({
  placeholder,
  fetchSuggestions, // async (query) => Promise<Array<{ key: string, label: string, value: any }>>
  onSelect,        // (item) => void
  minChars = 2,
  debounceMs = 300,
  initialText = '',
  showOnFocus = false,
  onChangeText: onChangeTextProp,
  dropdownMaxHeight = 200,
}) {
  const [text, setText] = useState(initialText);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const timer = useRef();

  useEffect(() => {
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, []);

  useEffect(() => {
    if (!fetchSuggestions) return () => {};
    if (timer.current) clearTimeout(timer.current);
    const t = (text || '').trim();
    const shouldFetchEmpty = (minChars <= 0 && t.length === 0);
    if (!shouldFetchEmpty && t.length < minChars) {
      setItems([]);
      setOpen(false);
      return () => {};
    }
    timer.current = setTimeout(async () => {
      try {
        const res = await fetchSuggestions(t);
        setItems(Array.isArray(res) ? res : []);
        setOpen(true);
      } catch (_) {
        setItems([]);
        setOpen(false);
      }
    }, debounceMs);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [text, fetchSuggestions, minChars, debounceMs]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={ styles.item }
      accessibilityRole='button'
      accessibilityLabel={`Select ${item.label}`}
      onPress={() => {
        setText(item.label);
        setOpen(false);
        setItems([]);
        onSelect && onSelect(item);
      }}
    >
      <Text style={ styles.itemText }>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={ styles.container }>
      <TextInput
        placeholder={ placeholder }
        value={ text }
        onChangeText={ t => { setText(t); if (onChangeTextProp) onChangeTextProp(t); } }
        onFocus={ async () => {
          if (showOnFocus && (!text || text.trim().length === 0) && fetchSuggestions) {
            try {
              const res = await fetchSuggestions('');
              setItems(Array.isArray(res) ? res : []);
              setOpen(true);
            } catch (_) { setItems([]); setOpen(false); }
          }
        } }
        accessible
        accessibilityLabel={ placeholder || 'Type to search' }
        style={ styles.input }
        placeholderTextColor="#aaa"
      />
      {open && items.length > 0 && (
        <View style={ [styles.dropdown, { maxHeight: dropdownMaxHeight }] }>
          <FlatList
            keyboardShouldPersistTaps='handled'
            data={ items }
            keyExtractor={ i => i.key }
            renderItem={ renderItem }
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', marginVertical: 8 },
  input: {
    width: '100%', borderWidth: 1, borderColor: '#444', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, color: '#fff', backgroundColor: '#222',
  },
  dropdown: {
    position: 'absolute', top: 48, left: 0, right: 0,
    backgroundColor: '#111', borderWidth: 1, borderColor: '#444', borderRadius: 8, maxHeight: 200, zIndex: 10,
  },
  item: { paddingHorizontal: 12, paddingVertical: 10 },
  itemText: { color: '#fff' },
});

