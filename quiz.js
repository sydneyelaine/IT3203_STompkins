const QUIZ_DATA = {
  timeLimitSeconds: 600, // 10 minutes
  passingPercent: 70,    // 7/10 correct answers required to pass
  questions: {
    q1: {
      type: 'text',
      correct: ['tim berners-lee', 'tim berners lee', 'berners-lee'],
      answerText: 'Tim Berners-Lee'
    },
    q2: {
      type: 'text',
      correct: ['whatwg'],
      answerText: 'WHATWG'
    },
    q3: {
      type: 'radio',
      correct: 'b',
      answerText: 'Blink'
    },
    q4: {
      type: 'radio',
      correct: 'a',
      answerText: 'Document Object Model (DOM)'
    },
    q5: {
      type: 'radio',
      correct: 'a',
      answerText: 'It eliminates strict version numbers so attributes evolve continuously'
    },
    q6: {
      type: 'checkbox',
      correct: ['alt', 'labels', 'lang'],
      answerText: 'Adding descriptive alt attributes, linking explicit <label> elements, and specifying document language'
    },
    q7: {
      type: 'checkbox',
      correct: ['whatwg', 'w3c', 'owd'],
      answerText: 'WHATWG, W3C, and Open Web Docs'
    },
    q8: {
      type: 'radio',
      correct: 'b',
      answerText: 'Structuring underlying site data with semantic tags and micro-data so AI crawlers can parse and index content accurately'
    },
    q9: {
      type: 'radio',
      correct: 'a',
      answerText: '<article>, <section>, and <footer>'
    },
    q10: {
      type: 'radio',
      correct: 'a',
      answerText: 'CSS Flexbox and CSS Grid'
    }
  }
};

let secondsRemaining = QUIZ_DATA.timeLimitSeconds;
let timerInterval = null;
let isSubmitted = false;

// DOM references
const quizForm = document.getElementById('quiz-form');
const timerDisplay = document.getElementById('timer-display');
const resultsSummary = document.getElementById('results-summary');
const passFailHeading = document.getElementById('pass-fail-heading');
const totalScoreEl = document.getElementById('total-score');
const timeSpentEl = document.getElementById('time-spent');
const submitBtn = document.getElementById('submit-btn');
const resetBtn = document.getElementById('reset-btn');
const resetBtnTop = document.getElementById('reset-btn-top');

//Formats seconds into MM:SS string
function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

//Starts or restarts the 10-minute countdown timer
function startTimer() {
  clearInterval(timerInterval);
  secondsRemaining = QUIZ_DATA.timeLimitSeconds;
  timerDisplay.textContent = formatTime(secondsRemaining);
  timerDisplay.parentElement.classList.remove('timer-urgent');

  timerInterval = setInterval(() => {
    secondsRemaining--;
    timerDisplay.textContent = formatTime(secondsRemaining);

    if (secondsRemaining <= 60) {
      timerDisplay.parentElement.classList.add('timer-urgent');
    }

    if (secondsRemaining <= 0) {
      clearInterval(timerInterval);
      gradeQuiz(true);
    }
  }, 1000);
}

// Evaluates user answers, applies color-coded states, and compiles summary results.
function gradeQuiz(timedOut = false) {
  if (isSubmitted) return;
  isSubmitted = true;
  clearInterval(timerInterval);

  let score = 0;
  const totalQuestions = Object.keys(QUIZ_DATA.questions).length;

  for (const [qId, rule] of Object.entries(QUIZ_DATA.questions)) {
    const card = document.getElementById(`card-${qId}`);
    const feedback = document.getElementById(`feedback-${qId}`);
    let isCorrect = false;

    if (rule.type === 'text') {
      const userAnswer = document.getElementById(qId).value.trim().toLowerCase();
      isCorrect = rule.correct.includes(userAnswer);
    } else if (rule.type === 'radio') {
      const selected = document.querySelector(`input[name="${qId}"]:checked`);
      isCorrect = selected ? selected.value === rule.correct : false;
    } else if (rule.type === 'checkbox') {
      const selectedList = Array.from(document.querySelectorAll(`input[name="${qId}"]:checked`))
        .map(cb => cb.value)
        .sort();
      const expectedList = [...rule.correct].sort();
      isCorrect = JSON.stringify(selectedList) === JSON.stringify(expectedList);
    }

    card.classList.remove('state-correct', 'state-incorrect');
    if (isCorrect) {
      score++;
      card.classList.add('state-correct');
      feedback.innerHTML = `<span class="status-pass">Correct (1/1)</span>`;
    } else {
      card.classList.add('state-incorrect');
      feedback.innerHTML = `<span class="status-fail">Incorrect (0/1)</span> — <strong>Correct Answer:</strong> ${rule.answerText}`;
    }
  }

  // Disables form inputs after submission
  quizForm.querySelectorAll('input').forEach(input => (input.disabled = true));
  submitBtn.disabled = true;

  // Calculate score percentage and time spent
  const percent = Math.round((score / totalQuestions) * 100);
  const passed = percent >= QUIZ_DATA.passingPercent;
  const timeSpent = QUIZ_DATA.timeLimitSeconds - secondsRemaining;

  resultsSummary.classList.remove('hidden', 'panel-pass', 'panel-fail');
  resultsSummary.classList.add(passed ? 'panel-pass' : 'panel-fail');

  const timeoutLabel = timedOut ? ' (Time Expired)' : '';
  passFailHeading.textContent = passed
    ? `Overall Result: PASSED${timeoutLabel}`
    : `Overall Result: FAILED — 70% Required${timeoutLabel}`;

  totalScoreEl.textContent = `${score} / ${totalQuestions} (${percent}%)`;
  timeSpentEl.textContent = formatTime(timeSpent);

  resultsSummary.scrollIntoView({ behavior: 'smooth' });
}

//Resets all form controls, feedback banners, colors, and restarts the timer.

function resetQuiz() {
  isSubmitted = false;
  quizForm.reset();

  quizForm.querySelectorAll('input').forEach(input => (input.disabled = false));
  submitBtn.disabled = false;

  document.querySelectorAll('.question-card').forEach(card => {
    card.classList.remove('state-correct', 'state-incorrect');
  });

  document.querySelectorAll('.feedback').forEach(fb => {
    fb.innerHTML = '';
  });

  resultsSummary.classList.add('hidden');
  resultsSummary.classList.remove('panel-pass', 'panel-fail');

  startTimer();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Event Listeners
quizForm.addEventListener('submit', (e) => {
  e.preventDefault();
  gradeQuiz(false);
});

resetBtn.addEventListener('click', resetQuiz);
resetBtnTop.addEventListener('click', resetQuiz);

document.addEventListener('DOMContentLoaded', startTimer);
