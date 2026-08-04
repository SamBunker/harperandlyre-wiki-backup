import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Essentials,
  Paragraph,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading,
  Link,
  List,
  BlockQuote,
  Image,
  ImageUpload,
  ImageToolbar,
  ImageStyle,
  ImageResize,
  Table,
  TableToolbar,
  Undo,
  FileRepository,
  type Editor as CKEditorInstance,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import { api } from "../lib/api";

type UploadLoader = { file: Promise<File | null> };

class ImageUploadAdapter {
  private loader: UploadLoader;

  constructor(loader: UploadLoader) {
    this.loader = loader;
  }

  async upload() {
    const file = await this.loader.file;
    if (!file) throw new Error("No file to upload");
    const { key } = await api.uploadImage(file);
    return { default: api.imageUrl(key) };
  }

  abort() {}
}

function UploadAdapterPlugin(editor: CKEditorInstance) {
  editor.plugins.get(FileRepository).createUploadAdapter = (loader: UploadLoader) => new ImageUploadAdapter(loader);
}

type EditorProps = {
  content: string;
  onReady: (getHtml: () => string) => void;
};

export function Editor({ content, onReady }: EditorProps) {
  return (
    <div className="editor">
      <CKEditor
        editor={ClassicEditor}
        data={content}
        config={{
          licenseKey: "GPL",
          plugins: [
            Essentials,
            Paragraph,
            Bold,
            Italic,
            Underline,
            Strikethrough,
            Heading,
            Link,
            List,
            BlockQuote,
            Image,
            ImageUpload,
            ImageToolbar,
            ImageStyle,
            ImageResize,
            Table,
            TableToolbar,
            Undo,
          ],
          toolbar: [
            "undo",
            "redo",
            "|",
            "heading",
            "|",
            "bold",
            "italic",
            "underline",
            "strikethrough",
            "|",
            "link",
            "bulletedList",
            "numberedList",
            "blockQuote",
            "|",
            "uploadImage",
            "insertTable",
          ],
          extraPlugins: [UploadAdapterPlugin],
          image: {
            toolbar: ["imageStyle:inline", "imageStyle:block", "imageStyle:side", "|", "resizeImage"],
          },
          table: {
            contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
          },
        }}
        onReady={(editor) => onReady(() => editor.getData())}
      />
    </div>
  );
}
