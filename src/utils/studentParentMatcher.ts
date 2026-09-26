import type { Student, ClassSection, Parent } from '../types';

const TITLE_PREFIXES = new Set([
  'dr',
  'dr.',
  'mr',
  'mr.',
  'mrs',
  'mrs.',
  'ms',
  'ms.',
  'miss',
  'prof',
  'prof.',
  'professor',
  'engr',
  'engr.',
  'engineer',
  'chief',
  'barrister',
  'barr',
  'barr.',
  'pastor',
  'pst',
  'pst.',
  'rev',
  'rev.',
  'reverend',
  'apst',
  'apostle',
  'alhaji',
  'alhaja',
  'hajiya',
  'hon',
  'hon.',
  'honorable',
  'elder',
  'deacon',
  'deaconess',
  'otunba',
  'senator',
  'prince',
  'princess',
  'sir',
  'lady',
  'arch',
  'arch.',
  'architect',
  'pharm',
  'pharm.',
  'pharmacist',
]);

/**
 * Extracts and cleans name tokens, removing honorific titles, punctuation, and single characters.
 */
export function extractNameTokens(name: string): string[] {
  if (!name || typeof name !== 'string') return [];
  // Replace punctuation and special characters with spaces
  const cleaned = name.replace(/[()[\].,:;'"\-_\/\\]/g, ' ');
  return cleaned
    .split(/\s+/)
    .map(w => w.trim().toLowerCase())
    .filter(w => w.length > 1 && !TITLE_PREFIXES.has(w));
}

export interface MatchScoreResult {
  score: number;
  isMatched: boolean;
  matchType?: 'SURNAME' | 'FIRST_NAME' | 'COMPOUND' | 'NONE';
  matchReason?: string;
  matchedToken?: string;
}

/**
 * Calculates a match score between a parent's full name and a student's full name.
 * Prioritizes exact matches on Surname (last name) or First name.
 */
export function calculateNameMatch(parentName: string, studentName: string): MatchScoreResult {
  const pTokens = extractNameTokens(parentName);
  const sTokens = extractNameTokens(studentName);

  if (pTokens.length === 0 || sTokens.length === 0) {
    return { score: 0, isMatched: false, matchType: 'NONE' };
  }

  const pFirst = pTokens[0];
  const pLast = pTokens[pTokens.length - 1];

  const sFirst = sTokens[0];
  const sLast = sTokens[sTokens.length - 1];

  // Capitalization helper for badges
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  // 1. Surname exact matches (highest priority)
  // Usually Surname is the last token (e.g., "Adeleke", "Okonkwo", "Bello")
  if (pLast === sLast && pLast.length > 1) {
    return {
      score: 100,
      isMatched: true,
      matchType: 'SURNAME',
      matchReason: `Matching Surname: "${cap(pLast)}"`,
      matchedToken: pLast,
    };
  }

  // If parent name is recorded Surname First (e.g. "Okonkwo Michael")
  if (pFirst === sLast && pFirst.length > 1) {
    return {
      score: 95,
      isMatched: true,
      matchType: 'SURNAME',
      matchReason: `Matching Surname: "${cap(pFirst)}"`,
      matchedToken: pFirst,
    };
  }

  // If student name is recorded Surname First (e.g. "Okonkwo Chukwudi")
  if (sFirst === pLast && sFirst.length > 1) {
    return {
      score: 95,
      isMatched: true,
      matchType: 'SURNAME',
      matchReason: `Matching Surname: "${cap(sFirst)}"`,
      matchedToken: sFirst,
    };
  }

  // 2. First Name exact matches
  if (pFirst === sFirst && pFirst.length > 1) {
    return {
      score: 90,
      isMatched: true,
      matchType: 'FIRST_NAME',
      matchReason: `Matching First Name: "${cap(pFirst)}"`,
      matchedToken: pFirst,
    };
  }

  if (pTokens.includes(sFirst)) {
    return {
      score: 85,
      isMatched: true,
      matchType: 'FIRST_NAME',
      matchReason: `Matching First Name: "${cap(sFirst)}"`,
      matchedToken: sFirst,
    };
  }

  if (sTokens.includes(pFirst)) {
    return {
      score: 85,
      isMatched: true,
      matchType: 'FIRST_NAME',
      matchReason: `Matching Name: "${cap(pFirst)}"`,
      matchedToken: pFirst,
    };
  }

  // 3. Any token exact cross-match (e.g., compound middle names or family names)
  for (const pt of pTokens) {
    if (sTokens.includes(pt) && pt.length > 2) {
      return {
        score: 80,
        isMatched: true,
        matchType: 'COMPOUND',
        matchReason: `Matching Name: "${cap(pt)}"`,
        matchedToken: pt,
      };
    }
  }

  // 4. Prefix/substring match for compound names (e.g. "Ade" in "Adeleke" or "Oluwaseun")
  for (const pt of pTokens) {
    if (pt.length >= 4) {
      for (const st of sTokens) {
        if (st.length >= 4 && (st.startsWith(pt) || pt.startsWith(st))) {
          return {
            score: 60,
            isMatched: true,
            matchType: 'COMPOUND',
            matchReason: `Partial Match: "${cap(pt)}" ~ "${cap(st)}"`,
            matchedToken: pt,
          };
        }
      }
    }
  }

  return { score: 0, isMatched: false, matchType: 'NONE' };
}

export interface RankedStudentItem {
  student: Student;
  name: string;
  avatar: string;
  admissionNumber: string;
  className: string;
  isMatched: boolean;
  matchType?: 'SURNAME' | 'FIRST_NAME' | 'COMPOUND' | 'NONE';
  matchReason?: string;
  matchedToken?: string;
  score: number;
}

/**
 * Returns a sorted and filtered list of students for a given parent name and search query.
 * Students whose surname or first name matches the parent are scored higher and placed at the top.
 */
export function rankStudentsForParent(params: {
  parentName: string;
  students: Student[];
  studentProfiles: Record<string, { name: string; avatar: string }>;
  classSections: ClassSection[];
  searchQuery?: string;
}): RankedStudentItem[] {
  const { parentName, students, studentProfiles, classSections, searchQuery = '' } = params;

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const mapped: RankedStudentItem[] = students.map(student => {
    const profile = studentProfiles[student.userId] || { name: 'Unknown Student', avatar: '' };
    const classSec = classSections.find(c => c.id === student.classSectionId);
    const className = classSec ? classSec.name : 'Unassigned';

    const matchInfo = calculateNameMatch(parentName, profile.name);

    return {
      student,
      name: profile.name,
      avatar: profile.avatar || '',
      admissionNumber: student.admissionNumber,
      className,
      isMatched: matchInfo.isMatched,
      matchType: matchInfo.matchType,
      matchReason: matchInfo.matchReason,
      matchedToken: matchInfo.matchedToken,
      score: matchInfo.score,
    };
  });

  // Filter if searchQuery is provided
  const filtered = normalizedQuery
    ? mapped.filter(item => {
        return (
          item.name.toLowerCase().includes(normalizedQuery) ||
          item.admissionNumber.toLowerCase().includes(normalizedQuery) ||
          item.className.toLowerCase().includes(normalizedQuery) ||
          (item.matchedToken && item.matchedToken.toLowerCase().includes(normalizedQuery))
        );
      })
    : mapped;

  // Sort: highest match score first, then alphabetically by name
  return filtered.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.name.localeCompare(b.name);
  });
}

