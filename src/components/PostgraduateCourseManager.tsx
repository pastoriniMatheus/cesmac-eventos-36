
import React from 'react';
import { usePostgraduateCourses, useCreatePostgraduateCourse } from '@/hooks/usePostgraduateCourses';
import EditableItemManager from './EditableItemManager';

const PostgraduateCourseManager = () => {
  const { data: postgraduateCourses = [], isLoading } = usePostgraduateCourses();
  const createPostgraduateCourse = useCreatePostgraduateCourse();

  const handleCreatePostgraduateCourse = async (name: string) => {
    await createPostgraduateCourse.mutateAsync(name);
  };

  if (isLoading) {
    return <div>Carregando pós-graduações...</div>;
  }

  return (
    <EditableItemManager
      title="Gerenciar Pós-graduações"
      description="Adicione, edite ou remova pós-graduações do sistema"
      items={postgraduateCourses}
      onCreate={handleCreatePostgraduateCourse}
      itemName="pós-graduação"
      withColor={false}
      tableName="postgraduate_courses"
      queryKey={['postgraduate_courses']}
    />
  );
};

export default PostgraduateCourseManager;
