import { Alert } from "react-native";
import { dbHelpers } from "./database";

interface CardTemplate {
  front: string;
  back: string[];
  diff: "easy" | "medium" | "hard";
}

interface DeckTemplate {
  name: string;
  category: string;
  icon: string;
  color: string;
  desc: string;
  cards: CardTemplate[];
}

export const injectExtendedSampleDecks = async (
  currentDecksCount: number,
  onRefresh: () => Promise<void>,
) => {
  const deckTemplates: DeckTemplate[] = [
    {
      name: "Pop Culture Blast",
      category: "Media",
      icon: "Tv",
      color: "#8B5CF6",
      desc: "Movies, streaming hits, and iconic celebrities.",
      cards: [
        {
          front: "Batman",
          back: ["Robin", "Gotham", "Joker", "Caped"],
          diff: "easy",
        },
        {
          front: "Inception",
          back: ["Dream", "Leonardo", "Spinning", "Top"],
          diff: "hard",
        },
        {
          front: "Spider-Man",
          back: ["Web", "Peter", "Parker", "Marvel"],
          diff: "easy",
        },
        {
          front: "Star Wars",
          back: ["Jedi", "Vader", "Force", "Skywalker"],
          diff: "easy",
        },
        {
          front: "Stranger Things",
          back: ["Eleven", "Netflix", "Upside Down", "Demogorgon"],
          diff: "medium",
        },
        {
          front: "The Matrix",
          back: ["Neo", "Pill", "Morpheus", "Simulation"],
          diff: "medium",
        },
        {
          front: "Titanic",
          back: ["Ship", "Iceberg", "Jack", "Rose"],
          diff: "easy",
        },
        {
          front: "Shrek",
          back: ["Ogre", "Donkey", "Fiona", "Swamp"],
          diff: "easy",
        },
        {
          front: "Barbie",
          back: ["Ken", "Doll", "Pink", "Mattel"],
          diff: "easy",
        },
        {
          front: "Gladiator",
          back: ["Rome", "Maximus", "Arena", "Colosseum"],
          diff: "medium",
        },
      ],
    },
    {
      name: "World Geography & Landmarks",
      category: "Places",
      icon: "Globe",
      color: "#0EA5E9",
      desc: "Globetrotting destinations, historic structures, and capitals.",
      cards: [
        {
          front: "Eiffel Tower",
          back: ["Paris", "France", "Iron", "Louvre"],
          diff: "easy",
        },
        {
          front: "Mount Everest",
          back: ["Mountain", "Nepal", "Highest", "Climb"],
          diff: "medium",
        },
        {
          front: "Grand Canyon",
          back: ["Arizona", "River", "Deep", "Rocks"],
          diff: "easy",
        },
        {
          front: "Colosseum",
          back: ["Rome", "Italy", "Gladiator", "Ruins"],
          diff: "easy",
        },
        {
          front: "Great Wall of China",
          back: ["Beijing", "Long", "Space", "Border"],
          diff: "easy",
        },
        {
          front: "Machu Picchu",
          back: ["Peru", "Inca", "Mountain", "Ruins"],
          diff: "hard",
        },
        {
          front: "Statue of Liberty",
          back: ["New York", "Green", "Torch", "Island"],
          diff: "easy",
        },
        {
          front: "Pyramids of Giza",
          back: ["Egypt", "Sphinx", "Desert", "Pharaoh"],
          diff: "easy",
        },
        {
          front: "Sydney Opera House",
          back: ["Australia", "Sails", "Harbor", "Theater"],
          diff: "medium",
        },
        {
          front: "Taj Mahal",
          back: ["India", "White", "Marble", "Palace"],
          diff: "medium",
        },
      ],
    },
    {
      name: "Science & Nature Discovery",
      category: "STEM",
      icon: "Atom",
      color: "#10B981",
      desc: "The animal kingdom, planetary physics, and chemistry elements.",
      cards: [
        {
          front: "Photosynthesis",
          back: ["Plants", "Light", "Green", "Leaves"],
          diff: "hard",
        },
        {
          front: "Black Hole",
          back: ["Space", "Gravity", "Star", "Light"],
          diff: "medium",
        },
        {
          front: "Tyrannosaurus Rex",
          back: ["Dinosaur", "Fossil", "Arms", "Jurassic"],
          diff: "easy",
        },
        {
          front: "Oxygen",
          back: ["Breathe", "Air", "Gas", "Element"],
          diff: "easy",
        },
        {
          front: "Chameleon",
          back: ["Color", "Lizard", "Blend", "Eyes"],
          diff: "medium",
        },
        {
          front: "Supernova",
          back: ["Explosion", "Star", "Space", "Galaxy"],
          diff: "hard",
        },
        {
          front: "Gravity",
          back: ["Earth", "Drop", "Newton", "Apple"],
          diff: "easy",
        },
        {
          front: "Great White Shark",
          back: ["Ocean", "Teeth", "Jaws", "Fish"],
          diff: "easy",
        },
        {
          front: "Lightning",
          back: ["Storm", "Thunder", "Flash", "Sky"],
          diff: "easy",
        },
        {
          front: "Volcano",
          back: ["Lava", "Magma", "Erupt", "Mountain"],
          diff: "easy",
        },
      ],
    },
    {
      name: "Action Words & Verbs",
      category: "Actions",
      icon: "Activity",
      color: "#F59E0B",
      desc: "High-energy movements, verbs, and physical actions.",
      cards: [
        {
          front: "Swimming",
          back: ["Water", "Pool", "Ocean", "Stroke"],
          diff: "easy",
        },
        {
          front: "Whispering",
          back: ["Quiet", "Voice", "Secret", "Talk"],
          diff: "medium",
        },
        {
          front: "Juggling",
          back: ["Balls", "Circus", "Catch", "Hands"],
          diff: "medium",
        },
        {
          front: "Sprinting",
          back: ["Run", "Fast", "Track", "Race"],
          diff: "easy",
        },
        {
          front: "Baking",
          back: ["Oven", "Cake", "Bread", "Cook"],
          diff: "easy",
        },
        {
          front: "Climbing",
          back: ["Mountain", "Rope", "Wall", "Up"],
          diff: "easy",
        },
        {
          front: "Yawning",
          back: ["Tired", "Sleep", "Mouth", "Bored"],
          diff: "easy",
        },
        {
          front: "Painting",
          back: ["Brush", "Canvas", "Art", "Color"],
          diff: "easy",
        },
        {
          front: "Laughing",
          back: ["Funny", "Joke", "Smile", "Happy"],
          diff: "easy",
        },
        {
          front: "Meditating",
          back: ["Quiet", "Mind", "Yoga", "Calm"],
          diff: "hard",
        },
      ],
    },
  ];

  for (const t of deckTemplates) {
    const uniqueName = `${t.name} (Batch #${currentDecksCount + 1})`;
    const deckId = await dbHelpers.createDeck(
      uniqueName,
      t.category,
      "bundled",
      t.icon,
      t.color,
      t.desc,
    );

    if (deckId) {
      for (const card of t.cards) {
        await dbHelpers.createCard(deckId, card.front, card.back, card.diff);
      }
    }
  }

  await onRefresh();
  const totalAdded = deckTemplates.reduce(
    (acc, curr) => acc + curr.cards.length,
    0,
  );
  Alert.alert(
    "Success",
    `Injected ${deckTemplates.length} new full decks containing ${totalAdded} total game cards!`,
  );
};
