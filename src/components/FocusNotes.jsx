import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Clock3 } from 'lucide-react'
import { focusNotes } from '../data/focusNotes'

export default function FocusNotes({ tasks = [], pendingCount = 0, completionPercentage = 0 }) {
  const [slide, setSlide] = useState(0)
  const nextTask = tasks.find(task => task.status !== 'Completed')
  const changeSlide = direction => setSlide(current => (current + direction + focusNotes.length) % focusNotes.length)

  return (
    <section
      className="focus-banner"
      aria-label="Focus Notes carousel"
      tabIndex={0}
      onKeyDown={event => {
        if (event.key === 'ArrowLeft') changeSlide(-1)
        if (event.key === 'ArrowRight') changeSlide(1)
      }}
    >
      <div className="focus-banner-content" aria-live="polite">
        <div className="focus-meta"><span>FOCUS NOTES</span><b>{String(slide + 1).padStart(2, '0')} / {String(focusNotes.length).padStart(2, '0')}</b></div>
        <p className="mobile-greeting">GOOD AFTERNOON</p>
        <h2>{focusNotes[slide].title}</h2>
        <p className="focus-subtitle">{focusNotes[slide].detail}</p>
        <div className="mobile-focus-progress">
          <div className="mobile-progress-copy"><span>{pendingCount} tasks to go</span><strong>{completionPercentage}% complete</strong></div>
          <span className="progress-track"><span style={{ width: `${completionPercentage}%` }} /></span>
        </div>
      </div>
      <div className="focus-preview" aria-label="Next task preview">
        <div className="preview-heading"><span><Clock3 size={13} /> NEXT UP</span><span className="preview-dot" /></div>
        <strong>{nextTask?.title || 'Take a well-earned break'}</strong>
        <div className="preview-progress"><span><i style={{ width: `${nextTask ? 62 : 100}%` }} /></span><b>{nextTask ? '62%' : '100%'}</b></div>
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
      <span className="focus-decoration focus-decoration-one" aria-hidden="true" />
      <span className="focus-decoration focus-decoration-two" aria-hidden="true"><Check size={16} /></span>
    </section>
  )
}
