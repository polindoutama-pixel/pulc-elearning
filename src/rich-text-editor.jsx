import React, { useEffect, useId, useRef, useState } from 'react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Unlink,
  Undo2,
  Redo2,
  Check,
  X,
} from 'lucide-react';
function editorHTML(value) {
  if (!value) return '';
  if (/<[a-z][\s\S]*>/i.test(value)) return value;
  return (
    '<p>' +
    value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('\n', '</p><p>') +
    '</p>'
  );
}
function allowedLink(value) {
  try {
    const url = new URL(value);
    return (
      (url.protocol === 'https:' &&
        !!url.hostname &&
        !url.username &&
        !url.password) ||
      (url.protocol === 'mailto:' && /^[^\s@]+@[^\s@]+/.test(url.pathname))
    );
  } catch {
    return false;
  }
}
function ToolbarButton({
  label,
  icon: Icon,
  active = false,
  disabled = false,
  onClick,
}) {
  return (
    <button
      type="button"
      className={'rich-text-tool ' + (active ? 'active' : '')}
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      <Icon size={17} />
    </button>
  );
}
export function RichTextEditor({ value = '', onChange, label = 'Isi materi' }) {
  const id = useId(),
    latest = useRef(onChange),
    lastValue = useRef(value);
  latest.current = onChange;
  const [showLink, setShowLink] = useState(false),
    [link, setLink] = useState(''),
    [linkError, setLinkError] = useState('');
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: false,
        underline: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: false,
        linkOnPaste: true,
        defaultProtocol: 'https',
        HTMLAttributes: { target: null, rel: 'noopener noreferrer' },
        isAllowedUri: allowedLink,
      }),
    ],
    content: editorHTML(value),
    editorProps: {
      attributes: {
        id: id + '-content',
        role: 'textbox',
        'aria-labelledby': id + '-label',
        'aria-describedby': id + '-hint',
        'aria-multiline': 'true',
        class: 'rich-text-content prose',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.isEmpty ? '' : editor.getHTML();
      lastValue.current = html;
      latest.current(html);
    },
  });
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            bold: e.isActive('bold'),
            italic: e.isActive('italic'),
            underline: e.isActive('underline'),
            bullet: e.isActive('bulletList'),
            ordered: e.isActive('orderedList'),
            quote: e.isActive('blockquote'),
            link: e.isActive('link'),
            style: e.isActive('heading', { level: 2 })
              ? 'h2'
              : e.isActive('heading', { level: 3 })
                ? 'h3'
                : e.isActive('heading', { level: 4 })
                  ? 'h4'
                  : 'p',
            undo: e.can().undo(),
            redo: e.can().redo(),
          }
        : null,
  });
  useEffect(() => {
    if (editor && value !== lastValue.current) {
      lastValue.current = value;
      editor.commands.setContent(editorHTML(value), { emitUpdate: false });
    }
  }, [editor, value]);
  const openLink = () => {
    setLink(editor.getAttributes('link').href || '');
    setLinkError('');
    setShowLink(true);
  };
  const applyLink = () => {
    const trimmed = link.trim(),
      href = /^[a-z][a-z0-9+.-]*:/i.test(trimmed)
        ? trimmed
        : 'https://' + trimmed;
    if (!trimmed || !allowedLink(href)) {
      setLinkError('Gunakan alamat HTTPS atau email dengan awalan mailto:.');
      return;
    }
    const chain = editor.chain().focus().extendMarkRange('link');
    if (editor.state.selection.empty && !editor.isActive('link'))
      chain
        .insertContent({
          type: 'text',
          text: trimmed,
          marks: [{ type: 'link', attrs: { href } }],
        })
        .run();
    else chain.setLink({ href }).run();
    setShowLink(false);
  };
  return (
    <div className="field rich-text-field">
      <label id={id + '-label'}>{label}</label>
      <div className="rich-text-editor">
        {editor && state && (
          <div
            className="rich-text-toolbar"
            role="toolbar"
            aria-label={'Format ' + label.toLowerCase()}
          >
            <select
              aria-label="Gaya paragraf"
              value={state.style}
              onChange={(e) => {
                const v = e.target.value;
                if (v === 'p') editor.chain().focus().setParagraph().run();
                else
                  editor
                    .chain()
                    .focus()
                    .setHeading({ level: Number(v.slice(1)) })
                    .run();
              }}
            >
              <option value="p">Paragraf</option>
              <option value="h2">Judul</option>
              <option value="h3">Subjudul</option>
              <option value="h4">Subjudul kecil</option>
            </select>
            <span className="rich-text-divider" />
            <ToolbarButton
              label="Tebal"
              icon={Bold}
              active={state.bold}
              onClick={() => editor.chain().focus().toggleBold().run()}
            />
            <ToolbarButton
              label="Miring"
              icon={Italic}
              active={state.italic}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            />
            <ToolbarButton
              label="Garis bawah"
              icon={UnderlineIcon}
              active={state.underline}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            />
            <span className="rich-text-divider" />
            <ToolbarButton
              label="Daftar poin"
              icon={List}
              active={state.bullet}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            />
            <ToolbarButton
              label="Daftar bernomor"
              icon={ListOrdered}
              active={state.ordered}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            />
            <ToolbarButton
              label="Kutipan"
              icon={Quote}
              active={state.quote}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            />
            <span className="rich-text-divider" />
            <ToolbarButton
              label="Tambahkan tautan"
              icon={LinkIcon}
              active={state.link}
              onClick={openLink}
            />
            <ToolbarButton
              label="Hapus tautan"
              icon={Unlink}
              disabled={!state.link}
              onClick={() =>
                editor.chain().focus().extendMarkRange('link').unsetLink().run()
              }
            />
            <span className="rich-text-divider" />
            <ToolbarButton
              label="Urungkan"
              icon={Undo2}
              disabled={!state.undo}
              onClick={() => editor.chain().focus().undo().run()}
            />
            <ToolbarButton
              label="Ulangi"
              icon={Redo2}
              disabled={!state.redo}
              onClick={() => editor.chain().focus().redo().run()}
            />
          </div>
        )}
        {showLink && (
          <div className="rich-text-link-panel">
            <label htmlFor={id + '-link'}>Alamat tautan</label>
            <div>
              <input
                id={id + '-link'}
                aria-invalid={!!linkError}
                aria-describedby={linkError ? id + '-link-error' : undefined}
                autoFocus
                value={link}
                placeholder="https://…"
                onChange={(e) => setLink(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    applyLink();
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowLink(false);
                    editor.commands.focus();
                  }
                }}
              />
              <button
                type="button"
                className="icon-button"
                aria-label="Terapkan tautan"
                onClick={applyLink}
              >
                <Check size={18} />
              </button>
              <button
                type="button"
                className="icon-button"
                aria-label="Batal menambahkan tautan"
                onClick={() => {
                  setShowLink(false);
                  editor.commands.focus();
                }}
              >
                <X size={18} />
              </button>
            </div>
            {linkError && (
              <small id={id + '-link-error'} role="alert">
                {linkError}
              </small>
            )}
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
      <small id={id + '-hint'}>
        Gunakan toolbar untuk memformat tulisan. Pintasan: Ctrl/Cmd+B untuk
        tebal, I untuk miring, dan U untuk garis bawah.
      </small>
    </div>
  );
}
