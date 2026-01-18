import { CircleUser } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../../../api/axios';
import { getAiSummary } from '../../../utilis/aiService';
import classes from './AnswerList.module.css';

const AnswerList = () => {
  const { questionId } = useParams();
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [newAnswer, setNewAnswer] = useState('');
  const [posting, setPosting] = useState(false);

  // Fetch answers
  const fetchAnswers = async () => {
    if (!questionId) return;
    setLoading(true);
    try {
      const response = await axios.get(`/api/answer/${questionId}`);
      setAnswers(response.data.answers || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load answers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnswers();
  }, [questionId]);

  // Post new answer
  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!newAnswer.trim()) return alert('Please type an answer');
    setPosting(true);
    try {
      await axios.post(`/api/answer/${questionId}`, { answer: newAnswer });
      setNewAnswer('');
      fetchAnswers();
    } catch (err) {
      console.error(err);
      alert('Failed to post answer');
    } finally {
      setPosting(false);
    }
  };

  // AI Summary
  const handleAiSummarize = async () => {
    if (!answers.length) return;
    setAiLoading(true);
    try {
      const summary = await getAiSummary('', answers);
      setAiSummary(summary);
    } catch (err) {
      setAiSummary('Failed to generate summary');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <p>Loading answers...</p>;
  if (error) return <p className={classes.error}>{error}</p>;

  return (
    <section className={classes.answersSection}>
      <button
        onClick={handleAiSummarize}
        className={classes.aiButton}
        disabled={aiLoading || !answers.length}
      >
        {aiLoading ? 'AI is thinking...' : '✨ Summarize Discussion'}
      </button>

      {aiSummary && (
        <div className={classes.aiSummaryBox}>
          <h3>✨ AI Summary</h3>
          <p>{aiSummary}</p>
        </div>
      )}

      <div className={classes.answerList}>
        {answers.length === 0 ? (
          <p className={classes.noAnswer}>
            No answers yet. Be the first to answer!
          </p>
        ) : (
          answers.map((answer) => (
            <div key={answer.answerId} className={classes.answerCard}>
              <div className={classes.userInfo}>
                <div className={classes.avatar}>
                  <CircleUser size={36} strokeWidth={1.5} color="#787878" />
                </div>
                <div className={classes.userDetails}>
                  <span className={classes.user}>{answer.userName}</span>
                  <span className={classes.date}>
                    {new Date(answer.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className={classes.answerText}>{answer.answer}</div>
            </div>
          ))
        )}
      </div>

      {/* Post Answer */}
      <section className={classes.postAnswerSection}>
        <div className={classes.formHeader}>
          <h3>Answer This Question</h3>
        </div>
        <form onSubmit={handlePostAnswer} className={classes.answerForm}>
          <textarea
            rows="5"
            placeholder="Your answer..."
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            required
          ></textarea>
          <button
            type="submit"
            className={classes.submitBtn}
            disabled={posting}
          >
            {posting ? 'Posting...' : 'Post Your Answer'}
          </button>
        </form>
      </section>
    </section>
  );
};

export default AnswerList;
