import React, { useRef, useEffect } from 'react';
import { Bold, Italic, List } from 'lucide-react';

interface RichTextFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextField: React.FC<RichTextFieldProps> = ({
  value,
  onChange,
  placeholder,
  className = '',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    editorRef.current?.focus();
    handleInput();
  };

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-black focus-within:border-transparent ${className}`}>
      <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-200">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        className="p-3 min-h-[100px] max-h-[300px] overflow-y-auto focus:outline-none prose prose-sm max-w-none"
        data-placeholder={placeholder}
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      />
    </div>
  );
};
