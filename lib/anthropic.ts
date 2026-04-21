import Anthropic from '@anthropic-ai/sdk'

export const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

export async function generateMenuDescriptions(
  name_ru: string,
  name_hy: string,
  name_en: string
): Promise<{ description_ru: string; description_hy: string; description_en: string }> {
  if (!anthropic) {
    throw new Error('ANTHROPIC_API_KEY is not configured')
  }
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `You are a professional menu copywriter. Write appetizing, short descriptions (max 20 words each) for this menu item in three languages.
Item name: Russian: ${name_ru || 'N/A'}, Armenian: ${name_hy || 'N/A'}, English: ${name_en || 'N/A'}
Respond ONLY with valid JSON in this exact format, no other text:
{
  "description_ru": "...",
  "description_hy": "...",
  "description_en": "..."
}`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  const parsed = JSON.parse(content.text)
  return {
    description_ru: parsed.description_ru || '',
    description_hy: parsed.description_hy || '',
    description_en: parsed.description_en || '',
  }
}