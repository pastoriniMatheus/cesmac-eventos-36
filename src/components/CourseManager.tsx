
import React from 'react';
import { useCourses, useCreateCourse } from '@/hooks/useCourses';
import EditableItemManager from './EditableItemManager';

const CourseManager = () => {
  const { data: courses = [], isLoading } = useCourses();
  const createCourse = useCreateCourse();

  const handleCreateCourse = async (name: string) => {
    await createCourse.mutateAsync({ name });
  };

  if (isLoading) {
    return <div>Carregando cursos...</div>;
  }

  return (
    <EditableItemManager
      title="Gerenciar Cursos"
      description="Adicione, edite ou remova cursos do sistema"
      items={courses}
      onCreate={handleCreateCourse}
      itemName="curso"
      withColor={false}
      tableName="courses"
      queryKey={['courses']}
    />
  );
};

export default CourseManager;
