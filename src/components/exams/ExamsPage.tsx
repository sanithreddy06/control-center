"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, GraduationCap } from "lucide-react";
import { Exam } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner, EmptyState } from "@/components/ui/LoadingSpinner";
import { calendarDaysUntil, formatExamCountdown, formatLocalDate } from "@/lib/dates";

export function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editExam, setEditExam] = useState<Exam | null>(null);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [examDate, setExamDate] = useState("");
  const [notes, setNotes] = useState("");

  const fetchExams = useCallback(async () => {
    const res = await fetch(`/api/exams?archived=${showArchived}`);
    if (res.ok) setExams(await res.json());
    setLoading(false);
  }, [showArchived]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const openCreate = () => {
    setEditExam(null);
    setName("");
    setSubject("");
    setExamDate("");
    setNotes("");
    setModalOpen(true);
  };

  const openEdit = (exam: Exam) => {
    setEditExam(exam);
    setName(exam.name);
    setSubject(exam.subject);
    setExamDate(exam.exam_date);
    setNotes(exam.notes);
    setModalOpen(true);
  };

  const saveExam = async () => {
    const body = { name, subject, exam_date: examDate, notes };
    if (editExam) {
      await fetch(`/api/exams/${editExam.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }
    setModalOpen(false);
    fetchExams();
  };

  const deleteExam = async (id: string) => {
    await fetch(`/api/exams/${id}`, { method: "DELETE" });
    setModalOpen(false);
    fetchExams();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Exams</h1>
          <p className="text-sm text-neutral-500">Track your exam schedule</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowArchived(!showArchived)}>
            {showArchived ? "Active" : "Archived"}
          </Button>
          <Button onClick={openCreate}><Plus className="h-4 w-4" /> Add Exam</Button>
        </div>
      </div>

      {exams.length === 0 ? (
        <EmptyState icon={GraduationCap} title={showArchived ? "No archived exams" : "No upcoming exams"} action={!showArchived ? <Button onClick={openCreate}>Add Exam</Button> : undefined} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => {
            const daysLeft = calendarDaysUntil(exam.exam_date);
            return (
              <Card key={exam.id} hover onClick={() => openEdit(exam)}>
                <h3 className="font-medium">{exam.name}</h3>
                <p className="text-sm text-neutral-500">{exam.subject}</p>
                <p className="mt-2 text-sm">{formatLocalDate(exam.exam_date, "EEEE, MMM d, yyyy")}</p>
                {!showArchived && daysLeft >= 0 && (
                  <p className="mt-1 text-xs font-medium text-violet-600 dark:text-violet-400">
                    {formatExamCountdown(daysLeft)}
                  </p>
                )}
                {exam.notes && <p className="mt-2 text-xs text-neutral-400 line-clamp-2">{exam.notes}</p>}
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editExam ? "Edit Exam" : "New Exam"}>
        <div className="space-y-4">
          <Input label="Exam Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <Input label="Date" type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
          <Input label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <div className="flex gap-2">
            {editExam && (
              <Button variant="danger" onClick={() => deleteExam(editExam.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={saveExam} disabled={!name || !subject || !examDate} className="flex-1">Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
