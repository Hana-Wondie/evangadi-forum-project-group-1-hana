import { X, UserPlus, MessageSquare, ThumbsUp, TrendingUp } from "lucide-react";
import classes from "./HowItWorksModal.module.css";

const HowItWorksModal = ({ onClose }) => {
  return (
    <div className={classes.overlay} onClick={onClose}>
      <div className={classes.modal} onClick={(e) => e.stopPropagation()}>
        <button className={classes.close_btn} onClick={onClose}>
          <X size={22} />
        </button>

        <h2>How Evangadi Forum Works</h2>

        <div className={classes.steps}>
          <div className={classes.step}>
            <UserPlus />
            <div>
              <h4>Create an Account</h4>
              <p>Sign up and become part of the Evangadi community.</p>
            </div>
          </div>

          <div className={classes.step}>
            <MessageSquare />
            <div>
              <h4>Ask Questions</h4>
              <p>Post your questions and get answers from experts.</p>
            </div>
          </div>

          <div className={classes.step}>
            <ThumbsUp />
            <div>
              <h4>Answer</h4>
              <p>Help others and vote for the best solutions.</p>
            </div>
          </div>

          <div className={classes.step}>
            <TrendingUp />
            <div>
              <h4>Grow Your Skills</h4>
              <p>Learn faster and grow your career through collaboration.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksModal;
