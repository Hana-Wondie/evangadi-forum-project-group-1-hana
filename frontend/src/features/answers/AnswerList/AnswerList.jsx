import classes from "./AnswerList.module.css";

return (
  <div className={classes.answers_container}>
    <h3>Answers From The Community</h3>
    <hr />

    {/* Empty state */}
    {(!answers || answers.length === 0) && (
      <p>No answers yet. Be the first to answer.</p>
    )}

    {/* Render answers */}
    {answers &&
      answers.map((answer) => (
        <div key={answer.answer_id} className={classes.answer_card}>
          <div className={classes.user_info}>
            <div className={classes.avatar}>👤</div>
            <span className={classes.username}>{answer.user_name}</span>
          </div>

          <p className={classes.answer_text}>{answer.answer}</p>
        </div>
      ))}
  </div>
);

export default AnswerList;
