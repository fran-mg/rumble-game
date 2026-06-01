import * as LucideIcons from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Deck } from "../../stores/useDeckStore";
import { styles } from "./Decks.styles";

interface Props {
  deck: Deck;
  onEdit: (deck: Deck) => void;
  onDelete: (deckId: string) => void;
}

export default function DeckCard({ deck, onEdit, onDelete }: Props) {
  const DeckIcon = (LucideIcons as any)[deck.icon] ?? LucideIcons.Cloud;
  const deckColor = deck.color ?? "#3B82F6";

  return (
    <View style={styles.deckCard}>
      <View style={styles.cardShine} pointerEvents="none" />

      <View style={styles.deckCardInner}>
        {/* Icon */}
        <View
          style={[
            styles.deckIcon,
            {
              backgroundColor: `${deckColor}22`,
              borderColor: `${deckColor}44`,
            },
          ]}
        >
          <DeckIcon color={deckColor} size={22} strokeWidth={2} />
        </View>

        {/* Info */}
        <View style={styles.deckInfo}>
          <Text style={styles.deckName}>{deck.name}</Text>
          <View style={styles.deckMetaRow}>
            <Text style={styles.deckCategory}>{deck.category}</Text>
            <View style={styles.deckMetaDot} />
            <Text style={styles.deckCardCount}>{deck.cardCount} cards</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.deckActions}>
          <TouchableOpacity
            onPress={() => onEdit(deck)}
            style={styles.deckActionBtn}
            activeOpacity={0.7}
          >
            <LucideIcons.Pencil color="#cbd5e1" size={15} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onDelete(deck.id)}
            style={[styles.deckActionBtn, styles.deckActionBtnDelete]}
            activeOpacity={0.7}
          >
            <LucideIcons.Trash2 color="#fca5a5" size={15} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Colour accent strip */}
      <View style={[styles.deckColorStrip, { backgroundColor: deckColor }]} />
    </View>
  );
}
