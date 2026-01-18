import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Loader from '../../../components/Loader/Loader';
import QuestionHeaderUI from './QuestionHeaderUI';
import { getSingleQuestion } from '../questionService';
import classes from './QuestionDetail.module.css';

const QuestionDetail = () => {
  const { questionId } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestion = async () => {
      if (!questionId) return;
      try {
        setLoading(true);
        const qData = await getSingleQuestion(questionId);
        setQuestion(qData?.question);
      } catch (err) {
        console.error('Error fetching question:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [questionId]);

  if (loading) return <Loader />;

  return (
    <div className={classes.detail_container}>
      <div className={classes.inner_container}>
        <section className={classes.question_section}>
          <QuestionHeaderUI questionData={question} />
        </section>
      </div>
    </div>
  );
};

export default QuestionDetail;
