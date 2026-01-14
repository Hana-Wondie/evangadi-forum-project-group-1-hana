import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { CircleUser } from "lucide-react";
import { getAllQuestions } from "../questionService";
import classes from "./QuestionList.module.css";
import { useAuth } from "../../../context/AuthContext";

function QuestionList({ searchTerm }) {
  
  const [question, setQuestion] = useState([]);
  const [Loader, setLoader] = useState(true);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoader(true);
        const data = await getAllQuestions();

        // Extract the data array from the response we got
        const extractedQuestions = data?.data;
        if (Array.isArray(extractedQuestions)) {
          setQuestion(extractedQuestions);
        } else {
          setQuestion([]);
        }
      } catch (error) {
        console.log("Error Fetching Questions:", error);
      } finally {
        setLoader(false);
      }
    };
    fetchQuestion();
  }, []);

  // Filter logic:- this creates a new list based on the search input
  const filteredQuestions = useMemo(
    () =>
      question.filter((q) =>
        q.title.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [question, searchTerm]
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 7;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredQuestions.length / PAGE_SIZE)
  );

  useEffect(() => {
    // reset to first page when search or question list changes
    setCurrentPage(1);
  }, [searchTerm, question.length]);

  const pagedQuestions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredQuestions.slice(start, start + PAGE_SIZE);
  }, [filteredQuestions, currentPage]);

  const changePage = (p) =>
    setCurrentPage(Math.min(Math.max(1, p), totalPages));

  // then we handle loading state
  if (Loader) {
    return <div className={classes.loading}>Loading Questions ....</div>;
  }

  //  handle empty state (when thereis no questions from the db)
  if (question.length === 0) {
    return (
      <p className={classes.no_data}>
        No Questions found. Be the first one to ask!
      </p>
    );
  }

  return (
    <div className={classes.question_list}>
      {/* to handle no search result */}

      {filteredQuestions.length === 0 ? (
        <p className={classes.no_data}>No Questions match your search.</p>
      ) : (
        // to map over paged (filtered) questions
        pagedQuestions.map((q) => (
          <Link
            key={q.questionid || q.id}
            to={`/question/${q.questionid || q.id}`}
            className={classes.question_item}
          >
            {/* Left: Avatar + Username */}
            <div className={classes.user_info}>
              <div className={classes.avatar}>
                <CircleUser size={40} strokeWidth={1.5} color="#d6671d" />
              </div>
            </Link>
          );
        })
      )}

      {/* Pagination UI */}
      {totalPages > 1 && (
        <div className={classes.pagination}>
          <button
            className={classes.page_btn}
            onClick={() => changePage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </button>

              <p className={classes.user_name}>{q.username}</p>
            </div>
            {/* Middle: Question Content + Meta */}
            <div className={classes.question_content}>
              <p className={classes.question_title}>{q.title}</p>
              <p className={classes.question_meta}>
                Asked by {q.username}
                {q.createdAt
                  ? ` • ${new Date(q.createdAt).toLocaleDateString()}`
                  : ""}
              </p>
            </div>
            {/* Right: Arrow */}

            <div className={classes.arrow_circle}>
              <ChevronRight size={20} strokeWidth={2} color="#fff" />
            </div>
          </Link>
        ))
      )}

      {/* Pagination UI */}
      {totalPages > 1 && (
        <div className={classes.pagination}>
          <button
            className={classes.page_btn}
            onClick={() => changePage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </button>

          {(() => {
            const pages = [];
            const maxButtons = 5;
            if (totalPages <= maxButtons) {
              for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else {
              let start = Math.max(1, currentPage - 2);
              let end = Math.min(totalPages, start + maxButtons - 1);
              if (end - start < maxButtons - 1)
                start = Math.max(1, end - maxButtons + 1);
              for (let i = start; i <= end; i++) pages.push(i);
              if (start > 1) pages[0] = 1;
              if (end < totalPages) pages[pages.length - 1] = totalPages;
            }

            return pages.map((p, idx) => {
              const isGap = idx > 0 && p - pages[idx - 1] > 1;
              return (
                <React.Fragment key={`${p}-frag`}>
                  {isGap && <span className={classes.ellipsis}>…</span>}
                  <button
                    className={`${classes.page_btn} ${
                      p === currentPage ? classes.active : ""
                    }`}
                    onClick={() => changePage(p)}
                  >
                    {p}
                  </button>
                </React.Fragment>
              );
            });
          })()}

          <button
            className={classes.page_btn}
            onClick={() => changePage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default QuestionList;
