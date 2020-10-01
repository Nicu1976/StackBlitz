import "./style.css";

import { Observable, of, empty, fromEvent, from } from "rxjs";
import {
  delay,
  switchMapTo,
  concatAll,
  count,
  scan,
  withLatestFrom,
  share
} from "rxjs/operators";
import value from "*.json";

const requestOne = of("first1").pipe(delay(500));
const requestTwo = of("second").pipe(delay(800));
const requestThree = of("third").pipe(delay(1100));
const requestFour = of("fourth").pipe(delay(1400));
const requestFive = of("fifth").pipe(delay(1700));

const loadButton = document.getElementById("load");
const progressBar = document.getElementById("progress");
const content = document.getElementById("data");

// update progress bar as requests complete
const updateProgress = progressRatio => {
  console.log("Progress Ratio: ", progressRatio);
  progressBar.style.width = 100 * progressRatio + "%";
  if (progressRatio === 1) {
    progressBar.className += " finished";
  } else {
    progressBar.className = progressBar.className.replace(" finished", "");
  }
};
// simple helper to log updates
const updateContent = newContent => {
  content.innerHTML += newContent;
};

const displayData = data => {
  updateContent(`<div class="content-item">${data}</div>`);
};

// simulate 5 seperate requests that complete at variable length
const observables: Array<Observable<string>> = [
  requestOne,
  requestTwo,
  requestThree,
  requestFour,
  requestFive
];

const array$ = from(observables);
console.log("observables: ", observables);
console.log("array$: ");
array$.forEach(value => console.log(value))


//request$ se completeaza imediat ce s-a declarat array$
const requests$ = array$.pipe(concatAll());
console.log("requests$: ")
requests$.forEach(value => console.log(value + " from request$"))

const clicks$ = fromEvent(loadButton, "click");

//progress$ se completeaza cand se face clic pe buton
const progress$ = clicks$.pipe(
  switchMapTo(requests$),
  share()
);
console.log("progress$: ");
progress$.forEach(value => console.log(value + " from progress$"));



// const count$ = array$.pipe(count());

// const ratio$ = progress$.pipe(
//   scan(current => current + 1, 0),
//   withLatestFrom(count$, (current, count) => current / count)
// );

// clicks$.pipe(switchMapTo(ratio$)).subscribe(updateProgress);

progress$.subscribe(displayData);
