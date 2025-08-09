"use client";
import { Editor } from "@tinymce/tinymce-react";

export interface TinyEditorProps {
  value: string;
  apiKey?: string;
  init?: any;
  onEditorChange?: (value: string, editor?: any) => void;
}

export default function TinyEditor({ value, apiKey, init, onEditorChange }: TinyEditorProps) {
  return (
    <Editor apiKey={apiKey} value={value} init={init} onEditorChange={onEditorChange as any} />
  );
}


