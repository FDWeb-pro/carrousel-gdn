# API Infomaniak - Notes d'intégration

## Endpoint
```
POST https://api.infomaniak.com/1/ai/{product_id}/openai/chat/completions
```

## Authentification
```
Authorization: Bearer {API_TOKEN}
Content-Type: application/json
```

## Paramètres requis

### Path Parameters
- `product_id` (integer, required) - Identifiant du produit LLM API

### Body Parameters (application/json)
- `messages` (array, required) - Liste des messages de la conversation
  - `role` (string) - "system", "user", ou "assistant"
  - `content` (string) - Contenu du message
- `model` (string, required) - Nom du modèle à utiliser
  - Valeurs possibles: granite, llama3, mistral24b, mistral31, mixtral, mixtral8x22b, reasoning

### Paramètres optionnels
- `max_tokens` (integer) - Nombre maximum de tokens générés (1-5000, défaut: 1024)
- `temperature` (number) - Température d'échantillonnage (0-2, défaut: 0.5)
- `profile_type` (string) - "creative", "standard", "strict"
- `frequency_penalty` (number) - Pénalité de fréquence (-2.0 à 2.0)
- `presence_penalty` (number) - Pénalité de présence (-2.0 à 2.0)
- `top_p` (number) - Nucleus sampling
- `stream` (boolean) - Activer le streaming SSE

## Format de réponse

```json
{
  "model": "mixtral",
  "id": "example",
  "object": "chat.completion",
  "system_fingerprint": "example",
  "created": 1234567890,
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Generated text here"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 50,
    "total_tokens": 60
  }
}
```

## Langues supportées
- Complet: Anglais, Allemand, Espagnol, Français, Italien
- Limité: Portugais, Polonais, Néerlandais, Roumain, Tchèque, Suédois

## Rate Limiting
Par défaut, le nombre de requêtes par minute est limité. Contacter le support pour connaître ou augmenter la limite.

## Exemple d'utilisation pour notre cas

Pour générer une description d'image basée sur le contenu texte d'une slide :

```json
{
  "messages": [
    {
      "role": "system",
      "content": "Tu es un expert en génération de prompts pour créer des images. Tu dois créer des descriptions détaillées et visuelles pour un générateur d'images IA, basées sur le contenu textuel fourni."
    },
    {
      "role": "user",
      "content": "Crée une description détaillée d'image (prompt) pour illustrer ce contenu de slide : [TEXTE_DE_LA_SLIDE]"
    }
  ],
  "model": "mixtral",
  "max_tokens": 200,
  "temperature": 0.7,
  "profile_type": "creative"
}
```
