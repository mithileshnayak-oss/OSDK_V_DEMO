import { useState, useRef } from 'react';

export default function DropZone({ onFile, accept = '*', label = 'Drop file here or click to browse' }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const inputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); onFile?.(f); }
  };

  const handleChange = (e) => {
    const f = e.target.files[0];
    if (f) { setFile(f); onFile?.(f); }
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${dragging ? '#b87333' : 'rgba(184,115,51,0.35)'}`,
        borderRadius: 10,
        padding: '32px 24px',
        textAlign: 'center',
        cursor: 'pointer',
        background: dragging ? 'rgba(184,115,51,0.06)' : 'rgba(255,255,255,0.02)',
        transition: 'all 0.2s',
      }}
    >
      <input ref={inputRef} type="file" accept={accept} style={{ display: 'none' }} onChange={handleChange} />
      <div style={{ fontSize: '1.8em', marginBottom: 10, opacity: 0.5 }}>⬆</div>
      {file ? (
        <div>
          <div style={{ color: 'var(--copper)', fontSize: '0.9em', fontWeight: 500 }}>{file.name}</div>
          <div style={{ color: 'var(--gl)', fontSize: '0.78em', marginTop: 4 }}>
            {(file.size / 1024).toFixed(1)} KB · Click to change
          </div>
        </div>
      ) : (
        <div>
          <div style={{ color: 'var(--gp)', fontSize: '0.88em' }}>{label}</div>
          <div style={{ color: 'var(--gl)', fontSize: '0.78em', marginTop: 4 }}>
            {accept !== '*' ? `Accepted: ${accept}` : 'All file types accepted'}
          </div>
        </div>
      )}
    </div>
  );
}
