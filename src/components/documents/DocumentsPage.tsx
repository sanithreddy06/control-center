"use client";

import { useEffect, useState, useCallback } from "react";
import { Lock, Upload, Download, Trash2, Eye, FileText } from "lucide-react";
import { Document } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { LoadingSpinner, EmptyState } from "@/components/ui/LoadingSpinner";
import { DOCUMENT_CATEGORIES } from "@/lib/constants";
import { formatFileSize } from "@/lib/utils";
import { VAULT_INACTIVITY_SECONDS } from "@/lib/vault";

export function DocumentsPage() {
  const [locked, setLocked] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [vaultPassword, setVaultPassword] = useState("");
  const [vaultError, setVaultError] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [uploadCategory, setUploadCategory] = useState("Other");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const lockVault = useCallback(async () => {
    await fetch("/api/documents/verify-vault", { method: "DELETE" });
    setLocked(true);
    setDocuments([]);
  }, []);

  const fetchDocuments = useCallback(async () => {
    const res = await fetch("/api/documents");
    if (res.ok) {
      const data = await res.json();
      setLocked(data.locked);
      setDocuments(data.documents || []);
    }
    setLoading(false);
  }, []);

  // Require vault password on every visit to Documents
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      await fetch("/api/documents/verify-vault", { method: "DELETE" });
      if (mounted) {
        setLocked(true);
        setDocuments([]);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
      fetch("/api/documents/verify-vault", { method: "DELETE" });
    };
  }, []);

  // Inactivity timeout while vault is unlocked
  useEffect(() => {
    if (locked) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      fetch("/api/documents/vault-heartbeat", { method: "POST" }).catch(() => {});
      timeoutId = setTimeout(() => {
        lockVault();
      }, VAULT_INACTIVITY_SECONDS * 1000);
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [locked, lockVault]);

  const unlockVault = async (e: React.FormEvent) => {
    e.preventDefault();
    setVaultError("");
    const res = await fetch("/api/documents/verify-vault", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vaultPassword }),
    });
    if (res.ok) {
      setLocked(false);
      setVaultPassword("");
      await fetchDocuments();
    } else {
      const data = await res.json();
      setVaultError(data.error || "Incorrect password");
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadName) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("name", uploadName);
    formData.append("category", uploadCategory);
    const res = await fetch("/api/documents", { method: "POST", body: formData });
    if (res.ok) {
      setUploadOpen(false);
      setUploadName("");
      setUploadFile(null);
      fetchDocuments();
    }
    setUploading(false);
  };

  const previewDocument = async (id: string) => {
    const res = await fetch(`/api/documents/${id}`);
    if (res.ok) {
      const data = await res.json();
      setPreviewUrl(data.url);
    }
  };

  const downloadDocument = async (id: string, name: string) => {
    const res = await fetch(`/api/documents/${id}`);
    if (res.ok) {
      const data = await res.json();
      const link = document.createElement("a");
      link.href = data.url;
      link.download = name;
      link.click();
    }
  };

  const deleteDocument = async (id: string) => {
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    fetchDocuments();
  };

  if (loading) return <LoadingSpinner />;

  if (locked) {
    return (
      <div className="mx-auto max-w-md py-12">
        <Card className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
            <Lock className="h-8 w-8 text-neutral-600" />
          </div>
          <h1 className="text-xl font-semibold">Document Vault</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Enter your vault password to access secure documents
          </p>
          <form onSubmit={unlockVault} className="mt-6 space-y-4">
            <Input
              type="password"
              value={vaultPassword}
              onChange={(e) => setVaultPassword(e.target.value)}
              placeholder="Vault password"
              error={vaultError}
            />
            <Button type="submit" className="w-full">Unlock Vault</Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
          <p className="text-sm text-neutral-500">Secure document vault</p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Upload className="h-4 w-4" /> Upload
        </Button>
      </div>

      {documents.length === 0 ? (
        <EmptyState icon={FileText} title="No documents" description="Upload your first document" action={<Button onClick={() => setUploadOpen(true)}>Upload Document</Button>} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                  <FileText className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{doc.name}</h3>
                  <p className="text-xs text-neutral-500">{doc.category} · {formatFileSize(doc.file_size)}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => previewDocument(doc.id)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => downloadDocument(doc.id, doc.name)}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deleteDocument(doc.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Document">
        <form onSubmit={handleUpload} className="space-y-4">
          <Input label="Document Name" value={uploadName} onChange={(e) => setUploadName(e.target.value)} />
          <select
            value={uploadCategory}
            onChange={(e) => setUploadCategory(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          >
            {DOCUMENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
            className="w-full text-sm"
          />
          <Button type="submit" disabled={uploading || !uploadFile || !uploadName} className="w-full">
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </form>
      </Modal>

      <Modal isOpen={!!previewUrl} onClose={() => setPreviewUrl(null)} title="Preview" className="max-w-4xl">
        {previewUrl && (
          <iframe src={previewUrl} className="h-[70vh] w-full rounded-xl" title="Document preview" />
        )}
      </Modal>
    </div>
  );
}
