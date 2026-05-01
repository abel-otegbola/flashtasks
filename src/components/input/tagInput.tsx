'use client'

import { XIcon } from '@phosphor-icons/react'
import { KeyboardEvent, useMemo, useState } from 'react'

interface TagInputProps {
  label?: string
  name?: string
  tags: string[] | string
  onChange: (tags: string[]) => void
  placeholder?: string
  error?: string
  required?: boolean
  disabled?: boolean
}

export default function TagInput({
  label,
  name,
  tags,
  onChange,
  placeholder,
  error,
  required,
  disabled,
}: TagInputProps) {
  const [focus, setFocus] = useState(false)
  const [draft, setDraft] = useState('')

  const normalizedTags = useMemo(() => {
    return Array.isArray(tags) ? tags.map((tag) => tag.trim()).filter(Boolean) : tags.split(',').map((tag) => tag.trim()).filter(Boolean)
  }, [tags])

  const addTag = (rawValue: string) => {
    const candidate = rawValue.trim()
    if (!candidate || disabled) return

    const exists = normalizedTags.some(
      (tag) => tag.toLowerCase() === candidate.toLowerCase(),
    )
    if (exists) {
      setDraft('')
      return
    }

    onChange([...normalizedTags, candidate])
    setDraft('')
  }

  const removeTag = (target: string) => {
    if (disabled) return

    onChange(
      normalizedTags.filter(
        (tag) => tag.toLowerCase() !== target.toLowerCase(),
      ),
    )
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',' || event.key === 'Tab') {
      event.preventDefault()
      addTag(draft)
    }

    if (event.key === 'Backspace' && !draft.trim() && normalizedTags.length > 0) {
      event.preventDefault()
      onChange(normalizedTags.slice(0, -1))
    }
  }

  const hasError = Boolean(error) && !focus

  return (
    <div className="flex flex-col w-full gap-1">
      {label ? (
        <label htmlFor={name} className={`text-[13px] font-medium ${focus ? 'text-primary' : ''}`}>
          {label}
          {required ? <span className="ml-1">*</span> : null}
        </label>
      ) : null}

      <div
        className={`rounded-lg bg-background w-full border p-2 duration-300 ${
          hasError ? 'border-red-500' : 'border-gray-500/[0.3]'
        } ${focus ? 'border-primary shadow-input-active' : ''} ${disabled ? 'opacity-[0.6]' : ''}`}
      >
        <div className="flex flex-wrap gap-2 items-center">
          {normalizedTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => removeTag(tag)}
              className="inline-flex items-center gap-2 rounded-full bg-gray-200 dark:bg-gray-700 px-3 py-1 text-sm"
              aria-label={`Remove ${tag}`}
              disabled={disabled}
            >
              <span>{tag}</span>
              <span className="text-[11px]"><XIcon size={10} /></span>
            </button>
          ))}

          <input
            id={name}
            name={name}
            type="text"
            value={draft}
            placeholder={normalizedTags.length ? '' : placeholder}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocus(true)}
            onBlur={() => {
              setFocus(false)
              if (draft.trim()) {
                addTag(draft)
              }
            }}
            className="min-w-[140px] flex-1 bg-transparent outline-none py-1 text-[13px]"
            disabled={disabled}
          />
        </div>
      </div>

      {hasError ? <p className="text-[12px] bg-background text-red-500">{error}</p> : null}
    </div>
  )
}
