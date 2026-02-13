import { Link, useParams } from 'react-router';

// [박소민] TODO: qnAId만 있는 경우 coverLetterId를 어떻게 확인할지 상의
const EditButton = () => {
  const { coverLetterId } = useParams<{ coverLetterId: string }>();

  if (!coverLetterId) {
    return null;
  }

  return <Link to={`/cover-letter/edit/${coverLetterId}`}>수정하기</Link>;
};
export default EditButton;
