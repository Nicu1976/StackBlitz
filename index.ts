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
console.log("observables: ", observables);


//array$ este un observable de observables
const array$ = from(observables);
console.log("array$: ");
array$.forEach(value => console.log(value))

//request$ se completeaza imediat ce s-a declarat array$
//practic request$ este un observable deorece concatAll() transforma array$
//din observable de observables in un simplu observable si mai mult ia //doar value(care in cazul nostru este un string) din fiecare observable, //iar pipe il transforma din nou intr-un observable de string de aceasta //data 

//The concatAll() operator subscribes to each "inner" Observable that //comes out of the "outer" Observable, and copies all the emitted values //until that Observable completes, and goes on to the next one. All of the //values are in that way concatenated. Other useful flattening operators ///(called join operators) are

//deci in concluzie:
//array$ = Observable<Observable<string>> -> concatAll() => requests$ = //Observable<string>

const requests$ = array$.pipe(concatAll());
console.log("requests$: ")
requests$.forEach(value => console.log(value + " from request$"))

const clicks$ = fromEvent(loadButton, "click");

//progress$ se completeaza cand se face clic pe buton
//practic se copie ce exista in request$ insa doar cand se face clicks$
const progress$ = clicks$.pipe(
  switchMapTo(requests$),
  share()
);
console.log("progress$: ");
progress$.forEach(value => console.log(value + " from progress$"));



const count$ = array$.pipe(count());
console.log("count$: ", count$.forEach(value => console.log(value)));

//in timp ce se completeaza progress$ se face si ratio$
const ratio$ = progress$.pipe(
  //aici scan este o functie care returneza current in timp ce scaneaza //progress$. progress$ are 5 elemente, deci intai current va fi 0 + 1 = 1
  //dupa care se va duce in withLatestFrom in care ia ultima valoare din //count$ care este 5 si foloseste functia (current, count) => current / //count care in pasul 1 este 1 / 5, in pasul 2 este current = 1 + 1 / 5
  scan(current => current + 1, 0),
  //aici foloseste versiunea 2 a withLatestFrom = 
  //v2: ObservableInput<number>, project: (v1: number, v2: number) => number)
  withLatestFrom(count$, (current, count) => current / count)
);
console.log("ratio$: ")
ratio$.forEach(value => console.log(value));

//functii finale ce folosesc observabilele construite mai sus
clicks$.pipe(switchMapTo(ratio$)).subscribe(updateProgress);
progress$.subscribe(displayData);
