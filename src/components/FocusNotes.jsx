import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { focusNotes } from '../data/focusNotes'

export default function FocusNotes({ pendingCount = 0, completionPercentage = 0 }) {
  const [slide, setSlide] = useState(0)
  const note = focusNotes[slide]
  const changeSlide = direction => setSlide(current => (current + direction + focusNotes.length) % focusNotes.length)

  return (
    <section
      className="focus-banner"
      aria-label="Focus Notes carousel"
      tabIndex={0}
      onKeyDown={event => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          changeSlide(-1)
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault()
          changeSlide(1)
        }
      }}
    >
      <div className="focus-banner-content" aria-live="polite">
        <div className="focus-meta"><span>FOCUS NOTES</span><b>{String(slide + 1).padStart(2, '0')} / {String(focusNotes.length).padStart(2, '0')}</b></div>
        <p className="mobile-greeting">GOOD AFTERNOON</p>
        <h2>{note.title}</h2>
        <p className="focus-subtitle">{note.detail}</p>
        <div className="mobile-focus-progress">
          <div className="mobile-progress-copy">
            <span>{pendingCount} {pendingCount === 1 ? 'task' : 'tasks'} waiting for your attention</span>
            <strong>{completionPercentage}% complete</strong>
          </div>
          <span className="progress-track"><span style={{ width: `${completionPercentage}%` }} /></span>
        </div>
      </div>
      <div className="focus-preview" aria-label="Next task preview">
        <div className="preview-heading">
          <span className="preview-status"><Check size={12} aria-hidden="true" /></span>
          <span>{note.previewStatus}</span>
        </div>
        <strong>{note.previewTask}</strong>
        <div className="preview-progress">
          <span><i style={{ width: `${completionPercentage}%` }} /></span>
          <b aria-live="polite" aria-atomic="true">{completionPercentage}%</b>
        </div>
      </div>
      <div className="focus-banner-bottom">
        <div className="focus-indicators" aria-label={`Slide ${slide + 1} of ${focusNotes.length}`}>
          {focusNotes.map((note, index) => (
            <button
              type="button"
              key={note.tag}
              className={index === slide ? 'active' : ''}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === slide ? 'true' : undefined}
              onClick={() => setSlide(index)}
            />
          ))}
        </div>
        <div className="focus-controls">
          <button type="button" aria-label="Previous slide" onClick={() => changeSlide(-1)}><ArrowLeft size={16} /></button>
          <button type="button" aria-label="Next slide" onClick={() => changeSlide(1)}><ArrowRight size={16} /></button>
        </div>
      </div>
    </section>
  )
}
