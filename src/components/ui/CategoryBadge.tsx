import { CATEGORY_BG } from '@/types/expense'
import type { Category } from '@/types/expense'

const CATEGORY_EMOJI: Record<Category, string> = {
  Food: '🍕',
  Transportation: '🚗',
  Entertainment: '🎭',
  Shopping: '🛍️',
  Bills: '📄',
  Other: '📦',
}

interface Props {
  category: Category
  size?: 'sm' | 'md'
}

export default function CategoryBadge({ category, size = 'md' }: Props) {
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${CATEGORY_BG[category]} ${sizeClass}`}>
      <span>{CATEGORY_EMOJI[category]}</span>
      {category}
    </span>
  )
}
