import { drizzle } from "drizzle-orm/mysql2";
import { slideTypesConfig } from "../drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

const defaultSlideTypes = [
  { typeKey: "type1", label: "Type 1 - Texte principal (max 175 car.)", charLimit: 175, enabled: 1 },
  { typeKey: "type2", label: "Type 2 - Texte + image (max 125 car.)", charLimit: 125, enabled: 1 },
  { typeKey: "type3", label: "Type 3 - Citation courte + image (max 90 car.)", charLimit: 90, enabled: 1 },
  { typeKey: "type4", label: "Type 4 - Citation + auteur (max 130 car.)", charLimit: 130, enabled: 1 },
  { typeKey: "type5", label: "Type 5 - Liste de 4 éléments (max 40 car. chacun)", charLimit: 40, enabled: 1 },
];

async function seedSlideTypes() {
  console.log("Initialisation des types de slides...");
  
  for (const slideType of defaultSlideTypes) {
    try {
      await db.insert(slideTypesConfig).values(slideType).onDuplicateKeyUpdate({
        set: {
          label: slideType.label,
          charLimit: slideType.charLimit,
          enabled: slideType.enabled,
        },
      });
      console.log(`✓ Type de slide "${slideType.typeKey}" initialisé`);
    } catch (error) {
      console.error(`✗ Erreur pour "${slideType.typeKey}":`, error.message);
    }
  }
  
  console.log("Initialisation terminée !");
  process.exit(0);
}

seedSlideTypes();
