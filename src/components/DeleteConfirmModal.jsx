import { useEffect, useRef } from 'react'
import { Trash2 } from 'lucide-react'

export default function DeleteConfirmModal({ task, onClose, onConfirm }) {
  const dialogRef = useRef(null)
  const cancelRef = useRef(null)
  const previousFocusRef = useRef(null)

  useEffect(() => {
    previousFocusRef.current = document.activeElement
    const previousFocus = previousFocusRef.current
    cancelRef.current?.focus()

    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = Array.from(
        dialogRef.current.querySelectorAll('button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
      )
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus?.()
    }
  }, [onClose])

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={event => event.target === event.currentTarget && onClose()}
    >
      <section
        ref={dialogRef}
        className="confirm-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-confirm-title"
        aria-describedby="delete-confirm-description"
      >
        <div className="confirm-icon" aria-hidden="true"><Trash2 size={20} /></div>
        <h2 id="delete-confirm-title">Delete task?</h2>
        <p id="delete-confirm-description">“{task.title}” will be permanently deleted.</p>
        <footer className="modal-actions">
          <button ref={cancelRef} type="button" className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="delete-button" onClick={onConfirm}>
            Delete task
          </button>
        </footer>
      </section>
    </div>
  )
}