export interface RankedParentItem {
  parent: Parent;
  name: string;
  occupation: string;
  phone: string;
  isMatched: boolean;
  matchReason?: string;
  matchedToken?: string;
  score: number;
}

/**
 * Returns a sorted and filtered list of parents relative to a given student's name.
 * Parents whose surname or first name matches the student are placed at the top.
 */
export function rankParentsForStudent(params: {
  studentName: string;
  parents: Parent[];
  allUsers: { id: string; name: string; phone?: string; avatar?: string }[];
  searchQuery?: string;
}): RankedParentItem[] {
  const { studentName, parents, allUsers, searchQuery = '' } = params;
  const q = searchQuery.trim().toLowerCase();

  const mapped: RankedParentItem[] = parents.map(parent => {
    const user = allUsers.find(u => u.id === parent.userId);
    const parentName = user?.name || 'Guardian';
    const matchInfo = calculateNameMatch(parentName, studentName);

    return {
      parent,
      name: parentName,
      occupation: parent.occupation || '',
      phone: user?.phone || '',
      isMatched: matchInfo.isMatched,
      matchReason: matchInfo.matchReason,
      matchedToken: matchInfo.matchedToken,
      score: matchInfo.score,
    };
  });

  const filtered = q
    ? mapped.filter(item => {
        return (
          item.name.toLowerCase().includes(q) ||
          item.occupation.toLowerCase().includes(q) ||
          item.phone.toLowerCase().includes(q) ||
          (item.matchedToken && item.matchedToken.toLowerCase().includes(q))
        );
      })
    : mapped;

  return filtered.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.name.localeCompare(b.name);
  });
}

