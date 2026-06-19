// Parses simple dice notation: "2d6+3", "d20", "4d8-2". One die group plus
// an optional flat modifier — enough for the common "roll to hit" case
// without building a full dice-expression grammar.
const DICE_PATTERN = /^(\d*)d(\d+)\s*([+-]\s*\d+)?$/i

export function parseDiceExpression(expression) {
  const match = DICE_PATTERN.exec(expression.trim())
  if (!match) return null

  const count = match[1] ? parseInt(match[1], 10) : 1
  const sides = parseInt(match[2], 10)
  const modifier = match[3] ? parseInt(match[3].replace(/\s+/g, ''), 10) : 0

  if (count < 1 || count > 100 || sides < 2 || sides > 1000) return null

  return { count, sides, modifier }
}

export function rollDiceExpression(expression) {
  const parsed = parseDiceExpression(expression)
  if (!parsed) return null

  const { count, sides, modifier } = parsed
  const rolls = Array.from({ length: count }, () => 1 + Math.floor(Math.random() * sides))
  const total = rolls.reduce((sum, r) => sum + r, 0) + modifier

  return { expression: expression.trim(), rolls, modifier, total }
}
