"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  className?: string;
}

export function RichTextEditor({ content, onChange, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none min-h-[200px] focus:outline-none px-1",
      },
    },
  });

  return (
    <div className={cn("rounded-xl border border-neutral-200 p-3 dark:border-neutral-700", className)}>
      <div className="mb-2 flex gap-1 border-b border-neutral-100 pb-2 dark:border-neutral-800">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={cn(
            "rounded-lg px-2 py-1 text-sm font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800",
            editor?.isActive("bold") && "bg-neutral-100 dark:bg-neutral-800"
          )}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={cn(
            "rounded-lg px-2 py-1 text-sm italic hover:bg-neutral-100 dark:hover:bg-neutral-800",
            editor?.isActive("italic") && "bg-neutral-100 dark:bg-neutral-800"
          )}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={cn(
            "rounded-lg px-2 py-1 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800",
            editor?.isActive("bulletList") && "bg-neutral-100 dark:bg-neutral-800"
          )}
        >
          • List
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
