// AcademicSection.tsx

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Save, Search, Plus, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  fetchStudentsByGrade,
  saveExaminationMarks, // ✅ Corrected import
  fetchExaminationMarks,
  type Student,
  type ExaminationMark,
} from "@/utils/studentDatabase";
import { fetchSubjects, type Subject } from "@/utils/subjectDatabase";

const AcademicSection = () => {
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [marks, setMarks] = useState<{ [key: string]: { [subject: string]: number } }>({});
  const [existingMarks, setExistingMarks] = useState<ExaminationMark[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const grades = [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
    "Grade 6", "Grade 7", "Grade 8", "Grade 9",
  ];

  const terms = ["Term 1", "Term 2", "Term 3"];
  const currentYear = new Date().getFullYear().toString();

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedGrade && selectedTerm) {
      loadStudentsAndMarks();
    }
  }, [selectedGrade, selectedTerm]);

  const loadSubjects = async () => {
    try {
      const subjectsData = await fetchSubjects();
      setSubjects(subjectsData);
    } catch (error) {
      console.error("Error loading subjects:", error);
      toast({
        title: "Error Loading Subjects",
        description: "Failed to load subjects. Please refresh the page.",
        variant: "destructive",
      });
    }
  };

  const loadStudentsAndMarks = async () => {
    try {
      setLoading(true);
      const studentsData = await fetchStudentsByGrade(selectedGrade);
      setStudents(studentsData);
      const marksData = await fetchExaminationMarks(selectedGrade, selectedTerm, currentYear);
      setExistingMarks(marksData);

      const marksState: { [key: string]: { [subject: string]: number } } = {};
      studentsData.forEach((student) => {
        marksState[student.id] = {};
        subjects.forEach((subject) => {
          const existingMark = marksData.find((mark) => mark.student_id === student.id);
          marksState[student.id][subject.key] = existingMark
            ? ((existingMark[subject.key as keyof ExaminationMark] as number) || 0)
            : 0;
        });
      });
      setMarks(marksState);
    } catch (error) {
      console.error("Error loading students and marks:", error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load students and marks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (studentId: string, subject: string, value: string) => {
    const numValue = parseInt(value) || 0;
    const subjectData = subjects.find((s) => s.key === subject);
    const maxMarks = subjectData?.max_marks || 100;

    if (numValue > maxMarks) {
      toast({
        title: "Invalid Mark",
        description: `Mark cannot exceed ${maxMarks} for ${subjectData?.label || subject}.\`,
        variant: "destructive",
      });
      return;
    }

    setMarks((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subject]: numValue,
      },
    }));
  };

  const calculateTotal = (studentId: string) => {
    if (!marks[studentId]) return 0;
    return Object.values(marks[studentId]).reduce((sum, mark) => sum + (mark || 0), 0);
  };

  const getGrade = (total: number) => {
    const totalPossible = subjects.reduce((sum, subject) => sum + subject.max_marks, 0);
    const percentage = totalPossible > 0 ? (total / totalPossible) * 100 : 0;

    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    return "F";
  };

  const saveMarks = async () => {
    if (!selectedGrade || !selectedTerm) {
      toast({
        title: "Selection Required",
        description: "Please select both grade and term before saving marks.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      let savedCount = 0;
      let errorCount = 0;

      for (const student of students) {
        try {
          const studentMarks = marks[student.id] || {};
          const total = calculateTotal(student.id);

          const examData = {
            student_id: student.id,
            grade: selectedGrade,
            term: selectedTerm,
            academic_year: currentYear,
            total_marks: total,
            ...studentMarks,
          };

          await saveExaminationMarks(examData);
          savedCount++;
        } catch (error) {
          console.error(`Error saving marks for student ${student.student_name}:`, error);
          errorCount++;
        }
      }

      if (savedCount > 0) {
        toast({
          title: "Marks Saved Successfully",
          description: `Saved marks for ${savedCount} student(s). ${errorCount > 0 ? `${errorCount} failed.` : ""}`,
        });
        await loadStudentsAndMarks();
      } else {
        toast({
          title: "Save Failed",
          description: "No marks were saved. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving marks:", error);
      toast({
        title: "Error Saving Marks",
        description: "Failed to save examination marks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* UI components for filters, tables, and actions go here (unchanged from your working version) */}
    </div>
  );
};

export default AcademicSection;
