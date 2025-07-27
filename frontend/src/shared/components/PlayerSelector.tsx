import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  Modal,
  Alert
} from 'react-native';
import { Player } from '../types';

interface PlayerSelectorProps {
  players: Player[];
  selectedPlayer?: Player;
  onPlayerSelect: (player: Player) => void;
  onCreatePlayer: (name: string) => void;
}

/**
 * PlayerSelector Component
 * 
 * iPhone contacts-style alphabetical list with letter navigation and search.
 * Allows selection of existing players or creation of new players for range tracking.
 * Features search functionality and alphabetical index navigation.
 * 
 * @param players - Array of existing players
 * @param selectedPlayer - Currently selected player
 * @param onPlayerSelect - Callback when player is selected
 * @param onCreatePlayer - Callback to create new player
 */
export default function PlayerSelector({ 
  players, 
  selectedPlayer, 
  onPlayerSelect,
  onCreatePlayer 
}: PlayerSelectorProps) {
  const [searchText, setSearchText] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const filteredAndSortedPlayers = useMemo(() => {
    let filtered = players;
    
    if (searchText) {
      filtered = players.filter(player =>
        player.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [players, searchText]);

  const groupedPlayers = useMemo(() => {
    const groups: { [key: string]: Player[] } = {};
    
    filteredAndSortedPlayers.forEach(player => {
      const firstLetter = player.name.charAt(0).toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(player);
    });
    
    return groups;
  }, [filteredAndSortedPlayers]);

  const sectionData = useMemo(() => {
    return Object.keys(groupedPlayers)
      .sort()
      .map(letter => ({
        letter,
        data: groupedPlayers[letter]
      }));
  }, [groupedPlayers]);

  const handleCreatePlayer = () => {
    if (!newPlayerName.trim()) {
      Alert.alert('Error', 'Please enter a player name');
      return;
    }
    
    const existingPlayer = players.find(
      p => p.name.toLowerCase() === newPlayerName.trim().toLowerCase()
    );
    
    if (existingPlayer) {
      Alert.alert('Error', 'A player with this name already exists');
      return;
    }
    
    onCreatePlayer(newPlayerName.trim());
    setNewPlayerName('');
    setShowCreateModal(false);
  };

  const scrollToLetter = (letter: string) => {
    // This would need a ref to the FlatList to implement scrolling
    console.log(`Scroll to letter: ${letter}`);
  };

  const renderPlayerItem = ({ item }: { item: Player }) => (
    <TouchableOpacity
      style={[
        styles.playerItem,
        selectedPlayer?.id === item.id && styles.selectedPlayerItem
      ]}
      onPress={() => onPlayerSelect(item)}
    >
      <Text style={[
        styles.playerName,
        selectedPlayer?.id === item.id && styles.selectedPlayerName
      ]}>
        {item.name}
      </Text>
      <Text style={styles.playerRangeCount}>
        {item.ranges.length} range{item.ranges.length !== 1 ? 's' : ''}
      </Text>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: { letter: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.letter}</Text>
    </View>
  );

  const flatListData = sectionData.flatMap(section => [
    { type: 'header', letter: section.letter },
    ...section.data.map(player => ({ type: 'player', ...player }))
  ]);

  const renderItem = ({ item }: { item: any }) => {
    if (item.type === 'header') {
      return renderSectionHeader({ section: { letter: item.letter } });
    }
    return renderPlayerItem({ item });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search players..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.createButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        <FlatList
          data={flatListData}
          renderItem={renderItem}
          keyExtractor={(item) => 
            item.type === 'header' ? `header-${(item as any).letter}` : `player-${(item as any).id}`
          }
          showsVerticalScrollIndicator={false}
          style={styles.playerList}
        />
        
        <View style={styles.alphabetIndex}>
          {alphabet.map(letter => (
            <TouchableOpacity
              key={letter}
              style={styles.alphabetItem}
              onPress={() => scrollToLetter(letter)}
            >
              <Text style={styles.alphabetText}>{letter}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Player</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Enter player name"
              value={newPlayerName}
              onChangeText={setNewPlayerName}
              autoFocus
              placeholderTextColor="#999"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowCreateModal(false);
                  setNewPlayerName('');
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalCreateButton}
                onPress={handleCreatePlayer}
              >
                <Text style={styles.modalCreateText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  createButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  playerList: {
    flex: 1,
  },
  playerItem: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedPlayerItem: {
    backgroundColor: '#e3f2fd',
  },
  playerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  selectedPlayerName: {
    color: '#1976d2',
    fontWeight: '600',
  },
  playerRangeCount: {
    fontSize: 12,
    color: '#666',
  },
  sectionHeader: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  alphabetIndex: {
    width: 20,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  alphabetItem: {
    paddingVertical: 1,
  },
  alphabetText: {
    fontSize: 10,
    color: '#2196F3',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  modalCreateButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCreateText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});