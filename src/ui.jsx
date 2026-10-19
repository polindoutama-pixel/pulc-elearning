import React, { useEffect, useRef, useId } from 'react';
import { BookOpen, LoaderCircle, X, AlertCircle } from 'lucide-react';
export function Button({
  children,
  icon: Icon,
  variant = '',
  className = '',
  ...props
}) {
  return (
    <button className={`button ${variant} ${className}`} {...props}>
      {Icon && <Icon size={17} />} {children}
    </button>
  );
}
export function Badge({ children, tone = '' }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
export function Progress({ value = 0 }) {
  return (
    <div className="progress-track">
      <span style={{ width: `${value}%` }} />
    </div>
  );
}
export function Empty({
  title = 'Belum ada data',
  text = 'Data akan muncul di sini setelah tersedia.',
  action,
}) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <BookOpen size={28} />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}
export function Loading() {
  return (
    <div className="loading">
      <LoaderCircle size={26} className="spin" />
      <span>Menyiapkan ruang belajar Anda…</span>
    </div>
  );
}
export function Modal({ title, children, onClose, wide = false }) {
  const ref = useRef();
  useEffect(() => {
    const previous = document.activeElement;
    ref.current?.focus();
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const els = ref.current.querySelectorAll(
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]',
        );
        const first = els[0],
          last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', handler);
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = old;
      previous?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        className={`modal ${wide ? 'wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        ref={ref}
        tabIndex={-1}
      >
        <div className="modal-heading">
          <h2 id="modal-title">{title}</h2>
          <button className="icon-button" onClick={onClose} aria-label="Tutup">
            <X size={22} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
export function Field({ label, children, hint }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {React.Children.map(children, (child) =>
        React.isValidElement(child) &&
        ['input', 'textarea', 'select'].includes(child.type)
          ? React.cloneElement(child, {
              id,
              'aria-describedby': hint ? id + '-hint' : undefined,
            })
          : child,
      )}
      {hint && <small id={id + '-hint'}>{hint}</small>}
    </div>
  );
}
export function ErrorMessage({ message }) {
  return message ? (
    <div className="error-message" role="alert">
      <AlertCircle size={17} />
      <span>{message}</span>
    </div>
  ) : null;
}
