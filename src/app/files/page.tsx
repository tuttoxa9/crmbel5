"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";
import { 
  FolderPlus, Upload, File as FileIcon, Image as ImageIcon, 
  Folder as FolderIcon,  Download, Trash2,   ChevronRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { } from "framer-motion";

interface R2Object {
  Key: string;
  LastModified?: Date;
  Size?: number;
}

export default function FilesPage() {
  const [currentPath, setCurrentPath] = useState("crm/");
  const [files, setFiles] = useState<R2Object[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isMkdirModalOpen, setIsMkdirModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/files/list?prefix=${encodeURIComponent(currentPath)}`);
      if (!res.ok) throw new Error("Failed to load files");
      const data = await res.json();
      setFolders(data.folders || []);
      setFiles(data.files || []);
    } catch {
      toast.error("Ошибка загрузки файлов");
    } finally {
      setLoading(false);
    }
  }, [currentPath]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      try {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        let fileToUpload = file;

        // Image compression on client
        if (file.type.startsWith("image/")) {
          const options = {
            maxSizeMB: 5,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            initialQuality: 0.8
          };
          fileToUpload = await imageCompression(file, options);
        }

        const formData = new FormData();
        formData.append("file", fileToUpload, file.name); // Ensure name is preserved after compression
        formData.append("path", currentPath);

        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(prev => ({ ...prev, [file.name]: percent }));
          }
        };

        await new Promise((resolve, reject) => {
          xhr.open("POST", "/api/files/upload");
          xhr.onload = () => {
            if (xhr.status === 200) resolve(xhr.response);
            else reject(new Error("Upload failed"));
          };
          xhr.onerror = () => reject(new Error("Network Error"));
          xhr.send(formData);
        });

        toast.success(`Файл ${file.name} загружен`);
      } catch {
        toast.error(`Ошибка загрузки ${file.name}`);
      } finally {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
      }
    }
    loadFiles();
  }, [currentPath, loadFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, noClick: true });

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      const res = await fetch("/api/files/mkdir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: currentPath, folderName: newFolderName }),
      });
      if (!res.ok) throw new Error();
      toast.success("Папка создана");
      setNewFolderName("");
      setIsMkdirModalOpen(false);
      loadFiles();
    } catch {
      toast.error("Ошибка при создании папки");
    }
  };

  const handleDelete = async (key: string, isFolder: boolean) => {
    if (!confirm(`Удалить ${isFolder ? 'папку' : 'файл'}?`)) return;
    try {
      const res = await fetch("/api/files/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      if (!res.ok) throw new Error();
      toast.success("Успешно удалено");
      loadFiles();
    } catch {
      toast.error("Ошибка при удалении");
    }
  };

  const handleDownload = (key: string) => {
    window.open(`/api/files/download?key=${encodeURIComponent(key)}`, "_blank");
  };

  const pathParts = currentPath.split("/").filter(Boolean);

  return (
    <div className="h-full flex flex-col gap-24" {...getRootProps()}>
      <input {...getInputProps()} />
      
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-16 shrink-0">
        <div className="flex flex-col gap-8">
          <h1 className="text-page-title text-textPrimary">Файлы</h1>
          <div className="flex items-center gap-8 text-caption text-textMuted">
            <button 
              onClick={() => setCurrentPath("crm/")}
              className="hover:text-textPrimary transition-colors"
            >
              crm
            </button>
            {pathParts.slice(1).map((part, idx) => {
              const buildPath = `crm/${pathParts.slice(1, idx + 1).join("/")}/`;
              return (
                <div key={buildPath} className="flex items-center gap-8">
                  <ChevronRight className="w-14 h-14" />
                  <button 
                    onClick={() => setCurrentPath(buildPath)}
                    className="hover:text-textPrimary transition-colors"
                  >
                    {part}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-12">
          <Button variant="secondary" onClick={() => setIsMkdirModalOpen(true)}>
            <FolderPlus className="w-16 h-16 mr-8" />
            Создать папку
          </Button>
          <div className="relative">
            <Button>
              <Upload className="w-16 h-16 mr-8" />
              Загрузить
            </Button>
            {/* Transparent file input overlaid on button for click-to-upload */}
            <input 
              {...getInputProps()} 
              className="absolute inset-0 opacity-0 cursor-pointer" 
            />
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="flex flex-col gap-8 shrink-0">
          {Object.entries(uploadProgress).map(([name, progress]) => (
            <div key={name} className="card-base p-12 rounded-[12px] flex items-center gap-12">
              <span className="text-caption text-textPrimary w-[150px] truncate">{name}</span>
              <div className="flex-1 h-[4px] bg-surfaceSecondary rounded-full overflow-hidden">
                <div className="h-full bg-accent transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-caption text-textMuted w-[40px] text-right">{progress}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Main Area */}
      <div className={`flex-1 card-base rounded-[12px] p-24 overflow-y-auto min-h-[400px] transition-colors ${
        isDragActive ? 'border-accent bg-accent/5' : ''
      }`}>
        {loading ? (
          <div className="h-full flex items-center justify-center">
             <span className="w-32 h-32 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-16">
            {folders.map((folderPrefix) => {
              const name = folderPrefix.slice(0, -1).split('/').pop();
              return (
                <div 
                  key={folderPrefix}
                  onDoubleClick={() => setCurrentPath(folderPrefix)}
                  className="group relative flex flex-col items-center gap-12 p-16 rounded-[12px] hover:bg-hover transition-colors cursor-pointer border border-transparent hover:border-border"
                >
                  <FolderIcon className="w-48 h-48 text-accent" strokeWidth={1} fill="currentColor" fillOpacity={0.2} />
                  <span className="text-caption text-textPrimary text-center w-full truncate">{name}</span>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(folderPrefix, true); }}
                    className="absolute top-8 right-8 p-4 opacity-0 group-hover:opacity-100 text-textMuted hover:text-[#FF3B30] hover:bg-surface rounded-md transition-all"
                  >
                    <Trash2 className="w-16 h-16" />
                  </button>
                </div>
              );
            })}

            {files.map((file) => {
              const name = file.Key.split('/').pop()!;
              const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(name);
               // public url logic removed  
                

              return (
                <div 
                  key={file.Key}
                  className="group relative flex flex-col p-8 rounded-[12px] hover:bg-hover transition-colors border border-transparent hover:border-border"
                >
                  <div className="h-[120px] w-full rounded-[8px] bg-surfaceSecondary flex items-center justify-center overflow-hidden mb-8">
                    {isImage ? (
                      <ImageIcon className="w-32 h-32 text-textMuted" /> // Placeholder for actual img
                    ) : (
                      <FileIcon className="w-32 h-32 text-textMuted" />
                    )}
                  </div>
                  <span className="text-caption text-textPrimary text-center w-full truncate px-4">{name}</span>
                  
                  <div className="absolute top-12 right-12 flex gap-4 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => handleDownload(file.Key)}
                      className="p-6 bg-surface border border-border shadow-card-sm text-textPrimary hover:text-accent rounded-md"
                    >
                      <Download className="w-14 h-14" />
                    </button>
                    <button 
                      onClick={() => handleDelete(file.Key, false)}
                      className="p-6 bg-surface border border-border shadow-card-sm text-textPrimary hover:text-[#FF3B30] rounded-md"
                    >
                      <Trash2 className="w-14 h-14" />
                    </button>
                  </div>
                </div>
              );
            })}

            {folders.length === 0 && files.length === 0 && (
              <div className="col-span-full h-[200px] flex items-center justify-center text-textMuted flex-col gap-12 pointer-events-none">
                <Upload className="w-32 h-32" strokeWidth={1} />
                <span>Перетащите файлы сюда</span>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={isMkdirModalOpen} onClose={() => setIsMkdirModalOpen(false)} title="Новая папка">
        <form onSubmit={handleCreateFolder} className="space-y-16">
          <Input 
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Название папки"
            autoFocus
          />
          <div className="flex gap-12">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsMkdirModalOpen(false)}>Отмена</Button>
            <Button type="submit" className="flex-1">Создать</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
