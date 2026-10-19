import { StudentHome } from './student/StudentHomePage';

/** An enrolled adult's own school pages (civic-61 E3-d5): the same page a student login sees, read by the signed-in account. */
export default function MySchoolPage() {
  return <StudentHome adult />;
}
