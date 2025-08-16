
import { supabase } from "@/integrations/supabase/client";

export interface GradeInfo {
  grade: string;
  minMarks: number;
  maxMarks: number;
  points: number;
  remarks: string;
}

// Default grading scale as fallback
export const DEFAULT_GRADING_SCALE: GradeInfo[] = [
  { grade: 'A', minMarks: 80, maxMarks: 100, points: 12, remarks: 'Excellent' },
  { grade: 'A–', minMarks: 75, maxMarks: 79, points: 11, remarks: 'Very Good' },
  { grade: 'B+', minMarks: 70, maxMarks: 74, points: 10, remarks: 'Good' },
  { grade: 'B', minMarks: 65, maxMarks: 69, points: 9, remarks: 'Above Average' },
  { grade: 'B–', minMarks: 60, maxMarks: 64, points: 8, remarks: 'Average' },
  { grade: 'C+', minMarks: 55, maxMarks: 59, points: 7, remarks: 'Fairly Good' },
  { grade: 'C', minMarks: 50, maxMarks: 54, points: 6, remarks: 'Fair' },
  { grade: 'C–', minMarks: 45, maxMarks: 49, points: 5, remarks: 'Fair but Weak' },
  { grade: 'D+', minMarks: 40, maxMarks: 44, points: 4, remarks: 'Poor' },
  { grade: 'D', minMarks: 35, maxMarks: 39, points: 3, remarks: 'Very Poor' },
  { grade: 'D–', minMarks: 30, maxMarks: 34, points: 2, remarks: 'Weak' },
  { grade: 'E', minMarks: 0, maxMarks: 29, points: 1, remarks: 'Fail' }
];

export const fetchGradingScale = async (): Promise<GradeInfo[]> => {
  try {
    const { data, error } = await supabase
      .from('grade_configurations')
      .select('*')
      .eq('is_active', true)
      .order('min_marks', { ascending: false });

    if (error) {
      console.error('Error fetching grade configurations:', error);
      return DEFAULT_GRADING_SCALE;
    }

    return data?.map(config => ({
      grade: config.grade_letter,
      minMarks: config.min_marks,
      maxMarks: config.max_marks,
      points: config.points,
      remarks: config.remarks
    })) || DEFAULT_GRADING_SCALE;
  } catch (error) {
    console.error('Error in fetchGradingScale:', error);
    return DEFAULT_GRADING_SCALE;
  }
};

export const calculateGrade = async (marks: number, maxMarks: number): Promise<GradeInfo> => {
  const percentage = (marks / maxMarks) * 100;
  const gradingScale = await fetchGradingScale();
  
  for (const gradeInfo of gradingScale) {
    if (percentage >= gradeInfo.minMarks && percentage <= gradeInfo.maxMarks) {
      return gradeInfo;
    }
  }
  
  // Default to lowest grade if something goes wrong
  return gradingScale[gradingScale.length - 1];
};

export const calculateSubjectGrade = async (marks: number, maxMarks: number): Promise<string> => {
  const gradeInfo = await calculateGrade(marks, maxMarks);
  return gradeInfo.grade;
};

export const calculateOverallGrade = async (totalMarks: number, totalMaxMarks: number): Promise<GradeInfo> => {
  return await calculateGrade(totalMarks, totalMaxMarks);
};
