import { supabase } from "@/integrations/supabase/client";

export interface CBCGrade {
  grade_letter: string;
  grade_descriptor: string;
  points: number;
  min_percentage: number;
  max_percentage: number;
}

// CBC Grading Scale for Kenya
export const CBC_GRADES: CBCGrade[] = [
  { grade_letter: 'EE', grade_descriptor: 'Exceeding Expectation', points: 4, min_percentage: 80, max_percentage: 100 },
  { grade_letter: 'ME', grade_descriptor: 'Meeting Expectation', points: 3, min_percentage: 50, max_percentage: 79 },
  { grade_letter: 'AE', grade_descriptor: 'Approaching Expectation', points: 2, min_percentage: 40, max_percentage: 49 },
  { grade_letter: 'BE', grade_descriptor: 'Below Expectation', points: 1, min_percentage: 0, max_percentage: 39 }
];

/**
 * Get CBC grade based on percentage
 */
export const getCBCGrade = (percentage: number): CBCGrade => {
  for (const grade of CBC_GRADES) {
    if (percentage >= grade.min_percentage && percentage <= grade.max_percentage) {
      return grade;
    }
  }
  // Default to BE if no match found
  return CBC_GRADES[CBC_GRADES.length - 1];
};

/**
 * Calculate percentage from total marks and max possible marks
 */
export const calculatePercentage = (totalMarks: number, maxPossibleMarks: number): number => {
  if (maxPossibleMarks === 0) return 0;
  return Math.round((totalMarks / maxPossibleMarks) * 100);
};

/**
 * Get CBC badge variant based on grade letter
 */
export const getCBCBadgeVariant = (gradeIndicator: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (gradeIndicator) {
    case 'EE':
      return "default"; // Green for Exceeding Expectation
    case 'ME':
      return "secondary"; // Blue for Meeting Expectation
    case 'AE':
      return "outline"; // Gray for Approaching Expectation
    case 'BE':
      return "destructive"; // Red for Below Expectation
    default:
      return "outline";
  }
};

/**
 * Get CBC grade color class
 */
export const getCBCGradeColor = (gradeIndicator: string): string => {
  switch (gradeIndicator) {
    case 'EE':
      return "text-green-600 bg-green-50 border-green-200";
    case 'ME':
      return "text-blue-600 bg-blue-50 border-blue-200";
    case 'AE':
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case 'BE':
      return "text-red-600 bg-red-50 border-red-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

/**
 * Fetch CBC grading configuration from database
 */
export const fetchCBCGradingConfig = async (): Promise<CBCGrade[]> => {
  try {
    const { data, error } = await supabase
      .from('cbc_grading')
      .select('*')
      .eq('is_active', true)
      .order('min_percentage', { ascending: false });

    if (error) throw error;
    
    return data?.map(item => ({
      grade_letter: item.grade_letter,
      grade_descriptor: item.grade_descriptor,
      points: item.points,
      min_percentage: item.min_percentage,
      max_percentage: item.max_percentage
    })) || CBC_GRADES;
  } catch (error) {
    console.error('Error fetching CBC grading config:', error);
    return CBC_GRADES; // Fallback to default
  }
};

/**
 * Format grade display with both letter and descriptor
 */
export const formatCBCGrade = (grade: CBCGrade): string => {
  return `${grade.grade_letter} - ${grade.grade_descriptor}`;
};