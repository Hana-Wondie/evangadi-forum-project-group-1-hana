import React, { useState } from "react";
import Login from "@/features/auth/Login/Login";
import Register from "@/features/auth/Register/Register";
import HowItWorksModal from "./HowItWorksModal";
import classes from "./Landing.module.css";

const Landing = () => {
const [isLogin, setIsLogin] = useState(true);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  // Function to switch between Login and Register views
  const toggleAuth = () => {
    setIsLogin((prev) => !prev);
  };

  return (
    <section className={classes.landing_container}>
      <div className={classes.inner_container}>
        {/* --- LEFT SIDE: AUTHENTICATION BOX --- */}
        <div className={classes.auth_box}>
          {isLogin ? (
            <div className={classes.form_wrapper}>
              <h3>Login to your account</h3>
              <p className={classes.toggle_link}>
                Don't have an account?{" "}
                <span onClick={toggleAuth}>Create a new account</span>
              </p>

              {/* Login component contains only the inputs and the Orange button */}
              <Login hideHeader={true} />

              <div className={classes.bottom_link}>
                <span onClick={toggleAuth}>Create an account?</span>
              </div>
            </div>
          ) : (
            <div className={classes.form_wrapper}>
              <h3>Join the network</h3>
              <p className={classes.toggle_link}>
                Already have an account?
                <span onClick={toggleAuth}>Sign in</span>
              </p>
              <Register hideHeader={true} onSuccess={() => setIsLogin(true)} />
              <p className={classes.terms_text}>
                I agree to the {""}
                <a
                  href="https://www.evangadi.com/legal/privacy/"
                  target="_blank"
                  rel="noreferrer"
                >
                  privacy policy{""}
                </a>
                {""} and {""}
                <a
                  href="https://www.evangadi.com/legal/privacy/"
                  target="_blank"
                  rel="noreferrer"
                >
                  terms of service
                </a>
                .
              </p>
              <div className={classes.bottom_link}>
                <span onClick={toggleAuth}>Already have an account?</span>
              </div>
            </div>
          )}
        </div>

        {/* --- RIGHT SIDE: ABOUT SECTION --- */}
        <div className={classes.landing_about}>
          <p className={classes.about_label}>About</p>
          <h1>Evangadi Networks </h1>
          <div className={classes.about_content}>
            <p>
              No matter what stage of life you are in, whether you’re just
              starting elementary school or being promoted to CEO of a Fortune
              500 company, you have much to offer to those who are trying to
              follow in your footsteps.
            </p>

            <p>
              Wheather you are willing to share your knowledge or you are just
              looking to meet mentors of your own, please start by joining the
              network here.
            </p>
          </div>
          <button
            className={classes.how_it_works_btn}
            onClick={() => setShowHowItWorks(true)}
          >
            HOW IT WORKS
          </button>
        </div>
      </div>

      {/* POPUP MODAL */}
      {showHowItWorks && (
        <HowItWorksModal onClose={() => setShowHowItWorks(false)} />
      )}
    </section>
  );
};

export default Landing;
